// Sổ tay toàn màn hình: tra được bất cứ lúc nào, không khóa. Tìm nhanh, chia theo gói, biết mục đó gặp ở màn nào.
import { GOI } from '../man/index.mjs';
import { SO_TAY } from '../so-tay.mjs';
import { daQua, daDocTay, ghiDocTay, soDocTay } from '../kho.mjs';
import { noiGap, goiCuaMuc, xetHuyHieu, dangMoMan, dangMoGoi } from '../tien-trinh.mjs';
import { icon } from '../icon.mjs';
import { phat } from '../am-thanh.mjs';
import { thanhTab, baoNhanh } from './vo.mjs';

const boDau = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();

function hangMuc(k) {
  const m = SO_TAY[k];
  const gap = noiGap(k);
  const dungRoi = gap.some((x) => daQua(x.ma));
  const doc = daDocTay(k);
  const moiNhan = dungRoi && !doc;
  const lien = gap.filter((x) => dangMoGoi(x.goiChiSo) && dangMoMan(GOI[x.goiChiSo], x.chiSo));
  return `<details class="muc-tay" data-k="${k}" data-tim="${boDau(m.ten + ' ' + m.mo)}">
    <summary><span class="muc-tay-ten">${m.ten}</span>${moiNhan ? '<span class="nhan-moi">Nên đọc</span>' : ''}${doc ? `<span class="muc-tay-doc">${icon('xong')}</span>` : ''}<span class="muc-tay-mui">${icon('tiep')}</span></summary>
    <p>${m.mo}</p>
    ${lien.length ? `<div class="muc-tay-gap"><small>Gặp ở</small>${lien.map((x) => `<a href="#/man/${x.ma}">${x.ten}</a>`).join('')}</div>` : ''}
  </details>`;
}

export function trangSoTay(root) {
  const nhom = GOI.map((g, i) => ({ g, ds: Object.keys(SO_TAY).filter((k) => goiCuaMuc(k) === i) }));
  const tong = Object.keys(SO_TAY).length;
  root.innerHTML = `<main class="trang trang--tab trang-vao">
    <header class="tieu-de-trang"><h1>Sổ tay đồ họa</h1><p><span id="so-doc">${soDocTay()}</span>/${tong} mục đã đọc. Bám Tin 10 và Tin 11.</p></header>
    <label class="o-tim">${icon('timKiem')}<span class="an-a11y">Tìm trong Sổ tay</span><input id="tim" type="search" placeholder="Tìm: vector, lớp, đũa thần" autocomplete="off" enterkeyhint="search"></label>
    <div id="ds-tay">${nhom.filter((n) => n.ds.length).map((n) => `<section class="nhom-tay"><h2 class="muc-ten">${n.g.ten}<span class="ma-bai">${n.g.baiHoc}</span></h2><div class="ds-tay">${n.ds.map(hangMuc).join('')}</div></section>`).join('')}</div>
    <p class="khong-thay" id="khong-thay" hidden>Chưa có mục nào khớp. Thử một từ ngắn hơn.</p>
  </main>${thanhTab('st')}`;

  root.querySelectorAll('.muc-tay').forEach((d) => d.addEventListener('toggle', () => {
    if (!d.open) return;
    phat('lat');
    const k = d.dataset.k;
    if (daDocTay(k)) return;
    ghiDocTay(k);
    root.querySelector('#so-doc').textContent = soDocTay();
    d.querySelector('.nhan-moi')?.remove();
    for (const h of xetHuyHieu()) {
      phat('huyHieu');
      baoNhanh(`Huy hiệu mới: <b>${h.ten}</b>`);
    }
  }));

  const o = root.querySelector('#tim');
  o.addEventListener('input', () => {
    const q = boDau(o.value.trim());
    let con = 0;
    root.querySelectorAll('.nhom-tay').forEach((nh) => {
      let trong = 0;
      nh.querySelectorAll('.muc-tay').forEach((d) => {
        const khop = !q || d.dataset.tim.includes(q);
        d.hidden = !khop;
        if (khop) trong++;
      });
      nh.hidden = !trong;
      con += trong;
    });
    root.querySelector('#khong-thay').hidden = con > 0;
  });
}
