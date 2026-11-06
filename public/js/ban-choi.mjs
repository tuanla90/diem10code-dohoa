// Bàn chơi dùng chung cho mọi màn. Vòng lặp của chuỗi: tự tay làm, bấm Chạy, xem hậu quả thật, sửa lại không mất gì.
import { CO_KHI, cham } from './man/index.mjs';
import { saoCua, luuKetQua } from './kho.mjs';
import { icon } from './icon.mjs';
import { phat } from './am-thanh.mjs';
import { moBang, moSoTay, moGoiY, duongMat } from './bang-truot.mjs';

const CAU_DAT = {
  sola: ['Đúng ý mình luôn!', 'Sola nhảy cẫng lên rồi nè.', 'Ra được thế này thì yên tâm.'],
  luna: ['Gọn gàng lắm.', 'Luna ưng rồi đó.', 'Đúng cách, đúng việc.'],
};

export function moBan(root, man, { tiep }) {
  const ck = CO_KHI[man.coKhi];
  root.innerHTML = `<main class="ban">
    <header class="ban-dau">
      <a class="nut-icon" href="#/goi/${man.goiId}" aria-label="Về danh sách màn" style="color:inherit">${icon('lui')}</a>
      <div class="ban-ten">${man.ten}<small>Màn ${man.chiSo + 1} · ${man.baiHoc}</small></div>
      <button class="nut-icon" type="button" id="nut-hoan" aria-label="Hoàn tác" disabled>${icon('hoanTac')}</button>
      <button class="nut-icon" type="button" id="nut-lai" aria-label="Làm lại từ đầu">${icon('lamLai')}</button>
    </header>
    <section class="loi-nho">
      <img class="mat" src="${duongMat(man.ai, man.mat)}" alt="${man.ai === 'sola' ? 'Sola' : 'Luna'}" width="42" height="42">
      <div class="loi-nho-than"><div class="loi-nho-ai">${man.vai}</div><span class="loi-nho-cau">${man.nho}</span><span class="loi-nho-muc">${man.muc}</span></div>
    </section>
    <section class="khung-san" id="san"></section>
    <div class="loi-dan" id="dan" aria-live="polite"></div>
    <nav class="bo-cu" id="bo-cu" aria-label="Bộ công cụ"></nav>
    <section class="khay" id="khay"></section>
    <footer class="thanh-chay">
      <button type="button" id="nut-goi-y">${icon('denGoiY')}Gợi ý</button>
      <button type="button" class="nut-so-tay" id="nut-so-tay">${icon('soTay')}Sổ tay</button>
      <button type="button" class="nut-chay" id="nut-chay">${icon('chay')}${man.chay}</button>
    </footer>
  </main>`;

  const san = root.querySelector('#san');
  const khay = root.querySelector('#khay');
  const dan = root.querySelector('#dan');
  const boCu = root.querySelector('#bo-cu');
  const nutHoan = root.querySelector('#nut-hoan');
  const nutChay = root.querySelector('#nut-chay');
  const lichSu = [];
  let donCk = null;
  let soGoiY = 0;
  let henCanh = 0;
  let hitTruoc = '';

  const ctx = {
    san, khay, man, boCu,
    cu: null,
    st: ck.tao(man),
    // Báo lúc vừa hít vào một mốc mới: một tiếng nhỏ và rung nhẹ, ngón tay không cần nhìn cũng biết.
    hit(khoa) {
      const k = khoa || '';
      if (k && k !== hitTruoc) {
        phat('hit');
        try { navigator.vibrate?.(8); } catch { /* máy không rung được */ }
      }
      hitTruoc = k;
    },
    // Nhắc một câu khi người chơi thao tác không đúng với công cụ đang cầm.
    nhac(txt) { dan.innerHTML = txt; dan.classList.add('loi-dan--nhac'); },
    ghi() {
      lichSu.push(JSON.stringify(ctx.st));
      if (lichSu.length > 80) lichSu.shift();
      nutHoan.disabled = false;
    },
    doi() {
      capNhatDan();
      phat('cham');
    },
  };

  function capNhatDan() {
    root.querySelectorAll('.cu--nhac').forEach((n) => n.classList.remove('cu--nhac'));
    dan.classList.remove('loi-dan--nhac');
    if (!man.dan) { dan.textContent = ''; return; }
    const d = ck.do(ctx.st, man);
    const buoc = man.dan.find((b) => !b.xong(d, ctx.st, ctx.cu));
    if (!buoc) { dan.textContent = ''; return; }
    dan.innerHTML = buoc.txt;
    const canNhac = buoc.nhan && root.querySelector(`[data-cu="${buoc.nhan}"]`);
    if (canNhac && canNhac.getAttribute('aria-pressed') !== 'true') canNhac.classList.add('cu--nhac');
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
  });

  root.querySelector('#nut-lai').addEventListener('click', () => {
    ctx.ghi();
    ctx.st = ck.tao(man);
    ctx.cu = null; // Làm lại về đúng bước đầu của lời dẫn, nên công cụ cũng về mặc định.
    dung();
  });

  root.querySelector('#nut-goi-y').addEventListener('click', () => {
    soGoiY = Math.max(1, soGoiY);
    moGoiY(man, soGoiY, (n) => { soGoiY = n; });
  });
  root.querySelector('#nut-so-tay').addEventListener('click', () => moSoTay(man.soTay || []));

  nutChay.addEventListener('click', chay);

  function chay() {
    const ket = cham(man, ctx.st);
    phat('chay');
    nutChay.disabled = true;
    const canh = document.createElement('div');
    canh.className = 'canh';
    canh.innerHTML = man.canh(ctx.st, ket, ket.d, man);
    san.appendChild(canh);
    const giam = matchMedia('(prefers-reduced-motion: reduce)').matches;
    henCanh = setTimeout(() => hienKet(ket, canh), giam ? 150 : 1300);
  }

  function hienKet(ket, canh) {
    nutChay.disabled = false;
    const dong = () => {
      canh.remove();
      nutChay.focus({ preventScroll: true });
    };
    if (ket.dat) {
      phat('dung');
      const truoc = saoCua(man.ma);
      luuKetQua(man.ma, ket.sao);
      const hang = [1, 2, 3].map((i) => icon('sao', i <= ket.sao ? 'co' : '')).join('');
      const ds = ket.ds.filter((t) => t.sao);
      const cau = CAU_DAT[man.ai][Math.max(0, ket.sao - 1)];
      const ai = man.ai;
      const mat = ai === 'sola' ? 'celebrate-jump' : (ket.sao === 3 ? 'celebrate' : 'great-job');
      moBang(`<div class="ket-dau"><img class="mat" src="${duongMat(ai, mat)}" alt="" width="72" height="72">
          <div class="ket-loi"><div class="ket-qua-nguoi">${ai === 'sola' ? 'SOLA' : 'LUNA'}</div><h2>${cau}</h2></div></div>
        <div class="ket-sao" role="img" aria-label="${ket.sao} trên 3 sao">${hang}</div>
        ${truoc > ket.sao ? `<p class="nhan-phu" style="text-align:center">Kỷ lục cũ ${truoc} sao vẫn được giữ.</p>` : ''}
        ${ds.length ? `<ul class="ket-ds">${ds.map((t) => `<li class="${t.dat ? 'dat' : 'chua'}">${icon(t.dat ? 'xong' : 'them')}<span>${t.ten}</span></li>`).join('')}</ul>` : ''}
        <div class="ket-nut"><button class="nut-phu" type="button" data-dong>${ket.sao === 3 ? 'Xem lại' : 'Làm đẹp hơn'}</button><a class="nut-chinh" href="${tiep.hash}" style="text-decoration:none">${tiep.nhan}${icon('tiep')}</a></div>`,
      { nhan: 'Kết quả màn chơi', khiDong: dong });
      return;
    }
    phat('sai');
    const loi = ket.loi;
    const ai = loi.ai || man.ai;
    moBang(`<div class="ket-dau"><img class="mat" src="${duongMat(ai, loi.matLoi || 'confused')}" alt="" width="72" height="72">
        <div class="ket-loi"><div class="ket-qua-nguoi">${ai === 'sola' ? 'SOLA' : 'LUNA'}</div><h2>Ủa, chưa ổn rồi</h2><p>${loi.loi}</p></div></div>
      <div class="ket-nut"><button class="nut-chinh" type="button" data-dong>Sửa tiếp</button></div>`,
    { nhan: 'Kết quả màn chơi', khiDong: dong });
  }

  dung();

  return () => {
    clearTimeout(henCanh);
    if (donCk) donCk();
  };
}
