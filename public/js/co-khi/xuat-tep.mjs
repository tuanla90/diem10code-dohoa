// Cơ khí xuất tệp: ba đơn hàng thật, mỗi đơn chọn định dạng và chất lượng. Không có bảng đáp án (C10-28).
import { giong } from '../toan/hinh-hoc.mjs';
import { MAU, datVao, logoLong } from '../hinh.mjs';
import { hangCu, thanhTruot, dongHo } from './chung.mjs';

export const DINH_DANG = { jpg: 'JPG', png: 'PNG trong suốt', svg: 'SVG vector' };

// Dung lượng ước lượng theo loại nội dung, đơn vị MB.
export function coTep(don, d) {
  if (don.loai === 'logo') return { jpg: 0.4, png: 0.2, svg: 0.01 }[d.dd];
  if (d.dd === 'png') return 11;
  if (d.dd === 'svg') return 15;
  return Math.round((0.35 + 6.2 * (d.cl / 100) ** 3) * 10) / 10;
}

export function anhNho(don, d) {
  if (don.loai === 'logo') {
    const nen = d.dd === 'jpg' ? `<rect width="74" height="50" fill="${MAU.trang}"/>` : `<rect width="74" height="50" fill="url(#o-ca-ro)"/>`;
    return `<svg viewBox="0 0 74 50" aria-hidden="true">${nen}${datVao(logoLong(), 37, 25, 42, 42)}</svg>`;
  }
  const lem = d.dd === 'jpg' && d.cl < 60;
  return `<svg viewBox="0 0 74 50" aria-hidden="true"><rect width="74" height="50" fill="url(#gr-poster)"/>${lem ? `<g filter="blur(.8)">` : '<g>'}${datVao(logoLong(), 22, 25, 30, 30)}<rect x="41" y="17" width="26" height="6" rx="2" fill="${MAU.trang}"/><rect x="41" y="27" width="20" height="5" rx="2" fill="${MAU.vang}"/></g></svg>`;
}

export default {
  tao: (man) => giong(man.dau),
  lam: {
    dd(st, id, dd) { st.chon = id; st.don[id].dd = dd; },
    cl(st, id, cl) { st.don[id].cl = cl; },
  },
  do(st, man) {
    const tt = (id) => {
      const don = man.don.find((d) => d.id === id);
      return { ...st.don[id], mb: coTep(don, st.don[id]) };
    };
    return { ao: tt('ao'), bang: tt('bang'), tin: tt('tin') };
  },

  ve(ctx) {
    const { san, khay, man } = ctx;
    san.innerHTML = '';
    const hop = document.createElement('div');
    hop.className = 'san-hang';
    san.appendChild(hop);

    const veDon = () => {
      const st = ctx.st;
      hop.innerHTML = '';
      for (const don of man.don) {
        const d = st.don[don.id];
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'the-don';
        b.setAttribute('aria-pressed', String(st.chon === don.id));
        b.dataset.don = don.id;
        b.innerHTML = `${anhNho(don, d)}<span><b>${don.ten}</b><small>${don.yeuCau}</small></span><span class="co-tep">${d.dd.toUpperCase()}<br>${coTep(don, d)} MB</span>`;
        b.addEventListener('click', () => { st.chon = don.id; veDon(); veKhay(); });
        hop.appendChild(b);
      }
    };

    const veKhay = () => {
      const st = ctx.st;
      const d = st.don[st.chon];
      khay.innerHTML = '';
      hangCu(khay, Object.entries(DINH_DANG).map(([k, t]) => ({
        id: `dd-${k}`, nhan: t, ic: 'tep', bat: d.dd === k,
        bam() { ctx.ghi(); d.dd = k; veDon(); veKhay(); ctx.doi(); },
      })));
      if (d.dd === 'jpg') {
        thanhTruot(khay, {
          nhan: 'Chất lượng', min: 10, max: 100, buoc: 5, gia: d.cl, dinh: (v) => `${v}%`, id: 'cl',
          doi(v) { d.cl = v; veDon(); ctx.hit(capDo() ? 'du' : ''); },
          xong() { ctx.hit(); ctx.doi(); },
        });
        // Chỉ ảnh chụp mới phải cân dung lượng với độ nét, logo thì chất lượng không đổi dung lượng.
        const don = man.don.find((x) => x.id === st.chon);
        const dh = don.loai === 'anh' ? dongHo(khay, man.dongHo || []) : null;
        const capDo = () => (dh ? dh.capNhat({ tin: { mb: coTep(don, d), cl: d.cl } }) : false);
        capDo();
      }
    };

    veDon();
    veKhay();
  },
};
