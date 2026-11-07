// Kính soi: bật ở bảng tùy chọn, kéo kính đi trên logo, trong kính là đúng những điểm ảnh của tệp ở mật độ khi in.
// Soi một khoảng cố định trên bản in thật, nên logo càng to hoặc tệp càng ít điểm thì ô trong kính càng lớn.
import { MAU, logoLong, saoPath } from './hinh.mjs';

export const R_KINH = 46;
export const CM_KINH = 5;
const CO_GOC = 800; // Ảnh gốc để lấy mẫu, bằng tệp nhiều điểm nhất.
const NHIEU_NHAT = 70; // Trên số ô này thì mỗi ô nhỏ hơn điểm màn hình, vẽ mịn cũng là đúng.

// Số ô điểm ảnh nằm vừa ngang kính. 0 nghĩa là không thấy ô nào: vector, hoặc ô nhỏ hơn điểm màn hình.
export const soOKinh = (matDo) => {
  if (matDo === Infinity) return 0;
  const n = matDo * CM_KINH;
  return n > NHIEU_NHAT ? 0 : n;
};

// Logo dựng một lần bằng canvas, chữ đúng phông, để lấy màu từng điểm như đọc một tệp ảnh thật.
let goc = null;
function anhGoc() {
  if (goc) return goc;
  const c = document.createElement('canvas');
  c.width = c.height = CO_GOC;
  const x = c.getContext('2d', { willReadFrequently: true });
  x.scale(CO_GOC / 100, CO_GOC / 100);
  const gr = x.createLinearGradient(2, 2, 98, 98);
  gr.addColorStop(0, MAU.tim); gr.addColorStop(0.55, MAU.giua); gr.addColorStop(1, MAU.hong);
  x.fillStyle = gr;
  x.beginPath(); x.arc(50, 50, 48, 0, Math.PI * 2); x.fill();
  x.strokeStyle = MAU.trang; x.globalAlpha = 0.75; x.lineWidth = 3;
  x.beginPath(); x.arc(50, 50, 38, 0, Math.PI * 2); x.stroke();
  x.globalAlpha = 1;
  x.fillStyle = MAU.muc;
  x.beginPath(); x.roundRect(4, 54, 92, 24, 5); x.fill();
  x.fillStyle = MAU.vang;
  x.fill(new Path2D(saoPath(50, 33, 19)));
  x.fillStyle = MAU.trang;
  x.font = '800 15px "Google Sans Flex", system-ui, sans-serif';
  x.textAlign = 'center';
  x.fillText('TIN HỌC', 50, 71);
  goc = x.getImageData(0, 0, CO_GOC, CO_GOC).data;
  return goc;
}

// Các ô cùng màu nằm liền nhau gộp một hình cho nhẹ, vì kính vẽ lại theo từng nhịp ngón tay.
function veO(px, u, v, tiLe, cx, cy, rong) {
  const data = anhGoc();
  const o = 100 / px;
  const dau = (t) => Math.max(0, Math.floor((t - rong / 2) / o));
  const cuoi = (t) => Math.min(px - 1, Math.ceil((t + rong / 2) / o));
  const iDau = dau(u), iCuoi = cuoi(u);
  let s = '';
  for (let j = dau(v); j <= cuoi(v); j++) {
    const y = cy + (j * o - v) * tiLe;
    let tu = iDau, mau = null;
    for (let i = iDau; i <= iCuoi + 1; i++) {
      let m = null;
      if (i <= iCuoi) {
        const a = Math.floor((j + 0.5) * o * (CO_GOC / 100)), b = Math.floor((i + 0.5) * o * (CO_GOC / 100));
        const k = (a * CO_GOC + b) * 4;
        // Làm tròn màu một chút để dải chuyển màu gộp được.
        if (data[k + 3] > 127) m = `rgb(${data[k] & 248},${data[k + 1] & 248},${data[k + 2] & 248})`;
      }
      if (m !== mau) {
        if (mau) s += `<rect x="${(cx + (tu * o - u) * tiLe).toFixed(2)}" y="${y.toFixed(2)}" width="${((i - tu) * o * tiLe + 0.3).toFixed(2)}" height="${(o * tiLe + 0.3).toFixed(2)}" fill="${mau}"/>`;
        tu = i;
        mau = m;
      }
    }
  }
  return `<g shape-rendering="crispEdges">${s}</g>`;
}

// Kính nằm chéo lên trên điểm soi để ngón tay không che, sát mép sân thì tự lật.
function choDatKinh(fx, fy, W, H) {
  const lech = R_KINH + 26;
  const le = R_KINH + 5;
  const cx = fx + lech + le > W ? fx - lech : fx + lech;
  const cy = fy - 34 - le < 0 ? fy + 34 : fy - 34;
  return { cx: Math.min(Math.max(cx, le), W - le), cy: Math.min(Math.max(cy, le), H - le) };
}

// diem: chỗ đang soi, tính trên logo 100 x 100. v: vật trên sân. file: số điểm của tệp, Infinity nếu là vector.
export function veKinh({ diem, v, cmMoiDv, file, matDo, W, H }) {
  const fx = v.x - v.w / 2 + (diem.u / 100) * v.w;
  const fy = v.y - v.h / 2 + (diem.v / 100) * v.h;
  const { cx, cy } = choDatKinh(fx, fy, W, H);
  const cmIn = v.w * cmMoiDv;
  const rong = (CM_KINH / cmIn) * 100; // Độ rộng khung soi tính theo logo.
  const tiLe = (R_KINH * 2) / rong;
  const n = soOKinh(matDo);
  const trong = n
    ? veO(file, diem.u, diem.v, tiLe, cx, cy, rong)
    : `<g transform="translate(${cx} ${cy}) scale(${tiLe}) translate(${-diem.u} ${-diem.v})">${logoLong()}</g>`;
  const oSoi = Math.max(5, (CM_KINH / cmMoiDv) / 2);
  return `<g pointer-events="none">
    <path d="M${fx} ${fy}L${cx} ${cy}" stroke="${MAU.trang}" stroke-width="3.5"/><path d="M${fx} ${fy}L${cx} ${cy}" stroke="${MAU.hong}" stroke-width="1.5"/>
    <circle cx="${fx}" cy="${fy}" r="${oSoi}" fill="none" stroke="${MAU.trang}" stroke-width="3.5"/><circle cx="${fx}" cy="${fy}" r="${oSoi}" fill="none" stroke="${MAU.hong}" stroke-width="1.8"/>
    <clipPath id="cl-soi"><circle cx="${cx}" cy="${cy}" r="${R_KINH}"/></clipPath>
    <g clip-path="url(#cl-soi)"><circle cx="${cx}" cy="${cy}" r="${R_KINH}" fill="${MAU.ao}"/>${trong}</g>
    <circle cx="${cx}" cy="${cy}" r="${R_KINH + 1}" fill="none" stroke="${MAU.trang}" stroke-width="5"/>
    <circle cx="${cx}" cy="${cy}" r="${R_KINH + 2.5}" fill="none" stroke="${MAU.muc}" stroke-width="2"/>
  </g><circle data-h="kinh" cx="${cx}" cy="${cy}" r="${R_KINH}" fill="transparent"/>`;
}
