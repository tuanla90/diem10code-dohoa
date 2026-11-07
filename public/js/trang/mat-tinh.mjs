// Mắt Thiết Kế: trò giải lao giữa các gói. Hai bản, chọn bản đúng, luôn có lý do. Sai không mất gì, chỉ cần nhìn kỹ hơn.
import { GOI } from '../man/index.mjs';
import { SO_TAY } from '../so-tay.mjs';
import { matTinhTot, ghiMatTinh } from '../kho.mjs';
import { xongGoi, xetHuyHieu, SO_CAU_MAT_TINH } from '../tien-trinh.mjs';
import { icon } from '../icon.mjs';
import { phat } from '../am-thanh.mjs';
import { duongMat, moSoTayMuc } from '../bang-truot.mjs';
import { lamRieng } from '../thanh-pham.mjs';
import { CAU } from './mat-tinh-cau.mjs';
import { baoNhanh } from './vo.mjs';

const tronLen = (ds) => {
  const a = [...ds];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const CAU_KET = (diem, tong) => {
  if (diem === tong) return { ai: 'luna', mat: 'celebrate', cau: 'Không sót câu nào. Mắt này đi soi bản in được rồi đó.' };
  if (diem >= tong * 0.6) return { ai: 'sola', mat: 'happy', cau: 'Khá lắm! Mấy câu vừa rồi đọc lý do một lần là nhớ.' };
  return { ai: 'luna', mat: 'thinking', cau: 'Chưa nhiều lắm, nhưng thử lại không mất gì. Lần sau bạn sẽ thấy lỗi nhanh hơn.' };
};

export function trangMatTinh(root) {
  // Chỉ hỏi những gì đã học: câu của gói nào mở khi đã xong gói đó.
  const kho = CAU.filter((c) => xongGoi(GOI[c.goi]));
  if (!kho.length) { location.hash = '#/'; return; }
  const ds = tronLen(kho).slice(0, SO_CAU_MAT_TINH);
  let i = 0;
  let diem = 0;

  const ve = () => {
    const c = ds[i];
    const dungTrai = Math.random() < 0.5;
    const the = (dung, nhan) => `<button class="the-chon" type="button" data-dung="${dung ? '1' : ''}" aria-label="Bản ${nhan}"><svg viewBox="0 0 240 130" aria-hidden="true">${lamRieng(dung ? c.dung() : c.sai())}</svg><span class="the-chon-nhan">${nhan}</span><span class="the-chon-dau"></span></button>`;
    root.innerHTML = `<main class="trang mat-tinh trang-vao">
      <header class="dau">
        <a class="nut-icon" href="#/" aria-label="Về bản vẽ">${icon('dong')}</a>
        <div class="vach-cau" role="img" aria-label="Câu ${i + 1} trên ${ds.length}">${ds.map((_, k) => `<i class="${k < i ? 'qua' : k === i ? 'dang' : ''}"></i>`).join('')}</div>
        <span class="chip-sao" aria-label="${diem} câu đúng">${icon('xong')}${diem}</span>
      </header>
      <h1 class="mat-tinh-hoi">${c.hoi}</h1>
      <div class="cap-the">${the(dungTrai, 'A')}${the(!dungTrai, 'B')}</div>
      <div class="mat-tinh-vi" id="vi" aria-live="polite"></div>
    </main>`;
    root.querySelectorAll('.the-chon').forEach((b) => b.addEventListener('click', () => chon(b, c)));
  };

  const chon = (b, c) => {
    const dung = !!b.dataset.dung;
    if (dung) { diem++; phat('dung'); } else phat('sai');
    root.querySelectorAll('.the-chon').forEach((n) => {
      n.disabled = true;
      const laDung = !!n.dataset.dung;
      n.classList.add(laDung ? 'the-chon--dung' : 'the-chon--sai');
      n.querySelector('.the-chon-dau').innerHTML = icon(laDung ? 'xong' : 'dong');
    });
    const cuoi = i === ds.length - 1;
    const vi = root.querySelector('#vi');
    vi.innerHTML = `<div class="mat-tinh-vi-than${dung ? ' dung' : ''}"><b>${dung ? 'Đúng rồi' : 'Chưa đúng'}</b><p>${c.vi}</p>
      ${SO_TAY[c.k] ? `<button class="chip-so-tay" type="button" data-k="${c.k}">${icon('soTay')}${SO_TAY[c.k].ten}</button>` : ''}</div>
      <button class="nut-chinh" type="button" id="nut-tiep">${cuoi ? 'Xem kết quả' : 'Câu tiếp'}${icon('tiep')}</button>`;
    vi.querySelector('[data-k]')?.addEventListener('click', () => moSoTayMuc(c.k));
    const nut = vi.querySelector('#nut-tiep');
    nut.addEventListener('click', () => {
      i++;
      if (i < ds.length) ve();
      else ket();
    });
    nut.focus({ preventScroll: true });
    root.querySelector('.chip-sao').lastChild.textContent = diem;
  };

  const ket = () => {
    const tot = matTinhTot();
    ghiMatTinh(diem);
    const k = CAU_KET(diem, ds.length);
    root.innerHTML = `<main class="trang mat-tinh mat-tinh-ket trang-vao">
      <img class="mat mat--to" src="${duongMat(k.ai, k.mat)}" alt="" width="150" height="172">
      <div class="so-to"><b>${diem}</b><span>/${ds.length}</span></div>
      <p class="mat-tinh-cau-ket">${k.cau}</p>
      <p class="nhan-phu">${diem > tot ? 'Kỷ lục mới của bạn.' : `Tốt nhất: ${tot}/${SO_CAU_MAT_TINH}`}${ds.length < SO_CAU_MAT_TINH ? ' Xong thêm gói sẽ có thêm câu.' : ''}</p>
      <div class="ket-nut"><a class="nut-phu" href="#/">Về bản vẽ</a><button class="nut-chinh" type="button" id="nut-lai">Chơi lượt mới</button></div>
    </main>`;
    root.querySelector('#nut-lai').addEventListener('click', () => trangMatTinh(root));
    const moi = xetHuyHieu();
    if (diem === ds.length) phat('huyHieu');
    moi.forEach((h) => baoNhanh(`Huy hiệu mới: <b>${h.ten}</b>`));
  };

  ve();
}
