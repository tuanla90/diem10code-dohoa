/**
 * ve-san-khau.js — Engine Bản Đồ Robot Python Thực Tế (VeVector + VeRobot) & Kho Tài Nguyên Gốc
 * Kết hợp trực tiếp hệ thống ô địa hình VeVector.o(), vật phẩm VeVector.vat() và VeRobot.ve()
 * từ dự án Mật Lệnh Robot (Mùa 9) với cấu trúc trạng thái đạo cụ của man-choi.js.
 * Tuân thủ nghiêm ngặt: Không Emoji/Unicode symbol, giới hạn dưới 1000 dòng.
 */
(function (root) {
  'use strict';
  /**
   * Cấu hình lưới bản đồ chuẩn 8 cột x 5 hàng trên khung nhìn Studio 800x420:
   * - Mỗi ô 70x70px -> rộng 560px (x: 120..680), cao 350px (y: 24..374).
   * - Hàng 3 (row = 3) có tâm cy = 269 (khớp trực tiếp với cao độ hành động y = 260..270 của man-choi.js).
   * - Hàng 1 (row = 1) có tâm cy = 129 (khớp với vùng uốn đường cong Bézier cy <= 155).
   */
  var GRID_LAYOUT = {
    cols: 8,
    rows: 5,
    cell: 70,
    originX: 120,
    originY: 24,
    width: 560,
    height: 350
  };
  function cellRect(col, row) {
    var x = GRID_LAYOUT.originX + col * GRID_LAYOUT.cell;
    var y = GRID_LAYOUT.originY + row * GRID_LAYOUT.cell;
    return {
      x: x,
      y: y,
      w: GRID_LAYOUT.cell,
      h: GRID_LAYOUT.cell,
      cx: x + GRID_LAYOUT.cell / 2,
      cy: y + GRID_LAYOUT.cell / 2
    };
  }
  function pointToCell(px, py) {
    var col = Math.floor((px - GRID_LAYOUT.originX) / GRID_LAYOUT.cell);
    var row = Math.floor((py - GRID_LAYOUT.originY) / GRID_LAYOUT.cell);
    var inGrid = col >= 0 && col < GRID_LAYOUT.cols && row >= 0 && row < GRID_LAYOUT.rows;
    return {
      col: Math.max(0, Math.min(GRID_LAYOUT.cols - 1, col)),
      row: Math.max(0, Math.min(GRID_LAYOUT.rows - 1, row)),
      inGrid: inGrid
    };
  }
  var VO_MAP = {
    'kho-hang': { san: 'san-kho', tuong: 'ke-hang', mau: 'san-mau' },
    'nha-may': { san: 'san-nha-may', tuong: 'tuong-nha-may', mau: 'san-mau' },
    'nong-trai': { san: 'co-non', tuong: 'bui-cay', mau: 'luong-hoa' },
    'cang': { san: 'bai-cont', tuong: 'tuong-cang', mau: 'san-mau' },
    'song': { san: 'san-ben-song', tuong: 'bo-ke-song', mau: 'san-mau' },
    'mo-da': { san: 'san-mo-da', tuong: 'tuong-mo-da', mau: 'san-mau' },
    'hang': { san: 'san-hang-dong', tuong: 'tuong-hang-dong', mau: 'san-mau' }
  };
  /**
   * Kho tư thế biểu cảm của Sola & Luna
   */
  var MASCOT_POSES = {
    sola: {
      wave: '/robot-game/phim-clb/a/mascot/sola/wave.webp',
      curious: '/robot-game/phim-clb/a/mascot/sola/thinking.webp',
      determined: '/robot-game/phim-clb/a/mascot/sola/confident.webp',
      happy: '/robot-game/phim-clb/a/mascot/sola/happy.webp',
      celebrate: '/robot-game/phim-clb/a/mascot/sola/celebrate-jump.webp',
      worried: '/robot-game/phim-clb/a/mascot/sola/worried.webp',
      oops: '/robot-game/phim-clb/a/mascot/sola/facepalm.webp'
    },
    luna: {
      wave: '/robot-game/phim-clb/a/mascot/luna/wave.webp',
      explain: '/robot-game/phim-clb/a/mascot/luna/explaining.webp',
      idea: '/robot-game/phim-clb/a/mascot/luna/thumbs-up.webp',
      encouraging: '/robot-game/phim-clb/a/mascot/luna/cheer.webp',
      greatJob: '/robot-game/phim-clb/a/mascot/luna/great-job.webp',
      thinking: '/robot-game/phim-clb/a/mascot/luna/thinking.webp'
    }
  };
  /**
   * Kho sprite 8 cỗ máy Robot Mùa 9
   */
  var ROBOT_SPRITES = {
    'hai-banh': { idle: '/robot-game/phim-clb/a/robot/m1/r1.webp', loi: '/robot-game/phim-clb/a/robot/m1/r1-ngac.webp', thang: '/robot-game/phim-clb/a/robot/m1/r1-vui.webp' },
    'xich': { idle: '/robot-game/phim-clb/a/robot/m2/xich.webp', loi: '/robot-game/phim-clb/a/robot/m2/xich-ngac.webp', thang: '/robot-game/phim-clb/a/robot/m2/xich-vui.webp' },
    'xuong': { idle: '/robot-game/phim-clb/a/robot/m4/xuong.webp', loi: '/robot-game/phim-clb/a/robot/m4/xuong-ngac.webp', thang: '/robot-game/phim-clb/a/robot/m4/xuong-vui.webp' },
    'cau': { idle: '/robot-game/phim-clb/a/robot/cang/cau.webp', loi: '/robot-game/phim-clb/a/robot/cang/cau-ngac.webp', thang: '/robot-game/phim-clb/a/robot/cang/cau-vui.webp' },
    'drone': { idle: '/robot-game/phim-clb/a/robot/m4/drone.webp', loi: '/robot-game/phim-clb/a/robot/m4/drone-ngac.webp', thang: '/robot-game/phim-clb/a/robot/m4/drone-vui.webp' },
    'omni': { idle: '/robot-game/phim-clb/a/robot/m6/omni.webp', loi: '/robot-game/phim-clb/a/robot/m6/omni-ngac.webp', thang: '/robot-game/phim-clb/a/robot/m6/omni-du-vui.webp' },
    'omni-luoi': { idle: '/robot-game/phim-clb/a/robot/m8/lai-omni-keo.webp', loi: '/robot-game/phim-clb/a/robot/m6/omni-ngac.webp', thang: '/robot-game/phim-clb/a/robot/m6/omni-du-vui.webp' },
    'nhen': { idle: '/robot-game/phim-clb/a/robot/m3/nhen.webp', loi: '/robot-game/phim-clb/a/robot/m3/nhen-ngac.webp', thang: '/robot-game/phim-clb/a/robot/m3/nhen-vui.webp' },
    'gai': { idle: '/robot-game/phim-clb/a/robot/m7/gai.webp', loi: '/robot-game/phim-clb/a/robot/m7/gai-ngac.webp', thang: '/robot-game/phim-clb/a/robot/m7/gai-vui.webp' }
  };
  /**
   * Kho nhân vật cần cứu trên 9 màn
   */
  var RESCUE_PEOPLE = {
    'ng-1': { wait: '/robot-game/phim-clb/a/nguoi/sau-hoang.webp', win: '/robot-game/phim-clb/a/nguoi/sau-mung.webp' },
    'ng-2': { wait: '/robot-game/phim-clb/a/nguoi/phong-hoang.webp', win: '/robot-game/phim-clb/a/nguoi/phong-mung.webp' },
    'ng-3': { wait: '/robot-game/phim-clb/a/nguoi/dung-hoang.webp', win: '/robot-game/phim-clb/a/nguoi/dung-mung.webp' },
    'ng-4': { wait: '/robot-game/phim-clb/a/nguoi/tu-hoang.webp', win: '/robot-game/phim-clb/a/nguoi/tu-mung.webp' },
    'ng-5': { wait: '/robot-game/phim-clb/a/nguoi/hanh-hoang.webp', win: '/robot-game/phim-clb/a/nguoi/hanh-mung.webp' },
    'ng-6': { wait: '/robot-game/phim-clb/a/nguoi/ba-hoang.webp', win: '/robot-game/phim-clb/a/nguoi/ba-mung.webp' },
    'ng-7': { wait: '/robot-game/phim-clb/a/nguoi/lan-hoang.webp', win: '/robot-game/phim-clb/a/nguoi/lan-mung.webp' },
    'ng-8': { wait: '/robot-game/phim-clb/a/nguoi/mai-hoang.webp', win: '/robot-game/phim-clb/a/nguoi/mai-mung.webp' },
    'ng-9': { wait: '/robot-game/phim-clb/a/nguoi/thay-dong-vien.webp', win: '/robot-game/phim-clb/a/nguoi/thay-tu-hao.webp' }
  };
  /**
   * Kho phông nền 9 màn
   */
  var STAGE_BACKDROPS = {
    'G10-01': { bg: '/robot-game/phim-clb/a/nen-doc/mua-6.webp', tile: '/robot-game/phim-clb/a/robot/m6/o-ho.webp', wall: '/robot-game/phim-clb/a/robot/m6/o-rao.webp' },
    'G10-02': { bg: '/robot-game/phim-clb/a/nen-doc/mua-song.webp', tile: '/robot-game/phim-clb/a/robot/m4/o-nuoc.webp', wall: '/robot-game/phim-clb/a/robot/m4/o-bo-da.webp' },
    'G10-03': { bg: '/robot-game/phim-clb/a/nen-doc/mua-4.webp', tile: '/robot-game/phim-clb/a/robot/m4/o-dong-phai.webp', wall: '/robot-game/phim-clb/a/robot/m4/o-phao-dich.webp' },
    'G10-04': { bg: '/robot-game/phim-clb/a/nen-doc/mua-hang.webp', tile: '/robot-game/phim-clb/a/robot/m8/o-ngach-1.webp', wall: '/robot-game/phim-clb/a/robot/m8/o-ho.webp' },
    'G10-05': { bg: '/robot-game/phim-clb/a/nen-doc/mua-cang.webp', tile: '/robot-game/phim-clb/a/robot/cang/o-bai-cont.webp', wall: '/robot-game/phim-clb/a/robot/cang/o-tuong-cang.webp' },
    'G11-01': { bg: '/robot-game/phim-clb/a/nen-doc/mua-5.webp', tile: '/robot-game/phim-clb/a/robot/m5/o-luong-yellow.webp', wall: '/robot-game/phim-clb/a/robot/m5/o-bui-cay.webp' },
    'G11-02': { bg: '/robot-game/phim-clb/a/nen-doc/mua-1.webp', tile: '/robot-game/phim-clb/a/robot/m1/o-san-kho.webp', wall: '/robot-game/phim-clb/a/robot/m1/o-ke-hang.webp' },
    'G11-03': { bg: '/robot-game/phim-clb/a/nen-doc/mua-7.webp', tile: '/robot-game/phim-clb/a/robot/m7/o-da-uot.webp', wall: '/robot-game/phim-clb/a/robot/m7/vat-da-chuong.webp' },
    'G12-01': { bg: '/robot-game/phim-clb/a/nen-doc/the-gioi.webp', tile: '/robot-game/phim-clb/a/ban-do/dai-9.webp', wall: '/robot-game/phim-clb/a/robot/m2/o-tuong-nha-may.webp' }
  };
  /**
   * Cấu hình CURATED_SCENES cho man-hinh-game.js
   */
  var CURATED_SCENES = {
    1: { mapBg: '/robot-game/phim-clb/a/nen-doc/mua-6.webp', r1Img: ROBOT_SPRITES['omni'].idle, r1Done: ROBOT_SPRITES['omni'].thang, personImg: RESCUE_PEOPLE['ng-1'].wait, personOkImg: RESCUE_PEOPLE['ng-1'].win, personLabel: 'Thợ mỏ (Ô 6,3)' },
    2: { mapBg: '/robot-game/phim-clb/a/nen-doc/mua-song.webp', r1Img: ROBOT_SPRITES['xuong'].idle, r1Done: ROBOT_SPRITES['xuong'].thang, personImg: RESCUE_PEOPLE['ng-2'].wait, personOkImg: RESCUE_PEOPLE['ng-2'].win, personLabel: 'Bạn nhỏ (Ô 6,3)' },
    3: { mapBg: '/robot-game/phim-clb/a/nen-doc/mua-4.webp', r1Img: ROBOT_SPRITES['xuong'].idle, r1Done: ROBOT_SPRITES['xuong'].thang, personImg: RESCUE_PEOPLE['ng-3'].wait, personOkImg: RESCUE_PEOPLE['ng-3'].win, personLabel: 'Ngư dân (Ô 6,3)' },
    4: { mapBg: '/robot-game/phim-clb/a/nen-doc/mua-hang.webp', r1Img: ROBOT_SPRITES['nhen'].idle, r1Done: ROBOT_SPRITES['nhen'].thang, personImg: RESCUE_PEOPLE['ng-4'].wait, personOkImg: RESCUE_PEOPLE['ng-4'].win, personLabel: 'Thám hiểm (Ô 6,3)' },
    5: { mapBg: '/robot-game/phim-clb/a/nen-doc/mua-cang.webp', r1Img: ROBOT_SPRITES['cau'].idle, r1Done: ROBOT_SPRITES['cau'].thang, personImg: RESCUE_PEOPLE['ng-5'].wait, personOkImg: RESCUE_PEOPLE['ng-5'].win, personLabel: 'Thủy thủ (Ô 5,3)' },
    6: { mapBg: '/robot-game/phim-clb/a/nen-doc/mua-5.webp', r1Img: ROBOT_SPRITES['drone'].idle, r1Done: ROBOT_SPRITES['drone'].thang, personImg: RESCUE_PEOPLE['ng-6'].wait, personOkImg: RESCUE_PEOPLE['ng-6'].win, personLabel: 'Nông dân (Ô 6,3)' },
    7: { mapBg: '/robot-game/phim-clb/a/nen-doc/mua-1.webp', r1Img: ROBOT_SPRITES['hai-banh'].idle, r1Done: ROBOT_SPRITES['hai-banh'].thang, personImg: RESCUE_PEOPLE['ng-7'].wait, personOkImg: RESCUE_PEOPLE['ng-7'].win, personLabel: 'Thủ kho (Ô 6,3)' },
    8: { mapBg: '/robot-game/phim-clb/a/nen-doc/mua-7.webp', r1Img: ROBOT_SPRITES['gai'].idle, r1Done: ROBOT_SPRITES['gai'].thang, personImg: RESCUE_PEOPLE['ng-8'].wait, personOkImg: RESCUE_PEOPLE['ng-8'].win, personLabel: 'Đội nhạc (Ô 6,3)' },
    9: { mapBg: '/robot-game/phim-clb/a/ban-do/dai-9.webp', r1Img: ROBOT_SPRITES['xich'].idle, r1Done: ROBOT_SPRITES['xich'].thang, personImg: RESCUE_PEOPLE['ng-9'].wait, personOkImg: RESCUE_PEOPLE['ng-9'].win, personLabel: 'Cổng CLB (Ô 6,2)' }
  };
  /**
   * 9 BẢN ĐỒ LƯỚI PYTHON THỰC TẾ TỪ MÙA 9 (man-cuu-*.js, bang-ghep.js & KE-HOACH-MUA-9-TO-HOP.md)
   * Mọi cấu hình r1/r2 đều tuân thủ nghiêm ngặt ma trận BangGhep.kiemGhep(than, tay, camBien).
   */
  var BAN_DO_MUA_9 = {
    1: {
      maGoc: 'lap-mo-da.6',
      vo: 'mo-da',
      san: [
        '########',
        '#.ouoM.#',
        '####.###',
        '#.CHDF.#',
        '########'
      ],
      noi: [{ tu: [5, 1], den: [2, 3] }],
      r1: {
        col: 1, row: 1, dir: 1,
        ten: 'R1 Máy Khai Mỏ Omni (Sola)',
        cauHinh: { than: 'omni', tay: 'nem', camBien: [{ ma: 'radar', o: 'tren', nhanDang: true }], son: 'vang' },
        code: [
          'def shape_bridge_lob():',
          '  if shape("front") == "round":',
          '    fill_pit() # Lấp hố u(3,1)',
          '    lob() # Ném đá (4,1) đè M(5,1)'
        ]
      },
      r2: {
        col: 1, row: 3, dir: 1,
        ten: 'R2 Xe Cứu Hộ Bánh Xích (Luna)',
        cauHinh: { than: 'xich', tay: 'hoi', camBien: [{ ma: 'hong-ngoai', o: 'truoc', doNhiet: true }], xichDay: true, son: 'lam' },
        code: [
          'wait_n(6) # Đợi R1 mở cửa C(2,3)',
          'forward(3) # Đẩy thùng H(3,3) vào D(4,3)'
        ]
      }
    },
    2: {
      maGoc: 'cuu-ben-song.1',
      vo: 'song',
      san: [
        '########',
        '#..~~~~#',
        '#..~~~~#',
        '#.~~~~F#',
        '########'
      ],
      noi: [],
      r1: {
        col: 1, row: 1, dir: 1,
        ten: 'R1 Xuồng Thủy Lợi (Sola)',
        cauHinh: { than: 'xuong', tay: 'day-keo', camBien: [{ ma: 'dong-chay', o: 'tren' }], son: 'vang' },
        code: [
          '# Đội G5 Bến sông — Ghép 4 nhịp phao:',
          'add_shape("pontoon", count=4)',
          'set_corner_radius(rx=16)',
          'align_middle(row=3); distribute_h()'
        ]
      },
      r2: {
        col: 1, row: 3, dir: 1,
        ten: 'R2 Xe Chở Hàng (Luna)',
        cauHinh: { than: 'hai-banh', tay: 'xoay', camBien: [{ ma: 'khoang-cach', o: 'hong' }], son: 'lam' },
        code: [
          '# Kiểm tra 4 nhịp phao q(2..5, 3):',
          'while not front_clear():',
          '  wait()',
          'forward(5) # Qua cầu phao tới F(6,3)'
        ]
      }
    },
    3: {
      maGoc: 'cuu-ben-song.4',
      vo: 'song',
      san: [
        '########',
        '#~~~~~~#',
        '#~~~~~~#',
        '#.~~##Q#',
        '########'
      ],
      noi: [],
      r1: {
        col: 6, row: 3, dir: 3,
        ten: 'R1 Xuồng Thủy Lợi (Sola)',
        cauHinh: { than: 'xuong', tay: 'day-keo', camBien: [{ ma: 'dong-chay', o: 'tren' }], son: 'vang' },
        code: [
          '# Đón phao tại Bến Q(6,3):',
          'if flow_dir() == "smooth_bezier":',
          '  pull() # Kéo người về bến Q(6,3)',
          '  dock_safe(6, 3)'
        ]
      },
      r2: {
        col: 1, row: 3, dir: 1,
        ten: 'R2 Máy Khai Thác Omni (Luna)',
        cauHinh: { than: 'omni', tay: 'nem', camBien: [{ ma: 'radar', o: 'tren' }], son: 'lam' },
        code: [
          '# Đội G5 (Xuồng + Máy khai thác):',
          'set_node_smooth(True)',
          'pull_handle(cy=120) # Né đá (3..4, 3)',
          'guide_flow_to(6, 3)'
        ]
      }
    },
    4: {
      maGoc: 'cuu-hang-dong.3',
      vo: 'hang',
      san: [
        '########',
        '#..#.#.#',
        '#..#.#.#',
        '#.uu.#F#',
        '########'
      ],
      noi: [],
      r1: {
        col: 1, row: 3, dir: 1,
        ten: 'R1 Nhện Từ Tính (Sola)',
        cauHinh: { than: 'nhen', tay: 'nam-cham', camBien: [{ ma: 'tu', o: 'hong' }], son: 'vang' },
        code: [
          '# Đội G8 Hang động (Nhện + Bánh gai):',
          'boolean_union(bridge=[2, 3])',
          'boolean_difference(wall=(5, 3))',
          'forward(5) # Qua cầu & vách đá tới F(6,3)'
        ]
      },
      r2: {
        col: 1, row: 1, dir: 1,
        ten: 'R2 Xe Bánh Gai (Luna)',
        cauHinh: { than: 'gai', tay: 'loa', camBien: [{ ma: 'am-thanh', o: 'tren' }], son: 'lam' },
        code: [
          '# Dò âm vang kiểm tra vách đá (5,3):',
          'if sound() == "open_arch":',
          '  honk("re")',
          '  support_spider(6, 3)'
        ]
      }
    },
    5: {
      maGoc: 'cuu-cang-song.2',
      vo: 'cang',
      san: [
        '########',
        '#..TTT.#',
        '#RRRRR.#',
        '#..o..F#',
        '########'
      ],
      noi: [],
      r1: {
        col: 2, row: 2, dir: 1,
        ten: 'R1 Cần Cẩu Cảng (Sola)',
        cauHinh: { than: 'cau', tay: 'moc-cau', camBien: [{ ma: 'quet-ma', o: 'tren' }], son: 'vang' },
        code: [
          'slide_right(1) # Trên ray R tới cột 3',
          'if read_code() == 42: # Nhãn SVG nét',
          '  hoist() # Cẩu thùng #42 ở (3,3)',
          '  drop("up") # Đặt lên boong tàu T(3,1)'
        ]
      },
      r2: {
        col: 5, row: 1, dir: 2,
        ten: 'R2 Drone Cảng Sông (Luna)',
        cauHinh: { than: 'drone', tay: 'son', camBien: [{ ma: 'camera-bay', o: 'bung' }], son: 'lam' },
        code: [
          '# Đội G4 Cảng sông (Cần cẩu + Drone):',
          'export_png_alpha("tan-cay")',
          'if look() == "clear_alpha":',
          '  guide_sailor_to(6, 3)'
        ]
      }
    },
    6: {
      maGoc: 'cuu-nong-trai.2',
      vo: 'nong-trai',
      san: [
        '########',
        '#......#',
        '#.C,,..#',
        '#..HM.F#',
        '########'
      ],
      noi: [{ tu: [4, 3], den: [2, 2] }],
      r1: {
        col: 1, row: 2, dir: 1,
        ten: 'R1 Drone Nông Nghiệp (Sola)',
        cauHinh: { than: 'drone', tay: 'son', camBien: [{ ma: 'camera-4', o: 'tren' }], son: 'vang' },
        code: [
          '# Đội G6 Nông trại (Drone + Xe xích):',
          'forward(2) # Qua cửa C(2,2) tới (3,2)',
          'if color() == "yellow": # RGB(255,255,0)',
          '  span_sow("yellow", 2)'
        ]
      },
      r2: {
        col: 1, row: 3, dir: 1,
        ten: 'R2 Xe Cứu Hỏa Bánh Xích (Luna)',
        cauHinh: { than: 'xich', tay: 'hoi', camBien: [{ ma: 'hong-ngoai', o: 'tren' }], xichDay: true, son: 'lam' },
        code: [
          '# Ủi thùng nặng H(3,3) đè nút M(4,3):',
          'forward(2) # Đẩy H vào M mở cửa C(2,2)',
          'set_rgb(255, 255, 0)',
          'forward(3) # Tới cờ F(6,3)'
        ]
      }
    },
    7: {
      maGoc: 'cuu-kho-hang.1',
      vo: 'kho-hang',
      san: [
        '########',
        '#......#',
        '#....CD#',
        '#.IIoMF#',
        '########'
      ],
      noi: [{ tu: [5, 3], den: [5, 2] }],
      r1: {
        col: 1, row: 3, dir: 1,
        ten: 'R1 Xe Kho Hai Bánh (Sola)',
        cauHinh: { than: 'hai-banh', tay: 'xoay', camBien: [{ ma: 'khoang-cach', o: 'hong' }], son: 'vang' },
        code: [
          '# Đội G1 Kho hàng (Xe kho + Drone):',
          'forward(3) # Chạy trên Lớp Thảm Cát',
          'grab(); turn_around() # Đưa hàng vào M(5,3)',
          'if mask_cleared(5, 3): forward(2)'
        ]
      },
      r2: {
        col: 1, row: 1, dir: 1,
        ten: 'R2 Drone Rắc Cát (Luna)',
        cauHinh: { than: 'drone', tay: 'son', camBien: [{ ma: 'camera-4', o: 'tren' }], son: 'lam' },
        code: [
          '# Đưa Lớp Thảm Cát lên trên Bùn I(2..3,3):',
          'move_layer_up("layer-tham-cat")',
          'paint_layer_mask("layer-suong-mu", 0)',
          'open_gate(5, 2)'
        ]
      }
    },
    8: {
      maGoc: 'ngay-hoi-clb.2',
      vo: 'hang',
      san: [
        '########',
        '#....CF#',
        '#......#',
        '#.~~~.C#',
        '########'
      ],
      noi: [
        { tu: [3, 3], den: [6, 3] },
        { tu: [5, 1], den: [5, 1] }
      ],
      r1: {
        col: 1, row: 1, dir: 1,
        ten: 'R1 Bánh Gai Loa (Sola)',
        cauHinh: { than: 'gai', tay: 'loa', camBien: [{ ma: 'am-thanh', o: 'tren' }], son: 'vang' },
        code: [
          '# Đội G10 Song ca (Bánh gai Loa + Xuồng):',
          'wait_until(tick=7)',
          'if sound() == 5:',
          '  honk(5); forward(5) # Tới F(6,1)'
        ]
      },
      r2: {
        col: 1, row: 3, dir: 1,
        ten: 'R2 Xuồng Thủy Lợi (Luna)',
        cauHinh: { than: 'xuong', tay: 'day-keo', camBien: [{ ma: 'dong-chay', o: 'tren' }], son: 'lam' },
        code: [
          '# Kéo bè gỗ B đón người đúng Nhịp 4:',
          'at_tick(4): pull_raft_to(3, 3)',
          'at_tick(7): sync_duet_audio()',
          'enable_subtitles_cc_by(True)'
        ]
      }
    },
    9: {
      maGoc: 'cuu-clb.1',
      vo: 'nha-may',
      san: [
        '########',
        '#...N..#',
        '#....CF#',
        '#..oMC.#',
        '########'
      ],
      noi: [
        { tu: [4, 1], den: [5, 2] },
        { tu: [4, 3], den: [5, 3] }
      ],
      r1: {
        col: 1, row: 2, dir: 1,
        ten: 'R1 Xe Xích Nhà Máy (Sola)',
        cauHinh: { than: 'xich', tay: 'hoi', camBien: [{ ma: 'hong-ngoai', o: 'tren' }], son: 'vang' },
        code: [
          '# Đội G9 Giải cứu CLB (Xe xích + Nhện):',
          'css("flex-wrap", "wrap") # Thu gọn bảng Web',
          'steam_jet(4, 1) # Bắn van hơi N(4,1)',
          'forward(5) # Qua cửa C(5,2) tới F(6,2)'
        ]
      },
      r2: {
        col: 1, row: 3, dir: 1,
        ten: 'R2 Nhện Từ Tính (Luna)',
        cauHinh: { than: 'nhen', tay: 'nam-cham', camBien: [{ ma: 'tu', o: 'hong' }], son: 'lam' },
        code: [
          'css_box(padding=14, gap=14)',
          'css_theme("high-contrast")',
          'magnet_pull(3, 3); place_on_M(4, 3)',
          'enter_clb_hall(6, 2)'
        ]
      }
    }
  };
  function veLinhVat(who, size, poseKey) {
    var key = who === 'luna' ? 'luna' : 'sola';
    var poses = MASCOT_POSES[key];
    var url = (poseKey && poses[poseKey]) ? poses[poseKey] : poses.wave;
    var s = Number(size) || 48;
    return '<img class="mascot-portrait-img" src="' + url + '" width="' + s + '" height="' + s + '" alt="' + key + '"/>';
  }
  function layCamXucHoiThoai(manId, mode) {
    if (mode === 'win') return { sola: 'celebrate', luna: 'greatJob' };
    if (mode === 'fail') return { sola: 'oops', luna: 'thinking' };
    return { sola: 'curious', luna: 'explain' };
  }
  function veRobotSvg(rb) {
    var loai = (rb && rb.loai) || 'hai-banh';
    var set = ROBOT_SPRITES[loai] || ROBOT_SPRITES['hai-banh'];
    var x = (rb && rb.x) || 100;
    var y = (rb && rb.y) || 100;
    return '<g class="svg-robot-unit" transform="translate(' + x + ',' + y + ')">' +
      '<image href="' + set.idle + '" x="-34" y="-34" width="68" height="68"/>' +
    '</g>';
  }
  function roundRect(ctx, x, y, w, h, r) {
    var rad = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rad, y);
    ctx.arcTo(x + w, y, x + w, y + h, rad);
    ctx.arcTo(x + w, y + h, x, y + h, rad);
    ctx.arcTo(x, y + h, x, y, rad);
    ctx.arcTo(x, y, x + w, y, rad);
    ctx.closePath();
  }
  function drawTile(ctx, ma, px, py, cellPx, state) {
    if (root.VeVector && typeof root.VeVector.o === 'function') {
      try {
        var tileCanvas = root.VeVector.o(ma, cellPx, state || null);
        if (tileCanvas) {
          ctx.drawImage(tileCanvas, px, py, cellPx, cellPx);
          return;
        }
      } catch (e) {}
    }
    ctx.fillStyle = ma === 'tuong' ? '#334155' : '#cbd5e1';
    ctx.fillRect(px, py, cellPx, cellPx);
  }
  function drawItem(ctx, ma, px, py, cellPx, scale, state) {
    var sc = scale || 0.84;
    var sz = Math.round(cellPx * sc);
    var off = Math.round((cellPx - sz) / 2);
    if (root.VeVector && typeof root.VeVector.vat === 'function') {
      try {
        var itemCanvas = root.VeVector.vat(ma, sz, state || null);
        if (itemCanvas) {
          ctx.drawImage(itemCanvas, px + off, py + off, sz, sz);
          return;
        }
      } catch (e) {}
    }
  }
  function toDirNum(huong) {
    if (typeof huong === 'number' && !isNaN(huong)) return ((huong % 4) + 4) % 4;
    if (huong === 'N') return 0;
    if (huong === 'E') return 1;
    if (huong === 'S') return 2;
    if (huong === 'W') return 3;
    return 1;
  }
  function drawRobotAt(ctx, cauHinh, huong, cx, cy, cellPx, trangThai) {
    if (root.VeRobot && typeof root.VeRobot.ve === 'function') {
      try {
        var tiLe = (cellPx * 0.94) / 100;
        var dirNum = toDirNum(huong);
        var robCanvas = root.VeRobot.ve(cauHinh, trangThai || { mat: 'binh-thuong' }, dirNum, tiLe);
        if (robCanvas) {
          ctx.drawImage(robCanvas, cx - cellPx * 0.47, cy - cellPx * 0.47, cellPx * 0.94, cellPx * 0.94);
          return;
        }
      } catch (e) {}
    }
  }
  /**
   * Vẽ bệ xuất phát trực quan cho Robot ở hai bên sườn bản đồ (không vẽ chữ gây nhiễu trên Canvas)
   */
  function drawRobotDockBadge(ctx, x, y, w, robInfo, isOk, isPlaying, accentColor) {
    ctx.save();
    var cx = x + w / 2;
    var cy = y + 46;
    roundRect(ctx, x + 6, y + 6, w - 12, 80, 14);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.55)';
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = isOk ? '#22c55e' : 'rgba(148, 163, 184, 0.35)';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, 26, 0, Math.PI * 2);
    ctx.fillStyle = '#1e293b';
    ctx.fill();
    ctx.strokeStyle = isOk ? '#22c55e' : accentColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    drawRobotAt(ctx, robInfo.cauHinh, 2, cx, cy, 46, {
      mat: isOk ? 'vui' : 'binh-thuong',
      camSang: isPlaying || isOk
    });

    // Đèn báo trạng thái nhỏ (xanh lá khi đạt, vàng khi chờ) — không dùng chữ
    ctx.beginPath();
    ctx.arc(cx, y + 74, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = isOk ? '#22c55e' : '#f59e0b';
    ctx.fill();
    ctx.restore();
  }
  /**
   * Vẽ toàn bộ Bản Đồ Robot Python thực tế lên <canvas id="robot-map-canvas">
   */
  function veBanDoRobotCanvas(canvasEl, man, state, anim) {
    if (!canvasEl || typeof canvasEl.getContext !== 'function') return;
    var so = (man && man.so) || 1;
    var mapCfg = BAN_DO_MUA_9[so] || BAN_DO_MUA_9[1];
    var st = state || {};
    var an = anim || { mode: 'idle', phase: 'idle', progress: 0 };
    var isRunning = an.mode === 'running' || an.mode === 'win';
    var p = an.mode === 'win' ? 1 : (isRunning ? Math.max(0, Math.min(1, an.progress || 0)) : 0);
    var kq = (man && typeof man.kiemDoHoa === 'function') ? man.kiemDoHoa(st) : [];
    var allChecksOk = kq.length > 0 && kq.every(function (c) { return c.ok; });
    var dpr = (typeof window !== 'undefined' && window.devicePixelRatio) ? Math.min(2.5, window.devicePixelRatio) : 1;
    var targetW = Math.round(800 * dpr);
    var targetH = Math.round(420 * dpr);
    if (canvasEl.width !== targetW || canvasEl.height !== targetH) {
      canvasEl.width = targetW;
      canvasEl.height = targetH;
    }
    var ctx = canvasEl.getContext('2d');
    if (!ctx) return;
    ctx.save();
    ctx.scale(dpr, dpr);
    // 1. Nền bản vẽ kỹ thuật Map-Builder
    var bgGrad = ctx.createLinearGradient(0, 0, 0, 420);
    bgGrad.addColorStop(0, '#0b1324');
    bgGrad.addColorStop(1, '#111c33');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 800, 420);
    var gx0 = GRID_LAYOUT.originX;
    var gy0 = GRID_LAYOUT.originY;
    var gw = GRID_LAYOUT.width;
    var gh = GRID_LAYOUT.height;
    var cellPx = GRID_LAYOUT.cell;
    roundRect(ctx, gx0 - 4, gy0 - 4, gw + 8, gh + 8, 10);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = allChecksOk ? '#22c55e' : '#38bdf8';
    ctx.stroke();
    var voInfo = VO_MAP[mapCfg.vo] || VO_MAP['mo-da'];
    var sanRows = mapCfg.san;
    var doorOpen = allChecksOk && (p > 0.3 || !isRunning);
    for (var r = 0; r < GRID_LAYOUT.rows; r++) {
      var rowStr = sanRows[r] || '########';
      for (var c = 0; c < GRID_LAYOUT.cols; c++) {
        var ch = rowStr.charAt(c) || '#';
        var px = gx0 + c * cellPx;
        var py = gy0 + r * cellPx;
        drawTile(ctx, voInfo.san, px, py, cellPx, null);
        if (so === 1) {
          var da1 = (st.objects || []).find(function (o) { return o.id === 'da-1'; });
          var da2 = (st.objects || []).find(function (o) { return o.id === 'da-2'; });
          var cua1 = (st.objects || []).find(function (o) { return o.id === 'cua-ham'; });
          var da1Tron = da1 && da1.lockAspect && Math.abs(da1.rx - da1.ry) <= 2 && da1.rx >= 26 && da1.rx <= 34;
          var da2DungO = da2 && Math.abs(da2.x - 435) <= 14 && Math.abs(da2.y - 129) <= 14;
          var cuaDungGoc = cua1 && Math.abs(cua1.rotate) <= 8;
          var hoLap = da1Tron && isRunning && p >= 0.25;
          var nutMDe = da1Tron && da2DungO && isRunning && p >= 0.55;
          var cuaMo = cuaDungGoc && nutMDe;
          if (c === 2 && r === 1) continue;
          if (c === 3 && r === 1) {
            drawTile(ctx, 'ho', px, py, cellPx, { daLap: hoLap });
            continue;
          }
          if (c === 4 && r === 1) continue;
          if (c === 5 && r === 1) {
            drawTile(ctx, 'nut-de', px, py, cellPx, { de: nutMDe });
            if (nutMDe) drawItem(ctx, 'da-mo', px, py, cellPx, 0.84, null);
            continue;
          }
          if (c === 2 && r === 3) continue;
          if (c === 3 && r === 3) {
            if (!(isRunning && allChecksOk && p > 0.65)) {
              drawItem(ctx, 'thung-nang', px, py, cellPx, 0.86, null);
            }
            continue;
          }
          if (c === 4 && r === 3) {
            drawTile(ctx, 'dich', px, py, cellPx, null);
            if (isRunning && allChecksOk && p >= 0.85) {
              drawItem(ctx, 'thung-nang', px, py, cellPx, 0.86, null);
            }
            continue;
          }
        } else if (so === 2) {
          if (ch === '~') {
            drawTile(ctx, 'nuoc', px, py, cellPx, { veBo: { tren: r === 1, duoi: r === 3, trai: c === 2, phai: c === 5 } });
            if (r === 3 && c >= 2 && c <= 5 && allChecksOk) {
              drawTile(ctx, 'ben-nhan', px, py, cellPx, null);
              drawItem(ctx, 'be-go', px, py, cellPx, 0.9, null);
            }
            continue;
          }
        } else if (so === 3) {
          if (ch === '~') {
            drawTile(ctx, 'nuoc', px, py, cellPx, { veBo: { tren: r === 1, duoi: r === 3, trai: c === 1, phai: c === 6 } });
            if (allChecksOk && r === 1 && c >= 2 && c <= 5) {
              drawTile(ctx, 'dong-nuoc', px, py, cellPx, { huong: 1, xiet: true });
            }
            continue;
          }
          if ((c === 3 || c === 4) && r === 3) {
            drawTile(ctx, 'nuoc', px, py, cellPx, null);
            drawItem(ctx, 'da-mo', px, py, cellPx, 0.88, null);
            continue;
          }
          if (c === 6 && r === 3) {
            drawTile(ctx, 'nuoc', px, py, cellPx, null);
            drawTile(ctx, 'phao-dich', px, py, cellPx, null);
            continue;
          }
        } else if (so === 4) {
          var vach4 = (st.objects || []).find(function (o) { return o.id === 'vach-da'; });
          var cau4 = (st.objects || []).find(function (o) { return o.id === 'cau-doi'; });
          if ((c === 2 || c === 3) && r === 3) {
            if (cau4 && cau4.booleanOp === 'union') {
              drawTile(ctx, 'san-hang-dong', px, py, cellPx, null);
              drawTile(ctx, 'bac-thang', px, py, cellPx, null);
            } else {
              drawTile(ctx, 'ho', px, py, cellPx, { daLap: false });
            }
            continue;
          }
          if (c === 5 && r === 3) {
            if (vach4 && vach4.booleanOp === 'difference') {
              drawTile(ctx, 'san-hang-dong', px, py, cellPx, null);
              drawTile(ctx, 'cua-ngach', px, py, cellPx, null);
            } else {
              drawTile(ctx, 'tuong-hang-dong', px, py, cellPx, null);
            }
            continue;
          }
        } else if (so === 5) {
          if (ch === 'T') {
            drawTile(ctx, 'boong-tau', px, py, cellPx, {
              co: true,
              vien: { tren: true, duoi: true, trai: c === 3, phai: c === 5 },
              hang: (allChecksOk && c === 3) ? { mau: 'orange', ma: 42 } : null
            });
            continue;
          }
          if (ch === 'R') {
            drawTile(ctx, 'ray-cau', px, py, cellPx, { trai: c > 1, phai: c < 5 });
            continue;
          }
          if (c === 3 && r === 3) {
            if (!(isRunning && allChecksOk && p > 0.45)) {
              drawItem(ctx, 'container', px, py, cellPx, 0.9, { mau: 'orange', ma: 42 });
            }
            continue;
          }
        } else if (so === 6) {
          if ((c === 3 || c === 4) && r === 2) {
            if (allChecksOk) {
              drawTile(ctx, 'luong-hoa', px, py, cellPx, { mau: 'yellow' });
              drawTile(ctx, 'o-hoa', px, py, cellPx, { mau: 'yellow' });
            } else {
              drawTile(ctx, 'luong-hoa', px, py, cellPx, { mau: 'red' });
            }
            continue;
          }
          if (c === 3 && r === 3) {
            drawItem(ctx, 'thung-nang', px, py, cellPx, 0.86, null);
            continue;
          }
        } else if (so === 7) {
          var layers7 = st.layers || [];
          var idxCat = layers7.findIndex(function (l) { return l.id === 'layer-tham-cat'; });
          var idxBun = layers7.findIndex(function (l) { return l.id === 'layer-bun-tron'; });
          var catOnTop = idxCat !== -1 && idxBun !== -1 && idxCat < idxBun;
          if (ch === 'I') {
            if (catOnTop) {
              drawTile(ctx, 'ben-nhan', px, py, cellPx, null);
            } else {
              drawTile(ctx, 'da-uot', px, py, cellPx, { kho: false });
            }
            continue;
          }
        } else if (so === 8) {
          var tl8 = st.timeline || {};
          if (r === 1 && (c === 3 || c === 5)) {
            var noteNum = c === 3 ? 3 : 5;
            var rungBell = (c === 3 && Number(tl8.beCuuHoTick) === 4) || (c === 5 && Number(tl8.nhacSongCaTick) === 7);
            drawTile(ctx, 'chuong-da', px, py, cellPx, { not: noteNum });
            drawItem(ctx, 'da-chuong', px, py, cellPx, 0.86, { not: noteNum, ben: 1, vo: rungBell });
            continue;
          }
          if (r === 3 && c >= 2 && c <= 4) {
            drawTile(ctx, 'nuoc', px, py, cellPx, { veBo: { tren: true, duoi: true, trai: c === 2, phai: c === 4 } });
            if (c === 3 && Number(tl8.beCuuHoTick) === 4) {
              drawItem(ctx, 'be-go', px, py, cellPx, 0.9, null);
            }
            continue;
          }
        }
        if (ch === '#') {
          drawTile(ctx, voInfo.tuong, px, py, cellPx, null);
        } else if (ch === 'u') {
          drawTile(ctx, 'ho', px, py, cellPx, { daLap: false });
        } else if (ch === 'I') {
          drawTile(ctx, 'da-uot', px, py, cellPx, { kho: allChecksOk });
        } else if (ch === 'N') {
          drawTile(ctx, 'nut-ban', px, py, cellPx, { bat: doorOpen });
        } else if (ch === 'M') {
          drawTile(ctx, 'nut-de', px, py, cellPx, { de: doorOpen });
        } else if (ch === 'C') {
          drawTile(ctx, 'cua', px, py, cellPx, { k: doorOpen ? 1 : 0, doc: true, vo: mapCfg.vo });
        } else if (ch === 'D') {
          drawTile(ctx, 'dich', px, py, cellPx, null);
        } else if (ch === 'F') {
          drawTile(ctx, 'co', px, py, cellPx, null);
        } else if (ch === 'Q') {
          drawTile(ctx, 'phao-dich', px, py, cellPx, null);
        } else if (ch === 'o') {
          drawItem(ctx, so === 9 ? 'loi-sat' : 'hop', px, py, cellPx, 0.85, null);
        }
      }
    }
    // Dây nối mạch giữa nút bấm và cửa C
    if (Array.isArray(mapCfg.noi)) {
      ctx.save();
      for (var ni = 0; ni < mapCfg.noi.length; ni++) {
        var wire = mapCfg.noi[ni];
        var p1 = cellRect(wire.tu[0], wire.tu[1]);
        var p2 = cellRect(wire.den[0], wire.den[1]);
        ctx.beginPath();
        ctx.moveTo(p1.cx, p1.cy);
        ctx.lineTo(p2.cx, p1.cy);
        ctx.lineTo(p2.cx, p2.cy);
        ctx.lineWidth = 2.5;
        ctx.setLineDash([5, 4]);
        ctx.strokeStyle = allChecksOk ? '#22c55e' : '#f59e0b';
        ctx.stroke();
      }
      ctx.restore();
    }
    // Vẽ đường lưới mỏng tinh tế giữa các ô (không vẽ chữ C0..C7 / H0..H4 đè lên ô bản đồ)
    ctx.save();
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.14)';
    ctx.lineWidth = 1;
    for (var gc = 0; gc <= GRID_LAYOUT.cols; gc++) {
      var lx = gx0 + gc * cellPx;
      ctx.beginPath();
      ctx.moveTo(lx, gy0);
      ctx.lineTo(lx, gy0 + gh);
      ctx.stroke();
    }
    for (var gr = 0; gr <= GRID_LAYOUT.rows; gr++) {
      var ly2 = gy0 + gr * cellPx;
      ctx.beginPath();
      ctx.moveTo(gx0, ly2);
      ctx.lineTo(gx0 + gw, ly2);
      ctx.stroke();
    }
    ctx.restore();
    // Lớp vật phẩm động Màn 1 (lap-mo-da.6) vẽ trực tiếp bằng VeVector theo tham số biến đổi Vector
    if (so === 1) {
      var s1Objs = st.objects || [];
      var s1Da1 = s1Objs.find(function (o) { return o.id === 'da-1'; }) || { x: 295, y: 129, rx: 48, ry: 22, lockAspect: false };
      var s1Da2 = s1Objs.find(function (o) { return o.id === 'da-2'; }) || { x: 435, y: 199, rx: 30, ry: 30 };
      var s1Cua = s1Objs.find(function (o) { return o.id === 'cua-ham'; }) || { x: 295, y: 269, rotate: 90 };
      var s1Da1Ok = s1Da1.lockAspect && Math.abs(s1Da1.rx - s1Da1.ry) <= 2 && s1Da1.rx >= 26 && s1Da1.rx <= 34;
      var s1Da2Ok = Math.abs(s1Da2.x - 435) <= 14 && Math.abs(s1Da2.y - 129) <= 14;
      var s1CuaOk = Math.abs(s1Cua.rotate) <= 8;
      var s1DoorOpen = s1Da1Ok && s1Da2Ok && s1CuaOk && (isRunning ? p >= 0.55 : false);
      // 1) Cửa hầm C(2,3) xoay theo góc rotate hiện tại
      var c23 = cellRect(2, 3);
      ctx.save();
      ctx.translate(c23.cx, c23.cy);
      ctx.rotate(((s1Cua.rotate || 0) * Math.PI) / 180);
      drawTile(ctx, 'cua', -cellPx / 2, -cellPx / 2, cellPx, { k: s1DoorOpen ? 1 : 0, doc: true, vo: mapCfg.vo });
      ctx.restore();
      // 2) Viên đá mỏ #1 tại Ô(2,1) co giãn theo tỷ lệ rx, ry (chưa lấp hố)
      if (!(isRunning && s1Da1Ok && p >= 0.25)) {
        var c21 = cellRect(2, 1);
        var scX = Math.max(0.45, Math.min(1.65, (s1Da1.rx || 30) / 30));
        var scY = Math.max(0.45, Math.min(1.65, (s1Da1.ry || 30) / 30));
        ctx.save();
        ctx.translate(c21.cx, c21.cy);
        ctx.scale(scX, scY);
        drawItem(ctx, 'da-mo', -cellPx / 2, -cellPx / 2, cellPx, 0.84, null);
        ctx.restore();
      }
      // 3) Viên đá mỏ #2 di chuyển tự do từ ngách Ô(4,2) lên Ô(4,1)
      if (!(isRunning && s1Da1Ok && s1Da2Ok && p >= 0.55)) {
        var d2x = typeof s1Da2.x === 'number' ? s1Da2.x : 435;
        var d2y = typeof s1Da2.y === 'number' ? s1Da2.y : 199;
        drawItem(ctx, 'da-mo', d2x - cellPx / 2, d2y - cellPx / 2, cellPx, 0.84, null);
      }
    }
    // Tính vị trí Robot R1 & R2 khi chạy biểu diễn
    var r1Col = mapCfg.r1.col;
    var r1Row = mapCfg.r1.row;
    var r1Dir = mapCfg.r1.dir;
    var r2Col = mapCfg.r2.col;
    var r2Row = mapCfg.r2.row;
    var r2Dir = mapCfg.r2.dir;
    if (isRunning && allChecksOk) {
      if (so === 1) {
        r1Col = 1 + Math.min(1, p / 0.45) * 2;
        r2Col = 1 + Math.max(0, (p - 0.55) / 0.45) * 2;
      } else if (so === 2) {
        r1Col = 1 + p * 3.5;
        r2Col = 1 + p * 5;
      } else if (so === 3) {
        r2Col = 1 + p * 4.5;
        r2Row = 3 - Math.sin(p * Math.PI) * 1.9;
      } else if (so === 4) {
        r1Col = 1 + p * 5;
        r2Col = 1 + p * 4;
      } else if (so === 5) {
        r1Col = 2 + Math.min(1, p * 2);
        r2Col = 5;
        r2Row = 1 + p * 1.5;
      } else if (so === 6) {
        r2Col = 1 + Math.min(1, p * 2) * 2;
        r1Col = 1 + Math.max(0, (p - 0.25) / 0.75) * 3.2;
      } else if (so === 7) {
        r1Col = 1 + p * 5;
        r2Col = 1 + p * 4;
      } else if (so === 8) {
        r2Col = 1 + Math.min(1, p * 1.6) * 2;
        r1Col = 1 + p * 5;
      } else {
        r1Col = 1 + p * 5;
        r2Col = 1 + p * 3.2;
      }
    }
    var r2Pos = cellRect(r2Col, r2Row);
    var r1Pos = cellRect(r1Col, r1Row);
    var robMood = {
      mat: an.mode === 'fail' ? 'lo' : (allChecksOk ? 'vui' : 'binh-thuong'),
      camSang: true
    };
    drawRobotAt(ctx, mapCfg.r2.cauHinh, r2Dir, r2Pos.cx, r2Pos.cy, cellPx, robMood);
    drawRobotAt(ctx, mapCfg.r1.cauHinh, r1Dir, r1Pos.cx, r1Pos.cy, cellPx, robMood);
    drawRobotDockBadge(ctx, 20, gy0 + 8, 84, mapCfg.r1, allChecksOk, isRunning, '#38bdf8');
    drawRobotDockBadge(ctx, 696, gy0 + 8, 84, mapCfg.r2, allChecksOk, isRunning, '#f472b6');
    ctx.restore();
  }
  function veNenSanKhau() {
    return '<defs>' +
      '<filter id="dropShadow" x="-15%" y="-15%" width="130%" height="140%">' +
        '<feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="#020617" flood-opacity="0.45"/>' +
      '</filter>' +
    '</defs>' +
    '<rect x="0" y="0" width="800" height="420" fill="none"/>';
  }
  function veTheThongSo(x, y, text, ok) {
    var border = ok ? '#22c55e' : '#38bdf8';
    return '<g transform="translate(' + x + ',' + y + ')" pointer-events="none">' +
      '<circle cx="12" cy="12" r="6" fill="' + border + '" stroke="#ffffff" stroke-width="2"/>' +
    '</g>';
  }
  function veTiaQuetRadar(x1, y1, x2, y2, ok) {
    var stroke = ok ? '#22c55e' : '#f43f5e';
    return '<g class="radar-beam-layer" pointer-events="none">' +
      '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + stroke + '" stroke-width="2.5" stroke-dasharray="6 4"/>' +
      '<circle cx="' + x2 + '" cy="' + y2 + '" r="6" fill="' + stroke + '" stroke="#ffffff" stroke-width="1.5"/>' +
    '</g>';
  }
  var API = {
    GRID_LAYOUT: GRID_LAYOUT,
    BAN_DO_MUA_9: BAN_DO_MUA_9,
    MASCOT_POSES: MASCOT_POSES,
    ROBOT_SPRITES: ROBOT_SPRITES,
    RESCUE_PEOPLE: RESCUE_PEOPLE,
    STAGE_BACKDROPS: STAGE_BACKDROPS,
    CURATED_SCENES: CURATED_SCENES,
    cellRect: cellRect,
    pointToCell: pointToCell,
    veLinhVat: veLinhVat,
    layCamXucHoiThoai: layCamXucHoiThoai,
    veRobotSvg: veRobotSvg,
    veBanDoRobotCanvas: veBanDoRobotCanvas,
    veNenSanKhau: veNenSanKhau,
    veTheThongSo: veTheThongSo,
    veTiaQuetRadar: veTiaQuetRadar
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  root.VeSanKhau = API;
})(typeof window !== 'undefined' ? window : globalThis);
