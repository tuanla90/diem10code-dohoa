// Tiến độ và cài đặt. Lỗi localStorage (tab ẩn danh) không được làm hỏng game.
const KHOA = 'dohoa_tien_do_v1';

function doc(k, macDinh) {
  try { const v = localStorage.getItem(k); return v === null ? macDinh : v; } catch { return macDinh; }
}
function ghi(k, v) {
  try { localStorage.setItem(k, v); } catch { /* không lưu được thì chơi tiếp */ }
}

let tienDo = { man: {} };
try {
  const t = JSON.parse(doc(KHOA, 'null'));
  if (t && t.man) tienDo = t;
} catch { /* tệp hỏng thì bắt đầu lại */ }

export const saoCua = (ma) => tienDo.man[ma]?.sao || 0;
export const daQua = (ma) => saoCua(ma) > 0;

export function luuKetQua(ma, sao) {
  if (sao > saoCua(ma)) tienDo.man[ma] = { sao };
  ghi(KHOA, JSON.stringify(tienDo));
}

export function tongSao() {
  return Object.values(tienDo.man).reduce((t, m) => t + (m.sao || 0), 0);
}

export function loaBat() { return doc('dohoa_am_thanh', '1') === '1'; }
export function datLoa(b) { ghi('dohoa_am_thanh', b ? '1' : '0'); }
export function giaoDien() { return doc('dohoa_giao_dien', 'light'); }
export function datGiaoDien(g) { ghi('dohoa_giao_dien', g); }
