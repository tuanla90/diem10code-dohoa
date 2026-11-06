// Cơ khí nắn nét: nút neo thật, thêm nút, xóa nút, đổi trơn/góc, kéo tay nắm (C10-28).
import { giong, duongSvg, doLech, chenNut, batTron, doanCong, diemBezier } from '../toan/hinh-hoc.mjs';
import { MAU } from '../hinh.mjs';
import { taoSvg, batKeo, dungBoCu } from './chung.mjs';

export const W = 360, H = 300;

export default {
  tao: (man) => giong(man.dau),
  lam: {
    them(st, i) { chenNut(st.nut, i); },
    xoa(st, i) { if (st.nut.length > 3) st.nut.splice(i, 1); },
    tron(st, i, b) {
      if (b) batTron(st.nut, i);
      else { st.nut[i].tron = false; delete st.nut[i].v; delete st.nut[i].r; }
    },
    dat(st, i, x, y) { st.nut[i].x = x; st.nut[i].y = y; },
    tay(st, i, dx, dy) { st.nut[i].r = [dx, dy]; st.nut[i].v = [-dx, -dy]; },
  },
  do(st, man) {
    return {
      lech: doLech(st.nut, man.mau),
      soNut: st.nut.length,
      soTron: st.nut.filter((n) => n.tron).length,
    };
  },

  ve(ctx) {
    const { san, khay, man } = ctx;
    san.innerHTML = '';
    const svg = taoSvg(san, W, H, man.sanNhan || 'Sân nắn đường cong');
    let vong = null;

    const ve = () => {
      const st = ctx.st;
      const chon = st.chon;
      let s = `<rect width="${W}" height="${H}" fill="${MAU.troi}"/><rect x="44" y="20" width="8" height="270" rx="4" fill="${MAU.muc}"/>`;
      s += `<path d="${duongSvg(man.mau)}" fill="${MAU.trang}" fill-opacity=".55" stroke="${MAU.chan}" stroke-width="1.6" stroke-dasharray="6 5"/>`;
      s += `<path d="${duongSvg(st.nut)}" fill="url(#gr-logo)" fill-opacity=".82" stroke="${MAU.muc}" stroke-width="2"/>`;
      const n = st.nut[chon];
      // Tay nắm chỉ cầm được khi đang dùng công cụ Nút hoặc Trơn, góc.
      if (n?.tron && (ctx.cu === 'nut' || ctx.cu === 'tron')) {
        const ax = n.x + n.v[0], ay = n.y + n.v[1], bx = n.x + n.r[0], by = n.y + n.r[1];
        s += `<path d="M${ax} ${ay}L${bx} ${by}" stroke="${MAU.hong}" stroke-width="2"/>`;
        s += `<g data-h="ta:v"><circle cx="${ax}" cy="${ay}" r="22" fill="transparent"/><circle cx="${ax}" cy="${ay}" r="7" fill="${MAU.hong}"/></g>`;
        s += `<g data-h="ta:r"><circle cx="${bx}" cy="${by}" r="22" fill="transparent"/><circle cx="${bx}" cy="${by}" r="7" fill="${MAU.hong}"/></g>`;
      }
      if (ctx.cu === 'them') {
        doanCong(st.nut).forEach((d, i) => {
          const m = diemBezier(d, 0.5);
          s += `<g data-h="ma:${i}"><circle cx="${m.x}" cy="${m.y}" r="22" fill="transparent"/><circle cx="${m.x}" cy="${m.y}" r="9" fill="${MAU.xanh}" stroke="${MAU.muc}" stroke-width="2"/><path d="M${m.x - 5} ${m.y}h10M${m.x} ${m.y - 5}v10" stroke="${MAU.muc}" stroke-width="2"/></g>`;
        });
      }
      st.nut.forEach((p, i) => {
        s += `<g data-h="n:${i}"><circle cx="${p.x}" cy="${p.y}" r="22" fill="transparent"/>`;
        const mau = i === chon ? MAU.chan : MAU.trang;
        s += p.tron
          ? `<circle cx="${p.x}" cy="${p.y}" r="8" fill="${mau}" stroke="${MAU.muc}" stroke-width="2.5"/></g>`
          : `<rect x="${p.x - 7}" y="${p.y - 7}" width="14" height="14" rx="2" fill="${mau}" stroke="${MAU.muc}" stroke-width="2.5"/></g>`;
      });
      if (vong) s += `<circle cx="${vong.x}" cy="${vong.y}" r="14" fill="none" stroke="${MAU.hong}" stroke-width="2.5"/>`;
      svg.innerHTML = s;
    };

    batKeo(svg, W, H, (h) => {
      const st = ctx.st;
      if (!h) {
        if (st.chon !== null) { st.chon = null; ve(); }
        return null;
      }
      if (h.startsWith('ma:')) {
        ctx.ghi();
        chenNut(st.nut, +h.slice(3));
        st.chon = +h.slice(3) + 1;
        ve(); ctx.doi();
        return null;
      }
      if (h.startsWith('ta:')) {
        const n = st.nut[st.chon];
        const dau = h.slice(3);
        ctx.ghi();
        return {
          di(p) {
            let dx = p.x - n.x, dy = p.y - n.y;
            if (dau === 'v') { dx = -dx; dy = -dy; }
            // Gần đúng tay nắm của đường nét đứt thì hít vào, ngón tay không cần chính xác từng điểm.
            const m = man.mau.find((g) => g.tron && g.x === n.x && g.y === n.y);
            vong = null;
            if (m && Math.hypot(dx - m.r[0], dy - m.r[1]) < 14) {
              dx = m.r[0]; dy = m.r[1];
              vong = dau === 'v' ? { x: n.x - dx, y: n.y - dy } : { x: n.x + dx, y: n.y + dy };
            }
            ctx.hit(vong ? 'tay' : '');
            n.r = [dx, dy];
            n.v = [-dx, -dy];
            ve();
          },
          nha() { vong = null; ctx.hit(); ve(); ctx.doi(); },
        };
      }
      if (h.startsWith('n:')) {
        const i = +h.slice(2);
        const n = st.nut[i];
        if (ctx.cu === 'xoa') {
          if (st.nut.length <= 3) { ctx.nhac('Một hình cần ít nhất 3 nút.'); return null; }
          ctx.ghi();
          st.nut.splice(i, 1);
          st.chon = null;
          ve(); ctx.doi();
          return null;
        }
        if (ctx.cu === 'tron') {
          ctx.ghi();
          st.chon = i;
          if (n.tron) { n.tron = false; delete n.v; delete n.r; } else batTron(st.nut, i);
          ve(); ctx.doi();
          return null;
        }
        if (ctx.cu === 'them') {
          ctx.nhac('Đang cầm <b>Thêm nút</b>: chạm dấu cộng xanh. Muốn kéo nút thì chọn <b>Nút</b>.');
          return null;
        }
        st.chon = i;
        ve();
        let daGhi = false;
        const giu = man.mau.map((m) => ({ x: m.x, y: m.y }));
        return {
          di(p) {
            if (!daGhi) { ctx.ghi(); daGhi = true; }
            n.x = Math.max(8, Math.min(W - 8, Math.round(p.x)));
            n.y = Math.max(8, Math.min(H - 8, Math.round(p.y)));
            vong = null;
            for (const g of giu) if (Math.hypot(g.x - n.x, g.y - n.y) < 12) { n.x = g.x; n.y = g.y; vong = g; }
            ctx.hit(vong ? `${vong.x},${vong.y}` : '');
            ve();
          },
          nha() { vong = null; ctx.hit(); ve(); ctx.doi(); },
        };
      }
      return null;
    });

    dungBoCu(ctx, [
      { id: 'nut', nhan: 'Nút', ic: 'nutNeo' },
      { id: 'them', nhan: 'Thêm nút', ic: 'them' },
      { id: 'xoa', nhan: 'Xóa nút', ic: 'xoa' },
      man.san?.coTron && { id: 'tron', nhan: 'Trơn, góc', ic: 'tron' },
    ], 'nut', () => ve());
    khay.innerHTML = '';
    ve();
  },
};
