/**
 * kiem-game.mjs — Máy kiểm tự động toàn diện (Phiên bản Tactile v3.0):
 * - Kiểm tra 9 màn chơi phủ Lớp 10, 11, 12.
 * - Kiểm tra On-Canvas Gizmo Actions (DienHoatSanKhau.apThaoTacTrenSan) và Diễn Hoạt Đa Bước (chayDienHoat).
 * - Kiểm tra Hệ thống 3 Màn hình & 27 Sao (ManHinhGame).
 * - Kiểm tra 100% tài nguyên gốc từ 2 dự án mẹ (/tin-hoc/ và /robot-game/) tồn tại trên ổ đĩa.
 * - Kiểm tra giới hạn < 1000 dòng/tệp và quy tắc 0 Emoji / 0 Unicode Symbol cấm trên toàn dự án.
 * Chạy: node tools/kiem-game.mjs (hoặc npm test)
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

const { resolveMountedPath } = require('../server.js');
const BangGhep = require('../../doi-robot-chan-hung/hoc/bang-ghep.js');
const IconsSvg = require('../public/js/icons-svg.js');
const VeSanKhau = require('../public/js/ve-san-khau.js');
const ManChoi = require('../public/js/man-choi.js');
const DienHoatSanKhau = require('../public/js/dien-hoat-san-khau.js');
const TuongTacSvg = require('../public/js/tuong-tac-svg.js');
const ManHinhGame = require('../public/js/man-hinh-game.js');

let passed = 0;
let failed = 0;

function assert(cond, msg) {
  if (cond) {
    passed++;
  } else {
    failed++;
    console.error('[FAIL] ' + msg);
  }
}

/**
 * Kiểm tra một đường dẫn URL tĩnh (vd: /robot-game/... hoặc /tin-hoc/...) có tồn tại thật trên ổ đĩa không.
 * @param {string} url Đường dẫn URL
 * @param {string} context Ngữ cảnh kiểm tra
 */
function assertAssetExists(url, context) {
  const resolved = resolveMountedPath(url);
  const exists = !!(resolved && fs.existsSync(resolved.filePath));
  assert(exists, `Tài nguyên gốc [${url}] (${context}) phải tồn tại trên ổ đĩa`);
}

/* 1. Kiểm tra đủ 9 màn chơi phủ Lớp 10, 11, 12 */
assert(ManChoi.MAN_CHOI.length === 9, 'Phải có đủ 9 màn chơi trong MAN_CHOI');
const lopSet = new Set(ManChoi.MAN_CHOI.map((m) => m.lop));
assert(lopSet.has(10) && lopSet.has(11) && lopSet.has(12), 'Phải bao phủ đủ cả 3 khối lớp: 10, 11, 12');

/* 2. Kiểm tra mô-đun ManHinhGame (Hệ thống 3 màn hình + 27 Sao) */
assert(typeof ManHinhGame.chuyenManHinh === 'function', 'ManHinhGame phải xuất hàm chuyenManHinh');
assert(typeof ManHinhGame.hienHopChienThang === 'function', 'ManHinhGame phải xuất hàm hienHopChienThang');
assert(typeof ManHinhGame.veSaoSvg === 'function', 'ManHinhGame phải xuất hàm veSaoSvg');
assert(typeof ManHinhGame.veKhaySaoSvg === 'function', 'ManHinhGame phải xuất hàm veKhaySaoSvg');
assert(ManHinhGame.veKhaySaoSvg(3, 3, 16).includes('<svg'), 'veKhaySaoSvg phải sinh chuỗi SVG ngôi sao hợp lệ');

const mockAppState = {
  starsById: { 'G10-01': 3, 'G10-02': 2, 'G10-03': 1 },
  completedIds: { 'G10-01': true, 'G10-02': true, 'G10-03': true }
};
const campaignStats = ManHinhGame.tinhThongKeChienDich(mockAppState, ManChoi.MAN_CHOI);
assert(campaignStats.totalStars === 6 && campaignStats.maxStars === 27 && campaignStats.doneCount === 3, 'tinhThongKeChienDich phải tính chuẩn tổng sao trên 27 sao tối đa');

/* 3. Kiểm tra mô-đun DienHoatSanKhau (Multi-Step Cutscene + On-Canvas Gizmo Actions) */
assert(typeof DienHoatSanKhau.chayDienHoat === 'function', 'DienHoatSanKhau phải xuất hàm chayDienHoat');
assert(typeof DienHoatSanKhau.dungDienHoat === 'function', 'DienHoatSanKhau phải xuất hàm dungDienHoat');
assert(typeof DienHoatSanKhau.apThaoTacTrenSan === 'function', 'DienHoatSanKhau phải xuất hàm apThaoTacTrenSan');

/* 4. Kiểm tra từng màn: Trạng thái đầu, On-Canvas Gizmos, Diễn hoạt đa bước (Fail & Win), SVG và tài nguyên nhúng */
const hrefRegex = /href="(\/[^"]+)"/g;
const actionAttrRegex = /data-stage-action="([^"]+)"/g;

for (const man of ManChoi.MAN_CHOI) {
  const initSt = ManChoi.cloneState(man.stateBanDau);
  const kqDau = man.kiemDoHoa(initSt);
  const dauThang = kqDau.every((k) => k.ok);
  assert(!dauThang, `Màn ${man.id} trạng thái ban đầu không được tự thắng khi chưa sửa đồ họa`);

  const svgDau = TuongTacSvg.renderStageSvg(man, initSt, { mode: 'idle' });
  assert(svgDau.startsWith('<svg') && svgDau.endsWith('</svg>'), `Màn ${man.id} phải dựng được chuỗi <svg> hợp lệ`);
  assert(!svgDau.includes('<text'), `Màn ${man.id} tuyệt đối không được vẽ thẻ <text> gây xấu và rối trên bản đồ SVG`);

  /* Kiểm tra mỗi màn ở trạng thái idle đều có ít nhất 1 On-Canvas Gizmo (data-stage-action) */
  const actionsInStage = [];
  let actMatch;
  while ((actMatch = actionAttrRegex.exec(svgDau)) !== null) {
    if (!actionsInStage.includes(actMatch[1])) {
      actionsInStage.push(actMatch[1]);
    }
  }
  assert(actionsInStage.length >= 1, `Màn ${man.id} phải có ít nhất 1 nút Gizmo trực tiếp trên sân khấu (data-stage-action)`);

  /* Kiểm tra DienHoatSanKhau.apThaoTacTrenSan thực thi được các action trên sân khấu */
  const gizmoTestState = ManChoi.cloneState(man.stateBanDau);
  for (const actName of actionsInStage) {
    const res = DienHoatSanKhau.apThaoTacTrenSan(actName, man, gizmoTestState, false);
    assert(res && res.changed === true && res.message.length > 0, `Màn ${man.id} action [${actName}] phải cập nhật trạng thái và trả về thông báo`);
  }
  if (man.id === 'G10-01') {
    const afterClickChecks = man.kiemDoHoa(gizmoTestState);
    assert(!afterClickChecks.every((c) => c.ok), 'Màn G10-01 không được tự giải xong chỉ bằng bấm nút (người chơi phải thực sự kéo tay nắm co giãn đá và kéo xoay dầm cầu)');
  }

  /* Kiểm tra chạy diễn hoạt khi CHƯA ĐẠT (Fail Cutscene) */
  let failFrames = 0;
  let failCompleted = false;
  const failAnim = DienHoatSanKhau.chayDienHoat({
    man,
    state: initSt,
    instant: true,
    onFrame: (st) => {
      failFrames++;
      const frameSvg = TuongTacSvg.renderStageSvg(man, initSt, st);
      assert(frameSvg.startsWith('<svg'), `Màn ${man.id} phải dựng được SVG ở khung hình diễn hoạt lỗi`);
    },
    onComplete: (kq, finalSt) => {
      failCompleted = !kq.dat && finalSt.mode === 'fail';
    }
  });
  assert(failFrames >= 3 && failCompleted && failAnim.mode === 'fail', `Màn ${man.id} chạy diễn hoạt khi chưa đạt phải trả về trạng thái fail`);
  const svgFail = TuongTacSvg.renderStageSvg(man, initSt, failAnim);
  assert(svgFail.includes('svg-fail-overlay'), `Màn ${man.id} khi lỗi phải hiển thị lớp cảnh báo cảm biến (svg-fail-overlay)`);

  let match;
  while ((match = hrefRegex.exec(svgDau)) !== null) {
    assertAssetExists(match[1], `SVG màn ${man.id} trạng thái đầu`);
  }

  /* Áp dụng gợi ý chuẩn và kiểm tra chạy diễn hoạt khi ĐẠT 100% (Win Cutscene) */
  man.apDungGoiY(initSt);
  const kqSau = man.kiemDoHoa(initSt);
  const sauThang = kqSau.every((k) => k.ok);
  assert(sauThang, `Màn ${man.id} (${man.ten}) sau khi áp dụng thao tác đúng phải ĐẠT 100% tiêu chí kiemDoHoa()`);

  const seenPhases = new Set();
  let winCompleted = false;
  const winAnim = DienHoatSanKhau.chayDienHoat({
    man,
    state: initSt,
    instant: true,
    onFrame: (st) => {
      seenPhases.add(st.phase);
    },
    onComplete: (kq, finalSt) => {
      winCompleted = kq.dat && finalSt.mode === 'win';
    }
  });
  assert(
    seenPhases.has('scan') && seenPhases.has('move') && seenPhases.has('celebrate') && winCompleted,
    `Màn ${man.id} diễn hoạt chiến thắng phải đi qua đủ 3 pha: scan -> move -> celebrate`
  );

  const svgThang = TuongTacSvg.renderStageSvg(man, initSt, winAnim);
  assert(svgThang.includes('ĐÃ AN TOÀN!'), `Màn ${man.id} khi thắng phải dựng trạng thái người cần cứu ĐÃ AN TOÀN`);
  assert(svgThang.includes('svg-confetti-burst'), `Màn ${man.id} khi thắng phải dựng hiệu ứng pháo giấy vector (svg-confetti-burst)`);

  while ((match = hrefRegex.exec(svgThang)) !== null) {
    assertAssetExists(match[1], `SVG màn ${man.id} trạng thái thắng`);
  }
}

/* 5. Kiểm tra toàn bộ kho ảnh gốc Sola, Luna, 8 Cỗ máy Robot, 9 Nhân vật & Bối cảnh 9 mùa */
for (const who of ['sola', 'luna']) {
  for (const [pose, url] of Object.entries(VeSanKhau.MASCOT_POSES[who])) {
    assertAssetExists(url, `Mascot ${who} pose ${pose}`);
  }
}

for (const [loai, set] of Object.entries(VeSanKhau.ROBOT_SPRITES)) {
  assertAssetExists(set.idle, `Robot ${loai} idle`);
  assertAssetExists(set.loi, `Robot ${loai} loi`);
  assertAssetExists(set.thang, `Robot ${loai} thang`);
  const rbSvg = VeSanKhau.veRobotSvg({ id: 'test-' + loai, loai, x: 100, y: 100, nhan: loai });
  assert(rbSvg.includes('<image href="'), `Bộ vẽ phải nhúng ảnh gốc cho cỗ máy ${loai}`);
}

for (const [pid, p] of Object.entries(VeSanKhau.RESCUE_PEOPLE)) {
  assertAssetExists(p.wait, `Nhân vật cần cứu ${pid} wait`);
  assertAssetExists(p.win, `Nhân vật cần cứu ${pid} win`);
}

for (const [mid, bg] of Object.entries(VeSanKhau.STAGE_BACKDROPS)) {
  assertAssetExists(bg.bg, `Bối cảnh màn ${mid}`);
  assertAssetExists(bg.tile, `Ô sàn màn ${mid}`);
  assertAssetExists(bg.wall, `Tường đạo cụ màn ${mid}`);
}

assert(VeSanKhau.veLinhVat('sola', 48).startsWith('<img'), 'Hiển thị chân dung Sola bằng ảnh gốc');
assert(VeSanKhau.veLinhVat('luna', 48).startsWith('<img'), 'Hiển thị chân dung Luna bằng ảnh gốc');
assert(Object.keys(IconsSvg.PATHS).length >= 25, 'Thư viện IconsSvg có từ 25 biểu tượng SVG trở lên');

/* 6. Kiểm tra public/index.html nạp đầy đủ các script VeVector, VeRobot và Map-Builder theo đúng thứ tự */
const indexHtmlContent = fs.readFileSync(path.join(rootDir, 'public/index.html'), 'utf8');
const scriptSrcRegex = /<script\s+src="(\/robot-[^"]+)"/g;
let scriptMatch;
while ((scriptMatch = scriptSrcRegex.exec(indexHtmlContent)) !== null) {
  assertAssetExists(scriptMatch[1], 'Script engine Robot trong index.html');
}

const idxVeRobot = indexHtmlContent.indexOf('/robot-game/ve-robot.js');
const idxVeSanKhau = indexHtmlContent.indexOf('js/ve-san-khau.js');
const idxTuongTac = indexHtmlContent.indexOf('js/tuong-tac-svg.js');
const idxDienHoat = indexHtmlContent.indexOf('js/dien-hoat-san-khau.js');
const idxManHinh = indexHtmlContent.indexOf('js/man-hinh-game.js');
const idxUngDung = indexHtmlContent.indexOf('js/ung-dung.js');
assert(
  idxVeRobot > 0 && idxVeSanKhau > idxVeRobot && idxTuongTac > 0 && idxDienHoat > 0 && idxManHinh > 0 && idxUngDung > idxDienHoat && idxUngDung > idxManHinh,
  'public/index.html phải nạp ve-robot.js trước ve-san-khau.js và nạp dien-hoat-san-khau.js trước ung-dung.js'
);

/* 6b. Kiểm tra 9 Bản đồ Lưới Python Mùa 9 (BAN_DO_MUA_9) và bộ vẽ Canvas veBanDoRobotCanvas */
const mockCtx = {
  save() {}, restore() {}, scale() {}, translate() {}, rotate() {},
  beginPath() {}, closePath() {}, moveTo() {}, lineTo() {}, arc() {}, arcTo() {},
  fill() {}, stroke() {}, fillRect() {}, strokeRect() {}, fillText() {},
  drawImage() {}, setLineDash() {},
  createLinearGradient() { return { addColorStop() {} }; }
};
const mockCanvas = {
  width: 800,
  height: 420,
  getContext() { return mockCtx; }
};

for (const man of ManChoi.MAN_CHOI) {
  const mapCfg = VeSanKhau.BAN_DO_MUA_9[man.so];
  assert(mapCfg && Array.isArray(mapCfg.san) && mapCfg.san.length === 5, `Màn ${man.so} phải có bản đồ lưới 5 hàng trong BAN_DO_MUA_9`);
  assert(mapCfg.san.every((row) => row.length === 8), `Màn ${man.so} mỗi hàng bản đồ phải đúng 8 cột`);
  assert(mapCfg.r1 && Array.isArray(mapCfg.r1.code) && mapCfg.r1.code.length >= 3, `Màn ${man.so} phải có cấu hình R1 và mã lệnh Python`);
  assert(mapCfg.r2 && Array.isArray(mapCfg.r2.code) && mapCfg.r2.code.length >= 2, `Màn ${man.so} phải có cấu hình R2 và mã lệnh Python`);
  assert(typeof mapCfg.r1.dir === 'number' && typeof mapCfg.r2.dir === 'number', `Màn ${man.so} hướng của R1 & R2 phải là số 0..3 chuẩn VeRobot.ve()`);

  const kqGhepR1 = BangGhep.kiemGhep(mapCfg.r1.cauHinh.than, mapCfg.r1.cauHinh.tay, mapCfg.r1.cauHinh.camBien, mapCfg.r1.cauHinh);
  const kqGhepR2 = BangGhep.kiemGhep(mapCfg.r2.cauHinh.than, mapCfg.r2.cauHinh.tay, mapCfg.r2.cauHinh.camBien, mapCfg.r2.cauHinh);
  assert(kqGhepR1 && kqGhepR1.ok === true, `Màn ${man.so} cấu hình R1 (${mapCfg.r1.ten}) phải hợp lệ theo BangGhep.kiemGhep: ${kqGhepR1 && kqGhepR1.loi}`);
  assert(kqGhepR2 && kqGhepR2.ok === true, `Màn ${man.so} cấu hình R2 (${mapCfg.r2.ten}) phải hợp lệ theo BangGhep.kiemGhep: ${kqGhepR2 && kqGhepR2.loi}`);

  const st = ManChoi.cloneState(man.stateBanDau);
  VeSanKhau.veBanDoRobotCanvas(mockCanvas, man, st, { mode: 'idle', phase: 'idle', progress: 0 });
  man.apDungGoiY(st);
  VeSanKhau.veBanDoRobotCanvas(mockCanvas, man, st, { mode: 'win', phase: 'celebrate', progress: 1 });
}

/* 7. Kiểm tra giới hạn < 1000 dòng mỗi tệp và quy tắc CẤM Emoji / Unicode Symbol trong UI */
const uiFiles = [
  'public/index.html',
  'public/sink.html',
  'public/css/style.css',
  'public/js/icons-svg.js',
  'public/js/ve-san-khau.js',
  'public/js/man-choi.js',
  'public/js/tuong-tac-svg.js',
  'public/js/dien-hoat-san-khau.js',
  'public/js/man-hinh-game.js',
  'public/js/ung-dung.js'
];

const bannedEmojiRegex = /[\u{1F300}-\u{1FAFF}\u2600-\u26FF\u2700-\u27BF★☆✔✖✗✘⚠◆▶◀▲▼]/u;

for (const rel of uiFiles) {
  const full = path.join(rootDir, rel);
  const content = fs.readFileSync(full, 'utf8');
  const lines = content.split(/\r?\n/).length;
  assert(lines < 1000, `Tệp ${rel} phải dưới 1000 dòng (hiện tại: ${lines} dòng)`);
  assert(!bannedEmojiRegex.test(content), `Tệp ${rel} tuyệt đối không được chứa Emoji hoặc Symbol Unicode cấm`);
}

console.log(`KIỂM THỬ HOÀN TẤT: ${passed} phép kiểm ĐẠT, ${failed} phép kiểm LỖI.`);
if (failed > 0) process.exit(1);
