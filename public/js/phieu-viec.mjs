// Phiếu việc trước mỗi màn: ai nhờ, việc gì, và nói thẳng cần gì để đạt 3 sao. Giấu tiêu chí đến cuối màn là không công bằng.
import { icon, hangSao } from './icon.mjs';
import { saoCua } from './kho.mjs';
import { SO_TAY } from './so-tay.mjs';
import { monCua } from './the-gioi.mjs';
import { duongMat, moSoTayMuc } from './bang-truot.mjs';

const tenAi = (ai) => (ai === 'sola' ? 'Sola' : 'Luna');

export function moPhieu(man, { nhanNut = 'Nhận việc', khiNhan, conDo = false } = {}) {
  const batBuoc = man.tieuChi.filter((t) => !t.sao);
  const them = man.tieuChi.filter((t) => t.sao);
  const mon = monCua(man.ma);
  const sao = saoCua(man.ma);
  const lop = document.createElement('div');
  lop.className = 'phieu-nen';
  lop.innerHTML = `<div class="phieu" role="dialog" aria-modal="true" aria-label="Phiếu việc: ${man.ten}">
    <div class="phieu-dau">
      <span class="nhan-so">${man.ma}</span>
      ${sao ? hangSao(sao) : ''}
      <span class="phieu-ai">${man.vai}</span>
    </div>
    <div class="phieu-nguoi">
      <img class="mat mat--lon" src="${duongMat(man.ai, man.mat)}" alt="${tenAi(man.ai)}" width="96" height="110">
      <p class="bong-noi bong-noi--trai">${man.nho}</p>
    </div>
    <h2 class="phieu-ten">${man.ten}</h2>
    <p class="phieu-muc">${icon('mucTieu')}<span>${man.muc}</span></p>
    <div class="phieu-rach" aria-hidden="true"></div>
    <div class="phieu-tc">
      <div class="phieu-tc-cot"><b>Bắt buộc</b>
        <ul>${batBuoc.map((t) => `<li>${icon('xong')}<span>${t.ten}</span></li>`).join('')}</ul>
      </div>
      ${them.length ? `<div class="phieu-tc-cot phieu-tc-cot--sao"><b>Thêm sao</b>
        <ul>${them.map((t) => `<li>${icon('sao', 'co')}<span>${t.ten}</span></li>`).join('')}</ul>
      </div>` : ''}
    </div>
    ${(man.soTay || []).length ? `<div class="phieu-so-tay">${(man.soTay || []).filter((k) => SO_TAY[k]).map((k) => `<button type="button" class="chip-so-tay" data-k="${k}">${icon('soTay')}${SO_TAY[k].ten}</button>`).join('')}</div>` : ''}
    ${mon ? `<p class="phieu-mon">${icon('banVe')}<span>Xong việc, <b>${mon.ten}</b> sẽ có màu trên bản vẽ.</span></p>` : ''}
    <button class="nut-chinh phieu-nhan" type="button" data-nhan>${conDo ? 'Làm tiếp' : nhanNut}${icon('tiep')}</button>
  </div>`;
  const dong = () => {
    document.removeEventListener('keydown', phim);
    lop.classList.add('phieu-nen--di');
    const xong = () => { lop.remove(); khiNhan?.(); };
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) xong();
    else setTimeout(xong, 170);
  };
  const phim = (e) => {
    if (!lop.isConnected) { document.removeEventListener('keydown', phim); return; }
    if (e.key === 'Escape' && !document.querySelector('.lop-phu')) dong();
  };
  document.addEventListener('keydown', phim);
  lop.querySelector('[data-nhan]').addEventListener('click', dong);
  lop.querySelectorAll('[data-k]').forEach((b) => b.addEventListener('click', () => moSoTayMuc(b.dataset.k)));
  document.body.appendChild(lop);
  lop.querySelector('[data-nhan]').focus({ preventScroll: true });
  return dong;
}
