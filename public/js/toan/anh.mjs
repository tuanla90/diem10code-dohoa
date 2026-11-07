// Ảnh điểm dựng bằng mã để game tự chứa và máy kiểm chấm được trên đúng số điểm ảnh.
// Mọi hàm thuần, chạy được trên Node. Màu ảnh chụp chỉ nằm ở tệp này.
import { MAU, ROBOT } from '../hinh.mjs';

function ngauNhien(hat) {
  let s = hat >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function taoAnh(w, h) {
  return { w, h, data: new Uint8ClampedArray(w * h * 4).fill(255) };
}

function chamDiem(a, x, y, c, nhieu, r) {
  if (x < 0 || y < 0 || x >= a.w || y >= a.h) return;
  const k = (y * a.w + x) * 4;
  const n = nhieu ? (r() - 0.5) * 2 * nhieu : 0;
  a.data[k] = c[0] + n;
  a.data[k + 1] = c[1] + n;
  a.data[k + 2] = c[2] + n;
  a.data[k + 3] = 255;
}

function chuNhat(a, x, y, w, h, c, nhieu = 0, r = Math.random) {
  for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) chamDiem(a, i, j, c, nhieu, r);
}

function hinhTron(a, cx, cy, rr, c, nhieu = 0, r = Math.random) {
  for (let j = cy - rr; j <= cy + rr; j++) {
    for (let i = cx - rr; i <= cx + rr; i++) {
      if ((i - cx) ** 2 + (j - cy) ** 2 <= rr * rr) chamDiem(a, i, j, c, nhieu, r);
    }
  }
}

export function doSang(d, k) {
  return 0.299 * d[k] + 0.587 * d[k + 1] + 0.114 * d[k + 2];
}

/* ---------- Ảnh hội trường chụp thiếu sáng (U11-10) ---------- */
export function anhHoiTruong(w = 240, h = 150) {
  const a = taoAnh(w, h), r = ngauNhien(11);
  chuNhat(a, 0, 0, w, h, [44, 42, 62], 5, r); // tường tối
  chuNhat(a, 0, 104, w, 46, [32, 30, 44], 5, r); // sàn
  chuNhat(a, 10, 8, 26, 34, [170, 172, 180], 4, r); // cửa sổ sáng
  chuNhat(a, 204, 8, 26, 34, [165, 168, 176], 4, r);
  chuNhat(a, 60, 18, 120, 52, [62, 46, 112], 4, r); // phông sân khấu
  chuNhat(a, 78, 30, 84, 12, [118, 96, 164], 3, r); // chữ trên phông
  chuNhat(a, 92, 48, 56, 8, [104, 88, 148], 3, r);
  chuNhat(a, 40, 70, 160, 12, [76, 58, 44], 3, r); // bục
  for (let i = 0; i < 12; i++) {
    const x = 12 + i * 19 + Math.round(r() * 6), y = 92 + Math.round(r() * 10);
    hinhTron(a, x, y, 8, [84 + Math.round(r() * 24), 66, 58], 3, r); // đầu người
    chuNhat(a, x - 9, y + 8, 18, 30, [38 + Math.round(r() * 26), 40, 72], 3, r); // áo
  }
  return a;
}

/* ---------- Ảnh đội rô bốt: bản gốc tối và bản đã cháy sáng (U11-10) ---------- */
// ao ghi chỉ số điểm ảnh vải áo và nếp gấp, để đo trên điểm ảnh thật xem nếp áo còn hay đã mất.
export function anhDoiRobot(w = 240, h = 150) {
  const a = taoAnh(w, h), r = ngauNhien(29);
  a.ao = { vai: [], nep: [] };
  chuNhat(a, 0, 0, w, h, [52, 50, 70], 4, r); // tường hội trường
  chuNhat(a, 0, 112, w, 38, [36, 34, 50], 4, r); // sàn
  chuNhat(a, 44, 10, 152, 34, [74, 58, 124], 3, r); // phông Ngày hội
  chuNhat(a, 66, 22, 108, 10, [120, 104, 170], 3, r);
  for (let i = 0; i < 5; i++) {
    const x = 28 + i * 46, y = 58 + (i % 2) * 8;
    hinhTron(a, x, y, 11, [118, 90, 76], 3, r); // mặt
    hinhTron(a, x, y - 7, 8, [30, 26, 34], 2, r); // tóc
    for (let j = y + 12; j < y + 58 && j < h; j++) {
      // Vai thuôn từ cổ ra, để áo không thành tấm bìa chữ nhật.
      const vai = Math.min(16, 7 + Math.floor((j - y - 12) * 1.5));
      for (let k = x - vai; k <= x + vai; k++) {
        const laNep = [5, 6, 13, 14, 24, 25].includes(k - x + 16); // cách không đều, để giống nếp vải chứ không thành áo sọc
        chamDiem(a, k, j, laNep ? [146, 146, 156] : [186, 186, 192], 2, r);
        (laNep ? a.ao.nep : a.ao.vai).push((j * w + k) * 4);
      }
    }
  }
  return a;
}

// Bản đã kéo sáng hết cỡ rồi lưu đè: mọi điểm vải và nếp cùng thành 255, không thang chỉnh nào tách lại được.
export function anhDoiChay() {
  const a = anhDoiRobot();
  for (let k = 0; k < a.data.length; k++) if (k % 4 !== 3) a.data[k] = Math.min(255, a.data[k] * 1.9 + 24);
  return a;
}

// Nếp áo còn thấy rõ bao nhiêu sau khi chỉnh: chênh mức sáng giữa vải và nếp gấp.
export function doNep(a, sang, tuongPhan) {
  const lut = bangChinh(sang, tuongPhan);
  const tb = (ds) => ds.reduce((t, k) => t + lut[a.data[k]], 0) / ds.length;
  return tb(a.ao.vai) - tb(a.ao.nep);
}

// Thang chỉnh ảnh: Sáng đổi vùng trung tính (giữ được hai đầu), Tương phản giãn quanh giữa.
export function bangChinh(sang, tuongPhan) {
  const lut = new Uint8ClampedArray(256);
  const gamma = Math.pow(2, -sang / 50);
  const c = 1 + tuongPhan / 100;
  for (let v = 0; v < 256; v++) {
    const g = 255 * Math.pow(v / 255, gamma);
    lut[v] = Math.round((g - 128) * c + 128);
  }
  return lut;
}

export function apChinh(a, sang, tuongPhan, dich) {
  const lut = bangChinh(sang, tuongPhan);
  const d = a.data;
  for (let k = 0; k < d.length; k += 4) {
    dich[k] = lut[d[k]];
    dich[k + 1] = lut[d[k + 1]];
    dich[k + 2] = lut[d[k + 2]];
    dich[k + 3] = 255;
  }
  return dich;
}

export function doAnh(a, sang, tuongPhan) {
  const dich = new Uint8ClampedArray(a.data.length);
  apChinh(a, sang, tuongPhan, dich);
  const cot = new Uint32Array(256);
  let tong = 0;
  const n = a.w * a.h;
  for (let k = 0; k < dich.length; k += 4) {
    const v = Math.round(doSang(dich, k));
    cot[v]++;
    tong += v;
  }
  let dem = 0, p5 = 0, p95 = 255, co5 = false, co95 = false;
  for (let v = 0; v < 256; v++) {
    dem += cot[v];
    if (!co5 && dem >= n * 0.05) { p5 = v; co5 = true; }
    if (!co95 && dem >= n * 0.95) { p95 = v; co95 = true; }
  }
  let chay = 0, chim = 0;
  for (let v = 250; v < 256; v++) chay += cot[v];
  for (let v = 0; v < 6; v++) chim += cot[v];
  return { tb: tong / n, gian: p95 - p5, chay: chay / n, chim: chim / n, cot };
}

/* ---------- Ảnh rô bốt để tách nền (U11-11) ---------- */
// that[i] = 1 ở điểm thuộc rô bốt. Dùng để chấm, người chơi không thấy.
const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
export const MAU_THIEU = rgb(MAU.hong); // phần rô bốt lỡ xóa khi cầm Cọ giữ, như mặt nạ hồng của app xóa nền
const THEP = [180, 182, 188], DINH = [70, 72, 90]; // tay thép nhạt hơn tường thép một chút: mắt thấy nhưng đũa thần ngưỡng 25 vẫn loang qua

// Vẽ đúng rô bốt của robot() ở hinh.mjs, cùng số đo và màu, hai tay tì lên bánh xích. (ox, oy, s) đặt khung 120x150 lên ảnh.
function veRobotAnh(a, that, ox, oy, s, r, { thepTay = false, nhieu = 3 } = {}) {
  const R = ROBOT;
  const to = (x0, y0, x1, y1, trong, c, n = nhieu) => {
    for (let j = Math.max(0, Math.floor(oy + y0 * s)); j <= Math.min(a.h - 1, Math.ceil(oy + y1 * s)); j++) {
      for (let i = Math.max(0, Math.floor(ox + x0 * s)); i <= Math.min(a.w - 1, Math.ceil(ox + x1 * s)); i++) {
        if (!trong((i + 0.5 - ox) / s, (j + 0.5 - oy) / s)) continue;
        chamDiem(a, i, j, c, n, r);
        if (that) that[j * a.w + i] = 1;
      }
    }
  };
  const tron = (cx, cy, rr, c, n) => to(cx - rr, cy - rr, cx + rr, cy + rr, (x, y) => (x - cx) ** 2 + (y - cy) ** 2 <= rr * rr, c, n);
  const hop = (h, c, n, gian = 0) => {
    const x0 = h.x - gian, y0 = h.y - gian, x1 = h.x + h.w + gian, y1 = h.y + h.h + gian, rr = (h.r || 0) + gian;
    to(x0, y0, x1, y1, (x, y) => {
      const dx = Math.max(x0 + rr - x, 0, x - (x1 - rr)), dy = Math.max(y0 + rr - y, 0, y - (y1 - rr));
      return dx * dx + dy * dy <= rr * rr;
    }, c, n);
  };
  const net = ([x1, y1], [x2, y2], rong, c, n) => {
    const nua = rong / 2, dai2 = (x2 - x1) ** 2 + (y2 - y1) ** 2;
    to(Math.min(x1, x2) - nua, Math.min(y1, y2) - nua, Math.max(x1, x2) + nua, Math.max(y1, y2) + nua, (x, y) => {
      const t = Math.max(0, Math.min(1, ((x - x1) * (x2 - x1) + (y - y1) * (y2 - y1)) / dai2));
      return (x - x1 - t * (x2 - x1)) ** 2 + (y - y1 - t * (y2 - y1)) ** 2 <= nua * nua;
    }, c, n);
  };
  const muc = rgb(MAU.muc), cyan = rgb(MAU.cyan), vo = rgb(MAU.vo);
  const hopVien = (h, c, vien) => { hop(h, muc, nhieu, vien / 2); hop(h, c, nhieu, -vien / 2); };
  const duong = (d, rong, c, n) => { for (let i = 0; i + 1 < d.length; i++) net(d[i], d[i + 1], rong, c, n); };
  const chamVien = ([x, y], rr, c) => { tron(x, y, rr + R.vienChi / 2, muc); tron(x, y, rr - R.vienChi / 2, c, 1); };
  for (const c of R.chan) {
    hopVien(c, rgb(MAU.banh), R.vienChi);
    for (const y of R.gach) net([c.x + 5, y], [c.x + c.w - 5, y], 2.4, rgb(MAU.banhGach), 1);
  }
  for (const d of R.hong) {
    duong(d, R.tay, thepTay ? THEP : muc);
    if (thepTay) {
      // Hai hàng đinh tán dọc mép tay máy: tay trùng màu tường thì đinh vẫn cho thấy tay nằm đâu, kể cả sau khi lỡ xóa.
      for (let k = 0; k + 1 < d.length; k++) {
        const p = d[k], q = d[k + 1], dai = Math.hypot(q[0] - p[0], q[1] - p[1]), nx = (q[1] - p[1]) / dai, ny = (p[0] - q[0]) / dai;
        for (let t = 5; t < dai; t += 5) {
          const x = p[0] + ((q[0] - p[0]) * t) / dai, y = p[1] + ((q[1] - p[1]) * t) / dai;
          for (const b of [-1, 1]) tron(x + b * nx * 2.8, y + b * ny * 2.8, 0.8, DINH, 0);
        }
      }
    } else duong(d, R.tay * 0.42, vo, 1);
    chamVien(d[2], R.banTay, cyan);
  }
  hopVien(R.than, rgb(MAU.voToi), R.vien);
  hop(R.thanSang, vo, 2);
  tron(R.nguc.x, R.nguc.y, R.nguc.r + 1, muc);
  tron(R.nguc.x, R.nguc.y, R.nguc.r - 1, rgb(MAU.chan), 1);
  tron(R.tim.x, R.tim.y, R.tim.r, cyan, 1);
  net([R.anTen.x, R.anTen.y1], [R.anTen.x, R.anTen.y2], R.anTen.day, muc);
  tron(R.anTen.x, R.anTen.yCham, R.anTen.r + 1, muc);
  tron(R.anTen.x, R.anTen.yCham, R.anTen.r - 1, cyan, 1);
  for (const t of R.tai) hop(t, muc);
  hopVien(R.dau, rgb(MAU.voToi), R.vien);
  hop(R.dauSang, vo, 2);
  for (const d of R.ghep) duong(d, 2.4, rgb(MAU.voGhep), 1);
  hopVien(R.kinh, rgb(MAU.kinhToi), 2.5);
  hop(R.kinhSang, rgb(MAU.kinhSang), 1);
  for (const m of R.mat) hop(m, cyan, 0);
  for (const m of R.matSang) hop(m, rgb(MAU.matSang), 0);
}

// Rô bốt trong ảnh 180x180. Khe tay là ô nền bị tay, thân và bánh xích bao kín, đủ to để chạm bằng ngón tay.
export const KHUNG_ANH = { ox: 12, oy: 3, s: 1.3 };
const raAnh = ([x, y]) => [Math.round(KHUNG_ANH.ox + x * KHUNG_ANH.s), Math.round(KHUNG_ANH.oy + y * KHUNG_ANH.s)];
export const TAY_ANH = ROBOT.hong.map((d) => d.map(raAnh));
export const KHE_TAY = [[25, 95], [95, 95]].map(raAnh);

export function anhRobot(kieu) {
  const w = 180, h = 180, a = taoAnh(w, h), that = new Uint8Array(w * h), r = ngauNhien(kieu === 1 ? 21 : 37);
  if (kieu === 1) {
    // Nền bừa bộn: ba mảng màu, có nhiễu. Thảm sẫm gần màu bánh xích nên ngưỡng quá cao sẽ ăn mất bánh.
    chuNhat(a, 0, 0, w, 150, [236, 226, 204], 6, r); // tường kem
    chuNhat(a, 150, 0, 30, 40, [146, 206, 176], 6, r); // bảng xanh, chừa lối tường liền mạch giữa bảng và đầu rô bốt
    chuNhat(a, 0, 150, w, 30, [62, 58, 104], 6, r); // thảm sẫm
    chuNhat(a, 0, 40, 16, 34, [146, 206, 176], 6, r); // bảng xanh nhỏ, chừa lối tường liền mạch quanh đầu rô bốt
    veRobotAnh(a, that, KHUNG_ANH.ox, KHUNG_ANH.oy, KHUNG_ANH.s, r);
  } else {
    // Tường thép gần trùng màu tay máy: đũa thần ăn mất tay, phải dùng cọ giữ lại.
    chuNhat(a, 0, 0, w, h, [172, 174, 180], 5, r);
    chuNhat(a, 0, 150, w, 30, [150, 152, 160], 5, r);
    veRobotAnh(a, that, KHUNG_ANH.ox, KHUNG_ANH.oy, KHUNG_ANH.s, r, { thepTay: true });
  }
  return { ...a, that };
}

const kc = (d, k, c) => Math.sqrt((d[k] - c[0]) ** 2 + (d[k + 1] - c[1]) ** 2 + (d[k + 2] - c[2]) ** 2);

// Đũa thần: loang 4 hướng từ điểm bấm, lấy mọi điểm gần màu gốc. dich[i]=1 là điểm bị xóa.
export function duaThan(a, x, y, nguong, dich) {
  const { w, h, data } = a;
  const seed = [0, 0, 0];
  let dem = 0;
  for (let j = -1; j <= 1; j++) {
    for (let i = -1; i <= 1; i++) {
      const xx = x + i, yy = y + j;
      if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
      const k = (yy * w + xx) * 4;
      seed[0] += data[k]; seed[1] += data[k + 1]; seed[2] += data[k + 2];
      dem++;
    }
  }
  seed[0] /= dem; seed[1] /= dem; seed[2] /= dem;
  const da = new Uint8Array(w * h);
  const ngan = [y * w + x];
  da[ngan[0]] = 1;
  while (ngan.length) {
    const i = ngan.pop();
    dich[i] = 1;
    const px = i % w, py = (i - px) / w;
    for (const [nx, ny] of [[px + 1, py], [px - 1, py], [px, py + 1], [px, py - 1]]) {
      if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
      const q = ny * w + nx;
      if (da[q]) continue;
      if (kc(data, q * 4, seed) <= nguong) {
        da[q] = 1;
        ngan.push(q);
      }
    }
  }
}

// Trong tầm r quanh (x, y) có điểm thuộc phía muon (1 là rô bốt, 0 là nền) không.
function coPhiaGan(a, x, y, r, muon) {
  const { w, h, that } = a;
  for (let j = Math.max(0, Math.floor(y - r)); j <= Math.min(h - 1, Math.ceil(y + r)); j++) {
    for (let i = Math.max(0, Math.floor(x - r)); i <= Math.min(w - 1, Math.ceil(x + r)); i++) {
      if ((i - x) ** 2 + (j - y) ** 2 <= r * r && !!that[j * w + i] === !!muon) return true;
    }
  }
  return false;
}

// bamMep: cọ bám mép. Tâm cọ nằm bên nào thì chỉ tô bên đó, lem một chút qua mép rô bốt không tính.
// Ngón tay che mất chỗ đang tô nên cọ nghiêng về việc của nó: cọ giữ tìm rô bốt, cọ xóa tìm nền, nếu có ngay gần tâm.
export function toCo(a, x, y, r, giaTri, dich, bamMep = false) {
  const { w, h } = a;
  let tamThat = bamMep && a.that ? a.that[Math.round(y) * w + Math.round(x)] : null;
  if (tamThat !== null) {
    const muon = giaTri === 0 ? 1 : 0;
    if (!!tamThat !== !!muon && coPhiaGan(a, x, y, giaTri === 0 ? r : r * 0.7, muon)) tamThat = muon;
  }
  if (giaTri === 0 && tamThat !== null && !tamThat) return; // Cọ giữ đi ngoài tầm rô bốt thì thôi, không trả lại nền đã xóa.
  for (let j = Math.max(0, Math.floor(y - r)); j <= Math.min(h - 1, Math.ceil(y + r)); j++) {
    for (let i = Math.max(0, Math.floor(x - r)); i <= Math.min(w - 1, Math.ceil(x + r)); i++) {
      if ((i - x) ** 2 + (j - y) ** 2 > r * r) continue;
      if (bamMep && a.that && !!a.that[j * w + i] !== !!tamThat) continue;
      dich[j * w + i] = giaTri;
    }
  }
}

/* ---------- Ảnh sân trường cho poster có chữ (U11-12) ---------- */
export function anhSanTruong(w = 240, h = 135) {
  const a = taoAnh(w, h), r = ngauNhien(61);
  for (let j = 0; j < 48; j++) {
    const v = 232 - j / 2;
    chuNhat(a, 0, j, w, 1, [v - 10, v, 255], 2, r); // trời sáng
  }
  for (let i = 0; i < 6; i++) hinhTron(a, 20 + i * 42, 16 + (i % 2) * 10, 7 + (i % 3) * 2, [255, 255, 255], 0, r); // mây
  chuNhat(a, 0, 48, w, 40, [214, 170, 120], 8, r); // dãy nhà
  for (let i = 0; i < 12; i++) chuNhat(a, 8 + i * 20, 54, 10, 12, i % 2 ? [90, 120, 170] : [240, 240, 235], 4, r);
  chuNhat(a, 0, 88, w, 47, [40, 44, 74], 8, r); // bóng cây và đám đông
  for (let i = 0; i < 16; i++) {
    hinhTron(a, 8 + i * 15, 92 + (i % 3) * 3, 6, i % 2 ? [226, 180, 150] : [120, 90, 80], 2, r); // đầu người
  }
  veRobotAnh(a, null, 94.8, 42, 0.42, r, { nhieu: 2 }); // rô bốt giữa ảnh
  return a;
}

function tuyenTinh(v) {
  const c = v / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}
export function doChoi(r, g, b) {
  return 0.2126 * tuyenTinh(r) + 0.7152 * tuyenTinh(g) + 0.0722 * tuyenTinh(b);
}
export const tuongPhanWcag = (l1, l2) => (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
