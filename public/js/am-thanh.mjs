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
  hit: () => not(1040, 0, 0.05, 0.05, 'triangle'),
  chay: () => { not(330, 0, 0.1); not(440, 0.08, 0.12); },
  sai: () => { not(220, 0, 0.16, 0.07, 'triangle'); not(165, 0.14, 0.24, 0.07, 'triangle'); },
  dung: () => { not(523, 0, 0.14); not(659, 0.12, 0.14); not(784, 0.24, 0.28); },
  // Ba sao lên cao dần, nghe là biết được mấy sao mà không cần nhìn.
  sao1: () => not(880, 0, 0.16, 0.06, 'triangle'),
  sao2: () => not(1047, 0, 0.16, 0.06, 'triangle'),
  sao3: () => { not(1319, 0, 0.26, 0.07, 'triangle'); not(1568, 0.06, 0.3, 0.04); },
  huyHieu: () => { not(659, 0, 0.12); not(880, 0.1, 0.12); not(1175, 0.2, 0.34); },
  toMau: () => { not(392, 0, 0.1); not(523, 0.07, 0.1); not(659, 0.14, 0.1); not(1047, 0.21, 0.32, 0.05); },
  lat: () => not(460, 0, 0.05, 0.03, 'triangle'),
  nhanThe: () => { not(523, 0, 0.1); not(784, 0.1, 0.24); },
};

export function phat(ten) {
  if (!loaBat()) return;
  try {
    if (ctx && ctx.state === 'suspended') ctx.resume();
    BAN[ten]?.();
  } catch { /* máy không phát được thì im */ }
}
