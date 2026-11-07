// Hồ sơ: thẻ thành viên CLB, số liệu, huy hiệu, cài đặt. Cài đặt gom một chỗ để màn chính bớt nút.
import { TAT_CA_MAN } from '../man/index.mjs';
import { tongSao, thongKe, tenNguoi, datTen, coHuyHieu, giaoDien, datGiaoDien, loaBat, datLoa, rungBat, datRung, xoaHetTienDo, soDocTay } from '../kho.mjs';
import { danhHieu, tongSaoToiDa, HUY_HIEU, xongHet } from '../tien-trinh.mjs';
import { icon } from '../icon.mjs';
import { moBang, moXacNhan } from '../bang-truot.mjs';
import { thanhTab, thoat, oHuyHieu, anhTat, baoNhanh } from './vo.mjs';

export function theThanhVien() {
  const dh = danhHieu();
  const sao = tongSao();
  return `<section class="the-tv" aria-label="Thẻ thành viên CLB Tin học">
    <i class="the-tv-tay the-tv-tay--a"></i><i class="the-tv-tay the-tv-tay--b"></i><i class="the-tv-tay the-tv-tay--c"></i><i class="the-tv-tay the-tv-tay--d"></i>
    <div class="the-tv-dau"><small>THẺ THÀNH VIÊN</small><small>CLB Tin học · THPT Hoa Phượng</small></div>
    <div class="the-tv-than">
      <span class="anh-tat anh-tat--lon">${anhTat(tenNguoi())}</span>
      <div class="the-tv-ten"><b>${thoat(tenNguoi() || 'Bạn')}</b><span>${dh.ten}</span></div>
    </div>
    <div class="the-tv-chan">
      <div class="vach-tien vach-tien--tren-toi" role="img" aria-label="${sao} sao"><i style="width:${dh.tiLe * 100}%"></i></div>
      <small>${dh.sau ? `Còn ${dh.sau.tu - sao} sao nữa là <b>${dh.sau.ten}</b>` : 'Danh hiệu cao nhất của CLB'}</small>
    </div>
  </section>`;
}

function moDoiTen(lamMoi) {
  const b = moBang(`<div class="tam-dau"><h2>Tên trên thẻ</h2><button class="nut-icon" type="button" data-dong aria-label="Đóng">${icon('dong')}</button></div>
    <label class="o-ten"><span class="an-a11y">Tên trên thẻ thành viên</span><input id="o-ten" type="text" maxlength="18" value="${thoat(tenNguoi())}" placeholder="Tên hoặc biệt danh" autocomplete="off"></label>
    <p class="nhan-phu">Tên chỉ lưu trong máy này, không gửi đi đâu.</p>
    <div class="ket-nut"><button class="nut-chinh" type="button" data-luu>Lưu tên</button></div>`, { nhan: 'Đổi tên trên thẻ' });
  const o = b.lop.querySelector('#o-ten');
  o.focus();
  o.select();
  const luu = () => { datTen(o.value); b.dong(); lamMoi(); };
  b.lop.querySelector('[data-luu]').addEventListener('click', luu);
  o.addEventListener('keydown', (e) => { if (e.key === 'Enter') luu(); });
}

function hangBat(id, ic, ten, bat, phu) {
  return `<button class="hang-cd" type="button" id="${id}" role="switch" aria-checked="${bat}"><span class="hang-cd-ic">${icon(ic)}</span><span class="hang-cd-chu"><b>${ten}</b>${phu ? `<small>${phu}</small>` : ''}</span><span class="cong-tac"><i></i></span></button>`;
}

export function trangHoSo(root) {
  const tk = thongKe();
  const coDu = HUY_HIEU.filter((h) => coHuyHieu(h.id)).length;
  const toi = giaoDien() === 'dark';
  root.innerHTML = `<main class="trang trang--tab trang-vao">
    <header class="tieu-de-trang"><h1>Hồ sơ</h1></header>
    ${theThanhVien()}
    <button class="nut-phu" type="button" id="nut-doi-ten">${icon('sua')}Đổi tên trên thẻ</button>
    <div class="o-so">
      <div><b>${tongSao()}<small>/${tongSaoToiDa}</small></b><span>Sao</span></div>
      <div><b>${tk.man}<small>/${TAT_CA_MAN.length}</small></b><span>Màn đã qua</span></div>
      <div><b>${tk.chay}</b><span>Lần chạy thử</span></div>
      <div><b>${soDocTay()}</b><span>Mục Sổ tay đã đọc</span></div>
    </div>
    <h2 class="muc-ten">Huy hiệu tay nghề<span class="muc-ten-phu">${coDu}/${HUY_HIEU.length}</span></h2>
    <div class="luoi-hh">${HUY_HIEU.map((h) => {
      const co = coHuyHieu(h.id);
      return `<button class="o-hh${co ? ' o-hh--co' : ''}" type="button" data-hh="${h.id}">${oHuyHieu(h, co)}<span>${h.ten}</span></button>`;
    }).join('')}</div>
    ${xongHet() ? `<a class="the-mat" href="#/khai-mac"><span class="the-mat-ic">${icon('cup')}</span><span class="the-goi-than"><b>Xem lại lễ khai mạc</b><small>Và lưu giấy khen của bạn</small></span>${icon('tiep')}</a>` : ''}
    <h2 class="muc-ten">Cài đặt</h2>
    <div class="nhom-cd">
      ${hangBat('cd-loa', loaBat() ? 'loa' : 'tatLoa', 'Âm thanh', loaBat())}
      ${hangBat('cd-rung', 'giu', 'Rung khi hít mốc', rungBat(), 'Máy không hỗ trợ thì không có tác dụng')}
      ${hangBat('cd-nen', toi ? 'trang' : 'mat', 'Nền tối', toi)}
      <a class="hang-cd" href="#/chao"><span class="hang-cd-ic">${icon('chay')}</span><span class="hang-cd-chu"><b>Xem lại phần mở đầu</b></span>${icon('tiep')}</a>
      <button class="hang-cd hang-cd--do" type="button" id="cd-xoa"><span class="hang-cd-ic">${icon('xoa')}</span><span class="hang-cd-chu"><b>Xóa tiến độ, chơi lại từ đầu</b></span></button>
    </div>
  </main>${thanhTab('hs')}`;

  const lamMoi = () => {
    const y = window.scrollY;
    trangHoSo(root);
    root.querySelector('main')?.classList.remove('trang-vao');
    window.scrollTo(0, y);
  };
  root.querySelector('#nut-doi-ten').addEventListener('click', () => moDoiTen(lamMoi));
  root.querySelector('#cd-loa').addEventListener('click', () => { datLoa(!loaBat()); lamMoi(); });
  root.querySelector('#cd-rung').addEventListener('click', () => { datRung(!rungBat()); lamMoi(); });
  root.querySelector('#cd-nen').addEventListener('click', () => {
    const g = giaoDien() === 'dark' ? 'light' : 'dark';
    datGiaoDien(g);
    document.documentElement.dataset.theme = g;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', getComputedStyle(document.documentElement).getPropertyValue('--bg').trim());
    lamMoi();
  });
  root.querySelector('#cd-xoa').addEventListener('click', () => moXacNhan({
    tieuDe: 'Xóa toàn bộ tiến độ?',
    noi: 'Sao, huy hiệu, tác phẩm và bản đang làm dở trên máy này sẽ mất hẳn. Việc này không hoàn tác được.',
    nhanLam: 'Xóa hết',
    khiLam: () => { xoaHetTienDo(); baoNhanh('Đã xóa. Bắt đầu lại nhé.'); location.hash = '#/chao'; },
  }));
  root.querySelectorAll('[data-hh]').forEach((b) => b.addEventListener('click', () => {
    const h = HUY_HIEU.find((x) => x.id === b.dataset.hh);
    const co = coHuyHieu(h.id);
    moBang(`<div class="hh-to">${oHuyHieu(h, co, true)}<h2>${h.ten}</h2><p>${h.mo}</p><span class="hh-to-tt${co ? ' hh-to-tt--co' : ''}">${co ? 'Đã có' : 'Chưa có'}</span></div>
      <div class="ket-nut"><button class="nut-phu" type="button" data-dong>Đóng</button></div>`, { nhan: `Huy hiệu ${h.ten}` });
  }));
}
