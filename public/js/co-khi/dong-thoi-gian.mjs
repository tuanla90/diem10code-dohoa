// Cơ khí dòng thời gian: cắt đầu cuối từng đoạn, đổi thứ tự, chuyển cảnh ăn mất thời lượng, nhạc nền (U11-14, U11-15).
import { giong, kep } from '../toan/hinh-hoc.mjs';
import { MAU } from '../hinh.mjs';
import { taoSvg, batKeo, hangCu, thanhTruot } from './chung.mjs';

export const W = 360, H = 262;
const X0 = 8;
const CHONG_MO = 1; // mỗi chỗ chuyển mờ đè nhau 1 giây

export const daiClip = (c) => c.ra - c.vao;

export function tongDai(st) {
  const tong = st.clip.reduce((t, c) => t + daiClip(c), 0);
  return tong - (st.chuyen || []).filter((c) => c === 'mo').length * CHONG_MO;
}

const lam = {
  cat(st, id, dau, gia) {
    const c = st.clip.find((o) => o.id === id);
    if (dau === 'vao') c.vao = kep(gia, 0, c.ra - 1);
    else c.ra = kep(gia, c.vao + 1, c.goc);
  },
  doi(st, i, j) {
    if (j < 0 || j >= st.clip.length) return;
    [st.clip[i], st.clip[j]] = [st.clip[j], st.clip[i]];
  },
  chuyen(st, i, k) { st.chuyen[i] = k; },
  nhac(st, gt) { Object.assign(st.nhac, gt); },
};

export default {
  tao: (man) => giong(man.dau),
  lam,
  do(st, man) {
    const tong = tongDai(st);
    const ra = { tong, ngan: Math.min(...st.clip.map(daiClip)), dai: Math.max(...st.clip.map(daiClip)) };
    ra.catLoi = st.clip.filter((c) => c.noi && (c.vao > c.noi[0] || c.ra < c.noi[1])).map((c) => c.ten);
    ra.dauDung = st.clip[0].id === man.dauCuoi[0];
    ra.cuoiDung = st.clip[st.clip.length - 1].id === man.dauCuoi[1];
    if (st.nhac) {
      ra.lechNhac = Math.abs(st.nhac.ra - tong);
      ra.am = st.nhac.am;
      ra.moDan = st.nhac.mo;
      ra.thieuMo = 0;
      ra.thuaMo = 0;
      st.clip.slice(1).forEach((c, i) => {
        const doiChuDe = st.clip[i].chuDe !== c.chuDe;
        if (doiChuDe && st.chuyen[i] !== 'mo') ra.thieuMo++;
        if (!doiChuDe && st.chuyen[i] === 'mo') ra.thuaMo++;
      });
    }
    return ra;
  },

  ve(ctx) {
    const { san, khay, man } = ctx;
    san.innerHTML = '';
    // Màn có chuyển cảnh cần thêm một làn chấm nối, cao hơn để tay nắm và chấm không đè nhau.
    const coChuyen = !!ctx.st.chuyen;
    const YV = 154, YJ = 220, YA = coChuyen ? 244 : 214;
    const cao = coChuyen ? H + 30 : H;
    const svg = taoSvg(san, W, cao, man.sanNhan || 'Dòng thời gian phim');
    // Màn đã gần 30 giây thì phóng to thước để ngón tay chạm được từng đoạn.
    const giayHien = man.giayHien || 60;
    const DV_GIAY = (W - X0 - 8) / giayHien;
    let phatTai = null;
    let hen = 0;

    const ve = () => {
      const st = ctx.st;
      let s = `<rect width="${W}" height="${cao}" fill="${MAU.muc}"/>`;
      const dayThuoc = st.nhac ? YA + 34 : YV + 54;
      // Màn xem trước
      let hienTai = st.clip.find((c) => c.id === st.chon) || st.clip[0];
      let giayTrong = null;
      if (phatTai !== null) {
        let t = phatTai;
        for (let i = 0; i < st.clip.length; i++) {
          const d = daiClip(st.clip[i]);
          if (t < d) { hienTai = st.clip[i]; giayTrong = hienTai.vao + t; break; }
          t -= d - (st.chuyen?.[i] === 'mo' ? CHONG_MO : 0);
        }
      }
      s += `<rect x="70" y="10" width="220" height="112" rx="8" fill="${hienTai.mau}"/>`;
      s += `<text x="180" y="62" text-anchor="middle" font-size="16" font-weight="800" fill="${MAU.trang}" font-family="var(--font)">${hienTai.ten}</text>`;
      const noiDang = hienTai.noi && giayTrong !== null && giayTrong >= hienTai.noi[0] && giayTrong <= hienTai.noi[1];
      if (hienTai.noi) s += `<text x="180" y="84" text-anchor="middle" font-size="12" fill="${MAU.trang}" opacity="${phatTai === null || noiDang ? 1 : 0.4}" font-family="var(--font)">${phatTai === null ? `Lời nói giây ${hienTai.noi[0]} đến ${hienTai.noi[1]}` : hienTai.cau}</text>`;
      // Đoạn đã cắt ngắn không còn chỗ ghi nhãn trên thước, nên độ dài hiện ở màn xem trước.
      s += `<text x="180" y="${hienTai.noi ? 104 : 84}" text-anchor="middle" font-size="12" fill="${MAU.trang}" font-family="var(--mono)">giữ ${daiClip(hienTai).toFixed(1)}s trên ${hienTai.goc}s gốc</text>`;
      // Thước, mốc 30 giây
      const xs = (g) => X0 + g * DV_GIAY;
      s += `<path d="M${X0} 138H${W - 8}" stroke="${MAU.xam}" stroke-width="1"/>`;
      for (let g = 0; g <= giayHien; g += 10) s += `<path d="M${xs(g)} 134v8" stroke="${MAU.xam}"/><text x="${xs(g)}" y="130" text-anchor="middle" font-size="9.5" fill="${MAU.xam}" font-family="var(--mono)">${g}</text>`;
      s += `<path d="M${xs(man.dich)} 126V${dayThuoc}" stroke="${MAU.vang}" stroke-width="2" stroke-dasharray="5 4"/>`;
      // Đoạn hình
      let g = 0;
      let cham = '';
      st.clip.forEach((c, i) => {
        const d = daiClip(c);
        const x = xs(g), w = d * DV_GIAY;
        const chon = st.chon === c.id;
        s += `<g data-h="c:${c.id}"><rect x="${x}" y="${YV}" width="${Math.max(w - 1, 4)}" height="46" rx="5" fill="${c.mau}" stroke="${chon ? MAU.vang : MAU.muc}" stroke-width="${chon ? 3 : 1}"/>`;
        if (w > 24) s += `<text x="${x + 5}" y="${YV + 19}" font-size="10.5" font-weight="700" fill="${MAU.trang}" font-family="var(--font)">${c.nho}</text><text x="${x + 5}" y="${YV + 35}" font-size="9.5" fill="${MAU.trang}" font-family="var(--mono)">${d.toFixed(1)}s</text>`;
        s += '</g>';
        if (c.noi) {
          const a = kep(c.noi[0], c.vao, c.ra) - c.vao, b = kep(c.noi[1], c.vao, c.ra) - c.vao;
          s += `<rect x="${x + a * DV_GIAY}" y="${YV + 40}" width="${Math.max(0, (b - a) * DV_GIAY)}" height="4" fill="${MAU.vang}" pointer-events="none"/>`;
        }
        if (st.chuyen && i < st.clip.length - 1) {
          g += d;
          const mo = st.chuyen[i] === 'mo';
          if (mo) g -= CHONG_MO;
          const jx = xs(g);
          // Vẽ sau cùng, ở làn riêng dưới dải phim: đoạn kế tiếp và tay nắm không che được chấm.
          cham += `<path d="M${jx} ${YV + 46}V${YJ}" stroke="${MAU.xam}" stroke-width="1.5"/><g data-h="j:${i}"><circle cx="${jx}" cy="${YJ}" r="20" fill="transparent"/><circle cx="${jx}" cy="${YJ}" r="9" fill="${mo ? MAU.hong : MAU.trang}" stroke="${MAU.xam}" stroke-width="2"/></g>`;
        } else g += d;
      });
      // Tay nắm đầu cuối đoạn đang chọn
      let g2 = 0;
      st.clip.forEach((c, i) => {
        const d = daiClip(c);
        if (c.id === st.chon) {
          // Vùng chạm lệch vào trong đoạn đang chọn để không che mất đoạn ngắn nằm kề bên.
          for (const [dau, gx, lech] of [['vao', g2, -6], ['ra', g2 + d, -24]]) {
            s += `<g data-h="t:${dau}"><rect x="${xs(gx) + lech}" y="${YV - 10}" width="30" height="66" fill="transparent"/><rect x="${xs(gx) - 4}" y="${YV - 6}" width="8" height="58" rx="3" fill="${MAU.vang}" stroke="${MAU.muc}" stroke-width="1.5"/></g>`;
          }
        }
        g2 += d - (st.chuyen?.[i] === 'mo' ? CHONG_MO : 0);
      });
      // Nhạc
      if (st.nhac) {
        const n = st.nhac;
        const chon = st.chon === 'nhac';
        // Nhạc dài hơn thước thì vẽ tới mép và để tay nắm ở mép, kéo vào là cắt ngay.
        const cuoi = Math.min(xs(n.ra), W - 6);
        s += `<g data-h="nhac"><rect x="${X0}" y="${YA}" width="${cuoi - X0}" height="30" rx="5" fill="${MAU.xanh}" fill-opacity="${0.35 + (n.am / 100) * 0.6}" stroke="${chon ? MAU.vang : MAU.muc}" stroke-width="${chon ? 3 : 1}"/><text x="${X0 + 6}" y="${YA + 19}" font-size="10.5" font-weight="700" fill="${MAU.muc}" font-family="var(--font)">Nhạc nền, ${n.ra.toFixed(1)}s, ${n.am}%${n.mo ? ', mờ dần' : ''}</text></g>`;
        if (chon) s += `<g data-h="t:nhac"><rect x="${cuoi - 15}" y="${YA - 8}" width="30" height="46" fill="transparent"/><rect x="${cuoi - 4}" y="${YA - 4}" width="8" height="38" rx="3" fill="${MAU.vang}" stroke="${MAU.muc}" stroke-width="1.5"/></g>`;
      }
      s += cham;
      const t = tongDai(st);
      s += `<text x="16" y="30" font-size="13" font-weight="800" fill="${Math.abs(t - man.dich) <= 0.5 ? MAU.xanh : MAU.vang}" font-family="var(--mono)">${t.toFixed(1)}s</text><text x="16" y="46" font-size="10.5" fill="${MAU.xam}" font-family="var(--font)">đích ${man.dich}s</text>`;
      if (phatTai !== null) s += `<path d="M${xs(phatTai)} 126V${dayThuoc}" stroke="${MAU.trang}" stroke-width="2"/>`;
      svg.innerHTML = s;
    };

    const veKhay = () => {
      const st = ctx.st;
      khay.innerHTML = '';
      const lenh = (fn) => () => { ctx.ghi(); fn(); ve(); veKhay(); ctx.doi(); };
      const c = st.clip.find((o) => o.id === st.chon);
      const i = st.clip.indexOf(c);
      const buoc = 0.5;
      const ds = [{ id: 'phat', nhan: phatTai === null ? 'Xem thử' : 'Dừng', ic: phatTai === null ? 'chay' : 'dung', bam: () => (phatTai === null ? batDauPhat() : dungPhat()) }];
      if (c) {
        ds.push({ id: 'trai', nhan: 'Sang trái', ic: 'trai', tat: i === 0, bam: lenh(() => lam.doi(st, i, i - 1)) });
        ds.push({ id: 'phai', nhan: 'Sang phải', ic: 'phai', tat: i === st.clip.length - 1, bam: lenh(() => lam.doi(st, i, i + 1)) });
        ds.push({ id: 'dau-', nhan: 'Đầu sớm', sub: '-0.5', ic: 'lamLai', bam: lenh(() => lam.cat(st, c.id, 'vao', c.vao - buoc)) });
        ds.push({ id: 'dau+', nhan: 'Đầu muộn', sub: '+0.5', ic: 'cat', bam: lenh(() => lam.cat(st, c.id, 'vao', c.vao + buoc)) });
        ds.push({ id: 'cuoi-', nhan: 'Cuối sớm', sub: '-0.5', ic: 'cat', bam: lenh(() => lam.cat(st, c.id, 'ra', c.ra - buoc)) });
        ds.push({ id: 'cuoi+', nhan: 'Cuối muộn', sub: '+0.5', ic: 'lamLai', bam: lenh(() => lam.cat(st, c.id, 'ra', c.ra + buoc)) });
        if (st.chuyen && i < st.clip.length - 1) {
          const mo = st.chuyen[i] === 'mo';
          ds.splice(1, 0, { id: 'chuyen', nhan: mo ? 'Sau đoạn: mờ' : 'Sau đoạn: cắt', ic: mo ? 'mo' : 'cat', bat: mo, bam: lenh(() => lam.chuyen(st, i, mo ? 'cat' : 'mo')) });
        }
      }
      hangCu(khay, ds);
      if (st.nhac) {
        const n = st.nhac;
        hangCu(khay, [
          { id: 'chon-nhac', nhan: 'Nhạc nền', ic: 'nhac', bat: st.chon === 'nhac', bam() { st.chon = st.chon === 'nhac' ? null : 'nhac'; ve(); veKhay(); ctx.doi(); } },
          { id: 'nhac-', nhan: 'Ngắn đi', sub: '-0.5', ic: 'cat', bam: lenh(() => lam.nhac(st, { ra: Math.max(1, n.ra - buoc) })) },
          { id: 'nhac+', nhan: 'Dài ra', sub: '+0.5', ic: 'lamLai', bam: lenh(() => lam.nhac(st, { ra: Math.min(n.goc, n.ra + buoc) })) },
          { id: 'nhac-mo', nhan: 'Mờ dần cuối', ic: 'mo', bat: n.mo, bam: lenh(() => lam.nhac(st, { mo: !n.mo })) },
        ]);
        let daGhi = false;
        thanhTruot(khay, {
          nhan: 'Âm lượng', min: 0, max: 100, buoc: 5, gia: n.am, dinh: (v) => `${v}%`, id: 'am',
          doi(v) { if (!daGhi) { ctx.ghi(); daGhi = true; } n.am = v; ve(); },
          xong() { daGhi = false; ctx.doi(); },
        });
      }
    };

    const dungPhat = () => {
      clearInterval(hen);
      phatTai = null;
      ve();
      veKhay();
    };
    const batDauPhat = () => {
      phatTai = 0;
      veKhay();
      hen = setInterval(() => {
        phatTai += 0.4;
        if (phatTai >= tongDai(ctx.st)) dungPhat();
        else ve();
      }, 60);
    };

    batKeo(svg, W, cao, (h, pt) => {
      const st = ctx.st;
      if (!h) return null;
      if (h.startsWith('c:')) { st.chon = h.slice(2); ve(); veKhay(); ctx.doi(); return null; }
      if (h === 'nhac') { st.chon = 'nhac'; ve(); veKhay(); ctx.doi(); return null; }
      if (h.startsWith('j:')) {
        const i = +h.slice(2);
        ctx.ghi();
        st.chuyen[i] = st.chuyen[i] === 'mo' ? 'cat' : 'mo';
        ve(); ctx.doi();
        return null;
      }
      if (h === 't:nhac') {
        const n = st.nhac;
        ctx.ghi();
        return {
          di(p) { n.ra = kep(Math.round(((p.x - X0) / DV_GIAY) * 2) / 2, 1, n.goc); ve(); },
          nha() { veKhay(); ctx.doi(); },
        };
      }
      if (h.startsWith('t:')) {
        const dau = h.slice(2);
        const c = st.clip.find((o) => o.id === st.chon);
        const gt0 = c[dau];
        ctx.ghi();
        return {
          di(p) {
            lam.cat(st, c.id, dau, Math.round((gt0 + (p.x - pt.x) / DV_GIAY) * 2) / 2);
            ve();
          },
          nha() { veKhay(); ctx.doi(); },
        };
      }
      return null;
    });

    ve();
    veKhay();
    return () => clearInterval(hen);
  },
};
