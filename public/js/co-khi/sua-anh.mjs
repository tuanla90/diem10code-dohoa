// Cơ khí chỉnh sáng, tương phản trên điểm ảnh thật kèm biểu đồ histogram sống (U11-10).
import { giong } from '../toan/hinh-hoc.mjs';
import { anhHoiTruong, anhDoiRobot, anhDoiChay, apChinh, doAnh, doNep } from '../toan/anh.mjs';
import { thanhTruot, dungBoCu, dongHo, mucDo } from './chung.mjs';
import { icon } from '../icon.mjs';

let goc = null, doiGoc = null, doiChay = null;
export const anhGoc = () => (goc ||= anhHoiTruong());

// Màn banChay mở ra với bản đã lưu đè, người chơi phải tự mở lại bản gốc.
export const anhCua = (st, man) => {
  if (!man?.banChay) return anhGoc();
  return st.goc ? (doiGoc ||= anhDoiRobot()) : (doiChay ||= anhDoiChay());
};

const doHet = (st, man) => {
  const a = anhCua(st, man);
  const d = doAnh(a, st.sang, st.tp);
  if (man?.banChay) d.nep = doNep(a, st.sang, st.tp);
  return d;
};

const lam = {
  dat(st, sang, tp) { st.sang = sang; st.tp = tp; },
  // Mở lại bản gốc là làm lại từ đầu trên một bản khác, nên các thanh về 0.
  moGoc(st) { st.goc = true; st.sang = 0; st.tp = 0; },
};

export default {
  tao: (man) => giong(man.dau),
  lam,
  do(st, man) {
    const { cot, ...d } = doHet(st, man);
    return d;
  },

  ve(ctx) {
    const { san, khay, man } = ctx;
    const a = anhCua(ctx.st, man);
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
    nut.textContent = man.banChay ? 'Giữ để xem trước khi chỉnh' : 'Giữ để xem ảnh gốc';
    san.appendChild(nut);
    // Mở bản gốc nằm ngay trên ảnh: để dưới khay thì máy thấp bị đẩy mất thanh trượt.
    if (man.banChay && !ctx.st.goc) {
      const moGoc = document.createElement('button');
      moGoc.type = 'button';
      moGoc.className = 'mo-ban-goc';
      moGoc.dataset.cu = 'ban-goc';
      moGoc.innerHTML = `${icon('tranh')}<span>Mở bản gốc</span>`;
      moGoc.addEventListener('click', () => { ctx.ghi(); lam.moGoc(ctx.st); moGoc.remove(); ve(); veKhay(); ctx.doi(); });
      san.appendChild(moGoc);
    }
    const c = cv.getContext('2d');
    const img = c.createImageData(a.w, a.h);
    let cho = false;
    let xemGoc = false;
    let bd = null;
    let dh = null;
    let dangKeo = false;
    const doSo = man.dongHo || [];
    // Vạch đỏ trên biểu đồ chỉ hiện khi đúng vạch đo đó đã hỏng, để hai tín hiệu không nói ngược nhau.
    const hong = (id, d) => {
      const m = doSo.find((x) => x.id === id);
      return !!m && mucDo(m, m.lay(d)).loai === 'xau';
    };

    const veBieuDo = () => {
      if (!bd) return;
      const st = ctx.st;
      const d = doHet(st, man);
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
      if (hong('chim', d)) t.fillRect(0, 0, 3, h);
      if (hong('chay', d)) t.fillRect(w - 3, 0, 3, h);
      const duHet = dh.capNhat(d);
      // Tiếng và rung chỉ khi người chơi đang kéo, mở lại màn đã đạt thì không kêu.
      if (dangKeo) ctx.hit(duHet ? 'du' : '');
    };

    const ve = () => {
      if (cho) return;
      cho = true;
      requestAnimationFrame(() => {
        cho = false;
        const st = ctx.st;
        const nguon = anhCua(st, man);
        if (xemGoc) img.data.set(nguon.data);
        else apChinh(nguon, st.sang, st.tp, img.data);
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
      dh = dongHo(khay, doSo);
      const dinh = (v) => (v > 0 ? `+${v}` : `${v}`);
      const k = ctx.cu;
      let daGhi = false;
      thanhTruot(khay, {
        nhan: k === 'sang' ? 'Độ sáng' : 'Tương phản', min: -100, max: 100, buoc: 5, gia: st[k], dinh, id: k,
        doi(v) { if (!daGhi) { ctx.ghi(); daGhi = true; } dangKeo = true; st[k] = v; ve(); },
        xong() { daGhi = false; dangKeo = false; ctx.doi(); },
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
