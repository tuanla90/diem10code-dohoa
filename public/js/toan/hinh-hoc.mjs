// Hình học thuần: tay nắm biến đổi, đường cong, phép ghép hình. Không đụng DOM.
export const kep = (v, a, b) => Math.min(b, Math.max(a, v));
export const giong = (o) => JSON.parse(JSON.stringify(o));

export function xoay(x, y, doGoc) {
  const r = (doGoc * Math.PI) / 180, c = Math.cos(r), s = Math.sin(r);
  return { x: x * c - y * s, y: x * s + y * c };
}

// Kéo một tay nắm của khung có tâm, cỡ, góc xoay. tay = {sx,sy} thuộc -1,0,1.
// Góc đối diện đứng yên, đúng như phần mềm thật. khoa = giữ nguyên tỉ lệ hiện tại.
export function keoTay(v0, tay, px, py, khoa, nhoNhat = 14) {
  const { sx, sy } = tay;
  const neo = xoay((-sx * v0.w) / 2, (-sy * v0.h) / 2, v0.goc);
  const ax = v0.x + neo.x, ay = v0.y + neo.y;
  const d = xoay(px - ax, py - ay, -v0.goc);
  let w = sx ? Math.max(nhoNhat, d.x * sx) : v0.w;
  let h = sy ? Math.max(nhoNhat, d.y * sy) : v0.h;
  if (khoa && sx && sy) {
    const k = Math.max(w / v0.w, h / v0.h);
    w = v0.w * k;
    h = v0.h * k;
  }
  const tam = xoay((sx * w) / 2, (sy * h) / 2, v0.goc);
  return { ...v0, w, h, x: ax + tam.x, y: ay + tam.y };
}

// Đổi cỡ về đúng w,h mà góc neo của lần kéo vẫn đứng yên.
export function datCoTheoNeo(v0, tay, w, h) {
  const { sx, sy } = tay;
  const neo = xoay((-sx * v0.w) / 2, (-sy * v0.h) / 2, v0.goc);
  const tam = xoay((sx * w) / 2, (sy * h) / 2, v0.goc);
  return { ...v0, w, h, x: v0.x + neo.x + tam.x, y: v0.y + neo.y + tam.y };
}

export function gocChuan(g) {
  let a = g % 360;
  if (a > 180) a -= 360;
  if (a <= -180) a += 360;
  return a;
}

export function gocKhung(v) {
  return [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([a, b]) => {
    const p = xoay((a * v.w) / 2, (b * v.h) / 2, v.goc);
    return { x: v.x + p.x, y: v.y + p.y };
  });
}

/* ---------- Đường cong khép kín theo nút ---------- */
// Nút: {x,y,tron,v:[dx,dy],r:[dx,dy]}. v là tay vào, r là tay ra, dùng khi nút trơn.
export function doanCong(nut) {
  const ds = [];
  for (let i = 0; i < nut.length; i++) {
    const a = nut[i], b = nut[(i + 1) % nut.length];
    ds.push([
      { x: a.x, y: a.y },
      a.tron ? { x: a.x + a.r[0], y: a.y + a.r[1] } : { x: a.x, y: a.y },
      b.tron ? { x: b.x + b.v[0], y: b.y + b.v[1] } : { x: b.x, y: b.y },
      { x: b.x, y: b.y },
    ]);
  }
  return ds;
}

export function diemBezier([p0, p1, p2, p3], t) {
  const u = 1 - t;
  const a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t;
  return { x: a * p0.x + b * p1.x + c * p2.x + d * p3.x, y: a * p0.y + b * p1.y + c * p2.y + d * p3.y };
}

export function layMau(nut, moiDoan = 24) {
  const m = [];
  for (const d of doanCong(nut)) for (let k = 0; k < moiDoan; k++) m.push(diemBezier(d, k / moiDoan));
  return m;
}

export function duongSvg(nut) {
  const ds = doanCong(nut);
  let s = `M${ds[0][0].x} ${ds[0][0].y}`;
  for (const d of ds) s += `C${d[1].x} ${d[1].y} ${d[2].x} ${d[2].y} ${d[3].x} ${d[3].y}`;
  return s + 'Z';
}

function ganNhat(p, mau) {
  let b = Infinity;
  for (const q of mau) {
    const d = (p.x - q.x) ** 2 + (p.y - q.y) ** 2;
    if (d < b) b = d;
  }
  return Math.sqrt(b);
}

// Khoảng lệch Hausdorff hai chiều giữa hai đường, đơn vị sân khấu.
export function doLech(nutA, nutB) {
  const a = layMau(nutA), b = layMau(nutB);
  let m = 0;
  for (const p of a) m = Math.max(m, ganNhat(p, b));
  for (const p of b) m = Math.max(m, ganNhat(p, a));
  return m;
}

// Chèn nút vào giữa đoạn i, giữ nguyên hình (de Casteljau).
export function chenNut(nut, i) {
  const ds = doanCong(nut);
  const [p0, p1, p2, p3] = ds[i];
  const tb = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
  const q0 = tb(p0, p1), q1 = tb(p1, p2), q2 = tb(p2, p3), r0 = tb(q0, q1), r1 = tb(q1, q2), m = tb(r0, r1);
  const a = nut[i], b = nut[(i + 1) % nut.length];
  const conThang = !a.tron && !b.tron;
  const moi = conThang ? { x: m.x, y: m.y, tron: false } : { x: m.x, y: m.y, tron: true, v: [r0.x - m.x, r0.y - m.y], r: [r1.x - m.x, r1.y - m.y] };
  if (a.tron) a.r = [q0.x - a.x, q0.y - a.y];
  if (b.tron) b.v = [q2.x - b.x, q2.y - b.y];
  nut.splice(i + 1, 0, moi);
}

// Bật nút trơn: tay nắm thẳng hàng với hai nút hai bên, dài bằng 1/4 khoảng cách.
export function batTron(nut, i) {
  const n = nut.length, a = nut[(i - 1 + n) % n], b = nut[(i + 1) % n], c = nut[i];
  const dx = b.x - a.x, dy = b.y - a.y;
  c.tron = true;
  c.r = [dx / 4, dy / 4];
  c.v = [-dx / 4, -dy / 4];
}

/* ---------- Ghép hình trên lưới điểm ---------- */
export function trongHinh(h, x, y) {
  if (h.loai === 'tron') return (x - h.x) ** 2 + (y - h.y) ** 2 <= h.r * h.r;
  if (h.loai === 'vuong') return Math.abs(x - h.x) <= h.w / 2 && Math.abs(y - h.y) <= h.h / 2;
  if (h.loai === 'sao') {
    // Sao năm cánh: dùng thuật toán tia với đa giác đỉnh sao.
    let trong = false;
    const d = dinhSao(h);
    for (let i = 0, j = d.length - 1; i < d.length; j = i++) {
      const a = d[i], b = d[j];
      if (a.y > y !== b.y > y && x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x) trong = !trong;
    }
    return trong;
  }
  return false;
}

export function dinhSao(h) {
  const d = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const r = i % 2 ? h.r * 0.45 : h.r;
    d.push({ x: h.x + r * Math.cos(a), y: h.y + r * Math.sin(a) });
  }
  return d;
}

// Áp chuỗi phép lên lưới o đơn vị, trả về mảng 0/1.
export function lapMatNa(buoc, W, H, o = 3) {
  const cot = Math.ceil(W / o), hang = Math.ceil(H / o);
  const m = new Uint8Array(cot * hang);
  for (const b of buoc) {
    for (let j = 0; j < hang; j++) {
      for (let i = 0; i < cot; i++) {
        const t = trongHinh(b.hinh, (i + 0.5) * o, (j + 0.5) * o);
        const k = j * cot + i;
        if (b.phep === 'gop') m[k] = m[k] || t ? 1 : 0;
        else if (b.phep === 'khoet') m[k] = m[k] && !t ? 1 : 0;
        else if (b.phep === 'giao') m[k] = m[k] && t ? 1 : 0;
      }
    }
  }
  return { m, cot, hang, o };
}

export function tiLeTrung(a, b) {
  let hop = 0, giao = 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i] || b[i]) hop++;
    if (a[i] && b[i]) giao++;
  }
  return hop ? giao / hop : 1;
}
