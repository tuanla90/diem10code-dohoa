// Đồ dùng chung của các cơ khí: sân SVG, kéo chạm một điểm, hàng công cụ, thanh trượt.
import { icon } from '../icon.mjs';

export function taoSvg(host, w, h, nhan) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
  svg.setAttribute('class', 'san-svg');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', nhan);
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
