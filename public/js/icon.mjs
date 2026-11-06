// Icon nét, một chỗ duy nhất. UI không dùng emoji.
const NET = {
  lui: '<path d="M15 5l-7 7 7 7"/>',
  tiep: '<path d="M9 5l7 7-7 7"/>',
  sao: '<path d="M12 3l2.7 5.8 6.3.8-4.6 4.4 1.2 6.3L12 17.2 6.4 20.3l1.2-6.3L3 9.6l6.3-.8z"/>',
  khoa: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/>',
  moKhoa: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 017.5-2"/>',
  mat: '<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4"/>',
  trang: '<path d="M20 14.5A8 8 0 019.5 4a8 8 0 1010.5 10.5z"/>',
  loa: '<path d="M4 10v4h3l5 4V6L7 10z"/><path d="M16 9a4 4 0 010 6M18.5 6.5a8 8 0 010 11"/>',
  tatLoa: '<path d="M4 10v4h3l5 4V6L7 10z"/><path d="M16 10l4 4M20 10l-4 4"/>',
  soTay: '<path d="M5 4h11a3 3 0 013 3v13H8a3 3 0 01-3-3z"/><path d="M5 17a3 3 0 013-3h11"/>',
  denGoiY: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 00-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0012 3z"/>',
  chay: '<path d="M7 4.5v15l12-7.5z"/>',
  dung: '<path d="M6 5h4v14H6zM14 5h4v14h-4z"/>',
  hoanTac: '<path d="M8 5L4 9l4 4"/><path d="M4 9h10a6 6 0 010 12h-4"/>',
  lamLai: '<path d="M4 12a8 8 0 111.8 5"/><path d="M4 20v-4h4"/>',
  xong: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  dong: '<path d="M6 6l12 12M18 6L6 18"/>',
  len: '<path d="M12 19V6M6 11l6-6 6 6"/>',
  xuong: '<path d="M12 5v13M6 13l6 6 6-6"/>',
  trai: '<path d="M19 12H6M11 6l-6 6 6 6"/>',
  phai: '<path d="M5 12h13M13 6l6 6-6 6"/>',
  nhom: '<rect x="4" y="4" width="10" height="10" rx="2"/><rect x="10" y="10" width="10" height="10" rx="2"/>',
  raNhom: '<rect x="3" y="3" width="8" height="8" rx="2"/><rect x="13" y="13" width="8" height="8" rx="2"/><path d="M13 7h4v4M11 17H7v-4"/>',
  canGiua: '<path d="M3 12h18"/><rect x="6" y="7" width="4" height="10" rx="1"/><rect x="14" y="9" width="4" height="6" rx="1"/>',
  cachDeu: '<path d="M4 4v16M20 4v16"/><rect x="9" y="8" width="6" height="8" rx="1"/>',
  cungCo: '<rect x="4" y="8" width="7" height="8" rx="1"/><rect x="13" y="8" width="7" height="8" rx="1"/>',
  tatCa: '<rect x="4" y="4" width="16" height="16" rx="2" stroke-dasharray="3 3"/>',
  them: '<path d="M12 5v14M5 12h14"/>',
  xoa: '<path d="M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13"/>',
  tron: '<path d="M4 16c4 0 4-8 8-8s4 8 8 8"/>',
  goc: '<path d="M4 18l8-12 8 12"/>',
  gop: '<circle cx="9" cy="12" r="6"/><circle cx="15" cy="12" r="6"/>',
  khoet: '<circle cx="11" cy="12" r="8"/><circle cx="14" cy="12" r="3.5" stroke-dasharray="2 2"/>',
  giao: '<path d="M12 7a6 6 0 010 10 6 6 0 010-10z"/><circle cx="9" cy="12" r="6" opacity=".4"/><circle cx="15" cy="12" r="6" opacity=".4"/>',
  dua: '<path d="M4 20L15 9"/><path d="M18 3v3M18 9v3M15 6h-3M24 6h-3"/>',
  co: '<path d="M4 20c3 0 4-1 5-3l9-10a2 2 0 00-3-3L6 13c-2 1-2 4-2 7z"/>',
  gom: '<path d="M4 20l6-1L21 8l-5-5L5 14z"/>',
  giu: '<path d="M6 12a6 6 0 1012 0 6 6 0 10-12 0"/><path d="M12 9v6M9 12h6"/>',
  soi: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l5 5"/>',
  tep: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/>',
  phim: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M8 5v14M16 5v14M3 10h5M3 14h5M16 10h5M16 14h5"/>',
  nhac: '<path d="M9 18V6l10-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/>',
  mo: '<path d="M4 18c6 0 10-6 16-12"/><path d="M4 12c3 0 6-2 9-5" opacity=".5"/>',
  cat: '<circle cx="6" cy="7" r="2.5"/><circle cx="6" cy="17" r="2.5"/><path d="M8 8.5L20 16M8 15.5L20 8"/>',
  chu: '<path d="M6 6h12M12 6v13"/>',
  dai: '<rect x="3" y="9" width="18" height="6" rx="1"/>',
};

export function icon(ten, lop = '') {
  return `<svg class="icon ${lop}" viewBox="0 0 24 24" aria-hidden="true">${NET[ten] || ''}</svg>`;
}

export function hangSao(so, tong = 3) {
  let h = '';
  for (let i = 0; i < tong; i++) h += icon('sao', i < so ? 'co' : '');
  return `<span class="sao-hang" aria-label="${so} trên ${tong} sao">${h}</span>`;
}
