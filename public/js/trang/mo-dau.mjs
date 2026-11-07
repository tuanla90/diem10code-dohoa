// Mở đầu lần đầu vào game: màn tựa, ba khung truyện, nhận thẻ thành viên. Bỏ qua được ở mọi bước.
import { ghiDaChao, datTen, tenNguoi } from '../kho.mjs';
import { icon } from '../icon.mjs';
import { datVao, logoLong } from '../hinh.mjs';
import { duongMat } from '../bang-truot.mjs';
import { banVe, tranhNamNgoaiAo, tranhNamNgoaiBangRon } from '../the-gioi.mjs';
import { phat } from '../am-thanh.mjs';
import { thoat } from './vo.mjs';

const KHUNG = [
  {
    nhan: 'Năm ngoái',
    tranh: () => tranhNamNgoaiBangRon(),
    ai: 'sola', mat: 'facepalm', ten: 'SOLA',
    cau: 'Băng rôn ba mét mà logo vỡ thành từng ô vuông. Cô bán nước còn hỏi đây là trò chơi gì.',
  },
  {
    nhan: 'Cũng năm ngoái',
    tranh: () => tranhNamNgoaiAo(),
    ai: 'luna', mat: 'worried', ten: 'LUNA',
    cau: 'Áo tím in logo còn nguyên khung trắng. Một tệp dùng cho mọi chỗ thì chỗ nào cũng hỏng.',
  },
  {
    nhan: 'Năm nay',
    tranh: () => banVe({ daXong: () => false, ke: 'DH-1-1', nhan: 'Sân trường mới là bản vẽ nét' }),
    ai: 'sola', mat: 'confident', ten: 'SOLA',
    cau: 'Ngày hội còn đang là bản vẽ. Mỗi việc bạn làm xong, một góc sân trường có màu. Nhận lời nha?',
  },
];

export function trangMoDau(root) {
  ghiDaChao();
  let buoc = -1;

  const veTua = () => {
    root.innerHTML = `<main class="tua">
      <div class="tua-nen" aria-hidden="true"><i></i><i></i><i></i></div>
      <div class="tua-giua">
        <svg class="tua-logo" viewBox="-4 -4 108 108" role="img" aria-label="Logo CLB Tin học">
          <g class="tua-logo-net">${logoLong()}</g><g class="tua-logo-mau">${logoLong()}</g>
          <g class="tua-tay"><rect x="-2" y="-2" width="104" height="104" fill="none"/><rect x="-4" y="-4" width="5" height="5"/><rect x="99" y="-4" width="5" height="5"/><rect x="-4" y="99" width="5" height="5"/><rect x="99" y="99" width="5" height="5"/></g>
        </svg>
        <p class="tua-nho">CLB Tin học · THPT Hoa Phượng</p>
        <h1 class="tua-ten">Gương Mặt<br><span>Ngày Hội</span></h1>
        <p class="tua-cau">Tự tay kéo, nắn, ghép, tách nền để cả Ngày hội lên hình đúng ý.</p>
      </div>
      <div class="tua-duoi">
        <button class="nut-sang" type="button" id="nut-vao">Vào CLB${icon('tiep')}</button>
        <a class="nut-bo" href="#/">Bỏ qua mở đầu</a>
      </div>
    </main>`;
    root.querySelector('#nut-vao').addEventListener('click', () => { phat('chay'); buoc = 0; veKhung(); });
  };

  const veKhung = () => {
    const k = KHUNG[buoc];
    root.innerHTML = `<main class="truyen trang-vao">
      <header class="truyen-dau">
        <div class="truyen-cham" aria-label="Khung ${buoc + 1} trên ${KHUNG.length + 1}">${[...KHUNG, 0].map((_, i) => `<i class="${i <= buoc ? 'dang' : ''}"></i>`).join('')}</div>
        <a class="nut-bo nut-bo--toi" href="#/">Bỏ qua</a>
      </header>
      <span class="truyen-nhan">${k.nhan}</span>
      <div class="truyen-tranh">${k.tranh()}</div>
      <div class="truyen-noi"><img class="mat mat--lon" src="${duongMat(k.ai, k.mat)}" alt="" width="104" height="119"><p class="bong-noi bong-noi--trai"><b>${k.ten}</b>${k.cau}</p></div>
      <button class="nut-chinh truyen-nut" type="button" id="nut-tiep">Tiếp${icon('tiep')}</button>
    </main>`;
    root.querySelector('#nut-tiep').addEventListener('click', () => {
      phat('lat');
      buoc++;
      if (buoc < KHUNG.length) veKhung();
      else veThe();
    });
  };

  const veThe = () => {
    root.innerHTML = `<main class="truyen trang-vao">
      <header class="truyen-dau">
        <div class="truyen-cham" aria-label="Khung cuối">${[...KHUNG, 0].map(() => '<i class="dang"></i>').join('')}</div>
      </header>
      <span class="truyen-nhan">Thẻ thành viên</span>
      <section class="the-tv the-tv--moi" aria-label="Xem trước thẻ thành viên">
        <i class="the-tv-tay the-tv-tay--a"></i><i class="the-tv-tay the-tv-tay--b"></i><i class="the-tv-tay the-tv-tay--c"></i><i class="the-tv-tay the-tv-tay--d"></i>
        <div class="the-tv-dau"><small>THẺ THÀNH VIÊN</small><small>CLB Tin học · THPT Hoa Phượng</small></div>
        <div class="the-tv-than">
          <svg class="the-tv-logo" viewBox="0 0 100 100" aria-hidden="true">${datVao(logoLong(), 50, 50, 100, 100)}</svg>
          <div class="the-tv-ten"><b id="xem-ten">${thoat(tenNguoi() || 'Tên của bạn')}</b><span>Thành viên mới</span></div>
        </div>
      </section>
      <div class="truyen-noi"><img class="mat" src="${duongMat('luna', 'wave')}" alt="" width="64" height="73"><p class="bong-noi bong-noi--trai"><b>LUNA</b>Chào bạn. Ghi tên lên thẻ đi, tên chỉ nằm trong máy này thôi.</p></div>
      <label class="o-ten"><span class="an-a11y">Tên trên thẻ thành viên</span><input id="o-ten" type="text" maxlength="18" placeholder="Tên hoặc biệt danh" value="${thoat(tenNguoi())}" autocomplete="off" enterkeyhint="done"></label>
      <button class="nut-chinh truyen-nut" type="button" id="nut-nhan">Nhận thẻ${icon('xong')}</button>
    </main>`;
    const o = root.querySelector('#o-ten');
    const xem = root.querySelector('#xem-ten');
    o.addEventListener('input', () => { xem.textContent = o.value.trim() || 'Tên của bạn'; });
    const nhan = () => {
      datTen(o.value);
      phat('nhanThe');
      location.hash = '#/';
    };
    root.querySelector('#nut-nhan').addEventListener('click', nhan);
    o.addEventListener('keydown', (e) => { if (e.key === 'Enter') nhan(); });
  };

  veTua();
}
