// Gói 4, bài U11-09 đến U11-12: bộ ảnh hội trường. Chấm trên điểm ảnh thật.
import { canhAnhHoiTruong, canhTachNen, canhChuPoster } from '../canh.mjs';
import { KHE_TAY, TAY_ANH } from '../toan/anh.mjs';

const dauTach = { thao: [], cheDo: 'dua', nguong: 10, r: 8 };

// Sáu lần chạm đũa thần dọn nền ảnh 1.
export function donNen1(st, l, nguong = 30) {
  for (const [x, y] of [[20, 20], [160, 30], [14, 60], [10, 170], ...KHE_TAY]) l.dua(st, x, y, nguong);
}

// Cọ giữ miết dọc một cánh tay: từ vai ra khuỷu, rồi về bàn tay.
const mietTay = (st, l, tay) => {
  for (let i = 0; i < 2; i++) {
    const [p, q] = [tay[i], tay[i + 1]];
    l.co(st, true, 8, Array.from({ length: 13 }, (_, t) => [Math.round(p[0] + ((q[0] - p[0]) * t) / 12), Math.round(p[1] + ((q[1] - p[1]) * t) / 12)]), true);
  }
};

// Mốc chấm của ảnh hội trường. Tiêu chí và vạch đo cùng đọc ở đây nên vùng xanh luôn đúng với kết quả Chạy.
const ANH = { toi: 80, sangQua: 165, trai: 105, traiDep: 125, chay: 3, chim: 6, sach: 2 };
const dacAnh = (d) => d.tb >= ANH.toi && d.tb <= ANH.sangQua && d.gian >= ANH.trai && d.chay * 100 <= ANH.chay && d.chim * 100 <= ANH.chim;
// Mốc tách nền, tính theo phần trăm.
const NEN2 = { sach: 1, sot: 4, an: 4 };
const NEN3 = { sot: 6, an: 1, anDep: 0.5 }; // Mất một tay là khoảng 2% rô bốt, nửa tay khoảng 1%, nên an không vượt mức đó thì Đủ hai tay mới đúng nghĩa.
// Mốc của ảnh đội rô bốt. Bản đã cháy có nep bằng 0 ở mọi vị trí thanh, chỉ bản gốc mới vượt được mốc.
const CUU = { nep: 12, nepRo: 25, toi: 100, sangQua: 165, chay: 3, sach: 1, trai: 150 };

export default {
  id: 'goi-4',
  ten: 'Bộ ảnh hội trường',
  baiHoc: 'U11-09..12',
  mo: 'Ảnh chụp tối, rô bốt dính nền, chữ chìm vào ảnh. Lần này sửa trên từng điểm ảnh.',
  loiMo: { ai: 'luna', mat: 'happy', cau: 'Bộ ảnh Ngày hội phải lên phim với poster. Ảnh điểm không có nút neo đâu, ta làm việc với màu và vùng chọn.' },
  man: [
    {
      ma: 'DH-4-1', ten: 'Ảnh hội trường tối om', coKhi: 'sua-anh', chay: 'Chiếu thử',
      ai: 'sola', mat: 'worried', vai: 'SOLA NHỜ',
      nho: 'Hôm chụp hội trường mình quên bật đèn sân khấu. Chiếu lên màn chắc không ai nhận ra ai.',
      muc: 'Làm ảnh sáng rõ, nhưng cửa sổ không được cháy trắng.',
      dau: { sang: 0, tp: 0 },
      dongHo: [
        { id: 'sang', ten: 'Độ sáng', lay: (d) => d.tb, den: 255, tieu: ['toi', 'cham'], muc: [
          { den: ANH.toi, chu: 'Còn tối', loai: 'xau' },
          { den: ANH.sangQua, chu: 'Vừa', loai: 'dat' },
          { den: 255, chu: 'Quá sáng', loai: 'xau' },
        ] },
        { id: 'trai', ten: 'Độ trải', lay: (d) => d.gian, tu: 40, tieu: ['gian'], muc: [
          { den: ANH.trai, chu: 'Còn xám', loai: 'xau' },
          { den: ANH.traiDep, chu: 'Đủ', loai: 'dat' },
          { den: 180, chu: 'Rất rộng', loai: 'dep' },
        ] },
        { id: 'chay', ten: 'Cửa sổ', lay: (d) => d.chay * 100, gomMoc: true, tieu: ['chay'], muc: [
          { den: ANH.sach, chu: 'Rõ', loai: 'dep' },
          { den: ANH.chay, chu: 'Sắp cháy', loai: 'dat' },
          { den: 12, chu: 'Cháy trắng', loai: 'xau' },
        ] },
        { id: 'chim', ten: 'Vùng tối', lay: (d) => d.chim * 100, gomMoc: true, tieu: ['chim'], muc: [
          { den: ANH.sach, chu: 'Rõ', loai: 'dep' },
          { den: ANH.chim, chu: 'Sắp đen', loai: 'dat' },
          { den: 20, chu: 'Đen kịt', loai: 'xau' },
        ] },
      ],
      sanNhan: 'Ảnh hội trường chụp thiếu sáng',
      dan: [
        { txt: 'Kéo thanh <b>Độ sáng</b> cho kim vạch Độ sáng vào vùng xanh.', nhan: 'cu-sang', xong: (d) => d.tb >= ANH.toi },
        { txt: 'Chọn công cụ <b>Tương phản</b> để các cột giãn ra.', nhan: 'cu-tp', xong: (d, _st, cu) => cu === 'tp' || d.gian >= ANH.trai },
        { txt: 'Kéo đến khi cả bốn vạch có dấu xanh. Tụt sáng thì quay lại <b>Độ sáng</b>.', xong: dacAnh },
        { txt: 'Bốn vạch đã xanh, bấm <b>Chiếu thử</b>. Kim vào phần xanh đậm là đủ sao.', xong: () => false },
      ],
      tieuChi: [
        { id: 'toi', ok: (d) => d.tb >= ANH.toi, ten: 'Đủ sáng', loi: 'Chiếu lên màn vẫn tối mờ, hàng ghế cuối hỏi có ảnh hay chưa.', ai: 'sola', matLoi: 'confused' },
        { id: 'chay', ok: (d) => d.chay * 100 <= ANH.chay, ten: 'Cửa sổ còn chi tiết', loi: 'Sáng quá tay, vùng cửa sổ cháy trắng, mất luôn khung cửa.', ai: 'luna', matLoi: 'worried' },
        { id: 'cham', ok: (d) => d.tb <= ANH.sangQua, ten: 'Không quá sáng', loi: 'Cả ảnh trắng bệch, mặt mọi người nhợt đi.', ai: 'sola', matLoi: 'shocked' },
        { id: 'gian', ok: (d) => d.gian >= ANH.trai, ten: 'Có độ tương phản', loi: 'Ảnh sáng rồi mà xám xịt, không có chỗ đậm chỗ nhạt nên trông như bị phủ sương.', ai: 'luna', matLoi: 'thinking' },
        { id: 'chim', ok: (d) => d.chim * 100 <= ANH.chim, ten: 'Vùng tối còn chi tiết', loi: 'Tương phản quá tay, áo và hàng ghế đen kịt, mất hết chi tiết.', ai: 'sola', matLoi: 'facepalm' },
        { id: 'trai', sao: true, ok: (d) => d.gian >= ANH.traiDep, ten: 'Biểu đồ trải rộng' },
        { id: 'giu', sao: true, ok: (d) => d.chay * 100 <= ANH.sach && d.chim * 100 <= ANH.sach, ten: 'Hai đầu không mất chi tiết' },
      ],
      goiY: [
        'Nhìn biểu đồ: các cột dồn hết về bên trái. Ảnh đẹp thường có cột trải khắp bề ngang.',
        'Chỉ tăng Độ sáng thì cột dịch sang phải nhưng vẫn chụm lại. Tương phản mới giãn chúng ra.',
        'Thử Độ sáng khoảng +40 trước, rồi tăng Tương phản dần. Vạch Cửa sổ báo Cháy trắng là đã quá tay.',
      ],
      soTay: ['histogram'],
      canh: (st) => canhAnhHoiTruong(st),
      giai(st, l) { l.dat(st, 40, 60); },
      sai: [
        { ten: 'Chỉ tăng sáng', loi: 'gian', lam(st, l) { l.dat(st, 45, 0); } },
        { ten: 'Chỉ tăng tương phản', loi: 'toi', lam(st, l) { l.dat(st, 0, 60); } },
        { ten: 'Sáng quá tay', loi: 'chay', lam(st, l) { l.dat(st, 100, 30); } },
      ],
    },
    {
      // Mã màn thêm sau nên số không theo thứ tự, bản lưu cũ theo mã nên vẫn đúng.
      ma: 'DH-4-5', ten: 'Áo trắng mất nếp', coKhi: 'sua-anh', chay: 'Chiếu thử', banChay: true,
      ai: 'sola', mat: 'worried', vai: 'SOLA NHỜ',
      nho: 'Ảnh đội rô bốt tối quá, mình kéo sáng hết cỡ rồi lưu đè luôn. Giờ áo trắng bệch, kéo tối lại chỉ ra một mảng xám, chẳng còn nếp gấp nào.',
      muc: 'Cứu ảnh cho áo thấy lại nếp gấp, ảnh sáng vừa và không cháy lần nữa.',
      dau: { sang: 0, tp: 0, goc: false },
      dongHo: [
        { id: 'nep', ten: 'Nếp áo', lay: (d) => d.nep, tieu: ['nep'], muc: [
          { den: CUU.nep, chu: 'Mất nếp', loai: 'xau' },
          { den: CUU.nepRo, chu: 'Thấy nếp', loai: 'dat' },
          { den: 70, chu: 'Rõ nếp', loai: 'dep' },
        ] },
        { id: 'sang', ten: 'Độ sáng', lay: (d) => d.tb, den: 255, tieu: ['toi', 'cham'], muc: [
          { den: CUU.toi, chu: 'Còn tối', loai: 'xau' },
          { den: CUU.sangQua, chu: 'Vừa', loai: 'dat' },
          { den: 255, chu: 'Quá sáng', loai: 'xau' },
        ] },
        { id: 'chay', ten: 'Áo trắng', lay: (d) => d.chay * 100, gomMoc: true, tieu: ['chay'], muc: [
          { den: CUU.sach, chu: 'Còn chi tiết', loai: 'dep' },
          { den: CUU.chay, chu: 'Sắp cháy', loai: 'dat' },
          { den: 25, chu: 'Cháy trắng', loai: 'xau' },
        ] },
      ],
      sanNhan: 'Ảnh đội rô bốt mặc áo trắng',
      dan: [
        { txt: 'Thử kéo <b>Độ sáng</b> xuống. Ảnh tối đi mà vạch Nếp áo không nhúc nhích.', nhan: 'cu-sang', xong: (_d, st) => st.sang < 0 || st.goc },
        { txt: 'Bản này đã mất nếp thật rồi, không kéo nào cứu được. Bấm <b>Mở bản gốc</b>.', nhan: 'ban-goc', xong: (_d, st) => st.goc },
        { txt: 'Bản gốc tối nhưng áo còn nếp. Kéo <b>Độ sáng</b> lên, chỉ đủ để cả ba vạch có dấu xanh.', xong: (d) => d.nep >= CUU.nep && d.tb >= CUU.toi && d.tb <= CUU.sangQua && d.chay * 100 <= CUU.chay },
        { txt: 'Bấm <b>Chiếu thử</b>. Thêm chút <b>Tương phản</b> cho biểu đồ trải rộng là đủ sao.', xong: () => false },
      ],
      tieuChi: [
        { id: 'nep', ok: (d) => d.nep >= CUU.nep, ten: 'Áo còn nếp gấp', loi: 'Áo vẫn là một mảng phẳng, không thấy nếp gấp nào. Ảnh đã cháy thì phải quay về bản gốc, hoặc bạn vừa kéo sáng quá tay.', ai: 'luna', matLoi: 'thinking' },
        { id: 'toi', ok: (d) => d.tb >= CUU.toi, ten: 'Đủ sáng', loi: 'Áo còn nếp rồi, nhưng ảnh tối thế này chiếu lên không ai nhận ra đội mình.', ai: 'sola', matLoi: 'confused' },
        { id: 'cham', ok: (d) => d.tb <= CUU.sangQua, ten: 'Không quá sáng', loi: 'Ảnh lại trắng bệch, lặp đúng lỗi cũ của mình rồi.', ai: 'sola', matLoi: 'facepalm' },
        { id: 'chay', ok: (d) => d.chay * 100 <= CUU.chay, ten: 'Áo không cháy lại', loi: 'Tương phản đẩy phần vải lên trắng tinh, vạch sát mép phải của biểu đồ đã báo trước.', ai: 'luna', matLoi: 'worried' },
        { id: 'ro', sao: true, ok: (d) => d.nep >= CUU.nepRo, ten: 'Nếp áo thật rõ' },
        { id: 'trai', sao: true, ok: (d) => d.gian >= CUU.trai, ten: 'Biểu đồ trải rộng' },
      ],
      goiY: [
        'Giữ nút dưới ảnh rồi thả ra để so. Áo trắng tinh một màu nghĩa là mọi điểm vải và nếp đã bằng nhau.',
        'Kéo thanh nào trên bản cháy thì hai điểm giống nhau vẫn giống nhau. Muốn có lại nếp áo phải về bản gốc.',
        'Bản gốc: Độ sáng khoảng +40, Tương phản khoảng +20. Quá tay thì vạch Nếp áo lại tụt.',
      ],
      soTay: ['chay-sang', 'histogram'],
      canh: (st, _k, _d, man) => canhAnhHoiTruong(st, man),
      giai(st, l) { l.moGoc(st); l.dat(st, 40, 20); },
      sai: [
        { ten: 'Kéo tối ngay trên bản cháy', loi: 'nep', lam(st, l) { l.dat(st, -60, 0); } },
        { ten: 'Mở bản gốc mà chưa chỉnh', loi: 'toi', lam(st, l) { l.moGoc(st); } },
        { ten: 'Lại kéo sáng hết cỡ', loi: 'cham', lam(st, l) { l.moGoc(st); l.dat(st, 100, 0); } },
        { ten: 'Tương phản quá tay', loi: 'chay', lam(st, l) { l.moGoc(st); l.dat(st, 40, 60); } },
        { ten: 'Cả hai thanh quá tay', loi: 'nep', lam(st, l) { l.moGoc(st); l.dat(st, 100, 40); } },
      ],
    },
    {
      ma: 'DH-4-2', ten: 'Tách rô bốt khỏi nền', coKhi: 'tach-nen', chay: 'Ghép poster',
      ai: 'luna', mat: 'thinking', vai: 'LUNA NHỜ',
      nho: 'Ảnh rô bốt chụp ở phòng tin, nền bừa bộn. Poster nền tím thì không thể để nguyên bức tường đó.',
      muc: 'Xóa hết nền, giữ nguyên rô bốt. Nền kiểu gì cũng phải sạch.',
      kieuAnh: 1, co: false,
      dau: { ...dauTach },
      dongHo: [
        { id: 'sot', ten: 'Nền còn', lay: (d) => d.conSot * 100, gomMoc: true, tieu: ['sot'], muc: [
          { den: NEN2.sach, chu: 'Sạch', loai: 'dep' },
          { den: NEN2.sot, chu: 'Gần sạch', loai: 'dat' },
          { den: 25, chu: 'Còn nhiều', loai: 'xau' },
        ] },
        { id: 'an', ten: 'Rô bốt', lay: (d) => d.anMat * 100, gomMoc: true, tieu: ['an'], muc: [
          { den: NEN2.an, chu: 'Nguyên vẹn', loai: 'dat' },
          { den: 25, chu: 'Bị ăn mất', loai: 'xau' },
        ] },
        { id: 'khe', ten: 'Khe tay', lay: (d) => (d.kheTrai ? 0 : 1) + (d.khePhai ? 0 : 1), gomMoc: true, tieu: ['khe'], muc: [
          { den: 0.5, chu: 'Sạch', loai: 'dat' },
          { den: 2, chu: 'Còn sót', loai: 'xau' },
        ] },
      ],
      sanNhan: 'Ảnh rô bốt trên nền nhiều mảng màu',
      dan: [
        { txt: 'Chạm vào <b>bức tường</b>. Còn lốm đốm thì tăng <b>Ngưỡng</b> rồi chạm lại.', xong: (_d, st) => st.thao.length >= 2 },
        { txt: 'Mỗi mảng màu chạm một lần, đến khi vạch <b>Nền còn</b> có dấu xanh.', xong: (d) => d.conSot * 100 <= NEN2.sot },
        { txt: 'Vạch <b>Khe tay</b> chưa xanh: tìm ô tường bị tay và bánh xích bao kín.', xong: (d) => d.kheTrai && d.khePhai },
        { txt: 'Rô bốt bị ăn mất thì bấm Hoàn tác, giảm <b>Ngưỡng</b> rồi chạm lại.', xong: (d) => d.anMat * 100 <= NEN2.an },
        { txt: 'Ba vạch đã xanh, bấm <b>Ghép poster</b>.', xong: () => false },
      ],
      tieuChi: [
        { id: 'an', ok: (d) => d.anMat * 100 <= NEN2.an, ten: 'Rô bốt nguyên vẹn', loi: 'Ngưỡng cao quá, đũa thần ăn luôn một phần rô bốt. Lên poster rô bốt mất bánh xích.', ai: 'sola', matLoi: 'shocked' },
        { id: 'khe', ok: (d) => d.kheTrai && d.khePhai, ten: 'Sạch cả khe tay', loi: 'Ô giữa tay, thân và bánh xích vẫn còn nguyên miếng tường kem. Lên nền tím nhìn rõ mồn một.', ai: 'luna', matLoi: 'worried' },
        { id: 'sot', ok: (d) => d.conSot * 100 <= NEN2.sot, ten: 'Nền đã sạch', loi: 'Nền còn sót nhiều mảng, ghép lên poster như có miếng dán chưa bóc.', ai: 'sola', matLoi: 'facepalm' },
        { id: 'sach', sao: true, ok: (d) => d.conSot * 100 <= NEN2.sach, ten: 'Gần như không còn hạt nền' },
        { id: 'khit', sao: true, ok: (d) => d.trung >= 0.97, ten: 'Đường viền khít rô bốt' },
      ],
      goiY: [
        'Đũa thần loang từ điểm chạm ra các điểm có màu gần giống, và dừng lại ở vùng khác màu.',
        'Ngưỡng thấp để lại lốm đốm, ngưỡng rất cao thì lan sang cả rô bốt. Tìm mức ở giữa.',
        'Đũa thần không vượt qua được tay rô bốt, nên ô giữa tay và bánh xích phải chạm riêng từng bên.',
      ],
      soTay: ['vung-chon', 'dua-than'],
      canh: (st, _k, _d, man) => canhTachNen(st, man),
      giai(st, l) { donNen1(st, l, 30); },
      sai: [
        { ten: 'Quên hai khe tay', loi: 'khe', lam(st, l) { for (const [x, y] of [[20, 20], [160, 30], [14, 60], [10, 170]]) l.dua(st, x, y, 30); } },
        { ten: 'Ngưỡng cao ăn mất bánh', loi: 'an', lam(st, l) { donNen1(st, l, 80); } },
        { ten: 'Ngưỡng thấp còn lốm đốm', loi: 'sot', lam(st, l) { donNen1(st, l, 8); } },
      ],
    },
    {
      ma: 'DH-4-3', ten: 'Đũa thần ăn mất tay', coKhi: 'tach-nen', chay: 'Ghép poster',
      ai: 'sola', mat: 'shocked', vai: 'SOLA NHỜ',
      nho: 'Tay rô bốt màu thép, tường cũng màu thép. Mình chạm đũa thần cái là mất cả hai tay!',
      muc: 'Xóa sạch nền mà vẫn giữ hai tay rô bốt.',
      kieuAnh: 2,
      dau: { ...dauTach, nguong: 25, r: 12 },
      dongHo: [
        { id: 'sot', ten: 'Nền còn', lay: (d) => d.conSot * 100, gomMoc: true, tieu: ['sot'], muc: [
          { den: NEN3.sot, chu: 'Gần sạch', loai: 'dat' },
          { den: 30, chu: 'Còn nhiều', loai: 'xau' },
        ] },
        { id: 'an', ten: 'Rô bốt', lay: (d) => d.anMat * 100, gomMoc: true, tieu: ['tay'], muc: [
          { den: NEN3.anDep, chu: 'Nguyên vẹn', loai: 'dep' },
          { den: NEN3.an, chu: 'Đủ hai tay', loai: 'dat' },
          { den: 8, chu: 'Mất tay', loai: 'xau' },
        ] },
      ],
      sanNhan: 'Ảnh rô bốt có hai tay gần trùng màu tường',
      dan: [
        { txt: 'Dùng đũa thần dọn nền trước, kệ hai cái tay.', xong: (d) => d.conSot < 0.2 },
        { txt: 'Chọn <b>Cọ giữ</b> rồi tô lên phần <b>màu hồng</b>. Cọ chỉ tô lại rô bốt, lem ra tường cũng không sao.', nhan: 'cu-giu', xong: (d) => d.anMat * 100 <= NEN3.an },
        { txt: 'Còn sót nền thì dùng <b>Cọ xóa</b>, đến khi cả hai vạch có dấu xanh.', xong: (d) => d.conSot * 100 <= NEN3.sot },
        { txt: 'Hai vạch đã xanh, bấm <b>Ghép poster</b>.', xong: () => false },
      ],
      tieuChi: [
        { id: 'tay', ok: (d) => d.anMat * 100 <= NEN3.an, ten: 'Còn đủ hai tay', loi: 'Rô bốt lên poster không có tay, trông như đang xin lỗi cả trường.', ai: 'sola', matLoi: 'facepalm' },
        { id: 'sot', ok: (d) => d.conSot * 100 <= NEN3.sot, ten: 'Nền đã sạch', loi: 'Vẫn còn nhiều mảng tường xám bám quanh rô bốt, nền tím bị thủng từng mảng.', ai: 'luna', matLoi: 'worried' },
        { id: 'khit', sao: true, ok: (d) => d.trung >= 0.9, ten: 'Đường viền khít rô bốt' },
        { id: 'du', sao: true, ok: (d) => d.anMat * 100 <= NEN3.anDep, ten: 'Gần như không mất điểm ảnh rô bốt' },
      ],
      goiY: [
        'Đũa thần chỉ biết màu, không biết đâu là tay. Khi màu trùng nhau thì phải dùng tay người.',
        'Vùng chọn sửa được: Cọ giữ lấy lại phần lỡ xóa, Cọ xóa bỏ phần còn sót.',
        'Mỗi tay có hai đoạn: từ vai ra khuỷu, rồi từ khuỷu xuống bàn tay xanh trên bánh xích. Tô hết phần màu hồng, cọ không lem ra tường.',
      ],
      soTay: ['vung-chon', 'mat-na'],
      canh: (st, _k, _d, man) => canhTachNen(st, man),
      giai(st, l) {
        l.dua(st, 12, 12, 25);
        l.dua(st, 12, 170, 25);
        // Miết dọc hai cánh tay tì lên bánh xích, đúng đường đinh tán trong ảnh.
        for (const tay of TAY_ANH) mietTay(st, l, tay);
      },
      sai: [
        { ten: 'Chỉ dùng đũa thần', loi: 'tay', lam(st, l) { l.dua(st, 12, 12, 25); l.dua(st, 12, 170, 25); } },
        { ten: 'Sợ mất tay nên không xóa', loi: 'sot', lam(st, l) { l.dua(st, 12, 170, 12); } },
        { ten: 'Mới giữ một tay', loi: 'tay', lam(st, l) { l.dua(st, 12, 12, 25); l.dua(st, 12, 170, 25); mietTay(st, l, TAY_ANH[0]); } },
      ],
    },
    {
      ma: 'DH-4-4', ten: 'Chữ chìm vào ảnh', coKhi: 'chu-anh', chay: 'Treo thử',
      ai: 'luna', mat: 'worried', vai: 'LUNA NHỜ',
      nho: 'Sola đặt chữ ngay giữa, nhỏ xíu, trắng trên nền lốm đốm. Đứng cách 3 mét thì mình không đọc nổi.',
      muc: 'Chữ tiêu đề đọc được từ xa, không che rô bốt và không chạm mép ảnh.',
      vungCam: { x: 148, y: 62, w: 64, h: 90 },
      dan: [
        { txt: 'Kéo <b>dòng chữ</b> khỏi rô bốt. Gần giữa ảnh hay gần lề nó tự hít.', xong: (d) => !d.cheNguoi },
        { txt: 'Kéo <b>chấm tròn</b> ở đầu chữ cho chữ to lên.', xong: (d) => d.co >= 22 },
        { txt: 'Chọn màu cho vạch <b>Tương phản</b> có dấu xanh.', xong: (d) => d.tuongPhan >= 4.5 },
        { txt: 'Bấm <b>Treo thử</b>. Kim vào phần xanh đậm là đủ sao.', xong: () => false },
      ],
      dau: { x: 180, y: 100, co: 15, mau: 'trang', dai: false },
      dongHo: [
        { id: 'tp', ten: 'Tương phản', lay: (d) => d.tuongPhan, tu: 1, tieu: ['tuong'], muc: [
          { den: 4.5, chu: 'Chìm', loai: 'xau' },
          { den: 7, chu: 'Đọc được', loai: 'dat' },
          { den: 13, chu: 'Rất rõ', loai: 'dep' },
        ] },
        { id: 'co', ten: 'Cỡ chữ', lay: (d) => d.co, tu: 12, tieu: ['co'], muc: [
          { den: 22, chu: 'Nhỏ', loai: 'xau' },
          { den: 28, chu: 'Đủ', loai: 'dat' },
          { den: 40, gom: true, chu: 'To rõ', loai: 'dep' },
        ] },
      ],
      sanNhan: 'Ảnh sân trường có rô bốt ở giữa, chữ tiêu đề nằm đè lên',
      tieuChi: [
        { id: 'che', ok: (d) => !d.cheNguoi, ten: 'Không che rô bốt', loi: 'Chữ che ngang mặt rô bốt, nhân vật chính của poster.', ai: 'sola', matLoi: 'shocked' },
        { id: 'co', ok: (d) => d.co >= 22, ten: 'Đủ cỡ để đọc xa', loi: 'Cỡ chữ quá nhỏ, cách 3 mét nhìn như một vệt mờ.', ai: 'luna', matLoi: 'thinking' },
        { id: 'le', ok: (d) => d.trongLe, ten: 'Trong lề an toàn', loi: 'Chữ sát hoặc tràn mép ảnh, khi in dễ bị xén mất.', ai: 'luna', matLoi: 'worried' },
        { id: 'tuong', ok: (d) => d.tuongPhan >= 4.5, ten: 'Chữ nổi trên nền', loi: 'Chữ chìm vào nền, có đoạn gần như cùng màu với ảnh phía sau.', ai: 'sola', matLoi: 'confused' },
        { id: 'to', sao: true, ok: (d) => d.co >= 28, ten: 'Chữ từ cỡ 28 trở lên' },
        { id: 'ro', sao: true, ok: (d) => d.tuongPhan >= 7, ten: 'Tương phản từ 7:1' },
      ],
      goiY: [
        'Ảnh có vùng sáng đều, vùng tối đều và vùng lốm đốm. Chữ dễ đọc nhất trên vùng đều.',
        'Bầu trời rất sáng thì cần chữ tối. Đám đông phía dưới lốm đốm thì cần dải nền.',
        'Đặt chữ ở trên cao hoặc sát đáy, tránh khoảng giữa có rô bốt, rồi chọn màu ngược với nền.',
      ],
      soTay: ['tuong-phan-chu'],
      canh: (st) => canhChuPoster(st),
      giai(st, l) { l.dat(st, { x: 180, y: 30, co: 30, mau: 'muc', dai: false }); },
      sai: [
        { ten: 'Trắng trên trời sáng', loi: 'tuong', lam(st, l) { l.dat(st, { x: 180, y: 30, co: 30, mau: 'trang' }); } },
        { ten: 'To nhưng che rô bốt', loi: 'che', lam(st, l) { l.dat(st, { x: 180, y: 100, co: 30, mau: 'trang', dai: true }); } },
        { ten: 'Tràn mép', loi: 'le', lam(st, l) { l.dat(st, { x: 60, y: 30, co: 30, mau: 'muc' }); } },
        { ten: 'Đúng chỗ mà nhỏ', loi: 'co', lam(st, l) { l.dat(st, { x: 180, y: 30, co: 15, mau: 'muc' }); } },
      ],
    },
  ],
};
