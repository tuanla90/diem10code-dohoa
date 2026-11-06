/**
 * man-hinh-game.js - Mo-dun quan ly dong chay 3 Man Hinh Game (Man Dau - Ban Do CLB - San Khau Dao Dien),
 * Thanh Top HUD, Hop thoai Chien thang 3 Sao va Hieu ung Am thanh cho "Doi Robot Chan Hung: San Khau Do Hoa".
 * Su dung 100% bieu tuong SVG thuan khiet va tai nguyen anh goc (.webp/.png), tuyet doi khong dung Emoji/Symbol.
 */
(function () {
  'use strict';

  var VALID_SCREENS = { title: true, map: true, stage: true };

  var InternalState = {
    activeScreen: 'title',
    soundEnabled: true,
    dialogueCollapsed: false,
    lastAppState: null,
    lastDanhSachMan: null,
    onSelectStageCb: null,
    victoryCallbacks: {
      onReplay: null,
      onMap: null,
      onNext: null
    }
  };

  /**
   * Tao chuoi SVG hinh ngoi sao 5 canh sac net (khong dung ky tu Unicode).
   * @param {boolean} filled Trang thai sao da dat (true = sang vang, false = vien xam)
   * @param {number} [size=18] Kich thuoc chieu rong va cao (px)
   * @param {string} [className=""] Lop CSS tuy chon
   * @returns {string} Ma HTML <svg>
   */
  function veSaoSvg(filled, size, className) {
    var s = size || 18;
    var fill = filled ? '#fbbf24' : 'none';
    var stroke = filled ? '#b45309' : '#94a3b8';
    var cls = className ? ' class="' + className + '"' : '';
    return (
      '<svg' + cls + ' width="' + s + '" height="' + s + '" viewBox="0 0 24 24" ' +
      'fill="' + fill + '" stroke="' + stroke + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>' +
      '</svg>'
    );
  }

  /**
   * Tao khay chua hang ngoi sao SVG (0..maxSao).
   * @param {number} soSao So sao da dat duoc
   * @param {number} [maxSao=3] Tong so sao toi da cua man
   * @param {number} [size=16] Kich thuoc moi ngoi sao (px)
   * @returns {string} Ma HTML chua cac ngoi sao SVG
   */
  function veKhaySaoSvg(soSao, maxSao, size) {
    var max = maxSao || 3;
    var earned = Math.max(0, Math.min(max, Number(soSao) || 0));
    var html = '';
    for (var i = 1; i <= max; i++) {
      html += veSaoSvg(i <= earned, size || 16, i <= earned ? 'star-svg earned' : 'star-svg empty');
    }
    return html;
  }

  /**
   * Tao bieu tuong SVG cho nut Loa am thanh (Bat / Tat).
   * @param {boolean} enabled Trang thai bat am thanh
   * @param {number} [size=16] Kich thuoc icon (px)
   * @returns {string} Ma HTML <svg>
   */
  function veIconAmThanhSvg(enabled, size) {
    var s = size || 16;
    if (enabled) {
      return (
        '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>' +
        '<path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>' +
        '<path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>' +
        '</svg>'
      );
    }
    return (
      '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>' +
      '<line x1="23" y1="9" x2="17" y2="15"/>' +
      '<line x1="17" y1="9" x2="23" y2="15"/>' +
      '</svg>'
    );
  }

  /**
   * Phat hieu ung am thanh tu kho tai nguyen goc /robot-game/phim-clb/a/sfx/<tenFile>.wav.
   * Boc trong try/catch an toan de khong bao gio gay loi tren trinh duyet chan autoplay hoac Node.js.
   * @param {string} tenFile Ten file am thanh ('click' | 'ding' | 'wrong' | 'pop' | 'riser' | 'whoosh-soft')
   * @param {Object} [appState] Doi tuong trang thai ung dung tuy chon
   */
  function phatAmThanh(tenFile, appState) {
    var st = appState || InternalState.lastAppState;
    if (st && st.soundEnabled === false) return;
    if (!InternalState.soundEnabled) return;
    if (!tenFile) return;

    var cleanName = String(tenFile).replace(/\.wav$/i, '');
    try {
      if (typeof Audio !== 'undefined') {
        var audio = new Audio('/robot-game/phim-clb/a/sfx/' + cleanName + '.wav');
        audio.volume = 0.45;
        var playPromise = audio.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () { /* bo qua neu trinh duyet chan autoplay */ });
        }
      }
    } catch (e) { /* bo qua loi am thanh */ }
  }

  /**
   * Tinh so sao cua mot man choi dua tren appState.starsById hoac appState.completedIds.
   * @param {Object} appState Trang thai ung dung
   * @param {string} stageId Ma man choi (vd: 'G10-01')
   * @returns {number} So sao (0..3)
   */
  function laySoSaoMan(appState, stageId) {
    if (!appState || !stageId) return 0;
    if (appState.starsById && typeof appState.starsById[stageId] === 'number') {
      return Math.max(0, Math.min(3, appState.starsById[stageId]));
    }
    if (appState.completedIds && appState.completedIds[stageId]) {
      return 3;
    }
    return 0;
  }

  /**
   * Tinh tong so sao va so man da hoan thanh tren toan chien dich.
   * @param {Object} appState Trang thai ung dung
   * @param {Array<Object>} danhSachMan Danh sach 9 man choi
   * @returns {{ totalStars: number, maxStars: number, doneCount: number, totalStages: number }}
   */
  function tinhThongKeChienDich(appState, danhSachMan) {
    var list = Array.isArray(danhSachMan)
      ? danhSachMan
      : (typeof window !== 'undefined' && window.ManChoi ? window.ManChoi.MAN_CHOI : []);
    var totalStars = 0;
    var doneCount = 0;

    for (var i = 0; i < list.length; i++) {
      var m = list[i];
      var s = laySoSaoMan(appState, m.id);
      totalStars += s;
      if (s > 0 || (appState && appState.completedIds && appState.completedIds[m.id])) {
        doneCount++;
      }
    }

    return {
      totalStars: totalStars,
      maxStars: list.length * 3 || 27,
      doneCount: doneCount,
      totalStages: list.length || 9
    };
  }

  /**
   * Chuyen doi giua 3 man hinh chinh cua game: 'title' (Man Dau), 'map' (Ban Do CLB), 'stage' (San Khau).
   * @param {'title'|'map'|'stage'} tenMan Ten man hinh can chuyen toi
   * @param {Object} [options] Tuy chon bo sung (vd: { silent: true })
   */
  function chuyenManHinh(tenMan, options) {
    var target = VALID_SCREENS[tenMan] ? tenMan : 'stage';
    var prev = InternalState.activeScreen;
    InternalState.activeScreen = target;

    if (typeof document !== 'undefined') {
      if (document.body) {
        document.body.setAttribute('data-active-screen', target);
      }
      var vp = document.getElementById('game-viewport');
      if (vp) {
        vp.setAttribute('data-active-screen', target);
      }

      var screenIds = {
        title: 'screen-title',
        map: 'screen-map',
        stage: 'screen-stage'
      };
      Object.keys(screenIds).forEach(function (key) {
        var el = document.getElementById(screenIds[key]);
        if (el) {
          if (key === target) {
            el.classList.add('active');
            el.setAttribute('aria-hidden', 'false');
          } else {
            el.classList.remove('active');
            el.setAttribute('aria-hidden', 'true');
          }
        }
      });

      var navBtns = {
        title: 'btn-nav-title',
        map: 'btn-nav-map',
        stage: 'btn-nav-stage'
      };
      Object.keys(navBtns).forEach(function (key) {
        var btn = document.getElementById(navBtns[key]);
        if (btn) {
          btn.classList.toggle('active', key === target);
        }
      });
    }

    if (prev !== target && (!options || !options.silent)) {
      phatAmThanh('whoosh-soft');
    }
  }

  /**
   * Lay ten man hinh dang hoat dong hien tai.
   * @returns {'title'|'map'|'stage'} Ten man hinh hien tai
   */
  function layManHinhHienTai() {
    return InternalState.activeScreen;
  }

  /**
   * Cap nhat Thanh Top HUD: Bien ten man (.plaque), Tong sao X / 27, va Huy hieu 3 khoi lop.
   * @param {Object} appState Trang thai ung dung
   * @param {Array<Object>} danhSachMan Danh sach 9 man choi
   * @param {Object} [manHienTai] Man choi dang chon
   */
  function capNhatHud(appState, danhSachMan, manHienTai) {
    if (appState) InternalState.lastAppState = appState;
    if (danhSachMan) InternalState.lastDanhSachMan = danhSachMan;
    if (typeof document === 'undefined') return;

    var list = Array.isArray(danhSachMan)
      ? danhSachMan
      : (typeof window !== 'undefined' && window.ManChoi ? window.ManChoi.MAN_CHOI : []);
    var idx = appState && typeof appState.currentIndex === 'number' ? appState.currentIndex : 0;
    var current = manHienTai || list[idx] || list[0];

    if (current) {
      var codeEl = document.getElementById('hud-plaque-code');
      var titleEl = document.getElementById('hud-plaque-title');
      var numStr = current.so < 10 ? '0' + current.so : String(current.so);
      if (codeEl) codeEl.textContent = 'MÀN ' + numStr + ' · TIN ' + current.lop;
      if (titleEl) titleEl.textContent = current.ten;
    }

    var stats = tinhThongKeChienDich(appState, list);
    var starsCountEl = document.getElementById('hud-stars-count');
    if (starsCountEl) {
      starsCountEl.textContent = stats.totalStars + ' / ' + stats.maxStars + ' SAO';
    }

    /* Cap nhat trang thai huy hieu Tin 10, Tin 11, Tin 12 */
    [10, 11, 12].forEach(function (grade) {
      var badgeImg = document.getElementById('badge-grade-' + grade);
      if (!badgeImg) return;
      var gradeStages = list.filter(function (m) { return Number(m.lop) === grade; });
      var allGradeDone = gradeStages.length > 0 && gradeStages.every(function (m) {
        return laySoSaoMan(appState, m.id) > 0;
      });
      badgeImg.classList.toggle('badge-earned', allGradeDone);
      badgeImg.classList.toggle('badge-locked', !allGradeDone);
    });

    /* Cap nhat nut am thanh */
    if (appState && typeof appState.soundEnabled === 'boolean') {
      InternalState.soundEnabled = appState.soundEnabled;
    }
    var soundBtn = document.getElementById('btn-sound-toggle');
    if (soundBtn) {
      soundBtn.innerHTML =
        veIconAmThanhSvg(InternalState.soundEnabled, 16) +
        '<span class="sr-only-mobile">' + (InternalState.soundEnabled ? 'Âm thanh: Bật' : 'Âm thanh: Tắt') + '</span>';
    }
  }

  /**
   * Ve va cap nhat du lieu tren Man Dau Khoi Dong (#screen-title).
   * @param {Object} appState Trang thai ung dung
   * @param {Array<Object>} danhSachMan Danh sach 9 man choi
   */
  function veManDau(appState, danhSachMan) {
    if (appState) InternalState.lastAppState = appState;
    if (danhSachMan) InternalState.lastDanhSachMan = danhSachMan;
    if (typeof document === 'undefined') return;

    var list = Array.isArray(danhSachMan)
      ? danhSachMan
      : (typeof window !== 'undefined' && window.ManChoi ? window.ManChoi.MAN_CHOI : []);
    var stats = tinhThongKeChienDich(appState, list);

    var starsSummaryEl = document.getElementById('title-stars-summary');
    if (starsSummaryEl) {
      starsSummaryEl.textContent = stats.totalStars + ' / ' + stats.maxStars + ' Sao Đạt Được';
    }

    var completedSummaryEl = document.getElementById('title-completed-summary');
    if (completedSummaryEl) {
      completedSummaryEl.textContent = stats.doneCount + ' / ' + stats.totalStages + ' Tiết Mục Hoàn Thành';
    }

    /* Xac dinh man tiep theo chua hoan thanh hoac man dang choi */
    var nextStage = list[0];
    if (appState && typeof appState.currentIndex === 'number' && list[appState.currentIndex]) {
      nextStage = list[appState.currentIndex];
    }
    for (var i = 0; i < list.length; i++) {
      if (laySoSaoMan(appState, list[i].id) === 0) {
        nextStage = list[i];
        break;
      }
    }

    var startSubEl = document.getElementById('btn-start-game-sub');
    if (startSubEl && nextStage) {
      startSubEl.textContent = 'Tiết mục ' + nextStage.so + ' (Lớp ' + nextStage.lop + '): ' + nextStage.ten;
    }

    capNhatHud(appState, list, nextStage);
  }

  /**
   * Dung Ban Do 9 Tram Cuu Ho song dong tren #screen-map (#stage-tabs-list).
   * Hien thi anh nen tram, anh robot, anh nguoi can cuu va khay 3 ngoi sao SVG.
   * @param {Object} appState Trang thai ung dung
   * @param {Array<Object>} danhSachMan Danh sach 9 man choi
   * @param {Function} [onSelectStage] Callback khi nguoi choi chon 1 tram (nhan tham so stageIdx)
   */
  function veBanDo(appState, danhSachMan, onSelectStage) {
    if (appState) InternalState.lastAppState = appState;
    if (danhSachMan) InternalState.lastDanhSachMan = danhSachMan;
    if (typeof onSelectStage === 'function') InternalState.onSelectStageCb = onSelectStage;
    if (typeof document === 'undefined') return;

    var list = Array.isArray(danhSachMan)
      ? danhSachMan
      : (typeof window !== 'undefined' && window.ManChoi ? window.ManChoi.MAN_CHOI : []);
    var VSK = typeof window !== 'undefined' ? window.VeSanKhau : null;
    var IC = typeof window !== 'undefined' ? window.IconsSvg : null;

    var listEl = document.getElementById('stage-tabs-list');
    if (!listEl) return;

    var filterGrade = (appState && appState.filterGrade) ? String(appState.filterGrade) : 'all';
    var curIdx = (appState && typeof appState.currentIndex === 'number') ? appState.currentIndex : 0;

    var cardsHtml = list.map(function (m, idx) {
      if (filterGrade !== 'all' && String(m.lop) !== filterGrade) {
        return '';
      }
      var isCurrent = idx === curIdx;
      var stars = laySoSaoMan(appState, m.id);
      var isDone = stars > 0;

      var rbKey = (m.robot && m.robot.id === 'rb-omni-luoi')
        ? 'omni-luoi'
        : (m.robot ? m.robot.loai : 'hai-banh');
      var rbSet = (VSK && VSK.ROBOT_SPRITES && VSK.ROBOT_SPRITES[rbKey])
        ? VSK.ROBOT_SPRITES[rbKey]
        : { idle: '/robot-game/phim-clb/a/robot/m1/du.webp', thang: '/robot-game/phim-clb/a/robot/m1/du-vui.webp' };
      var rbSprite = isDone ? rbSet.thang : rbSet.idle;

      var personId = (m.nguoiCanCuu && m.nguoiCanCuu.id) ? m.nguoiCanCuu.id : 'ng-1';
      var personSet = (VSK && VSK.RESCUE_PEOPLE && VSK.RESCUE_PEOPLE[personId])
        ? VSK.RESCUE_PEOPLE[personId]
        : { ten: 'Nhân vật CLB', wait: '/robot-game/phim-clb/a/nguoi/sau-hoang.webp', win: '/robot-game/phim-clb/a/nguoi/sau-mung.webp' };
      var personSprite = isDone ? personSet.win : personSet.wait;

      var bgUrl = (VSK && VSK.STAGE_BACKDROPS && VSK.STAGE_BACKDROPS[m.id])
        ? VSK.STAGE_BACKDROPS[m.id].bg
        : '/robot-game/phim-clb/a/nen-doc/the-gioi.webp';

      var numStr = m.so < 10 ? '0' + m.so : String(m.so);
      var arrowSvg = IC ? IC.icon('arrowRight', 15) : '';

      return (
        '<button type="button" class="stage-tab map-station-node' +
        (isCurrent ? ' active' : '') +
        (isDone ? ' done' : '') +
        '" data-stage-idx="' + idx + '">' +
        '<div class="station-top-row">' +
        '<div class="station-badges-grp">' +
        '<span class="station-num-pill">TRẠM ' + numStr + '</span>' +
        '<span class="stage-badge">Lớp ' + m.lop + '</span>' +
        '</div>' +
        '<div class="station-stars-tray" aria-label="' + stars + ' trên 3 sao">' +
        veKhaySaoSvg(stars, 3, 15) +
        '</div>' +
        '</div>' +
        '<div class="station-preview-scene" style="background-image:url(\'' + bgUrl + '\')">' +
        '<img class="stage-tab-thumb" src="' + rbSprite + '" width="48" height="48" alt="Robot trạm ' + m.so + '"/>' +
        '<img src="' + personSprite + '" width="44" height="44" alt="' + personSet.ten + '"/>' +
        '</div>' +
        '<div class="station-info-block">' +
        '<span class="stage-tab-title">' + m.so + '. ' + m.ten + '</span>' +
        '<span class="station-tool-sub">' + m.congCuChinh + '</span>' +
        '</div>' +
        '<div class="station-cta-bar">' +
        '<span>' + (isDone ? 'DIỄN LẠI (' + stars + '/3 SAO)' : 'VÀO SÂN KHẤU DIỄN') + '</span>' +
        '<span class="stage-status-icon">' + arrowSvg + '</span>' +
        '</div>' +
        '</button>'
      );
    }).join('');

    listEl.innerHTML = cardsHtml;
    capNhatHud(appState, list);
  }

  /**
   * Hien thi Hop Thoai Chien Thang 3 Sao (#victory-modal-overlay) khi Robot cuu nguoi thanh cong.
   * @param {Object} options Cau hinh hop thoai chien thang
   * @param {Object} options.man Doi tuong man choi vua thang
   * @param {number} [options.stars=3] So sao dat duoc (1, 2 hoac 3)
   * @param {Function} [options.onReplay] Callback khi bam nut "DIEN LAI"
   * @param {Function} [options.onMap] Callback khi bam nut "BAN DO CLB"
   * @param {Function} [options.onNext] Callback khi bam nut "TIET MUC TIEP THEO"
   */
  function hienHopChienThang(options) {
    if (typeof document === 'undefined') return;
    var opts = options || {};
    var man = opts.man;
    var stars = Math.max(1, Math.min(3, Number(opts.stars) || 3));
    var VSK = typeof window !== 'undefined' ? window.VeSanKhau : null;

    InternalState.victoryCallbacks.onReplay = typeof opts.onReplay === 'function' ? opts.onReplay : null;
    InternalState.victoryCallbacks.onMap = typeof opts.onMap === 'function' ? opts.onMap : null;
    InternalState.victoryCallbacks.onNext = typeof opts.onNext === 'function' ? opts.onNext : null;

    var overlay = document.getElementById('victory-modal-overlay');
    if (!overlay) return;

    var starsRow = document.getElementById('victory-stars-row');
    if (starsRow) {
      var starItems = '';
      for (var i = 1; i <= 3; i++) {
        starItems +=
          '<span class="victory-star-item">' +
          veSaoSvg(i <= stars, 44, i <= stars ? 'star-big earned' : 'star-big empty') +
          '</span>';
      }
      starsRow.innerHTML = starItems;
    }

    if (man) {
      var titleEl = document.getElementById('victory-stage-title');
      if (titleEl) {
        titleEl.textContent = 'Tiết mục ' + man.so + ' (Lớp ' + man.lop + '): ' + man.ten;
      }

      var rbKey = (man.robot && man.robot.id === 'rb-omni-luoi')
        ? 'omni-luoi'
        : (man.robot ? man.robot.loai : 'hai-banh');
      var rbImg = document.getElementById('victory-robot-img');
      var rbName = document.getElementById('victory-robot-name');
      if (rbImg && VSK && VSK.ROBOT_SPRITES && VSK.ROBOT_SPRITES[rbKey]) {
        rbImg.src = VSK.ROBOT_SPRITES[rbKey].thang;
      }
      if (rbName && man.robot) {
        rbName.textContent = man.robot.nhan || 'Robot Cứu Hộ';
      }

      var personId = (man.nguoiCanCuu && man.nguoiCanCuu.id) ? man.nguoiCanCuu.id : 'ng-1';
      var personImg = document.getElementById('victory-person-img');
      var personName = document.getElementById('victory-person-name');
      if (personImg && VSK && VSK.RESCUE_PEOPLE && VSK.RESCUE_PEOPLE[personId]) {
        personImg.src = VSK.RESCUE_PEOPLE[personId].win;
        if (personName) personName.textContent = VSK.RESCUE_PEOPLE[personId].ten + ' (An Toàn!)';
      }

      var summaryEl = document.getElementById('victory-summary-text');
      if (summaryEl) {
        var sgkLesson = (man.sgk && man.sgk.bai) ? man.sgk.bai : '';
        var sgkBody = (man.sgk && man.sgk.noiDung) ? man.sgk.noiDung : '';
        summaryEl.innerHTML =
          '<p style="margin:0 0 6px"><strong>Kết quả Cảm biến Robot (' + stars + '/3 Sao):</strong> ' +
          (man.thoaiThang || 'Robot đã hoàn thành nhiệm vụ giải cứu!') + '</p>' +
          (sgkLesson ? '<p style="margin:0;font-size:12px;opacity:0.9"><strong>Ghi nhớ SGK (' + sgkLesson + '):</strong> ' + sgkBody + '</p>' : '');
      }
    }

    overlay.classList.remove('hidden');
    phatAmThanh('ding');
  }

  /**
   * Dong Hop Thoai Chien Thang 3 Sao (#victory-modal-overlay).
   */
  function dongHopChienThang() {
    if (typeof document === 'undefined') return;
    var overlay = document.getElementById('victory-modal-overlay');
    if (overlay) {
      overlay.classList.add('hidden');
    }
  }

  /**
   * Kich hoat hieu ung rung khung san khau (@keyframes stageShake) khi cam bien bao loi.
   */
  function rungSanKhau() {
    if (typeof document === 'undefined') return;
    var box = document.getElementById('stage-svg-container');
    if (!box) return;
    box.classList.remove('stage-shake');
    void box.offsetWidth;
    box.classList.add('stage-shake');
    setTimeout(function () {
      box.classList.remove('stage-shake');
    }, 480);
  }

  /**
   * Tu dong gan cac su kien dieu huong mac dinh cho HUD, Man Dau, Ban Do va Hop thoai Chien thang.
   */
  function khoiTaoTuDong() {
    if (typeof document === 'undefined') return;

    var btnNavTitle = document.getElementById('btn-nav-title');
    if (btnNavTitle) {
      btnNavTitle.addEventListener('click', function () {
        veManDau(InternalState.lastAppState, InternalState.lastDanhSachMan);
        chuyenManHinh('title');
      });
    }

    var btnNavMap = document.getElementById('btn-nav-map');
    if (btnNavMap) {
      btnNavMap.addEventListener('click', function () {
        veBanDo(InternalState.lastAppState, InternalState.lastDanhSachMan, InternalState.onSelectStageCb);
        chuyenManHinh('map');
      });
    }

    var btnNavStage = document.getElementById('btn-nav-stage');
    if (btnNavStage) {
      btnNavStage.addEventListener('click', function () {
        chuyenManHinh('stage');
      });
    }

    var btnStartGame = document.getElementById('btn-start-game');
    if (btnStartGame) {
      btnStartGame.addEventListener('click', function () {
        phatAmThanh('pop');
        chuyenManHinh('stage');
      });
    }

    var btnGotoMap = document.getElementById('btn-goto-map');
    if (btnGotoMap) {
      btnGotoMap.addEventListener('click', function () {
        veBanDo(InternalState.lastAppState, InternalState.lastDanhSachMan, InternalState.onSelectStageCb);
        chuyenManHinh('map');
      });
    }

    /* Khi chon 1 tram tren Ban do (#stage-tabs-list), tu dong chuyen sang San Khau */
    var stageTabsList = document.getElementById('stage-tabs-list');
    if (stageTabsList) {
      stageTabsList.addEventListener('click', function (ev) {
        var btn = ev.target.closest('[data-stage-idx]');
        if (!btn) return;
        var idx = Number(btn.getAttribute('data-stage-idx'));
        if (typeof InternalState.onSelectStageCb === 'function') {
          InternalState.onSelectStageCb(idx);
        }
        chuyenManHinh('stage');
      });
    }

    /* Nut mo So Tay SGK & Goi y tren Top HUD */
    var btnOpenSgk = document.getElementById('btn-open-sgk');
    if (btnOpenSgk) {
      btnOpenSgk.addEventListener('click', function () {
        phatAmThanh('click');
        if (InternalState.activeScreen !== 'stage') {
          chuyenManHinh('stage');
        }
        var sgkCard = document.getElementById('sgk-drawer-card');
        if (sgkCard) {
          sgkCard.classList.remove('sgk-highlight');
          void sgkCard.offsetWidth;
          sgkCard.classList.add('sgk-highlight');
          if (typeof sgkCard.scrollIntoView === 'function') {
            sgkCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }
      });
    }

    /* Nut thu gon / mo rong Bong thoai Sola & Luna */
    var btnToggleDialogue = document.getElementById('btn-toggle-dialogue');
    if (btnToggleDialogue) {
      btnToggleDialogue.addEventListener('click', function () {
        phatAmThanh('click');
        var banner = document.getElementById('dialogue-banner');
        if (banner) {
          InternalState.dialogueCollapsed = !InternalState.dialogueCollapsed;
          banner.classList.toggle('collapsed', InternalState.dialogueCollapsed);
        }
      });
    }

    /* Nut bat / tat am thanh */
    var btnSound = document.getElementById('btn-sound-toggle');
    if (btnSound) {
      btnSound.addEventListener('click', function () {
        InternalState.soundEnabled = !InternalState.soundEnabled;
        if (InternalState.lastAppState) {
          InternalState.lastAppState.soundEnabled = InternalState.soundEnabled;
        }
        capNhatHud(InternalState.lastAppState, InternalState.lastDanhSachMan);
        if (InternalState.soundEnabled) {
          phatAmThanh('click');
        }
      });
    }

    /* Cac nut trong Hop thoai Chien thang 3 Sao */
    var btnVictoryReplay = document.getElementById('btn-victory-replay');
    if (btnVictoryReplay) {
      btnVictoryReplay.addEventListener('click', function () {
        phatAmThanh('click');
        dongHopChienThang();
        if (typeof InternalState.victoryCallbacks.onReplay === 'function') {
          InternalState.victoryCallbacks.onReplay();
        }
      });
    }

    var btnVictoryMap = document.getElementById('btn-victory-map');
    if (btnVictoryMap) {
      btnVictoryMap.addEventListener('click', function () {
        dongHopChienThang();
        if (typeof InternalState.victoryCallbacks.onMap === 'function') {
          InternalState.victoryCallbacks.onMap();
        } else {
          veBanDo(InternalState.lastAppState, InternalState.lastDanhSachMan, InternalState.onSelectStageCb);
          chuyenManHinh('map');
        }
      });
    }

    var btnVictoryNext = document.getElementById('btn-victory-next');
    if (btnVictoryNext) {
      btnVictoryNext.addEventListener('click', function () {
        phatAmThanh('pop');
        dongHopChienThang();
        if (typeof InternalState.victoryCallbacks.onNext === 'function') {
          InternalState.victoryCallbacks.onNext();
        }
      });
    }

    /* Khoi tao du lieu ban dau cho Man Dau va HUD */
    veManDau(InternalState.lastAppState, InternalState.lastDanhSachMan);
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', khoiTaoTuDong);
    } else {
      khoiTaoTuDong();
    }
  }

  var API = {
    chuyenManHinh: chuyenManHinh,
    layManHinhHienTai: layManHinhHienTai,
    capNhatHud: capNhatHud,
    veManDau: veManDau,
    veBanDo: veBanDo,
    hienHopChienThang: hienHopChienThang,
    dongHopChienThang: dongHopChienThang,
    phatAmThanh: phatAmThanh,
    rungSanKhau: rungSanKhau,
    veSaoSvg: veSaoSvg,
    veKhaySaoSvg: veKhaySaoSvg,
    laySoSaoMan: laySoSaoMan,
    tinhThongKeChienDich: tinhThongKeChienDich
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  if (typeof window !== 'undefined') window.ManHinhGame = API;
})();
