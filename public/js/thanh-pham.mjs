// Vẽ lại thành phẩm của người chơi từ trạng thái đã lưu. Nhiều tranh cùng một trang thì mã nội bộ không được trùng.
import { cham } from './man/index.mjs';

let dem = 0;
const CHUNG = /^(gr-|o-ca-ro|o-ban-ve)/;

export function lamRieng(svg) {
  const tt = `tp${++dem}-`;
  return svg
    .replace(/\bid="([^"]+)"/g, (g, id) => (CHUNG.test(id) ? g : `id="${tt}${id}"`))
    .replace(/url\(#([^)]+)\)/g, (g, id) => (CHUNG.test(id) ? g : `url(#${tt}${id})`));
}

export function veThanhPham(man, st) {
  const ket = cham(man, st);
  return lamRieng(man.canh(st, ket, ket.d, man));
}

// Đẩy từng tranh ra lúc rảnh để cuộn Tủ tác phẩm không khựng: mỗi tranh có thể phải dựng cả ảnh điểm.
export function veTuTu(ds, khiXong) {
  let huy = false;
  const buoc = (i) => {
    if (huy || i >= ds.length) { if (!huy) khiXong?.(); return; }
    const { el, man, st } = ds[i];
    if (el.isConnected) {
      try { el.innerHTML = veThanhPham(man, st); } catch { el.innerHTML = ''; }
    }
    (window.requestIdleCallback || ((f) => setTimeout(f, 16)))(() => buoc(i + 1));
  };
  buoc(0);
  return () => { huy = true; };
}
