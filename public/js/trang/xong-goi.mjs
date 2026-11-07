// Ăn mừng khi xong một gói: nhịp nghỉ giữa hành trình, có huy hiệu và thấy Ngày hội đã khác đi.
import { GOI } from '../man/index.mjs';
import { daQua, ghiXemGoi, coHuyHieu } from '../kho.mjs';
import { HUY_HIEU, LOI_XONG_GOI, saoGoi, xongGoi, xongHet, xetHuyHieu } from '../tien-trinh.mjs';
import { icon } from '../icon.mjs';
import { phat } from '../am-thanh.mjs';
import { banVe, MON } from '../the-gioi.mjs';
import { duongMat } from '../bang-truot.mjs';
import { oHuyHieu } from './vo.mjs';

export function trangXongGoi(root, id) {
  const gi = GOI.findIndex((g) => g.id === id);
  if (gi < 0 || !xongGoi(GOI[gi])) { location.hash = '#/'; return; }
  const g = GOI[gi];
  xetHuyHieu();
  ghiXemGoi(g.id);
  const hh = HUY_HIEU.find((h) => h.id === g.id);
  const loi = LOI_XONG_GOI[g.id];
  const sao = saoGoi(g);
  const toi = g.man.length * 3;
  const so = MON.filter((m) => daQua(m.ma)).length;
  const cuoi = gi === GOI.length - 1;
  const tiep = cuoi || xongHet()
    ? { hash: xongHet() ? '#/khai-mac' : '#/', nhan: xongHet() ? 'Dự lễ khai mạc' : 'Về bản vẽ' }
    : { hash: `#/goi/${GOI[gi + 1].id}`, nhan: `Sang gói ${gi + 2}: ${GOI[gi + 1].ten}` };

  root.innerHTML = `<main class="xong-goi">
    <div class="xong-goi-hao" aria-hidden="true"></div>
    <div class="xong-goi-than">
      <small class="xong-goi-nho">Xong gói ${gi + 1}</small>
      <h1>${g.ten}</h1>
      ${hh ? `<div class="xong-goi-hh">${oHuyHieu(hh, coHuyHieu(hh.id), true)}<b>${hh.ten}</b></div>` : ''}
      <div class="chip-sao chip-sao--to" aria-label="${sao} trên ${toi} sao">${icon('sao')}${sao}/${toi}</div>
      <div class="xong-goi-noi"><img class="mat" src="${duongMat(loi.ai, loi.mat)}" alt="" width="76" height="87"><p class="bong-noi bong-noi--trai"><b>${loi.ai === 'sola' ? 'SOLA' : 'LUNA'}</b>${loi.cau}</p></div>
      <div class="xong-goi-ve">${banVe({ daXong: daQua })}<small>${so}/${MON.length} món đã có màu</small></div>
    </div>
    <div class="xong-goi-duoi">
      ${sao < toi ? `<a class="nut-bo" href="#/goi/${g.id}">Quay lại lấy đủ sao</a>` : ''}
      <a class="nut-sang" href="${tiep.hash}">${tiep.nhan}${icon('tiep')}</a>
    </div>
  </main>`;
  phat('huyHieu');
}
