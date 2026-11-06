// Cơ khí biến đổi: kéo, đổi cỡ, xoay bằng tay nắm thật, khóa tỉ lệ, đổi tệp nguồn, soi mật độ điểm ảnh.
// Dùng cho C10-09. Đây là mẫu tay nắm tốt nhất của bản cũ, viết lại cho ngón tay.
import { keoTay, datCoTheoNeo, gocChuan, gocKhung, giong, kep } from '../toan/hinh-hoc.mjs';
import { MAU, datVao, logoLong, logoKhoi, tieuDe } from '../hinh.mjs';
import { taoSvg, batKeo, hangCu } from './chung.mjs';

export const W = 360, H = 300;

export const TEP = {
  chup: { ten: 'logo-chup.jpg', mo: 'Ảnh chụp, 200 điểm', px: 200 },
  web: { ten: 'logo-web.png', mo: 'Ảnh điểm, 800 điểm', px: 800 },
  svg: { ten: 'logo.svg', mo: 'Vector', px: Infinity },
};

const tiLeGoc = { logo: 1, 'tieu-de': 4 };
export const dungTep = (st) => TEP[st.tep || 'svg'];

export function matDoIn(st, man, v) {
  const t = dungTep(st);
  if (t.px === Infinity) return Infinity;
  return t.px / (v.w * (man.san.cmMoiDv || 1));
}

export function tranhVat(st, man, v) {
  if (v.loai === 'tieu-de') return tieuDe();
  return logoLong();
}

export default {
  tao: (man) => giong(man.dau),
  lam: {
    khoa(st, b) { st.khoa = b; },
    dat(st, id, gt) { Object.assign(st.vat.find((v) => v.id === id), gt); },
    doiTep(st, t) { st.tep = t; },
  },
  do(st, man) {
    const ra = {};
    for (const v of st.vat) {
      const z = man.san.vung[v.id];
      const pad = 2;
      const trong = gocKhung(v).every((p) => p.x >= z.x - pad && p.y >= z.y - pad && p.x <= z.x + z.w + pad && p.y <= z.y + z.h + pad);
      const tl = v.w / v.h / tiLeGoc[v.loai];
      ra[v.id] = {
        meo: Math.abs(tl - 1),
        trong,
        // Mức phủ khung: tính theo chiều chạm khung trước, vì hình giữ tỉ lệ chỉ vừa khít một chiều.
        phu: Math.max(v.w / z.w, v.h / z.h),
        lech: Math.hypot(v.x - (z.x + z.w / 2), v.y - (z.y + z.h / 2)),
        goc: Math.abs(gocChuan(v.goc)),
      };
    }
    const dau = st.vat[0];
    ra.matDo = matDoIn(st, man, dau);
    ra.cmIn = Math.round(dau.w * (man.san.cmMoiDv || 1));
    return ra;
  },

  ve(ctx) {
    const { san, khay, man } = ctx;
    san.innerHTML = '';
    const svg = taoSvg(san, W, H, man.sanNhan || 'Sân kéo thả');
    const cu = man.san.cu || [];
    let soi = false;
    let dangKeo = false;
    let dan = null;

    const nen = () => {
      if (man.san.nen === 'bang-ron') {
        return `<rect width="${W}" height="${H}" fill="${MAU.tuong}"/><rect y="240" width="${W}" height="60" fill="${MAU.san}"/>
          <rect x="10" y="84" width="340" height="113" rx="4" fill="url(#gr-poster)"/>
          <g fill="${MAU.trang}" opacity=".85"><circle cx="20" cy="94" r="3"/><circle cx="340" cy="94" r="3"/><circle cx="20" cy="187" r="3"/><circle cx="340" cy="187" r="3"/></g>
          <text x="180" y="62" text-anchor="middle" font-size="14" font-weight="700" fill="${MAU.muc}" font-family="var(--font)">Băng rôn cổng trường, 3 mét x 1 mét</text>`;
      }
      return `<rect width="${W}" height="${H}" fill="${MAU.tuong}"/><rect x="40" y="14" width="280" height="272" rx="8" fill="url(#gr-poster)"/>`;
    };

    const vung = () => Object.entries(man.san.vung).map(([, z]) =>
      `<rect x="${z.x}" y="${z.y}" width="${z.w}" height="${z.h}" rx="6" fill="${MAU.trang}" fill-opacity=".1" stroke="${MAU.vang}" stroke-width="2" stroke-dasharray="7 6"/>
       <text x="${z.x + z.w / 2}" y="${z.y + z.h + 15}" text-anchor="middle" font-size="12" font-weight="700" fill="${MAU.vang}" font-family="var(--font)">${z.ten}</text>`).join('');

    const tay = (v) => {
      const st = ctx.st;
      const { x, y, w, h, goc } = v;
      let s = `<g transform="translate(${x} ${y}) rotate(${goc})"><rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" fill="none" stroke="${MAU.chan}" stroke-width="2"/>`;
      if (cu.includes('xoay')) {
        s += `<path d="M0 ${-h / 2}V${-h / 2 - 26}" stroke="${MAU.chan}" stroke-width="2"/><g data-h="xoay"><circle cy="${-h / 2 - 30}" r="22" fill="transparent"/><circle cy="${-h / 2 - 30}" r="9" fill="${MAU.cyan}" stroke="${MAU.muc}" stroke-width="2"/></g>`;
      }
      if (!st.khoa) {
        for (const [a, b] of [[0, -1], [1, 0], [0, 1], [-1, 0]]) {
          s += `<g data-h="tay:${a}:${b}"><circle cx="${(a * w) / 2}" cy="${(b * h) / 2}" r="18" fill="transparent"/><rect x="${(a * w) / 2 - 6}" y="${(b * h) / 2 - 6}" width="12" height="12" rx="3" fill="${MAU.xamNhat}" stroke="${MAU.chan}" stroke-width="2"/></g>`;
        }
      }
      for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
        s += `<g data-h="tay:${a}:${b}"><circle cx="${(a * w) / 2}" cy="${(b * h) / 2}" r="22" fill="transparent"/><circle cx="${(a * w) / 2}" cy="${(b * h) / 2}" r="8" fill="${MAU.trang}" stroke="${MAU.chan}" stroke-width="2.5"/></g>`;
      }
      return s + '</g>';
    };

    const kinhSoi = () => {
      const st = ctx.st;
      const v = st.vat[0];
      const md = matDoIn(st, man, v);
      const n = md === Infinity ? 0 : kep(Math.round(md * 4), 8, 60);
      const anh = n ? logoKhoi(n) : logoLong();
      return `<clipPath id="cl-soi"><circle cx="288" cy="52" r="46"/></clipPath>
        <g clip-path="url(#cl-soi)"><rect x="240" y="4" width="96" height="96" fill="${MAU.trang}"/><g transform="translate(288 52) scale(3) translate(-50 -40)">${anh}</g></g>
        <circle cx="288" cy="52" r="46" fill="none" stroke="${MAU.muc}" stroke-width="3"/>
        <text x="288" y="118" text-anchor="middle" font-size="11.5" font-weight="700" fill="${MAU.muc}" font-family="var(--mono)">${md === Infinity ? 'nét ở mọi cỡ' : `${md.toFixed(1)} điểm/cm khi in`}</text>`;
    };

    const ve = () => {
      const st = ctx.st;
      const chon = st.vat.find((v) => v.id === st.chon);
      let s = nen() + vung();
      for (const v of st.vat) {
        const [rong, cao] = v.loai === 'tieu-de' ? [200, 50] : [100, 100];
        s += `<g data-h="vat:${v.id}">${datVao(tranhVat(st, man, v), v.x, v.y, v.w, v.h, v.goc, rong, cao)}<rect x="${v.x - v.w / 2}" y="${v.y - v.h / 2}" width="${v.w}" height="${v.h}" fill="transparent" transform="rotate(${v.goc} ${v.x} ${v.y})"/></g>`;
      }
      if (dan) s += `<path d="${dan}" stroke="${MAU.hong}" stroke-width="1.6" stroke-dasharray="5 4"/>`;
      if (chon) s += tay(chon);
      if (soi && !dangKeo) s += kinhSoi();
      svg.innerHTML = s;
    };

    const veKhay = () => {
      const st = ctx.st;
      khay.innerHTML = '';
      hangCu(khay, [
        cu.includes('khoa') && { id: 'khoa', nhan: st.khoa ? 'Đang khóa tỉ lệ' : 'Khóa tỉ lệ', ic: st.khoa ? 'khoa' : 'moKhoa', bat: st.khoa, bam() { ctx.ghi(); st.khoa = !st.khoa; ve(); veKhay(); ctx.doi(); } },
        cu.includes('soi') && { id: 'soi', nhan: 'Soi', ic: 'soi', bat: soi, bam() { soi = !soi; st.daSoi = true; ve(); veKhay(); ctx.doi(); } },
        ...(st.vat.length > 1 ? st.vat.map((v) => ({
          id: `chon-${v.id}`, nhan: v.loai === 'tieu-de' ? 'Tiêu đề' : 'Logo', ic: 'tep', bat: st.chon === v.id,
          bam() { st.chon = v.id; ve(); veKhay(); },
        })) : []),
      ]);
      if (cu.includes('tep')) {
        hangCu(khay, Object.entries(TEP).map(([k, t]) => ({
          id: `tep-${k}`, nhan: t.ten, sub: t.mo, ic: 'tep', bat: st.tep === k,
          bam() { ctx.ghi(); st.tep = k; ve(); veKhay(); ctx.doi(); },
        })), { deu: true });
      }
    };

    batKeo(svg, W, H, (h, pt) => {
      const st = ctx.st;
      if (!h) { return null; }
      if (h.startsWith('vat:')) {
        const id = h.slice(4);
        if (st.chon !== id) { st.chon = id; veKhay(); }
        const v = st.vat.find((o) => o.id === id);
        const dx = pt.x - v.x, dy = pt.y - v.y;
        ctx.ghi();
        dangKeo = true;
        const z = man.san.vung[id];
        return {
          di(p) {
            v.x = kep(p.x - dx, 0, W);
            v.y = kep(p.y - dy, 0, H);
            dan = null;
            const cx = z.x + z.w / 2, cy = z.y + z.h / 2;
            if (Math.abs(v.x - cx) < 6) { v.x = cx; dan = `M${cx} 0V${H}`; }
            if (Math.abs(v.y - cy) < 6) { v.y = cy; dan = `${dan || ''}M0 ${cy}H${W}`; }
            ve();
          },
          nha() { dangKeo = false; dan = null; ve(); ctx.doi(); },
        };
      }
      const v = st.vat.find((o) => o.id === st.chon);
      if (!v) return null;
      if (h === 'xoay') {
        ctx.ghi();
        dangKeo = true;
        return {
          di(p) {
            let g = (Math.atan2(p.y - v.y, p.x - v.x) * 180) / Math.PI + 90;
            g = gocChuan(g);
            if (Math.abs(g) < 5) g = 0;
            v.goc = Math.round(g);
            ve();
          },
          nha() { dangKeo = false; ve(); ctx.doi(); },
        };
      }
      if (h.startsWith('tay:')) {
        const [, a, b] = h.split(':');
        const v0 = { ...v };
        ctx.ghi();
        dangKeo = true;
        return {
          di(p) {
            const tay = { sx: +a, sy: +b };
            let moi = keoTay(v0, tay, p.x, p.y, st.khoa);
            // Gần chạm cạnh khung thì hít vào, ngón tay không cần trúng từng điểm.
            const z = man.san.vung[v.id];
            if (st.khoa && z) {
              const k = [z.w / moi.w, z.h / moi.h].find((x) => Math.abs(x - 1) * Math.max(moi.w, moi.h) < 5);
              if (k && (moi.w * k <= z.w + 0.01) && (moi.h * k <= z.h + 0.01)) moi = datCoTheoNeo(v0, tay, moi.w * k, moi.h * k);
            }
            Object.assign(v, moi);
            ve();
          },
          nha() { dangKeo = false; ve(); ctx.doi(); },
        };
      }
      return null;
    });

    ve();
    veKhay();
  },
};
