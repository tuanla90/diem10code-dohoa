// Gói 4, bài U11-09 đến U11-12: bộ ảnh hội trường. Chấm trên điểm ảnh thật.
import { canhAnhHoiTruong, canhTachNen, canhChuPoster } from '../canh.mjs';

const dauTach = { thao: [], cheDo: 'dua', nguong: 10, r: 8 };

// Sáu lần chạm đũa thần dọn nền ảnh 1.
export function donNen1(st, l, nguong = 30) {
  for (const [x, y] of [[20, 20], [160, 30], [14, 90], [20, 170], [61, 75], [119, 75]]) l.dua(st, x, y, nguong);
}

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
      sanNhan: 'Ảnh hội trường chụp thiếu sáng',
      dan: [{ txt: 'Biểu đồ dưới ảnh cho biết độ sáng các điểm: lệch trái là tối. Vạch đỏ hai đầu là mất chi tiết.', xong: (d) => d.tb > 90 }],
      tieuChi: [
        { id: 'toi', ok: (d) => d.tb >= 88, ten: 'Đủ sáng', loi: 'Chiếu lên màn vẫn tối mờ, hàng ghế cuối hỏi có ảnh hay chưa.', ai: 'sola', matLoi: 'confused' },
        { id: 'chay', ok: (d) => d.chay <= 0.03, ten: 'Cửa sổ còn chi tiết', loi: 'Sáng quá tay, vùng cửa sổ cháy trắng, mất luôn khung cửa.', ai: 'luna', matLoi: 'worried' },
        { id: 'cham', ok: (d) => d.tb <= 165, ten: 'Không quá sáng', loi: 'Cả ảnh trắng bệch, mặt mọi người nhợt đi.', ai: 'sola', matLoi: 'shocked' },
        { id: 'gian', ok: (d) => d.gian >= 110, ten: 'Có độ tương phản', loi: 'Ảnh sáng rồi mà xám xịt, không có chỗ đậm chỗ nhạt nên trông như bị phủ sương.', ai: 'luna', matLoi: 'thinking' },
        { id: 'chim', ok: (d) => d.chim <= 0.06, ten: 'Vùng tối còn chi tiết', loi: 'Tương phản quá tay, áo và hàng ghế đen kịt, mất hết chi tiết.', ai: 'sola', matLoi: 'facepalm' },
        { id: 'trai', sao: true, ok: (d) => d.gian >= 125, ten: 'Biểu đồ trải rộng' },
        { id: 'giu', sao: true, ok: (d) => d.chay <= 0.02 && d.chim <= 0.02, ten: 'Hai đầu không mất chi tiết' },
      ],
      goiY: [
        'Nhìn biểu đồ: các cột dồn hết về bên trái. Ảnh đẹp thường có cột trải khắp bề ngang.',
        'Chỉ tăng Độ sáng thì cột dịch sang phải nhưng vẫn chụm lại. Tương phản mới giãn chúng ra.',
        'Tăng sáng trước đến khi ảnh rõ, rồi tăng tương phản vừa đủ. Vạch đỏ hiện là đã quá tay.',
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
      ma: 'DH-4-2', ten: 'Tách rô bốt khỏi nền', coKhi: 'tach-nen', chay: 'Ghép poster',
      ai: 'luna', mat: 'thinking', vai: 'LUNA NHỜ',
      nho: 'Ảnh rô bốt chụp ở phòng tin, nền bừa bộn. Poster nền tím thì không thể để nguyên bức tường đó.',
      muc: 'Xóa hết nền, giữ nguyên rô bốt. Nền kiểu gì cũng phải sạch.',
      kieuAnh: 1, co: false,
      dau: { ...dauTach },
      sanNhan: 'Ảnh rô bốt trên nền nhiều mảng màu',
      dan: [
        { txt: 'Chạm vào <b>bức tường</b>. Còn lốm đốm thì tăng <b>Ngưỡng</b> rồi chạm lại.', xong: (_d, st) => st.thao.length >= 2 },
        { txt: 'Mỗi mảng màu chạm một lần. Soi cả những chỗ bị bao kín nữa.', xong: (d) => d.conSot < 0.05 },
        { txt: 'Sạch rồi thì bấm <b>Ghép poster</b>.', xong: () => false },
      ],
      tieuChi: [
        { id: 'an', ok: (d) => d.anMat <= 0.04, ten: 'Rô bốt nguyên vẹn', loi: 'Ngưỡng cao quá, đũa thần ăn luôn một phần rô bốt. Lên poster rô bốt cụt chân.', ai: 'sola', matLoi: 'shocked' },
        { id: 'khe', ok: (d) => d.kheTrai && d.khePhai, ten: 'Sạch cả khe tay', loi: 'Khe giữa tay và thân vẫn còn nguyên miếng tường kem. Lên nền tím nhìn rõ mồn một.', ai: 'luna', matLoi: 'worried' },
        { id: 'sot', ok: (d) => d.conSot <= 0.04, ten: 'Nền đã sạch', loi: 'Nền còn sót nhiều mảng, ghép lên poster như có miếng dán chưa bóc.', ai: 'sola', matLoi: 'facepalm' },
        { id: 'sach', sao: true, ok: (d) => d.conSot <= 0.01, ten: 'Gần như không còn hạt nền' },
        { id: 'khit', sao: true, ok: (d) => d.trung >= 0.97, ten: 'Đường viền khít rô bốt' },
      ],
      goiY: [
        'Đũa thần loang từ điểm chạm ra các điểm có màu gần giống, và dừng lại ở vùng khác màu.',
        'Ngưỡng thấp để lại lốm đốm, ngưỡng rất cao thì lan sang cả rô bốt. Tìm mức ở giữa.',
        'Đũa thần không vượt qua được tay rô bốt, nên khe giữa tay và thân phải chạm riêng từng bên.',
      ],
      soTay: ['vung-chon', 'dua-than'],
      canh: (st, _k, _d, man) => canhTachNen(st, man),
      giai(st, l) { donNen1(st, l, 30); },
      sai: [
        { ten: 'Quên hai khe tay', loi: 'khe', lam(st, l) { for (const [x, y] of [[20, 20], [160, 30], [14, 90], [20, 170]]) l.dua(st, x, y, 30); } },
        { ten: 'Ngưỡng cao ăn mất chân', loi: 'an', lam(st, l) { donNen1(st, l, 80); } },
        { ten: 'Ngưỡng thấp còn lốm đốm', loi: 'sot', lam(st, l) { donNen1(st, l, 8); } },
      ],
    },
    {
      ma: 'DH-4-3', ten: 'Đũa thần ăn mất tay', coKhi: 'tach-nen', chay: 'Ghép poster',
      ai: 'sola', mat: 'shocked', vai: 'SOLA NHỜ',
      nho: 'Tay rô bốt màu thép, tường cũng màu thép. Mình chạm đũa thần cái là mất cả hai tay!',
      muc: 'Xóa sạch nền mà vẫn giữ hai tay rô bốt.',
      kieuAnh: 2,
      dau: { ...dauTach, nguong: 25 },
      sanNhan: 'Ảnh rô bốt có hai tay gần trùng màu tường',
      dan: [
        { txt: 'Dùng đũa thần dọn nền trước, kệ hai cái tay.', xong: (d) => d.conSot < 0.2 },
        { txt: 'Bấm <b>Cọ giữ</b> rồi tô dọc hai cánh tay để lấy chúng về.', nhan: 'coGiu', xong: (d) => d.anMat < 0.1 },
        { txt: 'Lem ra ngoài thì <b>Cọ xóa</b> lại. Xong bấm <b>Ghép poster</b>.', xong: () => false },
      ],
      tieuChi: [
        { id: 'tay', ok: (d) => d.anMat <= 0.1, ten: 'Còn đủ hai tay', loi: 'Rô bốt lên poster không có tay, trông như đang xin lỗi cả trường.', ai: 'sola', matLoi: 'facepalm' },
        { id: 'sot', ok: (d) => d.conSot <= 0.06, ten: 'Nền đã sạch', loi: 'Vẫn còn nhiều mảng tường xám bám quanh rô bốt, nền tím bị thủng từng mảng.', ai: 'luna', matLoi: 'worried' },
        { id: 'khit', sao: true, ok: (d) => d.trung >= 0.9, ten: 'Đường viền khít rô bốt' },
        { id: 'du', sao: true, ok: (d) => d.anMat <= 0.03, ten: 'Gần như không mất điểm ảnh rô bốt' },
      ],
      goiY: [
        'Đũa thần chỉ biết màu, không biết đâu là tay. Khi màu trùng nhau thì phải dùng tay người.',
        'Vùng chọn sửa được: Cọ giữ lấy lại phần lỡ xóa, Cọ xóa bỏ phần còn sót.',
        'Cỡ cọ khoảng 5 tô dọc cánh tay, rồi tô ngang chỗ vai và cổ tay. Đừng sợ lem, sửa lại được.',
      ],
      soTay: ['vung-chon', 'mat-na'],
      canh: (st, _k, _d, man) => canhTachNen(st, man),
      giai(st, l) {
        l.dua(st, 12, 12, 25);
        l.dua(st, 12, 170, 25);
        const doc = (x) => Array.from({ length: 30 }, (_, i) => [x, 46 + i * 2]);
        l.co(st, true, 5, doc(50));
        l.co(st, true, 5, doc(51));
        l.co(st, true, 5, doc(128));
        l.co(st, true, 5, doc(129));
        l.co(st, true, 4, [[50, 48], [55, 48], [60, 48], [64, 48], [50, 104], [55, 104], [60, 104], [64, 104]]);
        l.co(st, true, 4, [[116, 48], [120, 48], [125, 48], [130, 48], [116, 104], [120, 104], [125, 104], [130, 104]]);
        // Dọn phần cọ lem ra ngoài cánh tay.
        l.co(st, false, 3, Array.from({ length: 22 }, (_, i) => [43, 46 + i * 3]));
        l.co(st, false, 3, Array.from({ length: 22 }, (_, i) => [137, 46 + i * 3]));
        l.co(st, false, 3, Array.from({ length: 22 }, (_, i) => [61, 56 + i * 2]));
        l.co(st, false, 3, Array.from({ length: 22 }, (_, i) => [119, 56 + i * 2]));
      },
      sai: [
        { ten: 'Chỉ dùng đũa thần', loi: 'tay', lam(st, l) { l.dua(st, 12, 12, 25); l.dua(st, 12, 170, 25); } },
        { ten: 'Sợ mất tay nên không xóa', loi: 'sot', lam(st, l) { l.dua(st, 12, 170, 12); } },
      ],
    },
    {
      ma: 'DH-4-4', ten: 'Chữ chìm vào ảnh', coKhi: 'chu-anh', chay: 'Treo thử',
      ai: 'luna', mat: 'worried', vai: 'LUNA NHỜ',
      nho: 'Sola đặt chữ ngay giữa, nhỏ xíu, trắng trên nền lốm đốm. Đứng cách 3 mét thì mình không đọc nổi.',
      muc: 'Chữ tiêu đề đọc được từ xa, không che rô bốt và không chạm mép ảnh.',
      vungCam: { x: 150, y: 62, w: 60, h: 92 },
      dau: { x: 180, y: 100, co: 15, mau: 'trang', dai: false },
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
