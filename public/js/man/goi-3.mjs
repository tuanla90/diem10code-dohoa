// Gói 3, bài C10-28: nắn nét, ghép hình, chọn định dạng.
import { canhDuongCo, duongCua, canhHuyHieu, canhXuatTep } from '../canh.mjs';

const goc = (x, y) => ({ x, y, tron: false });
const tron = (x, y, r) => ({ x, y, tron: true, r, v: [-r[0], -r[1]] });

const DAU_DON = [
  { id: 'ao', loai: 'logo', ten: 'Tiệm in áo', yeuCau: 'Logo in lên áo tím, nền tím phải lộ ra' },
  { id: 'bang', loai: 'logo', ten: 'Băng rôn cổng', yeuCau: 'In 3 mét, đứng sát vẫn nét' },
  { id: 'tin', loai: 'anh', ten: 'Nhóm bảng tin', yeuCau: 'Poster có ảnh chụp, nhóm nhận tối đa 5 MB' },
];

export default {
  id: 'goi-3',
  ten: 'Nắn nét và xuất tệp',
  baiHoc: 'C10-28',
  mo: 'Thêm nút, đổi nút trơn, khoét lỗ huy hiệu, chọn đúng định dạng cho từng nơi.',
  loiMo: { ai: 'sola', mat: 'worried', cau: 'Lá cờ của mình cứng đơ, huy hiệu không xỏ được dây, logo lên áo thì lộ khung trắng. Cứu với.' },
  man: [
    {
      ma: 'DH-3-1', ten: 'Cờ đuôi nheo', coKhi: 'nut-net', chay: 'Kéo cờ',
      ai: 'sola', mat: 'confident', vai: 'SOLA NHỜ',
      nho: 'Cờ của đội cần đuôi nheo mà mình mới vẽ được hình chữ nhật. Có cách nào không phải vẽ lại không?',
      muc: 'Nắn lá cờ theo đường nét đứt, không vẽ lại từ đầu.',
      dau: { nut: [goc(52, 50), goc(310, 50), goc(310, 210), goc(52, 210)], chon: null },
      mau: [goc(52, 50), goc(310, 50), goc(230, 130), goc(310, 210), goc(52, 210)],
      sanNhan: 'Lá cờ chữ nhật và đường nét đứt hình đuôi nheo',
      dan: [
        { txt: 'Bấm <b>Thêm nút</b>, dấu cộng xanh hiện giữa mỗi cạnh.', nhan: 'them', xong: (d) => d.soNut > 4 },
        { txt: 'Thấy nút mới ở mép phải chưa? <b>Kéo nó</b> sang trái tới góc nét đứt.', xong: (d) => d.lech <= 12 },
        { txt: 'Bấm <b>Kéo cờ</b>.', xong: () => false },
      ],
      tieuChi: [
        { id: 'hinh', ok: (d) => d.lech <= 12, ten: 'Đúng hình đuôi nheo', loi: 'Cờ kéo lên vẫn không phải đuôi nheo, thầy phụ trách hỏi lại đây là cờ đội nào.', ai: 'sola', matLoi: 'confused' },
        { id: 'sat', sao: true, ok: (d) => d.lech <= 5, ten: 'Sát đường nét đứt' },
        { id: 'gon', sao: true, ok: (d) => d.soNut === 5, ten: 'Đúng 5 nút, không thừa' },
      ],
      goiY: [
        'Hình chữ nhật có 4 nút. Đuôi nheo có 5. Vậy thiếu một nút ở đâu?',
        'Nút mới phải sinh ra ở cạnh bên phải, cạnh có đuôi.',
        'Đưa nút mới vào gần góc nét đứt, nó sẽ tự hít vào đúng chỗ.',
      ],
      soTay: ['nut-neo'],
      canh: (st) => canhDuongCo(duongCua(st), false),
      giai(st, l) { l.them(st, 1); l.dat(st, 2, 230, 130); },
      sai: [
        { ten: 'Còn nguyên chữ nhật', loi: 'hinh', lam() {} },
        { ten: 'Thêm nút mà chưa kéo', loi: 'hinh', lam(st, l) { l.them(st, 1); } },
      ],
    },
    {
      ma: 'DH-3-2', ten: 'Lá cờ cứng đơ', coKhi: 'nut-net', chay: 'Kéo cờ',
      ai: 'luna', mat: 'thinking', vai: 'LUNA NHỜ',
      nho: 'Cờ trên poster nhìn như tấm bảng gỗ. Mình muốn mép cờ uốn sóng, nhưng nút góc chỉ tạo đoạn thẳng.',
      muc: 'Biến mép trên và dưới thành đường sóng theo nét đứt, giữ nguyên 6 nút.',
      dau: { nut: [goc(52, 60), goc(180, 60), goc(310, 60), goc(310, 210), goc(180, 210), goc(52, 210)], chon: 1 },
      mau: [goc(52, 60), tron(180, 60, [68, -48]), goc(310, 60), goc(310, 210), tron(180, 210, [-68, 48]), goc(52, 210)],
      san: { coTron: true },
      sanNhan: 'Lá cờ thẳng và đường nét đứt uốn sóng',
      dan: [
        { txt: 'Nút giữa mép trên đang chọn. Bấm <b>Nút trơn</b> cho nó có tay nắm.', nhan: 'tron', xong: (d) => d.soTron >= 1 },
        { txt: 'Kéo <b>chấm hồng</b> xiên lên phải cho mép cong theo nét đứt. Làm tương tự với nút giữa mép dưới.', xong: (d) => d.soTron >= 2 && d.lech <= 10 },
        { txt: 'Bấm <b>Kéo cờ</b>.', xong: () => false },
      ],
      tieuChi: [
        { id: 'song', ok: (d) => d.lech <= 10, ten: 'Mép cờ uốn sóng', loi: 'Cờ vẫn cứng đơ một chỗ, đoạn đó không khớp đường sóng. Gió thổi mà cờ không nhúc nhích.', ai: 'sola', matLoi: 'facepalm' },
        { id: 'gon', sao: true, ok: (d) => d.soNut === 6, ten: 'Vẫn 6 nút' },
        { id: 'sat', sao: true, ok: (d) => d.lech <= 5, ten: 'Sát đường nét đứt' },
      ],
      goiY: [
        'Nút vuông là nút góc: hai đoạn đến và đi đều thẳng. Nút tròn mới có tay nắm uốn cong.',
        'Tay nắm dài thì đường cong mạnh, nghiêng thì đường cong lệch về một phía. Hai đầu tay nắm luôn thẳng hàng.',
        'Mép trên kéo chấm hồng bên phải lên trên. Mép dưới đi theo chiều ngược, chấm hồng bên phải cũng kéo lên.',
      ],
      soTay: ['nut-neo', 'bezier'],
      canh: (st, ket) => canhDuongCo(duongCua(st), !ket.dat),
      giai(st, l) { l.tron(st, 1, true); l.tay(st, 1, 68, -48); l.tron(st, 4, true); l.tay(st, 4, -68, 48); },
      sai: [
        { ten: 'Bật trơn mà chưa nắn', loi: 'song', lam(st, l) { l.tron(st, 1, true); l.tron(st, 4, true); } },
        { ten: 'Chỉ sửa mép trên', loi: 'song', lam(st, l) { l.tron(st, 1, true); l.tay(st, 1, 68, -48); } },
      ],
    },
    {
      ma: 'DH-3-3', ten: 'Huy hiệu khoét lỗ', coKhi: 'ghep-hinh', chay: 'Xỏ dây',
      ai: 'sola', mat: 'worried', vai: 'SOLA NHỜ',
      nho: 'Mình đặt vòng tròn trắng lên huy hiệu để giả làm lỗ. In ra lỗ đặc, dây đeo không xỏ được.',
      muc: 'Làm huy hiệu theo bóng mờ: có tai móc, lỗ xỏ dây thật và sao khoét rỗng.',
      dau: {
        buoc: [{ phep: 'gop', hinh: { loai: 'tron', x: 180, y: 172, r: 88 } }],
        hinh: [
          { id: 'moc', ten: 'Tai móc', loai: 'vuong', w: 44, h: 48, x: 44, y: 44, dx: 180, dy: 72 },
          { id: 'lo', ten: 'Lỗ tròn', loai: 'tron', r: 10, x: 316, y: 40, dx: 180, dy: 70 },
          { id: 'sao', ten: 'Ngôi sao', loai: 'sao', r: 46, x: 310, y: 252, dx: 180, dy: 172 },
        ],
        chon: 'moc',
      },
      dichBuoc: [
        { phep: 'gop', hinh: { loai: 'tron', x: 180, y: 172, r: 88 } },
        { phep: 'gop', hinh: { loai: 'vuong', w: 44, h: 48, x: 180, y: 72 } },
        { phep: 'khoet', hinh: { loai: 'tron', r: 10, x: 180, y: 70 } },
        { phep: 'khoet', hinh: { loai: 'sao', r: 46, x: 180, y: 172 } },
      ],
      dungKiem: { lo: { x: 180, y: 70, r: 10 }, sao: { x: 180, y: 172 } },
      sanNhan: 'Hình tròn huy hiệu, bóng mờ thành phẩm và ba hình rời',
      dan: [
        { txt: 'Kéo <b>Tai móc</b> lên đỉnh huy hiệu, rồi bấm <b>Gộp vào</b>.', nhan: 'gop', xong: (_d, st) => st.buoc.length >= 2 },
        { txt: 'Làm tiếp với hai hình còn lại. Thứ tự làm có ý nghĩa đó.', xong: (d) => d.conThua === 0 },
        { txt: 'Bấm <b>Xỏ dây</b>.', xong: () => false },
      ],
      tieuChi: [
        { id: 'lo', ok: (d) => d.coLo, ten: 'Có lỗ xỏ dây thật', loi: 'Dây đeo không xỏ qua được: chỗ lỗ đang đặc hoặc lỗ hở ra mép.', ai: 'sola', matLoi: 'shocked' },
        { id: 'sao', ok: (d) => d.saoKhoet, ten: 'Sao rỗng ở giữa', loi: 'Giữa huy hiệu chưa có ngôi sao rỗng, đặt lên áo không thấy màu áo xuyên qua.', ai: 'luna', matLoi: 'thinking' },
        { id: 'hinh', ok: (d) => d.trung >= 0.92, ten: 'Đúng hình', loi: 'Hình còn khác bóng mờ nhiều quá, có mảnh chưa đúng chỗ hoặc đã dùng sai phép.', ai: 'luna', matLoi: 'confused' },
        { id: 'khit', sao: true, ok: (d) => d.trung >= 0.97, ten: 'Khớp bóng mờ gần tuyệt đối' },
      ],
      goiY: [
        'Vòng tròn trắng chỉ là tô màu đè lên, vật liệu bên dưới vẫn còn. Khoét mới là bỏ hẳn phần đó đi.',
        'Lỗ nằm trong tai móc. Nếu khoét lỗ trước rồi mới gộp tai móc, tai móc sẽ lấp lại đúng chỗ lỗ.',
        'Thứ tự: Tai móc gộp vào, Lỗ tròn khoét đi, Ngôi sao khoét đi. Sai thì Hoàn tác, không mất gì.',
      ],
      soTay: ['ghep-hinh'],
      canh: (st, _k, d) => canhHuyHieu(st, d),
      giai(st, l) {
        l.dat(st, 'moc', 180, 72); l.ap(st, 'moc', 'gop');
        l.dat(st, 'lo', 180, 70); l.ap(st, 'lo', 'khoet');
        l.dat(st, 'sao', 180, 172); l.ap(st, 'sao', 'khoet');
      },
      sai: [
        { ten: 'Khoét lỗ trước, gộp tai móc sau', loi: 'lo', lam(st, l) {
          l.dat(st, 'lo', 180, 70); l.ap(st, 'lo', 'khoet');
          l.dat(st, 'moc', 180, 72); l.ap(st, 'moc', 'gop');
          l.dat(st, 'sao', 180, 172); l.ap(st, 'sao', 'khoet');
        } },
        { ten: 'Giữ phần chung thay vì khoét sao', loi: 'lo', lam(st, l) {
          l.dat(st, 'moc', 180, 72); l.ap(st, 'moc', 'gop');
          l.dat(st, 'sao', 180, 172); l.ap(st, 'sao', 'giao');
        } },
        { ten: 'Chưa khoét sao', loi: 'sao', lam(st, l) {
          l.dat(st, 'moc', 180, 72); l.ap(st, 'moc', 'gop');
          l.dat(st, 'lo', 180, 70); l.ap(st, 'lo', 'khoet');
        } },
      ],
    },
    {
      ma: 'DH-3-4', ten: 'Khung trắng trên áo tím', coKhi: 'xuat-tep', chay: 'Gửi cả ba',
      ai: 'luna', mat: 'worried', vai: 'LUNA NHỜ',
      nho: 'Năm ngoái một tệp dùng cho mọi chỗ: lên áo tím lộ khung trắng, lên băng rôn vỡ ô, gửi bảng tin thì nặng 11 MB.',
      muc: 'Xuất mỗi nơi một định dạng hợp với nơi đó.',
      don: DAU_DON,
      dau: { don: { ao: { dd: 'jpg', cl: 90 }, bang: { dd: 'jpg', cl: 90 }, tin: { dd: 'png', cl: 90 } }, chon: 'ao' },
      sanNhan: 'Ba đơn hàng cần xuất tệp',
      tieuChi: [
        { id: 'ao', ok: (d) => d.ao.dd !== 'jpg', ten: 'Áo không lộ khung', loi: 'Logo lên áo tím có nguyên ô vuông trắng bao quanh. JPG không có nền trong suốt.', ai: 'sola', matLoi: 'shocked' },
        { id: 'bang', ok: (d) => d.bang.dd === 'svg', ten: 'Băng rôn nét', loi: 'Băng rôn 3 mét lại vỡ ô y như năm ngoái. Nơi phóng lớn phải dùng loại tệp không có ô điểm ảnh.', ai: 'sola', matLoi: 'facepalm' },
        { id: 'tin', ok: (d) => d.tin.mb <= 5, ten: 'Poster gửi được', loi: 'Nhóm bảng tin từ chối vì tệp quá 5 MB. Poster có ảnh chụp nên PNG và SVG đều nặng.', ai: 'luna', matLoi: 'worried' },
        { id: 'lem', ok: (d) => d.tin.dd !== 'jpg' || d.tin.cl >= 60, ten: 'Chữ poster không lem', loi: 'Tệp nhẹ thật, nhưng ép quá tay làm chữ trên poster nhòe như bị ướt.', ai: 'sola', matLoi: 'confused' },
        { id: 'nhe', sao: true, ok: (d) => d.tin.mb <= 3, ten: 'Poster dưới 3 MB, tải nhanh trên điện thoại' },
        { id: 'dep', sao: true, ok: (d) => d.tin.dd === 'jpg' && d.tin.cl >= 70, ten: 'Chất lượng JPG từ 70% trở lên' },
      ],
      goiY: [
        'Ba nơi, ba yêu cầu khác nhau. Không có một định dạng nào hợp cả ba.',
        'JPG hợp với ảnh chụp vì nén rất tốt, nhưng không có nền trong suốt và không phóng lớn được.',
        'Poster dùng JPG, kéo chất lượng tới khi tệp dưới 3 MB mà chưa dưới 70%.',
      ],
      soTay: ['dinh-dang', 'anh-diem', 'vector'],
      canh: (st, _k, _d, man) => canhXuatTep(st, man),
      giai(st, l) { l.dd(st, 'ao', 'png'); l.dd(st, 'bang', 'svg'); l.dd(st, 'tin', 'jpg'); l.cl(st, 'tin', 75); },
      sai: [
        { ten: 'Một tệp JPG cho tất cả', loi: 'ao', lam(st, l) { l.dd(st, 'tin', 'jpg'); } },
        { ten: 'PNG cho băng rôn', loi: 'bang', lam(st, l) { l.dd(st, 'ao', 'png'); l.dd(st, 'bang', 'png'); l.dd(st, 'tin', 'jpg'); } },
        { ten: 'Poster giữ PNG', loi: 'tin', lam(st, l) { l.dd(st, 'ao', 'png'); l.dd(st, 'bang', 'svg'); } },
        { ten: 'Ép JPG quá tay', loi: 'lem', lam(st, l) { l.dd(st, 'ao', 'png'); l.dd(st, 'bang', 'svg'); l.dd(st, 'tin', 'jpg'); l.cl(st, 'tin', 30); } },
      ],
    },
  ],
};
