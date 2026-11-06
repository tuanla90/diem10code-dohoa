/**
 * ung-dung.js — Bộ điều khiển trung tâm "Đội Robot Chấn Hưng: Sân Khấu Đồ Họa"
 * Tích hợp Hướng dẫn Từng Bước (Step-by-Step Progressive Onboarding), Bộ Công Cụ Đồ Họa Trực Quan,
 * Xưởng Đồ Họa Thật (SVG-Edit / miniPaint) và Diễn Hoạt Cảm Biến Robot.
 * Tuân thủ nghiêm ngặt: Không Emoji/Unicode symbol, giới hạn dưới 1000 dòng.
 */
(function () {
  'use strict';
  var IC = window.IconsSvg;
  var VSK = window.VeSanKhau;
  var MC = window.ManChoi;
  var TTS = window.TuongTacSvg;
  var DHSK = window.DienHoatSanKhau;
  var MHG = window.ManHinhGame;
  var STORAGE_KEY = 'diem10code_dohoa_progress_v3';
  var LEGACY_STORAGE_KEY = 'diem10code_dohoa_progress_v1';
  var I18N = {
    vi: {
      appTitle: 'Đội Robot Chấn Hưng: Sân Khấu Đồ Họa',
      appSub: 'Giải cứu sa bàn — Thực hành Đồ họa Tin học 10 · 11 · 12',
      filterAll: 'Tất cả (9)',
      filter10: 'Lớp 10 (Vector)',
      filter11: 'Lớp 11 (Ảnh & Phim)',
      filter12: 'Lớp 12 (Web CSS)',
      playShow: 'Chạy biểu diễn!',
      resetStage: 'Làm lại',
      autoDemo: 'Thao tác mẫu (1 sao)',
      undoBtn: 'Hoàn tác'
    },
    en: {
      appTitle: 'Robot Chan Hung: Graphics Stage Studio',
      appSub: 'Rescue the Diorama — Computer Graphics Grade 10 · 11 · 12',
      filterAll: 'All Stages (9)',
      filter10: 'Grade 10 (Vector)',
      filter11: 'Grade 11 (Photo & Film)',
      filter12: 'Grade 12 (Web CSS)',
      playShow: 'Run Stage Show!',
      resetStage: 'Reset',
      autoDemo: 'Demo Fix (1 Star)',
      undoBtn: 'Undo'
    }
  };
  var AppState = {
    lang: 'vi',
    theme: 'light',
    soundEnabled: true,
    filterGrade: 'all',
    currentIndex: 0,
    stageState: null,
    history: [],
    attempts: 0,
    usedDemo: false,
    lastActionNote: '',
    anim: { mode: 'idle', message: '' },
    completedIds: {},
    starsById: {}
  };
  /**
   * Kịch bản Hướng Dẫn Từng Bước (Step-by-Step) cho 9 màn chơi
   * Giúp người chơi mới vào không bao giờ bị ngợp, luôn biết rõ Bước 1 và Bước 2 cần làm gì.
   */
  var STAGE_GUIDED_STEPS = {
    'G10-01': [
      { id: 'step-da-1', icon: 'resize', toolLabel: 'Công cụ Co giãn W:H — Đá mỏ #1', shortHint: 'Chọn Đá mỏ #1 Ô(2,1): Bật Ổ khóa tỷ lệ W:H rồi kéo tay nắm góc về vòng chuẩn 60x60 (Rx = Ry = 30px).', action: 'select-da-1', btnText: 'Chọn Đá mỏ #1 Ô(2,1)',
        isDone: function (st) { var da1 = (st.objects || [])[0]; return !!(da1 && da1.lockAspect && Math.abs(da1.rx - da1.ry) <= 2 && da1.rx >= 26 && da1.rx <= 34); } },
      { id: 'step-da-2', icon: 'move', toolLabel: 'Công cụ Di chuyển — Đá mỏ #2', shortHint: 'Kéo Đá mỏ #2 từ ngách giữa Ô(4,2) lên đúng vị trí ném Ô(4,1) để R1 hất vào nút đè M(5,1).', action: 'select-da-2', btnText: 'Chọn Đá mỏ #2 Ô(4,2)',
        isDone: function (st) { var da2 = (st.objects || [])[1]; return !!(da2 && Math.abs(da2.x - 435) <= 14 && Math.abs(da2.y - 129) <= 14); } },
      { id: 'step-cua', icon: 'rotate', toolLabel: 'Công cụ Xoay hướng — Cửa hầm C', shortHint: 'Chọn Cửa hầm C Ô(2,3): Nắm kéo tay nắm xoay trên vòng thước đo góc từ 90° về 0°.', action: 'select-cua-ham', btnText: 'Chọn Cửa hầm C Ô(2,3)',
        isDone: function (st) { var cua = (st.objects || [])[2]; return !!(cua && Math.abs(cua.rotate) <= 8); } }
    ],
    'G10-02': [
      { id: 'step-add-pontoon', icon: 'addShape', toolLabel: '1. Thêm Phao thứ 4', shortHint: 'Bấm vào ô nét đứt màu vàng có dấu (+) trên mặt sông để thả thêm tấm phao thứ 4.', action: 'add-pontoon', btnText: '+ Thả thêm Phao thứ 4',
        isDone: function (st) { var p = (st.objects || []).filter(function (o) { return o.loai === 'pontoon'; }); return p.length >= 4 && p.every(function (x) { return (x.rx || 0) >= 12; }); } },
      { id: 'step-align-pontoon', icon: 'alignMiddle', toolLabel: '2. Căn hàng & Chia đều', shortHint: 'Kéo phao vào đường kẻ ngang giữa sông (hoặc bấm công cụ Căn hàng) để 4 phao thẳng tắp.', action: 'distribute-h', btnText: 'Căn thẳng hàng 4 phao',
        isDone: function (st) { var p = (st.objects || []).filter(function (o) { return o.loai === 'pontoon'; }); if (p.length < 4) return false; var yOk = p.every(function (x) { return Math.abs(x.y - 260) <= 12; }); var xs = p.map(function (x) { return x.x; }).sort(function (a, b) { return a - b; }); return yOk && Math.abs((xs[1] - xs[0]) - (xs[2] - xs[1])) <= 12; } }
    ],
    'G10-03': [
      { id: 'step-smooth-node', icon: 'nodeBezier', toolLabel: '1. Bật Nút cong Bézier', shortHint: 'Chuyển đường gấp khúc cứng nhắc thành đường cong Bézier mượt mà.', action: 'toggle-smooth', btnText: 'Chuyển thành Đường cong mượt',
        isDone: function (st) { var p = (st.objects || [])[0]; return !!(p && p.smooth); } },
      { id: 'step-arch-boat', icon: 'spark', toolLabel: '2. Kéo vòm qua Đá ngầm', shortHint: 'Kéo chấm tròn vàng lên cao (vòng qua trên bãi đá ngầm) và nối điểm cuối vào mũi Xuồng.', action: 'snap-boat-end', btnText: 'Uốn vòm qua đá tới mũi Xuồng',
        isDone: function (st) { var p = (st.objects || [])[0]; return !!(p && p.smooth && p.cy <= 155 && p.x2 >= 530 && Math.abs(p.y2 - 265) <= 24); } }
    ],
    'G10-04': [
      { id: 'step-union', icon: 'union', toolLabel: '1. Hợp nhất Cầu đá', shortHint: 'Kéo ghép mảnh cầu đá màu xanh vào nhau (Phép Hợp — Boolean Union) để bắc qua vực.', action: 'boolean-union', btnText: 'Hợp nhất 2 nhịp cầu (Union)',
        isDone: function (st) { var c = (st.objects || [])[0]; return !!(c && c.booleanOp === 'union'); } },
      { id: 'step-diff', icon: 'subtract', toolLabel: '2. Khoét thông Vách đá', shortHint: 'Bấm vào vòng tròn đỏ trên vách đá bên phải (Phép Trừ — Boolean Difference) để mở hầm.', action: 'boolean-diff', btnText: 'Khoét thủng vách đá (Difference)',
        isDone: function (st) { var v = (st.objects || [])[1]; return !!(v && v.booleanOp === 'difference'); } }
    ],
    'G10-05': [
      { id: 'step-svg', icon: 'vectorSvg', toolLabel: '1. Chuẩn hóa Vector #42', shortHint: 'Bấm vào biển số #42 đang bị vỡ hạt trên thùng hàng để chuyển sang Vector (.SVG) sắc nét.', action: 'set-vector-svg', btnText: 'Chuyển #42 sang Vector .SVG',
        isDone: function (st) { var n = (st.objects || [])[0]; return !!(n && n.format === 'vector-svg'); } },
      { id: 'step-png', icon: 'layers', toolLabel: '2. Tách nền .PNG Tán cây', shortHint: 'Bấm vào tán cây đang bị khung nền trắng .JPG che khuất để xuất sang .PNG trong suốt.', action: 'set-tree-png', btnText: 'Tách nền trong suốt .PNG',
        isDone: function (st) { var c = (st.objects || [])[1]; return !!(c && c.imageFormat === 'png'); } }
    ],
    'G11-01': [
      { id: 'step-rgb', icon: 'colorRgb', toolLabel: '1. Pha đèn Vàng RGB', shortHint: 'Kéo thanh trượt màu xanh lá dưới đèn hiệu sang phải để pha Đỏ (255) + Lục (255) = Vàng.', action: 'preset-yellow-rgb', btnText: 'Pha đèn Vàng RGB(255,255,0)',
        isDone: function (st) { var d = (st.objects || [])[0]; return !!(d && d.r >= 230 && d.g >= 215 && d.b <= 45); } },
      { id: 'step-bright', icon: 'sun', toolLabel: '2. Tăng Độ sáng & Tương phản', shortHint: 'Tăng Độ sáng (110%) và Tương phản (115%) để đánh thức luống hoa dẫn đường cho Drone.', action: 'boost-exposure', btnText: 'Tăng Độ sáng 110% · Tương phản 115%',
        isDone: function (st) { var d = (st.objects || [])[0]; return !!(d && d.brightness >= 95 && d.contrast >= 100); } }
    ],
    'G11-02': [
      { id: 'step-sand-layer', icon: 'layers', toolLabel: '1. Đưa Thảm Cát lên trên', shortHint: 'Kéo tấm Thảm Cát Vàng trên bản đồ xuống đè lên trên Lớp Bùn Trơn.', action: 'swap-sand-above-mud', btnText: 'Đưa Lớp Thảm Cát lên trên Bùn',
        isDone: function (st) { var ls = st.layers || []; var iCat = ls.findIndex(function (l) { return l.id === 'layer-tham-cat'; }); var iBun = ls.findIndex(function (l) { return l.id === 'layer-bun-tron'; }); return iCat !== -1 && iBun !== -1 && iCat < iBun; } },
      { id: 'step-mask-fog', icon: 'mask', toolLabel: '2. Cọ Mặt nạ xóa sương', shortHint: 'Quét cọ lên đám sương mù bên phải (Mặt nạ lớp — Layer Mask) để mở tầm nhìn.', action: 'paint-mask-black', btnText: 'Tô Mặt nạ xóa sương mù',
        isDone: function (st) { var s = (st.layers || []).find(function (l) { return l.id === 'layer-suong-mu'; }); return !!(s && s.visible && s.maskCleared); } }
    ],
    'G11-03': [
      { id: 'step-raft-t4', icon: 'timeline', toolLabel: '1. Khớp Bè vào Nhịp 4', shortHint: 'Kéo con trượt màu cam ở rãnh trên vào ô nét đứt xanh lá (Nhịp 4).', action: 'sync-raft-tick-4', btnText: 'Đặt Bè Cứu Hộ vào Nhịp 4',
        isDone: function (st) { return !!(st.timeline && Number(st.timeline.beCuuHoTick) === 4); } },
      { id: 'step-bell-t7', icon: 'music', toolLabel: '2. Khớp Nhạc vào Nhịp 7', shortHint: 'Kéo con trượt màu hồng ở rãnh dưới vào ô nét đứt xanh dương (Nhịp 7) và bật Phụ đề.', action: 'sync-duet-tick-7', btnText: 'Đặt Nhạc vào Nhịp 7 & Bật phụ đề',
        isDone: function (st) { return !!(st.timeline && Number(st.timeline.nhacSongCaTick) === 7 && st.timeline.coPhuDeNguon); } }
    ],
    'G12-01': [
      { id: 'step-flex-wrap', icon: 'cssBox', toolLabel: '1. Bật Flexbox tự xuống dòng', shortHint: 'Bấm vào khung 4 thẻ đang bị tràn đè lên nút bấm để bật flex-wrap: wrap và giãn cách 14px.', action: 'toggle-flex-wrap', btnText: 'Bật flex-wrap: wrap & Gap 14px',
        isDone: function (st) { var cb = st.cssBox; return !!(cb && cb.flexWrap === 'wrap' && cb.padding >= 12 && cb.gap >= 10); } },
      { id: 'step-contrast', icon: 'sun', toolLabel: '2. Bật Nút tương phản cao', shortHint: 'Bấm vào công tắc tối màu cạnh cổng để chuyển sang màu vàng Tương phản cao.', action: 'toggle-btn-contrast', btnText: 'Đổi nút sang Tương phản cao',
        isDone: function (st) { return !!(st.cssBox && st.cssBox.buttonTheme === 'high-contrast'); } }
    ]
  };
  function loadProgress() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
      if (!raw) return;
      var parsed = JSON.parse(raw);
      AppState.completedIds = parsed.completedIds || {};
      AppState.starsById = parsed.starsById || {};
      if (parsed.theme === 'dark' || parsed.theme === 'light') AppState.theme = parsed.theme;
      if (typeof parsed.soundEnabled === 'boolean') AppState.soundEnabled = parsed.soundEnabled;
      Object.keys(AppState.completedIds).forEach(function (id) {
        if (AppState.completedIds[id] && typeof AppState.starsById[id] !== 'number') AppState.starsById[id] = 3;
      });
    } catch (e) {}
  }
  function saveProgress() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        completedIds: AppState.completedIds,
        starsById: AppState.starsById,
        theme: AppState.theme,
        soundEnabled: AppState.soundEnabled
      }));
    } catch (e) {}
  }
  function currentMan() {
    return MC.MAN_CHOI[AppState.currentIndex] || MC.MAN_CHOI[0];
  }
  function playSfx(tenFile) {
    if (!AppState.soundEnabled) return;
    if (MHG && typeof MHG.phatAmThanh === 'function') {
      MHG.phatAmThanh(tenFile, AppState);
      return;
    }
    try {
      if (typeof Audio !== 'undefined') {
        var a = new Audio('/robot-game/phim-clb/a/sfx/' + tenFile + '.wav');
        a.volume = 0.45;
        a.play().catch(function () {});
      }
    } catch (e) {}
  }
  function tinhSaoManHienTai() {
    if (AppState.usedDemo) return 1;
    return AppState.attempts === 0 ? 3 : 2;
  }
  function pushUndo() {
    if (!AppState.stageState) return;
    AppState.history.push(MC.cloneState(AppState.stageState));
    if (AppState.history.length > 25) AppState.history.shift();
  }
  /**
   * Thực thi một hành động công cụ (từ Thanh bước hướng dẫn, Cột công cụ bên trái, hoặc trên Sân)
   */
  function executeStageAction(actName) {
    if (!actName || !AppState.stageState) return;
    if (DHSK && typeof DHSK.dungDienHoat === 'function') DHSK.dungDienHoat();
    pushUndo();
    playSfx('pop');
    AppState.anim = { mode: 'idle', message: '' };
    var man = currentMan();
    var st = AppState.stageState;
    if (actName === 'toggle-flex-wrap' && st.cssBox) {
      st.cssBox.flexWrap = 'wrap';
      st.cssBox.padding = 14;
      st.cssBox.gap = 14;
      AppState.lastActionNote = 'Đã bật tự xuống dòng (flex-wrap: wrap) và đặt khoảng đệm 14px!';
      renderAll();
      return;
    }
    if ((actName === 'sync-raft-tick-4' || actName === 'sync-duet-tick-7') && st.timeline) {
      st.timeline.coPhuDeNguon = true;
    }
    if (DHSK && typeof DHSK.apThaoTacTrenSan === 'function') {
      var res = DHSK.apThaoTacTrenSan(actName, man, st);
      if (res && res.changed) {
        AppState.lastActionNote = res.message;
      }
    }
    renderAll();
  }
  /**
   * Chọn và khởi tạo một màn chơi theo chỉ số.
   */
  function loadStage(idx) {
    if (DHSK && typeof DHSK.dungDienHoat === 'function') DHSK.dungDienHoat();
    if (MHG && typeof MHG.dongHopChienThang === 'function') MHG.dongHopChienThang();
    AppState.currentIndex = Math.max(0, Math.min(MC.MAN_CHOI.length - 1, Number(idx) || 0));
    var man = currentMan();
    AppState.stageState = MC.cloneState(man.stateBanDau);
    AppState.stageState.selectedId = (AppState.stageState.objects && AppState.stageState.objects[0]) ? AppState.stageState.objects[0].id : '';
    AppState.history = [];
    AppState.attempts = 0;
    AppState.usedDemo = false;
    AppState.lastActionNote = '';
    AppState.anim = { mode: 'idle', message: '' };
    renderAll();
  }
  /**
   * Dựng Cột Công Cụ Bên Trái (#studio-tool-dock):
   * Chỉ hiển thị gọn các công cụ đúng theo từng bước của màn hiện tại để người chơi không bị ngợp!
   */
  function renderToolDock() {
    var dock = document.getElementById('studio-tool-dock');
    if (!dock) return;
    var man = currentMan();
    var st = AppState.stageState;
    var steps = STAGE_GUIDED_STEPS[man.id] || [];
    var kq = man.kiemDoHoa(st);
    var allDone = kq.every(function (k) { return k.ok; });
    var firstPendingIdx = -1;
    for (var i = 0; i < steps.length; i++) {
      if (!steps[i].isDone(st)) {
        firstPendingIdx = i;
        break;
      }
    }
    var stepsHtml = steps.map(function (step, idx) {
      var done = step.isDone(st);
      var isCurrent = idx === firstPendingIdx;
      var cls = 'studio-tool-item' + (isCurrent ? ' active recommended' : '') + (done ? ' done' : '');
      var statusBadge = done
        ? '<span class="tool-step-status ok">' + IC.icon('check', 13) + '</span>'
        : '<span class="tool-step-status ' + (isCurrent ? 'next' : 'wait') + '">' + (isCurrent ? 'Làm ngay' : ('Bước ' + (idx + 1))) + '</span>';
      return '<button type="button" class="' + cls + '" data-step-action="' + step.action + '" title="' + step.shortHint + '">' +
        '<div class="tool-item-top">' +
          '<span class="tool-item-left">' + IC.icon(step.icon, 16) + '<span class="tool-item-label">' + step.toolLabel + '</span></span>' +
          statusBadge +
        '</div>' +
        '<p class="tool-item-desc">' + step.shortHint + '</p>' +
      '</button>';
    }).join('');
    var runReadyHtml =
      '<button type="button" class="studio-tool-item run-step-btn ' + (allDone ? 'ready' : '') + '" id="btn-dock-run">' +
        '<div class="tool-item-top">' +
          '<span class="tool-item-left">' + IC.icon('play', 16) + '<span class="tool-item-label">3. Chạy Robot kiểm tra</span></span>' +
        '</div>' +
        '<p class="tool-item-desc">' + (allDone ? 'Đã sửa xong bản đồ! Bấm để Robot xuất phát cứu hộ.' : 'Sau khi làm xong Bước 1 và Bước 2, bấm vào đây để Robot chạy.') + '</p>' +
      '</button>';
    dock.innerHTML =
      '<div class="tool-dock-title">Các bước thực hiện</div>' +
      stepsHtml +
      runReadyHtml;
  }
  /**
   * Dựng Thanh Thuộc Tính Ngữ Cảnh Phía Trên (#studio-context-bar)
   * Với Màn 1 (G10-01), hiển thị Thanh Thuộc Tính Đồ Họa Vector thực thụ (Inkscape / Figma Property Bar).
   */
  function renderContextBar() {
    var summaryEl = document.getElementById('context-tool-summary');
    var optionsEl = document.getElementById('context-tool-options');
    var wbLabel = document.getElementById('workbench-btn-label');
    var man = currentMan();
    var st = AppState.stageState;
    var steps = STAGE_GUIDED_STEPS[man.id] || [];
    if (wbLabel) {
      wbLabel.textContent = man.lop === 10 ? 'Mở Xưởng Vẽ (SVG-Edit)' : 'Mở Xưởng Ảnh (miniPaint)';
    }
    if (man.id === 'G10-01' && summaryEl && optionsEl) {
      var da1 = st.objects[0];
      var da2 = st.objects[1];
      var cua = st.objects[2];
      var selId = st.selectedId || 'da-1';
      var da1Done = !!(da1.lockAspect && Math.abs(da1.rx - da1.ry) <= 2 && da1.rx >= 26 && da1.rx <= 34);
      var da2Done = !!(Math.abs(da2.x - 435) <= 14 && Math.abs(da2.y - 129) <= 14);
      var cuaDone = !!(Math.abs(cua.rotate) <= 8);
      summaryEl.innerHTML =
        '<button type="button" class="ctx-btn ' + (selId === 'da-1' ? 'primary-step-btn' : '') + '" data-ctx-prop="sel-da-1">' +
          IC.icon(da1Done ? 'check' : 'resize', 14) + '<span>Scale: Đá #1 Ô(2,1)</span></button>' +
        '<button type="button" class="ctx-btn ' + (selId === 'da-2' ? 'primary-step-btn' : '') + '" data-ctx-prop="sel-da-2">' +
          IC.icon(da2Done ? 'check' : 'move', 14) + '<span>Move: Đá #2 Ô(4,1)</span></button>' +
        '<button type="button" class="ctx-btn ' + (selId === 'cua-ham' ? 'primary-step-btn' : '') + '" data-ctx-prop="sel-cua">' +
          IC.icon(cuaDone ? 'check' : 'rotate', 14) + '<span>Rotate: Cửa C Ô(2,3)</span></button>';
      if (selId === 'da-1') {
        optionsEl.innerHTML =
          '<button type="button" class="ctx-btn ' + (da1.lockAspect ? 'run-now-btn' : '') + '" data-ctx-prop="toggle-lock" title="Bật/Tắt Khóa tỷ lệ W:H">' +
            IC.icon(da1.lockAspect ? 'lock' : 'unlock', 14) +
            '<span>Khóa W:H: ' + (da1.lockAspect ? 'BẬT' : 'TẮT') + '</span></button>' +
          '<button type="button" class="ctx-btn" data-ctx-prop="rx-dec">W -</button>' +
          '<span class="context-step-pill">W: ' + (da1.rx * 2) + ' · H: ' + (da1.ry * 2) + ' (Chuẩn: 60x60)</span>' +
          '<button type="button" class="ctx-btn" data-ctx-prop="rx-inc">W +</button>';
      } else if (selId === 'da-2') {
        optionsEl.innerHTML =
          '<button type="button" class="ctx-btn" data-ctx-prop="da2-up">Lên Y -10</button>' +
          '<span class="context-step-pill">X: ' + da2.x + ' · Y: ' + da2.y + ' (Đích Ô 4,1: 435, 129)</span>' +
          '<button type="button" class="ctx-btn" data-ctx-prop="da2-down">Xuống Y +10</button>';
      } else {
        optionsEl.innerHTML =
          '<button type="button" class="ctx-btn" data-ctx-prop="rot-dec">-15°</button>' +
          '<span class="context-step-pill">Góc Cửa C(2,3): ' + cua.rotate + '° (Chuẩn: 0°)</span>' +
          '<button type="button" class="ctx-btn" data-ctx-prop="rot-inc">+15°</button>';
      }
      return;
    }
    var nextStep = null;
    var nextIndex = 0;
    for (var i = 0; i < steps.length; i++) {
      if (!steps[i].isDone(st)) {
        nextStep = steps[i];
        nextIndex = i + 1;
        break;
      }
    }
    if (summaryEl) {
      if (nextStep) {
        summaryEl.innerHTML =
          '<span class="context-step-pill active">Bước ' + nextIndex + ' / ' + steps.length + '</span>' +
          '<span class="context-step-instruction">' + nextStep.shortHint + '</span>';
      } else {
        summaryEl.innerHTML =
          '<span class="context-step-pill done">' + IC.icon('check', 14) + '<span>Đã hoàn tất ' + steps.length + '/' + steps.length + ' bước</span></span>' +
          '<span class="context-step-instruction">Bản đồ đã thông suốt! Hãy bấm nút <strong>Chạy biểu diễn</strong> để Robot đi cứu người.</span>';
      }
    }
    if (optionsEl) {
      if (nextStep) {
        optionsEl.innerHTML =
          '<button type="button" class="ctx-btn primary-step-btn" data-ctx-action="' + nextStep.action + '">' +
            IC.icon(nextStep.icon, 15) +
            '<span>Thực hiện: ' + nextStep.btnText + '</span>' +
          '</button>';
      } else {
        optionsEl.innerHTML =
          '<button type="button" class="ctx-btn run-now-btn" id="btn-ctx-run-now">' +
            IC.icon('play', 15) +
            '<span>Chạy biểu diễn ngay!</span>' +
          '</button>';
      }
    }
  }
  /**
   * Dựng thanh bộ lọc Khối lớp và Bản đồ 9 Trạm Cứu Hộ CLB.
   */
  function renderStageList() {
    var t = I18N[AppState.lang];
    var filterBar = document.getElementById('grade-filter-bar');
    if (filterBar) {
      var filters = [
        { id: 'all', label: t.filterAll },
        { id: '10', label: t.filter10 },
        { id: '11', label: t.filter11 },
        { id: '12', label: t.filter12 }
      ];
      filterBar.innerHTML = filters.map(function (f) {
        var active = String(AppState.filterGrade) === f.id ? ' active' : '';
        return '<button type="button" class="chip-btn' + active + '" data-grade="' + f.id + '">' + f.label + '</button>';
      }).join('');
    }
    if (MHG && typeof MHG.veBanDo === 'function') {
      MHG.veBanDo(AppState, MC.MAN_CHOI, function (stageIdx) {
        playSfx('pop');
        loadStage(stageIdx);
      });
      MHG.veManDau(AppState, MC.MAN_CHOI);
      MHG.capNhatHud(AppState, MC.MAN_CHOI, currentMan());
    }
  }
  /**
   * Dựng lời nhắc ngắn gọn của Sola & Luna.
   */
  function renderDialogue() {
    var man = currentMan();
    var box = document.getElementById('dialogue-banner');
    if (!box) return;
    var animMode = AppState.anim && AppState.anim.mode ? AppState.anim.mode : 'idle';
    var moods = VSK.layCamXucHoiThoai(man.id, animMode === 'running' ? 'idle' : animMode);
    var statusBanner = '';
    if (animMode === 'running') {
      statusBanner = '<div class="verdict-banner ok">' + IC.icon('spark', 18) +
        '<div>Đội Robot đang di chuyển kiểm tra bản đồ...</div></div>';
    } else if (animMode === 'win') {
      var earned = AppState.starsById[man.id] || tinhSaoManHienTai();
      statusBanner = '<div class="verdict-banner ok">' + IC.icon('check', 18) +
        '<div><strong>Thành công (' + earned + '/3 sao):</strong> ' + man.thoaiThang + '</div></div>';
    } else if (animMode === 'fail') {
      var detailErr = (AppState.anim && AppState.anim.errorText) ? AppState.anim.errorText : man.thoaiLoi;
      statusBanner = '<div class="verdict-banner err">' + IC.icon('cross', 18) +
        '<div><strong>Cần chỉnh thêm:</strong> ' + detailErr + '</div></div>';
    } else if (AppState.lastActionNote) {
      statusBanner = '<div class="verdict-banner ok">' + IC.icon('check', 16) +
        '<div>' + AppState.lastActionNote + '</div></div>';
    }
    box.innerHTML =
      statusBanner +
      '<div class="dialogue-grid">' +
        '<div class="dialogue-card luna">' +
          '<div class="avatar-wrap">' + VSK.veLinhVat('luna', 42, moods.luna) + '<span class="avatar-name">Luna gợi ý</span></div>' +
          '<p class="dialogue-text">' + man.thoaiMoDau.luna + '</p>' +
        '</div>' +
      '</div>';
  }
  /**
   * Dựng Bản đồ Robot Python + Lớp phủ Gizmo SVG và danh sách tiêu chí chấm điểm.
   */
  function renderStageAndChecklist(isDragging) {
    var man = currentMan();
    var svgWrap = document.getElementById('stage-svg-container');
    if (svgWrap) {
      var mapCanvas = svgWrap.querySelector('#robot-map-canvas');
      var svgLayer = svgWrap.querySelector('#stage-svg-overlay-box');
      if (!mapCanvas || !svgLayer) {
        svgWrap.innerHTML =
          '<canvas id="robot-map-canvas" width="800" height="420"></canvas>' +
          '<div id="stage-svg-overlay-box"></div>';
        mapCanvas = svgWrap.querySelector('#robot-map-canvas');
        svgLayer = svgWrap.querySelector('#stage-svg-overlay-box');
      }
      if (VSK && typeof VSK.veBanDoRobotCanvas === 'function') {
        VSK.veBanDoRobotCanvas(mapCanvas, man, AppState.stageState, AppState.anim);
      }
      if (svgLayer) {
        svgLayer.innerHTML = TTS.renderStageSvg(man, AppState.stageState, AppState.anim);
      }
    }
    var checkEl = document.getElementById('checklist-items');
    if (checkEl) {
      var kq = man.kiemDoHoa(AppState.stageState);
      var passCount = kq.filter(function (k) { return k.ok; }).length;
      var badge = document.getElementById('checklist-score-badge');
      if (badge) {
        badge.textContent = passCount + ' / ' + kq.length + ' đạt';
        badge.className = 'score-pill ' + (passCount === kq.length ? 'ok' : 'pending');
      }
      checkEl.innerHTML = kq.map(function (item) {
        return '<li class="check-row ' + (item.ok ? 'ok' : 'no') + '">' +
          '<span class="check-ico">' + (item.ok ? IC.icon('check', 15) : IC.icon('info', 15)) + '</span>' +
          '<span>' + item.txt + '</span>' +
        '</li>';
      }).join('');
    }
    if (!isDragging) {
      var sgkEl = document.getElementById('sgk-content-box');
      if (sgkEl) {
        sgkEl.innerHTML =
          '<div class="sgk-lesson-tag">' + IC.icon('book', 15) + ' <strong>' + man.sgk.bai + '</strong></div>' +
          '<p class="sgk-body">' + man.sgk.noiDung + '</p>';
      }
    }
  }
  /**
   * Dựng bảng công cụ chỉnh sửa thuộc tính chi tiết (Inspector).
   */
  function renderInspector() {
    var man = currentMan();
    var st = AppState.stageState;
    var panel = document.getElementById('inspector-controls');
    if (!panel) return;
    var html = '';
    if (man.id === 'G10-01') {
      var da1 = st.objects[0], da2 = st.objects[1], cua = st.objects[2];
      html +=
        '<div class="insp-group"><div class="insp-title">' + IC.icon('resize', 15) + ' <span>1. Đá mỏ #1 Ô(2,1) — Co giãn & Khóa W:H</span></div>' +
        '<button type="button" id="btn-toggle-aspect" class="btn-tool ' + (da1.lockAspect ? 'active' : '') + '">' +
        IC.icon(da1.lockAspect ? 'lock' : 'unlock', 15) + '<span>' + (da1.lockAspect ? 'Khóa tỷ lệ W:H: ĐANG BẬT (1:1)' : 'Khóa tỷ lệ W:H: ĐANG TẮT (Tự do)') + '</span></button>' +
        '<label class="slider-label">Bán kính ngang Rx (W/2): <b>' + da1.rx + ' px</b> (Chuẩn: 30)<input type="range" id="inp-da-rx" min="16" max="56" value="' + da1.rx + '"/></label>' +
        '<label class="slider-label">Bán kính dọc Ry (H/2): <b>' + da1.ry + ' px</b> (Chuẩn: 30)<input type="range" id="inp-da-ry" min="16" max="56" value="' + da1.ry + '"/></label></div>' +
        '<div class="insp-group"><div class="insp-title">' + IC.icon('move', 15) + ' <span>2. Đá mỏ #2 — Di chuyển về Ô(4,1)</span></div>' +
        '<label class="slider-label">Tọa độ dọc Y của Đá #2: <b>' + da2.y + ' px</b> (Đích Ô 4,1: 129)<input type="range" id="inp-da2-y" min="95" max="235" value="' + da2.y + '"/></label></div>' +
        '<div class="insp-group"><div class="insp-title">' + IC.icon('rotate', 15) + ' <span>3. Cửa hầm C Ô(2,3) — Xoay hướng</span></div>' +
        '<label class="slider-label">Góc xoay Cửa C(2,3): <b>' + cua.rotate + ' độ</b> (Chuẩn: 0°)<input type="range" id="inp-cua-rotate" min="-90" max="90" value="' + cua.rotate + '"/></label></div>';
    } else if (man.id === 'G10-02') {
      var phaoList = st.objects.filter(function (o) { return o.loai === 'pontoon'; });
      var curRx = phaoList[0] ? phaoList[0].rx : 16;
      html +=
        '<div class="insp-group"><div class="insp-title">' + IC.icon('addShape', 15) + ' <span>1. Thêm hình phao & Bo góc</span></div>' +
        '<button type="button" id="btn-add-pontoon" class="btn-tool primary" ' + (phaoList.length >= 4 ? 'disabled' : '') + '>' +
        IC.icon('addShape', 15) + '<span>' + (phaoList.length >= 4 ? 'Đã đủ 4 phao trên sông' : '+ Thêm Phao thứ 4') + '</span></button>' +
        '<label class="slider-label">Bán kính bo góc (Rx): <b>' + curRx + ' px</b><input type="range" id="inp-pontoon-rx" min="0" max="20" value="' + curRx + '"/></label></div>' +
        '<div class="insp-group"><div class="insp-title">' + IC.icon('alignMiddle', 15) + ' <span>2. Căn chỉnh & Phân bố đều</span></div>' +
        '<div class="insp-row two-col">' +
        '<button type="button" id="btn-align-middle" class="btn-tool">' + IC.icon('alignMiddle', 15) + '<span>Căn thẳng hàng</span></button>' +
        '<button type="button" id="btn-distribute-h" class="btn-tool">' + IC.icon('distributeH', 15) + '<span>Chia đều 4 phao</span></button></div></div>';
    } else if (man.id === 'G10-03') {
      var bp = st.objects[0];
      html +=
        '<div class="insp-group"><div class="insp-title">' + IC.icon('nodeBezier', 15) + ' <span>Đường cong Bézier vòng qua đá ngầm</span></div>' +
        '<button type="button" id="btn-toggle-smooth" class="btn-tool ' + (bp.smooth ? 'active' : '') + '">' +
        IC.icon('nodeBezier', 15) + '<span>' + (bp.smooth ? 'Đã bật Đường cong trơn (Smooth)' : 'Chuyển sang Đường cong trơn') + '</span></button>' +
        '<label class="slider-label">Độ cao đỉnh cong (Cy): <b>' + bp.cy + '</b><input type="range" id="inp-bezier-cy" min="80" max="290" value="' + bp.cy + '"/></label>' +
        '<label class="slider-label">Điểm cuối tại mũi Xuồng (X2): <b>' + bp.x2 + '</b><input type="range" id="inp-bezier-x2" min="420" max="575" value="' + bp.x2 + '"/></label></div>';
    } else if (man.id === 'G10-04') {
      var cauDoi = st.objects[0], vach = st.objects[1];
      html +=
        '<div class="insp-group"><div class="insp-title">' + IC.icon('union', 15) + ' <span>1. Hai nhịp cầu đá</span></div>' +
        '<div class="insp-row two-col">' +
        '<button type="button" class="btn-tool ' + (cauDoi.booleanOp === 'none' ? 'active' : '') + '" data-cau-op="none">Rời 2 mảnh</button>' +
        '<button type="button" class="btn-tool ' + (cauDoi.booleanOp === 'union' ? 'active' : '') + '" data-cau-op="union">Phép Hợp (Union)</button></div></div>' +
        '<div class="insp-group"><div class="insp-title">' + IC.icon('subtract', 15) + ' <span>2. Vách đá chắn đường</span></div>' +
        '<div class="insp-row two-col">' +
        '<button type="button" class="btn-tool ' + (vach.booleanOp === 'white-overlay' ? 'active' : '') + '" data-vach-op="white-overlay">Chưa khoét</button>' +
        '<button type="button" class="btn-tool ' + (vach.booleanOp === 'difference' ? 'active' : '') + '" data-vach-op="difference">Phép Trừ (Khoét lỗ)</button></div></div>';
    } else if (man.id === 'G10-05') {
      var nhan = st.objects[0], cay = st.objects[1];
      html +=
        '<div class="insp-group"><div class="insp-title">' + IC.icon('vectorSvg', 15) + ' <span>1. Nhãn Container #42</span></div>' +
        '<div class="insp-row two-col">' +
        '<button type="button" class="btn-tool ' + (nhan.format === 'bitmap-low' ? 'active' : '') + '" data-nhan-fmt="bitmap-low">Ảnh Bitmap mờ</button>' +
        '<button type="button" class="btn-tool ' + (nhan.format === 'vector-svg' ? 'active' : '') + '" data-nhan-fmt="vector-svg">Vector (.SVG)</button></div></div>' +
        '<div class="insp-group"><div class="insp-title">' + IC.icon('layers', 15) + ' <span>2. Định dạng ảnh Tán cây</span></div>' +
        '<div class="insp-row two-col">' +
        '<button type="button" class="btn-tool ' + (cay.imageFormat === 'jpg' ? 'active' : '') + '" data-cay-fmt="jpg">.JPG (Nền trắng)</button>' +
        '<button type="button" class="btn-tool ' + (cay.imageFormat === 'png' ? 'active' : '') + '" data-cay-fmt="png">.PNG (Trong suốt)</button></div></div>';
    } else if (man.id === 'G11-01') {
      var den = st.objects[0];
      html +=
        '<div class="insp-group"><div class="insp-title">' + IC.icon('colorRgb', 15) + ' <span>1. Pha màu ánh sáng RGB</span></div>' +
        '<label class="slider-label">Kênh Đỏ (R): <b>' + den.r + '</b><input type="range" id="inp-rgb-r" min="0" max="255" value="' + den.r + '"/></label>' +
        '<label class="slider-label">Kênh Lục (G): <b>' + den.g + '</b><input type="range" id="inp-rgb-g" min="0" max="255" value="' + den.g + '"/></label>' +
        '<label class="slider-label">Kênh Lam (B): <b>' + den.b + '</b><input type="range" id="inp-rgb-b" min="0" max="255" value="' + den.b + '"/></label></div>' +
        '<div class="insp-group"><div class="insp-title">' + IC.icon('sun', 15) + ' <span>2. Độ sáng & Tương phản</span></div>' +
        '<label class="slider-label">Độ sáng: <b>' + den.brightness + '%</b><input type="range" id="inp-bright" min="40" max="130" value="' + den.brightness + '"/></label>' +
        '<label class="slider-label">Tương phản: <b>' + den.contrast + '%</b><input type="range" id="inp-contrast" min="50" max="140" value="' + den.contrast + '"/></label></div>';
    } else if (man.id === 'G11-02') {
      var suong = st.layers.find(function (l) { return l.id === 'layer-suong-mu'; });
      html +=
        '<div class="insp-group"><div class="insp-title">' + IC.icon('layers', 15) + ' <span>1. Thứ tự các Lớp (Layers)</span></div><div class="layer-stack-list">' +
        st.layers.map(function (l, i) {
          return '<div class="layer-item"><span class="layer-name">' + (i + 1) + '. ' + l.ten + '</span><div class="layer-move-btns">' +
            '<button type="button" class="icon-mini-btn" data-layer-up="' + i + '" ' + (i === 0 ? 'disabled' : '') + '>' + IC.icon('arrowUp', 14) + '</button>' +
            '<button type="button" class="icon-mini-btn" data-layer-down="' + i + '" ' + (i === st.layers.length - 1 ? 'disabled' : '') + '>' + IC.icon('arrowDown', 14) + '</button></div></div>';
        }).join('') +
        '</div></div><div class="insp-group"><div class="insp-title">' + IC.icon('mask', 15) + ' <span>2. Mặt nạ lớp Sương mù</span></div>' +
        '<button type="button" id="btn-toggle-mask" class="btn-tool ' + (suong && suong.maskCleared ? 'active' : '') + '">' +
        IC.icon('mask', 15) + '<span>' + (suong && suong.maskCleared ? 'Đã xóa sương bằng Mặt nạ lớp' : 'Quét Cọ Đen xóa sương mù') + '</span></button></div>';
    } else if (man.id === 'G11-03') {
      var tl = st.timeline;
      html +=
        '<div class="insp-group"><div class="insp-title">' + IC.icon('timeline', 15) + ' <span>1. Dòng thời gian (Timeline)</span></div>' +
        '<label class="slider-label">Nhịp Bè cứu hộ (cần Nhịp 4): <b>Nhịp ' + tl.beCuuHoTick + '</b><input type="range" id="inp-tl-be" min="1" max="10" value="' + tl.beCuuHoTick + '"/></label>' +
        '<label class="slider-label">Nhịp Nhạc đệm (cần Nhịp 7): <b>Nhịp ' + tl.nhacSongCaTick + '</b><input type="range" id="inp-tl-nhac" min="1" max="10" value="' + tl.nhacSongCaTick + '"/></label></div>' +
        '<div class="insp-group"><div class="insp-title">' + IC.icon('music', 15) + ' <span>2. Phụ đề & Nguồn nhạc</span></div>' +
        '<button type="button" id="btn-toggle-sub" class="btn-tool ' + (tl.coPhuDeNguon ? 'active' : '') + '">' +
        IC.icon('check', 15) + '<span>' + (tl.coPhuDeNguon ? 'Đã bật Phụ đề & Nguồn CC-BY' : 'Bật Phụ đề & Nguồn CC-BY') + '</span></button></div>';
    } else if (man.id === 'G12-01') {
      var cb = st.cssBox;
      html +=
        '<div class="insp-group"><div class="insp-title">' + IC.icon('cssBox', 15) + ' <span>1. Khung Flexbox & Khoảng đệm</span></div>' +
        '<div class="insp-row two-col">' +
        '<button type="button" class="btn-tool ' + (cb.flexWrap === 'nowrap' ? 'active' : '') + '" data-flex-wrap="nowrap">nowrap (Tràn)</button>' +
        '<button type="button" class="btn-tool ' + (cb.flexWrap === 'wrap' ? 'active' : '') + '" data-flex-wrap="wrap">wrap (Gọn 2x2)</button></div>' +
        '<label class="slider-label">Khoảng đệm (Padding & Gap): <b>' + cb.padding + ' px</b><input type="range" id="inp-css-pad" min="0" max="20" value="' + cb.padding + '"/></label></div>' +
        '<div class="insp-group"><div class="insp-title">' + IC.icon('sun', 15) + ' <span>2. Độ tương phản nút cổng</span></div>' +
        '<div class="insp-row two-col">' +
        '<button type="button" class="btn-tool ' + (cb.buttonTheme === 'low-contrast' ? 'active' : '') + '" data-btn-theme="low-contrast">Tương phản thấp</button>' +
        '<button type="button" class="btn-tool ' + (cb.buttonTheme === 'high-contrast' ? 'active' : '') + '" data-btn-theme="high-contrast">Tương phản cao</button></div></div>';
    }
    panel.innerHTML = html;
    bindInspectorEvents();
  }
  function bindInspectorEvents() {
    var st = AppState.stageState;
    function onVal(id, fn) {
      var el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('pointerdown', function () { pushUndo(); });
      el.addEventListener('input', function (e) {
        if (DHSK && typeof DHSK.dungDienHoat === 'function') DHSK.dungDienHoat();
        AppState.anim = { mode: 'idle', message: '' };
        fn(Number(e.target.value));
        renderToolDock();
        renderContextBar();
        renderStageAndChecklist(true);
      });
      el.addEventListener('change', function () {
        playSfx('click');
        renderAll();
      });
    }
    function onClick(id, fn) {
      var el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('click', function () {
        if (DHSK && typeof DHSK.dungDienHoat === 'function') DHSK.dungDienHoat();
        pushUndo();
        playSfx('click');
        AppState.anim = { mode: 'idle', message: '' };
        fn();
        renderAll();
      });
    }
    function bindAttr(attr, fn) {
      document.querySelectorAll('[' + attr + ']').forEach(function (btn) {
        btn.addEventListener('click', function () {
          if (DHSK && typeof DHSK.dungDienHoat === 'function') DHSK.dungDienHoat();
          pushUndo();
          playSfx('click');
          AppState.anim = { mode: 'idle', message: '' };
          fn(btn.getAttribute(attr));
          renderAll();
        });
      });
    }
    onClick('btn-toggle-aspect', function () {
      executeStageAction('toggle-lock-aspect');
    });
    onVal('inp-da-rx', function (v) {
      st.selectedId = 'da-1';
      st.objects[0].rx = v;
      if (st.objects[0].lockAspect) st.objects[0].ry = v;
    });
    onVal('inp-da-ry', function (v) {
      st.selectedId = 'da-1';
      st.objects[0].ry = v;
      if (st.objects[0].lockAspect) st.objects[0].rx = v;
    });
    onVal('inp-da2-y', function (v) {
      st.selectedId = 'da-2';
      st.objects[1].x = 435;
      st.objects[1].y = Math.abs(v - 129) <= 8 ? 129 : v;
    });
    onVal('inp-cua-rotate', function (v) {
      st.selectedId = 'cua-ham';
      st.objects[2].rotate = Math.abs(v) <= 6 ? 0 : v;
    });
    onClick('btn-add-pontoon', function () { executeStageAction('add-pontoon'); });
    onVal('inp-pontoon-rx', function (v) { st.objects.forEach(function (o) { o.rx = v; }); });
    onClick('btn-align-middle', function () { executeStageAction('align-middle'); });
    onClick('btn-distribute-h', function () { executeStageAction('distribute-h'); });
    onClick('btn-toggle-smooth', function () { executeStageAction('toggle-smooth'); });
    onVal('inp-bezier-cy', function (v) {
      st.objects[0].smooth = true;
      st.objects[0].cy = v;
      if (v <= 155) { st.objects[0].x2 = 545; st.objects[0].y2 = 265; }
    });
    onVal('inp-bezier-x2', function (v) { st.objects[0].x2 = v; st.objects[0].y2 = 265; });
    bindAttr('data-vach-op', function (val) { st.objects[1].booleanOp = val; });
    bindAttr('data-cau-op', function (val) { st.objects[0].booleanOp = val; });
    bindAttr('data-nhan-fmt', function (val) { st.objects[0].format = val; });
    bindAttr('data-cay-fmt', function (val) { st.objects[1].imageFormat = val; });
    onVal('inp-rgb-r', function (v) { st.objects[0].r = v; });
    onVal('inp-rgb-g', function (v) {
      st.objects[0].g = v;
      if (v >= 215) { st.objects[0].brightness = 110; st.objects[0].contrast = 115; }
    });
    onVal('inp-rgb-b', function (v) { st.objects[0].b = v; });
    onVal('inp-bright', function (v) { st.objects[0].brightness = v; });
    onVal('inp-contrast', function (v) { st.objects[0].contrast = v; });
    bindAttr('data-layer-up', function (val) {
      var i = Number(val);
      if (i > 0) { var tmp = st.layers[i - 1]; st.layers[i - 1] = st.layers[i]; st.layers[i] = tmp; }
    });
    bindAttr('data-layer-down', function (val) {
      var i = Number(val);
      if (i < st.layers.length - 1) { var tmp = st.layers[i + 1]; st.layers[i + 1] = st.layers[i]; st.layers[i] = tmp; }
    });
    onClick('btn-toggle-mask', function () { executeStageAction('paint-mask-black'); });
    onVal('inp-tl-be', function (v) { st.timeline.beCuuHoTick = v; st.timeline.coPhuDeNguon = true; });
    onVal('inp-tl-nhac', function (v) { st.timeline.nhacSongCaTick = v; st.timeline.coPhuDeNguon = true; });
    onClick('btn-toggle-sub', function () { st.timeline.coPhuDeNguon = !st.timeline.coPhuDeNguon; });
    bindAttr('data-flex-wrap', function (val) {
      st.cssBox.flexWrap = val;
      if (val === 'wrap') { st.cssBox.padding = 14; st.cssBox.gap = 14; }
    });
    onVal('inp-css-pad', function (v) { st.cssBox.padding = v; st.cssBox.gap = v; });
    bindAttr('data-btn-theme', function (val) { st.cssBox.buttonTheme = val; });
  }
  /**
   * Chạy diễn hoạt đa bước Cảm biến Robot (Scan -> Move -> Celebrate/Fail).
   */
  function runStageShow() {
    var man = currentMan();
    var kq = man.kiemDoHoa(AppState.stageState);
    if (DHSK && typeof DHSK.chayDienHoat === 'function') {
      DHSK.chayDienHoat({
        man: man,
        state: AppState.stageState,
        ketQua: kq,
        onSound: function (sfxName) { playSfx(sfxName); },
        onFrame: function (animState) {
          AppState.anim = animState;
          renderStageAndChecklist(true);
          renderDialogue();
        },
        onComplete: function (kqChuan, finalAnim) {
          AppState.anim = finalAnim;
          if (kqChuan.dat) {
            var earnedStars = tinhSaoManHienTai();
            var prevStars = AppState.starsById[man.id] || 0;
            AppState.starsById[man.id] = Math.max(prevStars, earnedStars);
            AppState.completedIds[man.id] = true;
            saveProgress();
            renderAll();
            if (MHG && typeof MHG.hienHopChienThang === 'function') {
              MHG.hienHopChienThang({
                man: man,
                stars: earnedStars,
                onReplay: function () { loadStage(AppState.currentIndex); },
                onMap: function () {
                  MHG.veBanDo(AppState, MC.MAN_CHOI, loadStage);
                  MHG.chuyenManHinh('map');
                },
                onNext: function () {
                  var nextIdx = (AppState.currentIndex + 1) % MC.MAN_CHOI.length;
                  loadStage(nextIdx);
                  MHG.chuyenManHinh('stage');
                }
              });
            }
          } else {
            AppState.attempts = (AppState.attempts || 0) + 1;
            if (MHG && typeof MHG.rungSanKhau === 'function') MHG.rungSanKhau();
            renderStageAndChecklist();
            renderDialogue();
          }
        }
      });
    }
  }
  function renderAll() {
    var t = I18N[AppState.lang];
    document.documentElement.setAttribute('data-theme', AppState.theme);
    var titleEl = document.getElementById('app-main-title');
    if (titleEl) titleEl.textContent = t.appTitle;
    var subEl = document.getElementById('app-main-sub');
    if (subEl) subEl.textContent = t.appSub;
    var themeBtn = document.getElementById('btn-theme-toggle');
    if (themeBtn) {
      themeBtn.innerHTML = IC.icon(AppState.theme === 'dark' ? 'sun' : 'moon', 15) +
        '<span>' + (AppState.theme === 'dark' ? 'Sáng' : 'Tối') + '</span>';
    }
    var langBtn = document.getElementById('btn-lang-toggle');
    if (langBtn) langBtn.textContent = AppState.lang === 'vi' ? 'VI / EN' : 'EN / VI';
    var btnPlay = document.getElementById('btn-play-show');
    if (btnPlay) btnPlay.innerHTML = IC.icon('play', 16) + '<span>' + t.playShow + '</span>';
    var btnAuto = document.getElementById('btn-auto-demo');
    if (btnAuto) btnAuto.innerHTML = IC.icon('spark', 15) + '<span>' + t.autoDemo + '</span>';
    var btnUndo = document.getElementById('btn-undo');
    if (btnUndo) btnUndo.innerHTML = IC.icon('undo', 15) + '<span>' + t.undoBtn + '</span>';
    var btnReset = document.getElementById('btn-reset-stage');
    if (btnReset) btnReset.innerHTML = IC.icon('reset', 15) + '<span>' + t.resetStage + '</span>';
    renderStageList();
    renderToolDock();
    renderContextBar();
    renderDialogue();
    renderStageAndChecklist();
    renderInspector();
  }
  function openRealWorkbenchModal() {
    var modal = document.getElementById('real-workbench-modal');
    var iframe = document.getElementById('real-workbench-iframe');
    var badgeEl = document.getElementById('real-workbench-badge');
    var titleEl = document.getElementById('real-workbench-title');
    var stepsEl = document.getElementById('real-workbench-steps');
    if (!modal || !iframe) return;
    var man = currentMan();
    var isVector = man.lop === 10;
    if (badgeEl) badgeEl.textContent = isVector ? 'SVG-Edit 7.4.2' : 'miniPaint 4.14.3';
    if (titleEl) titleEl.textContent = (isVector ? 'Xưởng Vẽ Vector: ' : 'Xưởng Sửa Ảnh: ') + man.ten;
    if (stepsEl) stepsEl.textContent = man.goiY;
    var targetSrc = isVector ? '/tin-hoc/xuong-ve.html' : '/tin-hoc/xuong-anh.html';
    if (iframe.getAttribute('src') !== targetSrc) {
      iframe.setAttribute('src', targetSrc);
    }
    modal.classList.remove('hidden');
  }
  function initApp() {
    loadProgress();
    var btnPlay = document.getElementById('btn-play-show');
    if (btnPlay) btnPlay.addEventListener('click', runStageShow);
    var btnAuto = document.getElementById('btn-auto-demo');
    if (btnAuto) {
      btnAuto.addEventListener('click', function () {
        pushUndo();
        AppState.usedDemo = true;
        AppState.lastActionNote = 'Đã áp dụng Thao tác mẫu (Đạt 1 Sao).';
        currentMan().apDungGoiY(AppState.stageState);
        renderAll();
        runStageShow();
      });
    }
    var btnUndo = document.getElementById('btn-undo');
    if (btnUndo) {
      btnUndo.addEventListener('click', function () {
        if (DHSK && typeof DHSK.dungDienHoat === 'function') DHSK.dungDienHoat();
        if (AppState.history.length > 0) {
          playSfx('click');
          AppState.stageState = AppState.history.pop();
          AppState.anim = { mode: 'idle', message: '' };
          AppState.lastActionNote = 'Đã hoàn tác bước trước.';
          renderAll();
        }
      });
    }
    var btnReset = document.getElementById('btn-reset-stage');
    if (btnReset) {
      btnReset.addEventListener('click', function () {
        playSfx('click');
        loadStage(AppState.currentIndex);
      });
    }
    var btnPrev = document.getElementById('btn-prev-stage');
    if (btnPrev) btnPrev.addEventListener('click', function () { playSfx('click'); loadStage((AppState.currentIndex - 1 + MC.MAN_CHOI.length) % MC.MAN_CHOI.length); });
    var btnNext = document.getElementById('btn-next-stage');
    if (btnNext) btnNext.addEventListener('click', function () { playSfx('click'); loadStage((AppState.currentIndex + 1) % MC.MAN_CHOI.length); });
    var btnStartGame = document.getElementById('btn-start-game');
    if (btnStartGame) {
      btnStartGame.addEventListener('click', function () {
        var targetIdx = AppState.currentIndex;
        for (var i = 0; i < MC.MAN_CHOI.length; i++) {
          var stId = MC.MAN_CHOI[i].id;
          if ((AppState.starsById[stId] || 0) === 0 && !AppState.completedIds[stId]) { targetIdx = i; break; }
        }
        loadStage(targetIdx);
        if (MHG && typeof MHG.chuyenManHinh === 'function') MHG.chuyenManHinh('stage', { silent: true });
      });
    }
    var plaqueEl = document.getElementById('hud-stage-plaque');
    if (plaqueEl) {
      plaqueEl.style.cursor = 'pointer';
      plaqueEl.addEventListener('click', function () { if (MHG && typeof MHG.chuyenManHinh === 'function') MHG.chuyenManHinh('stage'); });
    }
    var starsPillEl = document.getElementById('hud-total-stars-pill');
    if (starsPillEl) {
      starsPillEl.style.cursor = 'pointer';
      starsPillEl.addEventListener('click', function () {
        if (MHG && typeof MHG.veBanDo === 'function') { MHG.veBanDo(AppState, MC.MAN_CHOI, loadStage); MHG.chuyenManHinh('map'); }
      });
    }
    var btnSound = document.getElementById('btn-sound-toggle');
    if (btnSound) btnSound.addEventListener('click', function () { saveProgress(); });
    var themeBtn = document.getElementById('btn-theme-toggle');
    if (themeBtn) {
      themeBtn.addEventListener('click', function () {
        AppState.theme = AppState.theme === 'dark' ? 'light' : 'dark';
        playSfx('click'); saveProgress(); renderAll();
      });
    }
    var langBtn = document.getElementById('btn-lang-toggle');
    if (langBtn) {
      langBtn.addEventListener('click', function () {
        AppState.lang = AppState.lang === 'vi' ? 'en' : 'vi';
        playSfx('click'); renderAll();
      });
    }
    var filterBar = document.getElementById('grade-filter-bar');
    if (filterBar) {
      filterBar.addEventListener('click', function (ev) {
        var btn = ev.target.closest('[data-grade]');
        if (!btn) return;
        playSfx('click'); AppState.filterGrade = btn.getAttribute('data-grade'); renderStageList();
      });
    }
    var toolDock = document.getElementById('studio-tool-dock');
    if (toolDock) {
      toolDock.addEventListener('click', function (ev) {
        var runBtn = ev.target.closest('#btn-dock-run');
        if (runBtn) {
          runStageShow();
          return;
        }
        var stepBtn = ev.target.closest('[data-step-action]');
        if (stepBtn) {
          executeStageAction(stepBtn.getAttribute('data-step-action'));
        }
      });
    }
    var ctxBar = document.getElementById('studio-context-bar');
    if (ctxBar) {
      ctxBar.addEventListener('click', function (ev) {
        var runNow = ev.target.closest('#btn-ctx-run-now');
        if (runNow) {
          runStageShow();
          return;
        }
        var propBtn = ev.target.closest('[data-ctx-prop]');
        if (propBtn && AppState.stageState) {
          var prop = propBtn.getAttribute('data-ctx-prop');
          var st = AppState.stageState;
          var da1 = st.objects && st.objects[0];
          var da2 = st.objects && st.objects[1];
          var cua = st.objects && st.objects[2];
          if (prop === 'sel-da-1') return executeStageAction('select-da-1');
          if (prop === 'sel-da-2') return executeStageAction('select-da-2');
          if (prop === 'sel-cua') return executeStageAction('select-cua-ham');
          if (prop === 'toggle-lock') return executeStageAction('toggle-lock-aspect');
          pushUndo();
          playSfx('click');
          if ((prop === 'rx-dec' || prop === 'rx-inc') && da1) {
            var nextRx = Math.max(16, Math.min(56, (da1.rx || 30) + (prop === 'rx-inc' ? 4 : -4)));
            if (Math.abs(nextRx - 30) <= 2) nextRx = 30;
            da1.rx = nextRx;
            if (da1.lockAspect) da1.ry = nextRx;
          } else if ((prop === 'da2-up' || prop === 'da2-down') && da2) {
            var nextY = Math.max(95, Math.min(235, (da2.y || 199) + (prop === 'da2-down' ? 14 : -14)));
            if (Math.abs(nextY - 129) <= 8) nextY = 129;
            da2.x = 435;
            da2.y = nextY;
          } else if ((prop === 'rot-dec' || prop === 'rot-inc') && cua) {
            var nextRot = Math.max(-90, Math.min(90, (cua.rotate || 0) + (prop === 'rot-inc' ? 15 : -15)));
            if (Math.abs(nextRot) <= 6) nextRot = 0;
            cua.rotate = nextRot;
          }
          renderAll();
          return;
        }
        var btn = ev.target.closest('[data-ctx-action]');
        if (btn) {
          executeStageAction(btn.getAttribute('data-ctx-action'));
        }
      });
    }
    var btnOpenWb = document.getElementById('btn-open-real-workbench');
    if (btnOpenWb) btnOpenWb.addEventListener('click', openRealWorkbenchModal);
    var btnCloseWb = document.getElementById('btn-close-workbench');
    if (btnCloseWb) {
      btnCloseWb.addEventListener('click', function () {
        var modal = document.getElementById('real-workbench-modal');
        if (modal) modal.classList.add('hidden');
      });
    }
    var btnApplyWb = document.getElementById('btn-apply-workbench');
    if (btnApplyWb) {
      btnApplyWb.addEventListener('click', function () {
        pushUndo();
        playSfx('ding');
        currentMan().apDungGoiY(AppState.stageState);
        AppState.lastActionNote = 'Đã áp dụng chỉnh sửa từ Xưởng đồ họa thật vào bản đồ!';
        var modal = document.getElementById('real-workbench-modal');
        if (modal) modal.classList.add('hidden');
        renderAll();
      });
    }
    var svgWrap = document.getElementById('stage-svg-container');
    if (svgWrap) {
      svgWrap.addEventListener('pointerdown', function (ev) {
        var interactive = ev.target.closest('[data-stage-action], [data-drag]');
        if (interactive) {
          if (DHSK && typeof DHSK.dungDienHoat === 'function') DHSK.dungDienHoat();
          pushUndo();
        }
      }, true);
      TTS.bindStageInteractions(svgWrap, function () {
        return {
          man: currentMan(),
          state: AppState.stageState,
          onUpdate: function (actionMessage, isDragging) {
            AppState.anim = { mode: 'idle', message: '' };
            if (actionMessage) {
              AppState.lastActionNote = actionMessage;
              if (!isDragging) playSfx('pop');
            }
            renderStageAndChecklist(isDragging);
            renderToolDock();
            renderContextBar();
            if (!isDragging) {
              renderInspector();
              renderDialogue();
            }
          }
        };
      });
    }
    loadStage(0);
    if (MHG && typeof MHG.chuyenManHinh === 'function') {
      MHG.chuyenManHinh('title', { silent: true });
    }
  }
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initApp);
    } else {
      initApp();
    }
  }
})();
