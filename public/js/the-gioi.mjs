// Bản vẽ Ngày hội: sân trường ban đầu chỉ là nét vector, mỗi màn qua được lại tô màu một món đồ.
// Mỗi món chỉ vẽ một lần: bản nét là chính nó bọc trong .bv-net, CSS lột màu đi. Không chạm DOM.
import { MAU, datVao, logoLong, logoKhoi, BIEU_TUONG, robot, tieuDe } from './hinh.mjs';

export const W_BV = 360;
export const H_BV = 300;

const chu = (x, y, t, co, mau = MAU.trang, dam = 800, neo = 'middle') => `<text x="${x}" y="${y}" text-anchor="${neo}" font-size="${co}" font-weight="${dam}" fill="${mau}" font-family="var(--font)">${t}</text>`;

const hocSinh = (x, y, ao, k = 1) => `<g transform="translate(${x} ${y}) scale(${k})"><circle r="6.5" fill="${MAU.muc}"/><path d="M-10 25v-11a10 10 0 0120 0v11z" fill="${ao}"/></g>`;
const dayHuyHieu = (x, y, k = 1) => `<g transform="translate(${x} ${y}) scale(${k})"><path d="M-4 7l4 10 4-10" fill="none" stroke="${MAU.do}" stroke-width="1.6"/><circle cy="19" r="4" fill="${MAU.vang}" stroke="${MAU.trang}" stroke-width="1"/></g>`;

// Mỗi màn một món. hop là khung để vẽ tay nắm hồng cho món sắp tới.
export const MON = [
  {
    ma: 'DH-1-1', ten: 'Poster logo', noi: 'Bảng tin', hop: [14, 228, 26, 34],
    ve: () => `<rect x="10" y="222" width="66" height="46" rx="3" fill="${MAU.go}"/><rect x="13" y="225" width="60" height="40" rx="1.5" fill="${MAU.xamNhat}"/>
      <path d="M22 268v14M64 268v14" stroke="${MAU.go}" stroke-width="3"/>
      <rect x="16" y="228" width="25" height="34" rx="1.5" fill="url(#gr-poster)"/>${datVao(logoLong(), 28.5, 245, 19, 19)}`,
  },
  {
    ma: 'DH-1-2', ten: 'Poster tiêu đề', noi: 'Bảng tin', hop: [44, 228, 26, 34],
    ve: () => `<rect x="45" y="228" width="25" height="34" rx="1.5" fill="url(#gr-poster)"/>${datVao(logoLong(), 57.5, 240, 13, 13)}${datVao(tieuDe(), 57.5, 254, 21, 5.25, 0, 200, 50)}`,
  },
  {
    ma: 'DH-1-3', ten: 'Băng rôn cổng trường', noi: 'Cổng trường', hop: [50, 172, 260, 44],
    ve: () => `<rect x="50" y="170" width="6" height="84" rx="2" fill="${MAU.muc}"/><rect x="304" y="170" width="6" height="84" rx="2" fill="${MAU.muc}"/>
      <rect x="56" y="174" width="248" height="40" rx="3" fill="url(#gr-poster)"/>${datVao(logoLong(), 80, 194, 32, 32)}
      ${chu(190, 201, 'NGÀY HỘI TIN HỌC', 17, MAU.trang)}`,
  },
  {
    ma: 'DH-2-1', ten: 'Logo trên mái', noi: 'Dãy nhà chính', hop: [157, 38, 46, 46],
    ve: () => datVao(logoLong(), 180, 61, 44, 44),
  },
  {
    ma: 'DH-2-2', ten: 'Tấm dựng sảnh', noi: 'Sân trường', hop: [84, 224, 26, 50],
    ve: () => `<rect x="85" y="224" width="24" height="46" rx="2" fill="url(#gr-poster)"/>${datVao(logoLong(), 101, 233, 11, 11)}${datVao(tieuDe(), 97, 256, 18, 4.5, 0, 200, 50)}
      <path d="M90 270l-4 8M104 270l4 8" stroke="${MAU.muc}" stroke-width="2"/>`,
  },
  {
    ma: 'DH-2-3', ten: 'Năm gian hoạt động', noi: 'Trước dãy nhà', hop: [88, 145, 184, 24],
    ve: () => `<path d="M90 146h180" stroke="${MAU.muc}" stroke-width="1.6"/>${BIEU_TUONG.map((b, i) => datVao(b.ve(), 104 + i * 38, 157, 22, 22)).join('')}`,
  },
  {
    ma: 'DH-3-1', ten: 'Cờ đuôi nheo', noi: 'Cột cờ trái', hop: [16, 18, 50, 34],
    ve: () => `<rect x="13" y="12" width="4" height="164" rx="2" fill="${MAU.muc}"/><circle cx="15" cy="12" r="3.5" fill="${MAU.vang}"/>
      <path d="M17 18l48 4-13 13 13 13-48 3z" fill="url(#gr-logo)"/>`,
  },
  {
    ma: 'DH-3-2', ten: 'Cờ sóng', noi: 'Cột cờ phải', hop: [296, 18, 50, 34],
    ve: () => `<rect x="343" y="12" width="4" height="164" rx="2" fill="${MAU.muc}"/><circle cx="345" cy="12" r="3.5" fill="${MAU.vang}"/>
      <path d="M343 18c-14-7-30 7-46 0v32c16 7 32-7 46 0z" fill="url(#gr-logo)"/>`,
  },
  {
    ma: 'DH-3-3', ten: 'Huy hiệu đeo dây', noi: 'Trên áo đội', hop: [262, 232, 72, 46],
    ve: () => `${dayHuyHieu(274, 248, 0.9)}${dayHuyHieu(298, 244, 0.9)}${dayHuyHieu(322, 248, 0.9)}`,
  },
  {
    ma: 'DH-3-5', ten: 'Biển An toàn mạng', noi: 'Góc sân trái', hop: [22, 180, 26, 42],
    ve: () => `<path d="M35 204v18" stroke="${MAU.muc}" stroke-width="2.6"/>${datVao(BIEU_TUONG[2].ve(), 35, 193, 26, 26)}`,
  },
  {
    ma: 'DH-3-4', ten: 'Áo đội in logo', noi: 'Sân trường', hop: [260, 228, 76, 54],
    ve: () => `${hocSinh(274, 244, MAU.ao)}${hocSinh(298, 240, MAU.ao)}${hocSinh(322, 244, MAU.ao)}`,
  },
  {
    ma: 'DH-4-1', ten: 'Ảnh hội trường', noi: 'Cánh trái', hop: [84, 94, 42, 32],
    ve: () => `<rect x="84" y="94" width="42" height="32" rx="1.5" fill="${MAU.trang}" stroke="${MAU.muc}" stroke-width="1.4"/><rect x="87" y="97" width="36" height="26" fill="${MAU.vang}" opacity=".55"/>
      <rect x="87" y="110" width="36" height="13" fill="${MAU.chan}" opacity=".6"/><circle cx="96" cy="112" r="2.6" fill="${MAU.muc}"/><circle cx="105" cy="113" r="2.6" fill="${MAU.muc}"/><circle cx="114" cy="112" r="2.6" fill="${MAU.muc}"/>`,
  },
  {
    ma: 'DH-4-5', ten: 'Ảnh đội rô bốt', noi: 'Dây ảnh bên trái', hop: [20, 88, 46, 36],
    ve: () => `<path d="M17 88q27 7 55 0" fill="none" stroke="${MAU.muc}" stroke-width="1.4"/><g transform="rotate(-3 43 106)"><rect x="24" y="92" width="38" height="29" rx="1.5" fill="${MAU.trang}" stroke="${MAU.muc}" stroke-width="1.4"/><rect x="27" y="95" width="32" height="23" fill="${MAU.giua}"/>
      ${[33, 43, 53].map((x) => `<circle cx="${x}" cy="103" r="2.8" fill="${MAU.muc}"/><path d="M${x - 4} 118v-7a4 4 0 018 0v7z" fill="${MAU.trang}"/><path d="M${x} 110v7" stroke="${MAU.xam}" stroke-width=".8"/>`).join('')}</g><rect x="41" y="88" width="4" height="7" rx="1" fill="${MAU.cam}"/>`,
  },
  {
    ma: 'DH-4-2', ten: 'Rô bốt trưng bày', noi: 'Bục trưng bày', hop: [116, 226, 34, 50],
    ve: () => `${datVao(robot(0, { tay: 'hong' }), 133, 252, 30, 38, 0, 120, 150)}<rect x="118" y="266" width="30" height="8" rx="2" fill="${MAU.muc}"/>`,
  },
  {
    ma: 'DH-4-3', ten: 'Rô bốt tay thép', noi: 'Bục trưng bày', hop: [156, 226, 34, 50],
    ve: () => `${datVao(robot(0, { tay: 'hong', thepTay: true }), 173, 252, 30, 38, 0, 120, 150)}<rect x="158" y="266" width="30" height="8" rx="2" fill="${MAU.muc}"/>`,
  },
  {
    ma: 'DH-4-4', ten: 'Poster rô bốt', noi: 'Cánh phải', hop: [234, 88, 38, 50],
    ve: () => `<rect x="234" y="88" width="38" height="50" rx="1.5" fill="url(#gr-poster)"/>${datVao(robot(0), 253, 118, 22, 28, 0, 120, 150)}<rect x="238" y="92" width="30" height="8" rx="1" fill="${MAU.muc}"/>${chu(253, 98.5, 'RÔ BỐT', 6.4, MAU.vang)}`,
  },
  {
    ma: 'DH-5-4', ten: 'Bản vẽ cánh tay', noi: 'Bàn trước cổng', hop: [120, 276, 72, 22],
    ve: () => `<rect x="122" y="278" width="68" height="16" rx="2" fill="${MAU.chan}" stroke="${MAU.muc}" stroke-width="1.2"/><path d="M128 294l-3 5M184 294l3 5" stroke="${MAU.muc}" stroke-width="2"/>
      <path d="M132 283l26 3 8-5 8 3-11 8-31-2z" fill="${MAU.trang}"/><circle cx="170" cy="282" r="3" fill="${MAU.cyan}" stroke="${MAU.muc}" stroke-width=".8"/>`,
  },
  {
    ma: 'DH-5-1', ten: 'Ảnh động trên bảng số', noi: 'Bảng tin số', hop: [202, 226, 34, 50],
    ve: () => `<rect x="203" y="226" width="32" height="46" rx="5" fill="${MAU.muc}"/><rect x="206" y="230" width="26" height="38" rx="2" fill="${MAU.trang}"/>
      <g class="bv-vay">${datVao(robot(0), 219, 249, 22, 28, 0, 120, 150)}</g><path d="M219 272v6" stroke="${MAU.muc}" stroke-width="3"/>`,
  },
  {
    ma: 'DH-5-5', ten: 'Rô bốt chớp mắt', noi: 'Màn nhỏ cạnh bảng số', hop: [238, 234, 24, 44],
    ve: () => `<rect x="239" y="235" width="22" height="30" rx="3" fill="${MAU.muc}"/><rect x="241" y="237" width="18" height="26" rx="1.5" fill="${MAU.tuong}"/>${datVao(robot(0, { mat: 'lim', tay: 'hong' }), 250, 250, 16, 20, 0, 120, 150)}<path d="M250 265v12M245 278h10" stroke="${MAU.muc}" stroke-width="2.4"/>`,
  },
  {
    ma: 'DH-5-2', ten: 'Phim trên màn lớn', noi: 'Giữa dãy nhà', hop: [142, 90, 76, 46],
    ve: () => `<rect x="142" y="90" width="76" height="46" rx="3" fill="${MAU.man}"/><rect x="145" y="93" width="70" height="40" rx="1.5" fill="url(#gr-logo)"/>
      <path d="M173 104v18l15-9z" fill="${MAU.trang}"/><rect x="149" y="127" width="62" height="2.4" rx="1.2" fill="${MAU.trang}" opacity=".5"/><rect x="149" y="127" width="26" height="2.4" rx="1.2" fill="${MAU.vang}"/>`,
  },
  {
    ma: 'DH-5-3', ten: 'Nhạc và đèn', noi: 'Cổng trường', hop: [314, 186, 26, 66],
    ve: () => `<path d="M60 0L128 176h-36zM300 0l-68 176h36z" fill="${MAU.vang}" opacity=".17"/>
      <rect x="316" y="188" width="24" height="64" rx="3" fill="${MAU.muc}"/><circle cx="328" cy="204" r="7.5" fill="${MAU.xam}"/><circle cx="328" cy="204" r="3" fill="${MAU.muc}"/><circle cx="328" cy="232" r="10.5" fill="${MAU.xam}"/><circle cx="328" cy="232" r="4.2" fill="${MAU.muc}"/>
      <g class="bv-nhac" fill="none" stroke="${MAU.chan}" stroke-width="2" stroke-linecap="round"><path d="M304 170v-12l8-2v11"/></g>`,
  },
];

export const monCua = (ma) => MON.find((m) => m.ma === ma);

const toaNha = () => `<path d="M58 80L180 36l122 44z" fill="${MAU.chan}"/><rect x="72" y="78" width="216" height="62" fill="${MAU.tuong}" stroke="${MAU.muc}" stroke-width="1.4"/>
  <g fill="${MAU.troi}" stroke="${MAU.muc}" stroke-width="1">${[80, 130, 226, 276].map((x) => `<rect x="${x - 6}" y="86" width="12" height="16" rx="1"/><rect x="${x - 6}" y="112" width="12" height="16" rx="1"/>`).join('')}</g>`;

const dat = () => `<rect y="140" width="360" height="160" fill="${MAU.san}"/><path d="M0 152c70-14 130 4 180 0s130-12 180 2v-14H0z" fill="${MAU.xanh}" opacity=".32"/><path d="M120 300l40-58h40l40 58z" fill="${MAU.tuong}" opacity=".7"/>`;

const troi = () => `<rect width="360" height="150" fill="url(#gr-troi)"/><circle cx="302" cy="34" r="16" fill="${MAU.vang}" opacity=".82"/>
  <g fill="${MAU.trang}" opacity=".85"><ellipse cx="70" cy="30" rx="26" ry="7"/><ellipse cx="94" cy="24" rx="18" ry="6"/><ellipse cx="238" cy="20" rx="20" ry="5"/></g>`;

// Thứ tự vẽ: món ở xa trước, người ở gần sau. Huy hiệu phải nằm đè lên áo.
const THU_TU_VE = ['DH-5-3', 'DH-2-1', 'DH-5-2', 'DH-4-1', 'DH-4-4', 'DH-2-3', 'DH-3-1', 'DH-3-2', 'DH-3-5', 'DH-4-5', 'DH-1-3', 'DH-1-1', 'DH-1-2', 'DH-2-2', 'DH-4-2', 'DH-4-3', 'DH-5-1', 'DH-5-5', 'DH-3-4', 'DH-3-3', 'DH-5-4'];

function tayNam([x, y, w, h]) {
  const o = 4.5;
  const dinh = [[x, y], [x + w, y], [x, y + h], [x + w, y + h]];
  return `<g class="bv-ke"><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${MAU.hong}" stroke-width="1.6" stroke-dasharray="4 3"/>${dinh.map(([a, b]) => `<rect x="${a - o / 2}" y="${b - o / 2}" width="${o}" height="${o}" fill="${MAU.trang}" stroke="${MAU.hong}" stroke-width="1.5"/>`).join('')}</g>`;
}

// daXong(ma): món đã có màu chưa. ke: món sắp làm. moi: món vừa tô, chạy hiệu ứng.
export function banVe({ daXong, ke = null, moi = null, nhan = 'Bản vẽ Ngày hội' }) {
  const soXong = MON.filter((m) => daXong(m.ma)).length;
  const tile = soXong / MON.length;
  const mo = (tile * 0.9 + (soXong ? 0.1 : 0)).toFixed(2);
  const lop = THU_TU_VE.map((ma) => {
    const m = monCua(ma);
    if (!daXong(ma)) return `<g class="bv-net">${m.ve()}</g>`;
    const hieuUng = ma === moi ? ' bv-mau--moi' : '';
    return `<g class="bv-mau${hieuUng}">${m.ve()}</g>`;
  }).join('');
  const monMoi = moi ? monCua(moi) : null;
  return `<svg class="ban-ve" viewBox="0 0 ${W_BV} ${H_BV}" role="img" aria-label="${nhan}: ${soXong} trên ${MON.length} món đã có màu">
    <rect width="${W_BV}" height="${H_BV}" fill="var(--lom)"/><rect width="${W_BV}" height="${H_BV}" fill="url(#o-ban-ve)"/>
    <g class="bv-net">${toaNha()}<path d="M0 140h360"/></g>
    <g class="bv-nen" style="opacity:${mo}">${troi()}${dat()}${toaNha()}</g>
    ${lop}
    ${ke ? tayNam(monCua(ke).hop) : ''}
    ${monMoi ? `<circle class="bv-no" cx="${monMoi.hop[0] + monMoi.hop[2] / 2}" cy="${monMoi.hop[1] + monMoi.hop[3] / 2}" r="${Math.max(monMoi.hop[2], monMoi.hop[3]) / 2 + 6}" fill="none" stroke="${MAU.hong}" stroke-width="3"/>` : ''}
  </svg>`;
}

// Một món riêng, cắt sát theo khung của nó: bản nét khi chưa làm, bản màu khi đã xong.
export function tranhMon(ma, coMau) {
  const m = monCua(ma);
  if (!m) return '';
  const [x, y, w, h] = m.hop;
  const le = Math.max(w, h) * 0.14 + 3;
  // Món dài bẹt vẫn phải vừa ô vuông: nới cạnh ngắn cho khung gần vuông.
  const co = Math.max(w, h) + le * 2;
  const vx = x + w / 2 - co / 2, vy = y + h / 2 - co / 2;
  return `<svg class="tranh-mon" viewBox="${vx} ${vy} ${co} ${co}" aria-hidden="true"><g class="${coMau ? 'bv-mau' : 'bv-net'}">${m.ve()}</g></svg>`;
}

// Tranh hai năm: vỡ ô và lộ khung, dùng ở phần mở đầu.
export function tranhNamNgoaiBangRon() {
  return `<svg viewBox="0 0 360 200" role="img" aria-label="Băng rôn năm ngoái, logo vỡ thành từng ô vuông">
    <rect width="360" height="200" fill="url(#gr-troi)"/><rect y="164" width="360" height="36" fill="${MAU.san}"/>
    <rect x="18" y="20" width="8" height="150" rx="2" fill="${MAU.muc}"/><rect x="334" y="20" width="8" height="150" rx="2" fill="${MAU.muc}"/>
    <rect x="26" y="28" width="308" height="96" rx="3" fill="url(#gr-poster)"/>${datVao(logoKhoi(13), 84, 76, 88, 88)}
    ${chu(226, 72, 'NGÀY HỘI', 26, MAU.trang)}${chu(226, 102, 'TIN HỌC', 26, MAU.vang)}
    <g fill="${MAU.do}"><circle cx="84" cy="76" r="50" fill="none" stroke="${MAU.do}" stroke-width="3" stroke-dasharray="6 5"/></g>
  </svg>`;
}

export function tranhNamNgoaiAo() {
  return `<svg viewBox="0 0 360 200" role="img" aria-label="Áo tím in logo còn nguyên khung nền trắng">
    <rect width="360" height="200" fill="${MAU.tuong}"/>
    <path d="M114 22l40-14 26 14 26-14 40 14 34 52-34 16-14-22v118H128V68l-14 22-34-16z" fill="${MAU.ao}" stroke="${MAU.aoVien}" stroke-width="2"/>
    <rect x="144" y="56" width="72" height="72" fill="${MAU.trang}"/>${datVao(logoLong(), 180, 92, 62, 62)}
    <rect x="144" y="56" width="72" height="72" fill="none" stroke="${MAU.do}" stroke-width="2.5" stroke-dasharray="6 5"/>
  </svg>`;
}
