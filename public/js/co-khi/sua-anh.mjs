// Cơ khí chỉnh sáng, tương phản trên điểm ảnh thật kèm biểu đồ histogram sống (U11-10).
import { giong } from '../toan/hinh-hoc.mjs';
import { anhHoiTruong, apChinh, doAnh } from '../toan/anh.mjs';
import { thanhTruot, dungBoCu } from './chung.mjs';

let goc = null;
export const anhGoc = () => (goc ||= anhHoiTruong());

export default {
  tao: (man) => giong(man.dau),
  lam: { dat(st, sang, tp) { st.sang = sang; st.tp = tp; } },
  do(st) {
    const d = doAnh(anhGoc(), st.sang, st.tp);
    return { tb: d.tb, gian: d.gian, chay: d.chay, chim: d.chim };
  },

  ve(ctx) {
    const { san, khay, man } = ctx;
    const a = anhGoc();
    san.innerHTML = '';
    const cv = document.createElement('canvas');
    cv.className = 'san-canvas';
    cv.width = a.w;
    cv.height = a.h;
    cv.setAttribute('role', 'img');
    cv.setAttribute('aria-label', man.sanNhan || 'Ảnh hội trường đang chỉnh');
    san.style.setProperty('--tile', a.w / a.h);
    san.appendChild(cv);
    const nut = document.createElement('button');
    nut.type = 'button';
    nut.className = 'so-sanh';
    nut.textContent = 'Giữ để xem ảnh gốc';
    san.appendChild(nut);
    const c = cv.getContext('2d');
    const img = c.createImageData(a.w, a.h);
    let cho = false;
    let xemGoc = false;
    let bd = null;

    const veBieuDo = () => {
      if (!bd) return;
      const st = ctx.st;
      const d = doAnh(a, st.sang, st.tp);
      const t = bd.getContext('2d');
      const w = bd.width, h = bd.height;
      t.clearRect(0, 0, w, h);
      let lon = 1;
      for (let v = 4; v < 252; v++) lon = Math.max(lon, d.cot[v]);
      const css = getComputedStyle(document.documentElement);
      t.fillStyle = css.getPropertyValue('--brand').trim();
      for (let v = 0; v < 256; v++) {
        const cao = Math.min(h, (d.cot[v] / lon) * h);
        t.fillRect((v * w) / 256, h - cao, Math.ceil(w / 256), cao);
      }
      t.fillStyle = css.getPropertyValue('--err').trim();
      if (d.chim > 0.02) t.fillRect(0, 0, 3, h);
      if (d.chay > 0.02) t.fillRect(w - 3, 0, 3, h);
    };

    const ve = () => {
      if (cho) return;
      cho = true;
      requestAnimationFrame(() => {
        cho = false;
        const st = ctx.st;
        if (xemGoc) img.data.set(a.data);
        else apChinh(a, st.sang, st.tp, img.data);
        c.putImageData(img, 0, 0);
        veBieuDo();
      });
    };

    nut.addEventListener('pointerdown', () => { xemGoc = true; ve(); });
    for (const su of ['pointerup', 'pointerleave', 'pointercancel']) nut.addEventListener(su, () => { xemGoc = false; ve(); });

    const veKhay = () => {
      const st = ctx.st;
      khay.innerHTML = '';
      bd = document.createElement('canvas');
      bd.className = 'bieu-do';
      bd.width = 512;
      bd.height = 88;
      bd.setAttribute('role', 'img');
      bd.setAttribute('aria-label', 'Biểu đồ phân bố độ sáng, trái là tối, phải là sáng');
      khay.appendChild(bd);
      const dinh = (v) => (v > 0 ? `+${v}` : `${v}`);
      const k = ctx.cu;
      let daGhi = false;
      thanhTruot(khay, {
        nhan: k === 'sang' ? 'Độ sáng' : 'Tương phản', min: -100, max: 100, buoc: 5, gia: st[k], dinh, id: k,
        doi(v) { if (!daGhi) { ctx.ghi(); daGhi = true; } st[k] = v; ve(); },
        xong() { daGhi = false; ctx.doi(); },
      });
      veBieuDo();
    };

    dungBoCu(ctx, [
      { id: 'sang', nhan: 'Độ sáng', ic: 'mat' },
      { id: 'tp', nhan: 'Tương phản', ic: 'tuongPhan' },
    ], 'sang', () => veKhay());
    ve();
    veKhay();
  },
};
