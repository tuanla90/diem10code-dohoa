// Cơ khí ghép hình: gộp, khoét, giữ phần chung. Thứ tự phép làm ra hình khác nhau (C10-28).
import { giong, lapMatNa, tiLeTrung, dinhSao } from '../toan/hinh-hoc.mjs';
import { MAU, saoPath } from '../hinh.mjs';
import { taoSvg, batKeo, dungBoCu } from './chung.mjs';

export const W = 360, H = 300;

function veHinhCanvas(c, h) {
  c.beginPath();
  if (h.loai === 'tron') c.arc(h.x, h.y, h.r, 0, Math.PI * 2);
  else if (h.loai === 'vuong') c.rect(h.x - h.w / 2, h.y - h.h / 2, h.w, h.h);
  else dinhSao(h).forEach((p, i) => (i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y)));
  c.closePath();
  c.fill();
}

// Vẽ kết quả các phép lên canvas: dùng lại khi in cảnh hậu quả.
export function veKetQua(cv, buoc, mau, tiLe = 2) {
  const c = cv.getContext('2d');
  c.setTransform(tiLe, 0, 0, tiLe, 0, 0);
  c.globalCompositeOperation = 'source-over';
  c.clearRect(0, 0, W, H);
  c.fillStyle = MAU.muc;
  for (const b of buoc) {
    c.globalCompositeOperation = b.phep === 'khoet' ? 'destination-out' : b.phep === 'giao' ? 'destination-in' : 'source-over';
    veHinhCanvas(c, b.hinh);
  }
  c.globalCompositeOperation = 'source-in';
  if (mau) c.fillStyle = mau;
  else {
    const g = c.createLinearGradient(60, 40, 300, 280);
    g.addColorStop(0, MAU.tim);
    g.addColorStop(0.55, MAU.giua);
    g.addColorStop(1, MAU.hong);
    c.fillStyle = g;
  }
  c.fillRect(0, 0, W, H);
  c.globalCompositeOperation = 'source-over';
}

const lam = {
  dat(st, id, x, y) { const h = st.hinh.find((o) => o.id === id); h.x = x; h.y = y; },
  ap(st, id, phep) {
    const i = st.hinh.findIndex((o) => o.id === id);
    if (i < 0) return;
    const [h] = st.hinh.splice(i, 1);
    st.buoc.push({ phep, hinh: h });
    st.chon = st.hinh[0]?.id || null;
  },
};

export default {
  tao: (man) => giong(man.dau),
  lam,
  do(st, man) {
    const a = lapMatNa(st.buoc, W, H, 3);
    const b = lapMatNa(man.dichBuoc, W, H, 3);
    const o = (x, y) => a.m[Math.floor(y / 3) * a.cot + Math.floor(x / 3)];
    const { lo, sao } = man.dungKiem;
    // Lỗ thật: tâm trống mà xung quanh còn vật liệu bao kín bốn phía.
    const coLo = !o(lo.x, lo.y) && o(lo.x - lo.r - 8, lo.y) && o(lo.x + lo.r + 8, lo.y) && o(lo.x, lo.y - lo.r - 8) && o(lo.x, lo.y + lo.r + 8);
    return {
      trung: tiLeTrung(a.m, b.m),
      coLo: !!coLo,
      saoKhoet: !o(sao.x, sao.y),
      conThua: st.hinh.length,
      coGiao: st.buoc.some((x) => x.phep === 'giao'),
    };
  },

  ve(ctx) {
    const { san, khay, man } = ctx;
    san.innerHTML = '';
    const chong = document.createElement('div');
    chong.className = 'san-chong';
    const nen = document.createElement('canvas');
    nen.className = 'san-canvas';
    nen.width = W * 2;
    nen.height = H * 2;
    nen.setAttribute('aria-hidden', 'true');
    chong.appendChild(nen);
    san.appendChild(chong);
    const svg = taoSvg(chong, W, H, man.sanNhan || 'Sân ghép hình');
    const lop = document.createElement('canvas');
    lop.width = W * 2;
    lop.height = H * 2;
    const dich = document.createElement('canvas');
    dich.width = W * 2;
    dich.height = H * 2;
    veKetQua(dich, man.dichBuoc, MAU.xam);
    let gion = null;

    const ve = () => {
      const st = ctx.st;
      veKetQua(lop, st.buoc);
      const c = nen.getContext('2d');
      c.setTransform(1, 0, 0, 1, 0, 0);
      c.clearRect(0, 0, nen.width, nen.height);
      c.fillStyle = MAU.tuong;
      c.fillRect(0, 0, nen.width, nen.height);
      c.globalAlpha = 0.28;
      c.drawImage(dich, 0, 0);
      c.globalAlpha = 1;
      c.drawImage(lop, 0, 0);
      let s = '';
      for (const h of st.hinh) {
        const chon = st.chon === h.id;
        const net = `fill="${MAU.cyan}" fill-opacity=".35" stroke="${chon ? MAU.chan : MAU.muc}" stroke-width="${chon ? 3 : 2}" stroke-dasharray="${chon ? '0' : '6 4'}"`;
        s += `<g data-h="h:${h.id}">`;
        if (h.loai === 'tron') s += `<circle cx="${h.x}" cy="${h.y}" r="${Math.max(h.r, 24)}" fill="transparent"/><circle cx="${h.x}" cy="${h.y}" r="${h.r}" ${net}/>`;
        else if (h.loai === 'vuong') s += `<rect x="${h.x - h.w / 2}" y="${h.y - h.h / 2}" width="${h.w}" height="${h.h}" ${net}/>`;
        else s += `<circle cx="${h.x}" cy="${h.y}" r="${h.r}" fill="transparent"/><path d="${saoPath(h.x, h.y, h.r)}" ${net}/>`;
        s += '</g>';
      }
      if (gion) s += `<path d="${gion}" stroke="${MAU.hong}" stroke-width="1.8" stroke-dasharray="5 4"/>`;
      svg.innerHTML = s;
    };

    batKeo(svg, W, H, (h, pt) => {
      if (!h || !h.startsWith('h:')) {
        if (ctx.cu !== 'chon') ctx.nhac('Chạm vào một hình rời để áp dụng công cụ này.');
        return null;
      }
      const st = ctx.st;
      const id = h.slice(2);
      const v = st.hinh.find((o) => o.id === id);
      // Công cụ ghép: chạm hình nào là áp dụng lên hình đó.
      if (ctx.cu !== 'chon') {
        ctx.ghi();
        lam.ap(st, id, ctx.cu);
        ve(); ctx.doi();
        return null;
      }
      if (st.chon !== id) { st.chon = id; ve(); }
      const dx = pt.x - v.x, dy = pt.y - v.y;
      let daGhi = false;
      return {
        di(p) {
          if (!daGhi) { ctx.ghi(); daGhi = true; }
          v.x = Math.max(0, Math.min(W, p.x - dx));
          v.y = Math.max(0, Math.min(H, p.y - dy));
          gion = null;
          if (Math.hypot(v.x - v.dx, v.y - v.dy) < 12) {
            v.x = v.dx; v.y = v.dy;
            gion = `M${v.x} 0V${H}M0 ${v.y}H${W}`;
          }
          ctx.hit(gion);
          ve();
        },
        nha() { gion = null; ctx.hit(); ve(); ctx.doi(); },
      };
    });

    dungBoCu(ctx, [
      { id: 'chon', nhan: 'Di chuyển', ic: 'diChuyen' },
      { id: 'gop', nhan: 'Gộp vào', ic: 'gop' },
      { id: 'khoet', nhan: 'Khoét đi', ic: 'khoet' },
      { id: 'giao', nhan: 'Giữ chung', ic: 'giao' },
    ], 'chon', () => ve());
    khay.innerHTML = '';
    ve();
  },
};
