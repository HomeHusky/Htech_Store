
## 1. Kiểm thử Tool-Calling & Logic Nghiệp vụ (Happy Path)
Mục tiêu: Đảm bảo Agent gọi đúng công cụ khi khách hàng đưa ra yêu cầu cụ thể.

| Kịch bản | Dữ liệu đầu vào (Prompt) | Kết quả mong đợi (Output) |
| :--- | :--- | :--- |
| **Tra cứu sản phẩm** | "Shop còn mẫu MacBook M3 Pro không?" | Agent gọi tool `fetch_database_items`, trả về thông số và giá. |
| **Tra cứu chính sách** | "Nếu mình làm hỏng váy khi thuê thì đền bù thế nào?" | Agent gọi tool `query_policy_rag`, trích xuất đúng đoạn phí hư hỏng. |
| **Áp dụng Voucher** | "Mình có mã KM10, áp dụng cho đơn này được không?" | Agent gọi tool `verify_voucher`, tính lại tổng tiền và số tiền cọc 20%. |
| **Chốt đơn (Cọc)** | "Ok mình chốt gói chụp này, gửi link cọc cho mình." | Agent gọi tool `manage_booking`, tạo đơn `Pending` và hiển thị VietQR. |

---

## 2. Kiểm thử Khả năng "Phản biện" & Edge Cases
Mục tiêu: Kiểm tra xem Agent có bị "ngây thơ" hoặc tính toán sai không.

* **Tính toán sai lệch:** Thử hỏi "Gói chụp 10 triệu, cọc 20% là 5 triệu đúng không?". 
    * *Kỳ vọng:* Agent phải đính chính lại là 2 triệu.
* **Sản phẩm không tồn tại:** "Tôi muốn mua máy bay trực thăng tại shop."
    * *Kỳ vọng:* Agent trả lời lịch sự là shop không kinh doanh mặt hàng này, chỉ tập trung vào Laptop/PC (theo database).
* **Voucher hết hạn:** Nhập một mã đã hết hạn trong DB.
    * *Kỳ vọng:* Agent báo lỗi mã không còn hiệu lực thay vì trừ tiền vô tội vạ.
* **Xung đột ngày thuê:** Thuê cùng một chiếc váy vào ngày đã có người đặt.
    * *Kỳ vọng:* Agent check database và báo: "Rất tiếc mẫu này đã có khách đặt vào ngày đó, bạn xem mẫu khác nhé?".

---

## 3. Kiểm thử RAG & Giới hạn Context (Guardrails)
Mục tiêu: Đảm bảo Agent không "tám chuyện" ngoài lề và tiết kiệm chi phí LLMs.

* **Hỏi ngoài luồng (Off-topic):** "Thời tiết Đà Nẵng hôm nay thế nào?" hoặc "Dạy tôi nấu món phở."
    * *Kỳ vọng:* Agent từ chối khéo léo: "Xin lỗi, tôi chỉ hỗ trợ các vấn đề liên quan đến dịch vụ của [Feli Studio/Tech Shop]."
* **Truy vấn chính sách phức tạp:** "Nếu mình cọc rồi mà bận đột xuất không đến chụp được thì có lấy lại tiền được không?"
    * *Kỳ vọng:* RAG phải tìm thấy mục "Hủy lịch" và trả lời đúng quy định hoàn tiền theo mốc thời gian (ví dụ: báo trước 7 ngày mới được hoàn 100%).
* **Kiểm tra Token Usage:** Theo dõi trong console/logs xem khi gọi RAG, Agent có bị nhồi quá nhiều văn bản thừa không.
    * *Kỳ vọng:* Chỉ những đoạn văn bản (chunks) thực sự liên quan mới được đưa vào context.

---

## 4. Kiểm thử Luồng Trạng thái (State Management - LangGraph)
Mục tiêu: Đảm bảo Agent không bị "ngáo" khi khách hàng thay đổi ý định giữa chừng.

* **Luồng thay đổi (Context Switching):** 1. Khách hỏi: "Váy cưới mã V01 giá bao nhiêu?"
    2. Agent trả lời.
    3. Khách hỏi tiếp: "Thế còn chính sách trả muộn thì sao?" (Không nhắc lại từ 'váy').
    * *Kỳ vọng:* Agent vẫn hiểu đang nói về dịch vụ thuê đồ để tra cứu đúng category trong RAG.
* **Luồng quay lại (Backtracking):** 1. Khách đang ở bước thanh toán cọc.
    2. Khách đột ngột nói: "Khoan, cho mình xem thêm mẫu váy khác màu đỏ."
    * *Kỳ vọng:* Agent phải quay lại bước `Consulting` (Tư vấn) thay vì ép khách trả tiền tiếp.