// Cơ khí tách nền: đũa thần loang thật theo ngưỡng, cọ xóa và cọ giữ (U11-09, U11-11).
// Trạng thái chỉ là danh sách thao tác nên Hoàn tác là chạy lại, không phải lưu cả ảnh.
import { giong } from '../toan/hinh-hoc.mjs';
import { anhRobot, duaThan, toCo, KHE_TAY, MAU_THIEU } from '../toan/anh.mjs';
import { batKeo, thanhTruot, dungBoCu, dongHo } from './chung.mjs';

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
// bongMo: chế độ khôi phục như app xóa nền. Rô bốt lỡ xóa phủ hồng để biết chỗ cần tô lại, tường đã xóa chỉ hiện mờ.
export function veLenData(a, m, data, caRo = true, bongMo = false) {
  for (let i = 0; i < m.length; i++) {
    const k = i * 4;
    if (m[i]) {
      if (caRo) {
        if (bongMo && a.that?.[i]) {
          for (let c = 0; c < 3; c++) data[k + c] = MAU_THIEU[c] * 0.8 + a.data[k + c] * 0.2;
          data[k + 3] = 255;
          continue;
        }
        const moi = bongMo ? 0.2 : 0;
        const x = i % a.w, y = (i - x) / a.w;
        const v = ((x >> 3) % 2 === (y >> 3) % 2 ? 255 : 224) * (1 - moi);
        data[k] = v + a.data[k] * moi; data[k + 1] = v + a.data[k + 1] * moi; data[k + 2] = v + a.data[k + 2] * moi; data[k + 3] = 255;
      } else data[k + 3] = 0;
    } else {
      data[k] = a.data[k]; data[k + 1] = a.data[k + 1]; data[k + 2] = a.data[k + 2]; data[k + 3] = 255;
    }
  }
}

// Chạm lệch lên rô bốt một chút thì đũa thần tự trượt sang điểm nền gần nhất.
export function diemNenGan(a, x, y, banKinh = 7) {
  if (!a.that) return { x, y };
  const la = (i, j) => i >= 0 && j >= 0 && i < a.w && j < a.h && !a.that[j * a.w + i];
  // Đũa thần lấy mẫu màu từ ô 3x3, nên điểm sát viền rô bốt cho màu lẫn và chỉ chọn được vài điểm. Ưu tiên điểm cả ô 3x3 đều là nền.
  const sach = (i, j) => {
    for (let v = -1; v <= 1; v++) for (let u = -1; u <= 1; u++) if (i + u >= 0 && j + v >= 0 && i + u < a.w && j + v < a.h && !la(i + u, j + v)) return false;
    return la(i, j);
  };
  const tim = (dung) => {
    if (dung(x, y)) return { x, y };
    for (let r = 1; r <= banKinh; r++) {
      for (let j = -r; j <= r; j++) {
        for (let i = -r; i <= r; i++) {
          if (Math.max(Math.abs(i), Math.abs(j)) === r && dung(x + i, y + j)) return { x: x + i, y: y + j };
        }
      }
    }
    return null;
  };
  return tim(sach) || tim(la) || { x, y };
}

function doTach(st, man) {
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
    kheTrai: !!khe(...KHE_TAY[0]),
    khePhai: !!khe(...KHE_TAY[1]),
  };
}

export default {
  tao: (man) => giong(man.dau),
  lam: {
    dua(st, x, y, nguong) { st.thao.push({ k: 'dua', x, y, nguong }); },
    co(st, giu, r, pts, bam = false) { st.thao.push({ k: 'co', giu, r, pts, bam }); },
  },
  do: doTach,

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
    // Mỗi hàng vạch đo cao khoảng 36px, máy thấp thì ảnh nhường chỗ để thanh trượt không nằm dưới nút Chạy.
    san.style.setProperty('--chua', `${350 + 36 * Math.ceil((man.dongHo || []).length / 2)}px`);
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
        veLenData(a, m, img.data, true, ctx.cu === 'giu');
        c.putImageData(img, 0, 0);
      });
    };

    // Phần sót li ti trên nền ca rô rất khó thấy bằng mắt, nên vạch đo báo còn bao nhiêu sau mỗi thao tác.
    let dh = null;
    const capDo = (vuaLam) => {
      const du = dh.capNhat(doTach(ctx.st, man));
      if (vuaLam) ctx.hit(du ? 'du' : '');
    };

    const veKhay = () => {
      const st = ctx.st;
      khay.innerHTML = '';
      dh = dongHo(khay, man.dongHo || []);
      capDo(false);
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
        capDo(true);
        ctx.doi();
        return null;
      }
      net = { k: 'co', giu: ctx.cu === 'giu', r: st.r, bam: true, pts: [[x, y]] };
      let tay = null;
      // Chèn điểm giữa để nét không đứt khi ngón tay lướt nhanh.
      const noiDen = (nx, ny) => {
        const cuoi = net.pts[net.pts.length - 1];
        const buoc = Math.max(1, Math.floor(Math.hypot(nx - cuoi[0], ny - cuoi[1]) / 2));
        for (let i = 1; i <= buoc; i++) net.pts.push([Math.round(cuoi[0] + ((nx - cuoi[0]) * i) / buoc), Math.round(cuoi[1] + ((ny - cuoi[1]) * i) / buoc)]);
      };
      ve();
      return {
        di(p) {
          const cuoi = net.pts[net.pts.length - 1];
          // Làm mượt nét cho đỡ run tay, như chế độ ổn định nét của các app vẽ.
          tay = p;
          noiDen(Math.round(cuoi[0] + (p.x - cuoi[0]) * 0.6), Math.round(cuoi[1] + (p.y - cuoi[1]) * 0.6));
          ve();
        },
        nha() {
          if (tay) noiDen(Math.round(tay.x), Math.round(tay.y));
          ctx.ghi();
          st.thao.push(net);
          net = null;
          ve();
          capDo(true);
          ctx.doi();
        },
      };
    });

    dungBoCu(ctx, [
      { id: 'dua', nhan: 'Đũa thần', ic: 'dua' },
      man.co !== false && { id: 'xoa', nhan: 'Cọ xóa', ic: 'gom' },
      man.co !== false && { id: 'giu', nhan: 'Cọ giữ', ic: 'giu' },
    ], 'dua', () => { veKhay(); ve(); });
    ve();
    veKhay();
  },
};
