// Màn đầu: Bản vẽ Ngày hội là mục tiêu lớn của cả game. Nhìn một cái biết đã làm được bao nhiêu và việc kế là gì.
import { GOI, TAT_CA_MAN } from '../man/index.mjs';
import { saoCua, daQua, tongSao, tenNguoi, layMonMoi, matTinhTot } from '../kho.mjs';
import { dangMoGoi, manTiepTheo, saoGoi, tongSaoToiDa, danhHieu, xongGoi, SO_CAU_MAT_TINH } from '../tien-trinh.mjs';
import { icon } from '../icon.mjs';
import { biaGoi } from '../hinh.mjs';
import { banVe, monCua, MON } from '../the-gioi.mjs';
import { phat } from '../am-thanh.mjs';
import { thanhTab, thoat, anhTat } from './vo.mjs';

export function trangChu(root) {
  const tiep = manTiepTheo();
  const moi = layMonMoi();
  const coTienDo = tongSao() > 0;
  const soMon = MON.filter((m) => daQua(m.ma)).length;
  const dh = danhHieu();
  const monKe = tiep ? monCua(tiep.man.ma) : null;
  const moMat = xongGoi(GOI[0]);

  const nutChinh = tiep
    ? `<a class="nut-tiep-tuc" href="#/man/${tiep.man.ma}"><span class="nut-tiep-tuc-so">${icon('chay')}</span><span><b>${coTienDo ? 'Làm tiếp' : 'Nhận việc đầu tiên'}</b><small>${tiep.goi.ten} · ${tiep.man.ten}</small></span>${icon('tiep')}</a>`
    : `<a class="nut-tiep-tuc nut-tiep-tuc--vang" href="#/khai-mac"><span class="nut-tiep-tuc-so">${icon('cup')}</span><span><b>Dự lễ khai mạc</b><small>Ngày hội đã có gương mặt của nó</small></span>${icon('tiep')}</a>`;

  root.innerHTML = `<main class="trang trang--tab trang-vao">
    <header class="dau">
      <a class="chip-nguoi" href="#/ho-so" aria-label="Mở hồ sơ của bạn">
        <span class="anh-tat">${anhTat(tenNguoi())}</span>
        <span class="chip-nguoi-chu"><b>${thoat(tenNguoi() || 'Bạn')}</b><small>${dh.ten}</small></span>
      </a>
      <span class="chip-sao" aria-label="${tongSao()} trên ${tongSaoToiDa} sao">${icon('sao')}${tongSao()}/${tongSaoToiDa}</span>
    </header>

    <section class="the-ban-ve">
      <div class="the-ban-ve-dau">
        <h1>Bản vẽ Ngày hội</h1>
        <span class="the-ban-ve-so"><b>${soMon}</b>/${MON.length} món có màu</span>
      </div>
      ${banVe({ daXong: daQua, ke: tiep?.man.ma, moi })}
      <div class="vach-tien" role="img" aria-label="Hoàn thiện ${soMon} trên ${MON.length} món"><i style="width:${(soMon / MON.length) * 100}%"></i></div>
      ${monKe ? `<p class="the-ban-ve-ke"><span class="cham-hong"></span>Sắp có màu: <b>${monKe.ten}</b> ở ${monKe.noi.toLowerCase()}</p>` : '<p class="the-ban-ve-ke">Cả sân trường đã rực rỡ. Quay lại lấy đủ sao nếu bạn muốn.</p>'}
    </section>

    ${nutChinh}

    <h2 class="muc-ten">Năm gói việc</h2>
    <div class="ds-goi">
    ${GOI.map((g, i) => {
      const mo = dangMoGoi(i);
      const dang = tiep && tiep.gi === i;
      const xong = xongGoi(g);
      const cham = g.man.map((m) => {
        const s = saoCua(m.ma);
        return `<i class="cham-man${s === 3 ? ' cham-man--3' : s ? ' cham-man--dat' : ''}"></i>`;
      }).join('');
      return `<a class="the-goi${dang ? ' the-goi--dang' : ''}${mo ? '' : ' the-goi--khoa'}" ${mo ? `href="#/goi/${g.id}"` : 'aria-disabled="true"'}>
        <span class="bia-nho">${biaGoi(i, g.ten)}${mo ? '' : `<span class="bia-khoa">${icon('khoa')}</span>`}</span>
        <span class="the-goi-than">
          <span class="the-goi-so">Gói ${i + 1}<span class="ma-bai">${g.baiHoc}</span></span>
          <b>${g.ten}</b>
          <span class="the-goi-phu"><span class="hang-cham">${cham}</span>${mo ? `<span class="the-goi-sao">${icon('sao')}${saoGoi(g)}/${g.man.length * 3}</span>` : '<span class="the-goi-khoa">Xong gói trước để mở</span>'}${xong ? `<span class="the-goi-xong">${icon('xong')}</span>` : ''}</span>
        </span>
      </a>`;
    }).join('')}
    </div>

    <h2 class="muc-ten">Giải lao</h2>
    <a class="the-mat${moMat ? '' : ' the-mat--khoa'}" ${moMat ? 'href="#/mat-tinh"' : 'aria-disabled="true"'}>
      <span class="the-mat-ic">${icon(moMat ? 'matNhin' : 'khoa')}</span>
      <span class="the-goi-than"><b>Mắt Thiết Kế</b><small>${moMat ? `Hai bản, chọn bản đúng. ${matTinhTot() ? `Tốt nhất ${matTinhTot()}/${SO_CAU_MAT_TINH}.` : 'Một lượt chưa tới 2 phút.'}` : 'Xong gói 1 để mở trò luyện mắt.'}</small></span>
      ${moMat ? icon('tiep') : ''}
    </a>
    <p class="chan-trang">${TAT_CA_MAN.length} màn bám Tin 10 và Tin 11. CLB Tin học, THPT Hoa Phượng.</p>
  </main>${thanhTab('ve')}`;
  if (moi) phat('toMau');
}
