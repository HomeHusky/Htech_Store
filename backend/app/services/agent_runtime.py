from datetime import datetime
from typing import Any, TypedDict

from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import END, START, StateGraph
from sqlalchemy.orm import Session

from app.schemas.dto import BookingItemDTO, CustomerInfoDTO
from app.services.chat_models import generate_admin_configured_answer
from app.services.booking import manage_booking
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
    if "voucher" in text or "code" in text:
        return "verify_voucher"
    if "human support" in text or "nhan vien" in text or "hỗ trợ" in text:
        return "human_support"
    if "book" in text or "xác nhận đặt" in text or "chốt đơn" in text:
        return "manage_booking"
    if "policy" in text or "chinh sach" in text or "vat" in text or "%" in text or "đặt cọc" in text or "deposit" in text:
        return "query_policy_rag"
    return "search_catalog"


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
        snippets = "\n".join(f"- {row['content']}" for row in rows[:3]) or "No policy matched."
        answer = await generate_admin_configured_answer(
            db,
            f"Answer user policy question using these snippets:\n{snippets}\nQuestion: {message}",
            locale=locale,
        )
        return {
            "answer": answer,
            "tool": "query_policy_rag",
            "payload": {"policies": rows},
            "debug": {"search_results": as_debug_rows("policy", rows)},
        }

    if intent == "search_catalog":
        rows = hybrid_search_products(db, message)
        context = "\n".join(f"- {row['slug']} ({row['price']})" for row in rows[:5]) or "No products matched."
        answer = await generate_admin_configured_answer(
            db,
            f"Use the catalog results below to answer the user.\n{context}\nQuestion: {message}",
            locale=locale,
        )
        return {
            "answer": answer,
            "tool": "search_catalog",
            "payload": {"products": rows},
            "debug": {"search_results": as_debug_rows("product", rows)},
        }

    if intent == "verify_voucher":
        code = message.strip().split()[-1]
        payload = verify_voucher(db, code)
        return {
            "answer": "Voucher checked.",
            "tool": "verify_voucher",
            "payload": payload,
            "debug": None,
        }

    if intent == "manage_booking":
        # Basic default booking flow payload; in production this comes from collected slots.
        customer = CustomerInfoDTO(
            name="Guest",
            email="guest@example.com",
            phone="+84000000000",
            note=message,
            eventDate=datetime.utcnow().date(),
        )
        items = [BookingItemDTO(productId="p1", qty=1, price=1_200_000, days=1)]
        summary = manage_booking(db, customer, items)
        await notify_human_support(f"New booking created: {summary.orderId}", db=db)
        return {
            "answer": "Booking created. Please pay the deposit.",
            "tool": "manage_booking",
            "payload": summary.model_dump(),
            "debug": None,
        }

    await notify_human_support(f"User requested human support: {message}", db=db)
    return {
        "answer": "A human support request has been sent.",
        "tool": "human_support",
        "payload": None,
        "debug": None,
    }
