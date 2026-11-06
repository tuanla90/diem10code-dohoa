// Cơ khí lớp và nhóm: đổi thứ tự lớp, nhóm mảnh, kéo cả cụm, đổi cỡ cụm, căn hàng và cách đều (C10-10).
import { giong, kep } from '../toan/hinh-hoc.mjs';
import { MAU, MANH_LOGO, BIEU_TUONG, datVao, tieuDe } from '../hinh.mjs';
import { hitTruc, hitMoc, mocCachDeu } from '../toan/hit.mjs';
import { taoSvg, batKeo, hangCu, hangKeo, dungBoCu } from './chung.mjs';

export const W = 360, H = 300;

const TRANH = { ...Object.fromEntries(Object.entries(MANH_LOGO).map(([k, m]) => [k, m])) };
for (const b of BIEU_TUONG) TRANH[b.id] = { ten: b.ten, hop: [4, 4, 92, 92], ve: b.ve };
TRANH['tieu-de'] = { ten: 'Tiêu đề poster', hop: [0, 0, 200, 50], ve: tieuDe };

const hop = (m) => {
  const [hx, hy, hw, hh] = TRANH[m.id].hop;
  return { x: m.x + hx * m.s, y: m.y + hy * m.s, w: hw * m.s, h: hh * m.s };
};
export const coChung = (a, b) => {
  const A = hop(a), B = hop(b);
  return A.x < B.x + B.w && B.x < A.x + A.w && A.y < B.y + B.h && B.y < A.y + A.h;
};

function hopCum(st, ids) {
  const ds = st.manh.filter((m) => ids.includes(m.id)).map(hop);
  const x = Math.min(...ds.map((d) => d.x)), y = Math.min(...ds.map((d) => d.y));
  return { x, y, w: Math.max(...ds.map((d) => d.x + d.w)) - x, h: Math.max(...ds.map((d) => d.y + d.h)) - y };
}

const cumCua = (st, id) => {
  const m = st.manh.find((o) => o.id === id);
  return m.nhom ? st.manh.filter((o) => o.nhom === m.nhom).map((o) => o.id) : [id];
};

const lam = {
  // Thứ tự mảng st.manh là thứ tự lớp: phần tử cuối nằm trên cùng.
  doiLop(st, i, j) {
    const [m] = st.manh.splice(i, 1);
    st.manh.splice(j, 0, m);
  },
  nhom(st, ids) {
    if (ids.length < 2) return;
    st.soNhom = (st.soNhom || 0) + 1;
    for (const m of st.manh) if (ids.includes(m.id)) m.nhom = st.soNhom;
  },
  raNhom(st, id) {
    const n = st.manh.find((m) => m.id === id)?.nhom;
    if (n) for (const m of st.manh) if (m.nhom === n) m.nhom = 0;
  },
  // Kéo: nếu mảnh trong nhóm thì cả cụm đi cùng.
  di(st, id, dx, dy) {
    for (const cid of cumCua(st, id)) {
      const m = st.manh.find((o) => o.id === cid);
      m.x += dx;
      m.y += dy;
    }
  },
  // Đổi cỡ cụm quanh góc trên trái của khung chứa.
  coCum(st, id, k) {
    const ids = cumCua(st, id);
    const h = hopCum(st, ids);
    for (const cid of ids) {
      const m = st.manh.find((o) => o.id === cid);
      m.x = h.x + (m.x - h.x) * k;
      m.y = h.y + (m.y - h.y) * k;
      m.s *= k;
    }
  },
  // Có hình mẫu thì các hình khác làm theo mẫu, không có thì lấy trung bình.
  canGiua(st, ids, mauId) {
    const ds = st.manh.filter((m) => ids.includes(m.id));
    const mau = ds.find((m) => m.id === mauId);
    const tb = mau ? hop(mau).y + hop(mau).h / 2 : ds.reduce((t, m) => { const b = hop(m); return t + b.y + b.h / 2; }, 0) / ds.length;
    for (const m of ds) { const b = hop(m); m.y += tb - (b.y + b.h / 2); }
  },
  cungCo(st, ids, mauId) {
    const ds = st.manh.filter((m) => ids.includes(m.id));
    const mau = ds.find((m) => m.id === mauId);
    const tb = mau ? mau.s : ds.reduce((t, m) => t + m.s, 0) / ds.length;
    for (const m of ds) {
      const b0 = hop(m), cx = b0.x + b0.w / 2, cy = b0.y + b0.h / 2;
      m.s = tb;
      const b1 = hop(m);
      m.x += cx - (b1.x + b1.w / 2);
      m.y += cy - (b1.y + b1.h / 2);
    }
  },
  // Cách đều khoảng hở giữa các khung, giữ hai đầu đứng yên, đúng như lệnh Distribute.
  cachDeu(st, ids) {
    const ds = st.manh.filter((m) => ids.includes(m.id)).map((m) => ({ m, b: hop(m) })).sort((a, b) => a.b.x - b.b.x);
    if (ds.length < 3) return;
    const dau = ds[0].b.x, cuoi = ds[ds.length - 1].b.x + ds[ds.length - 1].b.w;
    const tong = ds.reduce((t, d) => t + d.b.w, 0);
    const ho = (cuoi - dau - tong) / (ds.length - 1);
    let x = dau;
    for (const d of ds) { d.m.x += x - d.b.x; x += d.b.w + ho; }
  },
};

export default {
  tao: (man) => giong(man.dau),
  lam,
  do(st, man) {
    const ra = {};
    if (man.phaiTren) {
      const vi = (id) => st.manh.findIndex((m) => m.id === id);
      const sai = man.phaiTren.filter(([a, b]) => vi(a) < vi(b));
      ra.saiThuTu = sai;
      ra.nenDay = vi('nen') === 0;
    }
    if (man.cumLogo) {
      const goc = man.cumLogo.goc;
      const ds = st.manh.filter((m) => goc[m.id]);
      const a0 = ds[0];
      const k = a0.s / goc[a0.id].s;
      let lech = 0;
      for (const m of ds) {
        const g = goc[m.id];
        lech = Math.max(lech, Math.hypot(m.x - (a0.x + (g.x - goc[a0.id].x) * k), m.y - (a0.y + (g.y - goc[a0.id].y) * k)), Math.abs(m.s / g.s - k) * 100);
      }
      ra.roi = lech;
      const h = hopCum(st, ds.map((m) => m.id));
      const z = man.san.vung;
      ra.trongVung = h.x >= z.x - 3 && h.y >= z.y - 3 && h.x + h.w <= z.x + z.w + 3 && h.y + h.h <= z.y + z.h + 3;
      ra.phu = h.w / z.w;
      ra.cungNhom = ds.every((m) => m.nhom && m.nhom === ds[0].nhom);
      const td = st.manh.find((m) => m.id === 'tieu-de');
      ra.tieuDeYen = td ? Math.hypot(td.x - man.cumLogo.tieuDe.x, td.y - man.cumLogo.tieuDe.y) < 2 && !td.nhom : true;
      ra.leoKhacCo = Math.abs(k - 1);
    }
    if (man.hang) {
      const ds = st.manh.map((m) => ({ m, b: hop(m) })).sort((a, b) => a.b.x - b.b.x);
      const co = ds.map((d) => d.m.s);
      ra.lechCo = Math.max(...co) / Math.min(...co) - 1;
      const tam = ds.map((d) => d.b.y + d.b.h / 2);
      ra.lechHang = Math.max(...tam) - Math.min(...tam);
      const ho = ds.slice(1).map((d, i) => d.b.x - (ds[i].b.x + ds[i].b.w));
      ra.lechHo = Math.max(...ho) - Math.min(...ho);
      ra.hoAm = Math.min(...ho) < 0;
      const z = man.san.vung;
      ra.trongVung = ds.every((d) => d.b.x >= z.x - 2 && d.b.x + d.b.w <= z.x + z.w + 2 && d.b.y >= z.y - 2 && d.b.y + d.b.h <= z.y + z.h + 2);
      ra.dungThu = ds.map((d) => d.m.id).join() === man.hang.join();
    }
    return ra;
  },

  ve(ctx) {
    const { san, khay, man } = ctx;
    san.innerHTML = '';
    const svg = taoSvg(san, W, H, man.sanNhan || 'Sân các lớp hình');
    const cu = man.san.cu;
    let quet = null;
    let gion = null;
    let trungCo = [];

    const cumDangChon = () => {
      const st = ctx.st;
      const chon = st.chon || [];
      if (!chon.length) return null;
      const ids = cumCua(st, chon[0]);
      return ids.length === chon.length && ids.every((i) => chon.includes(i)) ? ids : null;
    };

    const ve = () => {
      const st = ctx.st;
      const chon = st.chon || [];
      let s = `<rect width="${W}" height="${H}" fill="${MAU.tuong}"/>`;
      if (man.san.nen === 'poster') s += `<rect x="20" y="10" width="320" height="280" rx="8" fill="url(#gr-poster)"/>`;
      if (man.san.nen === 'bang') s += `<rect x="8" y="44" width="344" height="212" rx="10" fill="${MAU.trang}" stroke="${MAU.san}" stroke-width="2"/><text x="180" y="30" text-anchor="middle" font-size="13" font-weight="700" fill="${MAU.muc}" font-family="var(--font)">Bảng tin: 5 hoạt động của Ngày hội</text>`;
      const z = man.san.vung;
      if (z) s += `<rect x="${z.x}" y="${z.y}" width="${z.w}" height="${z.h}" rx="6" fill="${MAU.trang}" fill-opacity=".08" stroke="${MAU.vang}" stroke-width="2" stroke-dasharray="7 6"/>${z.ten ? `<text x="${z.x + z.w / 2}" y="${z.y + z.h + 14}" text-anchor="middle" font-size="12" font-weight="700" fill="${MAU.vang}" font-family="var(--font)">${z.ten}</text>` : ''}`;
      for (const m of st.manh) {
        const t = TRANH[m.id];
        const b = hop(m);
        const rong = m.id === 'tieu-de' ? 200 : 100, cao = m.id === 'tieu-de' ? 50 : 100;
        s += `<g data-h="m:${m.id}">${datVao(t.ve(), m.x + (rong * m.s) / 2, m.y + (cao * m.s) / 2, rong * m.s, cao * m.s, 0, rong, cao)}<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" fill="transparent"/></g>`;
      }
      if (chon.length && ctx.cu === 'can') {
        // Căn chỉnh: hình chọn đầu tiên là mẫu, các hình kia làm theo nó.
        chon.forEach((id, i) => {
          const b = hop(st.manh.find((m) => m.id === id));
          s += `<rect x="${b.x - 2}" y="${b.y - 2}" width="${b.w + 4}" height="${b.h + 4}" fill="none" stroke="${MAU.cyan}" stroke-width="${i ? 2 : 3}" stroke-dasharray="${i ? '5 4' : '0'}"/>`;
          if (!i) s += `<text x="${b.x + b.w / 2}" y="${b.y - 6}" text-anchor="middle" font-size="11.5" font-weight="800" fill="${MAU.chan}" font-family="var(--font)">mẫu</text>`;
        });
      } else if (chon.length) {
        const h = hopCum(st, chon);
        s += `<rect x="${h.x - 2}" y="${h.y - 2}" width="${h.w + 4}" height="${h.h + 4}" fill="none" stroke="${MAU.cyan}" stroke-width="2" stroke-dasharray="5 4"/>`;
        // Tay nắm chỉ hiện với công cụ Đổi cỡ, và chỉ khi đang chọn đúng một cụm.
        if (ctx.cu === 'co' && cumDangChon()) {
          for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
            const x = a > 0 ? h.x + h.w : h.x, y = b > 0 ? h.y + h.h : h.y;
            s += `<g data-h="co:${a}:${b}"><circle cx="${x}" cy="${y}" r="22" fill="transparent"/><circle cx="${x}" cy="${y}" r="8" fill="${MAU.trang}" stroke="${MAU.chan}" stroke-width="2.5"/></g>`;
          }
        }
      }
      for (const id of trungCo) {
        const b = hop(st.manh.find((m) => m.id === id));
        s += `<rect x="${b.x - 2}" y="${b.y - 2}" width="${b.w + 4}" height="${b.h + 4}" rx="3" fill="none" stroke="${MAU.hong}" stroke-width="2.5"/>`;
      }
      if (gion) s += `<path d="${gion}" fill="none" stroke="${MAU.hong}" stroke-width="1.8" stroke-dasharray="5 4"/>`;
      if (quet) s += `<rect x="${Math.min(quet.x0, quet.x1)}" y="${Math.min(quet.y0, quet.y1)}" width="${Math.abs(quet.x1 - quet.x0)}" height="${Math.abs(quet.y1 - quet.y0)}" fill="${MAU.cyan}" fill-opacity=".14" stroke="${MAU.chan}" stroke-width="1.5" stroke-dasharray="4 3"/>`;
      svg.innerHTML = s;
    };

    const veKhay = () => {
      const st = ctx.st;
      const chon = st.chon || [];
      khay.innerHTML = '';
      const thanhLenh = (ds) => hangCu(khay, ds, { deu: true });
      if (ctx.cu === 'lop') {
        const nhan = document.createElement('div');
        nhan.className = 'nhan-phu';
        nhan.textContent = 'Kéo thẻ để đổi lớp. Thẻ bên phải đè lên thẻ bên trái.';
        khay.appendChild(nhan);
        hangKeo(khay, st.manh.map((m) => ({
          id: `m-${m.id}`, nhan: TRANH[m.id].ten, bat: chon.includes(m.id),
          tranh: `<svg class="cu-thu" viewBox="0 0 ${m.id === 'tieu-de' ? '200 50' : '100 100'}" aria-hidden="true"><rect width="200" height="100" fill="${MAU.xam}" opacity=".35"/>${TRANH[m.id].ve()}</svg>`,
          bam() { st.chon = [m.id]; ve(); veKhay(); ctx.doi(); },
        })), (i, j) => { ctx.ghi(); lam.doiLop(st, i, j); ve(); veKhay(); ctx.doi(); });
      }
      if (ctx.cu === 'chon' && cu.includes('nhom')) {
        const mot = chon[0];
        const coNhom = mot && st.manh.find((m) => m.id === mot)?.nhom;
        thanhLenh([
          { id: 'nhom', nhan: 'Nhóm', ic: 'nhom', tat: chon.length < 2, bam() { ctx.ghi(); lam.nhom(st, chon); ve(); veKhay(); ctx.doi(); } },
          { id: 'ra', nhan: 'Rã nhóm', ic: 'raNhom', tat: !coNhom, bam() { ctx.ghi(); lam.raNhom(st, mot); st.chon = []; ve(); veKhay(); ctx.doi(); } },
        ]);
      }
      if (ctx.cu === 'can') {
        const voi = (fn) => () => { ctx.ghi(); fn(st, chon, chon[0]); ve(); veKhay(); ctx.doi(); };
        thanhLenh([
          { id: 'cungco', nhan: 'Cùng cỡ', ic: 'cungCo', tat: chon.length < 2, bam: voi(lam.cungCo) },
          { id: 'cangiua', nhan: 'Căn hàng', ic: 'canGiua', tat: chon.length < 2, bam: voi(lam.canGiua) },
          { id: 'cachdeu', nhan: 'Cách đều', ic: 'cachDeu', tat: chon.length < 3, bam: voi(lam.cachDeu) },
        ]);
      }
    };

    // Công cụ Chọn: kéo hình thì dời, có đường gióng và hít vào khung, vào hàng, vào khoảng hở đều.
    const batDauDoi = (id) => {
      const st = ctx.st;
      if (!st.chon?.includes(id)) st.chon = cumCua(st, id);
      const ids = [...new Set(st.chon.flatMap((k) => cumCua(st, k)))];
      const goc = ids.map((k) => { const m = st.manh.find((o) => o.id === k); return { m, x: m.x, y: m.y }; });
      const h0 = hopCum(st, ids);
      const z = man.san.vung;
      const mocX = [], mocY = [];
      if (z) {
        mocX.push({ t: z.x, neo: 0 }, { t: z.x + z.w / 2, neo: 0.5 }, { t: z.x + z.w, neo: 1 });
        mocY.push({ t: z.y, neo: 0 }, { t: z.y + z.h / 2, neo: 0.5 }, { t: z.y + z.h, neo: 1 });
      }
      if (man.hang) {
        const khac = st.manh.filter((m) => !ids.includes(m.id)).map(hop);
        for (const b of khac) mocY.push({ t: b.y + b.h / 2, neo: 0.5 });
        mocX.push(...mocCachDeu(khac, h0.w));
      }
      return (dx, dy) => {
        const hx = hitTruc(h0.x + dx, h0.w, mocX);
        const hy = hitTruc(h0.y + dy, h0.h, mocY);
        const ddx = dx + (hx ? hx.doi : 0), ddy = dy + (hy ? hy.doi : 0);
        for (const g of goc) { g.m.x = g.x + ddx; g.m.y = g.y + ddy; }
        gion = '';
        if (hx) gion += hx.moc.ho ? `M${h0.x + ddx} ${h0.y + ddy - 8}v${h0.h + 16}M${h0.x + ddx + h0.w} ${h0.y + ddy - 8}v${h0.h + 16}` : `M${hx.moc.t} 0V${H}`;
        if (hy) gion += `M0 ${hy.moc.t}H${W}`;
        ctx.hit(gion);
      };
    };

    // Công cụ Đổi cỡ: góc đối diện đứng yên, cỡ gần bằng cỡ hình khác hoặc gần vừa khung thì hít.
    const batDauCo = (a, b) => {
      const st = ctx.st;
      const ids = cumDangChon();
      if (!ids) return null;
      const goc = ids.map((k) => { const m = st.manh.find((o) => o.id === k); return { m, x: m.x, y: m.y, s: m.s }; });
      const h0 = hopCum(st, ids);
      const neo = { x: a > 0 ? h0.x : h0.x + h0.w, y: b > 0 ? h0.y : h0.y + h0.h };
      const z = man.san.vung;
      const khac = st.manh.filter((m) => !ids.includes(m.id));
      const mocRong = man.hang ? khac.map((m) => hop(m).w) : [];
      if (z && !man.hang) mocRong.push(z.w, a > 0 ? z.x + z.w - neo.x : neo.x - z.x);
      ctx.ghi();
      return {
        di(p) {
          const rong = (a > 0 ? p.x - neo.x : neo.x - p.x);
          const cao = (b > 0 ? p.y - neo.y : neo.y - p.y);
          let k = kep(Math.max(rong / h0.w, cao / h0.h), 0.2, 3);
          if (h0.w * k < 24) k = 24 / h0.w;
          const rongHit = hitMoc(h0.w * k, mocRong, 8);
          gion = null;
          trungCo = [];
          if (rongHit !== null) {
            k = rongHit / h0.w;
            if (man.hang) trungCo = khac.filter((m) => Math.abs(hop(m).w - rongHit) < 0.01).map((m) => m.id);
            else if (z) gion = `M${z.x} ${z.y}h${z.w}v${z.h}h${-z.w}z`;
          }
          for (const g of goc) {
            g.m.s = g.s * k;
            g.m.x = neo.x + (g.x - neo.x) * k;
            g.m.y = neo.y + (g.y - neo.y) * k;
          }
          ctx.hit(rongHit === null ? '' : String(rongHit));
          ve();
        },
        nha() { gion = null; trungCo = []; ctx.hit(); ve(); veKhay(); ctx.doi(); },
      };
    };

    batKeo(svg, W, H, (h, pt) => {
      const st = ctx.st;
      if (h?.startsWith('co:')) {
        const [, a, b] = h.split(':');
        return batDauCo(+a, +b);
      }
      if (!h || !h.startsWith('m:')) {
        // Kéo trên nền là quét chọn, chạm nền là bỏ chọn.
        quet = { x0: pt.x, y0: pt.y, x1: pt.x, y1: pt.y };
        return {
          di(p) { quet.x1 = p.x; quet.y1 = p.y; ve(); },
          nha() {
            const x0 = Math.min(quet.x0, quet.x1), x1 = Math.max(quet.x0, quet.x1);
            const y0 = Math.min(quet.y0, quet.y1), y1 = Math.max(quet.y0, quet.y1);
            const nho = x1 - x0 < 6 && y1 - y0 < 6;
            quet = null;
            st.chon = nho ? [] : [...new Set(st.manh.filter((m) => {
              const b = hop(m);
              return b.x >= x0 && b.y >= y0 && b.x + b.w <= x1 && b.y + b.h <= y1;
            }).flatMap((m) => cumCua(st, m.id)))];
            ve(); veKhay(); ctx.doi();
          },
        };
      }
      const id = h.slice(2);
      if (ctx.cu === 'co') {
        const cum = cumCua(st, id);
        if (cumDangChon()?.includes(id)) ctx.nhac('Đang cầm <b>Đổi cỡ</b>: kéo chấm tròn ở góc. Muốn dời hình thì chọn <b>Chọn, dời</b>.');
        else { st.chon = cum; ve(); veKhay(); ctx.doi(); }
        return null;
      }
      let doi = null;
      let daDoi = false;
      return {
        di(p) {
          if (ctx.cu !== 'chon' || man.san.khoaKeo) return;
          const dx = p.x - pt.x, dy = p.y - pt.y;
          if (!daDoi && Math.hypot(dx, dy) < 4) return;
          if (!daDoi) { ctx.ghi(); doi = batDauDoi(id); daDoi = true; }
          doi(dx, dy);
          ve();
        },
        nha() {
          if (daDoi) { gion = null; ctx.hit(); ve(); veKhay(); ctx.doi(); return; }
          // Chạm: thêm hoặc bớt khỏi vùng chọn. Ở Căn chỉnh, chạm hình đã chọn là đặt nó làm mẫu.
          const cum = cumCua(st, id);
          const chon = st.chon || [];
          if (ctx.cu === 'lop') st.chon = [id];
          else if (!chon.includes(id)) st.chon = [...chon, ...cum];
          else if (ctx.cu === 'can') st.chon = [id, ...chon.filter((k) => k !== id)];
          else st.chon = chon.filter((k) => !cum.includes(k));
          ve(); veKhay(); ctx.doi();
        },
      };
    });

    dungBoCu(ctx, [
      { id: 'chon', nhan: 'Chọn, dời', ic: 'diChuyen' },
      (cu.includes('coCum') || cu.includes('can')) && { id: 'co', nhan: 'Đổi cỡ', ic: 'doiCo' },
      cu.includes('lop') && { id: 'lop', nhan: 'Lớp', ic: 'lop' },
      cu.includes('can') && { id: 'can', nhan: 'Căn chỉnh', ic: 'canGiua' },
    ], 'chon', () => { ve(); veKhay(); });
    ve();
    veKhay();
  },
};
