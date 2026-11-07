// Cơ khí ghép hình: gộp, khoét, giữ phần chung. Thứ tự phép làm ra hình khác nhau (C10-28).
import { giong, lapMatNa, tiLeTrung, dinhSao, dinhDaGiac } from '../toan/hinh-hoc.mjs';
import { MAU, saoPath } from '../hinh.mjs';
import { taoSvg, batKeo, hangCu } from './chung.mjs';

export const W = 360, H = 300;

function veHinhCanvas(c, h) {
  c.beginPath();
  if (h.loai === 'tron') c.arc(h.x, h.y, h.r, 0, Math.PI * 2);
  else if (h.loai === 'vuong') c.rect(h.x - h.w / 2, h.y - h.h / 2, h.w, h.h);
  else (h.loai === 'sao' ? dinhSao(h) : dinhDaGiac(h)).forEach((p, i) => (i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y)));
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
    const { lo, sao, diem = {} } = man.dungKiem;
    // Lỗ thật: tâm trống mà xung quanh còn vật liệu bao kín bốn phía.
    const coLo = !o(lo.x, lo.y) && o(lo.x - lo.r - 8, lo.y) && o(lo.x + lo.r + 8, lo.y) && o(lo.x, lo.y - lo.r - 8) && o(lo.x, lo.y + lo.r + 8);
    return {
      trung: tiLeTrung(a.m, b.m),
      coLo: !!coLo,
      saoKhoet: sao ? !o(sao.x, sao.y) : false,
      // Các điểm màn muốn soi: có vật liệu ở đó hay không.
      co: Object.fromEntries(Object.entries(diem).map(([k, [x, y]]) => [k, !!o(x, y)])),
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
      // Hình đặc có thể che bóng mờ, nên màn cần thấy đích qua hình thì khai thêm nét đứt nằm trên cùng.
      let s = man.netDich ? `<path d="${man.netDich}" fill="none" stroke="${MAU.trang}" stroke-width="3.5" pointer-events="none"/><path d="${man.netDich}" fill="none" stroke="${MAU.muc}" stroke-width="1.8" stroke-dasharray="6 4" pointer-events="none"/>` : '';
      for (const h of st.hinh) {
        const chon = st.chon === h.id;
        const net = `fill="${MAU.cyan}" fill-opacity=".35" stroke="${chon ? MAU.chan : MAU.muc}" stroke-width="${chon ? 3 : 2}" stroke-dasharray="${chon ? '0' : '6 4'}"`;
        s += `<g data-h="h:${h.id}">`;
        if (h.loai === 'tron') s += `<circle cx="${h.x}" cy="${h.y}" r="${Math.max(h.r, 24)}" fill="transparent"/><circle cx="${h.x}" cy="${h.y}" r="${h.r}" ${net}/>`;
        // Hình mảnh vẫn cần vùng chạm đủ cho ngón tay.
        else if (h.loai === 'da-giac') {
          const d = dinhDaGiac(h), xs = d.map((p) => p.x), ys = d.map((p) => p.y);
          s += `<rect x="${Math.min(...xs)}" y="${Math.min(...ys)}" width="${Math.max(...xs) - Math.min(...xs)}" height="${Math.max(...ys) - Math.min(...ys)}" fill="transparent"/><path d="M${d.map((p) => `${p.x} ${p.y}`).join('L')}Z" ${net}/>`;
        } else if (h.loai === 'vuong') s += `<rect x="${h.x - Math.max(h.w, 44) / 2}" y="${h.y - Math.max(h.h, 44) / 2}" width="${Math.max(h.w, 44)}" height="${Math.max(h.h, 44)}" fill="transparent"/><rect x="${h.x - h.w / 2}" y="${h.y - h.h / 2}" width="${h.w}" height="${h.h}" ${net}/>`;
        else s += `<circle cx="${h.x}" cy="${h.y}" r="${h.r}" fill="transparent"/><path d="${saoPath(h.x, h.y, h.r)}" ${net}/>`;
        s += '</g>';
      }
      if (gion) s += `<path d="${gion}" fill="none" stroke="${MAU.hong}" stroke-width="1.8" stroke-dasharray="5 4"/>`;
      svg.innerHTML = s;
    };

    // Ghép là lệnh, không phải công cụ: chọn một hình rời rồi bấm lệnh, áp lên hình đã có sẵn trên sân.
    const veKhay = () => {
      const st = ctx.st;
      khay.innerHTML = '';
      const chon = st.hinh.find((o) => o.id === st.chon);
      const nhan = document.createElement('div');
      nhan.className = 'nhan-phu';
      nhan.innerHTML = chon ? `Đang chọn: <b>${chon.ten}</b>` : (st.hinh.length ? 'Chạm một hình rời để chọn.' : 'Đã ghép hết các hình.');
      khay.appendChild(nhan);
      const lenh = (id, ten, ic) => ({ id, nhan: ten, ic, tat: !chon, bam() { ctx.ghi(); lam.ap(st, chon.id, id); ve(); veKhay(); ctx.doi(); } });
      hangCu(khay, [lenh('gop', 'Gộp vào', 'gop'), lenh('khoet', 'Khoét đi', 'khoet'), lenh('giao', 'Giữ chung', 'giao')], { deu: true });
    };

    batKeo(svg, W, H, (h, pt) => {
      if (!h || !h.startsWith('h:')) return null;
      const st = ctx.st;
      const id = h.slice(2);
      const v = st.hinh.find((o) => o.id === id);
      if (st.chon !== id) { st.chon = id; ve(); veKhay(); }
      const dx = pt.x - v.x, dy = pt.y - v.y;
      let daGhi = false;
      return {
        di(p) {
          if (!daGhi && Math.hypot(p.x - pt.x, p.y - pt.y) < 3) return;
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

    ve();
    veKhay();
  },
};
