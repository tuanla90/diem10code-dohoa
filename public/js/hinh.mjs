// Tranh dùng trong game, viết tay bằng SVG. Bảng màu tranh chỉ nằm ở đây (và toan/anh.mjs cho ảnh điểm).
// Không có hàm nào chạm DOM, nên máy kiểm trên Node nhập được.
import { trongHinh } from './toan/hinh-hoc.mjs';

export const MAU = {
  tim: '#6d5df6', giua: '#a35cf0', hong: '#ec6fbf', muc: '#1e1b4b', chan: '#4f46e5', trang: '#ffffff',
  vang: '#fbbf24', cam: '#f97316', cyan: '#22d3ee', xanh: '#34d399', do: '#e11d48', xam: '#94a3b8',
  xamNhat: '#e2e8f0', tuong: '#f1eefb', san: '#d6d0ee', go: '#a16207', troi: '#e0f2fe', ao: '#6d28d9', aoVien: '#5b21b6',
  teal: '#0d9488', man: '#0f0d2e',
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
  { id: 'hd3', ten: 'An toàn mạng', ve: () => `<circle cx="50" cy="50" r="46" fill="#0d9488"/><path d="M50 20l24 9v18c0 16-10 27-24 33-14-6-24-17-24-33V29z" fill="${MAU.trang}"/><path d="M39 50l8 8 15-16" fill="none" stroke="#0d9488" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>` },
  { id: 'hd4', ten: 'Phim ngắn', ve: () => `<circle cx="50" cy="50" r="46" fill="${MAU.cam}"/><rect x="22" y="32" width="56" height="36" rx="6" fill="${MAU.trang}"/><path d="M44 41v18l15-9z" fill="${MAU.cam}"/>` },
  { id: 'hd5', ten: 'Rô bốt', ve: () => `<circle cx="50" cy="50" r="46" fill="${MAU.giua}"/><rect x="28" y="36" width="44" height="34" rx="8" fill="${MAU.trang}"/><circle cx="41" cy="52" r="5" fill="${MAU.muc}"/><circle cx="59" cy="52" r="5" fill="${MAU.muc}"/><path d="M50 36V24" stroke="${MAU.trang}" stroke-width="5" stroke-linecap="round"/><circle cx="50" cy="22" r="5" fill="${MAU.vang}"/>` },
];

// Rô bốt trưng bày, tay phải giơ theo góc. Khung 120x150.
export function robot(goc = 0, { mat = 'mo', mau = MAU.chan } = {}) {
  const canh = -goc;
  const mt = mat === 'nham'
    ? `<path d="M40 42h12M68 42h12" stroke="${MAU.muc}" stroke-width="4" stroke-linecap="round"/>`
    : `<circle cx="46" cy="42" r="6" fill="${MAU.muc}"/><circle cx="74" cy="42" r="6" fill="${MAU.muc}"/>`;
  return `<path d="M60 24V10" stroke="${MAU.muc}" stroke-width="4" stroke-linecap="round"/><circle cx="60" cy="9" r="5" fill="${MAU.vang}"/>
  <rect x="30" y="22" width="60" height="42" rx="11" fill="${MAU.xamNhat}" stroke="${MAU.muc}" stroke-width="3"/>${mt}
  <rect x="36" y="68" width="48" height="50" rx="9" fill="${mau}" stroke="${MAU.muc}" stroke-width="3"/><circle cx="60" cy="92" r="9" fill="${MAU.cyan}"/>
  <path d="M36 80L18 104" stroke="${MAU.muc}" stroke-width="8" stroke-linecap="round"/>
  <g transform="rotate(${canh} 84 78)"><path d="M84 78L108 58" stroke="${MAU.muc}" stroke-width="8" stroke-linecap="round"/><circle cx="110" cy="56" r="6" fill="${MAU.cam}"/></g>
  <rect x="42" y="118" width="12" height="20" rx="3" fill="${MAU.muc}"/><rect x="66" y="118" width="12" height="20" rx="3" fill="${MAU.muc}"/>`;
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
