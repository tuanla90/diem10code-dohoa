// Cơ khí chữ trên ảnh: đo tương phản thật với từng điểm ảnh phía sau chữ (U11-12).
import { giong } from '../toan/hinh-hoc.mjs';
import { anhSanTruong, doChoi, tuongPhanWcag } from '../toan/anh.mjs';
import { MAU } from '../hinh.mjs';
import { hitTruc } from '../toan/hit.mjs';
import { taoSvg, batKeo, hangCu, dungBoCu } from './chung.mjs';

export const W = 360, H = 202;
const MAU_CHU = {
  trang: { ten: 'Trắng', hex: '#ffffff', rgb: [255, 255, 255] },
  muc: { ten: 'Mực', hex: '#1e1b4b', rgb: [30, 27, 75] },
  vang: { ten: 'Vàng', hex: '#fbbf24', rgb: [251, 191, 36] },
  hong: { ten: 'Hồng', hex: '#ec6fbf', rgb: [236, 111, 191] },
};
export const NOI_DUNG = 'NGÀY HỘI TIN HỌC';

let goc = null;
export const anhGoc = () => (goc ||= anhSanTruong());

export function hopChu(st) {
  const w = NOI_DUNG.length * st.co * 0.6;
  return { x: st.x - w / 2, y: st.y - st.co * 0.62, w, h: st.co * 1.15 };
}

export function doChu(st, man) {
  const a = anhGoc();
  const b = hopChu(st);
  const tx = a.w / W;
  const mau = MAU_CHU[st.mau];
  const lChu = doChoi(...mau.rgb);
  const dai = st.dai ? (lChu > 0.4 ? [30, 27, 75] : [255, 255, 255]) : null;
  const ds = [];
  for (let y = Math.floor(b.y * tx); y < (b.y + b.h) * tx; y++) {
    for (let x = Math.floor(b.x * tx); x < (b.x + b.w) * tx; x++) {
      if (x < 0 || y < 0 || x >= a.w || y >= a.h) continue;
      const k = (y * a.w + x) * 4;
      let r = a.data[k], g = a.data[k + 1], bl = a.data[k + 2];
      if (dai) { r = r * 0.2 + dai[0] * 0.8; g = g * 0.2 + dai[1] * 0.8; bl = bl * 0.2 + dai[2] * 0.8; }
      ds.push(tuongPhanWcag(lChu, doChoi(r, g, bl)));
    }
  }
  ds.sort((p, q) => p - q);
  const toi = ds.length ? ds[Math.floor(ds.length * 0.1)] : 1;
  const z = man.vungCam;
  const che = b.x < z.x + z.w && z.x < b.x + b.w && b.y < z.y + z.h && z.y < b.y + b.h;
  const le = 6;
  const tron = b.x >= le && b.y >= le && b.x + b.w <= W - le && b.y + b.h <= H - le;
  return { tuongPhan: toi, cheNguoi: che, trongLe: tron, co: st.co, dai: !!st.dai };
}

export function veChu(st) {
  const b = hopChu(st);
  const mau = MAU_CHU[st.mau];
  const lChu = doChoi(...mau.rgb);
  const dai = st.dai ? `<rect x="${b.x - 3}" y="${b.y}" width="${b.w + 6}" height="${b.h}" rx="5" fill="${lChu > 0.4 ? MAU.muc : MAU.trang}" fill-opacity=".8"/>` : '';
  return `${dai}<text x="${st.x}" y="${st.y + st.co * 0.3}" text-anchor="middle" font-size="${st.co}" font-weight="800" fill="${mau.hex}" font-family="var(--font)">${NOI_DUNG}</text>`;
}

export default {
  tao: (man) => giong(man.dau),
  lam: { dat(st, gt) { Object.assign(st, gt); } },
  do: doChu,

  ve(ctx) {
    const { san, khay, man } = ctx;
    const a = anhGoc();
    san.innerHTML = '';
    const chong = document.createElement('div');
    chong.className = 'san-chong';
    const cv = document.createElement('canvas');
    cv.className = 'san-canvas';
    cv.width = a.w;
    cv.height = a.h;
    cv.setAttribute('aria-hidden', 'true');
    cv.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(a.data), a.w, a.h), 0, 0);
    chong.appendChild(cv);
    san.appendChild(chong);
    const svg = taoSvg(chong, W, H, man.sanNhan || 'Ảnh sân trường, kéo chữ để đặt');
    svg.style.height = '100%';
    svg.setAttribute('preserveAspectRatio', 'none');
    let gion = null;

    const ve = () => {
      const st = ctx.st;
      const b = hopChu(st);
      let s = `<g data-h="chu">${veChu(st)}<rect x="${b.x}" y="${b.y - 6}" width="${b.w}" height="${b.h + 12}" fill="transparent" stroke="${MAU.cyan}" stroke-width="1.5" stroke-dasharray="5 4"/></g>`;
      if (ctx.cu === 'co') {
        const hx = Math.min(b.x + b.w, W - 12), hy = b.y + b.h / 2;
        s += `<g data-h="co"><circle cx="${hx}" cy="${hy}" r="22" fill="transparent"/><circle cx="${hx}" cy="${hy}" r="8" fill="${MAU.trang}" stroke="${MAU.chan}" stroke-width="2.5"/></g>`;
        s += `<text x="12" y="${H - 10}" font-size="13" font-weight="800" fill="${MAU.muc}" font-family="var(--mono)">cỡ ${st.co}</text>`;
      }
      if (gion) s += `<path d="${gion}" stroke="${MAU.hong}" stroke-width="1.8" stroke-dasharray="5 4"/>`;
      svg.innerHTML = s;
    };

    const veKhay = () => {
      const st = ctx.st;
      khay.innerHTML = '';
      if (ctx.cu !== 'mau') return;
      hangCu(khay, [
        ...Object.entries(MAU_CHU).map(([k, m]) => ({
          id: `mau-${k}`, nhan: m.ten, bat: st.mau === k,
          tranh: `<svg class="cu-thu" viewBox="0 0 30 30" aria-hidden="true"><circle cx="15" cy="15" r="11" fill="${m.hex}" stroke="${MAU.muc}" stroke-width="1.5"/></svg>`,
          bam() { ctx.ghi(); st.mau = k; ve(); veKhay(); ctx.doi(); },
        })),
        { id: 'dai', nhan: 'Dải nền', ic: 'dai', bat: !!st.dai, bam() { ctx.ghi(); st.dai = !st.dai; ve(); veKhay(); ctx.doi(); } },
      ], { deu: true });
    };

    batKeo(svg, W, H, (h, pt) => {
      const st = ctx.st;
      if (h === 'co') {
        ctx.ghi();
        return {
          di(p) {
            const dai = NOI_DUNG.length * 0.6;
            st.co = Math.max(12, Math.min(40, Math.round((Math.abs(p.x - st.x) * 2) / dai)));
            ve();
          },
          nha() { ctx.doi(); },
        };
      }
      if (h !== 'chu') return null;
      if (ctx.cu !== 'chon') {
        ctx.nhac(ctx.cu === 'co' ? 'Đang cầm <b>Cỡ chữ</b>: kéo chấm tròn ở đầu chữ. Muốn dời chữ thì chọn <b>Di chuyển</b>.' : 'Đang cầm <b>Màu</b>. Muốn dời chữ thì chọn <b>Di chuyển</b>.');
        return null;
      }
      const dx = pt.x - st.x, dy = pt.y - st.y;
      const LE = 6;
      let daGhi = false;
      return {
        di(p) {
          if (!daGhi) { ctx.ghi(); daGhi = true; }
          st.x = Math.max(0, Math.min(W, Math.round(p.x - dx)));
          st.y = Math.max(0, Math.min(H, Math.round(p.y - dy)));
          // Gần giữa ảnh hoặc gần lề an toàn thì hít vào, có đường gióng báo hiệu.
          const b = hopChu(st);
          const hx = hitTruc(b.x, b.w, [{ t: W / 2, neo: 0.5 }, { t: LE, neo: 0 }, { t: W - LE, neo: 1 }]);
          const hy = hitTruc(b.y, b.h, [{ t: LE, neo: 0 }, { t: H - LE, neo: 1 }]);
          gion = null;
          if (hx) { st.x += hx.doi; gion = `M${hx.moc.t} 0V${H}`; }
          if (hy) { st.y += hy.doi; gion = `${gion || ''}M0 ${hy.moc.t}H${W}`; }
          ctx.hit(gion);
          ve();
        },
        nha() { gion = null; ctx.hit(); ve(); ctx.doi(); },
      };
    });

    dungBoCu(ctx, [
      { id: 'chon', nhan: 'Di chuyển', ic: 'diChuyen' },
      { id: 'co', nhan: 'Cỡ chữ', ic: 'doiCo' },
      { id: 'mau', nhan: 'Màu', ic: 'chu' },
    ], 'chon', () => { ve(); veKhay(); });
    ve();
    veKhay();
  },
};
