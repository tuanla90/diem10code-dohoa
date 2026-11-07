// Vỏ chung của các màn hình: thanh tab đáy, đầu trang, chữ an toàn, thông báo nhanh, ô huy hiệu.
import { icon } from '../icon.mjs';

const TAB = [
  { id: 've', hash: '#/', ten: 'Bản vẽ', ic: 'banVe' },
  { id: 'tp', hash: '#/tac-pham', ten: 'Tác phẩm', ic: 'tranh' },
  { id: 'st', hash: '#/so-tay', ten: 'Sổ tay', ic: 'soTay' },
  { id: 'hs', hash: '#/ho-so', ten: 'Hồ sơ', ic: 'nguoi' },
];

export function thanhTab(hien) {
  return `<nav class="tab-day" aria-label="Điều hướng chính">${TAB.map((t) => `<a class="tab${t.id === hien ? ' tab--dang' : ''}" href="${t.hash}"${t.id === hien ? ' aria-current="page"' : ''}>${icon(t.ic)}<span>${t.ten}</span></a>`).join('')}</nav>`;
}

// Tên do người chơi gõ: luôn qua hàm này trước khi vào innerHTML.
export function thoat(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export function baoNhanh(chu) {
  document.querySelector('.bao-nhanh')?.remove();
  const b = document.createElement('div');
  b.className = 'bao-nhanh';
  b.setAttribute('role', 'status');
  b.innerHTML = chu;
  document.body.appendChild(b);
  setTimeout(() => b.remove(), 3000);
}

export function oHuyHieu(h, co, lon = false) {
  return `<span class="hh${co ? ' hh--co' : ''}${lon ? ' hh--lon' : ''}">${icon(co ? h.ic : 'khoa')}</span>`;
}

export const anhTat = (ten) => thoat((ten || 'B').trim().charAt(0).toUpperCase());
