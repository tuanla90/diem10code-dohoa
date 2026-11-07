// Tủ tác phẩm: thành phẩm thật của người chơi, vẽ lại từ trạng thái đã lưu. Công sức có chỗ để ngắm.
import { GOI, TAT_CA_MAN, timMan, cham } from '../man/index.mjs';
import { saoCua, daQua, banDaLuu, hoSoMan } from '../kho.mjs';
import { dangMoGoi, dangMoMan } from '../tien-trinh.mjs';
import { icon, hangSao } from '../icon.mjs';
import { monCua, tranhMon } from '../the-gioi.mjs';
import { moBang } from '../bang-truot.mjs';
import { veThanhPham, veTuTu } from '../thanh-pham.mjs';
import { thanhTab } from './vo.mjs';

function moChiTiet(ma) {
  const man = timMan(ma);
  const st = banDaLuu(ma);
  const ho = hoSoMan(ma);
  const mon = monCua(ma);
  const ket = st ? cham(man, st) : null;
  const ds = ket ? ket.ds.filter((t) => t.sao) : [];
  moBang(`<div class="tam-dau"><div class="tam-dau-chu"><small>${mon?.noi || ''}</small><h2>${mon?.ten || man.ten}</h2></div><button class="nut-icon" type="button" data-dong aria-label="Đóng">${icon('dong')}</button></div>
    <div class="tp-to">${st ? veThanhPham(man, st) : tranhMon(ma, true)}</div>
    <div class="tp-dong"><span>Màn: <b>${man.ten}</b></span>${hangSao(saoCua(ma))}</div>
    ${ho?.chay ? `<p class="nhan-phu">Đã chạy ${ho.chay} lần trước khi có bản này.</p>` : ''}
    ${st ? '' : '<p class="nhan-phu">Bản lưu từ trước nên chưa có tranh riêng. Chơi lại một lần là tranh của bạn sẽ vào tủ.</p>'}
    ${ds.length ? `<ul class="ket-ds">${ds.map((t) => `<li class="${t.dat ? 'dat' : 'chua'}">${icon(t.dat ? 'xong' : 'them')}<span>${t.ten}</span></li>`).join('')}</ul>` : ''}
    <div class="ket-nut"><a class="nut-chinh" href="#/man/${ma}">${saoCua(ma) === 3 ? 'Làm lại' : 'Làm đẹp hơn'}${icon('tiep')}</a></div>`, { nhan: man.ten });
}

export function trangTacPham(root) {
  const so = TAT_CA_MAN.filter((m) => daQua(m.ma)).length;
  root.innerHTML = `<main class="trang trang--tab trang-vao">
    <header class="tieu-de-trang"><h1>Tủ tác phẩm</h1><p>${so ? `${so}/${TAT_CA_MAN.length} tác phẩm do chính bạn làm ra.` : 'Tủ còn trống. Xong màn đầu tiên là có tác phẩm đầu tiên.'}</p></header>
    ${GOI.map((g, gi) => {
      const moG = dangMoGoi(gi);
      return `<section class="ke-tp">
        <h2 class="muc-ten">${g.ten}</h2>
        <div class="luoi-tp">${g.man.map((m, i) => {
          const xong = daQua(m.ma);
          const mo = moG && dangMoMan(g, i);
          const mon = monCua(m.ma);
          if (xong) {
            return `<button class="khung-tp" type="button" data-ma="${m.ma}">
              <span class="khung-tp-tranh" data-ve="${m.ma}">${tranhMon(m.ma, true)}</span>
              <span class="khung-tp-chan"><b>${mon?.ten || m.ten}</b>${hangSao(saoCua(m.ma))}</span>
            </button>`;
          }
          const chu = mo ? `<a class="khung-tp-lam" href="#/man/${m.ma}">Làm ngay${icon('tiep')}</a>` : `<small>${icon('khoa')}Chưa mở</small>`;
          return `<div class="khung-tp khung-tp--trong">
            <span class="khung-tp-tranh">${tranhMon(m.ma, false)}</span>
            <span class="khung-tp-chan"><b>${mon?.ten || m.ten}</b>${chu}</span>
          </div>`;
        }).join('')}</div>
      </section>`;
    }).join('')}
  </main>${thanhTab('tp')}`;
  root.querySelectorAll('[data-ma]').forEach((b) => b.addEventListener('click', () => moChiTiet(b.dataset.ma)));
  const ds = [...root.querySelectorAll('[data-ve]')].map((el) => {
    const ma = el.dataset.ve;
    return { el, man: timMan(ma), st: banDaLuu(ma) };
  }).filter((x) => x.st);
  return veTuTu(ds);
}
