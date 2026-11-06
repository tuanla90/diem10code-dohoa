// Gói 5, bài U11-13 đến U11-15: ảnh động và phim quảng bá.
import { canhAnhDong, canhPhim } from '../canh.mjs';
import { MAU } from '../hinh.mjs';

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
  mo: 'Xếp khung cho ảnh động, cắt phim đúng 30 giây, đặt nhạc và chuyển cảnh.',
  loiMo: { ai: 'sola', mat: 'happy', cau: 'Gói cuối rồi! Ban tổ chức chỉ cho đúng 30 giây trước lễ khai mạc. Thừa một giây là bị cắt đuôi.' },
  man: [
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
      sanNhan: 'Ảnh động rô bốt và dải khung hình',
      dan: [
        { txt: 'Khung đang chọn có rô bốt nhắm mắt. Bấm <b>Xóa khung</b>.', nhan: 'xoa', xong: (d) => d.loi === 0 },
        { txt: 'Dùng <b>Sang trái, Sang phải</b> xếp cho tay lên dần rồi hạ dần.', xong: (d) => d.giat <= 20 },
        { txt: 'Kéo <b>Mỗi khung</b> cho một vòng khoảng 1 giây rồi bấm <b>Đăng thử</b>.', xong: () => false },
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
      ma: 'DH-5-2', ten: 'Đúng 30 giây', coKhi: 'dong-thoi-gian', chay: 'Chiếu thử',
      ai: 'luna', mat: 'thinking', vai: 'LUNA NHỜ',
      nho: 'Đội phim quay về gần 1 phút. Khung chiếu trước lễ khai mạc chỉ có 30 giây.',
      muc: 'Cắt còn 30 giây. Mở bằng cổng trường, kết bằng logo, và câu nói của mình phải còn nguyên.',
      dich: 30, dauCuoi: ['mo', 'kt'],
      dau: { clip: [giong('mo'), giong('kt'), giong('pv'), giong('hd'), giong('rb')], chon: 'kt' },
      sanNhan: 'Dòng thời gian phim với năm đoạn',
      dan: [
        { txt: 'Đoạn <b>Logo</b> đang chọn. Bấm <b>Sang phải</b> cho nó về cuối phim.', nhan: 'phai', xong: (d) => d.cuoiDung },
        { txt: 'Chọn từng đoạn, kéo <b>thanh vàng</b> hai đầu để cắt. Vạch vàng trên đoạn Luna là phần đang nói.', xong: (d) => Math.abs(d.tong - 30) <= 0.5 },
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
      sanNhan: 'Dòng thời gian có năm đoạn và rãnh nhạc nền',
      dan: [
        { txt: 'Chạm <b>chấm tròn</b> giữa hai đoạn để đổi cắt thẳng thành chuyển mờ. Mỗi chỗ mờ ăn mất 1 giây.', xong: (d) => d.thieuMo === 0 },
        { txt: 'Phim vừa ngắn đi. Nới đoạn nào đó cho về đủ 30 giây.', xong: (d) => Math.abs(d.tong - 30) <= 0.5 },
        { txt: 'Chọn <b>Nhạc nền</b>: cắt cho hết cùng phim, giảm âm lượng, bật mờ dần cuối.', nhan: 'chon-nhac', xong: (d) => d.lechNhac <= 1 && d.am <= 50 },
      ],
      tieuChi: [
        { id: 'chuyen', ok: (d) => d.thieuMo === 0, ten: 'Mờ ở chỗ đổi chủ đề', loi: 'Từ cảnh này nhảy sang cảnh khác chủ đề mà không có chuyển tiếp, người xem giật mình.', ai: 'luna', matLoi: 'thinking' },
        { id: 'thua', ok: (d) => d.thuaMo === 0, ten: 'Không lạm dụng chuyển cảnh', loi: 'Hai đoạn cùng chủ đề Ngày hội mà cũng làm mờ, phim lề mề như slide cũ.', ai: 'luna', matLoi: 'worried' },
        { id: 'dai', ok: (d) => Math.abs(d.tong - 30) <= 0.5, ten: 'Đúng 30 giây', loi: 'Thêm chuyển mờ làm phim ngắn đi mà chưa nới lại, độ dài không còn đúng khung chiếu.', ai: 'sola', matLoi: 'shocked' },
        { id: 'noi', ok: (d) => d.catLoi.length === 0, ten: 'Câu nói còn nguyên', loi: 'Câu phỏng vấn của Luna bị cắt mất một đoạn.', ai: 'luna', matLoi: 'worried' },
        { id: 'nhac', ok: (d) => d.lechNhac <= 1, ten: 'Nhạc hết cùng phim', loi: 'Phim hết rồi mà nhạc vẫn chạy tiếp, cả hội trường ngồi nghe nhạc trên màn hình đen.', ai: 'sola', matLoi: 'facepalm' },
        { id: 'am', ok: (d) => d.am <= 50, ten: 'Nhạc không lấn lời', loi: 'Nhạc to hơn tiếng người, không ai nghe được Luna nói gì.', ai: 'luna', matLoi: 'worried' },
        { id: 'mo', sao: true, ok: (d) => d.moDan, ten: 'Nhạc mờ dần ở cuối' },
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
        l.nhac(st, { ra: 30, am: 35, mo: true });
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
