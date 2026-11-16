# Nâng cấp trực tiếp V1 → V2

Không tạo project mới, không đổi framework và không thêm thư viện runtime. `world.js`, `main.js`, `logic.js`, CSS/HTML và test V1 được giữ và chỉnh sửa; phần mới tách thành module để bảo trì.

## Bản đồ mã nguồn

| Hệ thống | V1 | V2 |
|---|---|---|
| Classroom | world.js: tường, sàn, cửa, bàn ghế | Giữ trong world.js; classroom-details.js bổ sung chi tiết tĩnh/instancing |
| Student | world.js: primitive, setState, vòng hoạt ảnh | students.js: tạo mesh, rig, atlas biểu cảm, FSM và hoạt ảnh |
| TeacherDesk | world.js: bàn tại (2.5, 0.85, -4.5) | Giữ nguyên tọa độ/collider |
| Laptop | world.js: màn hình hướng +Z | laptop.js: root xoay π, màn hình hướng −Z về phía bảng/giáo viên; bản lề, bàn phím và 4 slide |
| FirstPersonController | world.js: step, mousemove, keys; logic.js: movePlayer | Giữ nguyên 2,8 m/s, độ nhạy 0,002, giới hạn pitch ±1,3; va chạm/substep giữ nguyên |
| InteractionSystem | world.js: aim, phím E; main.js: interaction | Giữ raycast 3,2 m/10 Hz, bổ sung điều kiện tiếp cận laptop từ phía giáo viên và lựa chọn sự kiện |
| GameManager | world.js: loop/reset/pause/dispose; main.js: menu/HUD | Giữ vòng đời, tích hợp modules; HUD cập nhật chỉ số theo sự kiện/chu kỳ |
| EventManager | Chưa có; trạng thái ngẫu nhiên | events.js: tiến trình writing → talking, laptop → playing, lesson → sleeping; 3 cách xử lý/sự kiện |
| Speech bubbles | Chưa có | bubbles.js: pool 3 DOM nodes, occlusion, overlap, TTL theo game time |
| Teacher actions | Chưa có | teacher.js: viewmodel bàn tay/phấn, gõ bàn phím, vẫy tay trong loop chung |
| Audio | Chưa có | audio.js: một nguồn xì xào tổng hợp, lazy AudioContext, mute/pause/dispose |

## Kiểm tra theo từng bước

Dự án là JavaScript, không có tsconfig hoặc nguồn TypeScript. `npm run check` kiểm tra cú pháp các module JS bằng Node, không tự nhận là type-check TypeScript.

1. Sửa hướng laptop, bản lề/slide: syntax + test V1 + build đạt.
2. Thay rig/diện mạo học sinh bằng module dùng chung geometry/material: syntax + test V1 + build đạt.
3. Thêm chuyển động nền và biểu cảm: syntax + test V1 + build đạt.
4. Thêm pool bong bóng và cleanup: syntax + test V1 + build đạt.
5. Thêm ba sự kiện, các lựa chọn/chỉ số: thêm test tiến trình và 9 kết quả lựa chọn; build đạt.
6. Thêm tay viết/gõ/vẫy, slide, hoạt động đổi nhịp và HUD: syntax + tests + build đạt.
7. Chi tiết lớp học, ánh sáng, chunk engine riêng: syntax + tests + build đạt.
8. Test tích hợp scene CPU và bong bóng: 10/10 test đạt; final build đạt.

## Bằng chứng và giới hạn

- Test tích hợp dựng scene Three.js thật với renderer/DOM giả lập: cửa đóng chặn người chơi, cửa mở cho đi qua, màn hình laptop hướng −Z, đầu học sinh chuyển động, cả ba sự kiện/slide/đổi hoạt động/chỉ số/chơi lại chạy qua luồng logic.
- Pause không lên lịch thêm frame và không tăng thời gian sự kiện; resume không tạo vòng lặp trùng. Sau 20 reset, số geometry/material/texture được cấp phát không tăng. Dispose phát sự kiện giải phóng geometry, gỡ pool DOM và listeners.
- Bong bóng: giới hạn 3, ẩn khi đè lên nhau, tường thật qua Three.Raycaster che được, hết hạn theo thời gian game.
- **Không phải kiểm thử WebGL hoặc end-to-end trình duyệt.** Chưa xác nhận chất lượng hình ảnh, âm thanh thực, pointer lock, dialog/focus thực và FPS/heap GPU. Tool browser/native UI hiện không kết nối được.
- FPS V1 không có baseline đo cùng thiết bị/độ phân giải; chưa thể khẳng định FPS V2 bằng hoặc tốt hơn V1. Xem PERFORMANCE.md để chạy phép đo đối chiếu.

## Luồng kiểm thử thủ công cần hoàn tất

Mở V2 → mở cửa → nhìn các học sinh nhàn rỗi → đến bảng E/viết → quay lại xem hai em nói chuyện/bong bóng/âm xì xào → xử lý bằng một lựa chọn → đi sau bàn về phía bảng, E/mở laptop → nhìn màn hình mở, chuyển slide → quay xuống lớp và xử lý đùa nghịch → đợi Hà My ngủ → thử hỏi thăm hoặc đổi hoạt động trên bảng → tổng kết → chơi lại/về menu. Lặp mỗi preset; thử mute, Esc, mất focus, ẩn tab và quay lại. Ghi nhận hình ảnh/FPS/console thực thay vì lấy số từ renderer giả lập.
