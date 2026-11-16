// Cơ khí dòng thời gian: cắt đầu cuối từng đoạn, đổi thứ tự, chuyển cảnh ăn mất thời lượng, nhạc nền (U11-14, U11-15).
import { giong, kep } from '../toan/hinh-hoc.mjs';
import { MAU, datVao, logoLong, BIEU_TUONG, robot } from '../hinh.mjs';
import { taoSvg, batKeo, dongHo } from './chung.mjs';

export const W = 360, H = 262;
const X0 = 8;
const CHONG_MO = 1; // mỗi chỗ chuyển mờ đè nhau 1 giây

export const daiClip = (c) => c.ra - c.vao;

// Số giây mờ dần ở cuối nhạc. Bản lưu cũ ghi mo là true, tính như 2 giây.
export const giayMo = (n) => (n.mo === true ? 2 : +n.mo || 0);
// Âm lượng thật tại giây t của rãnh nhạc, từ 0 đến 1: đi ngang rồi dốc xuống 0 ở cuối, đúng hình đường âm lượng vẽ ra.
export function heSoAm(n, t) {
  const mo = giayMo(n);
  const con = n.ra - t;
  return (n.am / 100) * (mo > 0 && con < mo ? Math.max(0, con / mo) : 1);
}
const MO_TOI_DA = 8;
const CAO_NHAC = 62;

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
      ra.moGiay = giayMo(st.nhac);
      ra.moDan = ra.moGiay >= 1;
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
    const YV = 154, YJ = 220, YA = coChuyen ? 256 : 214;
    const cao = coChuyen ? YA + CAO_NHAC + 10 : H;
    const svg = taoSvg(san, W, cao, man.sanNhan || 'Dòng thời gian phim');
    // Màn đã gần 30 giây thì phóng to thước để ngón tay chạm được từng đoạn.
    const giayHien = man.giayHien || 60;
    const DV_GIAY = (W - X0 - 8) / giayHien;
    let phatTai = null;
    let dangChay = false;
    let hen = 0;
    let demTick = 0;
    let dangHit = false;
    let dh = null;
    const yDinh = YA + 6, yDay = YA + CAO_NHAC - 5;
    const yAm = (a) => yDay - (a / 100) * (yDay - yDinh);
    // Mức lời nói: đường âm lượng phải nằm dưới mức này. Lấy từ vạch đo của màn để hình vẽ không lệch luật chấm.
    const mucLoi = man.dongHo?.find((m) => m.id === 'am')?.muc[0].den ?? 50;
    // Nhạc dài hơn thước thì mép phải của rãnh nằm ở mép sân, không phải ở giây cuối.
    const cuoiNhac = (n) => Math.min(X0 + n.ra * DV_GIAY, W - 6);
    const capDo = () => {
      const n = ctx.st.nhac;
      return dh ? dh.khoaHit({ am: n.am, moGiay: giayMo(n) }) : '';
    };

    const veCanhClip = (c, giay, op = 1) => {
      const boc = (noi) => (op < 0.99 ? `<g opacity="${op.toFixed(2)}">${noi}</g>` : noi);
      if (c.id === 'mo') {
        return boc(`<rect x="70" y="10" width="220" height="112" fill="url(#gr-troi)"/>
          <circle cx="256" cy="32" r="12" fill="${MAU.vang}"/><rect x="70" y="84" width="220" height="38" fill="${MAU.san}"/>
          <path d="M116 56l64-22 64 22z" fill="${MAU.chan}"/><rect x="126" y="55" width="108" height="30" fill="${MAU.tuong}" stroke="${MAU.muc}" stroke-width="1.2"/>
          <rect x="104" y="58" width="5" height="36" fill="${MAU.muc}"/><rect x="251" y="58" width="5" height="36" fill="${MAU.muc}"/>
          <rect x="109" y="60" width="142" height="16" rx="2" fill="url(#gr-poster)"/><text x="180" y="71.5" text-anchor="middle" font-size="9.5" font-weight="800" fill="${MAU.trang}" font-family="var(--font)">NGÀY HỘI TIN HỌC</text>`);
      }
      if (c.id === 'pv') {
        const noi = c.noi && giay !== null && giay >= c.noi[0] && giay <= c.noi[1];
        const songLoi = [0, 1, 2, 3, 4].map((k) => {
          const caoCot = noi ? 6 + Math.round(12 * Math.abs(Math.sin((giay || 0) * 5 + k * 1.3))) : 3;
          return `<rect x="${198 + k * 9}" y="${54 - caoCot / 2}" width="5" height="${caoCot}" rx="2" fill="${noi ? MAU.vang : MAU.xam}"/>`;
        }).join('');
        return boc(`<rect x="70" y="10" width="220" height="112" fill="${MAU.ao}"/>
          <rect x="84" y="18" width="192" height="72" rx="6" fill="${MAU.man}" fill-opacity=".28"/>
          <circle cx="144" cy="44" r="13" fill="${MAU.tuong}"/><path d="M122 90v-14a22 20 0 0144 0v14z" fill="${MAU.hong}"/>
          <rect x="174" y="54" width="6" height="14" rx="3" fill="${MAU.xamNhat}"/><path d="M177 68v22" stroke="${MAU.xamNhat}" stroke-width="2.5"/>
          ${songLoi}`);
      }
      if (c.id === 'hd') {
        return boc(`<rect x="70" y="10" width="220" height="112" fill="${MAU.teal}"/>
          ${datVao(BIEU_TUONG[0].ve(), 120, 52, 52, 52)}
          <rect x="164" y="28" width="46" height="32" rx="4" fill="${MAU.man}" stroke="${MAU.trang}" stroke-width="1.5"/>
          <path d="M172 38h22M172 45h30M172 52h16" stroke="${MAU.cyan}" stroke-width="2.4" stroke-linecap="round"/>
          <rect x="220" y="34" width="46" height="32" rx="4" fill="${MAU.man}" stroke="${MAU.trang}" stroke-width="1.5"/>
          <path d="M228 44h26M228 51h18M228 58h28" stroke="${MAU.vang}" stroke-width="2.4" stroke-linecap="round"/>`);
      }
      if (c.id === 'rb') {
        const gocTay = giay === null ? 32 : Math.round(28 + 24 * Math.sin(giay * 4));
        return boc(`<rect x="70" y="10" width="220" height="112" fill="${MAU.tuong}"/><rect x="70" y="84" width="220" height="38" fill="${MAU.san}"/>
          ${datVao(robot(gocTay), 180, 56, 62, 78, 0, 120, 150)}`);
      }
      return boc(`<rect x="70" y="10" width="220" height="112" fill="url(#gr-poster)"/>
        ${datVao(logoLong(), 180, 48, 52, 52)}
        <text x="180" y="86" text-anchor="middle" font-size="11" font-weight="800" fill="${MAU.vang}" font-family="var(--font)">CLB TIN HỌC</text>`);
    };

    const khungTai = (st, t) => {
      let dau = 0;
      const ds = [];
      for (let i = 0; i < st.clip.length; i++) {
        const c = st.clip[i], d = daiClip(c);
        if (t >= dau && t <= dau + d + 0.001) ds.push({ c, giay: c.vao + (t - dau), dau });
        dau += d - (st.chuyen?.[i] === 'mo' ? CHONG_MO : 0);
      }
      if (!ds.length) return [];
      if (ds.length >= 2) {
        const op = kep((t - ds[1].dau) / CHONG_MO, 0, 1);
        return [{ ...ds[0], op: 1 }, { ...ds[1], op }];
      }
      return [{ ...ds[0], op: 1 }];
    };

    // Như phần mềm dựng phim: âm lượng là đường ngang nằm ngay trên rãnh nhạc, mờ dần là đoạn dốc cuối đường đó.
    const veNhac = (n) => {
      const cuoi = cuoiNhac(n);
      const mo = giayMo(n);
      const xMo = Math.max(X0, cuoi - mo * DV_GIAY);
      const yV = yAm(n.am), yGiua = (yDinh + yDay) / 2, yLoi = yAm(mucLoi);
      const lan = n.am > mucLoi;
      let song = '';
      for (let x = X0 + 3, i = 0; x < cuoi - 1; x += 4, i++) {
        const t = n.ra - (cuoi - x) / DV_GIAY;
        const nua = (0.35 + 0.65 * Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.31))) * heSoAm(n, t) * ((yDay - yDinh) / 2);
        song += `M${x} ${yGiua - nua}V${yGiua + nua}`;
      }
      let s = `<g data-h="am"><rect x="${X0}" y="${YA}" width="${cuoi - X0}" height="${CAO_NHAC}" rx="5" fill="${MAU.xanh}" fill-opacity=".22" stroke="${MAU.xanh}"/></g>`;
      const pe = 'pointer-events="none"';
      s += `<rect x="${X0}" y="${YA}" width="${cuoi - X0}" height="${yLoi - YA}" fill="${MAU.do}" fill-opacity="${lan ? 0.32 : 0.14}" ${pe}/>`;
      s += `<path d="${song}" stroke="${MAU.xanh}" stroke-width="2.4" stroke-linecap="round" fill="none" ${pe}/>`;
      s += `<path d="M${X0} ${yLoi}H${cuoi}" stroke="${MAU.vang}" stroke-width="1.5" stroke-dasharray="5 4" ${pe}/>`;
      s += `<text x="${cuoi - 22}" y="${yLoi - 4}" text-anchor="end" font-size="10" font-weight="800" fill="${MAU.vang}" stroke="${MAU.muc}" stroke-width="3" paint-order="stroke" font-family="var(--font)" ${pe}>mức lời nói</text>`;
      s += `<text x="${X0 + 6}" y="${YA + 14}" font-size="10" font-weight="700" fill="${MAU.trang}" font-family="var(--font)" ${pe}>Nhạc nền ${n.ra.toFixed(1)}s</text>`;
      // Đường âm lượng và viên nắm: kéo lên xuống ở bất kỳ đâu trên rãnh cũng được.
      s += `<path d="M${X0} ${yV}H${xMo}L${cuoi} ${yDay}" fill="none" stroke="${MAU.trang}" stroke-width="2.5" stroke-linejoin="round" ${pe}/>`;
      // Viên nắm đứng sau nhãn Nhạc nền để đường có lên sát đỉnh rãnh cũng không che chữ.
      const xNam = X0 + Math.min(118, Math.max(24, (xMo - X0) * 0.5));
      s += `<rect x="${xNam - 19}" y="${yV - 9}" width="38" height="18" rx="9" fill="${MAU.trang}" ${pe}/><text x="${xNam}" y="${yV + 4}" text-anchor="middle" font-size="11" font-weight="800" fill="${MAU.muc}" font-family="var(--mono)" ${pe}>${n.am}%</text>`;
      // Thanh vàng cắt nhạc ở nửa dưới mép phải, chấm mờ dần ở góc trên: hai vùng chạm không đè nhau.
      s += `<g data-h="t:nhac"><rect x="${cuoi - 15}" y="${YA + 12}" width="30" height="${CAO_NHAC - 6}" fill="transparent"/><rect x="${cuoi - 4}" y="${YA + 14}" width="8" height="${CAO_NHAC - 12}" rx="3" fill="${MAU.vang}" stroke="${MAU.muc}" stroke-width="1.5"/></g>`;
      s += `<path d="M${xMo} ${YA}V${Math.max(YA, yV)}" stroke="${MAU.trang}" stroke-width="1.2" stroke-dasharray="2 3" ${pe}/>`;
      s += `<g data-h="mo-dan"><rect x="${xMo - 18}" y="${YA - 15}" width="36" height="27" fill="transparent"/><circle cx="${xMo}" cy="${YA}" r="7" fill="${MAU.trang}" stroke="${MAU.muc}" stroke-width="2"/></g>`;
      return s;
    };

    const ve = () => {
      const st = ctx.st;
      let s = `<rect width="${W}" height="${cao}" fill="${MAU.muc}"/>`;
      const dayThuoc = st.nhac ? YA + CAO_NHAC : YV + 54;
      const tongHinh = tongDai(st);
      // Màn xem trước: có cảnh thật và hòa mờ trực tiếp tại chỗ chuyển cảnh.
      let hienTai = st.clip.find((c) => c.id === st.chon) || st.clip[0];
      let giayTrong = null;
      let hetHinh = false;
      let lopCanh = '';
      if (phatTai !== null) {
        if (phatTai > tongHinh + 0.05) {
          hetHinh = true;
          lopCanh = `<rect x="70" y="10" width="220" height="112" fill="${MAU.man}"/>
            <text x="180" y="58" text-anchor="middle" font-size="13.5" font-weight="800" fill="${MAU.vang}" font-family="var(--font)">Hết hình (màn hình đen)</text>
            <text x="180" y="78" text-anchor="middle" font-size="11.5" fill="${MAU.xamNhat}" font-family="var(--font)">Nhạc nền vẫn đang kêu tiếp...</text>`;
        } else {
          const dsKhung = khungTai(st, phatTai);
          if (dsKhung.length) {
            const chinh = dsKhung[dsKhung.length - 1];
            hienTai = chinh.c;
            giayTrong = chinh.giay;
            lopCanh = dsKhung.map((k) => veCanhClip(k.c, k.giay, k.op)).join('');
          }
        }
      }
      if (!lopCanh) lopCanh = veCanhClip(hienTai, null, 1);
      s += `<clipPath id="cl-xem-phim"><rect x="70" y="10" width="220" height="112" rx="8"/></clipPath>`;
      s += `<g clip-path="url(#cl-xem-phim)">${lopCanh}`;
      if (!hetHinh) {
        const noiDang = hienTai.noi && giayTrong !== null && giayTrong >= hienTai.noi[0] && giayTrong <= hienTai.noi[1];
        const dongPhu = hienTai.noi
          ? (phatTai === null ? `Lời nói giây ${hienTai.noi[0]}..${hienTai.noi[1]} · giữ ${daiClip(hienTai).toFixed(1)}s/${hienTai.goc}s` : (noiDang ? hienTai.cau : `giữ ${daiClip(hienTai).toFixed(1)}s trên ${hienTai.goc}s gốc`))
          : `giữ ${daiClip(hienTai).toFixed(1)}s trên ${hienTai.goc}s gốc`;
        s += `<rect x="70" y="88" width="220" height="34" fill="${MAU.man}" fill-opacity=".72"/>`;
        s += `<text x="180" y="102" text-anchor="middle" font-size="11.5" font-weight="800" fill="${MAU.trang}" font-family="var(--font)">${hienTai.ten}</text>`;
        s += `<text x="180" y="116" text-anchor="middle" font-size="10.5" fill="${noiDang ? MAU.vang : MAU.xamNhat}" font-family="var(--font)">${dongPhu}</text>`;
      }
      s += `</g><rect x="70" y="10" width="220" height="112" rx="8" fill="none" stroke="${MAU.xam}" stroke-opacity=".35"/>`;
      // Thước, mốc 30 giây (chạm hoặc kéo trên thước để tua kim xem thử)
      const xs = (g) => X0 + g * DV_GIAY;
      s += `<g data-h="thuoc"><rect x="${X0}" y="122" width="${W - X0 - 8}" height="26" fill="transparent"/>`;
      s += `<path d="M${X0} 138H${W - 8}" stroke="${MAU.xam}" stroke-width="1"/>`;
      for (let g = 0; g <= giayHien; g += 10) s += `<path d="M${xs(g)} 134v8" stroke="${MAU.xam}"/><text x="${xs(g)}" y="130" text-anchor="middle" font-size="9.5" fill="${MAU.xam}" font-family="var(--mono)">${g}</text>`;
      s += '</g>';
      s += `<path d="M${xs(man.dich)} 126V${dayThuoc}" stroke="${dangHit ? MAU.hong : MAU.vang}" stroke-width="${dangHit ? 3 : 2}" stroke-dasharray="5 4"/>`;
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
          // Vùng chạm ưu tiên lấn vào trong đoạn đang chọn để không che đoạn kề bên, nhưng luôn chừa phần
          // giữa đoạn để còn kéo đổi chỗ. Đoạn càng ngắn thì vùng càng đẩy ra ngoài.
          const vao = Math.min(24, d * DV_GIAY * 0.3), ngoai = 30 - vao;
          for (const [dau, gx, xCham] of [['vao', g2, xs(g2) - ngoai], ['ra', g2 + d, xs(g2 + d) - vao]]) {
            s += `<g data-h="t:${dau}"><rect x="${xCham}" y="${YV - 10}" width="30" height="66" fill="transparent"/><rect x="${xs(gx) - 4}" y="${YV - 6}" width="8" height="58" rx="3" fill="${MAU.vang}" stroke="${MAU.muc}" stroke-width="1.5"/></g>`;
          }
        }
        g2 += d - (st.chuyen?.[i] === 'mo' ? CHONG_MO : 0);
      });
      if (st.nhac) s += veNhac(st.nhac);
      s += cham;
      const t = tongDai(st);
      s += `<text x="16" y="30" font-size="13" font-weight="800" fill="${Math.abs(t - man.dich) <= 0.5 ? MAU.xanh : MAU.vang}" font-family="var(--mono)">${t.toFixed(1)}s</text><text x="16" y="46" font-size="10.5" fill="${MAU.xam}" font-family="var(--font)">đích ${man.dich}s</text>`;
      if (phatTai !== null) {
        const kx = xs(Math.min(giayHien, phatTai));
        s += `<path d="M${kx} 124V${dayThuoc}" stroke="${MAU.trang}" stroke-width="2" pointer-events="none"/><circle cx="${kx}" cy="126" r="4.5" fill="${MAU.trang}" stroke="${MAU.muc}" stroke-width="1.5" pointer-events="none"/>`;
      }
      s += `<g data-h="phat"><circle cx="326" cy="34" r="24" fill="transparent"/><circle cx="326" cy="34" r="17" fill="${MAU.trang}"/>${!dangChay ? `<path d="M321 26l13 8-13 8z" fill="${MAU.muc}"/>` : `<path d="M320 27h4v14h-4zM328 27h4v14h-4z" fill="${MAU.muc}"/>`}</g>`;
      svg.innerHTML = s;
    };

    const veKhay = () => {
      const st = ctx.st;
      khay.innerHTML = '';
      if (!st.nhac) return;
      dh = dongHo(khay, man.dongHo || []);
      capDo();
    };

    const giayCuoiXem = () => {
      const st = ctx.st;
      const th = tongDai(st);
      return st.nhac ? Math.max(th, Math.min(giayHien, Math.min(st.nhac.ra, th + 5))) : th;
    };

    const phatAmTai = (giay) => {
      const st = ctx.st;
      const ds = khungTai(st, giay);
      const coLoi = ds.some((k) => k.c.noi && k.giay >= k.c.noi[0] && k.giay <= k.c.noi[1]);
      const amNhac = st.nhac && giay <= st.nhac.ra ? heSoAm(st.nhac, giay) : 0;
      if (st.nhac || coLoi) ctx.nhipPhim?.({ amNhac, coLoi, buoc: Math.floor(demTick / 3) });
    };

    const dungPhat = (giuKim = false) => {
      clearInterval(hen);
      dangChay = false;
      if (!giuKim) phatTai = null;
      ve();
    };
    const batDauPhat = () => {
      clearInterval(hen);
      dangChay = true;
      demTick = 0;
      if (phatTai === null || phatTai >= giayCuoiXem() - 0.2) phatTai = 0;
      phatAmTai(phatTai);
      ve();
      hen = setInterval(() => {
        demTick++;
        phatTai += 0.4;
        if (demTick % 3 === 0) phatAmTai(phatTai);
        if (phatTai >= giayCuoiXem()) dungPhat(false);
        else ve();
      }, 60);
    };

    batKeo(svg, W, cao, (h, pt) => {
      const st = ctx.st;
      // Chạm chỗ trống là bỏ chọn: thanh vàng biến mất, đoạn ngắn lại kéo được trọn thân.
      if (!h) {
        if (st.chon || phatTai !== null) { st.chon = null; dungPhat(false); ctx.doi(); }
        return null;
      }
      if (h === 'phat') { if (!dangChay) batDauPhat(); else dungPhat(false); return null; }
      if (h === 'thuoc') {
        dungPhat(true);
        const datKim = (x) => {
          phatTai = kep(Math.round(((x - X0) / DV_GIAY) * 10) / 10, 0, giayCuoiXem());
          ve();
        };
        datKim(pt.x);
        return { di(p) { datKim(p.x); } };
      }
      // Như các app dựng phim: chạm đoạn là chọn và hiện thanh vàng để cắt, kéo thân đoạn là đổi chỗ.
      if (h.startsWith('c:')) {
        const id = h.slice(2);
        st.chon = id;
        ve();
        let daGhi = false;
        return {
          // Kéo qua giữa đoạn kề bên thì hai đoạn đổi chỗ ngay.
          di(p) {
            const t = (p.x - X0) / DV_GIAY;
            // Vuốt nhanh có thể vượt nhiều đoạn trong một nhịp, nên đổi liên tiếp tới khi đúng chỗ ngón tay.
            for (let doi = true; doi;) {
              const i = st.clip.findIndex((c) => c.id === id);
              let dau = 0;
              for (let k = 0; k < i; k++) dau += daiClip(st.clip[k]);
              const truoc = st.clip[i - 1], sau = st.clip[i + 1];
              let j = i;
              if (sau && t > dau + daiClip(st.clip[i]) + daiClip(sau) / 2) j = i + 1;
              else if (truoc && t < dau - daiClip(truoc) / 2) j = i - 1;
              doi = j !== i;
              if (doi) {
                if (!daGhi) { ctx.ghi(); daGhi = true; }
                lam.doi(st, i, j);
                ve();
              }
            }
          },
          nha() { ve(); ctx.doi(); },
        };
      }
      if (h.startsWith('j:')) {
        const i = +h.slice(2);
        ctx.ghi();
        st.chuyen[i] = st.chuyen[i] === 'mo' ? 'cat' : 'mo';
        ve(); ctx.doi();
        return null;
      }
      // Kéo đường âm lượng: tính theo khoảng dịch của ngón tay, chạm mà chưa kéo thì âm lượng không nhảy.
      if (h === 'am') {
        const n = st.nhac;
        const am0 = n.am;
        let daGhi = false;
        return {
          di(p) {
            if (!daGhi && Math.abs(p.y - pt.y) < 3) return;
            if (!daGhi) { ctx.ghi(); daGhi = true; }
            n.am = kep(Math.round((am0 + ((pt.y - p.y) / (yDay - yDinh)) * 100) / 5) * 5, 0, 100);
            ve();
            const khoa = capDo();
            ctx.hit(khoa || (n.am <= mucLoi ? 'am' : ''));
          },
          nha() { ctx.hit(); ve(); capDo(); ctx.doi(); },
        };
      }
      // Kéo chấm mờ dần vào trong rãnh: đoạn dốc dài ra, nhạc tắt từ từ thay vì tắt phụt.
      if (h === 'mo-dan') {
        const n = st.nhac;
        const lech = cuoiNhac(n) - giayMo(n) * DV_GIAY - pt.x;
        let daGhi = false;
        return {
          di(p) {
            if (!daGhi && Math.abs(p.x - pt.x) < 3) return;
            if (!daGhi) { ctx.ghi(); daGhi = true; }
            const giay = Math.round(((cuoiNhac(n) - (p.x + lech)) / DV_GIAY) * 2) / 2;
            n.mo = kep(giay, 0, Math.min(MO_TOI_DA, n.ra));
            ve();
            const khoa = capDo();
            ctx.hit(khoa || (n.mo >= 1 ? 'mo' : ''));
          },
          nha() { ctx.hit(); ve(); capDo(); ctx.doi(); },
        };
      }
      if (h === 't:nhac') {
        const n = st.nhac;
        ctx.ghi();
        return {
          di(p) {
            const ra = kep(Math.round(((p.x - X0) / DV_GIAY) * 2) / 2, 1, n.goc);
            // Gần hết phim thì nhạc hít đúng vào điểm hết phim.
            const tong = tongDai(st);
            dangHit = Math.abs(ra - tong) <= 1.5;
            n.ra = dangHit ? tong : ra;
            ctx.hit(dangHit ? 'nhac' : '');
            ve();
          },
          nha() { dangHit = false; ctx.hit(); ve(); ctx.doi(); },
        };
      }
      if (h.startsWith('t:')) {
        const dau = h.slice(2);
        const c = st.clip.find((o) => o.id === st.chon);
        const gt0 = c[dau];
        let daDi = false;
        // Đoạn phim nằm ngay dưới một điểm trên thước, tính cả phần chuyển mờ đè nhau.
        const doanTai = (x) => {
          let g = 0;
          for (let i = 0; i < st.clip.length; i++) {
            const d = daiClip(st.clip[i]);
            if (x >= X0 + g * DV_GIAY && x <= X0 + (g + d) * DV_GIAY) return st.clip[i];
            g += d - (st.chuyen?.[i] === 'mo' ? CHONG_MO : 0);
          }
          return null;
        };
        return {
          di(p) {
            if (!daDi && Math.abs(p.x - pt.x) < 3) return;
            if (!daDi) { ctx.ghi(); daDi = true; }
            let gia = Math.round((gt0 + (p.x - pt.x) / DV_GIAY) * 2) / 2;
            dangHit = false;
            let khoa = '';
            // Lệch một chút so với mép câu nói thì hít vào, để không cắt lẹm lời.
            if (c.noi) {
              const moc = dau === 'vao' ? c.noi[0] : c.noi[1];
              if (Math.abs(gia - moc) <= 1) { gia = moc; khoa = 'noi'; }
            }
            lam.cat(st, c.id, dau, gia);
            // Tổng phim lệch đích dưới 1 giây thì hít đúng đích, trừ khi làm mất lời nói.
            const thieu = man.dich - tongDai(st);
            const giaDich = c[dau] + (dau === 'ra' ? thieu : -thieu);
            const matLoi = c.noi && (dau === 'ra' ? giaDich < c.noi[1] : giaDich > c.noi[0]);
            if (Math.abs(thieu) <= 1 && !matLoi) {
              lam.cat(st, c.id, dau, giaDich);
              if (Math.abs(man.dich - tongDai(st)) < 0.01) { dangHit = true; khoa = 'dich'; }
            }
            ctx.hit(khoa);
            ve();
          },
          nha(p) {
            // Chạm mà không kéo trúng vùng thanh vàng đè lên đoạn bên cạnh thì coi như chạm đoạn đó.
            if (!daDi) { const khac = doanTai(p.x); if (khac) st.chon = khac.id; }
            dangHit = false; ctx.hit(); ve(); veKhay(); ctx.doi();
          },
        };
      }
      return null;
    });

    ve();
    veKhay();
    return () => clearInterval(hen);
  },
};
