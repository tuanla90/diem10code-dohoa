# Nhật ký Thay đổi (Changelog) — Dự án `diem10code-dohoa`

## [2026-11-06] Sẵn sàng deploy Railway
- **Máy chủ:** có `PORT` mà không có `HOST` thì nghe `0.0.0.0`; chạy ở máy không có `PORT` vẫn chỉ nghe `127.0.0.1`.
- **Cấu hình:** thêm `railway.json` (`npm start`, kiểm tra sức khỏe ở `/`), `engines.node >= 18`, `private: true` trong `package.json`.

## [2026-11-06] Bộ công cụ và tự nắn theo app vẽ trên điện thoại
- **Bộ công cụ:** mọi cơ khí trừ `xuat-tep` có thanh `#bo-cu`, phải chọn công cụ mới thao tác được, tay nắm và khay đổi theo công cụ. Sai công cụ thì có lời nhắc, không có gì xảy ra. Hoàn tác giữ công cụ, Làm lại về công cụ mặc định.
- **Tự nắn:** `public/js/toan/hit.mjs` và các ngưỡng trong từng cơ khí. Kéo gần vùng, tâm, mép, cỡ của hình khác, khoảng cách đều, góc vuông, nút mẫu, tổng 30 giây, mép lời nói thì hít vào, có đường hồng, tiếng nhỏ và rung nhẹ. Đũa thần trượt về nền gần nhất, cọ bám mép và làm mượt nét.
- **Kéo thay bấm:** bỏ Đưa lên/xuống, Sang trái/phải, nút cộng trừ 0,5 giây, thẻ chọn hình. Thứ tự lớp kéo thẻ, chọn nhiều bằng quét khung, đổi cỡ bằng 4 góc. Căn chỉnh giữ dạng lệnh vì C10-10 dạy lệnh căn chỉnh, có hình mẫu.
- **Máy thấp:** sân khấu thu theo chiều cao, thanh công cụ dính trên thanh Chạy, chọn công cụ thì cuộn cho thấy khay.
- **Kiểm thử:** `tools/kiem-game.mjs` thêm test công cụ và hàm hít; 17 màn chơi qua giao diện bằng sự kiện chạm giả lập ở 375x812 và 320x568, cố ý kéo lệch.

## [2026-11-06] Làm lại toàn bộ: "Gương Mặt Ngày Hội", điện thoại dọc, cùng chuỗi game diem-10-code
- **Bối cảnh:** bỏ câu chuyện cứu hộ rô bốt, chuyển sang Ngày hội Tin học của CLB Tin học, THPT Hoa Phượng. Sola và Luna nhờ, người chơi là "bạn".
- **Nội dung:** 17 màn trong 5 gói bám bài C10-09, C10-10, C10-28, U11-09 đến U11-15. Bỏ màn G12-01 (CSS, không thuộc mạch đồ họa, trùng WebCraft).
- **Lối chơi:** tự tay làm, bấm Chạy, xem cảnh hậu quả, sửa lại không mất gì. Có 10 cơ khí thật trong `public/js/co-khi/`, gợi ý không làm hộ, sao chấm theo tiêu chí tay nghề.
- **Giao diện:** khung dọc tối đa 430 px, vùng chạm từ 44 px, giao diện sáng và tối, không emoji. Ảnh mặt Sola và Luna chép từ `so-ngay-hoi`, font từ `mach-den`.
- **Máy chủ:** `server.js` chỉ phục vụ `public/`, mặc định 127.0.0.1, thêm `npm run dien-thoai` để thử qua mạng LAN. Bỏ các đường mount ra ngoài dự án.
- **Kiểm thử:** `tools/kiem-game.mjs` viết lại: màn đầu chưa đạt, lời giải đạt 3 sao qua thao tác của cơ khí, mỗi lỗi mẫu rơi đúng tiêu chí.
- **Sửa sau khi chơi thử ở 375x812:** chấm chuyển cảnh DH-5-3 bị đoạn phim sau che nên chạm không ăn, nay có làn riêng dưới dải phim. Thanh cắt phim mất quãng kéo đầu tiên, nay tính từ lúc đặt ngón tay. Vùng chạm thanh cắt lệch vào đoạn đang chọn để không che đoạn ngắn kề bên. Màn xem trước hiện độ dài đang giữ của đoạn.
- **Bản cũ v3** lưu ở `.agent/ban-cu-v3/`.

## [2026-11-04] Bản nâng cấp v3.0 — Game Design Tactile (3 Màn hình + On-Canvas Gizmos + Multi-Step Robot Cutscene + Hệ thống 27 Sao)
- **[public/index.html](file:///d:/Users/tuanla2/game/diem10code-dohoa/public/index.html)** & **[public/css/style.css](file:///d:/Users/tuanla2/game/diem10code-dohoa/public/css/style.css)**:
  - Thiết kế lại kiến trúc trải nghiệm theo **3 Màn hình Game tách biệt**: **Màn Đầu Khởi Động (`#screen-title`)** với đội hình Sola, Luna và các cỗ máy Robot, **Bản Đồ 9 Trạm Cứu Hộ CLB (`#screen-map`)** có cảnh thu nhỏ từng mùa và khay 3 ngôi sao SVG, và **Sân Khấu Đạo Diễn Trực Tiếp (`#screen-stage`)** tỷ lệ rộng 74% Sân khấu / 26% Khay Đạo Cụ.
  - Bổ sung hệ nút nổi 3D Tactile (`.bt-game`), biển tên tiết mục (`.plaque`), dải đèn cảm biến (`#checklist-items`), bong bóng thoại truyện tranh (`#dialogue-banner`), và **Hộp Thoại Chiến Thắng 3 Sao (`#victory-modal-overlay`)**.
- **[public/js/man-hinh-game.js](file:///d:/Users/tuanla2/game/diem10code-dohoa/public/js/man-hinh-game.js)**:
  - Quản lý chuyển đổi mượt giữa 3 màn hình (`chuyenManHinh`), cập nhật Thanh Top HUD (`capNhatHud`), vẽ Màn Đầu (`veManDau`), vẽ Bản Đồ 9 Trạm (`veBanDo`), hiển thị Hộp Thoại Chiến Thắng 3 Sao (`hienHopChienThang`), rung khung sân khấu khi lỗi (`rungSanKhau`) và phát hiệu ứng âm thanh gốc (`phatAmThanh`).
- **[public/js/tuong-tac-svg.js](file:///d:/Users/tuanla2/game/diem10code-dohoa/public/js/tuong-tac-svg.js)** & **[public/js/dien-hoat-san-khau.js](file:///d:/Users/tuanla2/game/diem10code-dohoa/public/js/dien-hoat-san-khau.js)**:
  - Bổ sung hệ thống **On-Canvas Gizmos (`data-stage-action` & `data-drag`)** cho phép học sinh bấm và kéo trực tiếp các nút thao tác đồ họa ngay trên mặt sân khấu SVG ở cả 9 màn chơi (`apThaoTacTrenSan`).
  - Xây dựng Engine **Diễn Hoạt Đa Bước (`chayDienHoat`)** gồm 3 pha nội suy mượt (`scan` -> `move` -> `celebrate` / `fail`) với tia quét cảm biến động, chuyển động Robot & đạo cụ theo đường cong Bézier / tuyến tính, hiệu ứng pháo giấy vector (`svg-confetti-burst`) và cảnh báo xung kích đỏ (`svg-fail-overlay`).
- **[public/js/ung-dung.js](file:///d:/Users/tuanla2/game/diem10code-dohoa/public/js/ung-dung.js)**:
  - Kết nối trung tâm giữa `ManHinhGame`, `TuongTacSvg` và `DienHoatSanKhau`; chấm điểm **1 - 2 - 3 Sao** mỗi màn (tổng **27 Sao Chiến Dịch**) lưu vào `localStorage`, đồng bộ lịch sử Hoàn tác (`Undo`) cho cả thao tác kéo thả/bấm Gizmo trên sân khấu lẫn bảng Inspector.
- **[tools/kiem-game.mjs](file:///d:/Users/tuanla2/game/diem10code-dohoa/tools/kiem-game.mjs)**:
  - Nâng cấp bộ kiểm thử nghiệm thu toàn diện kiểm tra `ManHinhGame`, `DienHoatSanKhau.apThaoTacTrenSan`, `DienHoatSanKhau.chayDienHoat` (cả kịch bản lỗi và thắng 3 pha), kiểm tra tồn tại tài nguyên gốc, giới hạn `< 1000` dòng/tệp và quy tắc `0 Emoji / 0 Unicode Symbol cấm`.

## [2026-11-04] Bản nâng cấp v2 — Tích hợp 100% Kho Tài nguyên Đồ họa Gốc từ 2 Dự án Mẹ (`tin_hoc` & `doi-robot-chan-hung`)
- **[server.js](file:///d:/Users/tuanla2/game/diem10code-dohoa/server.js)**: Mount trực tiếp 3 kho tài nguyên gốc từ ổ đĩa vào máy chủ HTTP (`http://localhost:4280`):
  - `/tin-hoc/` -> `D:\Users\tuanla2\tin_hoc\public` (Chân dung Sola & Luna full-body `hero.png`, `faces/*.png`, huy hiệu `badges/*.png`, `tokens.css`).
  - `/robot-game/` -> `D:\Users\tuanla2\game\doi-robot-chan-hung\hoc\game` (Toàn bộ kho ảnh `phim-clb/a/mascot/`, `phim-clb/a/robot/`, `phim-clb/a/nguoi/`, `phim-clb/a/nen-doc/`, âm thanh `phim-clb/a/sfx/`, font `Google Sans Flex`, `bang-mau.js`, `ve-vector.js`).
  - `/robot-hoc/` -> `D:\Users\tuanla2\game\doi-robot-chan-hung\hoc` (`bang-ghep.js`).
- **[public/js/ve-san-khau.js](file:///d:/Users/tuanla2/game/diem10code-dohoa/public/js/ve-san-khau.js)**: Thay thế hoàn toàn các hình vẽ tay đơn giản bằng kho ảnh gốc chất lượng cao:
  - Linh vật **Sola & Luna** (`MASCOT_POSES`) tự động đổi biểu cảm theo từng tiết mục và kết quả chạy thử (`confident`, `thinking-sach`, `explaining`, `magnifier`, `facepalm`, `worried`, `celebrate-jump`, `great-job`).
  - **8 Cỗ máy Robot Chấn Hưng + Tổ hợp Lai Mùa 9** (`ROBOT_SPRITES`: `omni`, `hai-banh`, `xuong`, `nhen`, `cau`, `drone`, `omni-luoi`, `gai`, `xich`, `sola-bot`, `luna-bot`) hiển thị đúng 3 trạng thái: bình thường, ngạc nhiên/lỗi cảm biến (`-ngac.webp`) và chiến thắng (`-vui.webp`).
  - **9 Nhân vật cần cứu hộ** (`RESCUE_PEOPLE`: Chú Sáu, Bà cụ, Dũng, Phong, Cô Hạnh, Tú, Mai, Lan, Thầy giáo CLB) tự động chuyển từ trạng thái hoảng hốt/sốt ruột (`-hoang.webp` / `-sot-ruot.webp`) sang vui mừng (`-mung.webp` / `-tu-hao.webp`) khi được cứu, kèm phao cứu sinh `o-phao-dich.webp` khi ở dưới nước.
  - **Bối cảnh Sân khấu 9 Mùa** (`STAGE_BACKDROPS`): Kết hợp tranh nền `nen-doc/mua-*.webp`, ô địa hình gốc (`o-san-kho.webp`, `o-nuoc.webp`, `o-bai-cont.webp`, `o-da-uot.webp`, `o-san-vang.webp`) và Xe Trạm Cứu Hộ CLB (`xe-tram.webp`, `o-dich.webp`, `o-co.webp`).
- **[public/js/tuong-tac-svg.js](file:///d:/Users/tuanla2/game/diem10code-dohoa/public/js/tuong-tac-svg.js)**: Nhúng trực tiếp tài nguyên đạo cụ gốc (`vat-da-tron.webp`, `o-ho.webp`, `vat-be-go.webp`, `vat-luc-binh.webp`, `vat-da-chuong.webp`, `vat-da-xe.webp`, `vat-cont-lam.webp`, `o-ngach-1.webp`, `lai-omni-loa.webp`) vào các lớp `<svg>` tương tác kéo thả.
- **[public/index.html](file:///d:/Users/tuanla2/game/diem10code-dohoa/public/index.html)**, **[public/sink.html](file:///d:/Users/tuanla2/game/diem10code-dohoa/public/sink.html)**, **[public/css/style.css](file:///d:/Users/tuanla2/game/diem10code-dohoa/public/css/style.css)** & **[public/js/ung-dung.js](file:///d:/Users/tuanla2/game/diem10code-dohoa/public/js/ung-dung.js)**: Đồng bộ font `Google Sans Flex`, thêm ảnh thu nhỏ Robot trên danh sách 9 tiết mục, huy hiệu Khối 10-11-12 và hiệu ứng âm thanh gốc (`ding.wav`, `wrong.wav`).
- **[tools/kiem-game.mjs](file:///d:/Users/tuanla2/game/diem10code-dohoa/tools/kiem-game.mjs)**: Mở rộng bộ kiểm thử tự động lên **632 phép kiểm** (xác minh mọi đường dẫn ảnh nhúng trong SVG và kho tài nguyên đều tồn tại thật trên ổ đĩa).
