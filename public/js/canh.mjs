// Cảnh hậu quả: thành phẩm của người chơi đem ra đời thật. Lỗi nào trong thành phẩm thì hiện đúng lỗi ấy.
import { MAU, datVao, logoLong, logoKhoi, MANH_LOGO, BIEU_TUONG, robot, tieuDe } from './hinh.mjs';
import { duongSvg } from './toan/hinh-hoc.mjs';
import { apChinh } from './toan/anh.mjs';
import { veKetQua, W as W_GHEP, H as H_GHEP } from './co-khi/ghep-hinh.mjs';
import { anhGoc as anhHoiTruong, anhCua as anhSuaCua } from './co-khi/sua-anh.mjs';
import { chuKy, msCua } from './co-khi/khung-hinh.mjs';
import { anhCua, matNaXoa, veLenData } from './co-khi/tach-nen.mjs';
import { anhGoc as anhSan, veChu } from './co-khi/chu-anh.mjs';
import { coTep, DINH_DANG } from './co-khi/xuat-tep.mjs';
import { matDoIn, dungTep } from './co-khi/bien-doi.mjs';
import { daiClip, tongDai } from './co-khi/dong-thoi-gian.mjs';

const khung = (noi, nhan) => `<svg class="canh-ro" viewBox="0 0 360 300" role="img" aria-label="${nhan}">${noi}</svg>`;
const chu = (x, y, t, co = 13, mau = MAU.muc, dam = 700, neo = 'middle') => `<text x="${x}" y="${y}" text-anchor="${neo}" font-size="${co}" font-weight="${dam}" fill="${mau}" font-family="var(--font)">${t}</text>`;

function dataUrl(cv) { return cv.toDataURL('image/png'); }
function canvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }

const nguoi = (x, y, mau, k = 1) => `<g transform="translate(${x} ${y}) scale(${k})"><circle r="9" fill="${MAU.muc}"/><path d="M-13 34v-14a13 13 0 0126 0v14z" fill="${mau}"/></g>`;

const tuong = () => `<rect width="360" height="300" fill="${MAU.tuong}"/><rect y="250" width="360" height="50" fill="${MAU.san}"/>`;

// Bảng tin trường, poster treo giữa. noi vẽ theo hệ 360x300 của sân.
export function canhBanTin(noi, nhan = 'Poster treo trên bảng tin') {
  return khung(`${tuong()}<rect x="30" y="16" width="300" height="218" rx="8" fill="${MAU.go}"/><rect x="38" y="24" width="284" height="202" rx="4" fill="${MAU.xamNhat}"/>
    <g transform="translate(92 28) scale(.54)">${noi}</g>
    ${nguoi(70, 244, MAU.chan, 0.9)}${nguoi(290, 246, MAU.hong, 0.9)}`, nhan);
}

export function posterLen(noi) {
  return `<rect x="40" y="14" width="280" height="272" rx="8" fill="url(#gr-poster)"/>${noi}`;
}

export function canhBangRon(st, man) {
  const v = st.vat[0];
  const md = matDoIn(st, man, v);
  const n = md === Infinity ? 0 : Math.max(8, Math.min(60, Math.round(md * 4)));
  const anh = n ? logoKhoi(n) : logoLong();
  const y = 34;
  const k = 0.82;
  const noi = `${n ? datVao(anh, 0, 0, v.w, v.h) : datVao(logoLong(), 0, 0, v.w, v.h)}`;
  return khung(`<rect width="360" height="300" fill="url(#gr-troi)"/><rect y="238" width="360" height="62" fill="${MAU.san}"/>
    <rect x="16" y="${y - 6}" width="8" height="212" fill="${MAU.muc}"/><rect x="336" y="${y - 6}" width="8" height="212" fill="${MAU.muc}"/>
    <rect x="24" y="${y}" width="312" height="110" rx="3" fill="url(#gr-poster)"/>
    <g transform="translate(${24 + (v.x - 10) * (312 / 340)} ${y + (v.y - 84) * (110 / 113)}) scale(${k + 0.1})">${noi}</g>
    ${chu(214, y + 52, 'NGÀY HỘI', 26, MAU.trang, 800)}${chu(214, y + 82, 'TIN HỌC', 26, MAU.vang, 800)}
    <clipPath id="cl-canh"><circle cx="72" cy="214" r="58"/></clipPath>
    <g clip-path="url(#cl-canh)"><rect x="10" y="150" width="130" height="130" fill="${MAU.trang}"/><g transform="translate(72 214) scale(3.4) translate(-50 -42)">${anh}</g></g>
    <circle cx="72" cy="214" r="58" fill="none" stroke="${MAU.muc}" stroke-width="4"/>${chu(72, 288, 'Đứng sát băng rôn', 11.5)}
    ${nguoi(220, 200, MAU.chan)}${nguoi(262, 204, MAU.hong)}${nguoi(304, 200, MAU.xanh)}
    ${chu(262, 262, dungTep(st).ten, 12, MAU.muc, 700)}`, 'Băng rôn đã in treo ở cổng trường, kính soi cho thấy độ nét');
}

export function logoTheoLop(st, roi = false) {
  return st.manh.map((m, i) => {
    const t = m.id === 'tieu-de' ? tieuDe() : (MANH_LOGO[m.id]?.ve() || BIEU_TUONG.find((b) => b.id === m.id).ve());
    const [r, c] = m.id === 'tieu-de' ? [200, 50] : [100, 100];
    const g = datVao(t, m.x + (r * m.s) / 2, m.y + (c * m.s) / 2, r * m.s, c * m.s, 0, r, c);
    if (!roi || m.id === 'tieu-de') return g;
    return `<g class="canh-roi" style="--tre:${0.2 + i * 0.12}s;--dx:${(i - 2) * 16}px;--xoay:${(i - 2) * 22}deg">${g}</g>`;
  }).join('');
}

export function canhDuongCo(duong, cung) {
  return khung(`<rect width="360" height="300" fill="url(#gr-troi)"/><rect y="252" width="360" height="48" fill="${MAU.san}"/>
    <path d="M0 252v-34l70-16 90 16 110-20 90 20v34z" fill="${MAU.xanh}" opacity=".4"/>
    <rect x="44" y="10" width="8" height="280" rx="4" fill="${MAU.muc}"/><circle cx="48" cy="10" r="7" fill="${MAU.vang}"/>
    <g class="${cung ? '' : 'canh-tung'}"><path d="${duong}" fill="url(#gr-logo)" stroke="${MAU.muc}" stroke-width="1.5"/></g>
    ${nguoi(250, 232, MAU.chan)}${nguoi(296, 236, MAU.hong)}`, 'Lá cờ kéo lên ở sân trường');
}
export const duongCua = (st) => duongSvg(st.nut);

export function canhHuyHieu(st, d) {
  const cv = canvas(W_GHEP * 2, H_GHEP * 2);
  veKetQua(cv, st.buoc);
  const anh = `<image href="${dataUrl(cv)}" x="60" y="44" width="240" height="200"/>`;
  const lo = d.coLo;
  return khung(`${tuong()}
    <path d="M150 0L180 ${lo ? 90 : 40}L210 0" fill="none" stroke="${MAU.do}" stroke-width="7" stroke-linejoin="round"/>
    <g class="${lo ? '' : 'canh-roi'}" style="--tre:.5s;--xoay:18deg">${anh}</g>
    ${lo ? `<circle cx="180" cy="90" r="6" fill="none" stroke="${MAU.vang}" stroke-width="3"/>` : ''}
    ${chu(180, 278, lo ? 'Huy hiệu đeo trên dây' : 'Không có chỗ xỏ dây, huy hiệu rơi xuống đất', 13)}`, 'Huy hiệu xỏ dây đeo');
}

// Khiên người chơi dựng được đặt lên nền icon An toàn mạng, rồi đứng vào hàng năm icon của Ngày hội. Hỏng cũng không rơi: hậu quả là lệch hẳn so với bốn icon kia.
export function canhKhien(st, d, dat) {
  const cv = canvas(W_GHEP * 2, H_GHEP * 2);
  veKetQua(cv, st.buoc, MAU.trang);
  const url = dataUrl(cv);
  const hop = (cx, cy, r) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${MAU.teal}"/><image href="${url}" x="${cx - r * 0.9}" y="${cy - r * 0.75}" width="${r * 1.8}" height="${r * 1.5}"/>`;
  const cau = dat ? 'Biển gian An toàn mạng, khớp với cả bộ icon'
    : d.co.ngoaiTrai || d.co.ngoaiPhai || !d.co.mui ? 'Hình này không phải khiên, gian hàng nhờ làm lại'
      : !(d.co.vaiTrai && d.co.vaiPhai) ? 'Khiên mất vai, nhìn lạc hẳn so với bộ icon' : 'Dấu tích chưa rỗng, biển in ra thành mảng trắng';
  const hang = BIEU_TUONG.map((b, i) => (b.id === 'hd3' ? hop(88 + i * 46, 234, 20) : datVao(b.ve(), 88 + i * 46, 234, 40, 40))).join('');
  return khung(`${tuong()}
    <path d="M180 190v20" stroke="${MAU.muc}" stroke-width="6"/>
    ${hop(180, 104, 92)}
    ${hang}${chu(180, 280, cau, 13)}`, 'Biển icon khiên An toàn mạng trong bộ năm icon');
}

export function canhXuatTep(st, man) {
  const ao = st.don.ao, bang = st.don.bang, tin = st.don.tin;
  const donTin = man.don.find((x) => x.id === 'tin');
  const mbTin = coTep(donTin, tin);
  const quaCo = mbTin > 5;
  const lem = tin.dd === 'jpg' && tin.cl < 60;
  const nBang = bang.dd === 'svg' ? 0 : 12;
  return khung(`<rect width="360" height="300" fill="${MAU.tuong}"/>
    <!-- áo tím -->
    <path d="M40 20l28-12 16 10 16-10 28 12 18 34-22 10-8-14v92H52V50l-8 14-22-10z" fill="${MAU.ao}" stroke="${MAU.aoVien}" stroke-width="2"/>
    ${ao.dd === 'jpg' ? `<rect x="58" y="44" width="52" height="52" fill="${MAU.trang}"/>` : ''}${datVao(logoLong(), 84, 70, 46, 46)}
    ${chu(84, 170, 'Áo: ' + DINH_DANG[ao.dd], 11.5)}
    <!-- băng rôn -->
    <rect x="180" y="20" width="168" height="56" rx="3" fill="url(#gr-poster)"/>${datVao(nBang ? logoKhoi(10) : logoLong(), 212, 48, 46, 46)}${chu(290, 54, 'TIN HỌC', 17, MAU.trang, 800)}
    <clipPath id="cl-xuat"><circle cx="248" cy="118" r="36"/></clipPath><g clip-path="url(#cl-xuat)"><rect x="210" y="80" width="80" height="80" fill="${MAU.trang}"/><g transform="translate(248 118) scale(2.2) translate(-50 -40)">${nBang ? logoKhoi(14) : logoLong()}</g></g>
    <circle cx="248" cy="118" r="36" fill="none" stroke="${MAU.muc}" stroke-width="3"/>${chu(264, 170, 'Băng rôn: ' + DINH_DANG[bang.dd], 11.5)}
    <!-- bảng tin -->
    <rect x="44" y="184" width="272" height="96" rx="8" fill="${MAU.go}"/><rect x="52" y="192" width="256" height="80" rx="3" fill="${quaCo ? MAU.xamNhat : 'url(#gr-poster)'}"/>
    ${quaCo ? chu(180, 228, `Tệp ${mbTin} MB, nhóm chỉ nhận 5 MB`, 13, MAU.do, 800) + chu(180, 248, 'Không gửi được lên bảng tin', 12) : `<g ${lem ? 'filter="url(#mo-lem)"' : ''}>${datVao(logoLong(), 90, 232, 62, 62)}${chu(202, 226, 'NGÀY HỘI', 22, MAU.trang, 800)}${chu(202, 252, 'TIN HỌC', 22, MAU.vang, 800)}</g><filter id="mo-lem"><feGaussianBlur stdDeviation="1.6"/></filter>`}`, 'Ba thành phẩm: áo, băng rôn và poster trên bảng tin');
}

export function canhAnhHoiTruong(st, man) {
  const a = man ? anhSuaCua(st, man) : anhHoiTruong();
  const cv = canvas(a.w, a.h);
  const c = cv.getContext('2d');
  const img = c.createImageData(a.w, a.h);
  apChinh(a, st.sang, st.tp, img.data);
  c.putImageData(img, 0, 0);
  return khung(`<rect width="360" height="300" fill="${MAU.muc}"/><rect x="24" y="14" width="312" height="200" rx="4" fill="${MAU.trang}"/><image href="${dataUrl(cv)}" x="30" y="20" width="300" height="188" preserveAspectRatio="none"/>
    <path d="M150 214l-30 60M210 214l30 60" stroke="${MAU.xam}" stroke-width="5"/>${nguoi(60, 244, MAU.chan, 0.9)}${nguoi(110, 248, MAU.hong, 0.9)}${nguoi(250, 248, MAU.xanh, 0.9)}${nguoi(300, 244, MAU.vang, 0.9)}`, 'Ảnh chiếu lên màn trong buổi tổng kết');
}

export function canhTachNen(st, man) {
  const a = anhCua(man.kieuAnh);
  const cv = canvas(a.w, a.h);
  const c = cv.getContext('2d');
  const img = c.createImageData(a.w, a.h);
  veLenData(a, matNaXoa(st, a), img.data, false);
  c.putImageData(img, 0, 0);
  return khung(`<rect width="360" height="300" fill="url(#gr-poster)"/>
    <g fill="${MAU.vang}" opacity=".85"><circle cx="50" cy="50" r="4"/><circle cx="310" cy="70" r="5"/><circle cx="60" cy="240" r="3"/><circle cx="322" cy="220" r="4"/></g>
    ${chu(180, 32, 'TRƯNG BÀY RÔ BỐT', 20, MAU.trang, 800)}
    <image href="${dataUrl(cv)}" x="60" y="44" width="240" height="240"/>`, 'Rô bốt đã tách nền ghép lên poster tím');
}

export function canhChuPoster(st) {
  const a = anhSan();
  const cv = canvas(a.w, a.h);
  cv.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(a.data), a.w, a.h), 0, 0);
  return khung(`${tuong()}<rect x="60" y="30" width="240" height="135" fill="${MAU.xam}"/>
    <g style="filter:blur(.55px)"><image href="${dataUrl(cv)}" x="60" y="30" width="240" height="135" preserveAspectRatio="none"/><g transform="translate(60 30) scale(.6667)"><svg width="360" height="202" viewBox="0 0 360 202">${veChu(st)}</svg></g></g>
    ${nguoi(90, 230, MAU.chan, 1.1)}${nguoi(150, 236, MAU.hong, 1.1)}${nguoi(210, 232, MAU.xanh, 1.1)}${nguoi(270, 236, MAU.vang, 1.1)}
    ${chu(180, 190, 'Nhìn từ cách 3 mét', 12)}`, 'Poster nhìn từ xa');
}

export function canhAnhDong(st) {
  const tong = chuKy(st);
  let daQua = 0;
  const g = st.khung.map((k) => {
    const tu = daQua / tong, den = (daQua + msCua(st, k)) / tong;
    daQua += msCua(st, k);
    return `<g opacity="0"><animate attributeName="opacity" dur="${tong}ms" repeatCount="indefinite" calcMode="discrete" keyTimes="0;${tu.toFixed(3)};${den.toFixed(3)};1" values="0;1;0;0"/>${datVao(robot(k.goc, { mat: k.mat }), 180, 140, 150, 188, 0, 120, 150)}</g>`;
  }).join('');
  return khung(`<rect width="360" height="300" fill="${MAU.tuong}"/><rect x="88" y="6" width="184" height="288" rx="26" fill="${MAU.muc}"/><rect x="98" y="24" width="164" height="250" rx="8" fill="${MAU.trang}"/>
    ${chu(180, 44, 'Bảng tin CLB', 12)}${g}${chu(180, 262, `Lặp mỗi ${(tong / 1000).toFixed(1)} giây`, 12, MAU.chan)}`, 'Ảnh động chạy trên điện thoại');
}

// Cánh tay người chơi vừa vẽ gắn vào rô bốt thật. Đúng thì tay vẫy, chưa đúng thì đứng im và nói rõ vì sao.
export function canhVeTay(st, dat, man) {
  const c = man.san;
  const tay = `<path d="${duongSvg(st.nut)}" ${c.to} stroke="${MAU.muc}"/>${c.banTay()}`;
  return khung(`<rect width="360" height="300" fill="${MAU.tuong}"/><rect y="252" width="360" height="48" fill="${MAU.san}"/>
    <g transform="translate(150 72) scale(.36)"><g class="${dat ? 'canh-vay-tay' : ''}">${tay}</g>${c.than()}</g>
    ${chu(180, 282, dat ? 'Rô bốt vẫy chào cả sân trường' : 'Tay chưa đúng dáng, rô bốt chưa vẫy được', 13)}`, 'Rô bốt với cánh tay vừa vẽ');
}

export function canhPhim(st, man, d) {
  const tong = tongDai(st);
  let x = 22;
  const k = 316 / Math.max(tong + 2, man.dich);
  let dai = '';
  st.clip.forEach((c, i) => {
    const w = daiClip(c) * k;
    dai += `<rect x="${x}" y="150" width="${Math.max(2, w - 1)}" height="44" fill="${c.mau}"/>`;
    if (w > 30) dai += chu(x + 5, 176, c.nho, 11, MAU.trang, 700, 'start');
    x += w - (st.chuyen?.[i] === 'mo' ? k : 0);
  });
  const dung = Math.abs(tong - man.dich) <= 0.5;
  const dongNhac = st.nhac ? `<rect x="22" y="200" width="${Math.min(316, st.nhac.ra * k)}" height="14" rx="3" fill="${MAU.xanh}" opacity=".7"/>` : '';
  return khung(`<rect width="360" height="300" fill="${MAU.muc}"/><rect x="20" y="14" width="320" height="128" rx="10" fill="${MAU.man}"/>
    ${chu(180, 66, `${tong.toFixed(1)} giây`, 38, dung ? MAU.xanh : MAU.vang, 800)}
    ${chu(180, 96, d.catLoi?.length ? 'Câu nói bị cắt giữa chừng' : (dung ? 'Vừa khung chiếu buổi khai mạc' : `Khung chiếu chỉ có ${man.dich} giây`), 13.5, MAU.trang)}
    ${chu(180, 118, d.dauDung && d.cuoiDung ? 'Mở đầu và kết thúc đúng chỗ' : 'Mở đầu hoặc kết thúc sai chỗ', 12, MAU.xam, 500)}
    ${dai}${dongNhac}
    <path d="M${22 + man.dich * k} 142v80" stroke="${MAU.vang}" stroke-width="2" stroke-dasharray="5 4"/>
    ${nguoi(70, 244, MAU.chan, 0.9)}${nguoi(130, 248, MAU.hong, 0.9)}${nguoi(190, 244, MAU.xanh, 0.9)}${nguoi(250, 248, MAU.vang, 0.9)}${nguoi(306, 244, MAU.giua, 0.9)}`, 'Phim chiếu trong hội trường');
}
