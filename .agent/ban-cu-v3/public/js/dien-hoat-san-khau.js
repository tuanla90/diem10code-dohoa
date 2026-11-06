/**
 * dien-hoat-san-khau.js — Bộ điều khiển Diễn hoạt Đa bước (Scan -> Move -> Celebrate/Fail)
 * và Xử lý Thao tác Công cụ Đồ họa trực tiếp trên Bản đồ Robot (apThaoTacTrenSan).
 * Đồng bộ 100% với cấu trúc dữ liệu của man-choi.js, ung-dung.js và kiem-game.mjs.
 * Tuân thủ nghiêm ngặt: Không Emoji/Unicode symbol, giới hạn dưới 1000 dòng.
 */
(function (root) {
  'use strict';

  var activeTimer = null;

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function cellRect(col, row) {
    if (root.VeSanKhau && typeof root.VeSanKhau.cellRect === 'function') {
      return root.VeSanKhau.cellRect(col, row);
    }
    var x = 152 + col * 62;
    var y = 50 + row * 62;
    return { x: x, y: y, w: 62, h: 62, cx: x + 31, cy: y + 31 };
  }

  /**
   * Dừng diễn hoạt đang chạy
   */
  function dungDienHoat() {
    if (activeTimer) {
      clearTimeout(activeTimer);
      activeTimer = null;
    }
  }

  /**
   * Thực thi thao tác công cụ đồ họa nhanh trên bản đồ (data-stage-action)
   * @param {string} actName - Mã thao tác
   * @param {Object} man - Đối tượng màn chơi từ man-choi.js
   * @param {Object} state - Trạng thái hiện tại của màn chơi
   * @returns {{changed: boolean, message: string}}
   */
  function apThaoTacTrenSan(actName, man, state) {
    if (!actName || !state) return { changed: false, message: '' };
    var objs = state.objects || [];

    // Màn 1 (G10-01): Kịch bản gốc lap-mo-da.6 (shape_bridge_lob) — 3 Công cụ Vector (Scale W:H, Move, Rotate)
    if (actName === 'select-da-1' || actName === 'select-rock' || actName === 'tool-scale') {
      state.selectedId = 'da-1';
      state.activeTool = 'scale';
      return { changed: true, message: 'Đang dùng Công cụ Co giãn (Scale W:H) trên Đá mỏ #1 tại Ô(2,1). Hãy bật Ổ khóa W:H rồi nắm kéo tay nắm góc về vòng tròn 60x60 (Rx = Ry = 30px)!' };
    }
    if (actName === 'select-da-2' || actName === 'tool-move') {
      state.selectedId = 'da-2';
      state.activeTool = 'move';
      return { changed: true, message: 'Đang dùng Công cụ Di chuyển (Move) trên Đá mỏ #2. Hãy nắm kéo viên đá từ ngách Ô(4,2) lên đúng Ô(4,1) để Robot R1 hất vào nút M(5,1)!' };
    }
    if (actName === 'select-cua-ham' || actName === 'select-bridge' || actName === 'tool-rotate') {
      state.selectedId = 'cua-ham';
      state.activeTool = 'rotate';
      return { changed: true, message: 'Đang dùng Công cụ Xoay hướng (Rotate) trên Cửa hầm C tại Ô(2,3). Hãy nắm kéo tay nắm xoay trên vòng thước đo góc từ 90 độ về 0 độ!' };
    }
    if (actName === 'toggle-lock-aspect') {
      var da1 = objs.find(function (o) { return o.id === 'da-1'; });
      if (da1) {
        state.selectedId = 'da-1';
        state.activeTool = 'scale';
        da1.lockAspect = !da1.lockAspect;
        if (da1.lockAspect && Math.abs(da1.rx - da1.ry) > 2) {
          var curMax = Math.max(da1.rx || 46, da1.ry || 46, 44);
          da1.rx = curMax;
          da1.ry = curMax;
          return {
            changed: true,
            message: 'Đã BẬT Khóa tỷ lệ 1:1 (Rx = Ry = ' + curMax + 'px). Giờ hãy nắm kéo tay nắm góc thu nhỏ Đá mỏ #1 về đúng vòng tròn chuẩn 30px!'
          };
        }
        return {
          changed: true,
          message: da1.lockAspect
            ? 'Đã BẬT Khóa tỷ lệ khung hình W:H (Rx = Ry = ' + da1.rx + 'px).'
            : 'Đã TẮT Khóa tỷ lệ khung hình W:H (có thể kéo riêng từng cạnh Rx hoặc Ry).'
        };
      }
    }

    // Màn 2 (G10-02): Cầu phao qua sông
    if (actName === 'add-pontoon') {
      var phaoList = objs.filter(function (o) { return o.loai === 'pontoon'; });
      if (phaoList.length < 4) {
        objs.push({
          id: 'phao-4',
          ten: 'Phao nổi 4 (Mới)',
          loai: 'pontoon',
          x: 438,
          y: 260,
          w: 72,
          h: 32,
          rx: 16,
          fill: '#38bdf8',
          stroke: '#0369a1',
          editable: ['move', 'cornerRadius']
        });
      }
      objs.forEach(function (o) { if (o.loai === 'pontoon') o.rx = Math.max(16, o.rx || 16); });
      return { changed: true, message: 'Đã triệu hồi đủ 4 nhịp phao bo góc (Rx = 16px) lên mặt sông.' };
    }
    if (actName === 'align-middle') {
      objs.forEach(function (o) {
        if (o.loai === 'pontoon') {
          o.y = 260;
          o.rx = Math.max(16, o.rx || 16);
        }
      });
      state.daCanGiua = true;
      return { changed: true, message: 'Đã Căn giữa ngang (Align Middle) các phao thẳng Hàng H3 (Y = 260).' };
    }
    if (actName === 'distribute-h') {
      var phao2 = objs.filter(function (o) { return o.loai === 'pontoon'; });
      if (phao2.length < 4) {
        objs.push({
          id: 'phao-4',
          ten: 'Phao nổi 4 (Mới)',
          loai: 'pontoon',
          x: 438,
          y: 260,
          w: 72,
          h: 32,
          rx: 16,
          fill: '#38bdf8',
          stroke: '#0369a1',
          editable: ['move', 'cornerRadius']
        });
        phao2 = objs.filter(function (o) { return o.loai === 'pontoon'; });
      }
      phao2.forEach(function (p, i) {
        p.x = 180 + i * 86;
        p.y = 260;
        p.rx = Math.max(16, p.rx || 16);
      });
      state.daPhanBoDeu = true;
      return { changed: true, message: 'Đã Phân bố đều (Distribute Horizontally) 4 nhịp phao qua Cột C2..C5.' };
    }

    // Màn 3 (G10-03): Đường cong Bézier
    if (actName === 'toggle-smooth') {
      var dc = objs.find(function (o) { return o.id === 'dong-chay'; });
      if (dc) {
        dc.smooth = true;
        if (dc.cy > 155) dc.cy = 120;
        return { changed: true, message: 'Đã chuyển thành Đường cong Bézier trơn (Smooth Node) uốn vòng qua Hàng H1.' };
      }
    }
    if (actName === 'snap-boat-end') {
      var dc2 = objs.find(function (o) { return o.id === 'dong-chay'; });
      if (dc2) {
        dc2.smooth = true;
        dc2.cx = 340;
        dc2.cy = 120;
        dc2.x2 = 545;
        dc2.y2 = 265;
        return { changed: true, message: 'Đã nối điểm cuối đường cong Bézier vào đúng mũi Xuồng cứu hộ tại Ô(6,3).' };
      }
    }

    // Màn 4 (G10-04): Phép Toán Boolean Hang Đá
    if (actName === 'boolean-union') {
      var cau4 = objs.find(function (o) { return o.id === 'cau-doi'; });
      if (cau4) {
        cau4.booleanOp = 'union';
        state.selectedId = 'cau-doi';
        return { changed: true, message: 'Đã áp dụng Phép Hợp (Boolean Union) hàn liền 2 nhịp cầu đá tại Ô(2,3) & Ô(3,3).' };
      }
    }
    if (actName === 'boolean-diff') {
      var vach4 = objs.find(function (o) { return o.id === 'vach-da'; });
      if (vach4) {
        vach4.booleanOp = 'difference';
        state.selectedId = 'vach-da';
        return { changed: true, message: 'Đã áp dụng Phép Trừ (Boolean Difference) khoét thủng vách đá tại Ô(5,3).' };
      }
    }

    // Màn 5 (G10-05): Vector SVG & PNG Nền trong suốt
    if (actName === 'set-vector-svg') {
      var nhan5 = objs.find(function (o) { return o.id === 'nhan-container'; });
      if (nhan5) {
        nhan5.format = 'vector-svg';
        state.selectedId = 'nhan-container';
        return { changed: true, message: 'Đã chuyển nhãn Container #42 tại Ô(3,3) sang định dạng Vector (.SVG) sắc nét.' };
      }
    }
    if (actName === 'set-tree-png') {
      var cay5 = objs.find(function (o) { return o.id === 'tan-cay'; });
      if (cay5) {
        cay5.imageFormat = 'png';
        state.selectedId = 'tan-cay';
        return { changed: true, message: 'Đã xuất tán cây tại Ô(5,3) sang định dạng .PNG có kênh Alpha trong suốt.' };
      }
    }

    // Màn 6 (G11-01): Pha màu ánh sáng RGB
    if (actName === 'preset-yellow-rgb') {
      var den6 = objs.find(function (o) { return o.id === 'den-vang'; });
      if (den6) {
        den6.r = 255;
        den6.g = 255;
        den6.b = 0;
        return { changed: true, message: 'Đã pha kênh màu Đỏ (255) + Lục (255) = Vàng chuẩn RGB(255, 255, 0) cho ô đèn hiệu.' };
      }
    }
    if (actName === 'boost-exposure') {
      var den6b = objs.find(function (o) { return o.id === 'den-vang'; });
      if (den6b) {
        den6b.brightness = 110;
        den6b.contrast = 115;
        return { changed: true, message: 'Đã tăng Độ sáng (110%) và Độ tương phản (115%) giúp cảm biến Drone đọc rõ vạch màu.' };
      }
    }

    // Màn 7 (G11-02): Thứ tự Layer & Mặt nạ lớp Layer Mask
    if (actName === 'swap-sand-above-mud') {
      if (Array.isArray(state.layers)) {
        var idxCat = state.layers.findIndex(function (l) { return l.id === 'layer-tham-cat'; });
        var idxBun = state.layers.findIndex(function (l) { return l.id === 'layer-bun-tron'; });
        if (idxCat > idxBun && idxBun !== -1) {
          var tmp = state.layers[idxBun];
          state.layers[idxBun] = state.layers[idxCat];
          state.layers[idxCat] = tmp;
        }
        return { changed: true, message: 'Đã đưa Lớp "Thảm Cát Chống Trơn" lên nằm TRÊN Lớp "Bùn Trơn" tại Ô(2..4,3).' };
      }
    }
    if (actName === 'paint-mask-black') {
      if (Array.isArray(state.layers)) {
        var suong = state.layers.find(function (l) { return l.id === 'layer-suong-mu'; });
        if (suong) {
          suong.visible = true;
          suong.maskCleared = true;
        }
        return { changed: true, message: 'Đã tô Đen lên Mặt nạ lớp (Layer Mask) mở cửa sổ nhìn xuyên sương mù tại Ô(5..6,3).' };
      }
    }

    // Màn 8 (G11-03): Dòng thời gian Timeline & Đồng bộ Âm thanh
    if (actName === 'sync-raft-tick-4') {
      if (state.timeline) {
        state.timeline.beCuuHoTick = 4;
        return { changed: true, message: 'Đã kéo Clip "Bè Cứu Hộ" về đúng Nhịp 4 (khớp lúc Drone thả phao tại Cột C3).' };
      }
    }
    if (actName === 'sync-duet-tick-7') {
      if (state.timeline) {
        state.timeline.nhacSongCaTick = 7;
        return { changed: true, message: 'Đã đồng bộ Clip "Nhạc Đệm Song Ca" vào đúng Nhịp 7 (khớp chuông đá Cột C5).' };
      }
    }
    if (actName === 'toggle-subtitle') {
      if (state.timeline) {
        state.timeline.coPhuDeNguon = true;
        return { changed: true, message: 'Đã bật Phụ đề và Ghi nguồn bản quyền âm thanh trên sân khấu.' };
      }
    }

    // Màn 9 (G12-01): CSS Box Model & Flexbox
    if (actName === 'toggle-flex-wrap') {
      if (state.cssBox) {
        state.cssBox.flexWrap = 'wrap';
        return { changed: true, message: 'Đã bật flex-wrap: wrap giúp 3 thẻ điều phối thu gọn, giải phóng hành lang bản đồ.' };
      }
    }
    if (actName === 'boost-box-spacing') {
      if (state.cssBox) {
        state.cssBox.padding = 14;
        state.cssBox.gap = 14;
        return { changed: true, message: 'Đã thiết lập Padding = 14px và Gap = 14px theo chuẩn CSS Box Model.' };
      }
    }
    if (actName === 'toggle-btn-contrast') {
      if (state.cssBox) {
        state.cssBox.buttonTheme = 'high-contrast';
        return { changed: true, message: 'Đã chuyển nút bấm sang bảng màu Tương phản cao (Contrast chuẩn WCAG).' };
      }
    }

    // Fallback: áp dụng gợi ý chuẩn nếu có mã action tổng hợp
    if (man && typeof man.apDungGoiY === 'function') {
      man.apDungGoiY(state);
      return { changed: true, message: 'Đã cập nhật thông số đạo cụ trên bản đồ.' };
    }
    return { changed: false, message: '' };
  }

  /**
   * Chạy diễn hoạt đa bước (Scan -> Move -> Celebrate/Fail)
   */
  function chayDienHoat(opts) {
    dungDienHoat();
    var man = opts.man;
    var state = opts.state;
    var kq = opts.ketQua || (man && typeof man.kiemDoHoa === 'function' ? man.kiemDoHoa(state) : []);
    var dat = kq.length > 0 && kq.every(function (item) { return item.ok; });
    var firstFail = kq.find(function (item) { return !item.ok; });
    var errTxt = firstFail ? ('Chưa đạt: ' + firstFail.txt) : (man ? man.thoaiLoi : 'Lỗi thông số đồ họa');

    var kqChuan = { dat: dat, chiTiet: kq, errorText: errTxt };

    // Chế độ chạy tức thì cho bộ kiểm thử tự động (kiem-game.mjs)
    if (opts.instant) {
      var phases = dat ? ['scan', 'move', 'celebrate'] : ['scan', 'move', 'fail'];
      var finalState = null;
      for (var i = 0; i < phases.length; i++) {
        var ph = phases[i];
        var stFrame = {
          mode: i === phases.length - 1 ? (dat ? 'win' : 'fail') : 'running',
          phase: ph,
          progress: (i + 1) / phases.length,
          ok: dat,
          errorText: errTxt
        };
        if (typeof opts.onFrame === 'function') opts.onFrame(stFrame);
        finalState = stFrame;
      }
      if (typeof opts.onComplete === 'function') opts.onComplete(kqChuan, finalState);
      return finalState;
    }

    // Chế độ chạy mượt theo thời gian thực trên trình duyệt
    if (typeof opts.onSound === 'function') opts.onSound('riser');

    var totalSteps = 24;
    var step = 0;

    function tick() {
      step++;
      var prog = step / totalSteps;
      var curPhase = prog < 0.35 ? 'scan' : (prog < 0.85 ? 'move' : (dat ? 'celebrate' : 'fail'));
      var isLast = step >= totalSteps;
      var frameState = {
        mode: isLast ? (dat ? 'win' : 'fail') : 'running',
        phase: curPhase,
        progress: prog,
        ok: dat,
        errorText: errTxt
      };

      if (typeof opts.onFrame === 'function') opts.onFrame(frameState);

      if (!isLast) {
        activeTimer = setTimeout(tick, 45);
      } else {
        activeTimer = null;
        if (typeof opts.onSound === 'function') opts.onSound(dat ? 'ding' : 'wrong');
        if (typeof opts.onComplete === 'function') opts.onComplete(kqChuan, frameState);
      }
    }

    tick();
    return { mode: 'running', phase: 'scan', progress: 0, ok: dat };
  }

  /**
   * Dựng lớp phủ SVG cho pha Diễn hoạt (Quét cảm biến, Cảnh báo lỗi svg-fail-overlay, hoặc Pháo giấy chiến thắng svg-confetti-burst)
   */
  function renderCutsceneLayer(man, state, anim) {
    if (!anim || anim.mode === 'idle') return '';
    var so = (man && man.so) || 1;
    var startC = cellRect(1, 3);
    var endC = cellRect(6, so === 9 ? 2 : 3);

    if (anim.mode === 'fail') {
      return '<g class="svg-fail-overlay" pointer-events="none">' +
        VeSanKhau.veTiaQuetRadar(startC.cx, startC.cy, (startC.cx + endC.cx) / 2, startC.cy, false) +
        '<circle cx="' + ((startC.cx + endC.cx) / 2) + '" cy="' + startC.cy + '" r="22" fill="none" stroke="#f43f5e" stroke-width="3" stroke-dasharray="5 4"/>' +
      '</g>';
    }

    if (anim.mode === 'win') {
      return '<g class="svg-confetti-burst" pointer-events="none">' +
        VeSanKhau.veTiaQuetRadar(startC.cx, startC.cy, endC.cx, endC.cy, true) +
        '<circle cx="' + endC.cx + '" cy="' + endC.cy + '" r="28" fill="none" stroke="#22c55e" stroke-width="3" stroke-dasharray="6 4"/>' +
        '<circle cx="' + endC.cx + '" cy="' + endC.cy + '" r="18" fill="none" stroke="#fde047" stroke-width="2"/>' +
        '<title>ĐÃ AN TOÀN!</title>' +
      '</g>';
    }

    // Đang chạy (running)
    return '<g class="svg-running-overlay" pointer-events="none">' +
      VeSanKhau.veTiaQuetRadar(startC.cx, startC.cy, endC.cx, endC.cy, !!anim.ok) +
    '</g>';
  }

  var API = {
    chayDienHoat: chayDienHoat,
    dungDienHoat: dungDienHoat,
    apThaoTacTrenSan: apThaoTacTrenSan,
    renderCutsceneLayer: renderCutsceneLayer
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  root.DienHoatSanKhau = API;
})(typeof window !== 'undefined' ? window : globalThis);
