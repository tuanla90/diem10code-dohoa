// Cơ khí lớp và nhóm: đổi thứ tự lớp, nhóm mảnh, kéo cả cụm, đổi cỡ cụm, căn hàng và cách đều (C10-10).
import { giong, kep } from '../toan/hinh-hoc.mjs';
import { MAU, MANH_LOGO, BIEU_TUONG, datVao, tieuDe } from '../hinh.mjs';
import { taoSvg, batKeo, hangCu } from './chung.mjs';

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
  len(st, id) {
    const i = st.manh.findIndex((m) => m.id === id);
    if (i < st.manh.length - 1) [st.manh[i], st.manh[i + 1]] = [st.manh[i + 1], st.manh[i]];
  },
  xuong(st, id) {
    const i = st.manh.findIndex((m) => m.id === id);
    if (i > 0) [st.manh[i], st.manh[i - 1]] = [st.manh[i - 1], st.manh[i]];
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
  canGiua(st, ids) {
    const ds = st.manh.filter((m) => ids.includes(m.id));
    const tb = ds.reduce((t, m) => { const b = hop(m); return t + b.y + b.h / 2; }, 0) / ds.length;
    for (const m of ds) { const b = hop(m); m.y += tb - (b.y + b.h / 2); }
  },
  cungCo(st, ids) {
    const ds = st.manh.filter((m) => ids.includes(m.id));
    const tb = ds.reduce((t, m) => t + m.s, 0) / ds.length;
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
      if (chon.length) {
        const h = hopCum(st, chon);
        s += `<rect x="${h.x - 2}" y="${h.y - 2}" width="${h.w + 4}" height="${h.h + 4}" fill="none" stroke="${MAU.cyan}" stroke-width="2" stroke-dasharray="5 4"/>`;
        // Tay nắm đổi cỡ chỉ hiện khi đang chọn đúng một cụm, để không gợi ý đổi cỡ một nửa cụm.
        if (cu.includes('coCum') && cumCua(st, chon[0]).length === chon.length) {
          s += `<g data-h="co"><circle cx="${h.x + h.w}" cy="${h.y + h.h}" r="22" fill="transparent"/><circle cx="${h.x + h.w}" cy="${h.y + h.h}" r="8" fill="${MAU.trang}" stroke="${MAU.chan}" stroke-width="2.5"/></g>`;
        }
      }
      svg.innerHTML = s;
    };

    const veKhay = () => {
      const st = ctx.st;
      const chon = st.chon || [];
      khay.innerHTML = '';
      const manh = [...st.manh].map((m) => ({
        id: `m-${m.id}`, nhan: TRANH[m.id].ten, bat: chon.includes(m.id),
        tranh: `<svg class="cu-thu" viewBox="0 0 ${m.id === 'tieu-de' ? '200 50' : '100 100'}" aria-hidden="true"><rect width="200" height="100" fill="${MAU.xam}" opacity=".35"/>${TRANH[m.id].ve()}</svg>`,
        sub: m.nhom ? `nhóm ${m.nhom}` : '',
        bam() {
          const idx = chon.indexOf(m.id);
          if (idx >= 0) chon.splice(idx, 1);
          else if (cu.includes('nhom') || cu.includes('can')) chon.push(m.id);
          else chon.splice(0, chon.length, m.id);
          st.chon = chon;
          ve(); veKhay(); ctx.doi();
        },
      }));
      if (cu.includes('lop')) {
        const nhan = document.createElement('div');
        nhan.className = 'nhan-phu';
        nhan.textContent = 'Thứ tự lớp, từ dưới lên trên:';
        khay.appendChild(nhan);
      }
      hangCu(khay, manh, { deu: true });
      const mot = chon[0];
      const lenh = [];
      if (cu.includes('lop')) {
        const dinh = (fn) => () => { if (!mot) return; ctx.ghi(); fn(st, mot); ve(); veKhay(); ctx.doi(); };
        lenh.push({ id: 'len', nhan: 'Đưa lên', ic: 'len', tat: !mot, bam: dinh(lam.len) });
        lenh.push({ id: 'xuong', nhan: 'Đưa xuống', ic: 'xuong', tat: !mot, bam: dinh(lam.xuong) });
      }
      if (cu.includes('nhom')) {
        const coNhom = mot && st.manh.find((m) => m.id === mot)?.nhom;
        lenh.push({ id: 'nhom', nhan: 'Nhóm', ic: 'nhom', tat: chon.length < 2, bam() { ctx.ghi(); lam.nhom(st, chon); ve(); veKhay(); ctx.doi(); } });
        lenh.push({ id: 'ra', nhan: 'Rã nhóm', ic: 'raNhom', tat: !coNhom, bam() { ctx.ghi(); lam.raNhom(st, mot); st.chon = []; ve(); veKhay(); ctx.doi(); } });
      }
      if (cu.includes('can')) {
        const ca = st.manh.map((m) => m.id);
        const voi = (fn) => () => { ctx.ghi(); fn(st, chon.length >= 2 ? chon : ca); ve(); veKhay(); ctx.doi(); };
        lenh.push({ id: 'tatca', nhan: 'Chọn hết', ic: 'tatCa', bam() { st.chon = [...ca]; ve(); veKhay(); ctx.doi(); } });
        lenh.push({ id: 'cungco', nhan: 'Cùng cỡ', ic: 'cungCo', bam: voi(lam.cungCo) });
        lenh.push({ id: 'cangiua', nhan: 'Căn hàng', ic: 'canGiua', bam: voi(lam.canGiua) });
        lenh.push({ id: 'cachdeu', nhan: 'Cách đều', ic: 'cachDeu', bam: voi(lam.cachDeu) });
      }
      hangCu(khay, lenh);
    };

    batKeo(svg, W, H, (h, pt) => {
      const st = ctx.st;
      if (h === 'co') {
        const dd = st.chon?.[0];
        if (!dd) return null;
        const h0 = hopCum(st, cumCua(st, dd));
        ctx.ghi();
        return {
          di(p) {
            const hh = hopCum(st, cumCua(st, dd));
            const k = kep((p.x - h0.x) / Math.max(1, hh.w), 0.4, 3);
            if (hh.w * k > 24) lam.coCum(st, dd, k);
            ve();
          },
          nha() { veKhay(); ctx.doi(); },
        };
      }
      if (!h || !h.startsWith('m:')) return null;
      const id = h.slice(2);
      const ds = cumCua(st, id);
      const dangCo = st.chon?.includes(id);
      if (!dangCo) { st.chon = ds; ve(); veKhay(); }
      if (man.san.khoaKeo) { veKhay(); ctx.doi(); return null; }
      let px = pt.x, py = pt.y;
      let daGhi = false;
      return {
        di(p) {
          if (!daGhi) { ctx.ghi(); daGhi = true; }
          lam.di(st, id, p.x - px, p.y - py);
          px = p.x; py = p.y;
          ve();
        },
        nha() { veKhay(); ve(); ctx.doi(); },
      };
    });

    ve();
    veKhay();
  },
};
