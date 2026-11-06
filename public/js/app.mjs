// Khởi động và định tuyến: #/ (màn đầu), #/goi/<id>, #/man/<mã>. Không dùng khung phần mềm, không cần build.
import { GOI, TAT_CA_MAN, timMan } from './man/index.mjs';
import { saoCua, daQua, tongSao, giaoDien, datGiaoDien, loaBat, datLoa } from './kho.mjs';
import { icon, hangSao } from './icon.mjs';
import { tranhMoDau, biaGoi, datVao, logoLong } from './hinh.mjs';
import { moBan } from './ban-choi.mjs';
import { moSoTay, duongMat } from './bang-truot.mjs';

const root = document.getElementById('root');
const moHet = new URLSearchParams(location.search).has('mo-khoa');
let donDep = null;

const dangMoGoi = (i) => moHet || i === 0 || GOI[i - 1].man.every((m) => daQua(m.ma));
const dangMoMan = (g, i) => moHet || i === 0 || daQua(g.man[i - 1].ma);
const tongSaoToiDa = TAT_CA_MAN.length * 3;

function manTiepTheo() {
  for (let gi = 0; gi < GOI.length; gi++) {
    if (!dangMoGoi(gi)) break;
    const m = GOI[gi].man.find((x) => !daQua(x.ma));
    if (m) return { goi: GOI[gi], man: m, gi };
  }
  return null;
}

function dauTrang() {
  const toi = giaoDien() === 'dark';
  const loa = loaBat();
  return `<header class="dau">
    <svg class="dau-logo" viewBox="0 0 100 100" aria-hidden="true">${datVao(logoLong(), 50, 50, 100, 100)}</svg>
    <div class="dau-ten"><b>Gương Mặt Ngày Hội</b><small>CLB Tin học · THPT Hoa Phượng</small></div>
    <button class="nut-icon" id="nut-loa" type="button" aria-label="${loa ? 'Tắt âm thanh' : 'Bật âm thanh'}">${icon(loa ? 'loa' : 'tatLoa')}</button>
    <button class="nut-icon" id="nut-nen" type="button" aria-label="${toi ? 'Chuyển nền sáng' : 'Chuyển nền tối'}">${icon(toi ? 'mat' : 'trang')}</button>
  </header>`;
}

function ganDauTrang(lamMoi) {
  root.querySelector('#nut-loa').addEventListener('click', () => { datLoa(!loaBat()); lamMoi(); });
  root.querySelector('#nut-nen').addEventListener('click', () => {
    const g = giaoDien() === 'dark' ? 'light' : 'dark';
    datGiaoDien(g);
    document.documentElement.dataset.theme = g;
    lamMoi();
  });
}

function trangChu() {
  const tiep = manTiepTheo();
  const coTienDo = tongSao() > 0;
  const nutChinh = tiep
    ? `<a class="nut-tiep-tuc" href="#/man/${tiep.man.ma}" style="text-decoration:none"><span><b>${coTienDo ? 'Làm tiếp' : 'Bắt đầu'}</b><small>${tiep.goi.ten} · ${tiep.man.ten}</small></span>${icon('tiep')}</a>`
    : `<div class="nut-tiep-tuc"><span><b>Xong cả năm gói</b><small>Ngày hội năm nay có gương mặt rồi. Quay lại lấy đủ sao nhé.</small></span></div>`;
  root.innerHTML = `<main class="trang">
    ${dauTrang()}
    <div style="display:flex;justify-content:flex-end"><span class="chip-sao" aria-label="${tongSao()} trên ${tongSaoToiDa} sao">${icon('sao')}${tongSao()}/${tongSaoToiDa}</span></div>
    <h1 class="tieu-de-lon">Lên hình cho <span>Ngày hội.</span></h1>
    ${tranhMoDau()}
    <p class="cau-mo">Năm ngoái băng rôn vỡ ô, áo lộ khung trắng. Năm nay Sola nhờ bạn tự tay kéo, nắn, tách, cắt, còn Luna ở bên gợi ý.</p>
    ${nutChinh}
    <div class="muc-ten">Năm gói việc</div>
    ${GOI.map((g, i) => {
      const mo = dangMoGoi(i);
      const sao = g.man.reduce((t, m) => t + saoCua(m.ma), 0);
      const dang = tiep && tiep.gi === i;
      const phu = mo
        ? `<div class="the-goi-phu">${icon('sao')}${sao}/${g.man.length * 3}<span class="ma-bai">${g.baiHoc}</span></div>`
        : `<div class="the-goi-phu the-goi-khoa">${icon('khoa')}Xong gói trước để mở</div>`;
      return `<button class="the-goi${dang ? ' the-goi--dang' : ''}" type="button" data-goi="${g.id}" ${mo ? '' : 'disabled'}>
        <span class="bia-nho">${biaGoi(i, g.ten)}</span>
        <span class="the-goi-than"><b>${g.ten}</b><small>${g.mo}</small>${phu}</span>
      </button>`;
    }).join('')}
    <button class="nut-phu nut-phu--cyan" id="nut-so-tay" type="button">${icon('soTay')}Mở Sổ tay đồ họa</button>
  </main>`;
  ganDauTrang(trangChu);
  root.querySelectorAll('[data-goi]').forEach((b) => b.addEventListener('click', () => { location.hash = `#/goi/${b.dataset.goi}`; }));
  root.querySelector('#nut-so-tay').addEventListener('click', () => moSoTay([]));
}

function trangGoi(id) {
  const gi = GOI.findIndex((g) => g.id === id);
  if (gi < 0 || !dangMoGoi(gi)) { location.hash = '#/'; return; }
  const g = GOI[gi];
  const sao = g.man.reduce((t, m) => t + saoCua(m.ma), 0);
  const dauTien = g.man.findIndex((m) => !daQua(m.ma));
  const anh = duongMat(g.loiMo.ai, g.loiMo.mat);
  root.innerHTML = `<main class="trang">
    <header class="dau">
      <a class="nut-icon" href="#/" aria-label="Về màn đầu" style="color:inherit">${icon('lui')}</a>
      <div class="dau-ten"><b>Gói ${gi + 1}</b><small>${g.baiHoc}</small></div>
      <span class="chip-sao" aria-label="${sao} trên ${g.man.length * 3} sao">${icon('sao')}${sao}/${g.man.length * 3}</span>
    </header>
    <section class="bia-goi">${biaGoi(gi, g.ten)}<div class="bia-goi-chu"><h1>${g.ten}</h1><p>${g.mo}</p></div></section>
    <div class="loi-mo"><img class="mat" src="${anh}" alt="" width="52" height="52"><div class="bong-noi"><b>${g.loiMo.ai === 'sola' ? 'SOLA' : 'LUNA'}</b>${g.loiMo.cau}</div></div>
    <div class="muc-ten">Chọn màn</div>
    <div class="luoi-man">${g.man.map((m, i) => {
      const mo = dangMoMan(g, i);
      const lop = i === dauTien ? ' o-man--tiep' : '';
      return `<button class="o-man${mo ? lop : ''}" type="button" data-ma="${m.ma}" ${mo ? '' : 'disabled'} aria-label="Màn ${i + 1}: ${m.ten}${mo ? '' : ', đang khóa'}">
        <b>${mo ? i + 1 : icon('khoa')}</b><small>${m.ten}</small>${mo ? hangSao(saoCua(m.ma)) : ''}
      </button>`;
    }).join('')}</div>
  </main>`;
  root.querySelectorAll('[data-ma]').forEach((b) => b.addEventListener('click', () => { location.hash = `#/man/${b.dataset.ma}`; }));
}

function dinhTuyen() {
  if (donDep) { donDep(); donDep = null; }
  document.querySelectorAll('.lop-phu').forEach((n) => n.remove());
  window.scrollTo(0, 0);
  const h = location.hash.replace(/^#\/?/, '');
  if (h.startsWith('goi/')) return trangGoi(h.slice(4));
  if (h.startsWith('man/')) {
    const m = timMan(h.slice(4));
    if (m && dangMoGoi(m.goiChiSo) && dangMoMan(GOI[m.goiChiSo], m.chiSo)) {
      donDep = moBan(root, m, { tiep: manSau(m) });
      return undefined;
    }
    location.hash = '#/';
    return undefined;
  }
  return trangChu();
}

function manSau(m) {
  const g = GOI[m.goiChiSo];
  if (m.chiSo < g.man.length - 1) return { hash: `#/man/${g.man[m.chiSo + 1].ma}`, nhan: 'Màn tiếp' };
  if (m.goiChiSo < GOI.length - 1) return { hash: `#/goi/${GOI[m.goiChiSo + 1].id}`, nhan: 'Sang gói mới' };
  return { hash: '#/', nhan: 'Về màn đầu' };
}

window.addEventListener('hashchange', dinhTuyen);
dinhTuyen();
