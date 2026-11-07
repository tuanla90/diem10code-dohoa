// Gói 3, bài C10-28: nắn nét, ghép hình, chọn định dạng.
import { canhDuongCo, duongCua, canhHuyHieu, canhKhien, canhXuatTep } from '../canh.mjs';

const goc = (x, y) => ({ x, y, tron: false });
const tron = (x, y, r) => ({ x, y, tron: true, r, v: [-r[0], -r[1]] });

// Khiên trong icon An toàn mạng, phóng đúng 4 lần so với hd3 ở hinh.mjs. Hai hình tròn lệch nhau cho mũi khiên cong đều hai bên.
const KHIEN = {
  a: { loai: 'tron', x: 153, y: 150, r: 123 },
  b: { loai: 'tron', x: 207, y: 150, r: 123 },
  vai: { loai: 'vuong', w: 192, h: 120, x: 180, y: 90 },
  tich: { loai: 'da-giac', x: 182, y: 155, dinh: [[-54.5, 3.5], [-13.7, 44.3], [54.8, -28.8], [37.2, -45.2], [-14.3, 9.7], [-37.5, -13.5]] },
};
const datHet = (st, l, ...viec) => { for (const [id, phep] of viec) { const h = KHIEN[id]; l.dat(st, id, h.x, h.y); l.ap(st, id, phep); } };
const laKhien = (d) => !d.co.ngoaiTrai && !d.co.ngoaiPhai && d.co.mui;

const DAU_DON = [
  { id: 'ao', loai: 'logo', ten: 'Tiệm in áo', yeuCau: 'Logo in lên áo tím, nền tím phải lộ ra' },
  { id: 'bang', loai: 'logo', ten: 'Băng rôn cổng', yeuCau: 'In 3 mét, đứng sát vẫn nét' },
  { id: 'tin', loai: 'anh', ten: 'Nhóm bảng tin', yeuCau: 'Poster có ảnh chụp, nhóm nhận tối đa 5 MB' },
];

export default {
  id: 'goi-3',
  ten: 'Nắn nét và xuất tệp',
  baiHoc: 'C10-28',
  mo: 'Thêm nút, đổi nút trơn, khoét lỗ huy hiệu, lấy phần chung dựng lại icon khiên, chọn đúng định dạng cho từng nơi.',
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
        { txt: 'Chạm <b>dấu cộng xanh</b> ở mép phải để có thêm một nút.', xong: (d) => d.soNut > 4 },
        { txt: 'Kéo nút mới sang trái tới góc nét đứt. Gần tới nó tự hít. Lỡ thừa nút thì chọn nút đó rồi bấm <b>Xóa nút</b>.', xong: (d) => d.lech <= 12 },
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
        { txt: 'Nút giữa mép trên đang được chọn. Bấm <b>Nút trơn</b> cho nó có tay nắm.', nhan: 'tron', xong: (d) => d.soTron >= 1 },
        { txt: 'Kéo <b>chấm hồng</b> xiên lên phải cho mép cong theo nét đứt, gần đúng nó tự hít. Rồi chạm nút giữa mép dưới và làm tương tự.', xong: (d) => d.soTron >= 2 && d.lech <= 10 },
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
        { txt: 'Kéo <b>Tai móc</b> lên đỉnh huy hiệu, gần đúng nó tự hít. Rồi bấm <b>Gộp vào</b>.', nhan: 'gop', xong: (_d, st) => st.buoc.length >= 2 },
        { txt: 'Hình tiếp theo đã được chọn sẵn. Đặt nó vào chỗ rồi bấm lệnh phù hợp. Thứ tự làm có ý nghĩa đó.', xong: (d) => d.conThua === 0 },
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
    // Mã DH-3-5 đứng trước DH-3-4 vì màn được thêm sau: tiến độ đã lưu theo mã nên không đổi mã cũ.
    {
      ma: 'DH-3-5', ten: 'Khiên An toàn mạng', coKhi: 'ghep-hinh', chay: 'Gắn biển',
      ai: 'luna', mat: 'thinking', vai: 'LUNA NHỜ',
      nho: 'Icon An toàn mạng phải in to làm biển gian hàng. Mình nắn nút mãi mà mũi khiên hai bên vẫn lệch. Thợ in bảo dùng hai hình tròn là cong đều ngay.',
      muc: 'Vẽ lại khiên trong icon An toàn mạng, khớp đúng nét đứt.',
      dau: {
        buoc: [{ phep: 'gop', hinh: { ...KHIEN.a } }],
        hinh: [
          { id: 'b', ten: 'Hình tròn thứ hai', loai: 'tron', r: 123, x: 262, y: 170, dx: KHIEN.b.x, dy: KHIEN.b.y },
          { id: 'vai', ten: 'Vai khiên', loai: 'vuong', w: 192, h: 120, x: 246, y: 245, dx: KHIEN.vai.x, dy: KHIEN.vai.y },
          { id: 'tich', ten: 'Dấu tích', loai: 'da-giac', dinh: KHIEN.tich.dinh, x: 56, y: 248, dx: KHIEN.tich.x, dy: KHIEN.tich.y },
        ],
        chon: 'b',
      },
      dichBuoc: [
        { phep: 'gop', hinh: { ...KHIEN.a } },
        { phep: 'giao', hinh: { ...KHIEN.b } },
        { phep: 'gop', hinh: { ...KHIEN.vai } },
        { phep: 'khoet', hinh: { ...KHIEN.tich } },
      ],
      dungKiem: { lo: { x: 168, y: 180, r: 20 }, diem: { ngoaiTrai: [50, 150], ngoaiPhai: [310, 150], mui: [180, 250], vaiTrai: [95, 45], vaiPhai: [265, 45], canhTich: [215, 125] } },
      netDich: 'M84 30H276V150A123 123 0 0 1 180 270A123 123 0 0 1 84 150ZM127.5 158.5L168.3 199.3L236.8 126.2L219.2 109.8L167.7 164.7L144.5 141.5Z',
      sanNhan: 'Một hình tròn, nét đứt hình khiên có dấu tích và ba hình rời',
      dan: [
        { txt: 'Kéo <b>hình tròn thứ hai</b> cho mũi phần trùng khớp mũi khiên, rồi bấm <b>Giữ chung</b>.', nhan: 'giao', xong: laKhien },
        { txt: 'Vai khiên đã gộp trước nên bị Giữ chung cắt mất rồi. Bấm <b>Hoàn tác</b> và giữ chung trước.', xong: (d, st) => (d.co.vaiTrai && d.co.vaiPhai) || st.hinh.some((h) => h.id === 'vai') },
        { txt: 'Kéo <b>Vai khiên</b> vào nét đứt rồi bấm lệnh để thêm nó vào hình.', nhan: 'gop', xong: (d) => d.co.vaiTrai && d.co.vaiPhai },
        { txt: 'Đặt <b>Dấu tích</b> vào giữa khiên, bấm lệnh để nền xanh của icon lộ qua.', nhan: 'khoet', xong: (d) => d.coLo && !d.co.canhTich },
        { txt: 'Bấm <b>Gắn biển</b>.', xong: () => false },
      ],
      tieuChi: [
        { id: 'khien', ok: laKhien, ten: 'Mũi khiên cong đều', loi: 'Hình này chẳng giống khiên. Gộp là cộng hai hình lại, Khoét là bỏ phần đè lên. Muốn lấy đúng chỗ trùng nhau phải Giữ chung.', ai: 'luna', matLoi: 'thinking' },
        { id: 'vai', ok: (d) => d.co.vaiTrai && d.co.vaiPhai, ten: 'Khiên có hai vai', loi: 'Khiên mất vai, nhìn như cái lá. Nếu đã gộp vai trước khi Giữ chung thì nó bị cắt rồi, vì Giữ chung bỏ hết mọi thứ ngoài phần trùng.', ai: 'sola', matLoi: 'shocked' },
        { id: 'tich', ok: (d) => d.coLo && !d.co.canhTich, ten: 'Dấu tích rỗng', loi: 'Dấu tích chưa rỗng trọn vẹn. Khoét mà làm trước khi gộp vai thì vai lấp mất một cánh tích, nên việc khoét để sau cùng.', ai: 'sola', matLoi: 'confused' },
        { id: 'hinh', ok: (d) => d.trung >= 0.92, ten: 'Đúng hình', loi: 'Khiên còn khác nét đứt nhiều quá, có hình chưa đúng chỗ.', ai: 'luna', matLoi: 'worried' },
        { id: 'khit', sao: true, ok: (d) => d.trung >= 0.97, ten: 'Khít nét đứt' },
        { id: 'sat', sao: true, ok: (d) => d.trung >= 0.995, ten: 'Trùng khít với icon gốc' },
      ],
      goiY: [
        'Hai hình tròn lệch nhau thì phần trùng nhau có hai mũi nhọn, cong đều hai bên. Lệnh nào chỉ để lại phần trùng?',
        'Giữ chung bỏ mọi thứ nằm ngoài hình vừa áp, kể cả những gì đã gộp từ trước. Vậy vai khiên nên gộp trước hay sau?',
        'Thứ tự: Hình tròn thứ hai giữ chung, Vai khiên gộp vào, Dấu tích khoét đi. Sai thì Hoàn tác, không mất gì.',
      ],
      soTay: ['ghep-hinh'],
      canh: (st, ket, d) => canhKhien(st, d, ket.dat),
      giai(st, l) { datHet(st, l, ['b', 'giao'], ['vai', 'gop'], ['tich', 'khoet']); },
      sai: [
        { ten: 'Gộp hai hình tròn', loi: 'khien', lam(st, l) { datHet(st, l, ['b', 'gop'], ['vai', 'gop'], ['tich', 'khoet']); } },
        { ten: 'Khoét hình tròn thứ hai', loi: 'khien', lam(st, l) { datHet(st, l, ['b', 'khoet'], ['vai', 'gop'], ['tich', 'khoet']); } },
        { ten: 'Gộp vai trước khi giữ chung', loi: 'vai', lam(st, l) { datHet(st, l, ['vai', 'gop'], ['b', 'giao'], ['tich', 'khoet']); } },
        { ten: 'Khoét dấu tích trước khi gộp vai', loi: 'tich', lam(st, l) { datHet(st, l, ['b', 'giao'], ['tich', 'khoet'], ['vai', 'gop']); } },
        { ten: 'Gộp dấu tích thay vì khoét', loi: 'tich', lam(st, l) { datHet(st, l, ['b', 'giao'], ['vai', 'gop'], ['tich', 'gop']); } },
      ],
    },
    {
      ma: 'DH-3-4', ten: 'Khung trắng trên áo tím', coKhi: 'xuat-tep', chay: 'Gửi cả ba',
      ai: 'luna', mat: 'worried', vai: 'LUNA NHỜ',
      nho: 'Năm ngoái một tệp dùng cho mọi chỗ: lên áo tím lộ khung trắng, lên băng rôn vỡ ô, gửi bảng tin thì nặng 11 MB.',
      muc: 'Xuất mỗi nơi một định dạng hợp với nơi đó.',
      don: DAU_DON,
      dau: { don: { ao: { dd: 'jpg', cl: 90 }, bang: { dd: 'jpg', cl: 90 }, tin: { dd: 'png', cl: 90 } }, chon: 'ao' },
      dongHo: [
        { id: 'mb', ten: 'Dung lượng', lay: (d) => d.tin.mb, gomMoc: true, tieu: ['tin'], muc: [
          { den: 3, chu: 'Nhẹ', loai: 'dep' },
          { den: 5, chu: 'Gửi được', loai: 'dat' },
          { den: 12, chu: 'Quá nặng', loai: 'xau' },
        ] },
        { id: 'net', ten: 'Độ nét chữ', lay: (d) => d.tin.cl, tu: 10, tieu: ['lem'], muc: [
          { den: 60, chu: 'Chữ lem', loai: 'xau' },
          { den: 70, chu: 'Tạm được', loai: 'dat' },
          { den: 100, gom: true, chu: 'Nét', loai: 'dep' },
        ] },
      ],
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
