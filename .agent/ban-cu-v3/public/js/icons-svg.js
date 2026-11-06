/**
 * icons-svg.js — Thư viện biểu tượng Vector SVG thuần khiết (Không dùng bất kỳ ký tự Emoji hay Symbol Unicode nào).
 * Hỗ trợ chạy cả trên trình duyệt (window.IconsSvg) và Node.js (module.exports).
 */
(function () {
  'use strict';

  var PATHS = {
    select: '<path d="M5 3l14 9-7 2-3 7L5 3z" stroke-linejoin="round"/>',
    move: '<path d="M12 2v20M2 12h20M12 2l-3 3M12 2l3 3M12 22l-3-3M12 22l3-3M2 12l3-3M2 12l3 3M22 12l-3-3M22 12l-3 3"/>',
    resize: '<rect x="3" y="3" width="18" height="18" rx="2" stroke-dasharray="3 2"/><path d="M8 16l8-8M12 8h4v4M12 16H8v-4"/>',
    rotate: '<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/>',
    addShape: '<rect x="3" y="3" width="10" height="10" rx="2"/><circle cx="16" cy="16" r="5"/><path d="M16 6v6M13 9h6"/>',
    nodeBezier: '<path d="M3 19C7 7 17 7 21 19"/><circle cx="3" cy="19" r="2.2"/><circle cx="21" cy="19" r="2.2"/><circle cx="12" cy="10" r="2.5"/><path d="M5 10h14" stroke-dasharray="2 2"/><circle cx="5" cy="10" r="1.5"/><circle cx="19" cy="10" r="1.5"/>',
    union: '<rect x="3" y="3" width="11" height="11" rx="2" fill="currentColor" fill-opacity="0.25"/><rect x="10" y="10" width="11" height="11" rx="2" fill="currentColor" fill-opacity="0.25"/><path d="M3 5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v5h5a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2v-5H5a2 2 0 0 1-2-2V5z"/>',
    subtract: '<rect x="3" y="8" width="12" height="12" rx="2" fill="currentColor" fill-opacity="0.25"/><rect x="9" y="4" width="12" height="12" rx="2" stroke-dasharray="3 2"/>',
    intersect: '<rect x="3" y="3" width="12" height="12" rx="2" stroke-dasharray="2 2"/><rect x="9" y="9" width="12" height="12" rx="2" stroke-dasharray="2 2"/><rect x="9" y="9" width="6" height="6" fill="currentColor" fill-opacity="0.45"/>',
    colorRgb: '<circle cx="12" cy="8" r="5"/><circle cx="8.5" cy="14.5" r="5"/><circle cx="15.5" cy="14.5" r="5"/>',
    layers: '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 12 12 17 22 12"/><polyline points="2 17 12 22 22 17"/>',
    mask: '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="12" cy="12" r="5" stroke-dasharray="3 2"/>',
    timeline: '<rect x="2" y="4" width="20" height="16" rx="2"/><line x1="2" y1="9" x2="22" y2="9"/><line x1="9" y1="4" x2="9" y2="20"/><polygon points="13 12 18 14.5 13 17 13 12" fill="currentColor"/>',
    cssBox: '<rect x="2" y="2" width="20" height="20" rx="2" stroke-dasharray="3 2"/><rect x="6" y="6" width="12" height="12" rx="1"/><rect x="9" y="9" width="6" height="6" fill="currentColor" fill-opacity="0.2"/>',
    alignMiddle: '<line x1="2" y1="12" x2="22" y2="12" stroke-dasharray="2 2"/><rect x="5" y="6" width="5" height="12" rx="1"/><rect x="14" y="8" width="5" height="8" rx="1"/>',
    distributeH: '<line x1="3" y1="4" x2="3" y2="20"/><line x1="21" y1="4" x2="21" y2="20"/><rect x="7" y="7" width="4" height="10" rx="1"/><rect x="13" y="7" width="4" height="10" rx="1"/>',
    lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    unlock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.5-1.8"/>',
    play: '<polygon points="6 4 20 12 6 20 6 4" fill="currentColor"/>',
    pause: '<rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor"/><rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor"/>',
    reset: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
    undo: '<path d="M9 14L4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11"/>',
    check: '<polyline points="20 6 9 17 4 12" stroke-width="2.5"/>',
    cross: '<line x1="18" y1="6" x2="6" y2="18" stroke-width="2.5"/><line x1="6" y1="6" x2="18" y2="18" stroke-width="2.5"/>',
    info: '<circle cx="12" cy="12" r="9"/><line x1="12" y1="16" x2="12" y2="12"/><circle cx="12" cy="8" r="0.8" fill="currentColor"/>',
    hint: '<path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.1V18h6v-1.2c0-.8.4-1.6 1-2.1A7 7 0 0 0 12 2z"/>',
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
    eye: '<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/>',
    eyeOff: '<path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a21.77 21.77 0 0 1 5.06-5.94M9.9 4.24A10.94 10.94 0 0 1 12 5c7 0 11 7 11 7a21.8 21.8 0 0 1-3.16 4.19M1 1l22 22"/>',
    arrowUp: '<polyline points="18 15 12 9 6 15"/>',
    arrowDown: '<polyline points="6 9 12 15 18 9"/>',
    arrowLeft: '<polyline points="15 18 9 12 15 6"/>',
    arrowRight: '<polyline points="9 18 15 12 9 6"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>',
    moon: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>',
    sensor: '<circle cx="12" cy="12" r="3"/><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"/>',
    robot: '<rect x="4" y="7" width="16" height="12" rx="3"/><line x1="12" y1="3" x2="12" y2="7"/><circle cx="12" cy="3" r="1.5"/><circle cx="9" cy="12" r="1.5" fill="currentColor"/><circle cx="15" cy="12" r="1.5" fill="currentColor"/><line x1="9" y1="16" x2="15" y2="16"/>',
    spark: '<polygon points="12 2 14.8 9.2 22 12 14.8 14.8 12 22 9.2 14.8 2 12 9.2 9.2 12 2"/>',
    vectorSvg: '<path d="M4 20L20 4"/><circle cx="4" cy="20" r="2.5"/><circle cx="20" cy="4" r="2.5"/><rect x="9" y="9" width="6" height="6" rx="1"/>',
    music: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>'
  };

  /**
   * Trả về chuỗi mã HTML của biểu tượng SVG.
   * @param {string} name Tên biểu tượng trong bảng PATHS
   * @param {number} [size=18] Kích thước chiều rộng/cao (px)
   * @param {string} [className=""] Lớp CSS tùy chọn
   * @returns {string} Chuỗi SVG hoàn chỉnh
   */
  function icon(name, size, className) {
    var s = size || 18;
    var body = PATHS[name] || PATHS.info;
    var cls = className ? ' class="' + className + '"' : '';
    return (
      '<svg' + cls + ' width="' + s + '" height="' + s + '" viewBox="0 0 24 24" ' +
      'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      body +
      '</svg>'
    );
  }

  var API = { icon: icon, PATHS: PATHS };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  if (typeof window !== 'undefined') window.IconsSvg = API;
})();
