// Gói 5, bài U11-13 đến U11-15: ảnh động và phim quảng bá.
import { canhAnhDong, canhPhim, canhVeTay } from '../canh.mjs';
import { MAU, robot, datVao } from '../hinh.mjs';
import { duongSvg } from '../toan/hinh-hoc.mjs';

// Sân phóng to quanh vai phải của rô bốt: gốc của robot() nhân 4,5 rồi dời, để cánh tay đủ lớn cho ngón tay nắn.
const ROBOT_TO = () => datVao(robot(0, { tay: 'mot' }), -12, 145.5, 540, 675, 0, 120, 150);
const BAN_TAY = () => `<circle cx="226.5" cy="141" r="25" fill="${MAU.cyan}" stroke="${MAU.muc}" stroke-width="8"/>`;
const TAY_DICH = [
  { x: 112, y: 173 }, { x: 185, y: 184 }, { x: 210, y: 133 }, { x: 243, y: 149 },
  { x: 203, y: 220, tron: true, r: [-18, 9], v: [18, -9] }, { x: 107, y: 208 },
];
// Nét đích vẽ đè lên thanh tay và bàn tay, có chấm ở từng chỗ cần đặt nút: không có lớp này thì đích bị che gần hết.
const DICH_TREN = () => `<path d="${duongSvg(TAY_DICH)}" fill="none" stroke="${MAU.hong}" stroke-width="2.6" stroke-dasharray="7 5"/>${TAY_DICH.slice(1, 5).map((n) => `<circle cx="${n.x}" cy="${n.y}" r="5" fill="${MAU.trang}" stroke="${MAU.hong}" stroke-width="2.4"/>`).join('')}`;
const SAN_TAY = {
  coTron: true, coThem: true,
  to: `fill="${MAU.vo}" stroke-width="8" stroke-linejoin="round"`,
  nen: () => `<rect width="360" height="300" fill="${MAU.tuong}"/>`,
  phu: () => ROBOT_TO() + BAN_TAY() + DICH_TREN(),
  than: ROBOT_TO, banTay: BAN_TAY,
};
const gan = (st, x, y) => st.nut.some((n) => n.x === x && n.y === y);

const CLIP = {
  mo: { id: 'mo', ten: 'Cổng trường sáng sớm', nho: 'Cổng', goc: 12, vao: 0, ra: 12, mau: MAU.chan, chuDe: 'san' },
  pv: { id: 'pv', ten: 'Phỏng vấn Luna', nho: 'Luna', goc: 16, vao: 0, ra: 16, mau: MAU.do, noi: [3, 11], cau: 'Câu nói của Luna về CLB', chuDe: 'pv' },
  hd: { id: 'hd', ten: 'Thi lập trình nhanh', nho: 'Thi', goc: 14, vao: 0, ra: 14, mau: MAU.teal, chuDe: 'hoi' },
  rb: { id: 'rb', ten: 'Rô bốt trình diễn', nho: 'Rô bốt', goc: 12, vao: 0, ra: 12, mau: MAU.cam, chuDe: 'hoi' },
  kt: { id: 'kt', ten: 'Logo khép lại', nho: 'Logo', goc: 5, vao: 0, ra: 5, mau: MAU.giua, chuDe: 'ket' },
};
const giong = (k, gt = {}) => ({ ...CLIP[k], ...gt });

export default {
  id: 'goi-5',
  ten: 'Phim quảng bá',
  baiHoc: 'U11-13..15',
  mo: 'Vẽ tay cho rô bốt, làm ảnh động, cắt phim đúng 30 giây, đặt nhạc và chuyển cảnh.',
  loiMo: { ai: 'sola', mat: 'happy', cau: 'Gói cuối rồi! Ban tổ chức chỉ cho đúng 30 giây trước lễ khai mạc. Thừa một giây là bị cắt đuôi.' },
  man: [
    {
      // Ôn nút neo của gói 3 ngay trước ảnh động: có tay vẽ xong thì màn sau mới làm cho vẫy.
      ma: 'DH-5-4', ten: 'Vẽ cánh tay vẫy', coKhi: 'nut-net', chay: 'Lắp tay', baiHoc: 'C10-28',
      ai: 'sola', mat: 'confused', vai: 'SOLA NHỜ',
      nho: 'Làm ảnh động mới nhớ ra rô bốt thiếu cánh tay giơ lên. Mình kéo tạm một thanh thẳng đuột, trông như cái que chọc ra.',
      muc: 'Nắn thanh thành cánh tay theo nét đứt: gập lên ở khuỷu, phía ngoài khuỷu bo tròn.',
      dau: { nut: [{ x: 112, y: 173 }, { x: 290, y: 173 }, { x: 290, y: 208 }, { x: 107, y: 208 }], chon: null },
      mau: TAY_DICH,
      san: SAN_TAY,
      sanNhan: 'Vai rô bốt phóng to và cánh tay đang vẽ',
      dan: [
        { txt: 'Kéo hai nút vuông bên phải vào hai góc nét đứt ở bàn tay.', xong: (_d, st) => gan(st, 210, 133) && gan(st, 243, 149) },
        { txt: 'Chạm <b>dấu cộng</b> trên mép tay phía trên, kéo nút mới vào chỗ gập trong khuỷu.', xong: (_d, st) => gan(st, 185, 184) },
        { txt: 'Chạm <b>dấu cộng</b> trên mép dưới, kéo nút mới vào góc ngoài khuỷu.', xong: (_d, st) => gan(st, 203, 220) },
        { txt: 'Nút đó đang chọn. Bấm <b>Nút trơn</b> rồi kéo tay nắm hồng cho khuỷu bo theo nét đứt.', nhan: 'tron', xong: (d) => d.soTron >= 1 && d.lech <= 5 },
        { txt: 'Bấm <b>Lắp tay</b>.', xong: () => false },
      ],
      tieuChi: [
        { id: 'hinh', ok: (d) => d.lech <= 10, ten: 'Đúng dáng cánh tay', loi: 'Lắp vào rồi mà tay chưa gập đúng chỗ, rô bốt không giơ lên vẫy được.', ai: 'sola', matLoi: 'confused' },
        { id: 'khuyu', ok: (d) => d.soTron >= 1, ten: 'Khuỷu bo tròn', loi: 'Dáng đúng rồi nhưng khuỷu gãy như cái ê ke. Khuỷu rô bốt mềm mại hơn thế, cần một nút trơn.', ai: 'luna', matLoi: 'thinking' },
        { id: 'sat', sao: true, ok: (d) => d.lech <= 5, ten: 'Bám sát nét đứt' },
        { id: 'gon', sao: true, ok: (d) => d.soNut === 6, ten: 'Đúng 6 nút, không thừa' },
      ],
      goiY: [
        'Nét đứt có 6 chỗ đổi hướng, hiện mới có 4 nút. Mỗi dấu cộng cho thêm một nút.',
        'Mép trên thêm một nút ở chỗ gập trong, mép dưới thêm một nút ở góc ngoài khuỷu.',
        'Nút góc chỉ cho đường thẳng. Chọn nút ngoài khuỷu, bấm Nút trơn, kéo tay nắm cho đường bo theo nét đứt, gần đúng là nó tự hít.',
      ],
      soTay: ['nut-neo', 'bezier'],
      canh: (st, ket, _d, man) => canhVeTay(st, ket.dat, man),
      giai(st, l) {
        l.dat(st, 1, 210, 133); l.dat(st, 2, 243, 149);
        l.them(st, 0); l.dat(st, 1, 185, 184);
        l.them(st, 3); l.dat(st, 4, 203, 220); l.tron(st, 4, true); l.tay(st, 4, -18, 9);
      },
      sai: [
        { ten: 'Còn tay thẳng', loi: 'hinh', lam() {} },
        { ten: 'Đủ nút mà chưa bo khuỷu', loi: 'khuyu', lam(st, l) { l.dat(st, 1, 210, 133); l.dat(st, 2, 243, 149); l.them(st, 0); l.dat(st, 1, 185, 184); l.them(st, 3); l.dat(st, 4, 203, 220); } },
      ],
    },
    {
      ma: 'DH-5-1', ten: 'Rô bốt vẫy giật cục', coKhi: 'khung-hinh', chay: 'Đăng thử',
      ai: 'sola', mat: 'confused', vai: 'SOLA NHỜ',
      nho: 'Ảnh động rô bốt vẫy tay mà giật như máy sắp hỏng. Có khung còn nhắm mắt nữa.',
      muc: 'Vẫy tay mượt, lặp lại liền mạch, mỗi vòng khoảng 1 giây.',
      dau: {
        khung: [
          { id: 'a', goc: 0 }, { id: 'b', goc: 40 }, { id: 'c', goc: 20 }, { id: 'x', goc: 30, mat: 'nham' },
          { id: 'd', goc: 60 }, { id: 'e', goc: 20 }, { id: 'f', goc: 40 },
        ], chon: 3, ms: 300,
      },
      dongHo: [
        { id: 'vong', ten: 'Một vòng', lay: (d) => d.chuKy, tieu: ['nhip'], muc: [
          { den: 500, chu: 'Quá nhanh', loai: 'xau' },
          { den: 800, chu: 'Hơi nhanh', loai: 'dat' },
          { den: 1200, gom: true, chu: 'Khoảng 1 giây', loai: 'dep' },
          { den: 1600, gom: true, chu: 'Hơi chậm', loai: 'dat' },
          { den: 2600, chu: 'Quá chậm', loai: 'xau' },
        ] },
      ],
      sanNhan: 'Ảnh động rô bốt và dải khung hình',
      dan: [
        { txt: 'Khung 4 có rô bốt nhắm mắt và đang được chọn. Bấm <b>Xóa khung</b>.', nhan: 'xoa-khung', xong: (d) => d.loi === 0 },
        { txt: 'Kéo các khung đổi chỗ cho tay lên dần rồi hạ dần.', xong: (d) => d.giat <= 20 },
        { txt: 'Kéo thanh <b>Mỗi khung</b> cho kim vào vùng xanh.', xong: (d) => d.chuKy >= 500 && d.chuKy <= 1600 },
        { txt: 'Bấm <b>Đăng thử</b>. Kim vào phần xanh đậm là đủ sao.', xong: () => false },
      ],
      tieuChi: [
        { id: 'loi', ok: (d) => d.loi === 0, ten: 'Bỏ khung lỗi', loi: 'Cứ mỗi vòng rô bốt lại nhắm mắt một cái, như đang ngủ gật.', ai: 'sola', matLoi: 'facepalm' },
        { id: 'giat', ok: (d) => d.giat <= 20, ten: 'Tay chuyển mượt', loi: 'Tay rô bốt vẫn nhảy cóc giữa hai khung. Hai khung kề nhau phải gần giống nhau, kể cả khung cuối với khung đầu.', ai: 'luna', matLoi: 'thinking' },
        { id: 'nhip', ok: (d) => d.chuKy >= 500 && d.chuKy <= 1600, ten: 'Nhịp vừa phải', loi: 'Tốc độ chưa ổn: quá nhanh thì rô bốt như bị giật điện, quá chậm thì như đang buồn ngủ.', ai: 'sola', matLoi: 'confused' },
        { id: 'motGiay', sao: true, ok: (d) => d.chuKy >= 800 && d.chuKy <= 1200, ten: 'Mỗi vòng khoảng 1 giây' },
        { id: 'du', sao: true, ok: (d) => d.soKhung === 6, ten: 'Giữ đủ 6 khung tốt' },
      ],
      goiY: [
        'Ảnh động lặp lại, nên khung cuối nối tiếp khung đầu. Khoảng nhảy ở đó cũng tính.',
        'Xếp góc tay theo kiểu 0, 20, 40, 60, 40, 20 rồi lại về 0.',
        'Một vòng bằng số khung nhân thời gian mỗi khung. Sáu khung, mỗi khung bao nhiêu là được 1 giây?',
      ],
      soTay: ['khung-hinh'],
      canh: (st) => canhAnhDong(st),
      giai(st, l) { l.xep(st, ['a', 'c', 'b', 'd', 'f', 'e']); l.ms(st, 170); },
      sai: [
        { ten: 'Còn khung nhắm mắt', loi: 'loi', lam(st, l) { l.ms(st, 150); } },
        { ten: 'Bỏ khung lỗi, chưa xếp lại', loi: 'giat', lam(st, l) { l.xep(st, ['a', 'b', 'c', 'd', 'e', 'f']); l.ms(st, 170); } },
        { ten: 'Xếp đúng mà chậm', loi: 'nhip', lam(st, l) { l.xep(st, ['a', 'c', 'b', 'd', 'f', 'e']); l.ms(st, 400); } },
      ],
    },
    {
      ma: 'DH-5-5', ten: 'Rô bốt chớp mắt', coKhi: 'khung-hinh', chay: 'Đăng thử', msRieng: true,
      ai: 'luna', mat: 'thinking', vai: 'LUNA NHỜ',
      nho: 'Ảnh đại diện CLB là rô bốt chớp mắt. Sola để khung nào cũng 300 ms nên nó nháy liên hồi như bị chói đèn, lại còn lẫn một khung giơ tay.',
      muc: 'Mở mắt thật lâu, chớp thật nhanh, mắt khép dần và không có khung lạc.',
      dau: {
        khung: [
          { id: 'a', goc: 0, mat: 'mo', ms: 300 }, { id: 'c', goc: 0, mat: 'nham', ms: 300 }, { id: 'b', goc: 0, mat: 'lim', ms: 300 },
          { id: 'x', goc: 40, mat: 'mo', ms: 300 }, { id: 'd', goc: 0, mat: 'lim', ms: 300 },
        ], chon: 3, ms: 300,
      },
      dongHo: [
        { id: 'mo', ten: 'Mở mắt', lay: (d) => d.giuMo, tieu: ['thuc'], muc: [
          { den: 1500, chu: 'Nháy liên hồi', loai: 'xau' },
          { den: 2000, chu: 'Tỉnh táo', loai: 'dat' },
          { den: 3200, chu: 'Rất tự nhiên', loai: 'dep' },
        ] },
        { id: 'chop', ten: 'Một cái chớp', lay: (d) => d.chopMs, gomMoc: true, tieu: ['chop'], muc: [
          { den: 300, chu: 'Nhanh gọn', loai: 'dep' },
          { den: 500, chu: 'Hơi lâu', loai: 'dat' },
          { den: 1500, chu: 'Như ngủ gật', loai: 'xau' },
        ] },
      ],
      sanNhan: 'Ảnh động rô bốt chớp mắt và dải khung hình, mỗi khung ghi thời gian riêng',
      dan: [
        { txt: 'Khung 4 giơ tay lạc vào và đang được chọn. Bấm <b>Xóa khung</b>.', nhan: 'xoa-khung', xong: (d) => d.giat === 0 },
        { txt: 'Kéo các khung đổi chỗ cho mắt khép dần: mở, lim dim, nhắm, lim dim.', xong: (d) => d.matNhay <= 1 && d.loi >= 1 },
        { txt: 'Chạm khung mắt mở, kéo thanh lên thật lâu cho vạch Mở mắt có dấu xanh.', xong: (d) => d.giuMo >= 1500 },
        { txt: 'Chạm từng khung còn lại, kéo thanh xuống. Đổi khung này thì khung kia giữ nguyên.', xong: (d) => d.chopMs <= 500 },
        { txt: 'Bấm <b>Đăng thử</b>. Kim vào phần xanh đậm là đủ sao.', xong: () => false },
      ],
      tieuChi: [
        { id: 'lac', ok: (d) => d.giat === 0, ten: 'Bỏ khung lạc', loi: 'Đang chớp mắt thì tay giật lên một cái. Khung đó lạc từ ảnh vẫy tay sang.', ai: 'sola', matLoi: 'shocked' },
        { id: 'thuTu', ok: (d) => d.loi >= 1 && d.matNhay <= 1, ten: 'Mắt khép dần', loi: 'Mắt nhảy thẳng từ mở sang nhắm. Xếp lại: mở, lim dim, nhắm, lim dim, và khung cuối phải nối được về khung đầu.', ai: 'luna', matLoi: 'thinking' },
        { id: 'thuc', ok: (d) => d.giuMo >= 1500, ten: 'Mở mắt đủ lâu', loi: 'Rô bốt nháy liên hồi như bị chói đèn. Khung mở mắt phải giữ ít nhất 1,5 giây.', ai: 'sola', matLoi: 'confused' },
        { id: 'chop', ok: (d) => d.chopMs <= 500, ten: 'Chớp đủ nhanh', loi: 'Mắt khép lâu quá, nhìn như đang ngủ gật. Cả cái chớp chỉ nên dưới nửa giây.', ai: 'luna', matLoi: 'worried' },
        { id: 'nhanh', sao: true, ok: (d) => d.chopMs <= 300, ten: 'Chớp thật nhanh' },
        { id: 'vong', sao: true, ok: (d) => d.chuKy >= 2000 && d.chuKy <= 4000, ten: 'Mỗi vòng 2 đến 4 giây' },
      ],
      goiY: [
        'Khác màn trước: thanh trượt chỉ đổi khung đang chọn. Số ghi dưới mỗi khung là thời gian riêng của nó.',
        'Khung đầu nối tiếp khung cuối, nên xếp mở, lim dim, nhắm, lim dim là mắt khép và mở đều dần.',
        'Khung mở mắt khoảng 2500 ms, ba khung còn lại mỗi khung 100 ms.',
      ],
      soTay: ['thoi-gian-khung', 'khung-hinh'],
      canh: (st) => canhAnhDong(st),
      giai(st, l) { l.xep(st, ['a', 'b', 'c', 'd']); l.msKhung(st, 'a', 2500); for (const id of ['b', 'c', 'd']) l.msKhung(st, id, 100); },
      sai: [
        { ten: 'Còn khung lạc', loi: 'lac', lam(st, l) { l.xep(st, ['a', 'b', 'c', 'd', 'x']); } },
        { ten: 'Xếp sai thứ tự', loi: 'thuTu', lam(st, l) { l.xep(st, ['a', 'c', 'b', 'd']); l.msKhung(st, 'a', 2500); } },
        { ten: 'Bỏ khung nhắm', loi: 'thuTu', lam(st, l) { l.xep(st, ['a', 'b']); l.msKhung(st, 'a', 2500); l.msKhung(st, 'b', 100); } },
        { ten: 'Khung nào cũng bằng nhau', loi: 'thuc', lam(st, l) { l.xep(st, ['a', 'b', 'c', 'd']); } },
        { ten: 'Mở lâu mà chớp chậm', loi: 'chop', lam(st, l) { l.xep(st, ['a', 'b', 'c', 'd']); l.msKhung(st, 'a', 2500); } },
      ],
    },
    {
      ma: 'DH-5-2', ten: 'Đúng 30 giây', coKhi: 'dong-thoi-gian', chay: 'Chiếu thử',
      ai: 'luna', mat: 'thinking', vai: 'LUNA NHỜ',
      nho: 'Đội phim quay về gần 1 phút. Khung chiếu trước lễ khai mạc chỉ có 30 giây.',
      muc: 'Cắt còn 30 giây. Mở bằng cổng trường, kết bằng logo, và câu nói của mình phải còn nguyên.',
      dich: 30, dauCuoi: ['mo', 'kt'],
      dau: { clip: [giong('mo'), giong('kt'), giong('pv'), giong('hd'), giong('rb')], chon: null },
      sanNhan: 'Dòng thời gian phim với năm đoạn',
      dan: [
        { txt: 'Kéo đoạn <b>Logo</b> về cuối phim.', xong: (d) => d.cuoiDung },
        { txt: 'Chạm từng đoạn rồi kéo <b>thanh vàng</b> hai đầu để cắt. Gần đủ 30 giây hay gần mép lời nói thì nó tự hít.', xong: (d) => Math.abs(d.tong - 30) <= 0.5 },
        { txt: 'Bấm <b>Chiếu thử</b>.', xong: () => false },
      ],
      tieuChi: [
        { id: 'dau', ok: (d) => d.dauDung && d.cuoiDung, ten: 'Mở và kết đúng', loi: 'Phim chưa kết hẳn đã hiện logo, rồi lại chiếu tiếp. Khán giả vỗ tay nhầm lúc.', ai: 'sola', matLoi: 'confused' },
        { id: 'dai', ok: (d) => d.tong <= 30.5, ten: 'Không quá 30 giây', loi: 'Phim dài hơn khung chiếu, ban tổ chức cắt ngang phần kết.', ai: 'sola', matLoi: 'shocked' },
        { id: 'ngan', ok: (d) => d.tong >= 29.5, ten: 'Đủ 30 giây', loi: 'Phim ngắn hơn khung chiếu, màn hình đen ngòm mấy giây trước lễ khai mạc.', ai: 'luna', matLoi: 'worried' },
        { id: 'noi', ok: (d) => d.catLoi.length === 0, ten: 'Câu nói còn nguyên', loi: 'Câu phỏng vấn của Luna bị cắt giữa chừng. "Câu lạc bộ của chúng..." rồi hết.', ai: 'luna', matLoi: 'worried' },
        { id: 'chop', ok: (d) => d.ngan >= 2, ten: 'Đoạn nào cũng xem kịp', loi: 'Có đoạn quá ngắn, chưa kịp nhìn đã qua.', ai: 'sola', matLoi: 'confused' },
        { id: 'dung', sao: true, ok: (d) => Math.abs(d.tong - 30) <= 0.1, ten: 'Vừa khít 30.0 giây' },
        { id: 'nhip', sao: true, ok: (d) => d.dai <= 10, ten: 'Không đoạn nào quá 10 giây' },
      ],
      goiY: [
        'Vạch vàng nét đứt trên thước là mốc 30 giây. Đuôi đoạn cuối phải chạm vạch đó.',
        'Phần Luna nói từ giây 3 đến giây 11, tức 8 giây phải giữ. Cắt thừa hai bên thôi.',
        'Thử chia: Cổng 5, Luna 8, Thi 7, Rô bốt 7, Logo 3 là đủ 30.',
      ],
      soTay: ['dong-thoi-gian'],
      canh: (st, _k, d, man) => canhPhim(st, man, d),
      giai(st, l) {
        l.doi(st, 1, 4);
        st.clip = ['mo', 'pv', 'hd', 'rb', 'kt'].map((id) => st.clip.find((c) => c.id === id));
        l.cat(st, 'mo', 'ra', 5); l.cat(st, 'pv', 'vao', 3); l.cat(st, 'pv', 'ra', 11); l.cat(st, 'hd', 'ra', 7); l.cat(st, 'rb', 'ra', 7); l.cat(st, 'kt', 'ra', 3);
      },
      sai: [
        { ten: 'Đúng thứ tự mà chưa cắt', loi: 'dai', lam(st) { st.clip = ['mo', 'pv', 'hd', 'rb', 'kt'].map((id) => st.clip.find((c) => c.id === id)); } },
        { ten: 'Cắt mất câu nói', loi: 'noi', lam(st, l) {
          st.clip = ['mo', 'pv', 'hd', 'rb', 'kt'].map((id) => st.clip.find((c) => c.id === id));
          l.cat(st, 'mo', 'ra', 7); l.cat(st, 'pv', 'vao', 0); l.cat(st, 'pv', 'ra', 6); l.cat(st, 'hd', 'ra', 7); l.cat(st, 'rb', 'ra', 7); l.cat(st, 'kt', 'ra', 3);
        } },
        { ten: 'Quá ngắn', loi: 'ngan', lam(st, l) {
          st.clip = ['mo', 'pv', 'hd', 'rb', 'kt'].map((id) => st.clip.find((c) => c.id === id));
          l.cat(st, 'mo', 'ra', 3); l.cat(st, 'pv', 'vao', 3); l.cat(st, 'pv', 'ra', 11); l.cat(st, 'hd', 'ra', 3); l.cat(st, 'rb', 'ra', 3); l.cat(st, 'kt', 'ra', 3);
        } },
      ],
    },
    {
      ma: 'DH-5-3', ten: 'Nhạc và chuyển cảnh', coKhi: 'dong-thoi-gian', chay: 'Chiếu thử',
      ai: 'sola', mat: 'happy', vai: 'SOLA NHỜ',
      nho: 'Phim đủ 30 giây rồi, mình thả bài nhạc 48 giây vào, to hết cỡ. Nghe hào hùng lắm! Mà Luna nói gì không nghe được.',
      muc: 'Chuyển mờ ở chỗ đổi chủ đề, nhạc hết cùng phim và không lấn lời nói. Phim vẫn đúng 30 giây.',
      dich: 30, dauCuoi: ['mo', 'kt'], giayHien: 36,
      dau: {
        clip: [giong('mo', { ra: 5 }), giong('pv', { vao: 3, ra: 11 }), giong('hd', { ra: 7 }), giong('rb', { ra: 7 }), giong('kt', { ra: 3 })],
        chuyen: ['cat', 'cat', 'cat', 'cat'],
        nhac: { goc: 48, ra: 48, mo: false, am: 100 },
        chon: 'mo',
      },
      dongHo: [
        { id: 'am', ten: 'Âm lượng', lay: (d) => d.am, gomMoc: true, tieu: ['am'], muc: [
          { den: 50, chu: 'Nghe rõ lời', loai: 'dat' },
          { den: 100, chu: 'Nhạc lấn lời', loai: 'xau' },
        ] },
        { id: 'mo', ten: 'Mờ dần', lay: (d) => d.moGiay, tieu: ['mo'], muc: [
          { den: 1, chu: 'Tắt phụt', loai: 'cho' },
          { den: 8, gom: true, chu: 'Tắt êm', loai: 'dep' },
        ] },
      ],
      sanNhan: 'Dòng thời gian có năm đoạn và rãnh nhạc nền',
      dan: [
        { txt: 'Chạm <b>chấm tròn</b> giữa hai đoạn để đổi cắt thẳng thành chuyển mờ. Mỗi chỗ mờ ăn mất 1 giây.', xong: (d) => d.thieuMo === 0 },
        { txt: 'Phim vừa ngắn đi. Chạm một đoạn rồi nới <b>thanh vàng</b> cho về đủ 30 giây, gần đủ nó tự hít.', xong: (d) => Math.abs(d.tong - 30) <= 0.5 },
        { txt: 'Kéo <b>thanh vàng</b> cuối rãnh nhạc về hết phim, gần tới nó tự hít.', xong: (d) => d.lechNhac <= 1 },
        { txt: 'Vuốt xuống trên rãnh nhạc cho <b>đường trắng</b> xuống dưới mức lời nói.', xong: (d) => d.am <= 50 },
        { txt: 'Kéo <b>chấm tròn</b> ở góc trên rãnh nhạc sang trái để nhạc tắt từ từ.', xong: (d) => d.moDan },
        { txt: 'Bấm <b>Chiếu thử</b>.', xong: () => false },
      ],
      tieuChi: [
        { id: 'chuyen', ok: (d) => d.thieuMo === 0, ten: 'Mờ ở chỗ đổi chủ đề', loi: 'Từ cảnh này nhảy sang cảnh khác chủ đề mà không có chuyển tiếp, người xem giật mình.', ai: 'luna', matLoi: 'thinking' },
        { id: 'thua', ok: (d) => d.thuaMo === 0, ten: 'Không lạm dụng chuyển cảnh', loi: 'Hai đoạn cùng chủ đề Ngày hội mà cũng làm mờ, phim lề mề như slide cũ.', ai: 'luna', matLoi: 'worried' },
        { id: 'dai', ok: (d) => Math.abs(d.tong - 30) <= 0.5, ten: 'Đúng 30 giây', loi: 'Thêm chuyển mờ làm phim ngắn đi mà chưa nới lại, độ dài không còn đúng khung chiếu.', ai: 'sola', matLoi: 'shocked' },
        { id: 'noi', ok: (d) => d.catLoi.length === 0, ten: 'Câu nói còn nguyên', loi: 'Câu phỏng vấn của Luna bị cắt mất một đoạn.', ai: 'luna', matLoi: 'worried' },
        { id: 'nhac', ok: (d) => d.lechNhac <= 1, ten: 'Nhạc hết cùng phim', loi: 'Phim hết rồi mà nhạc vẫn chạy tiếp, cả hội trường ngồi nghe nhạc trên màn hình đen.', ai: 'sola', matLoi: 'facepalm' },
        { id: 'am', ok: (d) => d.am <= 50, ten: 'Nhạc không lấn lời', loi: 'Nhạc to hơn tiếng người, không ai nghe được Luna nói gì.', ai: 'luna', matLoi: 'worried' },
        { id: 'mo', sao: true, ok: (d) => d.moDan, ten: 'Nhạc mờ dần ít nhất 1 giây ở cuối' },
        { id: 'khit', sao: true, ok: (d) => Math.abs(d.tong - 30) <= 0.1 && d.lechNhac <= 0.1, ten: 'Hình và nhạc khít đến 0.1 giây' },
      ],
      goiY: [
        'Bốn chỗ nối thì có một chỗ cùng chủ đề Ngày hội (Thi và Rô bốt), chỗ đó giữ cắt thẳng.',
        'Ba chỗ mờ làm phim ngắn đi 3 giây. Đoạn Cổng, Thi hoặc Rô bốt còn dư ở bản gốc, nới ra được.',
        'Làm hình trước, nhạc sau. Nhạc cắt sớm rồi đổi hình là lại lệch.',
      ],
      soTay: ['dong-thoi-gian', 'chuyen-canh', 'am-nhac'],
      canh: (st, _k, d, man) => canhPhim(st, man, d),
      giai(st, l) {
        l.chuyen(st, 0, 'mo'); l.chuyen(st, 1, 'mo'); l.chuyen(st, 3, 'mo');
        l.cat(st, 'mo', 'ra', 8);
        l.nhac(st, { ra: 30, am: 35, mo: 2 });
      },
      sai: [
        { ten: 'Chưa làm gì ngoài cắt nhạc', loi: 'chuyen', lam(st, l) { l.nhac(st, { ra: 30, am: 35 }); } },
        { ten: 'Mờ mọi chỗ nối', loi: 'thua', lam(st, l) { for (const i of [0, 1, 2, 3]) l.chuyen(st, i, 'mo'); l.cat(st, 'mo', 'ra', 9); l.nhac(st, { ra: 30, am: 35 }); } },
        { ten: 'Thêm mờ mà không nới', loi: 'dai', lam(st, l) { for (const i of [0, 1, 3]) l.chuyen(st, i, 'mo'); l.nhac(st, { ra: 27, am: 35 }); } },
        { ten: 'Nhạc to', loi: 'am', lam(st, l) { for (const i of [0, 1, 3]) l.chuyen(st, i, 'mo'); l.cat(st, 'mo', 'ra', 8); l.nhac(st, { ra: 30 }); } },
      ],
    },
  ],
};
