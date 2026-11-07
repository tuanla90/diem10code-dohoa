// Kết của game: rèm mở ra cả sân trường đủ màu, danh sách việc bạn đã làm, và giấy khen lưu được về máy.
import { TAT_CA_MAN } from '../man/index.mjs';
import { daQua, saoCua, tongSao, tenNguoi } from '../kho.mjs';
import { xongHet, tongSaoToiDa, danhHieu } from '../tien-trinh.mjs';
import { icon, hangSao } from '../icon.mjs';
import { phat } from '../am-thanh.mjs';
import { MAU, logoLong } from '../hinh.mjs';
import { banVe, MON } from '../the-gioi.mjs';
import { duongMat } from '../bang-truot.mjs';
import { thoat, baoNhanh } from './vo.mjs';

// Vẽ logo làm ảnh riêng để đưa lên giấy khen. Ảnh SVG rời không đọc được biến CSS nên tự khai màu và phông.
function anhLogo() {
  const noi = logoLong().replaceAll('var(--font)', 'sans-serif');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 100 100"><defs><linearGradient id="gr-logo" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${MAU.tim}"/><stop offset=".55" stop-color="${MAU.giua}"/><stop offset="1" stop-color="${MAU.hong}"/></linearGradient></defs>${noi}</svg>`;
  return new Promise((ok, loi) => {
    const a = new Image();
    a.onload = () => ok(a);
    a.onerror = loi;
    a.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  });
}

async function veGiayKhen() {
  const W = 1080, H = 1350;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const x = c.getContext('2d');
  const nen = x.createLinearGradient(0, 0, W, H);
  nen.addColorStop(0, MAU.muc); nen.addColorStop(1, MAU.ao);
  x.fillStyle = nen;
  x.fillRect(0, 0, W, H);
  // Khung chọn của phần mềm đồ họa: dấu hiệu của cả game.
  x.strokeStyle = MAU.hong;
  x.lineWidth = 4;
  x.setLineDash([18, 12]);
  x.strokeRect(70, 70, W - 140, H - 140);
  x.setLineDash([]);
  for (const [a, b] of [[70, 70], [W - 70, 70], [70, H - 70], [W - 70, H - 70]]) {
    x.fillStyle = MAU.trang;
    x.fillRect(a - 14, b - 14, 28, 28);
    x.strokeRect(a - 14, b - 14, 28, 28);
  }
  const phong = (dam, co) => `${dam} ${co}px "Google Sans Flex", system-ui, sans-serif`;
  try { await Promise.all([document.fonts.load(phong(800, 60)), document.fonts.load(phong(500, 40))]); } catch { /* phông mặc định cũng đọc được */ }
  try { x.drawImage(await anhLogo(), W / 2 - 130, 140, 260, 260); } catch { /* thiếu logo vẫn còn giấy khen */ }
  x.textAlign = 'center';
  const dong = (t, y, dam, co, mau) => { x.font = phong(dam, co); x.fillStyle = mau; x.fillText(t, W / 2, y); };
  dong('CLB TIN HỌC · THPT HOA PHƯỢNG', 470, 600, 32, MAU.xamNhat);
  dong('GIẤY KHEN', 570, 800, 88, MAU.vang);
  dong('Trao cho', 660, 500, 38, MAU.xamNhat);
  const ten = tenNguoi() || 'Thành viên CLB';
  dong(ten, 760, 800, ten.length > 12 ? 76 : 96, MAU.trang);
  dong(danhHieu().ten, 840, 600, 44, MAU.cyan);
  dong('Đã tự tay làm nên gương mặt của Ngày hội Tin học:', 950, 500, 34, MAU.xamNhat);
  dong('logo, băng rôn, cờ, huy hiệu, áo, poster và phim khai mạc.', 1000, 500, 34, MAU.xamNhat);
  dong(`${tongSao()} / ${tongSaoToiDa} sao`, 1120, 800, 64, MAU.vang);
  dong('Gương Mặt Ngày Hội · chuỗi game diem10code', 1215, 500, 28, MAU.xam);
  return c;
}

async function luuGiayKhen(nut) {
  nut.disabled = true;
  try {
    const c = await veGiayKhen();
    const tep = await new Promise((ok) => c.toBlob(ok, 'image/png'));
    const ten = 'giay-khen-ngay-hoi.png';
    const f = new File([tep], ten, { type: 'image/png' });
    if (navigator.canShare?.({ files: [f] })) {
      await navigator.share({ files: [f], title: 'Giấy khen Ngày hội Tin học' }).catch(() => {});
    } else {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(tep);
      a.download = ten;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      baoNhanh('Đã lưu giấy khen về máy.');
    }
  } catch {
    baoNhanh('Máy này chưa lưu được ảnh. Bạn chụp màn hình giúp nhé.');
  }
  nut.disabled = false;
}

export function trangKhaiMac(root) {
  if (!xongHet()) { location.hash = '#/'; return; }
  const sao = tongSao();
  const ten = thoat(tenNguoi() || 'bạn');
  root.innerHTML = `<main class="khai-mac">
    <section class="khai-mac-man">
      <div class="khai-mac-tranh">${banVe({ daXong: () => true, nhan: 'Sân trường trong ngày khai mạc' })}</div>
      <div class="rem rem--trai" aria-hidden="true"></div><div class="rem rem--phai" aria-hidden="true"></div>
    </section>
    <div class="khai-mac-than">
      <small class="xong-goi-nho">Sáng thứ Bảy · Sân trường THPT Hoa Phượng</small>
      <h1>Ngày hội khai mạc!</h1>
      <div class="khai-mac-noi">
        <img class="mat" src="${duongMat('sola', 'celebrate-jump')}" alt="Sola" width="84" height="96">
        <p class="bong-noi">Không còn ô vuông nào, không còn khung trắng nào. Cả trường đang đứng trước thứ do ${ten} làm ra đó!</p>
        <img class="mat" src="${duongMat('luna', 'celebrate')}" alt="Luna" width="84" height="96">
      </div>
      <div class="chip-sao chip-sao--to" aria-label="${sao} trên ${tongSaoToiDa} sao">${icon('sao')}${sao}/${tongSaoToiDa}</div>
      ${sao < tongSaoToiDa ? `<p class="nhan-phu nhan-phu--sang">Còn ${tongSaoToiDa - sao} sao chưa lấy. Làm đẹp hơn lúc nào cũng được.</p>` : '<p class="nhan-phu nhan-phu--sang">Trọn vẹn mọi ngôi sao. Danh hiệu cao nhất của CLB là của bạn.</p>'}
      <button class="nut-sang" type="button" id="nut-giay">${icon('tai')}Lưu giấy khen</button>
      <h2 class="muc-ten muc-ten--sang">Phần việc của ${ten}</h2>
      <ul class="danh-dau">${MON.filter((m) => daQua(m.ma)).map((m) => `<li><span>${m.ten}</span>${hangSao(saoCua(m.ma))}</li>`).join('')}</ul>
      <p class="nhan-phu nhan-phu--sang">${TAT_CA_MAN.length} màn, bám Tin 10 và Tin 11. Những gì bạn vừa làm là việc thật của người làm đồ họa.</p>
      <div class="ket-nut"><a class="nut-bo" href="#/tac-pham">Tủ tác phẩm</a><a class="nut-bo" href="#/">Về bản vẽ</a></div>
    </div>
  </main>`;
  root.querySelector('#nut-giay').addEventListener('click', (e) => luuGiayKhen(e.currentTarget));
  phat('toMau');
}
