// Cơ khí ảnh động: xếp khung, xóa khung lỗi, chỉnh thời gian mỗi khung, xem chạy lặp thật (U11-13).
import { giong } from '../toan/hinh-hoc.mjs';
import { MAU, robot, datVao } from '../hinh.mjs';
import { taoSvg, batKeo, hangCu, thanhTruot, dongHo } from './chung.mjs';

export const W = 360, H = 268;

// Thời gian hiển thị của một khung. Màn msRieng để số này trên từng khung, các màn khác dùng chung st.ms.
export const msCua = (st, k) => k.ms ?? st.ms;

export function chuKy(st) { return st.khung.reduce((t, k) => t + msCua(st, k), 0); }

// Mắt phải khép dần: mở, lim dim, nhắm. Tính cả chỗ nối từ khung cuối về khung đầu.
const MUC_MAT = { mo: 0, lim: 1, nham: 2 };
const mucMat = (k) => MUC_MAT[k.mat || 'mo'];
function matNhay(st) {
  const k = st.khung;
  let m = 0;
  for (let i = 0; i < k.length; i++) m = Math.max(m, Math.abs(mucMat(k[i]) - mucMat(k[(i + 1) % k.length])));
  return m;
}

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
  msKhung(st, id, v) { st.khung.find((k) => k.id === id).ms = v; },
  xep(st, ids) { st.khung = ids.map((id) => st.khung.find((k) => k.id === id)); },
};

function doKhung(st) {
  const tongMat = (loc) => st.khung.filter(loc).reduce((t, k) => t + msCua(st, k), 0);
  return {
    giat: giatLonNhat(st),
    loi: st.khung.filter((k) => k.mat === 'nham').length,
    chuKy: chuKy(st),
    soKhung: st.khung.length,
    matNhay: matNhay(st),
    giuMo: tongMat((k) => mucMat(k) === 0),
    chopMs: tongMat((k) => mucMat(k) > 0),
  };
}

export default {
  tao: (man) => giong(man.dau),
  lam,
  do: doKhung,

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
        // Màn msRieng ghi thời gian ngay trên khung, nhìn dải là biết khung nào lâu khung nào nhanh.
        s += `<text x="${x + rong / 2}" y="${y + 76}" text-anchor="middle" font-size="${man.msRieng ? 10.5 : 12}" font-weight="700" fill="${chon ? MAU.trang : MAU.muc}" font-family="var(--mono)">${man.msRieng ? `${msCua(st, k)}ms` : i + 1}</text></g>`;
      });
      s += `<g data-h="phat"><circle cx="326" cy="34" r="24" fill="transparent"/><circle cx="326" cy="34" r="17" fill="${MAU.trang}" stroke="${MAU.muc}" stroke-width="2"/>${phat ? `<path d="M320 27h4v14h-4zM328 27h4v14h-4z" fill="${MAU.muc}"/>` : `<path d="M321 26l13 8-13 8z" fill="${MAU.muc}"/>`}</g>`;
      svg.innerHTML = s;
    };

    const veKhay = () => {
      const st = ctx.st;
      khay.innerHTML = '';
      const dang = st.khung[st.chon];
      hangCu(khay, [{
        id: 'xoa-khung', nhan: dang ? `Xóa khung ${st.chon + 1}` : 'Xóa khung', ic: 'xoa', tat: !dang || st.khung.length < 3,
        bam() { ctx.ghi(); lam.xoa(st, st.chon); st.chon = man.msRieng ? 0 : null; ve(); veKhay(); ctx.doi(); },
      }]);
      let daGhi = false;
      // Màn msRieng: thanh trượt chỉ đổi khung đang chọn, các khung khác giữ nguyên.
      const cauHinh = man.msRieng
        ? { nhan: dang ? `Khung ${st.chon + 1}` : 'Chọn một khung', min: 50, max: 3000, buoc: 50, gia: dang ? msCua(st, dang) : 300, id: `ms-${dang?.id}`, dat(v) { if (dang) dang.ms = v; } }
        : { nhan: 'Mỗi khung', min: 50, max: 500, buoc: 10, gia: st.ms, id: 'ms', dat(v) { st.ms = v; } };
      thanhTruot(khay, {
        ...cauHinh, dinh: (v) => `${v} ms`,
        doi(v) {
          if (!daGhi) { ctx.ghi(); daGhi = true; }
          cauHinh.dat(v);
          ve();
          ctx.hit(doVong() ? 'nhip' : '');
        },
        xong() { daGhi = false; ctx.hit(); ctx.doi(); },
      });
      const dh = dongHo(khay, man.dongHo || []);
      const doVong = () => dh.capNhat(doKhung(st));
      doVong();
    };

    batKeo(svg, W, H, (h) => {
      const st = ctx.st;
      if (h === 'phat') { phat = !phat; ve(); return null; }
      if (!h || !h.startsWith('k:')) return null;
      let i = +h.slice(2);
      st.chon = i;
      ve(); veKhay();
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
        nha() { ve(); veKhay(); ctx.doi(); },
      };
    });

    const choTiep = () => {
      const k = ctx.st.khung;
      return msCua(ctx.st, k[bat % Math.max(1, k.length)] || {});
    };
    const nhip = () => {
      if (phat) { bat++; ve(); }
      dem = setTimeout(nhip, choTiep());
    };
    dem = setTimeout(nhip, choTiep());

    ve();
    veKhay();
    return () => clearTimeout(dem);
  },
};
