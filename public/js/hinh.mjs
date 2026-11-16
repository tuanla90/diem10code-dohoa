// Tranh dùng trong game, viết tay bằng SVG. Bảng màu tranh chỉ nằm ở đây (và toan/anh.mjs cho ảnh điểm).
// Không có hàm nào chạm DOM, nên máy kiểm trên Node nhập được.
import { trongHinh } from './toan/hinh-hoc.mjs';

export const MAU = {
  tim: '#6d5df6', giua: '#a35cf0', hong: '#ec6fbf', muc: '#1e1b4b', chan: '#4f46e5', trang: '#ffffff',
  vang: '#fbbf24', cam: '#f97316', cyan: '#22d3ee', xanh: '#34d399', do: '#e11d48', xam: '#94a3b8',
  xamNhat: '#e2e8f0', tuong: '#f1eefb', san: '#d6d0ee', go: '#a16207', troi: '#e0f2fe', ao: '#6d28d9', aoVien: '#5b21b6',
  teal: '#0d9488', man: '#0f0d2e',
  vo: '#ffffff', voToi: '#cad5f2', voGhep: '#c4bbea', tai: '#9ba8d5', co: '#6b78ab',
  manXanhDam: '#2a5be8', manXanh: '#2f86f2', manXanhSang: '#45c1fb', dongTu: '#0b1650', ngucVien: '#161a36',
  kinhToi: '#14123a', kinhSang: '#262a70', matSang: '#e0fbff', banh: '#3b3d63', banhGach: '#8b98c8',
};

export function saoPath(cx, cy, r, r2 = r * 0.45, n = 5) {
  let d = '';
  for (let i = 0; i < n * 2; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / n;
    const rr = i % 2 ? r2 : r;
    d += `${i ? 'L' : 'M'}${(cx + rr * Math.cos(a)).toFixed(1)} ${(cy + rr * Math.sin(a)).toFixed(1)}`;
  }
  return d + 'Z';
}

// Năm mảnh của logo CLB, trong hệ toạ độ 100x100. hop = khung chứa để máy biết mảnh nào đè mảnh nào.
export const MANH_LOGO = {
  nen: { ten: 'Nền tròn', hop: [2, 2, 96, 96], ve: () => `<circle cx="50" cy="50" r="48" fill="url(#gr-logo)"/>` },
  vong: { ten: 'Vòng trong', hop: [12, 12, 76, 76], ve: () => `<circle cx="50" cy="50" r="38" fill="none" stroke="${MAU.trang}" stroke-width="3" opacity=".75"/>` },
  dai: { ten: 'Dải tên', hop: [4, 54, 92, 24], ve: () => `<rect x="4" y="54" width="92" height="24" rx="5" fill="${MAU.muc}"/>` },
  sao: { ten: 'Ngôi sao', hop: [32, 14, 36, 36], ve: () => `<path d="${saoPath(50, 33, 19)}" fill="${MAU.vang}"/>` },
  chu: { ten: 'Chữ TIN HỌC', hop: [14, 58, 72, 16], ve: () => `<text x="50" y="71" text-anchor="middle" font-size="15" font-weight="800" fill="${MAU.trang}" font-family="var(--font)">TIN HỌC</text>` },
};
export const THU_TU_LOGO = ['nen', 'vong', 'dai', 'sao', 'chu'];

export function logoLong() {
  return THU_TU_LOGO.map((k) => MANH_LOGO[k].ve()).join('');
}

// Đặt tranh có khung gốc (rong x cao) vào khung tâm x,y cỡ w,h, xoay goc độ.
export function datVao(tranh, x, y, w, h, goc = 0, rong = 100, cao = 100) {
  return `<g transform="translate(${x} ${y}) rotate(${goc}) translate(${-w / 2} ${-h / 2}) scale(${w / rong} ${h / cao})">${tranh}</g>`;
}

export function tieuDe() {
  return `<rect width="200" height="50" rx="10" fill="${MAU.trang}"/><text x="100" y="33" text-anchor="middle" font-size="20" font-weight="800" fill="${MAU.chan}" font-family="var(--font)">NGÀY HỘI TIN HỌC</text>`;
}

/**
 * Vẽ standee rô bốt cắt viền trắng có chân đế sắt (khung 90x130):
 * rô bốt CLB chống hông trái, tay phải giơ mũi tên vàng mời khách vào gian hàng ở giữa.
 * @returns {string} Chuỗi SVG standee rô bốt bên trái.
 */
export function standeeRobot() {
  const bia = `<rect x="5.5" y="24" width="61" height="90" rx="18"/><circle cx="36" cy="21.5" r="8"/><path d="M55 51H69V43L83.5 64L69 85V77H55Z"/>`;
  return `<rect x="10" y="117" width="54" height="7" rx="3.5" fill="${MAU.muc}"/>
    <rect x="17" y="119.2" width="40" height="2.2" rx="1.1" fill="${MAU.banhGach}"/>
    <g fill="${MAU.muc}" stroke="${MAU.muc}" stroke-width="5" stroke-linejoin="round">${bia}</g>
    <g fill="${MAU.trang}">${bia}</g>
    <rect x="13" y="102" width="46" height="5" rx="2.5" fill="${MAU.voToi}"/>
    ${datVao(robot(0, { tay: 'mot', liec: 0.45 }), 36, 61.5, 69.6, 87, 0, 120, 150)}
    <circle cx="48" cy="66.5" r="3" fill="${MAU.banh}" stroke="${MAU.muc}" stroke-width="1.6"/>
    <path d="M48 66.5L54 66L60 64.5" fill="none" stroke="${MAU.muc}" stroke-width="5.6" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M48 66.5L54 66L60 64.5" fill="none" stroke="${MAU.vo}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="54" cy="66" r="2.6" fill="${MAU.tai}" stroke="${MAU.muc}" stroke-width="1.5"/>
    <path d="M58 58H69V50L81 64L69 78V70H58Z" fill="${MAU.vang}" stroke="${MAU.muc}" stroke-width="2.4" stroke-linejoin="round"/>
    <circle cx="59.5" cy="64" r="3.2" fill="${MAU.manXanhSang}" stroke="${MAU.muc}" stroke-width="1.7"/>
    <rect x="20" y="109" width="7" height="9" rx="1.5" fill="${MAU.banh}" stroke="${MAU.muc}" stroke-width="1.8"/>
    <rect x="45" y="109" width="7" height="9" rx="1.5" fill="${MAU.banh}" stroke="${MAU.muc}" stroke-width="1.8"/>`;
}

/**
 * Vẽ mũi tên chỉ đường vector với màu tô, màu viền, độ dày và kiểu nét tùy chỉnh.
 * @param {object} tt Thuộc tính tô và viền.
 * @returns {string} Chuỗi SVG mũi tên.
 */
export function muiTenChiDuong({ to = MAU.vang, vien = MAU.muc, day = 4, dut = false, d = 'M72 108H190V78L258 130L190 182V152H72Z' } = {}) {
  const netVien = vien && day > 0
    ? ` stroke="${vien}" stroke-width="${day}" stroke-linejoin="round"${dut ? ` stroke-dasharray="${Math.max(6, day * 1.4)} ${Math.max(5, day)}"` : ''}`
    : '';
  return `<path d="${d}" fill="${to}"${netVien}/>`;
}

// Màu của logo tại một điểm, để dựng bản ảnh điểm vỡ ô thật.
function mauLogoTai(u, v) {
  const dx = u - 50, dy = v - 50, r = Math.hypot(dx, dy);
  if (r > 48) return null;
  if (v > 54 && v < 78 && u > 4 && u < 96) {
    if (v > 60 && v < 72 && u > 15 && u < 85 && (Math.floor(u / 4) % 3 !== 2)) return MAU.trang;
    return MAU.muc;
  }
  if (trongHinh({ loai: 'sao', x: 50, y: 33, r: 19 }, u, v)) return MAU.vang;
  if (Math.abs(r - 38) < 1.6) return '#e9e4fb';
  const t = (u + v) / 200;
  return t < 0.5 ? (t < 0.3 ? MAU.tim : '#8460f3') : (t < 0.7 ? MAU.giua : (t < 0.85 ? '#c766d8' : MAU.hong));
}

const boNhoKhoi = new Map();
// Logo vẽ bằng n x n ô màu: đúng thứ người ta thấy khi phóng ảnh điểm quá cỡ.
export function logoKhoi(n) {
  if (boNhoKhoi.has(n)) return boNhoKhoi.get(n);
  const o = 100 / n;
  let s = `<g shape-rendering="crispEdges">`;
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) {
      const m = mauLogoTai((i + 0.5) * o, (j + 0.5) * o);
      if (m) s += `<rect x="${(i * o).toFixed(2)}" y="${(j * o).toFixed(2)}" width="${(o + 0.05).toFixed(2)}" height="${(o + 0.05).toFixed(2)}" fill="${m}"/>`;
    }
  }
  s += '</g>';
  boNhoKhoi.set(n, s);
  return s;
}

// Năm biểu tượng hoạt động của Ngày hội, khung 100x100.
export const BIEU_TUONG = [
  { id: 'hd1', ten: 'Lập trình', ve: () => `<circle cx="50" cy="50" r="46" fill="${MAU.chan}"/><path d="M38 34L22 50l16 16M62 34l16 16-16 16" fill="none" stroke="${MAU.trang}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>` },
  { id: 'hd2', ten: 'Poster', ve: () => `<circle cx="50" cy="50" r="46" fill="${MAU.hong}"/><rect x="30" y="24" width="40" height="52" rx="5" fill="${MAU.trang}"/><circle cx="50" cy="42" r="9" fill="${MAU.vang}"/><path d="M38 64h24" stroke="${MAU.muc}" stroke-width="5" stroke-linecap="round"/>` },
  // Khiên này là đúng hình người chơi dựng lại ở màn DH-3-5: phần chung hai hình tròn, gộp vai khiên, khoét dấu tích.
  { id: 'hd3', ten: 'An toàn mạng', ve: () => `<circle cx="50" cy="50" r="46" fill="${MAU.teal}"/><path d="M26 20H74V50A30.75 30.75 0 0 1 50 80A30.75 30.75 0 0 1 26 50Z" fill="${MAU.trang}"/><path d="M39 50l8 8 15-16" fill="none" stroke="${MAU.teal}" stroke-width="6"/>` },
  { id: 'hd4', ten: 'Phim ngắn', ve: () => `<circle cx="50" cy="50" r="46" fill="${MAU.cam}"/><rect x="22" y="32" width="56" height="36" rx="6" fill="${MAU.trang}"/><path d="M44 41v18l15-9z" fill="${MAU.cam}"/>` },
  { id: 'hd5', ten: 'Rô bốt', ve: () => `<circle cx="50" cy="50" r="46" fill="${MAU.giua}"/><path d="M50 31V20" stroke="${MAU.muc}" stroke-width="4" stroke-linecap="round"/><circle cx="50" cy="18" r="5.5" fill="${MAU.manXanhSang}" stroke="${MAU.muc}" stroke-width="2.2"/><rect x="15" y="44" width="8" height="18" rx="4" fill="${MAU.tai}" stroke="${MAU.muc}" stroke-width="2.2"/><rect x="77" y="44" width="8" height="18" rx="4" fill="${MAU.tai}" stroke="${MAU.muc}" stroke-width="2.2"/><rect x="20" y="29" width="60" height="47" rx="22" fill="${MAU.trang}" stroke="${MAU.muc}" stroke-width="2.6"/><rect x="24.5" y="33.5" width="51" height="38" rx="17" fill="url(#gr-r1-man)" stroke="${MAU.muc}" stroke-width="2.2"/><ellipse cx="39" cy="52" rx="5.6" ry="7.4" fill="${MAU.trang}"/><ellipse cx="39" cy="52.3" rx="4.1" ry="5.4" fill="url(#gr-r1-mat)"/><ellipse cx="39" cy="52.3" rx="1.9" ry="2.6" fill="${MAU.dongTu}"/><circle cx="37.5" cy="49.8" r="1.4" fill="${MAU.trang}"/><ellipse cx="61" cy="52" rx="5.6" ry="7.4" fill="${MAU.trang}"/><ellipse cx="61" cy="52.3" rx="4.1" ry="5.4" fill="url(#gr-r1-mat)"/><ellipse cx="61" cy="52.3" rx="1.9" ry="2.6" fill="${MAU.dongTu}"/><circle cx="59.5" cy="49.8" r="1.4" fill="${MAU.trang}"/><path d="M35 41q4-2.2 8 0M57 41q4-2.2 8 0M47.2 58q2.8 3 5.6 0" fill="none" stroke="${MAU.trang}" stroke-width="1.8" stroke-linecap="round"/>` },
];

// Rô bốt R1 đồng bộ thiết kế chuẩn với dự án physicraft (khung 120x150). Mọi nơi đều vẽ từ hàm này; ảnh chụp ở toan/anh.mjs dùng đúng số đo ROBOT.
// Đầu bầu viền trắng mảnh ôm màn hình xanh chuyển màu mượt gr-r1-man, thân quả lê bo tròn có cản gầm + màn ngực 3D, hai bánh đứng ở nửa dưới thân, tay bọc giáp kẹp chữ C.
// Hai tay dài bằng nhau. tay 'hong' tì nhẹ mép trên bánh xe chừa ô nền kín mỗi bên; tay thường buông thoáng trên bánh, tay vẫy đưa ra trước tai.
export const ROBOT = {
  dau: { x: 16, y: 18, w: 88, h: 59, r: 28 }, dauSang: { x: 18, y: 19.5, w: 81, h: 53, r: 25 },
  tai: [{ x: 9, y: 38, w: 11, h: 24, r: 5.5 }, { x: 100, y: 38, w: 11, h: 24, r: 5.5 }],
  co: { x: 46, y: 71, w: 28, h: 9, r: 4 },
  than: { x: 34, y: 75, w: 52, h: 42, r: 19 }, thanSang: { x: 36.2, y: 77, w: 44, h: 35, r: 15 },
  gam: { x: 43, y: 114, w: 34, h: 9, r: 4 },
  ngucVien: { x: 47, y: 89, w: 26, h: 17, r: 6 }, ngucMan: { x: 50, y: 92, w: 20, h: 11, r: 3.5 },
  kinh: { x: 21.5, y: 23.5, w: 77, h: 48.5, r: 22 },
  matTam: [[45, 48.5], [75, 48.5]], matRx: 8.2, matRy: 10.8,
  anTen: { x: 60, y1: 19, y2: 10, yCham: 6, r: 5.2, day: 3.5 },
  truc: [{ x: 24, y: 110, w: 12, h: 11, r: 3 }, { x: 84, y: 110, w: 12, h: 11, r: 3 }],
  mam: [[28.5, 115.5], [91.5, 115.5]],
  chan: [{ x: 8, y: 104, w: 17, h: 28, r: 7.2 }, { x: 95, y: 104, w: 17, h: 28, r: 7.2 }], gach: [111, 118, 125],
  tay: 8.2, vien: 3, vienChi: 2.4, banTay: 4,
  buong: [[36, 82], [17, 88], [13.5, 96]],
  hong: [[[36, 82], [8, 86], [16.5, 99.5]], [[84, 82], [112, 86], [103.5, 99.5]]], // điểm đầu nằm khuất sau thân
  vay: [[84, 82], [104, 86], [112, 71]],
};

export function robot(goc = 0, { mat = 'mo', tay = '', thepTay = false, liec = 0 } = {}) {
  const R = ROBOT;
  const hop = (h) => `x="${h.x}" y="${h.y}" width="${h.w}" height="${h.h}" rx="${h.r || 0}"`;
  const duong = (d) => `M${d.map((p) => p.join(' ')).join('L')}`;
  const tron = (x, y, r, to, vien = 0) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${to}"${vien ? ` stroke="${MAU.muc}" stroke-width="${vien}"` : ''}/>`;
  const veMatMo = ([cx, cy]) => {
    const dx = liec * 2.4;
    return `<ellipse cx="${cx}" cy="${cy}" rx="${R.matRx}" ry="${R.matRy}" fill="${MAU.trang}"/>
      <ellipse cx="${cx + dx}" cy="${cy + 0.3}" rx="6.1" ry="8" fill="url(#gr-r1-mat)" stroke="${MAU.manXanhSang}" stroke-width=".9"/>
      <ellipse cx="${cx + dx * 1.1}" cy="${cy + 0.3}" rx="2.7" ry="3.7" fill="${MAU.dongTu}"/>
      <ellipse cx="${cx - 2 + dx * 0.5}" cy="${cy - 3.1}" rx="2" ry="2.5" fill="${MAU.trang}"/>
      <circle cx="${cx + 2.2 + dx * 0.5}" cy="${cy + 3}" r="1" fill="${MAU.trang}"/>`;
  };
  const mieng = `<path d="M56.5 56.8q3.5 3.6 7 0" fill="none" stroke="${MAU.trang}" stroke-width="2.1" stroke-linecap="round"/>`;
  const mt = mat === 'nham'
    ? R.matTam.map(([cx, cy]) => `<path d="M${cx - 6.5} ${cy + 1.8}q6.5 4.8 13 0" fill="none" stroke="${MAU.trang}" stroke-width="2.9" stroke-linecap="round"/><path d="M${cx - 5.8} ${cy - 9.5}q5.8-1.6 11.6 0" fill="none" stroke="${MAU.trang}" stroke-width="1.9" stroke-linecap="round"/>`).join('') + mieng
    : mat === 'lim'
      ? R.matTam.map(([cx, cy]) => `<path d="M${cx - 6.8} ${cy + 0.6}C${cx - 3.6} ${cy + 2.8} ${cx + 3.6} ${cy + 2.8} ${cx + 6.8} ${cy + 0.6}C${cx + 4.6} ${cy + 5.6} ${cx - 4.6} ${cy + 5.6} ${cx - 6.8} ${cy + 0.6}Z" fill="${MAU.trang}" stroke="${MAU.trang}" stroke-width="1.5" stroke-linejoin="round"/><path d="M${cx - 5.8} ${cy - 10.5}q5.8-2 11.6 0" fill="none" stroke="${MAU.trang}" stroke-width="1.9" stroke-linecap="round"/>`).join('') + mieng
      : mat === 'vui'
        ? R.matTam.map(([cx, cy]) => `<path d="M${cx - 6.5} ${cy + 2.5}q6.5-8.2 13 0" fill="none" stroke="${MAU.trang}" stroke-width="3.1" stroke-linecap="round"/><path d="M${cx - 6} ${cy - 13.5}q6-3 12 0" fill="none" stroke="${MAU.trang}" stroke-width="2" stroke-linecap="round"/>`).join('') + `<path d="M56 56.5q4 4.2 8 0" fill="none" stroke="${MAU.trang}" stroke-width="2.2" stroke-linecap="round"/>`
        : R.matTam.map((p) => veMatMo(p) + `<path d="M${p[0] - 6} ${p[1] - 13.8}q6-2.8 12 0" fill="none" stroke="${MAU.trang}" stroke-width="2" stroke-linecap="round"/>`).join('') + mieng;
  const veTay = (d, g = 0) => {
    const net = (mauNet, day, doan) => `<path d="${duong(doan)}" fill="none" stroke="${mauNet}" stroke-width="${day}" stroke-linecap="round" stroke-linejoin="round"/>`;
    const khuc = (doan) => net(thepTay ? MAU.xam : MAU.muc, R.tay, doan) + net(thepTay ? MAU.xamNhat : MAU.voToi, R.tay * 0.56, doan) + net(thepTay ? MAU.trang : MAU.vo, R.tay * 0.28, doan);
    const gocCang = (Math.atan2(d[2][1] - d[1][1], d[2][0] - d[1][0]) * 180) / Math.PI;
    const kep = `<g transform="translate(${d[2][0]} ${d[2][1]}) rotate(${gocCang.toFixed(1)})">
      <path d="M-1 -4.4C3 -7.4 8.8 -5.8 9.6 -1.9L6.2 -1.3C5.6 -3 3.2 -3.6 1.5 -2V2C3.2 3.6 5.6 3 6.2 1.3L9.6 1.9C8.8 5.8 3 7.4 -1 4.4Z" fill="${MAU.tai}" stroke="${MAU.muc}" stroke-width="2" stroke-linejoin="round"/>
      ${tron(0, 0, R.banTay, MAU.manXanhSang, 2)}<circle cx="-1" cy="-1" r="1.1" fill="${MAU.trang}"/>
    </g>`;
    const khuyu = tron(d[1][0], d[1][1], 4.2, thepTay ? MAU.xamNhat : MAU.tai, thepTay ? 0 : 2) + tron(d[1][0], d[1][1], 1.5, thepTay ? MAU.xam : MAU.manXanhSang);
    return [`${tron(d[0][0], d[0][1], 4.8, MAU.banh, 2.2)}${khuc(d.slice(0, 2))}`, `<g transform="rotate(${-g} ${d[1].join(' ')})">${khuc(d.slice(1))}${khuyu}${kep}</g>`];
  };
  // tay 'mot' chỉ còn tay trái (dùng ở màn tự vẽ cánh tay vẫy); cẳng tay vẽ sau đầu để lúc giơ vẫy không bị lấp sau tai.
  const dsTay = tay === 'hong' ? R.hong.map((d) => veTay(d)) : tay === 'mot' ? [veTay(R.buong)] : [veTay(R.buong), veTay(R.vay, goc)];
  const taySau = dsTay.map((t) => t[0]).join(''), tayTruoc = dsTay.map((t) => t[1]).join('');
  const banhXe = R.chan.map((c, idx) => {
    const tr = R.truc[idx], [mx, my] = R.mam[idx];
    return `<rect ${hop(tr)} fill="${MAU.banh}" stroke="${MAU.muc}" stroke-width="2.2"/>
      ${tron(mx, my, 5.2, MAU.tai, 2.1)}${tron(mx, my, 1.9, MAU.manXanhSang, 1.2)}
      <rect ${hop(c)} fill="${MAU.banh}" stroke="${MAU.muc}" stroke-width="${R.vienChi}"/>
      <rect x="${c.x + 2.4}" y="${c.y + 3}" width="2.8" height="${c.h - 6}" rx="1.4" fill="${MAU.banhGach}" opacity=".45"/>
      ${R.gach.map((y) => `<rect x="${c.x + 1.5}" y="${y - 1.6}" width="${c.w - 3}" height="3.2" rx="1.5" fill="${MAU.banhGach}" stroke="${MAU.muc}" stroke-width="1.3"/>`).join('')}`;
  }).join('');
  const thanBau = `<path d="M43 114H77L74.5 121.5C74 122.8 72.2 123.5 69.5 123.5H50.5C47.8 123.5 46 122.8 45.5 121.5Z" fill="${MAU.co}" stroke="${MAU.muc}" stroke-width="2.2" stroke-linejoin="round"/>
    <rect x="50" y="117.5" width="20" height="2.4" rx="1.2" fill="${MAU.banhGach}"/>
    <path d="M60 75C78 75 86.5 85 87 100.5C87.4 112 79.5 117.5 60 117.5C40.5 117.5 32.6 112 33 100.5C33.5 85 42 75 60 75Z" fill="${MAU.voToi}" stroke="${MAU.muc}" stroke-width="${R.vien}"/>
    <path d="M58 76.8C73.5 76.8 81 85.2 81.5 98.5C81.9 108 74.5 113 58 113C41.5 113 34.6 108 35 98.5C35.4 85.2 42.5 76.8 58 76.8Z" fill="${MAU.vo}"/>
    <ellipse cx="44" cy="83.5" rx="6.2" ry="2.2" transform="rotate(-24 44 83.5)" fill="${MAU.trang}"/>
    <path d="M37 109.5C45.5 113 74.5 113 83 109.5" fill="none" stroke="${MAU.banhGach}" stroke-width="1.3" stroke-linecap="round" opacity=".55"/>`;
  const ngucMan = `<rect x="46" y="89" width="28" height="18" rx="6.5" fill="${MAU.voToi}"/>
    <rect ${hop(R.ngucVien)} fill="${MAU.ngucVien}" stroke="${MAU.muc}" stroke-width="2.1"/>
    <rect ${hop(R.ngucMan)} fill="${MAU.manXanhSang}"/>
    <path d="M53 103H66.5A3.5 3.5 0 0070 99.5V95C67 99.5 61 101.8 53 103Z" fill="${MAU.manXanh}" opacity=".6"/>
    <ellipse cx="54.5" cy="94.8" rx="3.2" ry="1.1" transform="rotate(-12 54.5 94.8)" fill="${MAU.trang}"/>`;
  const coRobot = `<path d="M46.5 71.5C46.5 70.2 52.5 69.8 60 69.8C67.5 69.8 73.5 70.2 73.5 71.5L74.8 77C74.8 79.4 68.2 80.4 60 80.4C51.8 80.4 45.2 79.4 45.2 77Z" fill="${MAU.co}" stroke="${MAU.muc}" stroke-width="2.2" stroke-linejoin="round"/>
    <rect x="53.5" y="74.2" width="13" height="2.6" rx="1.3" fill="${MAU.manXanhSang}" stroke="${MAU.muc}" stroke-width="1.1"/>`;
  const voDau = 'M60 18C88 18 103.5 32.5 104 53C104.3 68.5 94.5 76.5 76 77H44C25.5 76.5 15.7 68.5 16 53C16.5 32.5 32 18 60 18Z';
  const dauRobot = `<path d="M21 38C12 38.5 8.5 43.5 8.5 52C8.5 60.5 12 65.5 21.5 66Z" fill="${MAU.tai}" stroke="${MAU.muc}" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M99 38C108 38.5 111.5 43.5 111.5 52C111.5 60.5 108 65.5 98.5 66Z" fill="${MAU.tai}" stroke="${MAU.muc}" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="${voDau}" fill="${MAU.voToi}"/>
    <path d="M58.5 19.5C84.5 19.5 99 33 99.5 51.5C99.8 66 90.5 73 73 73.5H43C26.5 73 17.5 66 17.8 51.5C18.2 33 32.5 19.5 58.5 19.5Z" fill="${MAU.vo}"/>
    <path d="${voDau}" fill="none" stroke="${MAU.muc}" stroke-width="${R.vien}" stroke-linejoin="round"/>
    <path d="M60 23.5C84.5 23.5 98 36 98.5 53.5C98.8 66.5 91 71.5 76.5 72H43.5C29 71.5 21.2 66.5 21.5 53.5C22 36 35.5 23.5 60 23.5Z" fill="url(#gr-r1-man)" stroke="${MAU.muc}" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M26.5 43.5C28.8 32.5 38.5 26.8 52.5 26.2C41 28 32.2 34 28.5 44Z" fill="${MAU.trang}" opacity=".18"/>`;
  return `${banhXe}${taySau}${thanBau}${ngucMan}${coRobot}
    <path d="M${R.anTen.x} ${R.anTen.y1}V${R.anTen.y2}" stroke="${MAU.muc}" stroke-width="${R.anTen.day}" stroke-linecap="round"/>${tron(R.anTen.x, R.anTen.yCham, R.anTen.r, MAU.manXanhSang, 2.2)}<circle cx="${R.anTen.x - 1.5}" cy="${R.anTen.yCham - 1.5}" r="1.5" fill="${MAU.trang}"/>
    ${dauRobot}${mt}${tayTruoc}`;
}

// Tranh màn đầu: băng rôn trước cổng, có tay nắm chỉnh sửa của phần mềm đồ họa.
export function tranhMoDau() {
  return `<svg class="tranh-mo" viewBox="0 0 360 170" role="img" aria-label="Băng rôn Ngày hội Tin học trước cổng trường, đang được chỉnh trong phần mềm đồ họa">
    <rect width="360" height="170" fill="url(#gr-troi)"/>
    <rect y="136" width="360" height="34" fill="${MAU.san}"/>
    <rect x="26" y="26" width="10" height="112" rx="3" fill="${MAU.muc}"/><rect x="324" y="26" width="10" height="112" rx="3" fill="${MAU.muc}"/>
    <rect x="36" y="34" width="288" height="72" rx="6" fill="url(#gr-poster)"/>
    ${datVao(logoLong(), 84, 70, 56, 56)}
    <text x="118" y="66" font-size="20" font-weight="800" fill="${MAU.trang}" font-family="var(--font)">NGÀY HỘI</text>
    <text x="118" y="90" font-size="20" font-weight="800" fill="${MAU.vang}" font-family="var(--font)">TIN HỌC</text>
    <g fill="${MAU.trang}" stroke="${MAU.chan}" stroke-width="2"><rect x="50" y="36" width="10" height="10" rx="2"/><rect x="108" y="36" width="10" height="10" rx="2"/><rect x="50" y="94" width="10" height="10" rx="2"/><rect x="108" y="94" width="10" height="10" rx="2"/></g>
    <rect x="55" y="41" width="58" height="58" fill="none" stroke="${MAU.chan}" stroke-width="1.6" stroke-dasharray="5 4"/>
    <path d="M250 112c20 16 44 14 58-2" fill="none" stroke="${MAU.muc}" stroke-width="2.6"/><g fill="${MAU.trang}" stroke="${MAU.muc}" stroke-width="2.2"><circle cx="250" cy="112" r="6"/><circle cx="308" cy="110" r="6"/></g>
    <path d="M250 112L222 136M250 112l38 26" stroke="${MAU.hong}" stroke-width="2"/><circle cx="222" cy="136" r="4" fill="${MAU.hong}"/><circle cx="288" cy="138" r="4" fill="${MAU.hong}"/>
  </svg>`;
}

// Bìa năm gói. Cùng một khung 360x130; khi vào ô vuông thì tự cắt phần giữa (slice).
export function biaGoi(i, nhan = '') {
  const noi = [
    () => `<rect width="360" height="130" fill="url(#gr-troi)"/><rect x="90" y="24" width="180" height="82" rx="6" fill="url(#gr-poster)"/>${datVao(logoLong(), 180, 65, 62, 62)}`,
    () => `<rect width="360" height="130" fill="${MAU.tuong}"/>${datVao(MANH_LOGO.nen.ve(), 138, 66, 72, 72)}${datVao(MANH_LOGO.sao.ve(), 180, 44, 72, 72)}${datVao(MANH_LOGO.dai.ve() + MANH_LOGO.chu.ve(), 216, 76, 72, 72)}`,
    () => `<rect width="360" height="130" fill="${MAU.troi}"/><rect x="126" y="16" width="6" height="104" rx="3" fill="${MAU.muc}"/><path d="M132 22c30-18 50 14 100-2v62c-50 16-70-16-100 2z" fill="url(#gr-logo)"/><g fill="${MAU.trang}" stroke="${MAU.chan}" stroke-width="2.4"><circle cx="132" cy="22" r="5"/><circle cx="232" cy="20" r="5"/><circle cx="232" cy="82" r="5"/><circle cx="132" cy="84" r="5"/></g>`,
    () => `<rect width="360" height="130" fill="#272350"/><rect x="108" y="24" width="144" height="82" rx="5" fill="#4b3f9a"/><path d="M108 106l40-46 30 30 22-22 52 38z" fill="#7c6df0"/><circle cx="218" cy="48" r="11" fill="${MAU.vang}"/>`,
    () => `<rect width="360" height="130" fill="${MAU.muc}"/><g fill="${MAU.trang}" opacity=".9">${[0, 1, 2, 3, 4, 5, 6, 7, 8].map((k) => `<rect x="${24 + k * 36}" y="20" width="18" height="10" rx="2"/><rect x="${24 + k * 36}" y="100" width="18" height="10" rx="2"/>`).join('')}</g><rect x="120" y="38" width="120" height="54" rx="6" fill="url(#gr-logo)"/><path d="M170 50v30l26-15z" fill="${MAU.trang}"/>`,
  ];
  return `<svg viewBox="0 0 360 130" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${nhan}">${noi[i]()}</svg>`;
}
