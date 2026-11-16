# Báo cáo kiểm thử hiệu năng

## V2 — cập nhật 16/11/2026

- `npm.cmd run check`: đạt (kiểm tra cú pháp JavaScript, không có TypeScript).
- `npm.cmd test`: **10/10 đạt**, gồm test sự kiện, hình học/raycast scene, điều khiển qua cửa, vòng đời và bong bóng. Renderer/DOM được giả lập trong test; số đo giả lập không dùng làm FPS/GPU benchmark.
- `npm.cmd run build`: đạt, Vite 6.4.6; lần build cuối 929 ms.
- Tổng output: **526.399 byte / 0,502 MiB**, so với V1 505.888 byte: tăng khoảng **4,1%**.
- HTML 3,41 kB; CSS 7,12 kB; menu JS 8,72 kB; world JS 26,06 kB; Three.js 481,09 kB. World và Three chỉ tải khi bắt đầu; gzip world 11,54 kB và Three 120,36 kB.
- Bản V2 phục vụ HTTP 200 tại `http://127.0.0.1:5174/`, tiêu đề có V2.
- Qua 20 reset trong test CPU, lượng geometry/material/texture cấp phát giữ nguyên; listeners/pool bong bóng/RAF được dọn khi dispose. **Không tương đương kết luận không rò rỉ RAM/GPU trên trình duyệt.**
- Công cụ browser và native UI tiếp tục không kết nối được. Chưa đo FPS, draw calls/triangles GPU, lỗi console, chất lượng hình ảnh hoặc âm thanh thực. **Chưa xác minh FPS V2 ≥ V1.**

Để so sánh V1/V2: dùng cùng máy/trình duyệt, độ phân giải, DPR, preset thủ công, vị trí/góc nhìn, warmup 15 giây và đo mỗi cảnh 60 giây; đo riêng hành lang, cả lớp, lúc nhiều hoạt ảnh, bong bóng và menu. Ghi frametime p50/p95 cùng FPS thay vì chỉ nhìn FPS tức thời. Cần bản V1 lưu riêng của người dùng vì thư mục ban đầu không có lịch sử Git để checkout baseline. Báo cáo V1 bên dưới được giữ làm lịch sử build, không phải baseline FPS.

## V1 — báo cáo lịch sử

Ngày ghi nhận: 16/11/2026 (Asia/Saigon).

## Kết quả đã đo

Môi trường build: Windows x64, PowerShell, Node.js 24.19.0, Vite 6.4.6, Three.js 0.180.0. CPU Intel Core i5-11400H 2,70 GHz (12 luồng), RAM hệ điều hành báo 15,7 GiB. Chưa có phiên đo trên trình duyệt/GPU thực.

| Kiểm tra | Kết quả |
|---|---|
| `npm.cmd test` | 5/5 đạt: cấu hình mặc định, adaptive cooldown/chế độ thủ công, phục hồi chất lượng, va chạm chống xuyên/vách trượt, FSM |
| `npm.cmd run build` | Thành công; lần cuối Vite build 878 ms (không phải thời gian tải trang) |
| Toàn bộ `dist/`, chưa nén | 505.888 byte = 0,482 MiB; dưới ngân sách 10 MB |
| HTML | 3,39 kB; gzip 1,58 kB |
| CSS | 6,31 kB; gzip 2,23 kB |
| JavaScript menu | 7,12 kB; gzip 3,28 kB |
| Chunk 3D tải khi bắt đầu | 489,06 kB; gzip 124,63 kB |
| Tài nguyên màn hình đầu, theo file build | Khoảng 16,82 kB chưa nén; không bao gồm header HTTP/cache. Chưa đo Network thực tế |
| Phục vụ bản build cục bộ | HTTP 200 tại `http://127.0.0.1:4173/` |
| Kiểm tra phụ thuộc sau cập nhật Vite | npm install/audit báo 0 vulnerabilities |

Kích thước gzip là tính toán từ Vite; máy chủ triển khai phải bật nén mới có dung lượng truyền tương ứng. Không có tài nguyên ảnh, font, âm thanh hay mô hình bên ngoài.

## Những mục chưa được xác minh

Công cụ kiểm thử UI trả về `The browser access host is unavailable`; native UI trả về `Computer Use native pipe is unavailable`. Không có trình duyệt kết nối để chạy phiên chơi. Vì vậy **không tuyên bố đạt 30/60 FPS, không lỗi console, tương tác đã qua kiểm thử đầu cuối, hoặc không rò rỉ bộ nhớ**.

| Hạng mục yêu cầu | Trạng thái |
|---|---|
| Console/runtime WebGL | Chưa kiểm tra trên trình duyệt |
| Draw calls, triangles, GPU geometries/textures | Đã có bảng đo bằng `renderer.info`; chưa thu được số thực tế |
| FPS hành lang | Chưa đo |
| FPS nhìn toàn bộ lớp học | Chưa đo |
| FPS nhiều học sinh hoạt ảnh | Chưa đo |
| Tương tác cửa, bảng, laptop | Đã triển khai; chưa kiểm thử UI đầu cuối |
| Chơi lại nhiều lần / heap / tài nguyên GPU | Đã triển khai cleanup; chưa đo rò rỉ |
| Mở/đóng menu, vòng render dừng | Đã triển khai hủy RAF; chưa đo trên trình duyệt |
| GPU tích hợp / thiết bị yếu | Chưa thử phần cứng mục tiêu |

## Quy trình đo có thể lặp lại

1. Chạy `npm.cmd run build`, `npm.cmd run preview`; mở URL với `?perf`. Ghi trình duyệt/phiên bản, OS, CPU, GPU, RAM, độ phân giải, DPR, cắm sạc hay pin. Kiểm tra Low / Medium / High cố định trước, rồi kiểm tra Auto riêng.
2. DevTools Network: tắt cache, tải lại, ghi tổng transferred ban đầu và sau Bắt đầu. Console: ghi lỗi/cảnh báo, bao gồm khả năng Pointer Lock hoặc WebGL2 bị chặn.
3. Bắt đầu ở hành lang. Chờ làm nóng 15 giây; lấy FPS mỗi 2 giây trong 60 giây. Ghi FPS trung bình/thấp nhất cùng draw calls/triangles/geometries/textures từ bảng P. Bảng chỉ lưu cửa sổ lấy mẫu hiện tại, không tích lũy lịch sử không giới hạn.
4. Mở cửa bằng E, đi tới phía trước lớp, quay nhìn 10 học sinh. Lặp lại phép đo 60 giây. Nhìn thẳng vào cửa đóng và bàn/ghế, giữ W để kiểm tra không xuyên vật cản; thử đi chéo để kiểm tra trượt dọc tường.
5. Dùng bảng bắt đầu bài, có ngay 3 trạng thái đặc biệt; đợi thêm các sự kiện xuất hiện. Đo 60 giây khi nhiều học sinh hoạt ảnh. So sánh Low/Medium/High.
6. Trò chuyện với học sinh, xác nhận số tình huống chỉ tăng khi giải quyết trạng thái đặc biệt. Sau ít nhất 3 tình huống, mở laptop và kết thúc tiết học. Thử cả trạng thái chưa đủ điều kiện.
7. Mở menu hoặc hộp thoại: FPS phải hiển thị tạm dừng, số khung hình không tiếp tục tăng. Chờ 30 giây, mở/đóng 10 lần; kiểm tra thời gian game không nhảy vọt. Một lần resize hoặc thay chất lượng khi tạm dừng được phép render lại một khung để cập nhật hình nền.
8. Chơi lại từ menu 20 lần, rồi về màn hình đầu và bắt đầu lại 20 lần. Dùng Chrome Memory snapshots (GC trước mỗi lần so sánh) và Performance monitor để xem heap/listeners có giữ ổn định sau làm nóng. Geometries/textures nên quay về cùng mức khi cùng cảnh hiển thị. Chỉ so sánh xu hướng sau GC, không kết luận từ một lần RAM tăng.
9. Ẩn tab/mất focus rồi quay lại: game phải mở menu tạm dừng. Đóng menu tiếp tục điều khiển và chỉ có một vòng game.
10. Auto: dùng thiết bị yếu hoặc GPU throttling nếu có, kiểm tra giảm mức sau FPS thấp kéo dài và không đổi mỗi giây. Khi chọn thủ công, mức đó phải được giữ nguyên. Bảng mẫu thời gian FPS chưa phải phép đo GPU chuẩn; cần đo trên phần cứng mục tiêu trước khi xác nhận mục tiêu 60/30 FPS.

Mẫu ghi: `Thiết bị | Trình duyệt | Độ phân giải | Preset | Cảnh | FPS TB/min | Calls | Triangles | Geometries | Textures | Heap sau GC | Lỗi console`.
