// Cơ khí nắn nét: nút neo thật, thêm nút, xóa nút, đổi trơn/góc, kéo tay nắm (C10-28).
import { giong, duongSvg, doLech, chenNut, batTron, doanCong, diemBezier } from '../toan/hinh-hoc.mjs';
import { MAU } from '../hinh.mjs';
import { taoSvg, batKeo, hangCu } from './chung.mjs';

export const W = 360, H = 300;

const lam = {
  them(st, i) { chenNut(st.nut, i); },
  xoa(st, i) { if (st.nut.length > 3) st.nut.splice(i, 1); },
  tron(st, i, b) {
    if (b) batTron(st.nut, i);
    else { st.nut[i].tron = false; delete st.nut[i].v; delete st.nut[i].r; }
  },
  dat(st, i, x, y) { st.nut[i].x = x; st.nut[i].y = y; },
  tay(st, i, dx, dy) { st.nut[i].r = [dx, dy]; st.nut[i].v = [-dx, -dy]; },
};

export default {
  tao: (man) => giong(man.dau),
  lam,
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
    // Màn uốn cong phải giữ nguyên số nút, nên không bày dấu cộng ra làm rối mép cờ. Màn nào cần cả hai thì tự khai coThem.
    const coThem = man.san?.coThem ?? !man.san?.coTron;

    const ve = () => {
      const st = ctx.st;
      const chon = st.chon;
      // man.san có thể tự đưa nền, màu tô và lớp phủ (vd rô bốt che gốc cánh tay). Không khai thì là lá cờ trên cột.
      let s = man.san?.nen ? man.san.nen() : `<rect width="${W}" height="${H}" fill="${MAU.troi}"/><rect x="44" y="20" width="8" height="270" rx="4" fill="${MAU.muc}"/>`;
      s += `<path d="${duongSvg(man.mau)}" fill="${MAU.trang}" fill-opacity=".55" stroke="${MAU.chan}" stroke-width="1.6" stroke-dasharray="6 5"/>`;
      s += `<path d="${duongSvg(st.nut)}" ${man.san?.to || 'fill="url(#gr-logo)" fill-opacity=".82" stroke-width="2"'} stroke="${MAU.muc}"/>`;
      if (man.san?.phu) s += man.san.phu();
      const n = st.nut[chon];
      // Thứ tự vẽ là thứ tự ưu tiên khi chạm: nút trên cùng, rồi tay nắm, rồi dấu cộng.
      // Đoạn quá ngắn thì không bày dấu cộng, vì nó sẽ nằm lọt giữa vùng chạm của hai nút.
      // Màn tự khai coThem: đủ số nút của đích thì cất dấu cộng, để chúng không che cái tay vừa vẽ.
      if (coThem && !(man.san?.coThem && st.nut.length >= man.mau.length)) {
        doanCong(st.nut).forEach((d, i) => {
          const dau = diemBezier(d, 0), cuoi = diemBezier(d, 1);
          if (Math.hypot(cuoi.x - dau.x, cuoi.y - dau.y) < 56) return;
          // Giữa đoạn mà trùng một nút khác thì dịch dấu cộng dọc đoạn, không thì nó nằm dưới vùng chạm của nút đó và không bấm được.
          const m = [0.5, 0.35, 0.65, 0.2, 0.8].map((t) => diemBezier(d, t)).find((p) => st.nut.every((q) => Math.hypot(q.x - p.x, q.y - p.y) >= 30)) || diemBezier(d, 0.5);
          s += `<g data-h="ma:${i}"><circle cx="${m.x}" cy="${m.y}" r="20" fill="transparent"/><circle cx="${m.x}" cy="${m.y}" r="9" fill="${MAU.xanh}" stroke="${MAU.muc}" stroke-width="2"/><path d="M${m.x - 5} ${m.y}h10M${m.x} ${m.y - 5}v10" stroke="${MAU.muc}" stroke-width="2"/></g>`;
        });
      }
      if (n?.tron) {
        const ax = n.x + n.v[0], ay = n.y + n.v[1], bx = n.x + n.r[0], by = n.y + n.r[1];
        s += `<path d="M${ax} ${ay}L${bx} ${by}" stroke="${MAU.hong}" stroke-width="2"/>`;
        s += `<g data-h="ta:v"><circle cx="${ax}" cy="${ay}" r="22" fill="transparent"/><circle cx="${ax}" cy="${ay}" r="7" fill="${MAU.hong}"/></g>`;
        s += `<g data-h="ta:r"><circle cx="${bx}" cy="${by}" r="22" fill="transparent"/><circle cx="${bx}" cy="${by}" r="7" fill="${MAU.hong}"/></g>`;
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

    // Lệnh theo nút đang chọn: chọn nút trước, bấm lệnh sau.
    const veKhay = () => {
      const st = ctx.st;
      const dang = st.nut[st.chon];
      khay.innerHTML = '';
      hangCu(khay, [
        man.san?.coTron && {
          id: 'tron', nhan: 'Nút trơn', ic: 'tron', bat: !!dang?.tron, tat: !dang,
          bam() {
            ctx.ghi();
            lam.tron(st, st.chon, !dang.tron);
            ve(); veKhay(); ctx.doi();
          },
        },
        {
          id: 'xoa-nut', nhan: 'Xóa nút', ic: 'xoa', tat: !dang || st.nut.length <= 3,
          bam() { ctx.ghi(); lam.xoa(st, st.chon); st.chon = null; ve(); veKhay(); ctx.doi(); },
        },
      ], { deu: !!man.san?.coTron });
    };

    // Kéo một nút, gần chỗ đích thì hít. Dùng chung cho nút có sẵn và nút vừa sinh ra từ dấu cộng.
    const keoNut = (n, daGhiSan) => {
      let daGhi = daGhiSan;
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
        nha() { vong = null; ctx.hit(); ve(); veKhay(); ctx.doi(); },
      };
    };

    batKeo(svg, W, H, (h) => {
      const st = ctx.st;
      if (!h) {
        if (st.chon !== null) { st.chon = null; ve(); veKhay(); ctx.doi(); }
        return null;
      }
      // Chạm dấu cộng là có nút mới, giữ nguyên ngón tay kéo tiếp được luôn.
      if (h.startsWith('ma:')) {
        ctx.ghi();
        chenNut(st.nut, +h.slice(3));
        st.chon = +h.slice(3) + 1;
        ve(); veKhay();
        return keoNut(st.nut[st.chon], true);
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
        st.chon = i;
        ve(); veKhay();
        return keoNut(st.nut[i], false);
      }
      return null;
    });

    ve();
    veKhay();
  },
};
