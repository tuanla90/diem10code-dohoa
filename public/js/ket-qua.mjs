// Rạp hậu quả: bấm Chạy là thành phẩm hiện ra to, quét từ trên xuống như đang in. Kết quả nằm dưới, không che tranh.
import { saoCua, ghiDat, ghiLanChay, hoSoMan, xoaNhap, daDocTay, rungBat } from './kho.mjs';
import { xetHuyHieu } from './tien-trinh.mjs';
import { icon } from './icon.mjs';
import { phat } from './am-thanh.mjs';
import { monCua } from './the-gioi.mjs';
import { duongMat } from './bang-truot.mjs';
import { lamRieng } from './thanh-pham.mjs';

const CAU_DAT = {
  sola: ['Đúng ý mình luôn!', 'Sola nhảy cẫng lên rồi nè.', 'Ra được thế này thì yên tâm.'],
  luna: ['Gọn gàng lắm.', 'Luna ưng rồi đó.', 'Đúng cách, đúng việc.'],
};

const giamChuyenDong = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const tenAi = (ai) => (ai === 'sola' ? 'SOLA' : 'LUNA');

function rung(mau) {
  if (!rungBat()) return;
  try { navigator.vibrate?.(mau); } catch { /* máy không rung được */ }
}

function phaoGiay(host) {
  if (giamChuyenDong()) return;
  const mau = ['a', 'b', 'c', 'd'];
  let s = '';
  for (let i = 0; i < 34; i++) {
    const x = Math.round(Math.random() * 100);
    const tre = (Math.random() * 0.45).toFixed(2);
    const dai = (1.1 + Math.random() * 0.9).toFixed(2);
    const xoay = Math.round(Math.random() * 720 - 360);
    s += `<i class="phao phao--${mau[i % 4]}" style="left:${x}%;animation-delay:${tre}s;animation-duration:${dai}s;--xoay:${xoay}deg"></i>`;
  }
  host.insertAdjacentHTML('beforeend', `<div class="phao-lop" aria-hidden="true">${s}</div>`);
}

function hangThuong(man, dauTien, moi) {
  const hang = [];
  if (dauTien) {
    const mon = monCua(man.ma);
    if (mon) hang.push(`<li>${icon('banVe')}<span><b>${mon.ten}</b> đã có màu trên bản vẽ</span></li>`);
    const tayMoi = (man.soTay || []).filter((k) => !daDocTay(k)).length;
    if (tayMoi) hang.push(`<li>${icon('soTay')}<span><b>${tayMoi} mục</b> Sổ tay nên đọc lại cho chắc</span></li>`);
  }
  for (const h of moi) hang.push(`<li class="thuong-huy">${icon(h.ic)}<span>Huy hiệu mới: <b>${h.ten}</b></span></li>`);
  return hang.length ? `<ul class="ket-thuong">${hang.join('')}</ul>` : '';
}

// Trả về hàm dọn. khiDong gọi khi người chơi quay lại sửa, khiGoiY khi xin gợi ý từ màn sai.
export function moRap({ man, ket, st, soGoiY, soHong, tiepCua, khiDong, khiGoiY }) {
  const svg = lamRieng(man.canh(st, ket, ket.d, man));
  const lop = document.createElement('div');
  lop.className = 'rap';
  lop.setAttribute('role', 'dialog');
  lop.setAttribute('aria-modal', 'true');
  lop.setAttribute('aria-label', 'Kết quả màn chơi');
  lop.innerHTML = `<div class="rap-san"><div class="rap-tranh">${svg}<span class="rap-quet" aria-hidden="true"></span></div></div>
    <div class="rap-dang"><span class="rap-cham"></span>${man.chay}...</div>`;
  document.body.appendChild(lop);
  const henCho = setTimeout(hien, giamChuyenDong() ? 150 : 1250);
  const hen = [];

  function dong() {
    document.removeEventListener('keydown', phim);
    lop.remove();
    khiDong?.();
  }
  function phim(e) {
    if (!lop.isConnected) { document.removeEventListener('keydown', phim); return; }
    if (e.key === 'Escape' && lop.querySelector('.rap-bang') && !document.querySelector('.lop-phu')) dong();
  }
  document.addEventListener('keydown', phim);

  function hien() {
    lop.querySelector('.rap-dang')?.remove();
    const bang = document.createElement('div');
    bang.className = 'rap-bang';
    ghiLanChay(man.ma, ket.dat);
    if (ket.dat) hienDat(bang);
    else hienChua(bang);
    // Tranh đang giữa màn, bảng kết quả chui lên đẩy tranh đi: trượt mượt thay vì nhảy.
    const tranh = lop.querySelector('.rap-tranh');
    const truocTop = tranh.getBoundingClientRect().top;
    lop.appendChild(bang);
    const lech = truocTop - tranh.getBoundingClientRect().top;
    if (lech && !giamChuyenDong()) tranh.animate([{ transform: `translateY(${lech}px)` }, { transform: 'none' }], { duration: 340, easing: 'cubic-bezier(.2,.8,.25,1)' });
    bang.querySelector('[data-dong]')?.addEventListener('click', dong);
    bang.querySelector('.nut-chinh')?.focus({ preventScroll: true });
  }

  function hienDat(bang) {
    const truoc = saoCua(man.ma);
    const dauTien = ghiDat(man.ma, { sao: ket.sao, st: JSON.parse(JSON.stringify(st)), soGoiY });
    xoaNhap(man.ma);
    const moi = xetHuyHieu();
    const tiep = tiepCua();
    const ai = man.ai;
    const mat = ai === 'sola' ? 'celebrate-jump' : (ket.sao === 3 ? 'celebrate' : 'great-job');
    const hang = [1, 2, 3].map((i) => icon('sao', i <= ket.sao ? 'co' : '')).join('');
    const ds = ket.ds.filter((t) => t.sao);
    const ho = hoSoMan(man.ma);
    bang.innerHTML = `<div class="ket-dau"><img class="mat" src="${duongMat(ai, mat)}" alt="" width="68" height="78">
        <div class="ket-loi"><div class="ket-qua-nguoi">${tenAi(ai)}</div><h2>${CAU_DAT[ai][Math.max(0, ket.sao - 1)]}</h2></div>
        <div class="ket-sao" role="img" aria-label="${ket.sao} trên 3 sao">${hang}</div></div>
      ${truoc > ket.sao ? `<p class="nhan-phu ket-cu">Kỷ lục cũ ${truoc} sao vẫn được giữ.</p>` : ''}
      ${ds.length ? `<ul class="ket-ds">${ds.map((t) => `<li class="${t.dat ? 'dat' : 'chua'}">${icon(t.dat ? 'xong' : 'them')}<span>${t.ten}</span></li>`).join('')}</ul>` : ''}
      ${hangThuong(man, dauTien, moi)}
      ${(ho?.chay || 0) > 1 ? `<p class="nhan-phu ket-cu">Lần chạy thứ ${ho.chay}. Thử bao nhiêu lần cũng không mất gì.</p>` : ''}
      <div class="ket-nut"><button class="nut-phu" type="button" data-dong>${ket.sao === 3 ? 'Xem lại' : 'Làm đẹp hơn'}</button><a class="nut-chinh" href="${tiep.hash}">${tiep.nhan}${icon('tiep')}</a></div>`;
    phat('dung');
    rung([12, 40, 18]);
    for (let i = 1; i <= ket.sao; i++) hen.push(setTimeout(() => phat(`sao${i}`), giamChuyenDong() ? 0 : 150 + i * 150));
    if (moi.length) hen.push(setTimeout(() => phat('huyHieu'), 950));
    if (ket.sao === 3) hen.push(setTimeout(() => phaoGiay(lop), 300));
  }

  function hienChua(bang) {
    const loi = ket.loi;
    const ai = loi.ai || man.ai;
    const batBuoc = ket.ds.filter((t) => !t.sao);
    const dung = batBuoc.filter((t) => t.dat).length;
    const moiGoiY = soHong >= 2;
    bang.innerHTML = `<div class="ket-dau"><img class="mat" src="${duongMat(ai, loi.matLoi || 'confused')}" alt="" width="68" height="78">
        <div class="ket-loi"><div class="ket-qua-nguoi">${tenAi(ai)}</div><h2>Ủa, chưa ổn rồi</h2><p>${loi.loi}</p></div></div>
      <div class="ket-tien" role="img" aria-label="Đúng ${dung} trên ${batBuoc.length} yêu cầu">${batBuoc.map((t) => `<span class="${t.dat ? 'dung' : (t.id === loi.id ? 'vap' : '')}" title="${t.ten}"></span>`).join('')}</div>
      <p class="nhan-phu ket-tien-nhan">Đúng ${dung}/${batBuoc.length} yêu cầu. Đang vấp ở: <b>${loi.ten}</b>.</p>
      ${moiGoiY ? `<p class="ket-ngo"><img class="mat" src="${duongMat('luna', 'thinking')}" alt="" width="36" height="41"><span>Khó thật đó. Mở gợi ý không bị trừ sao đâu, bạn cứ hỏi Luna.</span></p>` : ''}
      <div class="ket-nut">${moiGoiY ? `<button class="nut-phu" type="button" data-goi-y>${icon('denGoiY')}Xin gợi ý</button>` : ''}<button class="nut-chinh" type="button" data-dong>Sửa tiếp</button></div>`;
    phat('sai');
    rung(30);
    bang.querySelector('[data-goi-y]')?.addEventListener('click', () => { dong(); khiGoiY?.(); });
  }

  return () => {
    clearTimeout(henCho);
    hen.forEach(clearTimeout);
    document.removeEventListener('keydown', phim);
    lop.remove();
  };
}
