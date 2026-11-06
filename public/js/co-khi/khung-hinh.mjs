// Cơ khí ảnh động: xếp khung, xóa khung lỗi, chỉnh thời gian mỗi khung, xem chạy lặp thật (U11-13).
import { giong } from '../toan/hinh-hoc.mjs';
import { MAU, robot, datVao } from '../hinh.mjs';
import { taoSvg, batKeo, thanhTruot, dungBoCu } from './chung.mjs';

export const W = 360, H = 268;

export function chuKy(st) { return st.khung.length * st.ms; }

export function giatLonNhat(st) {
  const k = st.khung;
  let m = 0;
  for (let i = 0; i < k.length; i++) m = Math.max(m, Math.abs(k[i].goc - k[(i + 1) % k.length].goc));
  return m;
}

const lam = {
  doi(st, i, j) { const k = st.khung; if (j < 0 || j >= k.length) return; [k[i], k[j]] = [k[j], k[i]]; st.chon = j; },
  xoa(st, i) { st.khung.splice(i, 1); st.chon = Math.min(i, st.khung.length - 1); },
  ms(st, v) { st.ms = v; },
  xep(st, ids) { st.khung = ids.map((id) => st.khung.find((k) => k.id === id)); },
};

export default {
  tao: (man) => giong(man.dau),
  lam,
  do(st) {
    return {
      giat: giatLonNhat(st),
      loi: st.khung.filter((k) => k.mat === 'nham').length,
      chuKy: chuKy(st),
      soKhung: st.khung.length,
    };
  },

  ve(ctx) {
    const { san, khay, man } = ctx;
    san.innerHTML = '';
    const svg = taoSvg(san, W, H, man.sanNhan || 'Xem thử ảnh động và dải khung hình');
    let phat = true;
    let bat = 0;
    let dem = 0;

    const ve = () => {
      const st = ctx.st;
      const n = st.khung.length;
      const hien = n ? st.khung[bat % n] : null;
      let s = `<rect width="${W}" height="${H}" fill="${MAU.tuong}"/><rect y="150" width="${W}" height="10" fill="${MAU.san}"/>`;
      if (hien) s += datVao(robot(hien.goc, { mat: hien.mat }), 180, 82, 120, 150, 0, 120, 150);
      s += `<text x="16" y="28" font-size="14" font-weight="750" fill="${MAU.muc}" font-family="var(--font)">${phat ? 'Đang phát lặp' : 'Đang dừng'}</text>`;
      s += `<text x="16" y="48" font-size="12.5" fill="${MAU.muc}" font-family="var(--mono)">vòng ${(chuKy(st) / 1000).toFixed(1)} s</text>`;
      const rong = Math.min(48, (W - 16) / Math.max(1, n) - 6);
      const dau = (W - n * (rong + 6) + 6) / 2;
      st.khung.forEach((k, i) => {
        const x = dau + i * (rong + 6), y = 174;
        const chon = st.chon === i;
        s += `<g data-h="k:${i}"><rect x="${x}" y="${y}" width="${rong}" height="82" rx="8" fill="${chon ? MAU.chan : MAU.trang}" stroke="${bat % n === i && phat ? MAU.hong : MAU.san}" stroke-width="3"/>`;
        s += `<g transform="translate(${x + 3} ${y + 6})">${datVao(robot(k.goc, { mat: k.mat }), (rong - 6) / 2, 30, rong - 6, 60, 0, 120, 150)}</g>`;
        s += `<text x="${x + rong / 2}" y="${y + 76}" text-anchor="middle" font-size="12" font-weight="700" fill="${chon ? MAU.trang : MAU.muc}" font-family="var(--mono)">${i + 1}</text></g>`;
      });
      s += `<g data-h="phat"><circle cx="326" cy="34" r="24" fill="transparent"/><circle cx="326" cy="34" r="17" fill="${MAU.trang}" stroke="${MAU.muc}" stroke-width="2"/>${phat ? `<path d="M320 27h4v14h-4zM328 27h4v14h-4z" fill="${MAU.muc}"/>` : `<path d="M321 26l13 8-13 8z" fill="${MAU.muc}"/>`}</g>`;
      svg.innerHTML = s;
    };

    const veKhay = () => {
      const st = ctx.st;
      khay.innerHTML = '';
      if (ctx.cu !== 'nhip') return;
      let daGhi = false;
      thanhTruot(khay, {
        nhan: 'Mỗi khung', min: 50, max: 500, buoc: 10, gia: st.ms, dinh: (v) => `${v} ms`, id: 'ms',
        doi(v) { if (!daGhi) { ctx.ghi(); daGhi = true; } st.ms = v; ve(); },
        xong() { daGhi = false; ctx.doi(); },
      });
    };

    batKeo(svg, W, H, (h) => {
      const st = ctx.st;
      if (h === 'phat') { phat = !phat; ve(); return null; }
      if (!h || !h.startsWith('k:')) return null;
      let i = +h.slice(2);
      st.chon = i;
      if (ctx.cu === 'xoa') {
        if (st.khung.length < 3) { ctx.nhac('Ảnh động cần ít nhất 2 khung.'); return null; }
        ctx.ghi();
        lam.xoa(st, i);
        st.chon = null;
        ve(); ctx.doi();
        return null;
      }
      if (ctx.cu !== 'xep') { ve(); ctx.nhac('Đang cầm <b>Nhịp</b>. Muốn đổi chỗ khung thì chọn <b>Xếp khung</b>.'); return null; }
      ve();
      let daGhi = false;
      return {
        // Kéo khung qua chỗ nào thì các khung kia nhường chỗ ngay, thả ở đâu là vào đúng ô đó.
        di(p) {
          const n = st.khung.length;
          const rong = Math.min(48, (W - 16) / Math.max(1, n) - 6);
          const dau = (W - n * (rong + 6) + 6) / 2;
          const dich = Math.max(0, Math.min(n - 1, Math.round((p.x - dau - rong / 2) / (rong + 6))));
          while (i !== dich) {
            const j = i + Math.sign(dich - i);
            if (!daGhi) { ctx.ghi(); daGhi = true; }
            lam.doi(st, i, j);
            i = j;
          }
          ve();
        },
        nha() { ve(); ctx.doi(); },
      };
    });

    const nhip = () => {
      if (phat) { bat++; ve(); }
      dem = setTimeout(nhip, ctx.st.ms);
    };
    dem = setTimeout(nhip, ctx.st.ms);

    dungBoCu(ctx, [
      { id: 'xep', nhan: 'Xếp khung', ic: 'xep' },
      { id: 'xoa', nhan: 'Xóa khung', ic: 'xoa' },
      { id: 'nhip', nhan: 'Nhịp', ic: 'phim' },
    ], 'xep', () => veKhay());
    ve();
    veKhay();
    return () => clearTimeout(dem);
  },
};
