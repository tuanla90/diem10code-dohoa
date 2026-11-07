// Cơ khí biến đổi: kéo, đổi cỡ, xoay bằng tay nắm thật, khóa tỉ lệ, đổi tệp nguồn, soi mật độ điểm ảnh.
// Dùng cho C10-09. Đây là mẫu tay nắm tốt nhất của bản cũ, viết lại cho ngón tay.
import { keoTay, datCoTheoNeo, gocChuan, gocKhung, giong, kep } from '../toan/hinh-hoc.mjs';
import { MAU, datVao, logoLong, tieuDe } from '../hinh.mjs';
import { hitTruc, hitGoc, DUNG_SAI } from '../toan/hit.mjs';
import { veKinh } from '../kinh-soi.mjs';
import { taoSvg, batKeo, hangCu, vungTay } from './chung.mjs';

export const W = 360, H = 300;

export const TEP = {
  chup: { ten: 'logo-chup.jpg', mo: '200 điểm', px: 200 },
  web: { ten: 'logo-web.png', mo: '800 điểm', px: 800 },
  svg: { ten: 'logo.svg', mo: 'Vector', px: Infinity },
};

const tiLeGoc = { logo: 1, 'tieu-de': 4 };
export const dungTep = (st) => TEP[st.tep || 'svg'];

export function matDoIn(st, man, v) {
  const t = dungTep(st);
  if (t.px === Infinity) return Infinity;
  return t.px / (v.w * (man.san.cmMoiDv || 1));
}

// Các số của bảng thông tin tệp, giống hộp Kích thước ảnh của phần mềm thật.
export function thongTinTep(st, man, v) {
  const t = dungTep(st);
  const cm = man.san.cmMoiDv || 1;
  const matDo = matDoIn(st, man, v);
  const can = man.san.canMatDo || 0;
  return { ten: t.ten, px: t.px, rongCm: Math.round(v.w * cm), caoCm: Math.round(v.h * cm), matDo, ppi: Math.round(matDo * 2.54), can, dat: matDo >= can };
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
    let dan = null;

    const nen = () => {
      if (man.san.nen === 'bang-ron') {
        return `<rect width="${W}" height="${H}" fill="${MAU.tuong}"/><rect y="240" width="${W}" height="60" fill="${MAU.san}"/>
          <rect x="10" y="84" width="340" height="113" rx="4" fill="url(#gr-poster)"/>
          <g fill="${MAU.trang}" opacity=".85"><circle cx="20" cy="94" r="3"/><circle cx="340" cy="94" r="3"/><circle cx="20" cy="187" r="3"/><circle cx="340" cy="187" r="3"/></g>
          ${ctx.kinhBat ? '' : `<text x="180" y="62" text-anchor="middle" font-size="14" font-weight="700" fill="${MAU.muc}" font-family="var(--font)">Băng rôn cổng trường, 3 mét x 1 mét</text>`}`;
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
      const cham = (z) => `<rect x="${z.x}" y="${z.y}" width="${z.w}" height="${z.h}" fill="transparent"/>`;
      // Hình đang chọn luôn có đủ tay nắm, kéo thân là dời, kéo tay nắm là đổi cỡ hoặc xoay.
      // Chấm chỉ để nhìn, chạm tính theo vùng chạm: nếu không, chấm của hình nhỏ sẽ che kín phần thân.
      const rCham = Math.min(8, Math.max(4, Math.min(w, h) * 0.18));
      if (!st.khoa) {
        for (const [a, b] of [[0, -1], [1, 0], [0, 1], [-1, 0]]) {
          const z = vungTay(a, b, w, h);
          if (z) s += `<g data-h="tay:${a}:${b}">${cham(z)}<rect pointer-events="none" x="${(a * w) / 2 - rCham * 0.75}" y="${(b * h) / 2 - rCham * 0.75}" width="${rCham * 1.5}" height="${rCham * 1.5}" rx="3" fill="${MAU.xamNhat}" stroke="${MAU.chan}" stroke-width="2"/></g>`;
        }
      }
      for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
        s += `<g data-h="tay:${a}:${b}">${cham(vungTay(a, b, w, h))}<circle pointer-events="none" cx="${(a * w) / 2}" cy="${(b * h) / 2}" r="${rCham}" fill="${MAU.trang}" stroke="${MAU.chan}" stroke-width="2.5"/></g>`;
      }
      if (cu.includes('xoay')) {
        s += `<path d="M0 ${-h / 2}V${-h / 2 - 26}" stroke="${MAU.chan}" stroke-width="2"/><g data-h="xoay"><circle cy="${-h / 2 - 30}" r="22" fill="transparent"/><circle cy="${-h / 2 - 30}" r="9" fill="${MAU.cyan}" stroke="${MAU.muc}" stroke-width="2"/></g>`;
      }
      return s + '</g>';
    };

    // Vật nằm trên cùng tại một điểm, tính cả khi vật đang xoay.
    const vatTai = (pt) => {
      const ds = ctx.st.vat;
      for (let i = ds.length - 1; i >= 0; i--) {
        const v = ds[i];
        const g = (-v.goc * Math.PI) / 180;
        const dx = pt.x - v.x, dy = pt.y - v.y;
        if (Math.abs(dx * Math.cos(g) - dy * Math.sin(g)) <= v.w / 2 && Math.abs(dx * Math.sin(g) + dy * Math.cos(g)) <= v.h / 2) return v;
      }
      return null;
    };

    // Chỗ đang soi tính trên logo, nên đổi cỡ hay dời logo thì kính vẫn soi đúng chỗ đó. Mặc định là mép ngôi sao, nơi dễ thấy ô nhất.
    let diemSoi = { u: 44, v: 24 };
    // Giữ điểm soi trong hình tròn logo: rê ra ngoài thì kính dừng ở mép, không soi vào chỗ trống.
    const datSoi = (u, v) => {
      const du = u - 50, dv = v - 50;
      const k = Math.min(1, 46 / (Math.hypot(du, dv) || 1));
      diemSoi = { u: 50 + du * k, v: 50 + dv * k };
      ve();
    };
    const kinhSoi = () => {
      const st = ctx.st;
      const v = st.vat.find((o) => o.id === st.chon) || st.vat[0];
      return veKinh({ diem: diemSoi, v, cmMoiDv: man.san.cmMoiDv || 1, file: dungTep(st).px, matDo: matDoIn(st, man, v), W, H });
    };

    const bangTep = () => {
      const st = ctx.st;
      const t = thongTinTep(st, man, st.vat[0]);
      const vector = t.px === Infinity;
      const o = (nhan, gt, phu) => `<div><dt>${nhan}</dt><dd>${gt}${phu ? `<small>${phu}</small>` : ''}</dd></div>`;
      return `<div class="tep-tin" role="status">
        <dl class="tep-so">
          ${o('Tệp gốc', vector ? 'Vector' : `${t.px} x ${t.px}`, vector ? 'không có ô' : 'điểm ảnh')}
          ${o('Cỡ in', `${t.rongCm} x ${t.caoCm}`, 'cm')}
          ${o('Mật độ', vector ? 'Luôn nét' : t.matDo.toFixed(1), vector ? 'ở mọi cỡ in' :`điểm/cm (${t.ppi} PPI)`)}
        </dl>
        <p class="tep-ket tep-ket--${t.dat ? 'dat' : 'vo'}"><b>${t.dat ? 'Đủ nét khi in' : 'Sẽ vỡ ô khi in'}</b><span>Tiệm in cần từ ${t.can} điểm/cm</span></p>
      </div>`;
    };

    const ve = () => {
      const st = ctx.st;
      const chon = st.vat.find((v) => v.id === st.chon);
      let s = nen() + vung();
      for (const v of st.vat) {
        const [rong, cao] = v.loai === 'tieu-de' ? [200, 50] : [100, 100];
        s += `<g data-h="vat:${v.id}">${datVao(tranhVat(st, man, v), v.x, v.y, v.w, v.h, v.goc, rong, cao)}<rect x="${v.x - v.w / 2}" y="${v.y - v.h / 2}" width="${v.w}" height="${v.h}" fill="transparent" transform="rotate(${v.goc} ${v.x} ${v.y})"/></g>`;
      }
      if (dan) s += `<path d="${dan}" fill="none" stroke="${MAU.hong}" stroke-width="1.6" stroke-dasharray="5 4"/>`;
      if (chon) s += tay(chon);
      if (ctx.kinhBat) s += kinhSoi();
      svg.innerHTML = s;
    };

    // Bảng luôn mở: khóa tỉ lệ, kính soi và thông tin tệp không nằm sau một công cụ nào.
    const veKhay = () => {
      const st = ctx.st;
      khay.innerHTML = '';
      const hang = [
        cu.includes('khoa') && { id: 'khoa', nhan: st.khoa ? 'Đang khóa tỉ lệ' : 'Khóa tỉ lệ', ic: st.khoa ? 'khoa' : 'moKhoa', bat: st.khoa, bam() { ctx.ghi(); st.khoa = !st.khoa; ve(); veKhay(); ctx.doi(); } },
        cu.includes('soi') && { id: 'kinh', nhan: 'Kính soi', ic: 'soi', bat: !!ctx.kinhBat, bam() { ctx.kinhBat = !ctx.kinhBat; ve(); veKhay(); ctx.doi(); } },
      ].filter(Boolean);
      if (hang.length) hangCu(khay, hang, { deu: hang.length > 1 });
      if (cu.includes('tep')) {
        khay.insertAdjacentHTML('beforeend', bangTep());
        hangCu(khay, Object.entries(TEP).map(([k, t]) => ({
          id: `tep-${k}`, nhan: t.ten, sub: t.mo, ic: 'tep', bat: st.tep === k,
          bam() { ctx.ghi(); st.tep = k; ve(); veKhay(); ctx.doi(); },
        })), { deu: true });
      }
    };

    batKeo(svg, W, H, (h, pt) => {
      const st = ctx.st;
      // Chạm nền là bỏ chọn, để xem hình không vướng khung.
      if (!h) {
        if (st.chon) { st.chon = null; ve(); ctx.doi(); }
        return null;
      }
      // Kéo kính là rê điểm soi. Kính nằm lệch khỏi điểm soi nên kéo theo độ dời của ngón tay.
      if (h === 'kinh') {
        const v = st.vat.find((o) => o.id === st.chon) || st.vat[0];
        const goc = { ...diemSoi };
        return {
          di: (p) => datSoi(goc.u + ((p.x - pt.x) / v.w) * 100, goc.v + ((p.y - pt.y) / v.h) * 100),
          // Lời dẫn chỉ qua bước khi đã thật sự soi, không phải chỉ vừa bật kính.
          nha() { st.daSoi = true; ctx.doi(); },
        };
      }
      if (h.startsWith('vat:')) {
        const id = h.slice(4);
        // Chạm hình nào là chọn hình đó và kéo được ngay, không phải đổi gì trước.
        if (st.chon !== id) { st.chon = id; ve(); }
        const v = st.vat.find((o) => o.id === id);
        const dx = pt.x - v.x, dy = pt.y - v.y;
        const z = man.san.vung[id];
        const mocX = [{ t: z.x, neo: 0 }, { t: z.x + z.w / 2, neo: 0.5 }, { t: z.x + z.w, neo: 1 }];
        const mocY = [{ t: z.y, neo: 0 }, { t: z.y + z.h / 2, neo: 0.5 }, { t: z.y + z.h, neo: 1 }];
        let daDi = false;
        return {
          di(p) {
            if (!daDi && Math.hypot(p.x - pt.x, p.y - pt.y) < 3) return;
            if (!daDi) { ctx.ghi(); daDi = true; }
            v.x = kep(p.x - dx, 0, W);
            v.y = kep(p.y - dy, 0, H);
            dan = null;
            // Lệch một chút so với tâm hay mép khung thì hít vào, kèm đường gióng cho thấy đã hít.
            const hx = hitTruc(v.x - v.w / 2, v.w, mocX);
            const hy = hitTruc(v.y - v.h / 2, v.h, mocY);
            if (hx) { v.x += hx.doi; dan = `M${hx.moc.t} 0V${H}`; }
            if (hy) { v.y += hy.doi; dan = `${dan || ''}M0 ${hy.moc.t}H${W}`; }
            ctx.hit(dan);
            ve();
          },
          nha() {
            // Kính đang bật thì chạm lên logo là đưa điểm soi tới chỗ đó.
            if (!daDi && ctx.kinhBat) { st.daSoi = true; datSoi(50 + ((pt.x - v.x) / v.w) * 100, 50 + ((pt.y - v.y) / v.h) * 100); ctx.doi(); return; }
            dan = null; ctx.hit(); ve(); ctx.doi();
          },
        };
      }
      const v = st.vat.find((o) => o.id === st.chon);
      if (!v) return null;
      if (h === 'xoay') {
        ctx.ghi();
        return {
          di(p) {
            let g = (Math.atan2(p.y - v.y, p.x - v.x) * 180) / Math.PI + 90;
            g = gocChuan(g);
            const vuong = hitGoc(g);
            dan = null;
            if (vuong !== null) { g = vuong; dan = `M${v.x} 0V${H}M0 ${v.y}H${W}`; }
            ctx.hit(dan);
            v.goc = Math.round(g);
            ve();
          },
          nha() { dan = null; ctx.hit(); ve(); ctx.doi(); },
        };
      }
      if (h.startsWith('tay:')) {
        const [, a, b] = h.split(':');
        const v0 = { ...v };
        // Vùng chạm rộng hơn chấm tròn nên giữ khoảng lệch lúc đặt ngón tay, để hình không giật theo ngón.
        const rad = (v.goc * Math.PI) / 180;
        const lx = (+a * v.w) / 2, ly = (+b * v.h) / 2;
        const ox = v.x + lx * Math.cos(rad) - ly * Math.sin(rad) - pt.x;
        const oy = v.y + lx * Math.sin(rad) + ly * Math.cos(rad) - pt.y;
        let daDi = false;
        return {
          di(p) {
            if (!daDi && Math.hypot(p.x - pt.x, p.y - pt.y) < 3) return;
            if (!daDi) { ctx.ghi(); daDi = true; }
            const tay = { sx: +a, sy: +b };
            const z = man.san.vung[v.id];
            const thang = Math.abs(gocChuan(v0.goc)) < 1;
            dan = null;
            let px = p.x + ox, py = p.y + oy;
            // Không khóa tỉ lệ: mép đang kéo gần mép khung thì hít vào mép đó.
            if (z && !st.khoa && thang) {
              const hx = tay.sx ? hitTruc(px, 0, [{ t: tay.sx > 0 ? z.x + z.w : z.x, neo: 0 }]) : null;
              const hy = tay.sy ? hitTruc(py, 0, [{ t: tay.sy > 0 ? z.y + z.h : z.y, neo: 0 }]) : null;
              if (hx) { px += hx.doi; dan = `M${px} 0V${H}`; }
              if (hy) { py += hy.doi; dan = `${dan || ''}M0 ${py}H${W}`; }
            }
            // Không cho nhỏ hơn 28: dưới mức đó ngón tay không còn chỗ để kéo thân hình.
            let moi = keoTay(v0, tay, px, py, st.khoa, 28);
            // Khóa tỉ lệ: cỡ gần vừa khít khung thì hít đúng cỡ đó, ngón tay không cần trúng từng điểm.
            if (st.khoa && z) {
              const k = [z.w / moi.w, z.h / moi.h].find((x) => Math.abs(x - 1) * Math.max(moi.w, moi.h) < DUNG_SAI && moi.w * x <= z.w + 0.01 && moi.h * x <= z.h + 0.01);
              if (k) {
                moi = datCoTheoNeo(v0, tay, moi.w * k, moi.h * k);
                dan = `M${z.x} ${z.y}h${z.w}v${z.h}h${-z.w}z`;
              }
            }
            ctx.hit(dan);
            Object.assign(v, moi);
            ve();
          },
          nha(p) {
            // Chạm mà không kéo trúng vùng tay nắm đè lên hình khác thì coi như chạm hình đó.
            const khac = !daDi && vatTai(p);
            if (khac && khac.id !== st.chon) st.chon = khac.id;
            dan = null; ctx.hit(); ve(); ctx.doi();
          },
        };
      }
      return null;
    });

    ve();
    veKhay();
  },
};
