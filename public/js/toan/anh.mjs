// Ảnh điểm dựng bằng mã để game tự chứa và máy kiểm chấm được trên đúng số điểm ảnh.
// Mọi hàm thuần, chạy được trên Node. Màu ảnh chụp chỉ nằm ở tệp này.
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
function veRobotAnh(a, that, m) {
  const tick = (x, y, w, h, c, r, n = 3) => {
    chuNhat(a, x, y, w, h, c, n, r);
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) that[j * a.w + i] = 1;
  };
  const r = ngauNhien(5);
  tick(74, 16, 32, 26, m.dau, r); // đầu
  tick(86, 6, 8, 10, m.dau, r); // ăng ten
  chuNhat(a, 80, 24, 7, 7, m.mat, 0, r);
  chuNhat(a, 93, 24, 7, 7, m.mat, 0, r);
  tick(66, 46, 48, 62, m.than, r); // thân
  chuNhat(a, 80, 60, 20, 16, m.tim, 2, r);
  tick(46, 50, 10, 58, m.tay, r); // tay trái, có khe bị bao kín với thân
  tick(46, 44, 20, 8, m.tay, r); // vai trái nối thân
  tick(46, 100, 20, 8, m.tay, r); // cổ tay chống hông, khép khe lại
  tick(124, 50, 10, 58, m.tay, r); // tay phải
  tick(114, 44, 20, 8, m.tay, r);
  tick(114, 100, 20, 8, m.tay, r);
  // Đinh tán trên tay máy: khi tay trùng màu tường, người chơi vẫn nhận ra chỗ tay nằm.
  if (m.dinh) {
    for (const x of [49, 127]) for (let y = 56; y < 100; y += 12) tick(x, y, 4, 4, m.dinh, r, 0);
  }
  tick(74, 108, 12, 44, m.chan, r); // chân
  tick(94, 108, 12, 44, m.chan, r);
  tick(68, 152, 20, 10, m.chan, r); // bàn chân, chừa khe để nền giữa hai chân thông ra ngoài
  tick(92, 152, 20, 10, m.chan, r);
}

export function anhRobot(kieu) {
  const w = 180, h = 180, a = taoAnh(w, h), that = new Uint8Array(w * h), r = ngauNhien(kieu === 1 ? 21 : 37);
  if (kieu === 1) {
    // Nền bừa bộn: ba mảng màu, có nhiễu. Khe giữa tay và thân là nền bị bao kín.
    chuNhat(a, 0, 0, w, 104, [236, 226, 204], 6, r); // tường kem
    chuNhat(a, 140, 0, 40, 86, [146, 206, 176], 6, r); // bảng xanh
    chuNhat(a, 0, 104, w, 76, [188, 158, 126], 6, r); // sàn gỗ
    chuNhat(a, 0, 70, 36, 34, [146, 206, 176], 6, r); // bảng xanh nhỏ
    veRobotAnh(a, that, { dau: [86, 96, 214], mat: [250, 250, 255], than: [60, 82, 196], tim: [52, 211, 238], tay: [242, 138, 40], chan: [150, 116, 90] });
  } else {
    // Tường thép gần trùng màu tay máy: đũa thần ăn mất tay, phải dùng cọ giữ lại.
    chuNhat(a, 0, 0, w, h, [172, 174, 180], 5, r);
    chuNhat(a, 0, 150, w, 30, [150, 152, 160], 5, r);
    veRobotAnh(a, that, { dau: [72, 62, 150], mat: [250, 250, 255], than: [56, 46, 128], tim: [244, 114, 182], tay: [168, 170, 176], dinh: [70, 72, 90], chan: [40, 36, 90] });
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

// bamMep: cọ bám mép. Tâm cọ nằm bên nào thì chỉ tô bên đó, lem một chút qua mép rô bốt không tính.
export function toCo(a, x, y, r, giaTri, dich, bamMep = false) {
  const { w, h } = a;
  const tamThat = bamMep && a.that ? a.that[Math.round(y) * w + Math.round(x)] : null;
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
  chuNhat(a, 104, 58, 32, 44, [80, 70, 200], 3, r); // rô bốt giữa ảnh
  chuNhat(a, 110, 44, 20, 16, [226, 232, 240], 2, r);
  chuNhat(a, 114, 49, 3, 3, [20, 20, 50], 0, r);
  chuNhat(a, 123, 49, 3, 3, [20, 20, 50], 0, r);
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
