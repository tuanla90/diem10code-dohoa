// Bàn chơi dùng chung cho mọi màn. Vòng lặp của chuỗi: tự tay làm, bấm Chạy, xem hậu quả thật, sửa lại không mất gì.
import { CO_KHI, cham, GOI } from './man/index.mjs';
import { saoCua, luuNhap, docNhap, xoaNhap, banDaLuu, rungBat } from './kho.mjs';
import { manSau } from './tien-trinh.mjs';
import { icon, hangSao } from './icon.mjs';
import { phat } from './am-thanh.mjs';
import { moSoTay, moGoiY, duongMat } from './bang-truot.mjs';
import { moPhieu } from './phieu-viec.mjs';
import { moRap } from './ket-qua.mjs';

// Mở lại bản dở hoặc bản đã đạt nếu còn dùng được, không thì bắt đầu từ đầu.
function trangThaiMo(ck, man) {
  for (const [nguon, st] of [['nhap', docNhap(man.ma)], ['luu', banDaLuu(man.ma)]]) {
    if (!st) continue;
    try {
      const ban = JSON.parse(JSON.stringify(st));
      ck.do(ban, man);
      return { st: ban, nguon };
    } catch { /* bản lưu cũ không khớp cơ khí nữa thì bỏ */ }
  }
  return { st: ck.tao(man), nguon: null };
}

export function moBan(root, man, { boQuaPhieu = false } = {}) {
  const ck = CO_KHI[man.coKhi];
  const g = GOI[man.goiChiSo];
  const { st: stDau, nguon } = trangThaiMo(ck, man);
  const sao = saoCua(man.ma);
  root.innerHTML = `<main class="ban">
    <header class="ban-dau">
      <a class="nut-icon" href="#/goi/${man.goiId}" aria-label="Về danh sách màn">${icon('lui')}</a>
      <div class="ban-ten"><b>${man.ten}</b><small><span>Màn ${man.chiSo + 1}/${g.man.length}</span>${sao ? hangSao(sao) : `<span class="ma-bai">${man.baiHoc}</span>`}</small></div>
      <button class="nut-icon" type="button" id="nut-hoan" aria-label="Hoàn tác" disabled>${icon('hoanTac')}</button>
      <button class="nut-icon" type="button" id="nut-lai" aria-label="Làm lại từ đầu">${icon('lamLai')}</button>
    </header>
    <button class="nhiem-vu" type="button" id="nut-phieu" aria-label="Xem lại phiếu việc">
      <img class="mat" src="${duongMat(man.ai, man.mat)}" alt="" width="36" height="41">
      <span class="nhiem-vu-chu">${man.muc}</span>
      <span class="nhiem-vu-mo">${icon('tiep')}</span>
    </button>
    <section class="khung-san" id="san"></section>
    <div class="ban-duoi">
      <div class="loi-dan" aria-live="polite"><span class="dan-buoc" id="dan-buoc" hidden></span><span id="dan"></span></div>
      <nav class="bo-cu" id="bo-cu" aria-label="Bộ công cụ"></nav>
      <section class="khay" id="khay"></section>
    </div>
    <footer class="thanh-chay">
      <button type="button" id="nut-goi-y">${icon('denGoiY')}Gợi ý</button>
      <button type="button" class="nut-so-tay" id="nut-so-tay">${icon('soTay')}Sổ tay</button>
      <button type="button" class="nut-chay" id="nut-chay">${icon('chay')}${man.chay}</button>
    </footer>
  </main>`;

  const san = root.querySelector('#san');
  const khay = root.querySelector('#khay');
  const dan = root.querySelector('#dan');
  const danBuoc = root.querySelector('#dan-buoc');
  const boCu = root.querySelector('#bo-cu');
  const nutHoan = root.querySelector('#nut-hoan');
  const nutChay = root.querySelector('#nut-chay');
  const lichSu = [];
  const stMoi = JSON.stringify(ck.tao(man));
  let donCk = null;
  let soGoiY = 0;
  let soHong = 0;
  let hitTruoc = '';
  let henLuu = 0;
  let donRap = null;

  const ctx = {
    san, khay, man, boCu,
    cu: null,
    st: stDau,
    // Báo lúc vừa hít vào một mốc mới: một tiếng nhỏ và rung nhẹ, ngón tay không cần nhìn cũng biết.
    hit(khoa) {
      const k = khoa || '';
      if (k && k !== hitTruoc) {
        phat('hit');
        if (rungBat()) { try { navigator.vibrate?.(8); } catch { /* máy không rung được */ } }
      }
      hitTruoc = k;
    },
    ghi() {
      lichSu.push(JSON.stringify(ctx.st));
      if (lichSu.length > 80) lichSu.shift();
      nutHoan.disabled = false;
    },
    doi() {
      capNhatDan();
      phat('cham');
      henGhiNhap();
    },
  };

  function ghiNhap() {
    const hien = JSON.stringify(ctx.st);
    // Trùng đầu màn hoặc trùng bản đã đạt thì chẳng có gì dở để giữ: mở rồi thoát không thành "đang làm dở".
    if (hien === stMoi || hien === JSON.stringify(banDaLuu(man.ma))) xoaNhap(man.ma);
    else luuNhap(man.ma, ctx.st);
  }
  function henGhiNhap() {
    clearTimeout(henLuu);
    henLuu = setTimeout(ghiNhap, 400);
  }

  function capNhatDan() {
    root.querySelectorAll('.cu--nhac').forEach((n) => n.classList.remove('cu--nhac'));
    nutChay.classList.remove('nut-chay--moi');
    if (!man.dan) { dan.textContent = ''; danBuoc.hidden = true; return; }
    const d = ck.do(ctx.st, man);
    const i = man.dan.findIndex((b) => !b.xong(d, ctx.st, ctx.cu));
    const buoc = man.dan[i];
    if (!buoc) { dan.textContent = ''; danBuoc.hidden = true; return; }
    dan.innerHTML = buoc.txt;
    danBuoc.hidden = false;
    danBuoc.textContent = `${i + 1}/${man.dan.length}`;
    // Lời dẫn đã tới bước cuối thì nút Chạy gọi người chơi, đỡ phải đọc.
    if (i === man.dan.length - 1) nutChay.classList.add('nut-chay--moi');
    const canNhac = buoc.nhan && root.querySelector(`[data-cu="${buoc.nhan}"]`);
    if (canNhac && !canNhac.disabled && canNhac.getAttribute('aria-pressed') !== 'true') canNhac.classList.add('cu--nhac');
  }

  function dung() {
    if (donCk) donCk();
    boCu.innerHTML = '';
    donCk = ck.ve(ctx) || null;
    capNhatDan();
  }

  nutHoan.addEventListener('click', () => {
    const hien = JSON.stringify(ctx.st);
    let cu = lichSu.pop();
    // Lần kéo không nhúc nhích cũng ghi lịch sử, bỏ qua để Hoàn tác không bấm hụt.
    while (cu === hien && lichSu.length) cu = lichSu.pop();
    if (cu !== undefined) ctx.st = JSON.parse(cu);
    nutHoan.disabled = lichSu.length === 0;
    dung();
    henGhiNhap();
  });

  root.querySelector('#nut-lai').addEventListener('click', () => {
    ctx.ghi();
    ctx.st = ck.tao(man);
    // Làm lại về đúng bước đầu của lời dẫn, nên công cụ và kính cũng về mặc định.
    ctx.cu = null;
    ctx.kinhBat = false;
    dung();
    henGhiNhap();
  });

  const moGoiYMan = () => {
    soGoiY = Math.max(1, soGoiY);
    moGoiY(man, soGoiY, (n) => { soGoiY = n; });
  };
  root.querySelector('#nut-goi-y').addEventListener('click', moGoiYMan);
  root.querySelector('#nut-so-tay').addEventListener('click', () => moSoTay(man.soTay || []));
  root.querySelector('#nut-phieu').addEventListener('click', () => { moPhieu(man, { nhanNut: 'Làm tiếp' }); });

  nutChay.addEventListener('click', () => {
    const ket = cham(man, ctx.st);
    phat('chay');
    nutChay.disabled = true;
    if (!ket.dat) soHong++;
    donRap = moRap({
      man, ket, st: ctx.st, soGoiY, soHong,
      tiepCua: () => manSau(man),
      khiDong: () => {
        donRap = null;
        nutChay.disabled = false;
        nutChay.focus({ preventScroll: true });
      },
      khiGoiY: moGoiYMan,
    });
  });

  dung();

  // Báo bản được mở lại, vì sân khấu không còn ở trạng thái đầu màn.
  if (nguon) {
    const bao = document.createElement('div');
    bao.className = 'ban-bao';
    bao.setAttribute('role', 'status');
    bao.textContent = nguon === 'nhap' ? 'Đã mở lại bản bạn đang làm dở.' : 'Đã mở lại bản bạn từng làm. Muốn làm mới thì bấm nút quay vòng.';
    root.querySelector('.ban').appendChild(bao);
    setTimeout(() => bao.remove(), 3400);
  }

  if (!boQuaPhieu) moPhieu(man, { conDo: nguon === 'nhap' });

  const luuKhiAn = () => { if (document.visibilityState === 'hidden') ghiNhap(); };
  document.addEventListener('visibilitychange', luuKhiAn);

  return () => {
    clearTimeout(henLuu);
    document.removeEventListener('visibilitychange', luuKhiAn);
    // Đã đạt thì bản nháp vừa xóa không được quay lại; chưa từng Chạy đạt thì giữ công người chơi.
    if (!donRap) ghiNhap();
    donRap?.();
    if (donCk) donCk();
  };
}
