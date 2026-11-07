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
import { hitMoc, hitGoc, hitTruc, mocCachDeu } from '../public/js/toan/hit.mjs';
import { toCo, duaThan, anhRobot, KHE_TAY, TAY_ANH, KHUNG_ANH } from '../public/js/toan/anh.mjs';
import { diemNenGan } from '../public/js/co-khi/tach-nen.mjs';
import { thongTinTep } from '../public/js/co-khi/bien-doi.mjs';
import { vungTay, mucDo } from '../public/js/co-khi/chung.mjs';
import { heSoAm, giayMo } from '../public/js/co-khi/dong-thoi-gian.mjs';
import { soOKinh } from '../public/js/kinh-soi.mjs';
import { MAU, ROBOT } from '../public/js/hinh.mjs';

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

/* ---------- Vạch đo: vùng xanh phải nói đúng như kết quả Chạy ---------- */
{
  const mauThu = {
    // Mọi vị trí thật của từng màn có thanh trượt hay tay kéo. Màn tách nền và chữ chỉ soi đầu màn, lời giải, các cách sai.
    'DH-4-1': (l) => { const ds = []; for (let s = -100; s <= 100; s += 5) for (let t = -100; t <= 100; t += 5) ds.push((st) => l.dat(st, s, t)); return ds; },
    'DH-4-5': (l) => { const ds = []; for (const goc of [false, true]) for (let s = -100; s <= 100; s += 10) for (let t = -100; t <= 100; t += 10) ds.push((st) => { if (goc) l.moGoc(st); l.dat(st, s, t); }); return ds; },
    'DH-5-5': (l) => { const ds = []; for (let a = 500; a <= 3000; a += 250) for (let m = 50; m <= 500; m += 50) ds.push((st) => { l.xep(st, ['a', 'b', 'c', 'd']); l.msKhung(st, 'a', a); for (const id of ['b', 'c', 'd']) l.msKhung(st, id, m); }); return ds; },
    'DH-5-3': (l) => { const ds = []; for (let a = 0; a <= 100; a += 5) for (let m = 0; m <= 8; m += 0.5) ds.push((st) => l.nhac(st, { am: a, mo: m })); return ds; },
    'DH-5-1': (l) => { const ds = []; for (const n of [7, 6, 5]) for (let ms = 50; ms <= 500; ms += 10) ds.push((st) => { st.khung.length = n; l.ms(st, ms); }); return ds; },
    'DH-3-4': (l) => { const ds = []; for (let c = 10; c <= 100; c += 5) ds.push((st) => { l.dd(st, 'tin', 'jpg'); l.cl(st, 'tin', c); }); return ds; },
    'DH-4-4': (l) => { const ds = []; for (let c = 12; c <= 40; c += 1) for (const mau of ['trang', 'muc', 'vang', 'hong']) ds.push((st) => l.dat(st, { x: 180, y: 30, co: c, mau })); return ds; },
  };
  for (const man of TAT_CA_MAN.filter((m) => m.dongHo)) {
    const ck = CO_KHI[man.coKhi];
    const ds = [() => {}, (st) => man.giai(st, ck.lam), ...(man.sai || []).map((s) => (st) => s.lam(st, ck.lam)), ...(mauThu[man.ma]?.(ck.lam) || [])];
    const lech = [];
    let soDat = 0;
    ds.forEach((lam, i) => {
      const st = ck.tao(man);
      lam(st);
      const d = ck.do(st, man);
      for (const m of man.dongHo) {
        const loai = mucDo(m, m.lay(d)).loai;
        const chamDat = m.tieu.every((id) => man.tieuChi.find((t) => t.id === id).ok(d));
        if ((loai === 'dat' || loai === 'dep') !== chamDat) lech.push(`${m.id} ở mẫu ${i} (${m.lay(d)})`);
      }
      if (man.tieuChi.every((t) => t.sao || t.ok(d))) soDat++;
    });
    kiem(`${man.ma} vùng xanh khớp tiêu chí ở mọi vị trí đã thử`, lech.length === 0, lech.slice(0, 3).join('; '));
    if (man.ma === 'DH-4-1') kiem('DH-4-1 vùng đạt không quá hẹp', soDat >= 30, `chỉ ${soDat} vị trí đạt`);
  }
  // Mọi màn chấm theo mốc số đều phải có vạch đo, để người chơi không phải đoán.
  for (const ma of ['DH-3-4', 'DH-4-1', 'DH-4-2', 'DH-4-3', 'DH-4-4', 'DH-4-5', 'DH-5-1', 'DH-5-3', 'DH-5-5']) kiem(`${ma} có vạch đo`, !!TAT_CA_MAN.find((m) => m.ma === ma)?.dongHo);

  // Ảnh đã cháy: không vị trí thanh nào lấy lại được nếp áo, đó là cả bài học của DH-4-5.
  {
    const man = TAT_CA_MAN.find((m) => m.ma === 'DH-4-5');
    const ck = CO_KHI[man.coKhi];
    let nepLon = 0;
    for (let s = -100; s <= 100; s += 20) for (let t = -100; t <= 100; t += 20) {
      const st = ck.tao(man);
      ck.lam.dat(st, s, t);
      nepLon = Math.max(nepLon, ck.do(st, man).nep);
    }
    kiem('DH-4-5 bản cháy không có nếp ở mọi vị trí thanh', nepLon === 0, `nep lớn nhất ${nepLon}`);
    const st = ck.tao(man);
    ck.lam.dat(st, -60, 30);
    ck.lam.moGoc(st);
    kiem('DH-4-5 mở bản gốc đưa hai thanh về 0', st.goc && st.sang === 0 && st.tp === 0);
  }

  // Thời gian riêng từng khung: chu kỳ là tổng thật, màn cũ không có ms riêng vẫn nhân như trước.
  {
    const ck = CO_KHI['khung-hinh'];
    const moi = TAT_CA_MAN.find((m) => m.ma === 'DH-5-5');
    const st = ck.tao(moi);
    moi.giai(st, ck.lam);
    kiem('DH-5-5 chu kỳ cộng thời gian từng khung', ck.do(st, moi).chuKy === 2800, `${ck.do(st, moi).chuKy}`);
    ck.lam.msKhung(st, 'b', 400);
    kiem('DH-5-5 đổi một khung không đụng khung khác', st.khung.find((k) => k.id === 'a').ms === 2500 && st.khung.find((k) => k.id === 'c').ms === 100);
    const cu = TAT_CA_MAN.find((m) => m.ma === 'DH-5-1');
    const stCu = ck.tao(cu);
    kiem('DH-5-1 chu kỳ vẫn bằng số khung nhân thời gian', ck.do(stCu, cu).chuKy === stCu.khung.length * stCu.ms);
  }

  // Rãnh nhạc: đường âm lượng đi ngang rồi dốc đều về 0 ở cuối, bản lưu cũ vẫn đọc được.
  const n = { ra: 30, am: 40, mo: 4 };
  kiem('Đường âm lượng: đoạn ngang đúng mức đã kéo', heSoAm(n, 10) === 0.4 && heSoAm(n, 26) === 0.4);
  kiem('Đường âm lượng: giữa đoạn dốc còn một nửa', Math.abs(heSoAm(n, 28) - 0.2) < 1e-9);
  kiem('Đường âm lượng: hết nhạc là về 0', heSoAm(n, 30) === 0);
  kiem('Không mờ dần thì nhạc giữ nguyên tới cuối', heSoAm({ ra: 30, am: 40, mo: 0 }, 30) === 0.4);
  kiem('Bản lưu cũ ghi mờ dần là true vẫn tính được', giayMo({ mo: true }) === 2 && giayMo({ mo: false }) === 0);
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

  // Lớp: kéo thẻ từ chỗ này sang chỗ kia, các thẻ giữa nhường chỗ.
  const lop = CO_KHI['lop-nhom'].lam;
  const st = { manh: [{ id: 'a', x: 0, y: 0, s: 1 }, { id: 'b', x: 0, y: 0, s: 1 }, { id: 'c', x: 0, y: 0, s: 1 }] };
  lop.doiLop(st, 2, 0);
  kiem('Kéo thẻ lớp về đầu: các thẻ khác nhường chỗ', st.manh.map((m) => m.id).join('') === 'cab');
  lop.doiLop(st, 0, 1);
  kiem('Kéo thẻ lớp sang kề bên', st.manh.map((m) => m.id).join('') === 'acb');

  // Căn chỉnh theo hình mẫu: hình mẫu đứng yên, các hình kia làm theo.
  const s3 = { manh: [{ id: 'hd1', x: 0, y: 10, s: 0.5 }, { id: 'hd2', x: 80, y: 60, s: 0.8 }, { id: 'hd3', x: 200, y: 30, s: 0.6 }] };
  const y2 = s3.manh[1].y, s2g = s3.manh[1].s;
  lop.cungCo(s3, ['hd1', 'hd2', 'hd3'], 'hd2');
  kiem('Cùng cỡ theo mẫu: mọi hình bằng cỡ hình mẫu', s3.manh.every((m) => m.s === s2g));
  kiem('Cùng cỡ theo mẫu: hình mẫu đứng yên', s3.manh[1].y === y2 && s3.manh[1].x === 80);
  lop.canGiua(s3, ['hd1', 'hd2', 'hd3'], 'hd2');
  kiem('Căn hàng theo mẫu: hàng đi theo hình mẫu', s3.manh[0].y === y2 && s3.manh[2].y === y2 && s3.manh[1].y === y2);

  // Bộ hít: lệch ít thì nắn về, lệch nhiều thì để yên.
  kiem('Hít mốc: lệch ít về đúng mốc', hitMoc(107, [100, 200]) === 100);
  kiem('Hít mốc: lệch nhiều không hít', hitMoc(130, [100, 200]) === null);
  kiem('Hít mốc: chọn mốc gần hơn', hitMoc(150, [145, 153]) === 153);
  kiem('Hít góc: gần thẳng về 0', hitGoc(4) === 0 && hitGoc(-5) === 0);
  kiem('Hít góc: nghiêng rõ thì giữ nguyên', hitGoc(14) === null);
  const ht = hitTruc(92, 20, [{ t: 100, neo: 0 }, { t: 105, neo: 0.5 }]);
  kiem('Hít trục: tâm hộp về đường gióng gần nhất', ht?.doi === 3 && ht?.moc.t === 105);
  kiem('Hít trục: xa mọi mốc thì không hít', hitTruc(0, 20, [{ t: 100, neo: 0 }]) === null);
  const cd = mocCachDeu([{ x: 0, w: 20 }, { x: 40, w: 20 }], 20);
  kiem('Cách đều: gợi ý đúng chỗ giữ khoảng hở', cd.some((m) => m.t === 80) && cd.some((m) => m.t === -40));

  // Cọ bám mép: tâm cọ bên nào thì chỉ tô bên đó.
  const anhThu = { w: 5, h: 1, that: Uint8Array.from([0, 0, 1, 1, 1]) };
  const mn = new Uint8Array(5);
  toCo(anhThu, 1, 0, 3, 1, mn, true);
  kiem('Cọ xóa bám mép: tâm ở nền thì không xóa vào rô bốt', mn.join('') === '11000');
  const mc = new Uint8Array(5);
  toCo(anhThu, 1, 0, 3, 1, mc);
  kiem('Cọ không bám mép vẫn lem như cũ', mc.join('') === '11111');
  const mg = new Uint8Array(5).fill(1);
  toCo(anhThu, 1, 0, 3, 0, mg, true);
  kiem('Cọ giữ bám mép: tâm lệch sang nền vẫn tìm về rô bốt, không trả lại nền', mg.join('') === '11000');
  const mx = new Uint8Array(5);
  toCo(anhThu, 2, 0, 3, 1, mx, true);
  kiem('Cọ xóa bám mép: tâm lệch lên rô bốt vẫn tìm về nền, không ăn rô bốt', mx.join('') === '11000');
  // Ảnh chụp và tranh vector phải là một rô bốt, và khe tay đủ to để chạm bằng ngón tay.
  for (const kieu of [1, 2]) {
    const anh = anhRobot(kieu);
    for (const [x, y] of KHE_TAY) {
      let rong = 0;
      for (let i = x; !anh.that[y * anh.w + i] && i < anh.w; i++) rong++;
      for (let i = x - 1; !anh.that[y * anh.w + i] && i >= 0; i--) rong++;
      kiem(`Ảnh rô bốt ${kieu}: khe tay tại ${x} rộng ít nhất 15 điểm ảnh`, rong >= 15);
    }
    // Ăng ten, đầu, kính, ngực và bàn tay nằm đúng chỗ của robot(), đọc qua khung đặt rô bốt lên ảnh.
    const mau = (fx, fy) => { const k = (Math.floor(KHUNG_ANH.oy + fy * KHUNG_ANH.s) * anh.w + Math.floor(KHUNG_ANH.ox + fx * KHUNG_ANH.s)) * 4; return [anh.data[k], anh.data[k + 1], anh.data[k + 2]]; };
    const gan = (a, hex) => Math.hypot(a[0] - parseInt(hex.slice(1, 3), 16), a[1] - parseInt(hex.slice(3, 5), 16), a[2] - parseInt(hex.slice(5, 7), 16)) < 16;
    kiem(`Ảnh rô bốt ${kieu} cùng màu với robot(): bóng ăng ten, đầu, kính, ngực, tim, bàn tay`,
      gan(mau(60, 6), MAU.cyan) && gan(mau(45, 27), MAU.vo) && gan(mau(60, 54), MAU.kinhSang) && gan(mau(54, 97), MAU.chan) && gan(mau(60, 97), MAU.cyan) && gan(mau(...ROBOT.hong[0][2]), MAU.cyan));
    // Tay tì bánh xích không được dài hơn hẳn tay vẫy: cùng một rô bốt thì tay phải bằng nhau.
    const daiTay = (d) => d.slice(1).reduce((t, p, i) => t + Math.hypot(p[0] - d[i][0], p[1] - d[i][1]), 0);
    kiem(`Ảnh rô bốt ${kieu}: tay tì bánh xích dài không quá 1,25 lần tay vẫy`, daiTay(ROBOT.hong[0]) <= daiTay(ROBOT.vay) * 1.25);
    kiem(`Ảnh rô bốt ${kieu}: đầu to hơn thân, thân rộng hơn cao, bánh xích nằm hai bên thân`, ROBOT.dau.w > ROBOT.than.w * 1.5 && ROBOT.than.w > ROBOT.than.h && ROBOT.dau.h > ROBOT.than.h && ROBOT.chan[0].x < ROBOT.than.x && ROBOT.chan[1].x + ROBOT.chan[1].w > ROBOT.than.x + ROBOT.than.w);
  }
  const mNgoai = new Uint8Array(5).fill(1);
  toCo(anhThu, 0, 0, 1, 0, mNgoai, true);
  kiem('Cọ giữ ngoài tầm rô bốt: không trả lại nền đã xóa', mNgoai.join('') === '11111');
  // Cọ mặc định DH-4-3 cỡ 12: nét lệch 6 điểm ảnh khỏi tay (khoảng 12 px màn hình) vẫn đủ 3 sao.
  {
    const anh = anhRobot(2), m = new Uint8Array(anh.w * anh.h);
    duaThan(anh, 12, 12, 25, m); duaThan(anh, 12, 170, 25, m);
    const truoc = m.reduce((t, v, i) => t + (v && !anh.that[i] ? 1 : 0), 0);
    for (const tay of TAY_ANH) for (let i = 0; i < 2; i++) for (let t = 0; t <= 12; t++) toCo(anh, Math.round(tay[i][0] + ((tay[i + 1][0] - tay[i][0]) * t) / 12), Math.round(tay[i][1] + 6 + ((tay[i + 1][1] - tay[i][1]) * t) / 12), 12, 0, m, true);
    const robot = anh.that.reduce((t, v) => t + v, 0), mat = m.reduce((t, v, i) => t + (v && anh.that[i] ? 1 : 0), 0);
    kiem('Cọ giữ cỡ 12 lệch 6 điểm ảnh: mất dưới 0,5% rô bốt, không trả lại nền', (mat / robot) * 100 <= 0.5 && m.reduce((t, v, i) => t + (v && !anh.that[i] ? 1 : 0), 0) === truoc);
  }
  kiem('Đũa thần: chạm lệch lên rô bốt thì trượt sang nền', diemNenGan(anhThu, 2, 0).x === 0);
  // Chạm sát viền tay: mẫu màu 3x3 không được lẫn viền, nếu không đũa thần chỉ chọn được vài điểm ảnh.
  {
    const anh = anhRobot(1);
    for (const [x, y] of KHE_TAY) {
      for (const [dx, dy] of [[-7, -4], [7, -4], [-5, 5], [5, 5], [0, -6], [0, 6]]) {
        const d = diemNenGan(anh, x + dx, y + dy), m = new Uint8Array(anh.w * anh.h);
        duaThan(anh, d.x, d.y, 30, m);
        kiem(`Đũa thần: chạm lệch (${dx}, ${dy}) quanh khe tay ${x} vẫn dọn được cả ô`, !!m[y * anh.w + x]);
      }
    }
  }
  kiem('Đũa thần: chạm đúng nền thì giữ nguyên', diemNenGan(anhThu, 0, 0).x === 0);

  // Soi tệp: số trong bảng phải khớp đúng luật chấm của màn, và kính chỉ thấy ô khi ô đủ to để thấy.
  const manSoi = TAT_CA_MAN.find((m) => m.san?.cu?.includes('soi'));
  const thuTep = (tep, w) => thongTinTep({ tep }, manSoi, { w, h: w });
  const netMan = manSoi.tieuChi.find((t) => t.id === 'net');
  for (const [tep, w] of [['chup', 88], ['web', 88], ['web', 60], ['svg', 88], ['svg', 10]]) {
    const t = thuTep(tep, w);
    kiem(`Bảng tệp ${tep} cỡ ${w} báo đúng như lúc chấm`, t.dat === netMan.ok({ matDo: t.matDo }), JSON.stringify(t));
  }
  kiem('Bảng tệp: ảnh chụp phóng to bị báo vỡ', !thuTep('chup', 88).dat);
  kiem('Bảng tệp: tệp 800 điểm in nhỏ thì đủ nét', thuTep('web', 60).dat);
  kiem('Bảng tệp: vector luôn đủ nét', thuTep('svg', 88).dat);
  kiem('Kính soi: vector không có ô', soOKinh(Infinity) === 0);
  kiem('Kính soi: tệp ít điểm thì thấy rõ ô', soOKinh(thuTep('chup', 88).matDo) > 0 && soOKinh(thuTep('chup', 88).matDo) < 20);
  kiem('Kính soi: in to hơn thì ô to hơn', soOKinh(thuTep('web', 88).matDo) < soOKinh(thuTep('web', 70).matDo));

  // Vùng chạm tay nắm: hình nhỏ cỡ nào cũng phải còn phần giữa để kéo thân, và tay nắm vẫn đủ rộng cho ngón tay.
  for (const c of [24, 32, 48, 64, 100, 220]) {
    const goc = vungTay(1, 1, c, c);
    const thanRong = (goc.x) * 2; // Mép trong của vùng góc tới tâm, nhân đôi là phần giữa còn lại.
    kiem(`Tay nắm hình cỡ ${c}: còn ít nhất nửa hình để kéo thân`, thanRong >= c * 0.5, String(thanRong));
    kiem(`Tay nắm hình cỡ ${c}: vùng góc đủ rộng cho ngón tay`, goc.w >= 44 && goc.h >= 44);
    const tren = vungTay(0, -1, c, c), phai = vungTay(1, 1, c, c);
    if (tren) kiem(`Tay nắm hình cỡ ${c}: tay giữa cạnh không đè tay góc`, tren.x + tren.w <= phai.x + 0.01);
  }
  kiem('Tay nắm: cạnh quá ngắn thì bỏ tay nắm giữa cạnh', vungTay(0, -1, 24, 24) === null);
  kiem('Tay nắm: tiêu đề dẹt vẫn có tay nắm góc', vungTay(1, 1, 120, 30).h >= 44);

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
for (const ten of fs.readdirSync(path.join(PUB, 'js', 'co-khi'))) {
  // Đường gióng có thể là hình khép kín. Quên fill thì SVG tô đen cả khung lúc hít.
  const noiCk = fs.readFileSync(path.join(PUB, 'js', 'co-khi', ten), 'utf8');
  const thieuFill = [...noiCk.matchAll(/<path d="\$\{(?:dan|gion)\}"[^>]*>/g)].filter((m) => !m[0].includes('fill="none"'));
  kiem(`${ten} đường gióng không tô nền`, thieuFill.length === 0, thieuFill[0]?.[0]);
  // Như phần mềm thật: chỉ sửa ảnh và tách nền mới đổi công cụ. Các màn khác thao tác trực tiếp trên hình đang chọn.
  if (ten === 'chung.mjs') continue;
  const canBoCu = ten === 'sua-anh.mjs' || ten === 'tach-nen.mjs';
  kiem(`${ten} ${canBoCu ? 'có' : 'không có'} thanh công cụ`, noiCk.includes('dungBoCu(') === canBoCu);
  if (!canBoCu) kiem(`${ten} không phụ thuộc công cụ đang cầm`, !noiCk.includes('ctx.cu'));
}
const CU_CON_LAI = new Set(TAT_CA_MAN.filter((m) => m.coKhi === 'sua-anh' || m.coKhi === 'tach-nen').map((m) => m.ma));
for (const m of TAT_CA_MAN) {
  const cuCu = (m.dan || []).filter((b) => b.nhan?.startsWith('cu-') && !CU_CON_LAI.has(m.ma));
  kiem(`${m.ma} lời dẫn không gọi công cụ đã gộp`, cuCu.length === 0, cuCu[0]?.nhan);
}

/* ---------- 5. Vỏ game: bản vẽ, tiến trình, huy hiệu, Mắt Thiết Kế ---------- */
{
  // Có sẵn một bản lưu kiểu cũ (chỉ có sao) để canh người chơi cũ không mất tiến độ khi vỏ game đổi.
  const BO_NHO = new Map([['dohoa_tien_do_v1', JSON.stringify({ man: { 'DH-1-1': { sao: 2 } } })]]);
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: { getItem: (k) => (BO_NHO.has(k) ? BO_NHO.get(k) : null), setItem: (k, v) => BO_NHO.set(k, String(v)), removeItem: (k) => BO_NHO.delete(k) },
  });
  const kho = await import('../public/js/kho.mjs');
  const tt = await import('../public/js/tien-trinh.mjs');
  const { MON, monCua, banVe, tranhMon } = await import('../public/js/the-gioi.mjs');
  const { CAU } = await import('../public/js/trang/mat-tinh-cau.mjs');
  const { lamRieng } = await import('../public/js/thanh-pham.mjs');
  const { icon } = await import('../public/js/icon.mjs');
  const { thoat } = await import('../public/js/trang/vo.mjs');
  const sach = (s) => typeof s === 'string' && s.length > 0 && !/undefined|NaN/.test(s);

  // Bản lưu cũ
  kiem('Lưu cũ: giữ nguyên sao', kho.saoCua('DH-1-1') === 2);
  kiem('Lưu cũ: trường mới có giá trị mặc định', kho.tenNguoi() === '' && !kho.coHuyHieu('goi-1') && kho.matTinhTot() === 0);

  // Bản vẽ Ngày hội: mỗi màn đúng một món, mỗi món đúng một màn.
  for (const m of TAT_CA_MAN) kiem(`${m.ma} có đúng một món trên bản vẽ`, MON.filter((x) => x.ma === m.ma).length === 1 && monCua(m.ma)?.ma === m.ma);
  kiem('Không có món nào thừa', MON.length === TAT_CA_MAN.length && MON.every((x) => MA.has(x.ma)));
  for (const x of MON) {
    kiem(`Món ${x.ma} có tên và chỗ đặt`, !!x.ten && !!x.noi);
    kiem(`Món ${x.ma} vẽ được hai trạng thái`, sach(tranhMon(x.ma, true)) && sach(tranhMon(x.ma, false)));
  }
  const veTrang = banVe({ daXong: () => false, ke: 'DH-1-1', nhan: 'thử' });
  const veDu = banVe({ daXong: () => true, nhan: 'thử' });
  kiem('Bản vẽ trắng: mọi món là nét', sach(veTrang) && (veTrang.match(/bv-net/g) || []).length >= MON.length);
  // Chỉ còn lớp nét của dãy nhà nằm dưới lớp màu, món nào cũng đã có màu.
  kiem('Bản vẽ đủ: không còn món nét', sach(veDu) && (veDu.match(/bv-net/g) || []).length === 1 && (veDu.match(/bv-mau/g) || []).length === MON.length);

  // Bản lưu đã chơi xong trước khi có màn mới: phần đã đi qua không được khóa lại, màn mới hiện ra là việc kế tiếp.
  kho.xoaHetTienDo();
  for (const m of TAT_CA_MAN) if (m.ma !== 'DH-3-5') kho.ghiDat(m.ma, { sao: 3, st: { ban: 1 } });
  const g3 = GOI.findIndex((g) => g.man.some((m) => m.ma === 'DH-3-5'));
  kiem('Thêm màn mới: các gói sau vẫn mở', GOI.every((_g, i) => tt.dangMoGoi(i)));
  kiem('Thêm màn mới: màn đã qua sau nó vẫn mở', GOI[g3].man.every((_m, i) => tt.dangMoMan(GOI[g3], i)));
  kiem('Thêm màn mới: màn mới là việc kế tiếp', tt.manTiepTheo()?.man.ma === 'DH-3-5');
  // Chơi đúng trình tự thì chưa qua màn trước vẫn phải khóa màn sau.
  kho.xoaHetTienDo();
  kho.ghiDat('DH-1-1', { sao: 3, st: { ban: 1 } });
  kiem('Mới qua màn 1: màn 2 mở, màn 3 và gói sau còn khóa', tt.dangMoMan(GOI[0], 1) && !tt.dangMoMan(GOI[0], 2) && !tt.dangMoGoi(1));

  // Chơi xuyên từ đầu tới cuối đúng trình tự.
  kho.xoaHetTienDo();
  kiem('Xóa tiến độ: về 0 sao', kho.tongSao() === 0 && kho.saoCua('DH-1-1') === 0);
  kiem('Đầu game: chỉ mở gói đầu', tt.dangMoGoi(0) && !tt.dangMoGoi(1));
  kiem('Đầu game: màn 2 còn khóa', !tt.dangMoMan(GOI[0], 1));
  const huyDaCo = new Set();
  for (const m of TAT_CA_MAN) {
    const g = GOI[m.goiChiSo];
    kiem(`${m.ma} là màn kế tiếp đúng thứ tự`, tt.manTiepTheo()?.man.ma === m.ma);
    kho.ghiLanChay(m.ma, true);
    kiem(`${m.ma} lần đầu qua được báo để tô màu`, kho.ghiDat(m.ma, { sao: 3, st: { ban: 1 } }) === true);
    kiem(`${m.ma} qua lại không tô màu lần nữa`, kho.ghiDat(m.ma, { sao: 3, st: { ban: 1 } }) === false);
    const cuoiGoi = m.chiSo === g.man.length - 1;
    const sau = tt.manSau(m);
    if (!cuoiGoi) kiem(`${m.ma} đi tiếp đúng màn sau`, sau.hash === `#/man/${g.man[m.chiSo + 1].ma}`, sau.hash);
    else {
      kiem(`${m.ma} xong gói thì có màn mừng`, sau.hash === `#/xong-goi/${g.id}`, sau.hash);
      kho.ghiXemGoi(g.id);
      const mong = m.goiChiSo < GOI.length - 1 ? `#/goi/${GOI[m.goiChiSo + 1].id}` : '#/khai-mac';
      kiem(`${m.ma} xem màn mừng rồi đi tiếp`, tt.manSau(m).hash === mong, tt.manSau(m).hash);
    }
    for (const h of tt.xetHuyHieu()) {
      kiem(`Huy hiệu ${h.id} không trao hai lần`, !huyDaCo.has(h.id));
      huyDaCo.add(h.id);
    }
    kiem(`Sau ${m.ma} không còn huy hiệu sót`, tt.xetHuyHieu().length === 0);
  }
  kiem('Chơi hết: xong toàn bộ', tt.xongHet() && tt.manTiepTheo() === null);
  kiem('Chơi hết: đủ sao', kho.tongSao() === tt.tongSaoToiDa);
  kiem('Chơi hết: danh hiệu cao nhất', tt.danhHieu().ten === tt.DANH_HIEU.at(-1).ten && tt.danhHieu().tiLe === 1);
  kiem('Danh hiệu cuối đúng bằng tổng sao', tt.DANH_HIEU.at(-1).tu === tt.tongSaoToiDa);
  kiem('Danh hiệu xếp tăng dần', tt.DANH_HIEU.every((d, i, a) => i === 0 || d.tu > a[i - 1].tu));
  for (const id of ['goi-1', 'goi-2', 'goi-3', 'goi-4', 'goi-5', 'ba-sao', 'mot-lan', 'tu-luc', 'tron-sao']) kiem(`Chơi hết: có huy hiệu ${id}`, kho.coHuyHieu(id));
  kho.ghiMatTinh(tt.SO_CAU_MAT_TINH);
  for (const k of Object.keys(SO_TAY).slice(0, 10)) kho.ghiDocTay(k);
  const huyCuoi = tt.xetHuyHieu().map((h) => h.id);
  kiem('Mắt tinh và Mọt Sổ tay được trao', ['mat-tinh', 'doc-so-tay'].every((id) => huyCuoi.includes(id)), huyCuoi.join());

  // Không phạt: làm kém hơn không mất kỷ lục, và bền bỉ được thưởng.
  kho.xoaHetTienDo();
  kho.ghiDat('DH-1-1', { sao: 3, st: { ban: 'tot' } });
  kho.ghiDat('DH-1-1', { sao: 1, st: { ban: 'kem' } });
  kiem('Làm kém hơn: giữ sao cũ', kho.saoCua('DH-1-1') === 3);
  kiem('Làm kém hơn: giữ thành phẩm tốt nhất', kho.banDaLuu('DH-1-1').ban === 'tot');
  for (let i = 0; i < 3; i++) kho.ghiLanChay('DH-1-2', false);
  kho.ghiLanChay('DH-1-2', true);
  kho.ghiDat('DH-1-2', { sao: 1, st: {} });
  kiem('Sai 3 lần rồi qua: có Không bỏ cuộc', tt.xetHuyHieu().some((h) => h.id === 'kien-tri'));
  kiem('Sai rồi mới qua: không tính một phát ăn ngay', !kho.hoSoMan('DH-1-2').motLan);
  kho.luuNhap('DH-1-3', { x: 1 });
  kiem('Bản nháp: đọc lại được', kho.docNhap('DH-1-3')?.x === 1);
  kho.xoaNhap('DH-1-3');
  kiem('Bản nháp: xóa được', kho.docNhap('DH-1-3') === null);
  kho.xoaHetTienDo();

  // Huy hiệu và tên người chơi
  kiem('Huy hiệu không trùng mã', new Set(tt.HUY_HIEU.map((h) => h.id)).size === tt.HUY_HIEU.length);
  for (const h of tt.HUY_HIEU) kiem(`Huy hiệu ${h.id} có đủ tên, cách mở, icon`, !!h.ten && !!h.mo && sach(icon(h.ic)));
  kiem('Tên người chơi không chèn được thẻ', !thoat('<img src=x onerror=a>"').match(/[<>"]/));

  // Mắt Thiết Kế: hai bản phải khác nhau, câu của gói nào chỉ dùng kiến thức gói đó.
  kiem('Mắt Thiết Kế đủ câu cho một lượt', CAU.length >= tt.SO_CAU_MAT_TINH, String(CAU.length));
  kiem('Mắt Thiết Kế: gói đầu đã có câu để chơi', CAU.filter((c) => c.goi === 0).length >= 3);
  CAU.forEach((c, i) => {
    const ten = `Mắt Thiết Kế câu ${i + 1}`;
    kiem(`${ten} có câu hỏi và lý do`, !!c.hoi && !!c.vi);
    kiem(`${ten} thuộc gói có thật`, !!GOI[c.goi]);
    kiem(`${ten} trỏ Sổ tay có thật`, !!SO_TAY[c.k], c.k);
    const a = c.dung(), b = c.sai();
    kiem(`${ten} vẽ được cả hai bản`, sach(a) && sach(b));
    kiem(`${ten} hai bản khác nhau`, a !== b);
  });
  kiem('Làm riêng: mã nội bộ không trùng giữa hai lần vẽ', lamRieng('<a id="x" fill="url(#x)"/>') !== lamRieng('<a id="x" fill="url(#x)"/>'));
  kiem('Làm riêng: giữ mã dùng chung', lamRieng('<a fill="url(#gr-logo)"/>').includes('url(#gr-logo)'));

  // Thành phẩm vẽ lại được từ trạng thái đã lưu qua JSON. Tranh cần canvas chỉ vẽ được trên máy thật, chơi thử đã phủ.
  for (const m of TAT_CA_MAN) {
    const ck = CO_KHI[m.coKhi];
    const st = ck.tao(m);
    m.giai(st, ck.lam);
    const ban = JSON.parse(JSON.stringify(st));
    try {
      const ket = cham(m, ban);
      kiem(`${m.ma} chấm lại bản lưu vẫn 3 sao`, ket.sao === 3);
      kiem(`${m.ma} vẽ lại được thành phẩm`, sach(m.canh(ban, ket, ket.d, m)));
    } catch (e) {
      kiem(`${m.ma} vẽ lại được thành phẩm`, /document|ImageData/.test(e.message), e.message);
    }
  }

  // Các tham chiếu viết bằng chữ: sai một ký tự là icon trống, ảnh vỡ hoặc đường dẫn chết.
  const MA_NGUON = TEP.filter((t) => t.endsWith('.mjs')).map((t) => fs.readFileSync(t, 'utf8'));
  const ICON = new Set(MA_NGUON.flatMap((n) => [...n.matchAll(/\bicon\('(\w+)'/g), ...n.matchAll(/\bic: '(\w+)'/g)].map((m) => m[1])));
  for (const ten of ICON) kiem(`Icon có thật: ${ten}`, sach(icon(ten)));
  const MAT = new Set(MA_NGUON.flatMap((n) => [...n.matchAll(/duongMat\('(sola|luna)', '([\w-]+)'\)/g)].map((m) => `${m[1]}/${m[2]}`)));
  for (const l of Object.values(tt.LOI_XONG_GOI)) MAT.add(`${l.ai}/${l.mat}`);
  for (const ten of MAT) {
    kiem(`Ảnh mặt có thật: ${ten}`, fs.existsSync(path.join(PUB, 'mat', `${ten}.png`)));
    kiem(`Ảnh mặt nền tối có thật: ${ten}`, fs.existsSync(path.join(PUB, 'mat', 'toi', `${ten}.png`)));
  }
  for (const g of GOI) kiem(`${g.id} có lời mừng xong gói`, !!tt.LOI_XONG_GOI[g.id]);
  const APP = fs.readFileSync(path.join(PUB, 'js', 'app.mjs'), 'utf8');
  const TUYEN = new Set(MA_NGUON.flatMap((n) => [...n.matchAll(/#\/([a-z][a-z-]*)/g)].map((m) => m[1])));
  for (const ten of TUYEN) kiem(`Đường dẫn #/${ten} có màn hình`, APP.includes(`'${ten}'`) || APP.includes(`'${ten}/'`));
  for (const m of html.matchAll(/(?:href|src)="((?:css|js|fonts)\/[^"]+|favicon\.svg)"/g)) kiem(`index nạp tệp có thật: ${m[1]}`, fs.existsSync(path.join(PUB, m[1])));
}

/* ---------- 6. Máy chủ ---------- */
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
