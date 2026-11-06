#!/usr/bin/env node
// Máy kiểm của Gương Mặt Ngày Hội. Chạy: npm test
// Điều quan trọng nhất nó canh: KHÔNG MÀN NÀO TỰ GIẢI. Đầu màn phải sai, giải mẫu qua đúng thao tác của
// cơ khí phải đạt 3 sao, và từng cách làm sai phải vấp đúng tiêu chí đã khai.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { GOI, CO_KHI, TAT_CA_MAN, cham } from '../public/js/man/index.mjs';
import { SO_TAY } from '../public/js/so-tay.mjs';
import { keoTay, gocKhung, chenNut, doLech, giong } from '../public/js/toan/hinh-hoc.mjs';

const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUB = path.join(GOC, 'public');
let dat = 0, hong = 0;
const loi = [];
function kiem(ten, ok, ghiChu = '') {
  if (ok) dat++;
  else { hong++; loi.push(`${ten}${ghiChu ? ` :: ${ghiChu}` : ''}`); }
}

/* ---------- 1. Từng màn: không tự giải ---------- */
const MA = new Set();
for (const man of TAT_CA_MAN) {
  const ck = CO_KHI[man.coKhi];
  kiem(`${man.ma} có cơ khí`, !!ck, man.coKhi);
  kiem(`${man.ma} mã không trùng`, !MA.has(man.ma));
  MA.add(man.ma);
  kiem(`${man.ma} có 3 gợi ý`, man.goiY?.length === 3);
  kiem(`${man.ma} có lời nhờ và mục tiêu`, !!man.nho && typeof man.muc === 'string' && !!man.muc);
  kiem(`${man.ma} có nút Chạy riêng`, !!man.chay);
  kiem(`${man.ma} có cảnh hậu quả`, typeof man.canh === 'function');
  for (const k of man.soTay || []) kiem(`${man.ma} trỏ Sổ tay có thật: ${k}`, !!SO_TAY[k]);

  const dau = ck.tao(man);
  const trang = JSON.stringify(dau);
  const kqDau = cham(man, dau);
  kiem(`${man.ma} đầu màn phải sai`, !kqDau.dat);

  // Bấm Chạy không đổi trạng thái, và Chạy lại cho cùng kết quả.
  cham(man, dau);
  kiem(`${man.ma} chấm không làm đổi trạng thái`, JSON.stringify(dau) === trang);

  // Giải mẫu qua đúng các thao tác của cơ khí.
  const stGiai = ck.tao(man);
  man.giai(stGiai, ck.lam);
  const kqGiai = cham(man, stGiai);
  kiem(`${man.ma} giải mẫu đạt`, kqGiai.dat, kqGiai.loi ? `vấp ${kqGiai.loi.id}: ${JSON.stringify(kqGiai.d)}` : '');
  kiem(`${man.ma} giải mẫu 3 sao`, kqGiai.sao === 3, `${kqGiai.sao} sao; chưa đạt: ${kqGiai.ds.filter((t) => t.sao && !t.dat).map((t) => t.id)} ${JSON.stringify(kqGiai.d)}`);

  // Cách làm sai vấp đúng tiêu chí.
  kiem(`${man.ma} có ít nhất một cách sai đã khai`, (man.sai || []).length >= 1);
  for (const s of man.sai || []) {
    const st = ck.tao(man);
    s.lam(st, ck.lam);
    const kq = cham(man, st);
    kiem(`${man.ma} sai "${s.ten}" không qua được`, !kq.dat, JSON.stringify(kq.d));
    kiem(`${man.ma} sai "${s.ten}" vấp ${s.loi}`, kq.loi?.id === s.loi, `vấp ${kq.loi?.id}; ${JSON.stringify(kq.d)}`);
  }

  // Mỗi tiêu chí bắt buộc phải có câu hậu quả và người nói.
  for (const t of man.tieuChi) {
    if (t.sao) { kiem(`${man.ma}/${t.id} có tên tiêu chí sao`, !!t.ten); continue; }
    kiem(`${man.ma}/${t.id} có câu hậu quả`, !!t.loi);
    kiem(`${man.ma}/${t.id} có người nói`, t.ai === 'sola' || t.ai === 'luna');
    const mat = path.join(PUB, 'mat', t.ai || 'sola', `${t.matLoi}.png`);
    kiem(`${man.ma}/${t.id} có ảnh mặt ${t.ai}/${t.matLoi}`, fs.existsSync(mat));
    kiem(`${man.ma}/${t.id} có ảnh mặt nền tối`, fs.existsSync(path.join(PUB, 'mat', 'toi', t.ai || 'sola', `${t.matLoi}.png`)));
  }
  kiem(`${man.ma} có ảnh mặt người nhờ`, fs.existsSync(path.join(PUB, 'mat', man.ai, `${man.mat}.png`)));
}

/* ---------- 2. Cơ khí: thao tác đúng như phần mềm thật ---------- */
{
  // Kéo góc: góc đối diện đứng yên, kể cả khi hình đang xoay.
  const v0 = { x: 100, y: 100, w: 80, h: 40, goc: 30 };
  const neoTruoc = gocKhung(v0)[0]; // góc trên trái
  const v1 = keoTay(v0, { sx: 1, sy: 1 }, 200, 180, false);
  const neoSau = gocKhung(v1)[0];
  kiem('Kéo góc: góc đối diện đứng yên', Math.hypot(neoTruoc.x - neoSau.x, neoTruoc.y - neoSau.y) < 0.01);
  const v2 = keoTay({ ...v0, goc: 0 }, { sx: 1, sy: 1 }, 300, 110, true);
  kiem('Khóa tỉ lệ: giữ nguyên ngang chia cao', Math.abs(v2.w / v2.h - 2) < 1e-6);
  const v3 = keoTay({ ...v0, goc: 0 }, { sx: 1, sy: 0 }, 300, 100, false);
  kiem('Kéo cạnh: chỉ đổi một chiều', v3.h === 40 && v3.w > 80);

  // Thêm nút không làm đổi hình.
  const n = [{ x: 0, y: 0, tron: false }, { x: 100, y: 0, tron: false }, { x: 100, y: 100, tron: false }, { x: 0, y: 100, tron: false }];
  const n2 = giong(n);
  chenNut(n2, 1);
  kiem('Thêm nút: có thêm một nút', n2.length === 5);
  // Hai đường so bằng điểm lấy mẫu cách nhau khoảng 4 đơn vị, nên dung sai 3 là đúng hình.
  kiem('Thêm nút: hình giữ nguyên', doLech(n, n2) < 3);

  // Lớp: đưa lên, xuống đổi đúng hai vị trí kề nhau.
  const lop = CO_KHI['lop-nhom'].lam;
  const st = { manh: [{ id: 'a', x: 0, y: 0, s: 1 }, { id: 'b', x: 0, y: 0, s: 1 }, { id: 'c', x: 0, y: 0, s: 1 }] };
  lop.len(st, 'a');
  kiem('Đưa lên: đổi chỗ với lớp ngay trên', st.manh.map((m) => m.id).join('') === 'bac');
  lop.xuong(st, 'b');
  kiem('Đưa xuống ở đáy: không đổi', st.manh.map((m) => m.id).join('') === 'bac');

  // Nhóm: kéo một mảnh, cả cụm đi. Không nhóm: chỉ mảnh đó đi.
  const s2 = { manh: [{ id: 'a', x: 0, y: 0, s: 1, nhom: 0 }, { id: 'b', x: 5, y: 5, s: 1, nhom: 0 }] };
  lop.di(s2, 'a', 10, 0);
  kiem('Chưa nhóm: chỉ một mảnh đi', s2.manh[0].x === 10 && s2.manh[1].x === 5);
  lop.nhom(s2, ['a', 'b']);
  lop.di(s2, 'a', 10, 0);
  kiem('Đã nhóm: cả cụm đi', s2.manh[0].x === 20 && s2.manh[1].x === 15);
}

/* ---------- 3. Trình tự mở khóa và dữ liệu ---------- */
kiem('Có đủ 5 gói', GOI.length === 5);
kiem('Có ít nhất 15 màn', TAT_CA_MAN.length >= 15, String(TAT_CA_MAN.length));
const baiHoc = GOI.map((g) => g.baiHoc).join(' ');
for (const b of ['C10-09', 'C10-10', 'C10-28', 'U11-09', 'U11-13']) kiem(`Bám bài ${b}`, baiHoc.includes(b));

/* ---------- 4. Luật của chuỗi trên mã nguồn ---------- */
function duyet(thuMuc, ds = []) {
  for (const t of fs.readdirSync(thuMuc, { withFileTypes: true })) {
    const p = path.join(thuMuc, t.name);
    if (t.isDirectory()) { if (t.name !== 'fonts' && t.name !== 'mat') duyet(p, ds); } else ds.push(p);
  }
  return ds;
}
const TEP = duyet(PUB);
const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B50}\u{2B55}\u{FE0F}]/u;
const NGOAI = /https?:\/\/(?!www\.w3\.org)/;
const HEX = /#[0-9a-fA-F]{3,8}\b/;
for (const t of TEP) {
  const ten = path.relative(GOC, t).replaceAll('\\', '/');
  const noi = fs.readFileSync(t, 'utf8');
  const dong = noi.split('\n');
  kiem(`${ten} dưới 1000 dòng`, dong.length < 1000, String(dong.length));
  kiem(`${ten} không có emoji`, !EMOJI.test(noi));
  kiem(`${ten} không gọi tài nguyên ngoài`, !NGOAI.test(noi));
  kiem(`${ten} không còn đường dẫn dự án cũ`, !/robot-game|robot-hoc|tin-hoc\/|D:\\/.test(noi));
  if (t.endsWith('.mjs')) {
    const choPhepHex = ten.endsWith('hinh.mjs') || ten.endsWith('anh.mjs') || ten.endsWith('chu-anh.mjs');
    if (!choPhepHex) kiem(`${ten} không viết hex ngoài bảng màu tranh`, !HEX.test(noi), (noi.match(HEX) || [])[0]);
    // Em dash chỉ được phép trong chú thích.
    const hienThi = dong.filter((d) => !d.trim().startsWith('//') && !d.trim().startsWith('*')).join('\n');
    kiem(`${ten} chữ hiển thị không có em dash`, !hienThi.includes('—'));
  }
  if (t.endsWith('.css') && !ten.endsWith('tokens.css')) {
    kiem(`${ten} không viết hex ngoài tokens`, !HEX.test(noi), (noi.match(HEX) || [])[0]);
    kiem(`${ten} không dùng color-mix`, !noi.includes('color-mix('));
  }
}
const html = fs.readFileSync(path.join(PUB, 'index.html'), 'utf8');
kiem('index có viewport cho điện thoại', /width=device-width/.test(html));
kiem('index chỉ nạp mã từ trong dự án', !/src="\/(robot|tin)/.test(html));
kiem('Có font tự chứa', fs.existsSync(path.join(PUB, 'fonts', 'gsflex-viet.woff2')));
kiem('Mọi tệp mã import được qua đường tương đối', TEP.filter((t) => t.endsWith('.mjs')).every((t) => {
  const noi = fs.readFileSync(t, 'utf8');
  return [...noi.matchAll(/from '(\.[^']+)'/g)].every((m) => fs.existsSync(path.resolve(path.dirname(t), m[1])));
}));

const css = fs.readFileSync(path.join(PUB, 'css', 'ban-choi.css'), 'utf8') + fs.readFileSync(path.join(PUB, 'css', 'khung.css'), 'utf8');
kiem('Khung dọc 430px có token', fs.readFileSync(path.join(PUB, 'css', 'tokens.css'), 'utf8').includes('--khung: 430px'));
kiem('Giảm chuyển động được tôn trọng', css.includes('prefers-reduced-motion'));
kiem('Sân khấu chặn cuộn khi kéo', css.includes('touch-action: none'));

/* ---------- 5. Máy chủ ---------- */
function goi(cong, duong) {
  return new Promise((ok, tuChoi) => {
    const r = http.request({ host: '127.0.0.1', port: cong, path: duong, method: 'GET' }, (res) => {
      res.resume();
      res.on('end', () => ok({ ma: res.statusCode, loai: res.headers['content-type'] }));
    });
    r.on('error', tuChoi);
    r.end();
  });
}
const CONG = 4297;
const may = spawn(process.execPath, ['server.js'], { cwd: GOC, env: { ...process.env, PORT: String(CONG), HOST: '127.0.0.1' }, stdio: 'pipe' });
await new Promise((ok) => { may.stdout.once('data', ok); setTimeout(ok, 1500); });
try {
  kiem('Máy chủ: trang chính 200', (await goi(CONG, '/')).ma === 200);
  const m = await goi(CONG, '/js/app.mjs');
  kiem('Máy chủ: .mjs là javascript', m.ma === 200 && /javascript/.test(m.loai), m.loai);
  kiem('Máy chủ: đường dẫn hỏng trả 400, không sập', (await goi(CONG, '/%E0%A4%A')).ma === 400);
  kiem('Máy chủ: vẫn sống sau đường dẫn hỏng', (await goi(CONG, '/')).ma === 200);
  kiem('Máy chủ: chặn thoát khỏi public', [403, 404].includes((await goi(CONG, '/..%2f..%2fserver.js')).ma));
  kiem('Máy chủ: chặn tiền tố giả', [403, 404].includes((await goi(CONG, '/../public-gia/x')).ma));
} catch (e) {
  kiem('Máy chủ chạy được', false, e.message);
} finally {
  may.kill();
}

console.log(`\n${dat} đạt, ${hong} hỏng`);
if (hong) {
  console.log(loi.map((l) => `  HỎNG  ${l}`).join('\n'));
  process.exit(1);
}
console.log(`Đủ ${GOI.length} gói, ${TAT_CA_MAN.length} màn. Không màn nào tự giải.`);
process.exit(0);
