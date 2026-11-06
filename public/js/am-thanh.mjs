// Âm thanh tự tổng hợp bằng WebAudio, không cần tệp ngoài. Tôn trọng nút tắt loa.
import { loaBat } from './kho.mjs';

let ctx = null;
function may() {
  if (ctx) return ctx;
  const C = window.AudioContext || window.webkitAudioContext;
  if (!C) return null;
  ctx = new C();
  return ctx;
}

function not(tan, batDau, dai, am = 0.07, kieu = 'sine') {
  const m = may();
  if (!m) return;
  const t = m.currentTime + batDau;
  const o = m.createOscillator();
  const g = m.createGain();
  o.type = kieu;
  o.frequency.value = tan;
  g.gain.setValueAtTime(am, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dai);
  o.connect(g).connect(m.destination);
  o.start(t);
  o.stop(t + dai);
}

const BAN = {
  cham: () => not(620, 0, 0.06, 0.04, 'triangle'),
  chay: () => { not(330, 0, 0.1); not(440, 0.08, 0.12); },
  sai: () => { not(220, 0, 0.16, 0.07, 'triangle'); not(165, 0.14, 0.24, 0.07, 'triangle'); },
  dung: () => { not(523, 0, 0.14); not(659, 0.12, 0.14); not(784, 0.24, 0.28); },
};

export function phat(ten) {
  if (!loaBat()) return;
  try {
    if (ctx && ctx.state === 'suspended') ctx.resume();
    BAN[ten]?.();
  } catch { /* máy không phát được thì im */ }
}
