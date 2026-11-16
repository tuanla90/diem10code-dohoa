// Cơ khí cắt cúp và xoay thẳng ảnh điểm: kéo khung cắt có lưới 1/3, xoay đường chân trời và canh điểm ảnh còn lại (U11-09).
import { giong, kep } from '../toan/hinh-hoc.mjs';
import { anhTapThe, TAP_THE } from '../toan/anh.mjs';
import { MAU } from '../hinh.mjs';
import { hitTruc } from '../toan/hit.mjs';
import { taoSvg, batKeo, thanhTruot, dongHo, vungTay } from './chung.mjs';

export const W = TAP_THE.w, H = TAP_THE.h;

let gocAnh = null;
export const layAnhTapThe = () => (gocAnh ||= anhTapThe());

function hopXoay(r, deg) {
  const rad = (deg * Math.PI) / 180;
  const cs = Math.cos(rad), sn = Math.sin(rad), cx = W / 2, cy = H / 2;
  const goc4 = [[r.x, r.y], [r.x + r.w, r.y], [r.x, r.y + r.h], [r.x + r.w, r.y + r.h]].map(([px, py]) => {
    const dx = px - cx, dy = py - cy;
    return [cx + dx * cs - dy * sn, cy + dx * sn + dy * cs];
  });
  const xs = goc4.map((p) => p[0]), ys = goc4.map((p) => p[1]);
  return { x: Math.min(...xs), y: Math.min(...ys), x2: Math.max(...xs), y2: Math.max(...ys) };
}

const giao = (a, b) => a.x < b.x2 && b.x < a.x2 && a.y < b.y2 && b.y < a.y2;

export function doCat(st) {
  const deg = st.goc - TAP_THE.gocChuan;
  const kh = { x: st.x, y: st.y, x2: st.x + st.w, y2: st.y + st.h };
  const doi = hopXoay(TAP_THE.doi, deg);
  const rac = hopXoay(TAP_THE.racTrai, deg);
  const cot = hopXoay(TAP_THE.cotPhai, deg);
  const dungSai = 2;
  const matNguoi = kh.x > doi.x + dungSai || kh.y > doi.y + dungSai || kh.x2 < doi.x2 - dungSai || kh.y2 < doi.y2 - dungSai;
  return {
    lechGoc: Math.abs(deg),
    dinhRac: giao(kh, rac) || giao(kh, cot),
    matNguoi,
    conLai: Math.min(st.w / W, st.h / H),
    lechTam: Math.abs((st.x + st.w / 2) - (doi.x + doi.x2) / 2),
  };
}

let demNguon = null;
function nguonCanvas() {
  if (demNguon) return demNguon;
  const a = layAnhTapThe();
  const cv = document.createElement('canvas');
  cv.width = a.w;
  cv.height = a.h;
  cv.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(a.data), a.w, a.h), 0, 0);
  demNguon = cv;
  return cv;
}

/**
 * Vẽ bức ảnh đã xoay lên khung ngắm 240x160 (hoặc chỉ xuất riêng phần nằm trong khung cắt).
 * @param {HTMLCanvasElement} cv Canvas đích.
 * @param {object} st Trạng thái cắt và xoay.
 * @param {boolean} chiVungCat Chỉ vẽ đúng phần bên trong khung cắt để đóng khung thành phẩm.
 */
export function veAnhXoay(cv, st, chiVungCat = false) {
  const ng = nguonCanvas();
  const c = cv.getContext('2d');
  if (chiVungCat) {
    cv.width = Math.max(40, Math.round(st.w * 2));
    cv.height = Math.max(40, Math.round(st.h * 2));
    c.setTransform(2, 0, 0, 2, 0, 0);
    c.clearRect(0, 0, st.w, st.h);
    c.translate(W / 2 - st.x, H / 2 - st.y);
    c.rotate((st.goc * Math.PI) / 180);
    c.drawImage(ng, -(W / 2 + TAP_THE.ox), -(H / 2 + TAP_THE.oy));
    c.setTransform(1, 0, 0, 1, 0, 0);
    return;
  }
  c.setTransform(2, 0, 0, 2, 0, 0);
  c.clearRect(0, 0, W, H);
  c.translate(W / 2, H / 2);
  c.rotate((st.goc * Math.PI) / 180);
  c.drawImage(ng, -(W / 2 + TAP_THE.ox), -(H / 2 + TAP_THE.oy));
  c.setTransform(1, 0, 0, 1, 0, 0);
}

const lam = {
  goc(st, g) { st.goc = kep(g, -15, 15); },
  khung(st, gt) { Object.assign(st, gt); },
};

export default {
  tao: (man) => giong(man.dau),
  lam,
  do: doCat,

  ve(ctx) {
    const { san, khay, man } = ctx;
    san.innerHTML = '';
    san.style.setProperty('--chua', '390px');
    const chong = document.createElement('div');
    chong.className = 'san-chong';
    const cv = document.createElement('canvas');
    cv.className = 'san-canvas';
    cv.width = W * 2;
    cv.height = H * 2;
    cv.setAttribute('aria-hidden', 'true');
    chong.appendChild(cv);
    san.appendChild(chong);
    const svg = taoSvg(chong, W, H, man.sanNhan || 'Ảnh tập thể đang cắt cúp và xoay thẳng');
    svg.style.height = '100%';
    svg.setAttribute('preserveAspectRatio', 'none');
    let gion = null;
    let dh = null;
    let dangXoay = false;

    const capDo = () => (dh ? dh.khoaHit(doCat(ctx.st)) : '');

    const ve = () => {
      const st = ctx.st;
      veAnhXoay(cv, st, false);
      const { x, y, w, h } = st;
      let s = `<path fill-rule="evenodd" d="M0 0H${W}V${H}H0ZM${x} ${y}V${y + h}H${x + w}V${y}Z" fill="${MAU.man}" fill-opacity=".58" pointer-events="none"/>`;
      if (dangXoay) {
        s += `<path d="M0 ${H * 0.45}H${W}M0 ${H * 0.65}H${W}" fill="none" stroke="${MAU.vang}" stroke-width="1" stroke-dasharray="4 4" pointer-events="none"/>`;
      }
      // Khung cắt trắng, lưới 1/3 và 4 thanh góc chữ L đúng chuẩn công cụ Crop.
      s += `<g data-h="than"><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="transparent"/><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${MAU.trang}" stroke-width="1.6"/></g>`;
      s += `<path d="M${x + w / 3} ${y}V${y + h}M${x + (w * 2) / 3} ${y}V${y + h}M${x} ${y + h / 3}H${x + w}M${x} ${y + (h * 2) / 3}H${x + w}" fill="none" stroke="${MAU.trang}" stroke-opacity=".42" stroke-width=".9" pointer-events="none"/>`;
      const dGoc = 11;
      const gocL = `M${x} ${y + dGoc}V${y}H${x + dGoc}M${x + w - dGoc} ${y}H${x + w}V${y + dGoc}M${x} ${y + h - dGoc}V${y + h}H${x + dGoc}M${x + w - dGoc} ${y + h}H${x + w}V${y + h - dGoc}`;
      s += `<path d="${gocL}" fill="none" stroke="${MAU.trang}" stroke-width="3.4" stroke-linecap="square" pointer-events="none"/>`;
      for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, 1], [0, -1], [1, 0], [0, 1], [-1, 0]]) {
        const z = vungTay(a, b, w, h, 30);
        if (!z) continue;
        s += `<rect data-h="tay:${a}:${b}" x="${x + w / 2 + z.x}" y="${y + h / 2 + z.y}" width="${z.w}" height="${z.h}" fill="transparent"/>`;
      }
      if (gion) s += `<path d="${gion}" fill="none" stroke="${MAU.hong}" stroke-width="1.6" stroke-dasharray="4 3" pointer-events="none"/>`;
      svg.innerHTML = s;
      capDo();
    };

    const veKhay = () => {
      const st = ctx.st;
      khay.innerHTML = '';
      dh = dongHo(khay, man.dongHo || []);
      let daGhi = false;
      const dinh = (v) => `${v > 0 ? '+' : ''}${v.toFixed(1)} độ`;
      const nutTruot = thanhTruot(khay, {
        nhan: 'Xoay ảnh', min: -15, max: 15, buoc: 0.5, gia: st.goc, dinh, id: 'xoay-anh',
        doi(v) {
          if (!daGhi) { ctx.ghi(); daGhi = true; }
          dangXoay = true;
          let g = v;
          if (Math.abs(g - TAP_THE.gocChuan) <= 0.6) g = TAP_THE.gocChuan;
          st.goc = g;
          nutTruot.parentElement.querySelector('output').textContent = dinh(g);
          ve();
          ctx.hit(capDo() || (g === TAP_THE.gocChuan ? 'thang' : ''));
        },
        xong() { daGhi = false; dangXoay = false; ctx.hit(); ve(); ctx.doi(); },
      });
      capDo();
    };

    batKeo(svg, W, H, (h, pt) => {
      const st = ctx.st;
      if (h === 'than') {
        const x0 = st.x, y0 = st.y;
        let daGhi = false;
        return {
          di(p) {
            if (!daGhi && Math.hypot(p.x - pt.x, p.y - pt.y) < 2) return;
            if (!daGhi) { ctx.ghi(); daGhi = true; }
            st.x = kep(Math.round(x0 + p.x - pt.x), 4, W - st.w - 4);
            st.y = kep(Math.round(y0 + p.y - pt.y), 4, H - st.h - 4);
            const hx = hitTruc(st.x, st.w, [{ t: W / 2, neo: 0.5 }]);
            gion = null;
            if (hx) { st.x = kep(st.x + hx.doi, 4, W - st.w - 4); gion = `M${W / 2} 0V${H}`; }
            ve();
            ctx.hit(capDo() || (gion ? 'giua' : ''));
          },
          nha() { gion = null; ctx.hit(); ve(); ctx.doi(); },
        };
      }
      if (!h || !h.startsWith('tay:')) return null;
      const [, sa, sb] = h.split(':').map(Number);
      const goc0 = { x: st.x, y: st.y, x2: st.x + st.w, y2: st.y + st.h };
      let daGhi = false;
      return {
        di(p) {
          if (!daGhi && Math.hypot(p.x - pt.x, p.y - pt.y) < 2) return;
          if (!daGhi) { ctx.ghi(); daGhi = true; }
          const dx = p.x - pt.x, dy = p.y - pt.y;
          let x1 = goc0.x, y1 = goc0.y, x2 = goc0.x2, y2 = goc0.y2;
          const RONG_TOI_THIEU = 52, CAO_TOI_THIEU = 44;
          if (sa < 0) x1 = kep(Math.round(goc0.x + dx), 4, x2 - RONG_TOI_THIEU);
          if (sa > 0) x2 = kep(Math.round(goc0.x2 + dx), x1 + RONG_TOI_THIEU, W - 4);
          if (sb < 0) y1 = kep(Math.round(goc0.y + dy), 4, y2 - CAO_TOI_THIEU);
          if (sb > 0) y2 = kep(Math.round(goc0.y2 + dy), y1 + CAO_TOI_THIEU, H - 4);
          st.x = x1; st.y = y1; st.w = x2 - x1; st.h = y2 - y1;
          gion = Math.abs((st.x + st.w / 2) - W / 2) <= 3 ? `M${W / 2} 0V${H}` : null;
          ve();
          ctx.hit(capDo());
        },
        nha() { gion = null; ctx.hit(); ve(); ctx.doi(); },
      };
    });

    ve();
    veKhay();
  },
};
