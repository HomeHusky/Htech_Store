from datetime import datetime, timedelta
import re
from typing import Any, TypedDict

from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import END, START, StateGraph
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.models import Product
from app.schemas.dto import BookingItemDTO, CustomerInfoDTO
from app.services.booking import manage_booking
from app.services.chat_models import generate_admin_configured_answer
from app.services.hybrid_search import as_debug_rows, hybrid_search_policies, hybrid_search_products
from app.services.telegram import notify_human_support
from app.services.vouchers import verify_voucher


class AgentState(TypedDict, total=False):
    message: str
    locale: str
    intent: str
    answer: str
    tool: str
    payload: dict[str, Any]
    debug: dict[str, Any]


def _detect_intent(message: str) -> str:
    text = message.lower()
    if any(term in text for term in ["voucher", "mã giảm", "ma giam", "mã ", "ma ", "code", "khuyến mãi"]):
        return "verify_voucher"
    if any(term in text for term in ["nhân viên", "nhan vien", "hỗ trợ", "ho tro", "human support"]):
        return "human_support"
    if any(term in text for term in ["đặt hàng", "dat hang", "chốt đơn", "chot don", "book"]):
        return "manage_booking"
    if any(
        term in text
        for term in [
            "chính sách",
            "chinh sach",
            "bảo hành",
            "bao hanh",
            "vat",
            "đặt cọc",
            "dat coc",
            "deposit",
            "giao hàng",
            "giao hang",
        ]
    ):
        return "query_policy_rag"
    return "search_catalog"


def _needs_local_fallback(answer: str) -> bool:
    lowered = answer.lower()
    return (
        not answer.strip()
        or "chưa tạo được câu trả lời" in lowered
        or "chưa cấu hình" in lowered
        or "couldn't generate" in lowered
        or "not configured" in lowered
    )


def _product_name(row: dict[str, Any]) -> str:
    name = row.get("name")
    if isinstance(name, dict):
        return name.get("vi") or name.get("en") or row.get("slug") or "Sản phẩm"
    return str(name or row.get("slug") or "Sản phẩm")


def _infer_category(message: str) -> str | None:
    text = message.lower()
    if any(term in text for term in ["laptop", "macbook", "notebook"]):
        return "laptop"
    if any(term in text for term in ["iphone", "điện thoại", "dien thoai", "smartphone", "phone"]):
        return "phone"
    if any(term in text for term in ["pc", "máy tính bàn", "may tinh ban", "gaming"]):
        return "pc"
    if any(term in text for term in ["vga", "card", "gpu", "linh kiện", "linh kien"]):
        return "component"
    if any(term in text for term in ["sửa", "sua", "repair"]):
        return "repair"
    return None


def _extract_budget(message: str) -> int | None:
    text = message.lower().replace(",", ".")
    match = re.search(r"(\d+(?:\.\d+)?)\s*(triệu|trieu|m|million)", text)
    if match:
        return int(float(match.group(1)) * 1_000_000)

    numbers = [int(value) for value in re.findall(r"\b\d{7,}\b", text)]
    return min(numbers) if numbers else None


def _extract_voucher_code(message: str) -> str:
    candidates = re.findall(r"\b[A-Za-z0-9]{4,20}\b", message.upper())
    stop_words = {"VOUCHER", "CODE", "DUNG", "DUOC", "KHONG", "KHUYEN", "GIA", "GIAM"}
    for candidate in candidates:
        if candidate not in stop_words and any(char.isdigit() for char in candidate):
            return candidate
    return candidates[-1] if candidates else message.strip().split()[-1].upper()


def _format_vnd(value: Any) -> str:
    try:
        return f"{int(value):,}".replace(",", ".") + "đ"
    except Exception:
        return "liên hệ"


def _catalog_fallback(rows: list[dict[str, Any]], message: str) -> str:
    if not rows:
        return (
            "Mình chưa tìm thấy sản phẩm khớp chính xác. Bạn có thể nói rõ ngân sách, nhu cầu "
            "và thương hiệu mong muốn để mình lọc lại sát hơn."
        )

    budget = _extract_budget(message)
    visible_rows = rows
    prefix = "Gợi ý phù hợp từ catalog HTech:"
    if budget:
        affordable = [row for row in rows if int(row.get("price") or 0) <= budget]
        if affordable:
            visible_rows = affordable
        else:
            prefix = f"Catalog thật hiện chưa có lựa chọn dưới {_format_vnd(budget)}. Các lựa chọn gần nhất:"

    bullets = []
    for row in visible_rows[:3]:
        discount = int(row.get("discount") or 0)
        suffix = f", đang giảm {discount}%" if discount else ""
        bullets.append(f"- {_product_name(row)}: {_format_vnd(row.get('price'))}{suffix}.")
    return prefix + "\n" + "\n".join(bullets) + "\nBạn muốn mình chốt theo ngân sách hay hiệu năng?"


def _policy_fallback(rows: list[dict[str, Any]]) -> str:
    if not rows:
        return "Mình chưa tìm thấy chính sách liên quan. Mình có thể chuyển nhân viên HTech kiểm tra giúp bạn."
    snippets = []
    for row in rows[:2]:
        title = row.get("title") or "Chính sách HTech"
        content = str(row.get("content") or "").strip().replace("\n", " ")
        snippets.append(f"- {title}: {content[:220]}")
    return "Theo dữ liệu chính sách hiện có:\n" + "\n".join(snippets)


def _build_graph() -> Any:
    builder = StateGraph(AgentState)

    def route_node(state: AgentState) -> AgentState:
        return {"intent": _detect_intent(state["message"])}

    async def tool_node(state: AgentState) -> AgentState:
        return state

    builder.add_node("route", route_node)
    builder.add_node("tool_node", tool_node)
    builder.add_edge(START, "route")
    builder.add_edge("route", "tool_node")
    builder.add_edge("tool_node", END)
    return builder.compile(checkpointer=MemorySaver())


graph = _build_graph()


async def invoke_agent(db: Session, session_id: str, message: str, locale: str) -> dict[str, Any]:
    cfg = {"configurable": {"thread_id": session_id}}
    state: AgentState = await graph.ainvoke({"message": message, "locale": locale}, config=cfg)
    intent = state.get("intent", "search_catalog")

    if intent == "query_policy_rag":
        rows = hybrid_search_policies(db, message)
        snippets = "\n".join(f"- {row['content']}" for row in rows[:3]) or "Không có chính sách khớp."
        answer = await generate_admin_configured_answer(
            db,
            f"Trả lời bằng tiếng Việt, chỉ dùng các chính sách này:\n{snippets}\nCâu hỏi: {message}",
            locale=locale,
        )
        if _needs_local_fallback(answer):
            answer = _policy_fallback(rows)
        return {
            "answer": answer,
            "tool": "query_policy_rag",
            "payload": {"policies": rows},
            "debug": {"search_results": as_debug_rows("policy", rows)},
        }

    if intent == "search_catalog":
        rows = hybrid_search_products(db, message, category=_infer_category(message))
        context = "\n".join(
            f"- {_product_name(row)} | {_format_vnd(row.get('price'))} | {row.get('category')}"
            for row in rows[:5]
        ) or "Không có sản phẩm khớp."
        answer = await generate_admin_configured_answer(
            db,
            f"Trả lời bằng tiếng Việt như tư vấn viên HTech. Chỉ dùng kết quả catalog này:\n{context}\nCâu hỏi: {message}",
            locale=locale,
        )
        if _needs_local_fallback(answer):
            answer = _catalog_fallback(rows, message)
        return {
            "answer": answer,
            "tool": "search_catalog",
            "payload": {"products": rows},
            "debug": {"search_results": as_debug_rows("product", rows)},
        }

    if intent == "verify_voucher":
        code = _extract_voucher_code(message)
        payload = verify_voucher(db, code)
        answer = (
            f"Mã {code} hợp lệ. Mức giảm: {payload.get('discount_percent', 0)}%."
            if payload.get("valid")
            else f"Mã {code} chưa dùng được: {payload.get('reason', 'không hợp lệ')}."
        )
        return {"answer": answer, "tool": "verify_voucher", "payload": payload, "debug": None}

    if intent == "manage_booking":
        product = db.scalar(select(Product).where(Product.available == True).limit(1))
        if not product:
            return {
                "answer": "Hiện chưa có sản phẩm khả dụng để tạo đơn. Mình có thể chuyển nhân viên HTech hỗ trợ bạn.",
                "tool": "manage_booking",
                "payload": None,
                "debug": None,
            }

        customer = CustomerInfoDTO(
            name="Guest",
            email="guest@example.com",
            phone="+84000000000",
            note=message,
            expectedDelivery=(datetime.utcnow() + timedelta(days=3)).date(),
        )
        items = [BookingItemDTO(productId=product.id, qty=1, price=product.price)]
        summary = manage_booking(db, customer, items)
        await notify_human_support(f"New booking created: {summary.orderId}", db=db)
        return {
            "answer": (
                f"Đã tạo đơn giữ hàng {summary.orderId}. Tiền đặt cọc là "
                f"{summary.deposit:,} VND, phần còn lại {summary.remaining:,} VND."
            ),
            "tool": "manage_booking",
            "payload": summary.model_dump(),
            "debug": None,
        }

    await notify_human_support(f"User requested human support: {message}", db=db)
    return {
        "answer": "Mình đã gửi yêu cầu cho nhân viên HTech hỗ trợ bạn.",
        "tool": "human_support",
        "payload": None,
        "debug": None,
    }
