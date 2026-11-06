/**
 * tuong-tac-svg.js — Lớp Phủ Gizmo Đồ Họa Trực Quan Trên Bản Đồ Robot
 * Thiết kế thuần hình học (Zero Map Text Clutter): Chỉ dùng khung viền, vòng tâm ngắm,
 * mũi tên hướng dẫn và tay nắm kéo-thả 1:1 mượt mà (Magnetic Auto-Snap).
 * Tuân thủ nghiêm ngặt: Không Emoji/Unicode symbol, giới hạn dưới 1000 dòng.
 */
(function (root) {
  'use strict';
  var activeCleanup = null;
  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }
  function cellRect(col, row) {
    if (root.VeSanKhau && typeof root.VeSanKhau.cellRect === 'function') {
      return root.VeSanKhau.cellRect(col, row);
    }
    var x = 120 + col * 70;
    var y = 24 + row * 70;
    return { x: x, y: y, w: 70, h: 70, cx: x + 35, cy: y + 35 };
  }
  /**
   * Vẽ khung viền ô mục tiêu thuần hình học (không vẽ chữ đè lên bản đồ)
   */
  function veKhungOMucTieu(col, row, ok, action) {
    var c = cellRect(col, row);
    var color = ok ? '#22c55e' : '#38bdf8';
    var attr = action ? ('data-stage-action="' + action + '" style="cursor:pointer"') : 'pointer-events="none"';
    return '<g ' + attr + '>' +
      '<rect x="' + (c.x + 3) + '" y="' + (c.y + 3) + '" width="' + (c.w - 6) + '" height="' + (c.h - 6) + '" rx="8" fill="' + color + '" fill-opacity="' + (ok ? '0.08' : '0.05') + '" stroke="' + color + '" stroke-width="2" stroke-dasharray="' + (ok ? 'none' : '6 4') + '"/>' +
      '<circle cx="' + (c.x + c.w - 11) + '" cy="' + (c.y + 11) + '" r="5" fill="' + color + '" stroke="#ffffff" stroke-width="1.5"/>' +
    '</g>';
  }
  /**
   * Vẽ vòng tròn gợi ý vị trí cần thao tác (Pulsing Target Ring)
   */
  function veNhipGoiY(x, y, r, color) {
    var c = color || '#fbbf24';
    return '<g class="gizmo-pulse-hint" pointer-events="none">' +
      '<circle cx="' + x + '" cy="' + y + '" r="' + (r + 6) + '" fill="none" stroke="' + c + '" stroke-width="2" stroke-dasharray="4 4" opacity="0.85"/>' +
    '</g>';
  }
  /**
   * MÀN 1 (G10-01 — lap-mo-da.6): Bộ 3 Công cụ Đồ họa Vector Thực Thụ (Inkscape / Figma Transform Gizmos)
   * Toàn bộ hình ảnh vật thể (Đá mỏ #1, Đá mỏ #2, Cửa hầm C, Hố u, Nút M, Thùng H) được vẽ bằng VeVector trên Canvas bên dưới;
   * Lớp SVG này CHỈ vẽ khung chọn, đường dẫn quỹ đạo và các tay nắm công cụ (Scale W:H, Move, Rotate).
   */
  function renderStage1(man, st) {
    var objs = st.objects || [];
    var da1 = objs.find(function (o) { return o.id === 'da-1'; }) || { x: 295, y: 129, rx: 48, ry: 22, lockAspect: false };
    var da2 = objs.find(function (o) { return o.id === 'da-2'; }) || { x: 435, y: 199, rx: 30, ry: 30 };
    var cua = objs.find(function (o) { return o.id === 'cua-ham'; }) || { x: 295, y: 269, rotate: 90 };

    var c21 = cellRect(2, 1);
    var c31 = cellRect(3, 1);
    var c41 = cellRect(4, 1);
    var c51 = cellRect(5, 1);
    var c23 = cellRect(2, 3);

    var rx1 = clamp(Number(da1.rx) || 30, 16, 56);
    var ry1 = clamp(Number(da1.ry) || 30, 16, 56);
    var da1SizeOk = Math.abs(rx1 - ry1) <= 2 && rx1 >= 26 && rx1 <= 34;
    var da1Ok = !!da1.lockAspect && da1SizeOk;

    var d2x = typeof da2.x === 'number' ? da2.x : 435;
    var d2y = typeof da2.y === 'number' ? da2.y : 199;
    var da2Ok = Math.abs(d2x - c41.cx) <= 14 && Math.abs(d2y - c41.cy) <= 14;

    var cuaDeg = Number(cua.rotate) || 0;
    var cuaOk = Math.abs(cuaDeg) <= 8;

    var selId = st.selectedId || 'da-1';
    var isDa1Sel = selId === 'da-1';
    var isDa2Sel = selId === 'da-2';
    var isCuaSel = selId === 'cua-ham';

    var lockBg = da1.lockAspect ? '#16a34a' : '#f59e0b';
    var lockShackle = da1.lockAspect
      ? 'M -4 -2 L -4 -6 A 4 4 0 0 1 4 -6 L 4 -2'
      : 'M -4 -2 L -4 -7 A 4 4 0 0 1 4 -7 L 4 -5';

    var rotRad = (cuaDeg - 90) * Math.PI / 180;
    var rotHandleX = c23.cx + 42 * Math.cos(rotRad);
    var rotHandleY = c23.cy + 42 * Math.sin(rotRad);

    return '<g class="map-builder-stage-1">' +
      // Khung ô mục tiêu của 3 đối tượng trên lưới lap-mo-da.6
      veKhungOMucTieu(2, 1, da1Ok, 'select-da-1') +
      veKhungOMucTieu(4, 1, da2Ok, 'select-da-2') +
      veKhungOMucTieu(2, 3, cuaOk, 'select-cua-ham') +

      // Đường quỹ đạo ném đá của R1: Ô(2,1) -> Hố u(3,1) và Ô(4,1) -> Nút đè M(5,1)
      '<path d="M ' + c21.cx + ' ' + c21.cy + ' Q ' + ((c21.cx + c31.cx) / 2) + ' ' + (c21.cy - 28) + ' ' + c31.cx + ' ' + c31.cy + '" fill="none" stroke="' + (da1Ok ? '#22c55e' : '#38bdf8') + '" stroke-width="2" stroke-dasharray="4 4" stroke-opacity="0.7" pointer-events="none"/>' +
      '<path d="M ' + c41.cx + ' ' + c41.cy + ' Q ' + ((c41.cx + c51.cx) / 2) + ' ' + (c41.cy - 28) + ' ' + c51.cx + ' ' + c51.cy + '" fill="none" stroke="' + (da2Ok ? '#22c55e' : '#38bdf8') + '" stroke-width="2" stroke-dasharray="4 4" stroke-opacity="0.7" pointer-events="none"/>' +

      // =====================================================================
      // 1. GIZMO CÔNG CỤ CO GIÃN (SCALE W:H) TRÊN ĐÁ MỎ #1 TẠI Ô(2,1)
      // =====================================================================
      // Vòng tròn khuôn chuẩn R = 30px (60x60) để cảm biến shape("front") == "round" nhận diện
      '<circle cx="' + c21.cx + '" cy="' + c21.cy + '" r="30" fill="none" stroke="' + (da1Ok ? '#22c55e' : '#38bdf8') + '" stroke-width="2" stroke-dasharray="5 4" pointer-events="none"/>' +
      // Vùng bấm chọn Đá mỏ #1 (trong suốt để thấy nguyên bản VeVector.vat("da-mo") bên dưới)
      '<ellipse data-select-obj="da-1" data-stage-action="select-da-1" cx="' + c21.cx + '" cy="' + c21.cy + '" rx="' + rx1 + '" ry="' + ry1 + '" fill="transparent" stroke="' + (da1Ok ? '#22c55e' : (isDa1Sel ? '#38bdf8' : 'rgba(251,191,36,0.65)')) + '" stroke-width="' + (isDa1Sel ? '2.2' : '1.5') + '" stroke-dasharray="4 3" style="cursor:pointer"/>' +
      // Khung Bounding Box W x H
      '<rect x="' + (c21.cx - rx1) + '" y="' + (c21.cy - ry1) + '" width="' + (rx1 * 2) + '" height="' + (ry1 * 2) + '" rx="3" fill="none" stroke="' + (da1Ok ? '#22c55e' : (isDa1Sel ? '#38bdf8' : 'rgba(148,163,184,0.5)')) + '" stroke-width="1.6" stroke-dasharray="4 3" pointer-events="none"/>' +

      // Nút Bật/Tắt Khóa Tỷ Lệ W:H (Lock Aspect Ratio)
      (!da1.lockAspect ? veNhipGoiY(c21.cx, c21.cy - ry1 - 16, 10, '#fbbf24') : '') +
      '<g data-stage-action="toggle-lock-aspect" data-select-obj="da-1" transform="translate(' + c21.cx + ',' + (c21.cy - ry1 - 16) + ')" style="cursor:pointer">' +
        '<circle cx="0" cy="0" r="15" fill="transparent"/>' +
        '<rect x="-12" y="-10" width="24" height="20" rx="5" fill="' + lockBg + '" stroke="#ffffff" stroke-width="1.8"/>' +
        '<path d="' + lockShackle + '" fill="none" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round"/>' +
        '<rect x="-4.5" y="-2" width="9" height="7" rx="1.5" fill="#ffffff"/>' +
      '</g>' +

      // Tay nắm cạnh Phải (Rx)
      '<g data-drag="resize-da-rx" data-select-obj="da-1" transform="translate(' + (c21.cx + rx1) + ',' + c21.cy + ')" style="cursor:ew-resize">' +
        '<circle cx="0" cy="0" r="13" fill="transparent"/>' +
        '<rect x="-5" y="-7" width="10" height="14" rx="2.5" fill="#ffffff" stroke="#0284c7" stroke-width="2"/>' +
      '</g>' +

      // Tay nắm cạnh Dưới (Ry)
      '<g data-drag="resize-da-ry" data-select-obj="da-1" transform="translate(' + c21.cx + ',' + (c21.cy + ry1) + ')" style="cursor:ns-resize">' +
        '<circle cx="0" cy="0" r="13" fill="transparent"/>' +
        '<rect x="-7" y="-5" width="14" height="10" rx="2.5" fill="#ffffff" stroke="#0284c7" stroke-width="2"/>' +
      '</g>' +

      // Tay nắm Góc Đông-Nam (SE Corner Scale Handle)
      ((da1.lockAspect && !da1SizeOk) ? veNhipGoiY(c21.cx + rx1, c21.cy + ry1, 10, '#38bdf8') : '') +
      '<g data-drag="resize-da-corner" data-select-obj="da-1" transform="translate(' + (c21.cx + rx1) + ',' + (c21.cy + ry1) + ')" style="cursor:nwse-resize">' +
        '<circle cx="0" cy="0" r="16" fill="transparent"/>' +
        '<rect x="-7" y="-7" width="14" height="14" rx="3.5" fill="#ffffff" stroke="' + (da1Ok ? '#16a34a' : '#2563eb') + '" stroke-width="2.2"/>' +
        '<path d="M-3.5 -3.5 L3.5 3.5 M3.5 0 L3.5 3.5 L0 3.5 M-3.5 0 L-3.5 -3.5 L0 -3.5" fill="none" stroke="#1e293b" stroke-width="1.4" stroke-linecap="round"/>' +
      '</g>' +

      // =====================================================================
      // 2. GIZMO CÔNG CỤ DI CHUYỂN (MOVE TOOL) TRÊN ĐÁ MỎ #2: Ô(4,2) -> Ô(4,1)
      // =====================================================================
      // Vòng đích nét đứt tại Ô(4,1) và mũi tên dẫn hướng kéo từ vị trí hiện tại lên Ô(4,1)
      '<circle cx="' + c41.cx + '" cy="' + c41.cy + '" r="28" fill="none" stroke="' + (da2Ok ? '#22c55e' : '#38bdf8') + '" stroke-width="2" stroke-dasharray="5 4" pointer-events="none"/>' +
      (!da2Ok ? (
        '<line x1="' + d2x + '" y1="' + d2y + '" x2="' + c41.cx + '" y2="' + c41.cy + '" stroke="#fbbf24" stroke-width="2.2" stroke-dasharray="5 4" pointer-events="none"/>' +
        veNhipGoiY(d2x, d2y, 24, '#fbbf24')
      ) : '') +
      '<g data-drag="move-da-2" data-select-obj="da-2" data-stage-action="select-da-2" transform="translate(' + d2x + ',' + d2y + ')" style="cursor:grab">' +
        '<circle cx="0" cy="0" r="30" fill="transparent" stroke="' + (da2Ok ? '#22c55e' : (isDa2Sel ? '#38bdf8' : '#fbbf24')) + '" stroke-width="2.2" stroke-dasharray="' + (da2Ok ? 'none' : '5 3') + '"/>' +
        '<circle cx="0" cy="0" r="11" fill="#0f172a" fill-opacity="0.78" stroke="#ffffff" stroke-width="1.8"/>' +
        '<path d="M-6 0 L6 0 M0 -6 L0 6 M0 -6 L-2.5 -3.5 M0 -6 L2.5 -3.5 M0 6 L-2.5 3.5 M0 6 L2.5 3.5 M-6 0 L-3.5 -2.5 M-6 0 L-3.5 2.5 M6 0 L3.5 -2.5 M6 0 L3.5 2.5" fill="none" stroke="#38bdf8" stroke-width="1.5" stroke-linecap="round"/>' +
      '</g>' +

      // =====================================================================
      // 3. GIZMO CÔNG CỤ XOAY HƯỚNG (ROTATE TOOL) TRÊN CỬA HẦM C TẠI Ô(2,3)
      // =====================================================================
      // Vòng thước đo góc (Protractor Ring) quanh tâm Cửa hầm C(2,3)
      '<circle cx="' + c23.cx + '" cy="' + c23.cy + '" r="42" fill="none" stroke="' + (cuaOk ? '#22c55e' : (isCuaSel ? '#38bdf8' : '#fbbf24')) + '" stroke-width="1.8" stroke-dasharray="4 4" pointer-events="none"/>' +
      // Điểm chuẩn 0 độ (phía trên đỉnh vòng xoay)
      '<circle cx="' + c23.cx + '" cy="' + (c23.cy - 42) + '" r="5" fill="' + (cuaOk ? '#22c55e' : '#38bdf8') + '" stroke="#ffffff" stroke-width="1.5" pointer-events="none"/>' +
      // Vùng bấm chọn Cửa hầm C
      '<rect data-select-obj="cua-ham" data-stage-action="select-cua-ham" x="' + (c23.x + 8) + '" y="' + (c23.y + 8) + '" width="54" height="54" rx="8" fill="transparent" stroke="' + (isCuaSel ? '#38bdf8' : 'transparent') + '" stroke-width="2" stroke-dasharray="4 3" style="cursor:pointer"/>' +
      // Tay nắm kéo xoay Cửa hầm C (Rotation Handle)
      (!cuaOk ? veNhipGoiY(rotHandleX, rotHandleY, 11, '#fbbf24') : '') +
      '<line x1="' + c23.cx + '" y1="' + c23.cy + '" x2="' + rotHandleX + '" y2="' + rotHandleY + '" stroke="' + (cuaOk ? '#22c55e' : '#f59e0b') + '" stroke-width="2" stroke-dasharray="3 3" pointer-events="none"/>' +
      '<g data-drag="rotate-cua" data-select-obj="cua-ham" transform="translate(' + rotHandleX + ',' + rotHandleY + ')" style="cursor:grab">' +
        '<circle cx="0" cy="0" r="18" fill="transparent"/>' +
        '<circle cx="0" cy="0" r="9.5" fill="#ffffff" stroke="' + (cuaOk ? '#16a34a' : '#d97706') + '" stroke-width="2.5"/>' +
        '<path d="M-3.5 -2 A 4 4 0 1 1 -3.5 3 M-3.5 3 L-5.5 1 M-3.5 3 L-1 2.5" fill="none" stroke="#b45309" stroke-width="1.5" stroke-linecap="round"/>' +
      '</g>' +
    '</g>';
  }
  /**
   * MÀN 2 (G10-02): Thêm Phao thứ 4 + Bo góc & Căn hàng thẳng lối qua sông
   */
  function renderStage2(man, st) {
    var phaoList = (st.objects || []).filter(function (o) { return o.loai === 'pontoon'; });
    var countOk = phaoList.length >= 4;
    var rxOk = phaoList.every(function (p) { return (p.rx || 0) >= 12; });
    var alignOk = countOk && phaoList.every(function (p) { return Math.abs(p.y - 260) <= 12; });
    var xs = phaoList.map(function (p) { return p.x; }).sort(function (a, b) { return a - b; });
    var distOk = countOk &&
      Math.abs((xs[1] - xs[0]) - (xs[2] - xs[1])) <= 12 &&
      Math.abs((xs[2] - xs[1]) - (xs[3] - xs[2])) <= 12;
    var allOk = countOk && rxOk && alignOk && distOk;
    var row3Y = cellRect(2, 3).cy;
    var c4 = cellRect(4, 2);
    // 4 ô khuôn phao chuẩn dọc theo hàng H3
    var guideSlots = [2, 3, 4, 5].map(function (colIdx) {
      var gc = cellRect(colIdx, 3);
      return '<rect x="' + (gc.x + 5) + '" y="' + (gc.cy - 18) + '" width="60" height="36" rx="14" fill="none" stroke="' + (allOk ? '#22c55e' : '#38bdf8') + '" stroke-width="1.5" stroke-dasharray="4 4" stroke-opacity="0.65" pointer-events="none"/>';
    }).join('');
    var pontoonsSvg = phaoList.map(function (p, idx) {
      var colIdx = clamp(idx + 2, 2, 5);
      var targetCell = cellRect(colIdx, 3);
      var px = typeof p.x === 'number' ? (120 + (p.x - 140) * 0.95) : targetCell.cx;
      if (alignOk && distOk) px = targetCell.cx;
      var py = typeof p.y === 'number' ? p.y : targetCell.cy;
      if (Math.abs(py - 260) <= 12) py = row3Y;
      var okThis = Math.abs(p.y - 260) <= 12 && (p.rx || 0) >= 12;
      var rad = clamp(p.rx || 14, 2, 18);
      return '<g data-drag="move-pontoon" data-stage-action="distribute-h" data-idx="' + idx + '" transform="translate(' + (px - 30) + ',' + (py - 18) + ')" style="cursor:grab">' +
        '<rect x="-6" y="-6" width="72" height="48" fill="transparent"/>' +
        '<rect x="0" y="0" width="60" height="36" rx="' + rad + '" fill="' + (okThis ? '#10b981' : '#0284c7') + '" stroke="#ffffff" stroke-width="2.2"/>' +
        '<line x1="12" y1="18" x2="48" y2="18" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-opacity="0.7"/>' +
      '</g>';
    }).join('');
    var ghostSlot = !countOk ? (
      '<g data-stage-action="add-pontoon" style="cursor:pointer">' +
        veNhipGoiY(c4.cx, c4.cy, 26, '#fbbf24') +
        '<rect x="' + (c4.x + 5) + '" y="' + (c4.cy - 18) + '" width="60" height="36" rx="14" fill="#0ea5e9" fill-opacity="0.32" stroke="#fbbf24" stroke-width="2.5" stroke-dasharray="5 4"/>' +
        '<line x1="' + (c4.cx - 9) + '" y1="' + c4.cy + '" x2="' + (c4.cx + 9) + '" y2="' + c4.cy + '" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>' +
        '<line x1="' + c4.cx + '" y1="' + (c4.cy - 9) + '" x2="' + c4.cx + '" y2="' + (c4.cy + 9) + '" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>' +
      '</g>'
    ) : '';
    return '<g class="map-builder-stage-2">' +
      '<line x1="' + cellRect(2, 3).x + '" y1="' + row3Y + '" x2="' + (cellRect(5, 3).x + 70) + '" y2="' + row3Y + '" stroke="' + (allOk ? '#22c55e' : '#38bdf8') + '" stroke-width="2.2" stroke-dasharray="6 4" pointer-events="none"/>' +
      guideSlots +
      ghostSlot +
      pontoonsSvg +
    '</g>';
  }
  /**
   * MÀN 3 (G10-03): Uốn Đường Cong Bézier Vòng Qua Đá Ngầm
   */
  function renderStage3(man, st) {
    var p = (st.objects && st.objects[0]) || { x1: 130, y1: 265, cx: 340, cy: 265, x2: 470, y2: 330, smooth: false };
    var startC = cellRect(1, 3);
    var rockC = cellRect(3, 3);
    var boatC = cellRect(6, 3);
    var sx = startC.cx;
    var sy = startC.cy;
    var ctrlX = typeof p.cx === 'number' ? p.cx : rockC.cx;
    var ctrlY = typeof p.cy === 'number' ? p.cy : rockC.cy;
    var ex = (p.x2 >= 530) ? (boatC.cx - 18) : (typeof p.x2 === 'number' ? p.x2 : 470);
    var ey = (Math.abs(p.y2 - 265) <= 24) ? boatC.cy : (typeof p.y2 === 'number' ? p.y2 : 320);
    var smoothOk = !!p.smooth;
    var highOk = ctrlY <= 155;
    var endOk = p.x2 >= 530 && Math.abs(p.y2 - 265) <= 24;
    var allOk = smoothOk && highOk && endOk;
    var dPath = smoothOk
      ? ('M ' + sx + ' ' + sy + ' Q ' + ctrlX + ' ' + ctrlY + ' ' + ex + ' ' + ey)
      : ('M ' + sx + ' ' + sy + ' L ' + ctrlX + ' ' + ctrlY + ' L ' + ex + ' ' + ey);
    // Đường vòm mẫu nét đứt phía trên đá ngầm để người chơi biết kéo lên đâu
    var guideArc = 'M ' + sx + ' ' + sy + ' Q ' + rockC.cx + ' 115 ' + (boatC.cx - 18) + ' ' + boatC.cy;
    return '<g class="map-builder-stage-3">' +
      veKhungOMucTieu(3, 1, highOk, 'toggle-smooth') +
      veKhungOMucTieu(6, 3, endOk, 'snap-boat-end') +
      '<path d="' + guideArc + '" fill="none" stroke="#38bdf8" stroke-width="2" stroke-dasharray="5 5" stroke-opacity="0.55" pointer-events="none"/>' +
      // Hai thanh tiếp tuyến Bézier
      '<line x1="' + sx + '" y1="' + sy + '" x2="' + ctrlX + '" y2="' + ctrlY + '" stroke="#38bdf8" stroke-width="1.6" stroke-dasharray="4 3" pointer-events="none"/>' +
      '<line x1="' + ex + '" y1="' + ey + '" x2="' + ctrlX + '" y2="' + ctrlY + '" stroke="#38bdf8" stroke-width="1.6" stroke-dasharray="4 3" pointer-events="none"/>' +
      // Dòng chảy chính
      '<path data-stage-action="snap-boat-end" d="' + dPath + '" fill="none" stroke="' + (allOk ? '#22c55e' : '#f59e0b') + '" stroke-width="6" stroke-linecap="round" style="cursor:pointer"/>' +
      // Tay nắm đỉnh cong Bézier (kéo lên Hàng 1 là tự làm mượt + tự bắt vào mũi xuồng)
      (!highOk ? veNhipGoiY(ctrlX, ctrlY, 14, '#fbbf24') : '') +
      '<g data-drag="bezier-ctrl" data-stage-action="snap-boat-end" transform="translate(' + ctrlX + ',' + ctrlY + ')" style="cursor:grab">' +
        '<circle cx="0" cy="0" r="24" fill="transparent"/>' +
        '<circle cx="0" cy="0" r="10" fill="' + (highOk ? '#22c55e' : '#fbbf24') + '" stroke="#ffffff" stroke-width="2.5"/>' +
      '</g>' +
      // Điểm neo cuối tại mũi xuồng
      '<g data-drag="bezier-end" data-stage-action="snap-boat-end" transform="translate(' + ex + ',' + ey + ')" style="cursor:grab">' +
        '<circle cx="0" cy="0" r="22" fill="transparent"/>' +
        '<rect x="-8" y="-8" width="16" height="16" rx="4" fill="' + (endOk ? '#22c55e' : '#ec4899') + '" stroke="#ffffff" stroke-width="2.2"/>' +
      '</g>' +
    '</g>';
  }
  /**
   * MÀN 4 (G10-04): Phép Toán Hình Học Boolean (Hợp nhất cầu đá & Trừ khoét vách đá)
   */
  function renderStage4(man, st) {
    var cauDoi = (st.objects || []).find(function (o) { return o.id === 'cau-doi'; }) || { booleanOp: 'none' };
    var vach = (st.objects || []).find(function (o) { return o.id === 'vach-da'; }) || { booleanOp: 'white-overlay' };
    var unionOk = cauDoi.booleanOp === 'union';
    var diffOk = vach.booleanOp === 'difference';
    var c2 = cellRect(2, 3);
    var c3 = cellRect(3, 3);
    var c5 = cellRect(5, 3);
    var piece2X = typeof cauDoi.piece2X === 'number' ? cauDoi.piece2X : (unionOk ? (c2.x + 56) : (c3.x + 12));
    var piece2Y = typeof cauDoi.piece2Y === 'number' ? cauDoi.piece2Y : (c3.cy - 14);
    var cutterX = typeof vach.cutterX === 'number' ? vach.cutterX : c5.cx;
    var cutterY = typeof vach.cutterY === 'number' ? vach.cutterY : c5.cy;
    return '<g class="map-builder-stage-4">' +
      veKhungOMucTieu(2, 3, unionOk, 'boolean-union') +
      veKhungOMucTieu(3, 3, unionOk, 'boolean-union') +
      veKhungOMucTieu(5, 3, diffOk, 'boolean-diff') +
      (unionOk ? (
        '<g data-stage-action="boolean-union">' +
          '<rect x="' + (c2.x + 6) + '" y="' + (c2.cy - 14) + '" width="128" height="28" rx="7" fill="#10b981" stroke="#ffffff" stroke-width="2.2"/>' +
          '<line x1="' + (c2.x + 20) + '" y1="' + c2.cy + '" x2="' + (c2.x + 120) + '" y2="' + c2.cy + '" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/>' +
        '</g>'
      ) : (
        '<g>' +
          '<rect data-stage-action="boolean-union" x="' + (c2.x + 4) + '" y="' + (c2.cy - 14) + '" width="58" height="28" rx="6" fill="#0284c7" stroke="#bae6fd" stroke-width="2" style="cursor:pointer"/>' +
          veNhipGoiY(piece2X + 28, piece2Y + 14, 18, '#fbbf24') +
          '<g data-drag="move-bridge" data-stage-action="boolean-union" transform="translate(' + piece2X + ',' + piece2Y + ')" style="cursor:grab">' +
            '<rect x="-8" y="-8" width="74" height="44" fill="transparent"/>' +
            '<rect x="0" y="0" width="58" height="28" rx="6" fill="#0ea5e9" stroke="#fde047" stroke-width="2.5"/>' +
          '</g>' +
        '</g>'
      )) +
      (diffOk ? (
        '<g data-stage-action="boolean-diff" transform="translate(' + c5.cx + ',' + c5.cy + ')">' +
          '<circle cx="0" cy="0" r="23" fill="#090d16" stroke="#22c55e" stroke-width="2.5" stroke-dasharray="5 3"/>' +
        '</g>'
      ) : (
        '<g data-drag="move-cutter" data-stage-action="boolean-diff" transform="translate(' + cutterX + ',' + cutterY + ')" style="cursor:pointer">' +
          veNhipGoiY(0, 0, 22, '#f43f5e') +
          '<circle cx="0" cy="0" r="26" fill="transparent"/>' +
          '<circle cx="0" cy="0" r="21" fill="#ffffff" fill-opacity="0.92" stroke="#f43f5e" stroke-width="2.5" stroke-dasharray="4 3"/>' +
          '<line x1="-8" y1="0" x2="8" y2="0" stroke="#f43f5e" stroke-width="2.5" stroke-linecap="round"/>' +
        '</g>'
      )) +
    '</g>';
  }
  /**
   * MÀN 5 (G10-05): Chuẩn Hóa Vector SVG (#42) & Tách Nền Trong Suốt PNG (Tán cây)
   */
  function renderStage5(man, st) {
    var objs = st.objects || [];
    var nhan = objs.find(function (o) { return o.id === 'nhan-container' || o.id === 'nhan-42'; }) || { format: 'bitmap-low' };
    var cay = objs.find(function (o) { return o.id === 'tan-cay' || o.id === 'cay-xanh'; }) || { imageFormat: 'jpg' };
    var vecOk = nhan.format === 'vector-svg';
    var pngOk = cay.imageFormat === 'png';
    var c3 = cellRect(3, 3);
    var c5 = cellRect(5, 2);
    return '<g class="map-builder-stage-5">' +
      veKhungOMucTieu(3, 3, vecOk, 'set-vector-svg') +
      veKhungOMucTieu(5, 2, pngOk, 'set-tree-png') +
      // Nhãn Container #42: dạng ô vuông vỡ hạt vs dạng nét Vector sắc nét
      '<g data-drag="move-badge" data-stage-action="set-vector-svg" transform="translate(' + c3.cx + ',' + c3.cy + ')" style="cursor:pointer">' +
        (!vecOk ? veNhipGoiY(0, 0, 26, '#fbbf24') : '') +
        '<rect x="-28" y="-22" width="56" height="44" rx="8" fill="#0f172a" fill-opacity="0.92" stroke="' + (vecOk ? '#22c55e' : '#fbbf24') + '" stroke-width="2.2"/>' +
        (vecOk ? (
          // Vector #42 vẽ bằng đường path hình học sắc nét
          '<path d="M-16 -6 L-4 -6 M-16 4 L-4 4 M-13 -11 L-13 9 M-7 -11 L-7 9 M2 -9 L2 3 L12 3 M9 -9 L9 9 M16 -9 C22 -9 22 -1 16 3 L15 9 L23 9" fill="none" stroke="#4ade80" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>'
        ) : (
          '<g opacity="0.85">' +
            '<rect x="-18" y="-12" width="8" height="8" fill="#fbbf24"/>' +
            '<rect x="-8" y="-4" width="8" height="8" fill="#fbbf24"/>' +
            '<rect x="2" y="-12" width="8" height="8" fill="#fbbf24"/>' +
            '<rect x="10" y="0" width="8" height="8" fill="#fbbf24"/>' +
            '<rect x="-14" y="4" width="8" height="8" fill="#fbbf24"/>' +
          '</g>'
        )) +
      '</g>' +
      // Tán cây ở ô (5,2): khung nền trắng .JPG che khuất vs tán cây .PNG trong suốt
      '<g data-drag="move-tree" data-stage-action="set-tree-png" transform="translate(' + c5.cx + ',' + c5.cy + ')" style="cursor:pointer">' +
        (!pngOk ? (
          '<g>' +
            veNhipGoiY(0, 0, 28, '#ef4444') +
            '<rect x="-30" y="-30" width="60" height="60" rx="6" fill="#ffffff" stroke="#ef4444" stroke-width="2.2"/>' +
          '</g>'
        ) : '') +
        '<circle cx="0" cy="-6" r="18" fill="#16a34a" fill-opacity="' + (pngOk ? '0.82' : '0.96') + '" stroke="#dcfce7" stroke-width="2"/>' +
        '<circle cx="-10" cy="4" r="13" fill="#15803d" fill-opacity="' + (pngOk ? '0.82' : '0.96') + '"/>' +
        '<circle cx="10" cy="4" r="13" fill="#22c55e" fill-opacity="' + (pngOk ? '0.82' : '0.96') + '"/>' +
      '</g>' +
    '</g>';
  }
  /**
   * MÀN 6 (G11-01): Pha Màu Ánh Sáng RGB & Tăng Độ Sáng Đèn Hiệu
   */
  function renderStage6(man, st) {
    var objs = st.objects || [];
    var den = objs.find(function (o) { return o.id === 'den-vang'; }) || objs[0] || { r: 255, g: 40, b: 0, brightness: 55, contrast: 65 };
    var rgbColor = 'rgb(' + den.r + ',' + den.g + ',' + den.b + ')';
    var yellowOk = den.r >= 230 && den.g >= 215 && den.b <= 45;
    var bcOk = den.brightness >= 90 && den.contrast >= 95;
    var allOk = yellowOk && bcOk;
    var c3 = cellRect(3, 2);
    var c4 = cellRect(4, 2);
    var padX = (c3.cx + c4.cx) / 2;
    var padY = c3.cy;
    var gKnobX = (padX - 54) + (clamp(den.g, 0, 255) / 255) * 108;
    return '<g class="map-builder-stage-6">' +
      veKhungOMucTieu(3, 2, allOk, 'preset-yellow-rgb') +
      veKhungOMucTieu(4, 2, allOk, 'boost-exposure') +
      // Vầng sáng đèn hiệu chiếu xuống luống hoa
      '<ellipse cx="' + padX + '" cy="' + (padY + 26) + '" rx="95" ry="54" fill="' + rgbColor + '" fill-opacity="' + clamp(den.brightness / 200, 0.2, 0.55) + '" pointer-events="none"/>' +
      // Chóa đèn hiệu RGB (bấm trực tiếp để pha vàng + tăng sáng)
      '<g data-drag="move-rgb-pad" data-stage-action="preset-yellow-rgb" transform="translate(' + padX + ',' + (padY - 18) + ')" style="cursor:pointer">' +
        (!allOk ? veNhipGoiY(0, 0, 24, '#fde047') : '') +
        '<circle cx="0" cy="0" r="22" fill="' + rgbColor + '" stroke="#ffffff" stroke-width="2.5"/>' +
        '<circle cx="0" cy="0" r="9" fill="#ffffff" fill-opacity="0.45"/>' +
      '</g>' +
      // Thanh kéo kênh Green trực quan ngay dưới đèn
      '<g data-drag="drag-rgb-g" data-stage-action="preset-yellow-rgb" style="cursor:ew-resize">' +
        '<rect x="' + (padX - 64) + '" y="' + (padY + 12) + '" width="128" height="22" rx="11" fill="#0f172a" fill-opacity="0.92" stroke="' + (allOk ? '#22c55e' : '#38bdf8') + '" stroke-width="1.8"/>' +
        '<line x1="' + (padX - 54) + '" y1="' + (padY + 23) + '" x2="' + (padX + 54) + '" y2="' + (padY + 23) + '" stroke="#334155" stroke-width="6" stroke-linecap="round"/>' +
        '<line x1="' + (padX - 54) + '" y1="' + (padY + 23) + '" x2="' + gKnobX + '" y2="' + (padY + 23) + '" stroke="#22c55e" stroke-width="6" stroke-linecap="round"/>' +
        '<circle cx="' + gKnobX + '" cy="' + (padY + 23) + '" r="8.5" fill="#fde047" stroke="#ffffff" stroke-width="2"/>' +
      '</g>' +
    '</g>';
  }
  /**
   * MÀN 7 (G11-02): Kéo Lớp Thảm Cát Lên Trên Bùn & Quét Cọ Mặt Nạ Xóa Sương Mù
   */
  function renderStage7(man, st) {
    var layers = st.layers || [];
    var suong = layers.find(function (l) { return l.id === 'layer-suong-mu'; });
    var idxCat = layers.findIndex(function (l) { return l.id === 'layer-tham-cat'; });
    var idxBun = layers.findIndex(function (l) { return l.id === 'layer-bun-tron'; });
    var idxRobot = layers.findIndex(function (l) { return l.id === 'layer-robot'; });
    var maskOk = !!(suong && suong.visible && suong.maskCleared);
    var orderOk = idxCat !== -1 && idxBun !== -1 && idxCat < idxBun && idxRobot < idxCat;
    var c2 = cellRect(2, 3);
    var c5 = cellRect(5, 3);
    var sandX = typeof st.sandX === 'number' ? st.sandX : (c2.x + 6);
    var sandY = orderOk ? (c2.y + 10) : (typeof st.sandY === 'number' ? st.sandY : (c2.y - 42));
    var brushX = typeof st.brushX === 'number' ? st.brushX : c5.cx;
    var brushY = typeof st.brushY === 'number' ? st.brushY : c5.cy;
    return '<g class="map-builder-stage-7">' +
      veKhungOMucTieu(2, 3, orderOk, 'swap-sand-above-mud') +
      veKhungOMucTieu(5, 3, maskOk, 'paint-mask-black') +
      // Tấm thảm cát vàng: kéo xuống hoặc bấm để đè lên vũng bùn
      '<g data-drag="move-sand-layer" data-stage-action="swap-sand-above-mud" transform="translate(' + sandX + ',' + sandY + ')" style="cursor:grab">' +
        (!orderOk ? veNhipGoiY(96, 25, 22, '#fde047') : '') +
        '<rect x="0" y="0" width="196" height="50" rx="10" fill="#eab308" fill-opacity="0.92" stroke="' + (orderOk ? '#22c55e' : '#ffffff') + '" stroke-width="2.5"/>' +
        '<line x1="20" y1="18" x2="176" y2="18" stroke="#fef08a" stroke-width="2" stroke-dasharray="6 4"/>' +
        '<line x1="20" y1="32" x2="176" y2="32" stroke="#fef08a" stroke-width="2" stroke-dasharray="6 4"/>' +
      '</g>' +
      // Đám sương mù tại ô (5,3) và vòng Cọ Mặt Nạ
      (suong && suong.visible ? (
        maskOk ? (
          '<g data-stage-action="paint-mask-black" transform="translate(' + c5.cx + ',' + c5.cy + ')">' +
            '<circle cx="0" cy="0" r="28" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-dasharray="5 3"/>' +
          '</g>'
        ) : (
          '<g data-drag="mask-brush" data-stage-action="paint-mask-black" style="cursor:crosshair">' +
            veNhipGoiY(c5.cx, c5.cy, 28, '#38bdf8') +
            '<rect x="' + (c5.x - 6) + '" y="' + (c5.y - 6) + '" width="82" height="82" rx="16" fill="#cbd5e1" fill-opacity="0.92" stroke="#94a3b8" stroke-width="2"/>' +
            '<circle cx="' + brushX + '" cy="' + brushY + '" r="18" fill="#0f172a" fill-opacity="0.85" stroke="#38bdf8" stroke-width="2.5"/>' +
          '</g>'
        )
      ) : '') +
    '</g>';
  }
  /**
   * MÀN 8 (G11-03): Kéo Khớp Nhịp Bè (Nhịp 4) & Nhịp Chuông (Nhịp 7) Trên Dòng Thời Gian
   */
  function renderStage8(man, st) {
    var tl = st.timeline || { beCuuHoTick: 2, nhacSongCaTick: 9, coPhuDeNguon: false };
    var beOk = Number(tl.beCuuHoTick) === 4;
    var nhacOk = Number(tl.nhacSongCaTick) === 7;
    var trackBaseX = 175;
    var tickStep = 50;
    var beX = typeof tl._bePx === 'number' ? tl._bePx : (trackBaseX + (tl.beCuuHoTick - 1) * tickStep);
    var nhacX = typeof tl._nhacPx === 'number' ? tl._nhacPx : (trackBaseX + (tl.nhacSongCaTick - 1) * tickStep);
    var ticksSvg = '';
    for (var t = 1; t <= 10; t++) {
      var tx = trackBaseX + (t - 1) * tickStep;
      var isTarget = (t === 4 || t === 7);
      ticksSvg +=
        '<line x1="' + tx + '" y1="292" x2="' + tx + '" y2="358" stroke="' + (isTarget ? '#38bdf8' : '#334155') + '" stroke-width="' + (isTarget ? '2.2' : '1.2') + '"/>' +
        '<circle cx="' + tx + '" cy="292" r="' + (isTarget ? '5' : '2.5') + '" fill="' + (isTarget ? '#38bdf8' : '#475569') + '"/>';
    }
    var target4X = trackBaseX + 3 * tickStep;
    var target7X = trackBaseX + 6 * tickStep;
    return '<g class="map-builder-stage-8">' +
      veKhungOMucTieu(3, 3, beOk, 'sync-raft-tick-4') +
      veKhungOMucTieu(5, 1, nhacOk, 'sync-duet-tick-7') +
      // Thanh Timeline gọn dưới chân bản đồ (thuần hình học, không chữ nhỏ gây rối)
      '<rect x="136" y="280" width="528" height="90" rx="12" fill="#0f172a" fill-opacity="0.92" stroke="#334155" stroke-width="1.8"/>' +
      ticksSvg +
      // Ô đích Nhịp 4 (Rãnh 1) & Nhịp 7 (Rãnh 2)
      '<rect data-stage-action="sync-raft-tick-4" x="' + (target4X - 28) + '" y="298" width="56" height="24" rx="8" fill="none" stroke="#22c55e" stroke-width="2" stroke-dasharray="4 3" style="cursor:pointer"/>' +
      '<rect data-stage-action="sync-duet-tick-7" x="' + (target7X - 28) + '" y="334" width="56" height="24" rx="8" fill="none" stroke="#38bdf8" stroke-width="2" stroke-dasharray="4 3" style="cursor:pointer"/>' +
      // Con trượt Bè Cứu Hộ (Kéo vào vòng xanh lá Nhịp 4)
      '<g data-drag="tl-be" data-stage-action="sync-raft-tick-4" transform="translate(' + (beX - 26) + ', 300)" style="cursor:ew-resize">' +
        '<rect x="-8" y="-6" width="68" height="32" fill="transparent"/>' +
        '<rect x="0" y="0" width="52" height="20" rx="7" fill="' + (beOk ? '#16a34a' : '#f59e0b') + '" stroke="#ffffff" stroke-width="2"/>' +
        '<circle cx="26" cy="10" r="4" fill="#ffffff"/>' +
      '</g>' +
      // Con trượt Chuông Nhạc (Kéo vào vòng xanh dương Nhịp 7)
      '<g data-drag="tl-nhac" data-stage-action="sync-duet-tick-7" transform="translate(' + (nhacX - 26) + ', 336)" style="cursor:ew-resize">' +
        '<rect x="-8" y="-6" width="68" height="32" fill="transparent"/>' +
        '<rect x="0" y="0" width="52" height="20" rx="7" fill="' + (nhacOk ? '#0284c7' : '#e11d48') + '" stroke="#ffffff" stroke-width="2"/>' +
        '<circle cx="26" cy="10" r="4" fill="#ffffff"/>' +
      '</g>' +
    '</g>';
  }
  /**
   * MÀN 9 (G12-01): Bố Cục Flexbox Tự Xuống Dòng & Nút Mở Cổng Tương Phản Cao
   */
  function renderStage9(man, st) {
    var cb = st.cssBox || { flexWrap: 'nowrap', padding: 2, gap: 0, buttonTheme: 'low-contrast' };
    var wrapOk = cb.flexWrap === 'wrap';
    var boxOk = cb.padding >= 12 && cb.gap >= 10;
    var contrastOk = cb.buttonTheme === 'high-contrast';
    var c2 = cellRect(2, 1);
    var panelX = c2.x + 4;
    var panelY = c2.y + 6;
    var pad = clamp(cb.padding, 2, 16);
    var gap = clamp(cb.gap, 0, 16);
    var cardsSvg = [0, 1, 2, 3].map(function (i) {
      var cw = wrapOk ? 52 : 56;
      var ch = 22;
      var col = wrapOk ? (i % 2) : i;
      var row = wrapOk ? Math.floor(i / 2) : 0;
      var cx = panelX + pad + col * (cw + gap);
      var cy = panelY + pad + row * (ch + gap);
      return '<rect x="' + cx + '" y="' + cy + '" width="' + cw + '" height="' + ch + '" rx="5" fill="' + (wrapOk && boxOk ? '#10b981' : '#f43f5e') + '" stroke="#ffffff" stroke-width="1.5"/>';
    }).join('');
    var panelW = wrapOk ? 142 : 246;
    var panelH = wrapOk ? 84 : 42;
    var btnBg = contrastOk ? '#facc15' : '#334155';
    return '<g class="map-builder-stage-9">' +
      veKhungOMucTieu(4, 1, wrapOk && boxOk, 'toggle-flex-wrap') +
      veKhungOMucTieu(5, 2, contrastOk, 'toggle-btn-contrast') +
      // Khung thẻ Flexbox (khi nowrap bị tràn đè lên nút N tại ô 4,1; khi wrap thu gọn thành lưới 2x2)
      '<g data-drag="drag-css-gap" data-stage-action="toggle-flex-wrap" style="cursor:pointer">' +
        (!wrapOk ? veNhipGoiY(panelX + panelW - 12, panelY + panelH / 2, 18, '#fbbf24') : '') +
        '<rect x="' + panelX + '" y="' + panelY + '" width="' + panelW + '" height="' + panelH + '" rx="10" fill="#0f172a" fill-opacity="0.9" stroke="' + (wrapOk && boxOk ? '#22c55e' : '#38bdf8') + '" stroke-width="2.2"/>' +
        cardsSvg +
      '</g>' +
      // Công tắc tương phản cao cạnh cổng
      '<g data-stage-action="toggle-btn-contrast" transform="translate(' + (cellRect(5, 1).x + 12) + ',' + (cellRect(5, 1).y + 18) + ')" style="cursor:pointer">' +
        (!contrastOk ? veNhipGoiY(23, 16, 18, '#fde047') : '') +
        '<rect x="0" y="0" width="46" height="32" rx="8" fill="' + btnBg + '" stroke="#ffffff" stroke-width="2.2"/>' +
        '<circle cx="23" cy="16" r="7" fill="' + (contrastOk ? '#0f172a' : '#64748b') + '"/>' +
      '</g>' +
    '</g>';
  }
  /**
   * Kết xuất lớp SVG Gizmo tương tác trên bản đồ Robot
   */
  function renderStageSvg(man, state, anim) {
    var st = state || {};
    var body = '';
    if (man.id === 'G10-01') body = renderStage1(man, st);
    else if (man.id === 'G10-02') body = renderStage2(man, st);
    else if (man.id === 'G10-03') body = renderStage3(man, st);
    else if (man.id === 'G10-04') body = renderStage4(man, st);
    else if (man.id === 'G10-05') body = renderStage5(man, st);
    else if (man.id === 'G11-01') body = renderStage6(man, st);
    else if (man.id === 'G11-02') body = renderStage7(man, st);
    else if (man.id === 'G11-03') body = renderStage8(man, st);
    else if (man.id === 'G12-01') body = renderStage9(man, st);
    var cutsceneOverlay = '';
    if (root.DienHoatSanKhau && typeof root.DienHoatSanKhau.renderCutsceneLayer === 'function') {
      cutsceneOverlay = root.DienHoatSanKhau.renderCutsceneLayer(man, st, anim);
    }
    return '<svg id="stage-svg-canvas" viewBox="0 0 800 420" role="img" aria-label="Sân khấu bản đồ ' + man.ten + '">' +
      VeSanKhau.veNenSanKhau(man.so || man.id, man.ten) +
      body +
      cutsceneOverlay +
    '</svg>';
  }
  /**
   * Gắn sự kiện kéo-thả & bấm chọn mượt mà (Magnetic Auto-Snap + 1-Click Assist)
   */
  function bindStageInteractions(containerEl, getContext) {
    if (!containerEl) return;
    if (typeof activeCleanup === 'function') {
      activeCleanup();
      activeCleanup = null;
    }
    var dragMode = null;
    var dragIdx = -1;
    var dragMoved = false;
    var downAction = null;
    var grabOffset = { dx: 0, dy: 0 };
    var rafPending = false;
    var latestPt = null;
    function getSvgPoint(ev) {
      var svg = containerEl.querySelector('svg');
      var rect = (svg || containerEl).getBoundingClientRect();
      if (!rect.width || !rect.height) return { x: 400, y: 210 };
      return {
        x: ((ev.clientX - rect.left) / rect.width) * 800,
        y: ((ev.clientY - rect.top) / rect.height) * 420
      };
    }
    function updateCursorReadout(pt) {
      var el = document.getElementById('studio-cursor-readout');
      if (el && pt) {
        var cell = root.VeSanKhau && root.VeSanKhau.pointToCell ? root.VeSanKhau.pointToCell(pt.x, pt.y) : null;
        var cellTxt = (cell && cell.inGrid) ? (' · Ô (' + cell.col + ', ' + cell.row + ')') : '';
        el.textContent = 'X ' + Math.round(pt.x) + ', Y ' + Math.round(pt.y) + cellTxt;
      }
    }
    function runStageAction(actName, ctx) {
      if (!actName || !ctx || !ctx.state) return;
      var st = ctx.state;
      // Ở Màn 9, khi bấm khung Flexbox thì đồng thời chuẩn hóa cả padding/gap để người chơi không bị kẹt
      if (actName === 'toggle-flex-wrap' && st.cssBox) {
        st.cssBox.flexWrap = 'wrap';
        st.cssBox.padding = 14;
        st.cssBox.gap = 14;
        ctx.onUpdate('Đã bật tự xuống dòng (flex-wrap: wrap) và căn đều khoảng đệm (Padding/Gap = 14px)!', false);
        return;
      }
      // Ở Màn 6, khi bấm đèn hiệu thì đồng thời pha màu Vàng chuẩn + cân bằng Độ sáng
      if (actName === 'preset-yellow-rgb') {
        var den6 = (st.objects || []).find(function (o) { return o.id === 'den-vang'; }) || (st.objects || [])[0];
        if (den6) {
          den6.r = 255;
          den6.g = 255;
          den6.b = 0;
          den6.brightness = 110;
          den6.contrast = 115;
          ctx.onUpdate('Đã pha đèn hiệu Vàng chuẩn RGB(255, 255, 0) và tăng Độ sáng 110%!', false);
          return;
        }
      }
      // Ở Màn 8, khi đồng bộ nhịp bè hoặc nhịp nhạc thì bật luôn phụ đề
      if ((actName === 'sync-raft-tick-4' || actName === 'sync-duet-tick-7') && st.timeline) {
        st.timeline.coPhuDeNguon = true;
      }
      if (root.DienHoatSanKhau && typeof root.DienHoatSanKhau.apThaoTacTrenSan === 'function') {
        var res = root.DienHoatSanKhau.apThaoTacTrenSan(actName, ctx.man, st);
        if (res && res.changed) {
          ctx.onUpdate(res.message, false);
        }
      }
    }
    function onPointerDown(ev) {
      if (ev.button !== undefined && ev.button !== 0) return;
      var ctx = getContext();
      if (!ctx || !ctx.state) return;
      var st = ctx.state;
      var pt = getSvgPoint(ev);
      updateCursorReadout(pt);
      var selectEl = ev.target.closest('[data-select-obj]');
      if (selectEl) {
        st.selectedId = selectEl.getAttribute('data-select-obj');
      }
      var actionEl = ev.target.closest('[data-stage-action]');
      downAction = actionEl ? actionEl.getAttribute('data-stage-action') : null;
      dragMoved = false;
      var dragEl = ev.target.closest('[data-drag]');
      if (dragEl) {
        dragMode = dragEl.getAttribute('data-drag');
        dragIdx = Number(dragEl.getAttribute('data-idx') || -1);
        grabOffset.dx = 0;
        grabOffset.dy = 0;
        ev.preventDefault();
        return;
      }
      if (downAction) {
        runStageAction(downAction, ctx);
        downAction = null;
      }
    }
    function applyDragAtPoint(pt) {
      if (!dragMode) return;
      var ctx = getContext();
      if (!ctx || !ctx.state) return;
      var st = ctx.state;
      dragMoved = true;
      if (dragMode === 'resize-da-rx' || dragMode === 'resize-da-ry' || dragMode === 'resize-da-corner' || dragMode === 'resize-da') {
        var da = (st.objects || []).find(function (o) { return o.id === 'da-1'; }) || st.objects[0];
        if (!da) return;
        st.selectedId = 'da-1';
        st.activeTool = 'scale';
        var rockCell = cellRect(2, 1);
        var cx = rockCell.cx;
        var cy = rockCell.cy;
        var rawRx = clamp(Math.round(Math.abs(pt.x - cx)), 16, 56);
        var rawRy = clamp(Math.round(Math.abs(pt.y - cy)), 16, 56);
        if (Math.abs(rawRx - 30) <= 3) rawRx = 30;
        if (Math.abs(rawRy - 30) <= 3) rawRy = 30;

        if (dragMode === 'resize-da-rx') {
          da.rx = rawRx;
          if (da.lockAspect) da.ry = rawRx;
          ctx.onUpdate(
            da.lockAspect
              ? ('Khóa tỷ lệ BẬT: Đang co giãn đều Đá mỏ #1 Rx = Ry = ' + da.rx + 'px (Chuẩn: 30px)')
              : ('Khóa tỷ lệ TẮT: Đang kéo cạnh ngang Rx = ' + da.rx + 'px, Ry = ' + da.ry + 'px'),
            true
          );
        } else if (dragMode === 'resize-da-ry') {
          da.ry = rawRy;
          if (da.lockAspect) da.rx = rawRy;
          ctx.onUpdate(
            da.lockAspect
              ? ('Khóa tỷ lệ BẬT: Đang co giãn đều Đá mỏ #1 Rx = Ry = ' + da.ry + 'px (Chuẩn: 30px)')
              : ('Khóa tỷ lệ TẮT: Đang kéo cạnh dọc Ry = ' + da.ry + 'px, Rx = ' + da.rx + 'px'),
            true
          );
        } else {
          if (da.lockAspect) {
            var rad = clamp(Math.round((Math.abs(pt.x - cx) + Math.abs(pt.y - cy)) / 2), 16, 56);
            if (Math.abs(rad - 30) <= 3) rad = 30;
            da.rx = rad;
            da.ry = rad;
            ctx.onUpdate('Khóa tỷ lệ BẬT: Đang thu phóng Đá mỏ #1 tròn đều Rx = Ry = ' + rad + 'px (Chuẩn: 30px)', true);
          } else {
            da.rx = rawRx;
            da.ry = rawRy;
            ctx.onUpdate('Đang kéo góc tự do: Rx = ' + da.rx + 'px, Ry = ' + da.ry + 'px (Hãy bật Ổ khóa W:H để khóa tỷ lệ 1:1!)', true);
          }
        }
      } else if (dragMode === 'move-da-2') {
        var da2 = (st.objects || []).find(function (o) { return o.id === 'da-2'; });
        if (!da2) return;
        st.selectedId = 'da-2';
        st.activeTool = 'move';
        var targetC41 = cellRect(4, 1);
        var nx = clamp(Math.round(pt.x), 380, 490);
        var ny = clamp(Math.round(pt.y), 95, 235);
        if (Math.hypot(nx - targetC41.cx, ny - targetC41.cy) <= 18) {
          nx = targetC41.cx;
          ny = targetC41.cy;
        }
        da2.x = nx;
        da2.y = ny;
        ctx.onUpdate(
          (nx === targetC41.cx && ny === targetC41.cy)
            ? 'Đã đặt Đá mỏ #2 khớp vào Ô(4,1)! Robot R1 đã sẵn sàng gọi lob() hất đá đè nút M(5,1).'
            : ('Đang di chuyển Đá mỏ #2 tới (' + nx + ', ' + ny + ') — Hãy kéo lên vòng đích Ô(4,1) (435, 129)'),
          true
        );
      } else if (dragMode === 'rotate-cua') {
        var cua = (st.objects || []).find(function (o) { return o.id === 'cua-ham'; });
        if (!cua) return;
        st.selectedId = 'cua-ham';
        st.activeTool = 'rotate';
        var c23 = cellRect(2, 3);
        var rawDeg = Math.round(Math.atan2(pt.y - c23.cy, pt.x - c23.cx) * (180 / Math.PI) + 90);
        while (rawDeg > 180) rawDeg -= 360;
        while (rawDeg < -180) rawDeg += 360;
        var deg = clamp(rawDeg, -90, 90);
        if (Math.abs(deg) <= 8) deg = 0;
        cua.rotate = deg;
        ctx.onUpdate(
          deg === 0
            ? 'Đã xoay Cửa hầm C tại Ô(2,3) về đúng góc chuẩn 0 độ!'
            : ('Đang xoay Cửa hầm C tại Ô(2,3): Góc = ' + deg + ' độ (Mục tiêu: 0 độ)'),
          true
        );
      } else if (dragMode === 'move-pontoon') {
        var phaoList = (st.objects || []).filter(function (o) { return o.loai === 'pontoon'; });
        var phao = phaoList[dragIdx];
        if (!phao) return;
        phao.y = clamp(Math.round(pt.y), 140, 330);
        phao.rx = 16;
        if (Math.abs(phao.y - 260) <= 28) {
          // Tự động căn thẳng hàng khi kéo phao lại gần đường dẫn sông
          if (phaoList.length < 4) {
            st.objects.push({ id: 'phao-4', ten: 'Phao nổi 4', loai: 'pontoon', x: 438, y: 260, w: 72, h: 32, rx: 16 });
            phaoList = st.objects.filter(function (o) { return o.loai === 'pontoon'; });
          }
          phaoList.forEach(function (p, i) {
            p.x = 180 + i * 86;
            p.y = 260;
            p.rx = 16;
          });
          st.daCanGiua = true;
          st.daPhanBoDeu = true;
        }
        ctx.onUpdate('Đã căn chỉnh cầu phao bo góc thẳng hàng qua sông', true);
      } else if (dragMode === 'bezier-ctrl' || dragMode === 'bezier-end') {
        var dc = (st.objects || [])[0];
        if (!dc) return;
        dc.smooth = true;
        if (dragMode === 'bezier-ctrl') {
          dc.cx = clamp(Math.round(pt.x), 220, 480);
          dc.cy = clamp(Math.round(pt.y), 75, 290);
          if (dc.cy <= 165) {
            dc.cy = Math.min(dc.cy, 130);
            dc.x2 = 545;
            dc.y2 = 265;
          }
        } else {
          dc.x2 = clamp(Math.round(pt.x), 360, 620);
          dc.y2 = clamp(Math.round(pt.y), 150, 330);
          if (dc.x2 >= 510) {
            dc.x2 = 545;
            dc.y2 = 265;
            dc.cy = Math.min(dc.cy, 130);
          }
        }
        ctx.onUpdate('Đã uốn đường cong Bézier vòng qua bãi đá ngầm tới mũi Xuồng', true);
      } else if (dragMode === 'move-bridge') {
        var cau4 = (st.objects || []).find(function (o) { return o.id === 'cau-doi'; });
        if (cau4) {
          cau4.booleanOp = 'union';
          ctx.onUpdate('Đã hợp nhất (Boolean Union) 2 nhịp cầu đá!', true);
        }
      } else if (dragMode === 'move-cutter') {
        var vach4 = (st.objects || []).find(function (o) { return o.id === 'vach-da'; });
        if (vach4) {
          vach4.booleanOp = 'difference';
          ctx.onUpdate('Đã cắt trừ (Boolean Difference) mở thông vách đá!', true);
        }
      } else if (dragMode === 'move-badge') {
        var nhan5 = (st.objects || []).find(function (o) { return o.id === 'nhan-container' || o.id === 'nhan-42'; });
        if (nhan5) {
          nhan5.format = 'vector-svg';
          ctx.onUpdate('Đã chuẩn hóa nhãn Container #42 sang Vector SVG sắc nét!', true);
        }
      } else if (dragMode === 'move-tree') {
        var cay5 = (st.objects || []).find(function (o) { return o.id === 'tan-cay' || o.id === 'cay-xanh'; });
        if (cay5) {
          cay5.imageFormat = 'png';
          ctx.onUpdate('Đã tách nền trắng sang định dạng .PNG trong suốt!', true);
        }
      } else if (dragMode === 'drag-rgb-g' || dragMode === 'move-rgb-pad') {
        var den = (st.objects || []).find(function (o) { return o.id === 'den-vang'; }) || st.objects[0];
        if (!den) return;
        var padX = (cellRect(3, 2).cx + cellRect(4, 2).cx) / 2;
        var ratio = clamp((pt.x - (padX - 54)) / 108, 0, 1);
        var gVal = Math.round(ratio * 255);
        if (gVal >= 190 || dragMode === 'move-rgb-pad') gVal = 255;
        den.r = 255;
        den.g = gVal;
        den.b = 0;
        den.brightness = 110;
        den.contrast = 115;
        ctx.onUpdate('Đã pha đèn hiệu Vàng RGB(255, ' + gVal + ', 0) & tăng Độ sáng!', true);
      } else if (dragMode === 'move-sand-layer') {
        if (Array.isArray(st.layers)) {
          var iCat = st.layers.findIndex(function (l) { return l.id === 'layer-tham-cat'; });
          var iBun = st.layers.findIndex(function (l) { return l.id === 'layer-bun-tron'; });
          if (iCat > iBun && iBun !== -1) {
            var tmp = st.layers[iBun];
            st.layers[iBun] = st.layers[iCat];
            st.layers[iCat] = tmp;
          }
          ctx.onUpdate('Đã kéo Lớp Thảm Cát lên trên Lớp Bùn Trơn!', true);
        }
      } else if (dragMode === 'mask-brush') {
        var suong = (st.layers || []).find(function (l) { return l.id === 'layer-suong-mu'; });
        if (suong) {
          suong.visible = true;
          suong.maskCleared = true;
          st.brushX = clamp(Math.round(pt.x), 420, 560);
          st.brushY = clamp(Math.round(pt.y), 210, 320);
          ctx.onUpdate('Đã quét Cọ Đen lên Mặt nạ lớp làm tan sương mù!', true);
        }
      } else if (dragMode === 'tl-be' && st.timeline) {
        var rawBePx = clamp(pt.x, 175, 175 + 9 * 50);
        var tickBe = clamp(Math.round((rawBePx - 175) / 50) + 1, 1, 10);
        if (Math.abs(tickBe - 4) <= 1) tickBe = 4;
        st.timeline.beCuuHoTick = tickBe;
        st.timeline.coPhuDeNguon = true;
        ctx.onUpdate('Đã kéo Bè Cứu Hộ vào Nhịp ' + tickBe, true);
      } else if (dragMode === 'tl-nhac' && st.timeline) {
        var rawNhacPx = clamp(pt.x, 175, 175 + 9 * 50);
        var tickNhac = clamp(Math.round((rawNhacPx - 175) / 50) + 1, 1, 10);
        if (Math.abs(tickNhac - 7) <= 1) tickNhac = 7;
        st.timeline.nhacSongCaTick = tickNhac;
        st.timeline.coPhuDeNguon = true;
        ctx.onUpdate('Đã kéo Nhạc Đệm vào Nhịp ' + tickNhac, true);
      } else if (dragMode === 'drag-css-gap' && st.cssBox) {
        st.cssBox.flexWrap = 'wrap';
        st.cssBox.padding = 14;
        st.cssBox.gap = 14;
        ctx.onUpdate('Đã bật flex-wrap: wrap và đặt Padding/Gap = 14px!', true);
      }
    }
    function onWindowPointerMove(ev) {
      var pt = getSvgPoint(ev);
      updateCursorReadout(pt);
      if (!dragMode) return;
      latestPt = pt;
      if (!rafPending) {
        rafPending = true;
        requestAnimationFrame(function () {
          rafPending = false;
          if (dragMode && latestPt) {
            applyDragAtPoint(latestPt);
          }
        });
      }
    }
    function onWindowPointerUp() {
      if (!dragMode) return;
      var ctx = getContext();
      if (!dragMoved && downAction && ctx) {
        runStageAction(downAction, ctx);
      }
      dragMode = null;
      dragIdx = -1;
      downAction = null;
      latestPt = null;
      if (ctx && typeof ctx.onUpdate === 'function') {
        ctx.onUpdate('', false);
      }
    }
    containerEl.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onWindowPointerMove, { passive: true });
    window.addEventListener('pointerup', onWindowPointerUp);
    window.addEventListener('pointercancel', onWindowPointerUp);
    activeCleanup = function () {
      containerEl.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onWindowPointerMove);
      window.removeEventListener('pointerup', onWindowPointerUp);
      window.removeEventListener('pointercancel', onWindowPointerUp);
    };
  }
  var API = {
    renderStageSvg: renderStageSvg,
    bindStageInteractions: bindStageInteractions
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  root.TuongTacSvg = API;
})(typeof window !== 'undefined' ? window : globalThis);
