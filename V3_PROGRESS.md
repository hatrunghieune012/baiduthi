# V3_PROGRESS

## Trạng thái hiện tại

V3 đã được triển khai cục bộ trong dự án Vite/Three.js hiện có. Không triển khai website, không thêm thư viện.

- Lớp đổi tên thành CNTT; phòng rộng hơn 25% theo hai chiều, cửa chuyển tới tường bên gần bàn giáo viên. Sàn, tường, cửa sổ, bàn ghế, chi tiết và vị trí xuất hiện đã được điều chỉnh đồng bộ.
- Bố cục Low Poly được bổ sung laptop trên bàn giáo viên, balo, sách và cốc nước. Bảng lớn giữ lời tri ân ban đầu và hiển thị bài học từng dòng. Bảng JavaScript nhỏ đã được gỡ theo yêu cầu sau đó.
- Ba bài JavaScript theo thứ tự: biến `let`/`const`, điều kiện `if`/`else`, hàm `function`. Bài sau mở khi bài trước được giải thích và hoàn thành.
- Năm tình huống theo tiến trình: nói chuyện, điện thoại, ngủ gật, ăn vặt và sinh viên đứng trả lời cuối giờ. Mỗi tình huống có ba lựa chọn tác động đến Tập trung, Gắn kết và Hiểu bài.
- HUD có thanh chỉ số. Nhạc nền và âm thanh lớp học có nút bật/tắt, chỉ khởi chạy sau thao tác Bắt đầu của người chơi. Điều khiển bàn phím và cảm ứng được giữ.

## Kiểm tra

Đã chạy `npm.cmd test` (18/18 đạt), `npm.cmd run check` (đạt), `npm.cmd run build` (đạt). Chrome headless đã khởi động game ở màn hình desktop và mobile, hiện đúng điều khiển cảm ứng trên mobile, không có page error. Đã mở cửa, vào lớp và xem HUD bằng trình duyệt. Chưa đo FPS hoặc nghe thử âm thanh trên thiết bị thật.
