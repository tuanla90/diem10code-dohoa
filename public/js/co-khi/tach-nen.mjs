// Cơ khí tách nền: đũa thần loang thật theo ngưỡng, cọ xóa và cọ giữ (U11-09, U11-11).
// Trạng thái chỉ là danh sách thao tác nên Hoàn tác là chạy lại, không phải lưu cả ảnh.
import { giong } from '../toan/hinh-hoc.mjs';
import { anhRobot, duaThan, toCo } from '../toan/anh.mjs';
import { batKeo, thanhTruot, dungBoCu } from './chung.mjs';

const boNho = {};
export const anhCua = (kieu) => (boNho[kieu] ||= anhRobot(kieu));

export function matNaXoa(st, a) {
  const m = new Uint8Array(a.w * a.h);
  for (const t of st.thao) {
    if (t.k === 'dua') duaThan(a, t.x, t.y, t.nguong, m);
    else for (const [x, y] of t.pts) toCo(a, x, y, t.r, t.giu ? 0 : 1, m, t.bam);
  }
  return m;
}

// Tô nền ca rô vào phần đã xóa, giữ điểm ảnh gốc ở phần còn lại.
export function veLenData(a, m, data, caRo = true) {
  for (let i = 0; i < m.length; i++) {
    const k = i * 4;
    if (m[i]) {
      if (caRo) {
        const x = i % a.w, y = (i - x) / a.w;
        const v = (x >> 3) % 2 === (y >> 3) % 2 ? 255 : 224;
        data[k] = v; data[k + 1] = v; data[k + 2] = v; data[k + 3] = 255;
      } else data[k + 3] = 0;
    } else {
      data[k] = a.data[k]; data[k + 1] = a.data[k + 1]; data[k + 2] = a.data[k + 2]; data[k + 3] = 255;
    }
  }
}

// Chạm lệch lên rô bốt một chút thì đũa thần tự trượt sang điểm nền gần nhất.
export function diemNenGan(a, x, y, banKinh = 5) {
  const la = (i, j) => i >= 0 && j >= 0 && i < a.w && j < a.h && !a.that[j * a.w + i];
  if (!a.that || la(x, y)) return { x, y };
  for (let r = 1; r <= banKinh; r++) {
    for (let j = -r; j <= r; j++) {
      for (let i = -r; i <= r; i++) {
        if (Math.max(Math.abs(i), Math.abs(j)) === r && la(x + i, y + j)) return { x: x + i, y: y + j };
      }
    }
  }
  return { x, y };
}

export default {
  tao: (man) => giong(man.dau),
  lam: {
    dua(st, x, y, nguong) { st.thao.push({ k: 'dua', x, y, nguong }); },
    co(st, giu, r, pts) { st.thao.push({ k: 'co', giu, r, pts }); },
  },
  do(st, man) {
    const a = anhCua(man.kieuAnh);
    const m = matNaXoa(st, a);
    let robot = 0, robotMat = 0, nen = 0, nenCon = 0;
    for (let i = 0; i < m.length; i++) {
      if (a.that[i]) { robot++; if (m[i]) robotMat++; } else { nen++; if (!m[i]) nenCon++; }
    }
    const giu = robot - robotMat;
    const khe = (x, y) => m[y * a.w + x];
    return {
      anMat: robotMat / robot,
      conSot: nenCon / nen,
      trung: giu / (giu + nenCon + robotMat),
      kheTrai: !!khe(61, 75),
      khePhai: !!khe(119, 75),
    };
  },

  ve(ctx) {
    const { san, khay, man } = ctx;
    const a = anhCua(man.kieuAnh);
    san.innerHTML = '';
    const cv = document.createElement('canvas');
    cv.className = 'san-canvas';
    cv.width = a.w;
    cv.height = a.h;
    cv.setAttribute('role', 'img');
    cv.setAttribute('aria-label', man.sanNhan || 'Ảnh rô bốt đang tách nền');
    san.style.setProperty('--tile', a.w / a.h);
    san.appendChild(cv);
    const c = cv.getContext('2d');
    const img = c.createImageData(a.w, a.h);
    let cho = false;
    let net = null;

    const ve = () => {
      if (cho) return;
      cho = true;
      requestAnimationFrame(() => {
        cho = false;
        const st = ctx.st;
        const m = matNaXoa(st, a);
        if (net) for (const [x, y] of net.pts) toCo(a, x, y, net.r, net.giu ? 0 : 1, m, true);
        veLenData(a, m, img.data);
        c.putImageData(img, 0, 0);
      });
    };

    const veKhay = () => {
      const st = ctx.st;
      khay.innerHTML = '';
      if (ctx.cu === 'dua') {
        thanhTruot(khay, { nhan: 'Ngưỡng', min: 5, max: 120, buoc: 5, gia: st.nguong, id: 'nguong', doi(v) { ctx.st.nguong = v; } });
      } else {
        thanhTruot(khay, { nhan: 'Cỡ cọ', min: 3, max: 16, buoc: 1, gia: st.r, id: 'r', doi(v) { ctx.st.r = v; } });
      }
    };

    batKeo(cv, a.w, a.h, (_h, pt) => {
      const st = ctx.st;
      const x = Math.floor(pt.x), y = Math.floor(pt.y);
      if (x < 0 || y < 0 || x >= a.w || y >= a.h) return null;
      if (ctx.cu === 'dua') {
        const diem = diemNenGan(a, x, y);
        ctx.ghi();
        st.thao.push({ k: 'dua', x: diem.x, y: diem.y, nguong: st.nguong });
        ve();
        ctx.doi();
        return null;
      }
      net = { k: 'co', giu: ctx.cu === 'giu', r: st.r, bam: true, pts: [[x, y]] };
      ve();
      return {
        di(p) {
          const cuoi = net.pts[net.pts.length - 1];
          // Làm mượt nét cho đỡ run tay, như chế độ ổn định nét của các app vẽ.
          const nx = Math.round(cuoi[0] + (p.x - cuoi[0]) * 0.6), ny = Math.round(cuoi[1] + (p.y - cuoi[1]) * 0.6);
          // Chèn điểm giữa để nét không đứt khi ngón tay lướt nhanh.
          const buoc = Math.max(1, Math.floor(Math.hypot(nx - cuoi[0], ny - cuoi[1]) / 2));
          for (let i = 1; i <= buoc; i++) net.pts.push([Math.round(cuoi[0] + ((nx - cuoi[0]) * i) / buoc), Math.round(cuoi[1] + ((ny - cuoi[1]) * i) / buoc)]);
          ve();
        },
        nha() {
          ctx.ghi();
          st.thao.push(net);
          net = null;
          ve();
          ctx.doi();
        },
      };
    });

    dungBoCu(ctx, [
      { id: 'dua', nhan: 'Đũa thần', ic: 'dua' },
      man.co !== false && { id: 'xoa', nhan: 'Cọ xóa', ic: 'gom' },
      man.co !== false && { id: 'giu', nhan: 'Cọ giữ', ic: 'giu' },
    ], 'dua', () => veKhay());
    ve();
    veKhay();
  },
};
