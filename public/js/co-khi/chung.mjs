// Đồ dùng chung của các cơ khí: sân SVG, kéo chạm một điểm, hàng công cụ, thanh trượt.
import { icon } from '../icon.mjs';

export function taoSvg(host, w, h, nhan) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
  svg.setAttribute('class', 'san-svg');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', nhan);
  host.style.setProperty('--tile', w / h);
  host.appendChild(svg);
  return svg;
}

export function diemCham(el, e, W, H) {
  const r = el.getBoundingClientRect();
  return { x: ((e.clientX - r.left) * W) / r.width, y: ((e.clientY - r.top) * H) / r.height };
}

// Bắt sự kiện ở ngay gốc svg: vẽ lại nội dung giữa lúc kéo không làm mất ngón tay.
export function batKeo(el, W, H, batDau) {
  el.addEventListener('pointerdown', (e) => {
    if (e.button) return;
    const dich = e.target.closest?.('[data-h]');
    const pt = diemCham(el, e, W, H);
    const tt = batDau(dich?.dataset.h ?? null, pt, e);
    if (!tt) return;
    e.preventDefault();
    try { el.setPointerCapture(e.pointerId); } catch { /* máy cũ */ }
    const di = (ev) => { if (ev.pointerId === e.pointerId) tt.di?.(diemCham(el, ev, W, H)); };
    const nha = (ev) => {
      if (ev.pointerId !== e.pointerId) return;
      el.removeEventListener('pointermove', di);
      el.removeEventListener('pointerup', nha);
      el.removeEventListener('pointercancel', nha);
      tt.nha?.(diemCham(el, ev, W, H));
    };
    el.addEventListener('pointermove', di);
    el.addEventListener('pointerup', nha);
    el.addEventListener('pointercancel', nha);
  });
}

// ds: [{id, nhan, ic, bat, tat, bam, chu (html tự vẽ), sub}]. Mỗi lần gọi là vẽ lại cả hàng.
export function hangCu(host, ds, { deu = false } = {}) {
  const h = document.createElement('div');
  h.className = deu ? 'hang-cu hang-cu--deu' : 'hang-cu';
  h.setAttribute('role', 'toolbar');
  for (const c of ds) {
    if (!c) continue;
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'cu';
    b.dataset.cu = c.id;
    if (c.bat !== undefined) b.setAttribute('aria-pressed', String(!!c.bat));
    if (c.tat) b.disabled = true;
    b.innerHTML = `${c.tranh || (c.ic ? icon(c.ic) : '')}<span>${c.nhan}</span>${c.sub ? `<span class="cu-sub">${c.sub}</span>` : ''}`;
    b.addEventListener('click', () => c.bam?.());
    h.appendChild(b);
  }
  host.appendChild(h);
  return h;
}

// Thanh công cụ của mọi cơ khí: luôn hiện, chỉ một công cụ được cầm, sân khấu làm theo công cụ đang cầm.
// Công cụ đang cầm nằm ở ctx.cu nên Hoàn tác không làm rơi công cụ.
export function dungBoCu(ctx, ds, macDinh, khiDoi) {
  const loc = ds.filter(Boolean);
  if (!loc.some((c) => c.id === ctx.cu)) ctx.cu = macDinh;
  const host = ctx.boCu;
  const ve = () => {
    host.innerHTML = '';
    for (const c of loc) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'cong-cu';
      b.dataset.cu = `cu-${c.id}`;
      b.setAttribute('aria-pressed', String(ctx.cu === c.id));
      b.innerHTML = `${icon(c.ic)}<span>${c.nhan}</span>`;
      b.addEventListener('click', () => {
        if (ctx.cu === c.id) return;
        ctx.cu = c.id;
        ve();
        khiDoi?.();
        ctx.doi();
        // Máy thấp có thể giấu khay dưới thanh Chạy: chọn công cụ là phải thấy tùy chọn của nó.
        ctx.khay.scrollIntoView({ block: 'nearest' });
      });
      host.appendChild(b);
    }
  };
  ve();
}

// Hàng thẻ kéo được để đổi chỗ, như bảng lớp của các app vẽ. Chạm vẫn là chọn.
export function hangKeo(host, ds, khiDoi) {
  const h = hangCu(host, ds, { deu: true });
  h.classList.add('hang-keo');
  for (const nut of h.children) {
    nut.addEventListener('pointerdown', (e) => {
      if (e.button) return;
      const cac = [...h.children];
      const i = cac.indexOf(nut);
      const hop = cac.map((n) => n.getBoundingClientRect());
      const buoc = hop.length > 1 ? hop[1].left - hop[0].left : 0;
      let keo = false;
      let j = i;
      try { nut.setPointerCapture(e.pointerId); } catch { /* máy cũ */ }
      const di = (ev) => {
        const dx = ev.clientX - e.clientX;
        if (Math.abs(dx) > 6) keo = true;
        if (!keo) return;
        const giua = hop[i].left + hop[i].width / 2 + dx;
        j = hop.reduce((tot, r, k) => (Math.abs(r.left + r.width / 2 - giua) < Math.abs(hop[tot].left + hop[tot].width / 2 - giua) ? k : tot), 0);
        cac.forEach((n, k) => {
          if (k === i) { n.style.transform = `translateX(${dx}px)`; n.style.zIndex = '2'; return; }
          const nhuong = i < j && k > i && k <= j ? -buoc : i > j && k >= j && k < i ? buoc : 0;
          n.style.transform = nhuong ? `translateX(${nhuong}px)` : '';
        });
      };
      const nha = () => {
        nut.removeEventListener('pointermove', di);
        nut.removeEventListener('pointerup', nha);
        nut.removeEventListener('pointercancel', nha);
        cac.forEach((n) => { n.style.transform = ''; n.style.zIndex = ''; });
        if (!keo) return;
        // Vừa kéo xong thì lần click đi kèm không được tính là chọn.
        h.addEventListener('click', (ev) => { ev.stopPropagation(); ev.preventDefault(); }, { capture: true, once: true });
        if (j !== i) khiDoi(i, j);
      };
      nut.addEventListener('pointermove', di);
      nut.addEventListener('pointerup', nha);
      nut.addEventListener('pointercancel', nha);
    });
  }
  return h;
}

export function thanhTruot(host, { nhan, min, max, buoc = 1, gia, dinh = (v) => v, doi, xong, id }) {
  const d = document.createElement('div');
  d.className = 'truot';
  const ma = `tr-${id || nhan}`;
  d.innerHTML = `<label for="${ma}">${nhan}</label><input id="${ma}" type="range" min="${min}" max="${max}" step="${buoc}" value="${gia}"><output>${dinh(gia)}</output>`;
  const i = d.querySelector('input'), o = d.querySelector('output');
  i.addEventListener('input', () => { o.textContent = dinh(+i.value); doi(+i.value); });
  i.addEventListener('change', () => xong?.(+i.value));
  host.appendChild(d);
  return i;
}
