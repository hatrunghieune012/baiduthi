# Một Ngày Làm Thầy Cô · V4

Mini game góc nhìn thứ nhất trong lớp CNTT với 10 sinh viên. Kịch bản hiện tại có ba bài JavaScript, bốn tình huống lớp học, điểm hiểu bài từng sinh viên, bài kiểm tra cuối giờ và đoạn kết tri ân 20/11. Xem [V3_PROGRESS.md](./V3_PROGRESS.md) để biết nền tảng V3.

## Chạy trên máy

Yêu cầu Node.js 22.12+ hoặc 24+ và trình duyệt hỗ trợ WebGL2.

```powershell
cd D:\minigametrian
npm.cmd install
npm.cmd run dev
```

Mở URL Vite in ra (thường là http://127.0.0.1:5173). Dùng `npm.cmd` nếu PowerShell chặn script `npm.ps1`; không cần đổi Execution Policy.

Để thử trên điện thoại cùng mạng Wi-Fi, chạy `npm.cmd run dev -- --host 0.0.0.0` rồi mở địa chỉ IP nội bộ của máy tính với cổng 5173 trên điện thoại.

```powershell
npm.cmd test
npm.cmd run check
npm.cmd run build
npm.cmd run preview
```

## Cách chơi

- WASD di chuyển; chuột nhìn quanh; phím mũi tên là phương án thay thế khi khóa chuột không khả dụng.
- Trên điện thoại, nhấn **Chuyển sang màn hình ngang** hoặc bật xoay tự động rồi xoay máy. Kéo cần điều khiển tròn ở góc trái để di chuyển, vuốt khung game để nhìn quanh và chạm **Tương tác** ở phía trên góc phải. Nếu trình duyệt không hỗ trợ khóa hướng, game sẽ hướng dẫn xoay máy thủ công.
- Nhìn vào vật ở khoảng cách dưới 3,2 m và nhấn E để tương tác.
- Khi trò chuyện với sinh viên, nhấn **1–3** hoặc bấm lựa chọn. Nhấn **E/Enter** để hiện hết câu hoặc kết thúc sau phản hồi.
- Mở cửa, đi vào lớp, nhấn E để chào cả lớp rồi mời sinh viên ngồi.
- Cửa trượt có nút vàng bên cạnh khung cửa ở cả hai phía, dùng để mở/đóng khi cánh cửa nằm trong hốc tường.
- Đến gần ghế giáo viên và nhấn E để ngồi. Khi ngồi, nhấn E để dùng máy tính; chọn chiếu màn hình hoặc dạy lần lượt bài biến, điều kiện, vòng lặp. Bài được chiếu lên bảng lớn. Nhấn Q để đứng dậy, hoặc dùng nút **Đứng dậy khỏi ghế** trên điện thoại.
- Bảy tình huống theo đúng ba bài: nói chuyện và hỏi về `let`/`const` ở bài 1; hai sinh viên ngủ gật, hai sinh viên dùng điện thoại và câu hỏi `if` ở bài 2; hai câu hỏi về vòng lặp ở bài 3. Mỗi hành vi riêng có thể được xử lý tại sinh viên; có thể xử lý sự kiện trên máy tính.
- Mỗi sinh viên có điểm hiểu bài riêng. Sau bài 3, mở bài kiểm tra trên laptop để xem điểm 0–10 (đạt từ 5.0), kết thúc buổi học, đi đến cửa để nhận lời tri ân và lá thư 20/11.
- Thanh Stress phản ánh áp lực đứng lớp và kết quả bài kiểm tra.
- Sinh viên có 15 đoạn trò chuyện tự phát, lần lượt hiện bằng bong bóng. Giảng viên đến gần có thể khiến các em ngừng nói. Hội thoại trực tiếp cũng tác động đến **Độ ồn**.
- Máy tính giáo viên chiếu nội dung lên bảng và cho phép dạy ba bài JavaScript. Dùng **Tắt chiếu** để khôi phục nội dung bảng trước đó; tiến trình bài học được giữ nguyên.
- Esc hoặc nút Tạm dừng mở menu. P bật bảng hiệu năng. Có thể mở bằng `?perf` để hiển thị bảng từ đầu.
- Menu cho phép chơi lại, về màn hình đầu, đổi Low / Medium / High / Tự động và tắt/bật nhạc nền cùng âm thanh lớp học.

## Kiến trúc hiệu năng

- `src/main.js`: menu/HUD và hộp thoại bằng DOM; chỉ cập nhật thông tin khi cần. Không dùng React/Zustand nên không phát sinh render React mỗi frame.
- `src/world.js`: một vòng requestAnimationFrame; dừng khi menu/hộp thoại mở, mất focus hoặc tab bị ẩn. Di chuyển không tạo Vector3 mỗi frame. Raycaster tái sử dụng, kiểm tra mục tiêu 10 Hz. Hành vi nền cập nhật định kỳ; chuyển động dùng chung nhịp hoạt ảnh theo preset.
- `src/logic.js`: va chạm AABB có bước nhỏ chống xuyên tường, preset chất lượng và adaptive quality độc lập với giao diện.
- `src/students.js`: 10 học sinh từ primitive; 5 kiểu tóc, nhiều màu da/tóc, đồng phục, mắt/mày/miệng, 8 biểu cảm trên một atlas 512×256. Head rig giữ mặt/tóc đi cùng chuyển động đầu. IDLE/LISTENING vẫn chớp mắt, viết bài, gật đầu và nhìn quanh. Geometry/material dùng chung; tóc và chân ghép mesh.
- `src/events.js`: bốn sự kiện chính theo bài học, không ghi đè sự kiện chưa giải quyết; chỉ số và Stress có giới hạn 0–100.
- `src/classroom-progress.js`: điểm hiểu bài của 10 sinh viên và ba mức kết quả bài kiểm tra.
- `src/bubbles.js`: pool 3 bong bóng DOM, cập nhật vị trí 10 Hz, kiểm tra che khuất bằng raycast và giấu bong bóng khi đè lên nhau. Nội dung dùng textContent. Thời hạn theo thời gian game, không có timer riêng. Sự kiện đang diễn ra có thể nhắc lại sau khi bong bóng cũ đã hết hạn.
- Mặt bàn, chân bàn/ghế, mặt ghế, lưng ghế, đường sàn, sách, bút và chi tiết lặp lại dùng InstancedMesh. Thêm góc biết ơn, kệ sách, cây và ánh sáng giả lập trên sàn.
- Một AmbientLight và một DirectionalLight. Low không bóng, Medium shadow 512, High shadow 1024. Chỉ đầu học sinh đổ bóng. Không post-processing, phản chiếu, physics engine hay API AI.
- DPR giới hạn lần lượt 0,85 / 1,25 / 1,75; hoạt ảnh đặc biệt tối đa 15 / 30 / 60 Hz.
- Auto mặc định Low khi số luồng CPU hoặc RAM được trình duyệt cung cấp ≤ 4, ngược lại Medium. Đây là heuristic, không đo GPU. Low cũng có thể chọn thủ công.
- Auto hạ một mức sau FPS <35 kéo dài ít nhất 8 giây và hết thời gian ổn định 15 giây ban đầu; nghỉ 25 giây giữa các lần hạ. Phục hồi Low → Medium sau >57 FPS trong 40 giây, nghỉ 45 giây sau phục hồi. Không tự tăng lên High. Chế độ thủ công không bị thay đổi.
- Three.js và scene tải bằng dynamic import khi bắt đầu, tách engine/logic thành chunk riêng. Không có model/texture/audio tải ngoài: texture chữ và atlas khuôn mặt đều tạo bằng canvas 512×256, còn lại màu đơn. Không cần fallback GLB hay texture mạng. Lỗi tải chunk/WebGL hiển thị thông báo và cho phép thử lại.
- `src/audio.js`: Web Audio tạo nhạc nền hợp âm nhẹ, tiếng xì xào và tiếng phấn viết bảng. Âm thanh tạm dừng cùng game và có fallback im lặng nếu trình duyệt chặn.
- Về menu chính sẽ dọn listeners, RAF, instance buffers, textures, geometries, materials và renderer. Chơi lại reset scene có sẵn để tránh tạo thêm tài nguyên. WebGL context được giữ có chủ ý trên cùng canvas để có thể tạo renderer mới sau khi về menu.
- Lựa chọn đồ họa lưu localStorage, có fallback nếu trình duyệt chặn lưu trữ.

## Triển khai

`npm run build` tạo website tĩnh trong `dist/`. Có cấu hình `vercel.json` và `netlify.toml`; không cần backend, khóa API hay biến môi trường. Tài nguyên có hash từ Vite. Chưa triển khai lên dịch vụ bên ngoài.

## Kiểm chứng

Xem [PERFORMANCE.md](./PERFORMANCE.md) để biết kết quả thực đo và các hạng mục chưa thể kiểm thử. Các test tích hợp dùng Three.js thật cho hình học/raycast, DOM và renderer giả lập. Đã thử khởi động trong Chrome headless, không có lỗi JavaScript khi mở game. Chưa kiểm chứng cảm nhận âm thanh, toàn bộ luồng bằng thao tác tay hoặc FPS trên thiết bị thực.
