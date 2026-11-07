# Nhật ký Thay đổi (Changelog) — Dự án `diem10code-dohoa`

## [2026-11-07] Thêm 3 màn, game lên 21 màn
Mỗi màn có món riêng trên Bản vẽ, cảnh hậu quả và một câu Mắt Thiết Kế. Mã màn theo thứ tự thêm, không theo vị trí, nên bản lưu cũ vẫn đúng.
- **DH-4-5 Áo trắng mất nếp (U11-10), sau DH-4-1:** Sola lưu đè ảnh đã cháy. Người chơi thử kéo tối thấy vạch Nếp áo đứng yên, rồi bấm `Mở bản gốc` để sửa lại. `nep` đo trên điểm ảnh thật (`doNep`), bản cháy luôn bằng 0 ở mọi vị trí thanh. Nút nằm trên ảnh, không nằm ở khay, vì màn 375x667 sẽ bị đẩy mất thanh trượt.
- **DH-5-4 Vẽ cánh tay vẫy (ôn C10-28), đầu gói 5:** nắn thanh thẳng thành cánh tay, thêm nút, bo khuỷu bằng nút trơn. Tay vừa vẽ gắn vào rô bốt và vẫy thật ở cảnh kết quả. Màn tự khai `baiHoc` riêng, `nut-net` nhận thêm `san.coThem`, `san.nen`, `san.to`, `san.phu`.
- **DH-5-5 Rô bốt chớp mắt (U11-13), sau DH-5-1:** `msRieng` cho mỗi khung một thời gian. `robot` có thêm `mat: 'lim'`. `canhAnhDong` tính keyTimes cộng dồn. Màn cũ không có `ms` trên khung vẫn dùng `st.ms`.
- **Sửa khi chơi thử:** dấu cộng trùng vùng chạm của nút khác thì không bấm được, nay tự dịch dọc đoạn. Nét đích của DH-5-4 bị thanh tay và bàn tay che, nay vẽ đè lên trên kèm chấm hồng. Đủ nút thì cất dấu cộng.

## [2026-11-07] Cọ giữ ở DH-4-3 dễ chơi hơn
- **Vấn đề:** cọ cỡ 8 chỉ chịu được nét lệch khoảng 3 điểm ảnh, ngón tay lại che mất tay máy. Phần cần tô hiện mờ xám trên nền ca rô nên khó thấy. Nét đi ra ngoài trả lại tường, làm tụt vạch Nền còn. Thả tay thì nét hụt đoạn cuối vì làm mượt.
- **Nhìn rõ:** cầm Cọ giữ thì phần rô bốt lỡ xóa phủ hồng (`MAU_THIEU`), như mặt nạ của app xóa nền. Áp dụng cả DH-4-2.
- **Không trả lại nền:** `toCo` với Cọ giữ bám mép bỏ qua nét ngoài tầm rô bốt, và nhận rô bốt trong cả tầm cọ thay vì 70%.
- **Cọ to hơn:** DH-4-3 mặc định cỡ 12. Nét lệch 6 điểm ảnh vẫn đủ 3 sao, lệch 9 điểm ảnh mất 1,1% nên cần chỉnh lại một chút. Ngưỡng `NEN3` giữ nguyên, nên quên một tay vẫn chưa đạt.
- **Nét đủ dài:** thả tay thì nét nối tới đúng chỗ ngón tay.

## [2026-11-07] Rô bốt bánh xích lùn mập theo ảnh mẫu của chủ dự án
Thay phần dáng của mục ngay dưới. Các số ở mục dưới (tay 50, `NEN3.an` 2, `BAN_TRANH` 3) không còn đúng.
- **Dáng:** đầu tròn to (90x62), thân rộng và thấp (54x40), hai bánh xích bè hai bên (30x29), kính tối với hai mắt viên thuốc xanh, vỏ trắng có đường ghép. Chỉ một râu trên đỉnh đầu, chấm tròn dùng `MAU.cyan` đúng màu mắt. Hai râu cạnh tai trong ảnh mẫu cố ý không làm. Icon `hd5` đổi theo.
- **Bớt chấm sáng:** bỏ chấm ở khớp vai và trục bánh xích. Tay nay vẽ sau thân, chui ra từ sau thân nên không cần khớp. Bánh xích chỉ còn ba vạch gai. Chấm sáng còn lại: mắt, râu, tim ngực, bàn tay.
- **Tay:** ngắn, gập ở khuỷu. `tay: 'hong'` là hai bàn tay tì lên bánh xích, tạo ô nền kín khoảng 18x15 điểm ảnh. Bỏ tư thế xuôi.
- **Ảnh chụp:** `KHUNG_ANH` đổi thành `{ox:12, oy:3, s:1.3}`, chừa khe trên râu và dưới bánh xích để đũa thần loang qua. Hai bảng xanh thu nhỏ vì tai chạm bảng làm đũa thần không qua được. Lần chạm mẫu thảm đổi sang `[10, 170]`, chỗ cũ trúng bánh xích.
- **Sửa lỗi đũa thần:** chạm sát viền rô bốt thì mẫu màu 3x3 lẫn viền, đũa thần chỉ chọn được 1 điểm ảnh dù đã trượt sang nền. `diemNenGan` nay ưu tiên điểm có cả ô 3x3 là nền.
- **Ngưỡng DH-4-3:** một tay chỉ còn khoảng 2% rô bốt. `NEN3` đổi thành `an: 1, anDep: 0.5`, đoạn Mất tay trên vạch đo chỉ tới 8. Chữ đổi thành bánh xích.
- **Bản lưu:** `BAN_TRANH` lên 5, lại bỏ tranh và bản nháp DH-4-2, DH-4-3, sao giữ nguyên.
- **Bản vẽ Ngày hội:** hạ hai rô bốt cho đứng hẳn lên bục.
- **Kiểm thử:** thêm test đầu to hơn thân, thân rộng hơn cao, bánh xích hai bên, tay tì không quá 1,25 lần tay vẫy, và 12 điểm chạm lệch quanh hai khe tay. Chơi DH-4-2 và DH-4-3 bằng sự kiện con trỏ trên canvas với điểm chạm và nét cọ cố tình lệch, đều đạt 3 sao.

## [2026-11-07] Vẽ lại rô bốt cùng họ với game Python, rút ngắn tay chống hông
- **Tỉ lệ tay:** tay chống hông dài 75 đơn vị trong khi tay vẫy chỉ 31, do lần trước kéo dài để khe tay to. Nay chống hông 50, vẫy 41, xuôi 39. Máy kiểm giữ chống hông không quá 1,25 lần tay vẫy và 1,3 lần tay xuôi.
- **Dáng mới:** học từ `diem10code-python/hoc/game/ve-vector-than-hai-banh.js`: vỏ trắng hai tông có đường ghép tím, kính viên thuốc xanh với hai mắt sáng, chi con nhộng có gạch, khớp cyan. Giữ riêng của game này: ăng ten chấm vàng và ô ngực tím. Icon `hd5` đổi theo.
- **Ảnh chụp:** `veRobotAnh` vẽ từ cùng số đo `ROBOT`. Rô bốt nở từ tỉ lệ 1.2 lên 1.3 trong ảnh, đầu to thân gọn, nên khe tay vẫn rộng ít nhất 15 điểm ảnh dù tay ngắn hơn. `KHUNG_ANH`, `TAY_ANH`, `KHE_TAY` tính từ số đo, lời giải không ghi tọa độ tay nữa.
- **Vẫy tay:** cẳng tay xoay quanh khuỷu thay vì cả tay xoay quanh vai, nên khung vẫy cao không che kính.
- **Ngưỡng DH-4-3:** tay ngắn nên mất một tay còn khoảng 4,3% rô bốt. `NEN3.an` từ 6 xuống 2, `anDep` từ 2 xuống 1. Lời gợi ý đổi thành bàn tay xanh.
- **Bản lưu:** `DOI_TRANH` ghi màn đổi theo từng bản, `BAN_TRANH` lên 3. Bản 3 chỉ bỏ tranh DH-4-2, DH-4-3, không đụng DH-3-5.

## [2026-11-06] Một rô bốt cho mọi nơi, dễ chọn tay khi xóa nền, màn khiên thay chiếc lá
- **Một rô bốt:** `ROBOT` trong `hinh.mjs` giữ số đo và `robot()` là bản vẽ duy nhất. Ảnh chụp ở `toan/anh.mjs` (`veRobotAnh`) vẽ từ đúng các số đó. Thêm cổ, tay trái, tư thế chống hông `tay: 'hong'`, tay thép `thepTay` cho DH-4-3. Bản vẽ Ngày hội, poster, Mắt Thiết Kế, DH-4-2, DH-4-3, DH-4-4, DH-5-1 giờ cùng một rô bốt. Máy kiểm so màu ảnh với `robot()`.
- **Chọn tay DH-4-2, DH-4-3:** khe giữa tay và thân là tam giác rộng ít nhất 15 px, đọc từ `KHE_TAY`, tay dày hơn. Đũa thần chạm lệch vẫn trượt sang nền trong bán kính 7. Cọ giữ tự tìm rô bốt, cọ xóa tự tìm nền. Khi cầm Cọ giữ, phần rô bốt lỡ xóa hiện mờ 60% để biết chỗ cần tô. Tay thép có đinh tán ở hai mép. Ngưỡng đổi để mất một tay là chưa đạt (`NEN3`).
- **Màn DH-3-5 đổi thành Khiên An toàn mạng:** bỏ chiếc lá không liên quan. Người chơi dựng lại đúng khiên trong bộ năm icon: hai hình tròn Giữ chung ra mũi khiên, Gộp vai, Khoét dấu tích. Khiên là icon duy nhất trong năm cái thật sự cần Giữ chung. `hd3` đổi sang hình khớp chính xác, nên thành phẩm và icon trùng nhau. Nét đứt `netDich` nằm trên cùng, thêm hình `da-giac`. Gộp vai trước thì lời dẫn bảo Hoàn tác. Cảnh `canhKhien` đặt khiên vào hàng năm icon. Câu Mắt Thiết Kế đổi theo.
- **Bản lưu cũ:** `banTranh` trong `kho.mjs`. DH-3-5, DH-4-2, DH-4-3 giữ sao, bỏ thành phẩm và bản nháp cũ vì thao tác cũ không còn vẽ đúng tranh mới. Tủ tác phẩm nhắc chơi lại.
- **Máy thấp:** `--chua` để ảnh tách nền nhường chỗ cho vạch đo, thanh trượt không còn nằm dưới nút Chạy ở 375x667.
- **Kiểm thử:** thêm test cọ tự tìm, độ rộng khe tay, màu rô bốt ảnh. Chơi bằng chuột thật ở 375x812: DH-4-2, DH-4-3 với nét cố tình lệch, DH-3-5 đúng đường và sai thứ tự.

## [2026-11-06] Rãnh nhạc thao tác trực tiếp, vạch đo cho mọi màn chấm theo mốc, thêm màn mới DH-3-5
- **Rãnh nhạc DH-5-3:** bỏ thanh Âm lượng và nút Mờ dần cuối. Rãnh có dạng sóng, đường âm lượng màu trắng, vạch mức lời nói. Vuốt lên xuống trên rãnh là đổi âm lượng, kéo chấm ở góc trên vào trong là thêm đoạn dốc mờ dần, đúng như phần mềm dựng phim. Dạng sóng thu nhỏ theo đúng đường âm lượng (`heSoAm`). `nhac.mo` đổi từ đúng sai sang số giây, bản lưu cũ ghi `true` tính như 2 giây (`giayMo`). Sao mờ dần cần ít nhất 1 giây.
- **Rà thanh trượt:** thêm vạch đo cho DH-3-4 (Dung lượng, Độ nét chữ), DH-4-2 (Nền còn, Rô bốt, Khe tay), DH-4-3 (Nền còn, Rô bốt), DH-4-4 (Tương phản, Cỡ chữ), DH-5-1 (Một vòng). Lời dẫn các màn này chỉ gọi nút Chạy khi đã đủ điều kiện.
- **Màn mới DH-3-5:** dùng thật phép Giữ chung, trước đây có nút mà không màn nào cần. Bản đầu là biển chiếc lá, đã đổi thành khiên ở mục trên. Mã 3-5 đứng trước 3-4 vì tiến độ lưu theo mã. Thêm món trên bản vẽ, cảnh hậu quả, một câu Mắt Thiết Kế.
- **Bản lưu cũ:** `dangMoGoi`, `dangMoMan` không khóa lại phần đã đi qua, nên thêm màn vào gói cũ không làm khóa các gói sau. Danh hiệu cao nhất theo `tongSaoToiDa` thay vì số cố định.
- **Kiểm thử:** quét vị trí thật ở DH-3-4, DH-4-1, DH-4-4, DH-5-1, DH-5-3 và soi đầu màn, lời giải, các cách sai ở mọi màn có vạch đo. Thêm test đường âm lượng, bản lưu cũ, và luật mở khóa.

## [2026-11-06] Vạch đo sống cho màn độ sáng và âm lượng
- **Vấn đề:** người chơi kéo thanh trượt mà không biết thế nào là đạt. DH-4-1 chấm bằng ngưỡng không hề hiện ra, vạch đỏ biểu đồ còn báo ở mức vẫn đạt, nút Chạy đã gọi dù chưa đủ điều kiện. DH-5-3 không có dấu hiệu nào cho mốc 50%.
- **Vạch đo:** `dongHo` và `mucDo` trong `co-khi/chung.mjs`, màn khai ở `man.dongHo`. Vùng xanh nhạt là đạt, xanh đậm là đủ sao, kim là số hiện tại, chữ trạng thái đổi ngay khi kéo, có dấu tích để không chỉ dựa vào màu. Vừa đủ điều kiện thì có tiếng và rung qua `ctx.hit`.
- **DH-4-1:** bốn vạch Độ sáng, Độ trải, Cửa sổ, Vùng tối. Lời dẫn chỉ sang bước Chiếu thử khi cả bốn đạt, nên nút Chạy chỉ gọi khi thật sự đủ. Tụt sáng thì lời dẫn tự lùi về Độ sáng. Vạch đỏ biểu đồ chỉ hiện khi vạch đo tương ứng đã hỏng.
- **Nới vùng đạt DH-4-1:** đủ sáng từ 88 xuống 80, độ trải từ 110 xuống 105. Trước đây chỉ 17 trên 1681 vị trí thanh trượt là đạt. Điều kiện sao giữ nguyên. Mốc gom vào hằng `ANH` trong `goi-4.mjs`.
- **DH-5-3:** một vạch "Nhạc so với lời nói" dưới thanh Âm lượng. Luật chấm giữ nguyên.
- **Máy thấp:** từ cao 690 trở xuống, biểu đồ nhường chỗ để thanh trượt không nằm dưới thanh Chạy.
- **Kiểm thử:** quét mọi vị trí thanh trượt thật, vùng xanh phải khớp đúng tiêu chí chấm. DH-4-1 phải có ít nhất 30 vị trí đạt.

## [2026-11-06] Bỏ đổi công cụ, thao tác trực tiếp như phần mềm thật
- **Nguyên tắc:** chọn hình rồi thao tác ngay trên hình. Việc kèm theo nằm ở bảng hoặc nút lệnh theo hình đang chọn. Thanh `#bo-cu` chỉ còn ở `sua-anh` và `tach-nen`, hai nơi phần mềm thật cũng đổi công cụ. Thay cho quy định "phải chọn công cụ" của bản trước.
- **Logo, poster:** hình đang chọn luôn có đủ tay nắm, kéo thân là dời. Khóa tỉ lệ luôn nằm ở bảng. Chạm nền là bỏ chọn.
- **Soi tệp:** tách đôi. Bảng thông tin tệp và hàng đổi tệp luôn hiện, Kính soi là nút bật tắt. Kính đang bật vẫn kéo được logo: kéo trên kính là rê điểm soi, chạm lên logo là đưa điểm soi tới đó.
- **Chữ trên ảnh:** kéo chữ, kéo chấm đổi cỡ, màu và dải nền luôn nằm ở bảng.
- **Lớp và nhóm:** bảng lớp luôn mở, lệnh Nhóm, Cùng cỡ, Căn hàng, Cách đều luôn nằm sẵn và tự sáng khi vùng chọn đủ điều kiện. Chạm là chọn đúng hình đó, quét khung để chọn nhiều, chạm một hình trong vùng đang chọn nhiều là đặt làm mẫu như phần mềm vẽ thật. Bỏ kiểu chạm cộng dồn.
- **Khoét hình:** Gộp vào, Khoét đi, Giữ chung thành nút lệnh áp lên hình đang chọn.
- **Dòng thời gian:** chạm đoạn là hiện thanh vàng để cắt, kéo thân đoạn là đổi chỗ. Chấm chuyển cảnh, rãnh nhạc, Âm lượng và Mờ dần luôn sẵn. DH-5-2 mở đầu không chọn đoạn nào, để đoạn Logo ngắn kéo được trọn thân.
- **Khung hình:** chạm khung là chọn, kéo là đổi chỗ, Xóa khung là nút, thanh nhịp luôn hiện.
- **Nắn nút:** dấu cộng luôn hiện ở mép, chạm là thêm và kéo tiếp được luôn. Xóa nút và Nút trơn là nút theo nút đang chọn. Màn uốn cong giữ nguyên số nút nên không bày dấu cộng.
- **Vùng chạm:** `vungTay` trong `co-khi/chung.mjs`. Vùng tay nắm rộng 44 đơn vị nhưng chỉ lấn tối đa 20% vào hình, phần còn lại đẩy ra ngoài, nên hình nhỏ vẫn kéo được thân. Chấm tay nắm chỉ để nhìn và thu nhỏ theo hình. Giữ khoảng lệch lúc đặt ngón tay nên hình không giật. Chạm mà không kéo trúng vùng tay nắm đè lên hình khác thì tính là chạm hình đó. Cỡ nhỏ nhất của logo và cụm là 28.
- **Sửa thêm:** số cỡ chữ trên ảnh có nền riêng, trước đây chìm vào đám đông tối màu.
- **Kiểm thử:** `tools/kiem-game.mjs` lên 1396 mục. Bỏ yêu cầu mọi cơ khí phải có thanh công cụ, thêm test ngược: chỉ `sua-anh` và `tach-nen` có thanh, cơ khí khác không đọc `ctx.cu`, lời dẫn không gọi công cụ đã gộp, vùng tay nắm luôn chừa thân. Chơi đạt 11 màn đã gộp qua giao diện ở 375x812 bằng sự kiện chạm trúng đúng phần tử dưới điểm chạm, kéo chuột thật ở logo và dòng thời gian, đo bố cục ở 320x568.

## [2026-11-06] Làm lại giao diện, trải nghiệm và thêm màn hình
- **Vòng lặp mới:** Bản vẽ Ngày hội ở trang chủ. Sân trường là bản nét, qua màn nào món đó có màu ngay trên bản vẽ. 17 món ứng 17 màn trong `public/js/the-gioi.mjs`.
- **Màn hình mới:** Mở đầu và thẻ thành viên, Tủ tác phẩm (vẽ lại đúng thành phẩm đã lưu), Sổ tay riêng có tìm kiếm, Hồ sơ với huy hiệu và cài đặt, Mắt Thiết Kế (18 câu, mở theo gói đã xong), Xong gói, Khai mạc có giấy khen lưu được. Điều hướng bằng thanh tab, định tuyến gọn lại trong `app.mjs`, các màn ở `public/js/trang/`.
- **Bàn chơi:** Phiếu việc nêu yêu cầu và điều kiện sao trước khi làm, sân khấu to hơn, tranh neo trên nên đổi công cụ không nhảy, tự lưu bản dở, Rạp kết quả quét ra thành phẩm rồi mới trồi bảng, thanh tiến độ yêu cầu khi sai, sai hai lần thì Luna ngỏ lời giúp, dòng phần thưởng khi đạt.
- **Soi tệp:** làm lại theo cách kiểm ảnh trước khi in thật. Kính rê được trên logo, trong kính là đúng điểm ảnh của tệp trên 5 cm bản in (`public/js/kinh-soi.mjs`). Thông số chuyển xuống bảng thông tin ở khay: tệp gốc, cỡ in, mật độ kèm PPI, mức tiệm in cần. Số trong bảng dùng chung công thức với lúc chấm.
- **Tiến trình:** 6 danh hiệu, 12 huy hiệu, thưởng cả bền bỉ lẫn tự lực (`public/js/tien-trinh.mjs`). Bản lưu cũ vẫn dùng được, cùng khóa `dohoa_tien_do_v1`.
- **Sửa lỗi:** Kéo đoạn phim thật nhanh chỉ nhích một ô mỗi nhịp, nay đổi liên tiếp tới đúng chỗ ngón tay. Hít vừa khít khung lúc khóa tỉ lệ làm logo hóa ô đen, do đường gióng khép kín quên `fill="none"`.
- **Kiểm thử:** `tools/kiem-game.mjs` từ 932 lên hơn 1360 mục: khớp món và màn, chơi xuyên 17 màn đúng trình tự, huy hiệu không trao hai lần, không mất kỷ lục, lưu cũ, câu Mắt Thiết Kế, tham chiếu icon, ảnh mặt, đường dẫn. Chơi thử bằng thao tác thật ở 375x812, đo bố cục 17 màn ở 320x568, xem giao diện tối và khung desktop.
- **Tài liệu:** thêm `DESIGN.md`.

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
- **Bản cũ v3** lưu ở `.agent/ban-cu-v3/`, chỉ còn trên máy, không đưa lên repo.

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
