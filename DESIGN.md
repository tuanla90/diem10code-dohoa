# Ngôn ngữ giao diện Gương Mặt Ngày Hội

Cùng chuỗi với Mạch Đèn, Sổ Ngày Hội, Đội Rô Bốt: nền lavender, mực chàm, nút indigo, Google Sans Flex, Sola và Luna. Bảng màu chỉ khai ở `public/css/tokens.css`, màu trong tranh chỉ khai ở `public/js/hinh.mjs`.

## Dấu hiệu riêng

Game về đồ họa thì giao diện cũng là phần mềm đồ họa:

- **Khung chọn hồng có 4 tay nắm** đánh dấu thứ đang được làm: món kế tiếp trên bản vẽ, thẻ thành viên, giấy khen.
- **Bàn vẽ chấm lưới** làm nền sân khấu, tranh là tờ giấy đặt trên đó.
- **Bản vẽ nét** là lưới giấy cộng nét đơn: thứ gì chưa làm thì chưa có màu.

## Vòng lặp chính: Bản vẽ Ngày hội

Trang chủ là một sân trường vẽ một lần. 21 màn ứng với 21 món. Qua màn nào, món đó có màu ngay trên trang chủ, kèm nhịp nảy khi quay về. Người chơi luôn thấy mình đang dựng cái gì, và còn thiếu gì. Bản nét và bản màu dùng chung một hình vẽ, khác nhau bằng lớp `.bv-net` và `.bv-mau`.

## Các màn hình

| Đường dẫn | Màn hình | Vai trò |
| --- | --- | --- |
| `#/chao` | Mở đầu | Màn tựa, ba khung truyện, nhận thẻ thành viên. Bỏ qua được |
| `#/` | Bản vẽ | Tiến độ, nút Làm tiếp, năm gói, Mắt Thiết Kế |
| `#/goi/<id>` | Gói việc | Hành trình các màn, lời nhờ của gói |
| `#/man/<ma>` | Bàn chơi | Phiếu việc, sân khấu, bảng lệnh theo hình đang chọn, Rạp kết quả |
| `#/xong-goi/<id>` | Xong gói | Huy hiệu gói, lời mừng, bản vẽ đã thêm màu |
| `#/mat-tinh` | Mắt Thiết Kế | Chọn bản đúng giữa hai bản, luôn có lý do |
| `#/tac-pham` | Tủ tác phẩm | Vẽ lại đúng thành phẩm người chơi đã làm |
| `#/so-tay` | Sổ tay | Tìm kiếm, mở từng mục, đánh dấu đã đọc |
| `#/ho-so` | Hồ sơ | Thẻ thành viên, số liệu, huy hiệu, cài đặt |
| `#/khai-mac` | Khai mạc | Rèm mở, danh sách việc đã làm, lưu giấy khen |

## Luật thiết kế

- **Bàn chơi giữ yên tay người chơi.** Tranh neo phía trên sân khấu, khay đổi nội dung thế nào thì tranh cũng không nhảy. Nút Chạy luôn ở đáy, gọi người chơi khi lời dẫn đã tới bước cuối.
- **Chọn rồi làm ngay trên hình, như phần mềm thật.** Không có bước chọn công cụ trước khi kéo. Kéo thân là dời, kéo tay nắm là đổi cỡ, việc kèm theo nằm ở bảng hoặc nút lệnh. Thanh công cụ chỉ còn ở Sửa ảnh và Tách nền, hai việc mà phần mềm thật cũng đổi công cụ.
- **Thân hình luôn kéo được.** Vùng chạm tay nắm đủ rộng cho ngón tay nhưng đẩy ra ngoài khi hình nhỏ (`vungTay`), chạm không kéo thì xuyên xuống hình bên dưới, đặt ngón tay không làm hình giật.
- **Biết trước, không đoán.** Phiếu việc ghi yêu cầu bắt buộc và điều kiện từng sao trước khi làm. Việc kéo thanh trượt mà mắt khó tự biết thế nào là đủ thì có vạch đo sống: vùng xanh là đạt, xanh đậm là đủ sao. Vùng xanh luôn khớp kết quả Chạy.
- **Không phạt.** Sai không mất gì, sao giữ mức cao nhất, thành phẩm giữ bản tốt nhất, bản dở tự lưu. Sai hai lần thì Luna ngỏ lời giúp, mở gợi ý không trừ sao.
- **Bền bỉ được khen như giỏi.** Huy hiệu Không bỏ cuộc và Tự lực đứng cạnh Một phát ăn ngay.
- **Hậu quả trước, điểm sau.** Bấm Chạy, thành phẩm quét ra như đang in rồi kết quả mới trồi lên, không che tranh.
- **Chỉ hỏi điều đã học.** Câu Mắt Thiết Kế của gói nào mở khi xong gói đó.
- **Một nhân vật, một bộ đồ nghề.** Rô bốt chỉ có một bản vẽ, ảnh chụp cũng vẽ từ đúng số đo đó (`ROBOT` trong `hinh.mjs`). Việc người chơi làm phải dùng cho chính Ngày hội, như dựng lại khiên trong bộ icon, không vẽ món không liên quan.

## Kỹ thuật

- Luật chơi không chạm DOM (`tien-trinh.mjs`, `the-gioi.mjs`, `kho.mjs`, `trang/mat-tinh-cau.mjs`) để `npm test` chạy được trên Node.
- `kho.mjs` giữ tiến độ trong bộ nhớ, ghi xuống `localStorage` sau mỗi lần đổi. Bản lưu cũ được trộn với giá trị mặc định, không đổi khóa.
- Không emoji, không em dash trong chữ hiển thị, tệp dưới 1000 dòng, không tài nguyên ngoài. Máy kiểm canh các luật này.
- Ưu tiên 375x812, dùng được ở 320x568, desktop là khung 430 px. Có giao diện tối và tôn trọng giảm chuyển động.
- Thử nhanh mọi màn: thêm `?mo-khoa` vào đường dẫn.
