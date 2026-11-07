// Trang một gói: lời mở của Sola hoặc Luna, rồi hành trình các màn, mỗi màn gắn với món đồ nó làm ra.
import { GOI } from '../man/index.mjs';
import { saoCua, daQua } from '../kho.mjs';
import { dangMoGoi, dangMoMan, saoGoi, HUY_HIEU } from '../tien-trinh.mjs';
import { coHuyHieu } from '../kho.mjs';
import { icon, hangSao } from '../icon.mjs';
import { biaGoi } from '../hinh.mjs';
import { duongMat } from '../bang-truot.mjs';
import { monCua, tranhMon } from '../the-gioi.mjs';
import { oHuyHieu } from './vo.mjs';

export function trangGoi(root, id) {
  const gi = GOI.findIndex((g) => g.id === id);
  if (gi < 0 || !dangMoGoi(gi)) { location.hash = '#/'; return; }
  const g = GOI[gi];
  const sao = saoGoi(g);
  const dauTien = g.man.findIndex((m) => !daQua(m.ma));
  const anh = duongMat(g.loiMo.ai, g.loiMo.mat);
  const hh = HUY_HIEU.find((h) => h.id === g.id);
  root.innerHTML = `<main class="trang trang-vao">
    <header class="dau">
      <a class="nut-icon" href="#/" aria-label="Về bản vẽ">${icon('lui')}</a>
      <div class="dau-ten"><b>Gói ${gi + 1}</b><small class="ma-bai">${g.baiHoc}</small></div>
      <span class="chip-sao" aria-label="${sao} trên ${g.man.length * 3} sao">${icon('sao')}${sao}/${g.man.length * 3}</span>
    </header>
    <section class="bia-goi">${biaGoi(gi, g.ten)}<div class="bia-goi-chu"><h1>${g.ten}</h1><p>${g.mo}</p></div></section>
    <div class="loi-mo"><img class="mat" src="${anh}" alt="" width="60" height="69"><p class="bong-noi bong-noi--trai"><b>${g.loiMo.ai === 'sola' ? 'SOLA' : 'LUNA'}</b>${g.loiMo.cau}</p></div>
    <h2 class="muc-ten">Hành trình</h2>
    <ol class="duong-man">${g.man.map((m, i) => {
      const mo = dangMoMan(g, i);
      const s = saoCua(m.ma);
      const ke = mo && i === dauTien;
      const mon = monCua(m.ma);
      return `<li class="chang${ke ? ' chang--ke' : ''}${s ? ' chang--xong' : ''}${mo ? '' : ' chang--khoa'}">
        <span class="chang-nut">${s ? icon('xong') : mo ? i + 1 : icon('khoa')}</span>
        <a class="chang-the" ${mo ? `href="#/man/${m.ma}"` : 'aria-disabled="true"'} aria-label="Màn ${i + 1}: ${m.ten}${mo ? '' : ', đang khóa'}">
          <span class="chang-tranh">${tranhMon(m.ma, !!s)}</span>
          <span class="chang-chu">
            <b>${m.ten}</b>
            <small>${mon ? `Làm ra: ${mon.ten}` : ''}</small>
            ${mo ? hangSao(s) : '<small class="chang-khoa">Xong màn trước để mở</small>'}
          </span>
          ${ke ? `<span class="chang-lam">Làm${icon('tiep')}</span>` : ''}
        </a>
      </li>`;
    }).join('')}</ol>
    ${hh ? `<div class="the-thuong">${oHuyHieu(hh, coHuyHieu(hh.id))}<span><small>Xong cả gói được huy hiệu</small><b>${hh.ten}</b></span></div>` : ''}
  </main>`;
}
