// Cơ khí màu tô và nét viền đối tượng vector: đổi màu tô, màu viền, kiểu nét liền/đứt và độ dày viền (C10-09).
import { giong } from '../toan/hinh-hoc.mjs';
import { doChoi, tuongPhanWcag } from '../toan/anh.mjs';
import { MAU, muiTenChiDuong, datVao, logoLong } from '../hinh.mjs';
import { taoSvg, batKeo, hangCu, thanhTruot, dongHo } from './chung.mjs';

export const W = 360, H = 264;

export const MAU_TO = {
  tim: { ten: 'Tô tím', mau: MAU.ao },
  cam: { ten: 'Tô cam', mau: MAU.cam },
  vang: { ten: 'Tô vàng', mau: MAU.vang },
  trang: { ten: 'Tô trắng', mau: MAU.trang },
};

export const MAU_VIEN = {
  trang: { ten: 'Viền trắng', mau: MAU.trang },
  do: { ten: 'Viền đỏ', mau: MAU.do },
  muc: { ten: 'Viền chàm', mau: MAU.muc },
};

const rgbTuMa = (maHex) => [parseInt(maHex.slice(1, 3), 16), parseInt(maHex.slice(3, 5), 16), parseInt(maHex.slice(5, 7), 16)];
const sangCua = (maHex) => doChoi(...rgbTuMa(maHex));

export function doToVien(st) {
  const mauTo = MAU_TO[st.to]?.mau || MAU.vang;
  const mauVien = MAU_VIEN[st.vien]?.mau || MAU.muc;
  const tpChu = tuongPhanWcag(sangCua(mauTo), sangCua(MAU.muc));
  const tpVienBang = tuongPhanWcag(sangCua(mauVien), sangCua(MAU.tuong));
  return {
    day: st.day,
    dut: !!st.dut,
    tuongPhan: tpChu,
    vienRo: tpVienBang >= 3 && st.vien !== st.to,
  };
}

export function veBangMuiTen(st) {
  const mauTo = MAU_TO[st.to]?.mau || MAU.vang;
  const mauVien = MAU_VIEN[st.vien]?.mau || MAU.muc;
  return `<rect x="44" y="34" width="272" height="172" rx="12" fill="${MAU.tuong}" stroke="${MAU.muc}" stroke-width="3"/>
    <circle cx="62" cy="52" r="4" fill="${MAU.xam}"/><circle cx="298" cy="52" r="4" fill="${MAU.xam}"/>
    <circle cx="62" cy="188" r="4" fill="${MAU.xam}"/><circle cx="298" cy="188" r="4" fill="${MAU.xam}"/>
    ${datVao(logoLong(), 84, 62, 30, 30)}
    <text x="192" y="67" text-anchor="middle" font-size="13" font-weight="800" fill="${MAU.fg || MAU.muc}" font-family="var(--font)">LỐI VÀO NGÀY HỘI</text>
    <g data-h="mui-ten">${muiTenChiDuong({ to: mauTo, vien: mauVien, day: st.day, dut: st.dut, d: 'M68 106H196V78L272 132L196 186V158H68Z' })}
      <text x="154" y="137" text-anchor="middle" font-size="16" font-weight="800" fill="${MAU.muc}" font-family="var(--font)" pointer-events="none">HỘI TRƯỜNG</text>
    </g>`;
}

export default {
  tao: (man) => giong(man.dau),
  lam: {
    to(st, k) { st.to = k; },
    vien(st, k) { st.vien = k; },
    day(st, v) { st.day = v; },
    dut(st, b) { st.dut = b; },
  },
  do: doToVien,

  ve(ctx) {
    const { san, khay, man } = ctx;
    san.innerHTML = '';
    const svg = taoSvg(san, W, H, man.sanNhan || 'Biển mũi tên chỉ đường');
    san.style.setProperty('--chua', '420px');
    let dh = null;

    const capDo = () => (dh ? dh.khoaHit(doToVien(ctx.st)) : '');

    const ve = () => {
      const st = ctx.st;
      svg.innerHTML = `<rect width="${W}" height="${H}" fill="url(#gr-troi)"/>
        <rect y="218" width="${W}" height="46" fill="${MAU.san}"/>
        <rect x="172" y="204" width="16" height="60" fill="${MAU.muc}"/>
        ${veBangMuiTen(st)}`;
      capDo();
    };

    const oMau = (mauHex, vienDut = false) => `<svg class="cu-thu" viewBox="0 0 30 30" aria-hidden="true">${vienDut
      ? `<circle cx="15" cy="15" r="10" fill="none" stroke="${mauHex}" stroke-width="4"/>`
      : `<circle cx="15" cy="15" r="11" fill="${mauHex}" stroke="${MAU.muc}" stroke-width="1.5"/>`}</svg>`;

    const veKhay = () => {
      const st = ctx.st;
      khay.innerHTML = '';
      dh = dongHo(khay, man.dongHo || []);
      hangCu(khay, Object.entries(MAU_TO).map(([k, m]) => ({
        id: `to-${k}`, nhan: m.ten, bat: st.to === k, tranh: oMau(m.mau),
        bam() { ctx.ghi(); st.to = k; ve(); veKhay(); ctx.hit(capDo()); ctx.doi(); },
      })), { deu: true });
      hangCu(khay, [
        ...Object.entries(MAU_VIEN).map(([k, m]) => ({
          id: `vien-${k}`, nhan: m.ten, bat: st.vien === k, tranh: oMau(m.mau, true),
          bam() { ctx.ghi(); st.vien = k; ve(); veKhay(); ctx.hit(capDo()); ctx.doi(); },
        })),
        {
          id: 'kieu-net', nhan: st.dut ? 'Đang nét đứt' : 'Nét liền', ic: st.dut ? 'netDut' : 'netLien', bat: !st.dut,
          bam() { ctx.ghi(); st.dut = !st.dut; ve(); veKhay(); ctx.doi(); },
        },
      ], { deu: true });
      let daGhi = false;
      thanhTruot(khay, {
        nhan: 'Độ dày viền', min: 0, max: 24, buoc: 1, gia: st.day, dinh: (v) => `${v} px`, id: 'day-vien',
        doi(v) {
          if (!daGhi) { ctx.ghi(); daGhi = true; }
          st.day = v;
          ve();
          ctx.hit(capDo());
        },
        xong() { daGhi = false; ctx.hit(); ctx.doi(); },
      });
      capDo();
    };

    // Chạm trực tiếp vào mũi tên trên sân để xoay vòng nhanh màu tô.
    batKeo(svg, W, H, (h) => {
      if (h !== 'mui-ten') return null;
      const ks = Object.keys(MAU_TO);
      ctx.ghi();
      ctx.st.to = ks[(ks.indexOf(ctx.st.to) + 1) % ks.length];
      ve(); veKhay(); ctx.hit(capDo()); ctx.doi();
      return null;
    });

    ve();
    veKhay();
  },
};
