// Tiến độ và cài đặt. Lỗi localStorage (tab ẩn danh) không được làm hỏng game.
// Mỗi màn đã đạt giữ cả trạng thái thành phẩm (st), nên Tủ tác phẩm vẽ lại đúng thứ người chơi đã làm.
const KHOA = 'dohoa_tien_do_v1';
const KHOA_NHAP = 'dohoa_nhap_v1';

function doc(k, macDinh) {
  try { const v = localStorage.getItem(k); return v === null ? macDinh : v; } catch { return macDinh; }
}
function ghi(k, v) {
  try { localStorage.setItem(k, v); } catch { /* không lưu được thì chơi tiếp */ }
}
function xoa(k) {
  try { localStorage.removeItem(k); } catch { /* như trên */ }
}

const MAC_DINH = () => ({ man: {}, ten: '', chao: false, huyHieu: {}, docTay: {}, xemGoi: {}, matTinh: 0, moi: null });

let tienDo = MAC_DINH();
try {
  const t = JSON.parse(doc(KHOA, 'null'));
  if (t && t.man) tienDo = { ...MAC_DINH(), ...t };
} catch { /* tệp hỏng thì bắt đầu lại */ }

const luu = () => ghi(KHOA, JSON.stringify(tienDo));

// Màn đã đổi tranh hoặc đề thì thao tác lưu từ trước không còn vẽ đúng nữa (chạm đũa thần cũ giờ rơi vào đầu rô bốt).
// Giữ nguyên sao đã có, chỉ bỏ thành phẩm và bản nháp cũ; Tủ tác phẩm tự nhắc chơi lại để có tranh mới. Đổi tranh nữa thì tăng số.
const DOI_TRANH = { 2: ['DH-3-5', 'DH-4-2', 'DH-4-3'], 3: ['DH-4-2', 'DH-4-3'], 4: ['DH-4-2', 'DH-4-3'], 5: ['DH-4-2', 'DH-4-3'] }; // bản 3, 4, 5: rô bốt đổi dáng nên chỗ chạm cũ trật hết
const BAN_TRANH = 5;
if ((tienDo.banTranh || 1) < BAN_TRANH) {
  const MAN_DOI_TRANH = [...new Set(Object.keys(DOI_TRANH).filter((b) => b > (tienDo.banTranh || 1)).flatMap((b) => DOI_TRANH[b]))];
  for (const ma of MAN_DOI_TRANH) if (tienDo.man[ma]) delete tienDo.man[ma].st;
  tienDo.banTranh = BAN_TRANH;
  if (doc(KHOA, null) !== null) luu();
  try {
    const n = JSON.parse(doc(KHOA_NHAP, '{}')) || {};
    for (const ma of MAN_DOI_TRANH) delete n[ma];
    ghi(KHOA_NHAP, JSON.stringify(n));
  } catch { /* bản nháp hỏng thì thôi */ }
}

export const saoCua = (ma) => tienDo.man[ma]?.sao || 0;
export const daQua = (ma) => saoCua(ma) > 0;
export const hoSoMan = (ma) => tienDo.man[ma] || null;
export const banDaLuu = (ma) => tienDo.man[ma]?.st || null;

// Mỗi lần bấm Chạy. Sai không mất gì, chỉ đếm để Luna biết lúc nào nên ngỏ lời giúp.
export function ghiLanChay(ma, dat) {
  const m = (tienDo.man[ma] ||= { sao: 0 });
  m.chay = (m.chay || 0) + 1;
  if (!dat) m.hong = (m.hong || 0) + 1;
  luu();
}

// Trả về true nếu đây là lần đầu qua màn, để bản vẽ tô màu món mới.
export function ghiDat(ma, { sao, st, soGoiY = 0 }) {
  const m = (tienDo.man[ma] ||= { sao: 0 });
  const dauTien = !m.sao;
  if (sao >= m.sao && st) m.st = st;
  if (sao > m.sao) m.sao = sao;
  if (sao === 3 && !soGoiY) m.tuLuc = true;
  if (sao === 3 && m.chay === 1) m.motLan = true;
  if ((m.hong || 0) >= 3) m.kienTri = true;
  if (dauTien) tienDo.moi = ma;
  luu();
  return dauTien;
}

export function tongSao() {
  return Object.values(tienDo.man).reduce((t, m) => t + (m.sao || 0), 0);
}

export function thongKe() {
  const ds = Object.values(tienDo.man);
  return {
    man: ds.filter((m) => m.sao > 0).length,
    baSao: ds.filter((m) => m.sao === 3).length,
    chay: ds.reduce((t, m) => t + (m.chay || 0), 0),
    tuLuc: ds.filter((m) => m.tuLuc).length,
    motLan: ds.filter((m) => m.motLan).length,
    kienTri: ds.filter((m) => m.kienTri).length,
  };
}

export const tenNguoi = () => tienDo.ten || '';
export function datTen(t) { tienDo.ten = String(t || '').trim().slice(0, 18); luu(); }
export const daChao = () => tienDo.chao;
export function ghiDaChao() { tienDo.chao = true; luu(); }

// Món vừa có màu: màn đầu lấy ra một lần để chạy hiệu ứng tô.
export function layMonMoi() { const m = tienDo.moi; if (m) { tienDo.moi = null; luu(); } return m; }

export const coHuyHieu = (id) => !!tienDo.huyHieu[id];
export function ghiHuyHieu(id) { tienDo.huyHieu[id] = true; luu(); }

export const daDocTay = (k) => !!tienDo.docTay[k];
export const soDocTay = () => Object.keys(tienDo.docTay).length;
export function ghiDocTay(k) { if (!tienDo.docTay[k]) { tienDo.docTay[k] = true; luu(); } }

export const daXemGoi = (id) => !!tienDo.xemGoi[id];
export function ghiXemGoi(id) { tienDo.xemGoi[id] = true; luu(); }

export const matTinhTot = () => tienDo.matTinh || 0;
export function ghiMatTinh(diem) { if (diem > matTinhTot()) { tienDo.matTinh = diem; luu(); } }

// Bản đang làm dở từng màn: thoát ra, tải lại trang đều không mất công.
function docNhapHet() {
  try { return JSON.parse(doc(KHOA_NHAP, '{}')) || {}; } catch { return {}; }
}
export const docNhap = (ma) => docNhapHet()[ma] || null;
export function luuNhap(ma, st) { const n = docNhapHet(); n[ma] = st; ghi(KHOA_NHAP, JSON.stringify(n)); }
export function xoaNhap(ma) { const n = docNhapHet(); if (n[ma]) { delete n[ma]; ghi(KHOA_NHAP, JSON.stringify(n)); } }

export function xoaHetTienDo() {
  tienDo = MAC_DINH();
  xoa(KHOA);
  xoa(KHOA_NHAP);
}

export function loaBat() { return doc('dohoa_am_thanh', '1') === '1'; }
export function datLoa(b) { ghi('dohoa_am_thanh', b ? '1' : '0'); }
export function rungBat() { return doc('dohoa_rung', '1') === '1'; }
export function datRung(b) { ghi('dohoa_rung', b ? '1' : '0'); }
export function giaoDien() { return doc('dohoa_giao_dien', 'light'); }
export function datGiaoDien(g) { ghi('dohoa_giao_dien', g); }
