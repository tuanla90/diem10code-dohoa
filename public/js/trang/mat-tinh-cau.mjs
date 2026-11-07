// Ngân hàng câu Mắt Thiết Kế. Mỗi câu hai bản vẽ cùng khung 240x130, câu trả lời sai là một lỗi đã gặp trong màn.
// goi: chỉ hỏi khi đã xong gói đó, để không hỏi điều chưa học. k: mục Sổ tay để đọc thêm.
import { MAU, datVao, logoLong, logoKhoi, MANH_LOGO, BIEU_TUONG, robot, tieuDe } from '../hinh.mjs';

const nenPoster = `<rect width="240" height="130" fill="url(#gr-poster)"/>`;
const nenTrang = `<rect width="240" height="130" fill="${MAU.trang}"/>`;
const nenCaRo = `<rect width="240" height="130" fill="url(#o-ca-ro)"/>`;
const chu = (x, y, t, co, mau = MAU.trang, dam = 800) => `<text x="${x}" y="${y}" text-anchor="middle" font-size="${co}" font-weight="${dam}" fill="${mau}" font-family="var(--font)">${t}</text>`;
const khungVang = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="none" stroke="${MAU.vang}" stroke-width="2" stroke-dasharray="6 5"/>`;

const hoiTruong = () => `<rect width="240" height="130" fill="${MAU.tuong}"/><rect y="88" width="240" height="42" fill="${MAU.chan}" opacity=".55"/>
  <rect x="24" y="18" width="42" height="48" rx="2" fill="${MAU.troi}" stroke="${MAU.muc}" stroke-width="2"/><path d="M45 18v48M24 42h42" stroke="${MAU.muc}" stroke-width="2"/>
  <rect x="96" y="20" width="118" height="54" rx="3" fill="${MAU.giua}"/>${chu(155, 53, 'NGÀY HỘI', 16)}
  ${[30, 66, 102, 138, 174, 210].map((x, i) => `<g transform="translate(${x} ${98 + (i % 2) * 5})"><circle r="8" fill="${MAU.muc}"/><path d="M-11 26v-8a11 11 0 0122 0v8z" fill="${[MAU.cam, MAU.xanh, MAU.hong][i % 3]}"/></g>`).join('')}`;

const chuoiHinh = (vt) => vt.map(([x, y, c], i) => datVao(BIEU_TUONG[i].ve(), x, y, c, c)).join('');

const hinhAnhDong = (goc, mat, ms) => {
  const tg = goc.map((_, i) => ms?.[i] ?? 150);
  const tong = tg.reduce((a, b) => a + b, 0);
  let daQua = 0;
  return goc.map((g, i) => {
    const tu = daQua / tong, den = (daQua + tg[i]) / tong;
    daQua += tg[i];
    return `<g opacity="0"><animate attributeName="opacity" dur="${tong}ms" repeatCount="indefinite" calcMode="discrete" keyTimes="0;${tu.toFixed(3)};${den.toFixed(3)};1" values="0;1;0;0"/>${datVao(robot(g, { mat: mat?.[i] || 'mo' }), 120, 66, 92, 116, 0, 120, 150)}</g>`;
  }).join('');
};

// Ba người mặc áo trắng: áo còn nếp, hoặc đã cháy thành mảng phẳng.
const doiAoTrang = (nep) => `<rect width="240" height="130" fill="${nep ? MAU.giua : MAU.xamNhat}"/>${[60, 120, 180].map((x) => `<g transform="translate(${x} 34)"><circle r="15" fill="${MAU.muc}"/><path d="M-26 96V44a26 24 0 0152 0v52z" fill="${MAU.trang}"/>${nep ? `<path d="M-13 40v56M0 34v62M13 40v56" stroke="${MAU.xam}" stroke-width="2.5"/>` : ''}</g>`).join('')}`;

// Cánh tay rô bốt: khuỷu ngoài bo mềm hoặc gãy thành góc.
const canhTay = (cuoi) => `${nenTrang}<g transform="translate(-46 -105) scale(.95)"><path d="M112 173L185 184L210 133L243 149${cuoi}L107 208Z" fill="${MAU.vo}" stroke="${MAU.muc}" stroke-width="8" stroke-linejoin="round"/><circle cx="226.5" cy="141" r="25" fill="${MAU.cyan}" stroke="${MAU.muc}" stroke-width="8"/><rect x="60" y="140" width="62" height="100" rx="20" fill="${MAU.vo}" stroke="${MAU.muc}" stroke-width="8"/></g>`;

const dongPhim = (dai, chuThich) => {
  const k = 200 / 34;
  const mau = [MAU.chan, MAU.do, MAU.teal, MAU.cam, MAU.giua];
  const cac = dai.map((d, i) => { const x = 20 + dai.slice(0, i).reduce((a, b) => a + b, 0) * k; return `<rect x="${x}" y="50" width="${d * k - 1}" height="34" rx="2" fill="${mau[i]}"/>`; }).join('');
  return `<rect width="240" height="130" fill="${MAU.muc}"/>${cac}<path d="M${20 + 30 * k} 36v62" stroke="${MAU.vang}" stroke-width="2" stroke-dasharray="4 4"/>${chu(20 + 30 * k, 30, '30 giây', 11, MAU.vang, 700)}${chu(120, 116, chuThich, 12, MAU.trang, 600)}`;
};

const songNhac = (cao, moCuoi) => {
  let s = '';
  for (let i = 0; i < 40; i++) {
    const t = i / 40;
    let c = cao * (0.7 + 0.3 * Math.abs(Math.sin(i * 1.7)));
    if (moCuoi && t > 0.72) c *= (1 - t) / 0.28;
    s += `<rect x="${20 + i * 5}" y="${100 - c}" width="3" height="${c}" rx="1" fill="${MAU.xanh}"/>`;
  }
  return s;
};

export const CAU = [
  {
    goi: 0, k: 'ti-le', hoi: 'Bản nào giữ đúng tỉ lệ của logo?',
    dung: () => `${nenPoster}${datVao(logoLong(), 120, 65, 104, 104)}`,
    sai: () => `${nenPoster}${datVao(logoLong(), 120, 65, 200, 92)}`,
    vi: 'Kéo một chiều làm vòng tròn thành quả trứng. Khóa tỉ lệ rồi kéo góc thì không méo.',
  },
  {
    goi: 0, k: 'vector', hoi: 'Đứng sát băng rôn 3 mét, bản nào dùng đúng tệp?',
    dung: () => `${nenTrang}<g transform="translate(120 72) scale(2.5) translate(-50 -40)">${logoLong()}</g>`,
    sai: () => `${nenTrang}<g transform="translate(120 72) scale(2.5) translate(-50 -40)">${logoKhoi(18)}</g>`,
    vi: 'Vector lưu bằng công thức nên phóng cỡ nào cũng nét. Ảnh điểm phóng quá cỡ sẽ thấy từng ô.',
  },
  {
    goi: 0, k: 'tay-nam', hoi: 'Bản nào đem in được?',
    dung: () => `${nenPoster}${datVao(logoLong(), 120, 48, 68, 68)}${datVao(tieuDe(), 120, 104, 150, 37.5, 0, 200, 50)}`,
    sai: () => `${nenPoster}${datVao(logoLong(), 104, 52, 68, 68, 13)}${datVao(tieuDe(), 130, 100, 150, 37.5, -8, 200, 50)}`,
    vi: 'Món nghiêng mỗi cái một hướng thì ai đi qua cũng nghiêng đầu nhìn. Xoay thẳng trước, căn sau.',
  },
  {
    goi: 0, k: 'ti-le', hoi: 'Logo nào nằm đúng tâm khung vàng?',
    dung: () => `${nenPoster}${khungVang(50, 14, 140, 102)}${datVao(logoLong(), 120, 65, 92, 92)}`,
    sai: () => `${nenPoster}${khungVang(50, 14, 140, 102)}${datVao(logoLong(), 98, 72, 84, 84)}`,
    vi: 'Lệch tâm dù nhỏ vẫn thấy khoảng trống hai bên không bằng nhau.',
  },
  {
    goi: 0, k: 'mat-do', hoi: 'Khung vàng trống chỗ, bản nào đặt logo đủ to?',
    dung: () => `${nenPoster}${khungVang(60, 12, 120, 106)}${datVao(logoLong(), 120, 65, 100, 100)}`,
    sai: () => `${nenPoster}${khungVang(60, 12, 120, 106)}${datVao(logoLong(), 120, 65, 40, 40)}`,
    vi: 'Logo bé giữa khung thì đứng xa không ai thấy. Đẩy tới khi chạm cạnh ngắn của khung.',
  },
  {
    goi: 1, k: 'lop', hoi: 'Bản nào xếp lớp đúng?',
    dung: () => `${nenTrang}${datVao(logoLong(), 120, 65, 112, 112)}`,
    sai: () => `${nenTrang}${datVao(['sao', 'chu', 'dai', 'nen', 'vong'].map((k) => MANH_LOGO[k].ve()).join(''), 120, 65, 112, 112)}`,
    vi: 'Mảnh nền nằm trên cùng thì che mất sao và chữ. Nền phải ở lớp dưới cùng.',
  },
  {
    goi: 1, k: 'can-hang', hoi: 'Hàng biểu tượng nào đã căn hàng và cách đều?',
    dung: () => `${nenTrang}${chuoiHinh([[32, 65, 36], [76, 65, 36], [120, 65, 36], [164, 65, 36], [208, 65, 36]])}`,
    sai: () => `${nenTrang}${chuoiHinh([[30, 50, 36], [68, 82, 36], [126, 62, 36], [158, 44, 36], [212, 86, 36]])}`,
    vi: 'Căn hàng đưa về một đường, phân phối chia đều khoảng hở. Mắt người nhận ra lệch rất nhanh.',
  },
  {
    goi: 1, k: 'can-hang', hoi: 'Bản nào các biểu tượng cùng cỡ?',
    dung: () => `${nenTrang}${chuoiHinh([[32, 65, 36], [76, 65, 36], [120, 65, 36], [164, 65, 36], [208, 65, 36]])}`,
    sai: () => `${nenTrang}${chuoiHinh([[30, 65, 26], [72, 65, 42], [120, 65, 30], [164, 65, 46], [210, 65, 24]])}`,
    vi: 'Cùng là biểu tượng ngang hàng thì phải cùng cỡ, trừ khi bạn thật sự muốn nhấn một món.',
  },
  {
    goi: 2, k: 'bezier', hoi: 'Lá cờ nào có mép uốn mềm?',
    dung: () => `<rect width="240" height="130" fill="${MAU.troi}"/><rect x="34" y="8" width="5" height="116" rx="2" fill="${MAU.muc}"/><path d="M39 18c40-20 80 18 140 0v68c-60 18-100-20-140 0z" fill="url(#gr-logo)"/>`,
    sai: () => `<rect width="240" height="130" fill="${MAU.troi}"/><rect x="34" y="8" width="5" height="116" rx="2" fill="${MAU.muc}"/><path d="M39 18l50-10 44 22 46-12v68l-46 12-44-22-50 10z" fill="url(#gr-logo)"/>`,
    vi: 'Nút góc chỉ tạo đoạn thẳng. Đổi sang nút trơn thì đường đi qua mềm mại.',
  },
  {
    goi: 2, k: 'ghep-hinh', hoi: 'Huy hiệu nào xỏ dây được thật?',
    dung: () => `${nenCaRo}<path d="M120 0V34" stroke="${MAU.do}" stroke-width="5"/><path fill-rule="evenodd" d="M120 22a50 50 0 110 100 50 50 0 010-100zm0 7a7 7 0 100 14 7 7 0 000-14z" fill="url(#gr-logo)"/><path d="M120 0V36" stroke="${MAU.do}" stroke-width="4" stroke-linecap="round"/>`,
    sai: () => `${nenCaRo}<circle cx="120" cy="72" r="50" fill="url(#gr-logo)"/><circle cx="120" cy="36" r="7" fill="${MAU.trang}"/><path d="M120 0V20" stroke="${MAU.do}" stroke-width="4" stroke-linecap="round"/>`,
    vi: 'Vòng trắng đặt lên chỉ là sơn. Lỗ thật phải dùng phép Khoét để nền lộ qua.',
  },
  {
    goi: 2, k: 'ghep-hinh', hoi: 'Khiên cần có hai vai. Bản nào làm đúng thứ tự?',
    dung: () => `${nenCaRo}<path transform="translate(39 -2.5) scale(.45)" d="M84 30H276V150A123 123 0 0 1 180 270A123 123 0 0 1 84 150Z" fill="${MAU.teal}"/>`,
    sai: () => `${nenCaRo}<path transform="translate(39 -2.5) scale(.45)" d="M180 30A123 123 0 0 1 180 270A123 123 0 0 1 180 30Z" fill="${MAU.teal}"/>`,
    vi: 'Giữ chung bỏ mọi thứ ngoài phần trùng, kể cả vai đã gộp từ trước. Có phần chung rồi mới gộp vai.',
  },
  {
    goi: 2, k: 'dinh-dang', hoi: 'Logo lên áo tím, tệp nào đúng?',
    dung: () => `<rect width="240" height="130" fill="${MAU.ao}"/>${datVao(logoLong(), 120, 65, 96, 96)}`,
    sai: () => `<rect width="240" height="130" fill="${MAU.ao}"/><rect x="66" y="11" width="108" height="108" fill="${MAU.trang}"/>${datVao(logoLong(), 120, 65, 96, 96)}`,
    vi: 'JPG không có nền trong suốt nên lộ khung trắng. PNG trong suốt hoặc SVG mới hợp.',
  },
  {
    goi: 3, k: 'histogram', hoi: 'Ảnh nào chiếu lên màn nhìn rõ?',
    dung: () => hoiTruong(),
    sai: () => `${hoiTruong()}<rect width="240" height="130" fill="${MAU.man}" opacity=".76"/>`,
    vi: 'Cột histogram dồn về bên trái là ảnh tối. Tăng sáng rồi giãn tương phản.',
  },
  {
    goi: 3, k: 'histogram', hoi: 'Ảnh nào còn chi tiết ở cửa sổ?',
    dung: () => hoiTruong(),
    sai: () => `${hoiTruong()}<rect width="240" height="130" fill="${MAU.trang}" opacity=".6"/><rect x="18" y="12" width="54" height="60" fill="${MAU.trang}"/>`,
    vi: 'Sáng quá tay thì cửa sổ cháy trắng, mất luôn khung cửa. Vạch đỏ cuối biểu đồ đã báo trước.',
  },
  {
    goi: 3, k: 'chay-sang', hoi: 'Bản nào còn cứu được nếp áo?',
    dung: () => doiAoTrang(true),
    sai: () => doiAoTrang(false),
    vi: 'Đã cháy và lưu đè thì vải với nếp cùng một màu trắng, kéo tối lại chỉ ra mảng xám. Phải quay về bản gốc.',
  },
  {
    goi: 3, k: 'dua-than', hoi: 'Bản nào tách nền sạch?',
    dung: () => `${nenPoster}${datVao(robot(0, { tay: 'hong' }), 120, 65, 94, 118, 0, 120, 150)}`,
    sai: () => `${nenPoster}<path d="M60 10h60v20h46v50h20v44H78v-20H54z" fill="${MAU.xam}"/>${datVao(robot(0, { tay: 'hong' }), 120, 65, 94, 118, 0, 120, 150)}`,
    vi: 'Còn sót mảng nền quanh rô bốt thì ghép lên poster nhìn như dán băng keo. Sửa bằng cọ xóa.',
  },
  {
    goi: 3, k: 'tuong-phan-chu', hoi: 'Chữ nào đọc được từ cách 3 mét?',
    dung: () => `${hoiTruong()}<rect y="88" width="240" height="42" fill="${MAU.muc}"/>${chu(120, 118, 'NGÀY HỘI', 28)}`,
    sai: () => `${hoiTruong()}${chu(120, 68, 'NGÀY HỘI TIN HỌC', 10, MAU.tuong, 500)}`,
    vi: 'Chữ nhỏ, sáng trên nền lốm đốm thì chìm. Thêm dải nền, tăng cỡ, đặt tránh chủ thể.',
  },
  {
    goi: 4, k: 'khung-hinh', hoi: 'Ảnh động nào vẫy tay mượt hơn?',
    dung: () => `${nenTrang}${hinhAnhDong([0, 10, 20, 30, 20, 10])}`,
    sai: () => `${nenTrang}${hinhAnhDong([0, 30, 5, 30, 0, 22], ['mo', 'mo', 'nham', 'mo', 'nham', 'mo'])}`,
    vi: 'Góc tay đổi đều từng chút và trở về khung đầu thì lặp liền mạch. Khung nhắm mắt lọt vào sẽ thấy giật.',
  },
  {
    goi: 4, k: 'thoi-gian-khung', hoi: 'Rô bốt nào chớp mắt tự nhiên?',
    dung: () => `${nenTrang}${hinhAnhDong([0, 0, 0, 0], ['mo', 'lim', 'nham', 'lim'], [2000, 100, 100, 100])}`,
    sai: () => `${nenTrang}${hinhAnhDong([0, 0, 0, 0], ['mo', 'lim', 'nham', 'lim'], [300, 300, 300, 300])}`,
    vi: 'Khung nào cũng bằng nhau thì mắt nháy liên hồi. Khung mở mắt để lâu, khung chớp để thật ngắn mới giống thật.',
  },
  {
    goi: 4, k: 'bezier', hoi: 'Cánh tay nào có khuỷu bo mềm?',
    dung: () => canhTay('C238 178 228 216 200 220C176 224 140 214 107 208'),
    sai: () => canhTay('L203 220'),
    vi: 'Nút góc chỉ tạo đoạn thẳng nên khuỷu gãy như ê ke. Đổi nút khuỷu thành nút trơn là đường bo theo.',
  },
  {
    goi: 4, k: 'dong-thoi-gian', hoi: 'Phim nào vừa khung chiếu 30 giây?',
    dung: () => dongPhim([6, 8, 7, 6, 3], 'Hết phim đúng vạch vàng'),
    sai: () => dongPhim([8, 9, 8, 6, 3], 'Lố vạch, khung chiếu cắt mất đoạn kết'),
    vi: 'Cắt bớt đầu, cuối từng đoạn không làm hỏng tệp gốc, cứ nới lại được.',
  },
  {
    goi: 4, k: 'am-nhac', hoi: 'Nhạc nền nào đúng cách?',
    dung: () => `<rect width="240" height="130" fill="${MAU.muc}"/>${songNhac(24, true)}${chu(120, 122, 'Nhỏ hơn lời nói, mờ dần ở cuối', 11, MAU.trang, 600)}`,
    sai: () => `<rect width="240" height="130" fill="${MAU.muc}"/>${songNhac(72, false)}${chu(120, 122, 'To hết cỡ, tắt cái rụp', 11, MAU.trang, 600)}`,
    vi: 'Nhạc phải nhỏ hơn lời nói, kết thúc cùng hình và mờ dần chứ không tắt đột ngột.',
  },
];
