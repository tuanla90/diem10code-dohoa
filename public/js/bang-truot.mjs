// Bảng trượt từ dưới lên: Sổ tay, Gợi ý, Xác nhận. Dùng chung một khuôn, Esc và chạm nền để đóng.
import { icon } from './icon.mjs';
import { SO_TAY } from './so-tay.mjs';
import { giaoDien, ghiDocTay, daDocTay } from './kho.mjs';
import { xetHuyHieu } from './tien-trinh.mjs';
import { phat } from './am-thanh.mjs';
import { baoNhanh } from './trang/vo.mjs';

const boDau = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();

export const duongMat = (ai, mat) => `mat/${giaoDien() === 'dark' ? 'toi/' : ''}${ai}/${mat}.png`;

export function moBang(noi, { nhan, khongDong = false, khiDong } = {}) {
  const lop = document.createElement('div');
  lop.className = 'lop-phu';
  lop.innerHTML = `<div class="tam" role="dialog" aria-modal="true" aria-label="${nhan}"><div class="tam-num"></div>${noi}</div>`;
  const dong = () => {
    document.removeEventListener('keydown', phim);
    lop.remove();
    khiDong?.();
  };
  const phim = (e) => {
    // Đổi trang gỡ bảng khỏi DOM mà không qua dong(), nên phải tự tháo bộ nghe ở đây.
    if (!lop.isConnected) { document.removeEventListener('keydown', phim); return; }
    if (e.key === 'Escape' && !khongDong) dong();
  };
  document.addEventListener('keydown', phim);
  if (!khongDong) lop.addEventListener('click', (e) => { if (e.target === lop) dong(); });
  document.body.appendChild(lop);
  lop.querySelectorAll('[data-dong]').forEach((n) => n.addEventListener('click', dong));
  lop.querySelector('button')?.focus({ preventScroll: true });
  return { lop, dong };
}

export function moSoTay(ghim) {
  const dsGhim = ghim.filter((k) => SO_TAY[k]);
  const conLai = Object.keys(SO_TAY).filter((k) => !dsGhim.includes(k));
  const mucGhim = (k) => `<div class="so-tay-muc so-tay-muc--ghim"><b>${SO_TAY[k].ten}</b><p>${SO_TAY[k].mo}</p></div>`;
  const mucThu = (k) => {
    const m = SO_TAY[k];
    const doc = daDocTay(k);
    return `<details class="muc-tay" data-k="${k}" data-tim="${boDau(m.ten + ' ' + m.mo)}">
      <summary><span class="muc-tay-ten">${m.ten}</span>${doc ? `<span class="muc-tay-doc">${icon('xong')}</span>` : ''}<span class="muc-tay-mui">${icon('tiep')}</span></summary>
      <p>${m.mo}</p>
    </details>`;
  };
  dsGhim.forEach(ghiDocTay);
  const b = moBang(`<div class="tam-dau"><h2>Sổ tay đồ họa</h2><button class="nut-icon" type="button" data-dong aria-label="Đóng">${icon('dong')}</button></div>
    ${dsGhim.length ? '<p class="muc-ten">Dùng cho màn này</p>' : ''}
    ${dsGhim.map(mucGhim).join('')}
    ${conLai.length ? `<p class="muc-ten muc-ten--xa">Tra nhanh mục khác</p>
      <label class="o-tim o-tim--nho">${icon('timKiem')}<span class="an-a11y">Lọc mục Sổ tay</span><input data-loc type="search" placeholder="Lọc nhanh thuật ngữ..." autocomplete="off"></label>
      <div class="ds-tay" data-ds-phu>${conLai.map(mucThu).join('')}</div>` : ''}`, { nhan: 'Sổ tay đồ họa' });
  b.lop.querySelectorAll('.muc-tay').forEach((d) => d.addEventListener('toggle', () => {
    if (!d.open) return;
    phat('lat');
    ghiDocTay(d.dataset.k);
    for (const h of xetHuyHieu()) { phat('huyHieu'); baoNhanh(`Huy hiệu mới: <b>${h.ten}</b>`); }
  }));
  const oLoc = b.lop.querySelector('[data-loc]');
  oLoc?.addEventListener('input', () => {
    const q = boDau(oLoc.value.trim());
    b.lop.querySelectorAll('.muc-tay').forEach((d) => { d.hidden = !!q && !d.dataset.tim.includes(q); });
  });
}

export function moSoTayMuc(k) {
  const m = SO_TAY[k];
  if (!m) return;
  ghiDocTay(k);
  moBang(`<div class="tam-dau"><h2>${m.ten}</h2><button class="nut-icon" type="button" data-dong aria-label="Đóng">${icon('dong')}</button></div>
    <p class="so-tay-mot">${m.mo}</p>`, { nhan: m.ten });
}

export function moGoiY(man, soDaMo, khiMoThem) {
  let n = Math.max(1, soDaMo);
  const veNoi = () => {
    const ds = man.goiY.slice(0, n).map((g, i) => `<div class="goi-y-hang"><span class="goi-y-so">${i + 1}</span><span>${g}</span></div>`).join('');
    const con = man.goiY.length - n;
    return `<div class="tam-dau"><img class="mat" src="${duongMat('luna', 'thinking')}" alt="" width="52" height="60"><h2>Luna gợi ý</h2><button class="nut-icon" type="button" data-dong aria-label="Đóng">${icon('dong')}</button></div>
      <div data-ds>${ds}</div>
      ${con > 0 ? `<button class="nut-phu" type="button" data-them style="width:100%;margin-top:8px">Gợi ý nữa đi (còn ${con})</button>` : '<p class="nhan-phu" style="margin-top:8px">Hết gợi ý rồi. Luna không làm hộ đâu, nhưng thử sai bao nhiêu lần cũng không mất gì.</p>'}`;
  };
  const b = moBang(veNoi(), { nhan: 'Gợi ý của Luna' });
  const ganThem = () => {
    b.lop.querySelector('[data-them]')?.addEventListener('click', () => {
      n++;
      khiMoThem(n);
      b.lop.querySelector('.tam').innerHTML = `<div class="tam-num"></div>${veNoi()}`;
      b.lop.querySelector('[data-dong]')?.addEventListener('click', b.dong);
      ganThem();
    });
  };
  ganThem();
}

// Hỏi lại trước việc không hoàn tác được. Nút an toàn là nút được chọn sẵn.
export function moXacNhan({ tieuDe, noi, nhanLam, khiLam }) {
  const b = moBang(`<div class="tam-dau"><h2>${tieuDe}</h2></div><p class="so-tay-mot">${noi}</p>
    <div class="ket-nut"><button class="nut-phu" type="button" data-dong>Thôi</button><button class="nut-chinh nut-chinh--do" type="button" data-lam>${nhanLam}</button></div>`, { nhan: tieuDe });
  b.lop.querySelector('[data-lam]').addEventListener('click', () => { b.dong(); khiLam(); });
}
