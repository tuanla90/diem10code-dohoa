/**
 * man-choi.js — Ngân hàng 9 Màn chơi Sân Khấu Tổng Kết CLB Robot (Lớp 10, 11, 12).
 * Kết nối cốt truyện Sola & Luna (tin_hoc) với 8 Cỗ máy Cứu hộ Mùa 9 (doi-robot-chan-hung).
 * Mỗi màn có hàm kiemDoHoa(state) chấm trực tiếp cấu trúc thuộc tính đồ họa (không dùng vật lý tự do).
 */
(function () {
  'use strict';

  /**
   * Sao chép sâu đối tượng trạng thái màn chơi.
   * @param {Object} obj Đối tượng nguồn
   * @returns {Object} Bản sao độc lập
   */
  function cloneState(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  var MAN_CHOI = [
    /* =========================================================================
     * MÀN 1 (LỚP 10): BIẾN ĐỔI ĐỐI TƯỢNG VECTOR (SCALE KHÓA W:H, MOVE & ROTATE)
     * Bối cảnh gốc Mùa 9: lap-mo-da.6 (shape_bridge_lob) — Máy khai mỏ Omni (R1) + Xe bánh xích (R2)
     * ========================================================================= */
    {
      id: 'G10-01',
      so: 1,
      lop: 10,
      ten: 'Lấp Hố Mỏ Đá & Hất Đá Bấm Nút (lap-mo-da.6)',
      boiCanh: 'Mỏ đá (lap-mo-da.6) · Máy khai mỏ Omni (R1) + Xe cứu hộ bánh xích (R2)',
      congCuChinh: 'Co giãn Khóa tỷ lệ (Scale W:H) · Di chuyển (Move) · Xoay hướng (Rotate)',
      thoaiMoDau: {
        sola: 'Ở màn Mỏ đá 6 (shape_bridge_lob), Máy khai mỏ Omni (R1) ở làn trên Ô(1,1) cần kiểm tra shape("front") == "round", gọi fill_pit() lấp hố sâu u(3,1) rồi gọi lob() hất viên đá thứ hai ở Ô(4,1) đè nút M(5,1) mở Cửa hầm C(2,3) cho Xe bánh xích (R2) đẩy thùng nặng H(3,3) vào đích D(4,3)!',
        luna: 'Bản đồ đang gặp đúng 3 lỗi biến đổi Vector (Inkscape Bài 12): (1) Đá mỏ #1 ở Ô(2,1) bị kéo dẹt thành Elip (96x44) vì tắt Khóa tỷ lệ W:H; (2) Đá mỏ #2 bị đặt lệch xuống ngách Ô(4,2) thay vì Ô(4,1); (3) Cửa hầm C(2,3) bị xoay ngang 90 độ kẹt cứng vào đường đi!'
      },
      thoaiLoi: 'Robot báo lỗi: (1) Đá mỏ #1 ở Ô(2,1) chưa bật Khóa tỷ lệ W:H và thu về tròn đều 60x60 (Rx = Ry = 30), hoặc (2) Đá mỏ #2 chưa kéo lên đúng Ô(4,1), hoặc (3) Cửa hầm C(2,3) chưa xoay về góc 0 độ!',
      thoaiThang: 'Chuẩn xác 100% kịch bản lap-mo-da.6! Cảm biến shape("front") == "round" nhận diện Đá #1 tròn đều, R1 gọi fill_pit() lấp hố u(3,1), tiến lên hất Đá #2 ở Ô(4,1) đè nút M(5,1) mở Cửa C(2,3) cho Xe bánh xích R2 đẩy thùng H(3,3) vào đích D(4,3)!',
      sgk: {
        bai: 'Tin học 10 — Bài 12: Phần mềm thiết kế đồ họa (Biến đổi đối tượng Vector trong Inkscape)',
        noiDung: 'Ba phép biến đổi hình học cơ bản trên đối tượng Vector (Selector Tool): (1) Co giãn kích thước W x H kèm Khóa tỷ lệ (Lock Aspect Ratio) để hình tròn không biến dạng thành Elip; (2) Di chuyển vị trí (Translate / Move X, Y); (3) Xoay góc định hướng (Rotate).'
      },
      goiY: '1) Công cụ Co giãn (Scale W:H): Chọn Đá mỏ #1 ở Ô(2,1), bật Ổ khóa tỷ lệ W:H rồi nắm kéo tay nắm góc trên khung bao về đúng vòng tròn chuẩn 60x60 (Rx = Ry = 30px). 2) Công cụ Di chuyển (Move): Nắm kéo Đá mỏ #2 từ ngách giữa Ô(4,2) lên đúng Ô(4,1). 3) Công cụ Xoay (Rotate): Chọn Cửa hầm C ở Ô(2,3) và kéo tay nắm xoay từ 90 độ về 0 độ.',
      robot: { id: 'rb-omni', loai: 'omni', x: 225, y: 129, nhan: 'Máy khai mỏ Omni (R1)', dichX: 365, dichY: 129 },
      nguoiCanCuu: { id: 'ng-1', x: 575, y: 269, duoiNuoc: false, nhan: 'Thợ mỏ (Ô 6,3)', dichX: 575, dichY: 269 },
      tramCuuHo: { x: 575, y: 269, nhan: 'MỎ ĐÁ 6' },
      camBien: { ten: 'shape("front")', tuX: 225, tuY: 129, denObjId: 'da-1' },
      stateBanDau: {
        selectedId: 'da-1',
        activeTool: 'scale',
        objects: [
          {
            id: 'da-1',
            ten: 'Đá mỏ #1 — Ô(2,1)',
            loai: 'da-mo',
            x: 295,
            y: 129,
            rx: 48,
            ry: 22,
            lockAspect: false,
            rotate: 0,
            editable: ['resize', 'lockAspect']
          },
          {
            id: 'da-2',
            ten: 'Đá mỏ #2 — Cần đặt vào Ô(4,1)',
            loai: 'da-mo',
            x: 435,
            y: 199,
            rx: 30,
            ry: 30,
            lockAspect: true,
            rotate: 0,
            editable: ['move']
          },
          {
            id: 'cua-ham',
            ten: 'Cửa hầm C — Ô(2,3)',
            loai: 'cua',
            x: 295,
            y: 269,
            w: 64,
            h: 64,
            rotate: 90,
            editable: ['rotate']
          }
        ]
      },
      kiemDoHoa: function (state) {
        var objs = (state && state.objects) || [];
        var da1 = objs.find(function (o) { return o.id === 'da-1'; });
        var da2 = objs.find(function (o) { return o.id === 'da-2'; });
        var cua = objs.find(function (o) { return o.id === 'cua-ham'; });
        var daKhoaTyLe = !!(da1 && da1.lockAspect);
        var da1Tron = !!(da1 && Math.abs(da1.rx - da1.ry) <= 2 && da1.rx >= 26 && da1.rx <= 34);
        var da2DungViTri = !!(da2 && Math.abs(da2.x - 435) <= 14 && Math.abs(da2.y - 129) <= 14);
        var cuaDungHuong = !!(cua && Math.abs(cua.rotate) <= 8);
        return [
          { ok: daKhoaTyLe && da1Tron, txt: 'Co giãn (Scale + Khóa W:H): Đá mỏ #1 tại Ô(2,1) tròn đều 60x60px (Rx = Ry = 30px)' },
          { ok: da2DungViTri, txt: 'Di chuyển (Move): Đá mỏ #2 đã kéo từ ngách Ô(4,2) lên đúng vị trí ném Ô(4,1)' },
          { ok: cuaDungHuong, txt: 'Xoay hướng (Rotate): Cửa hầm C tại Ô(2,3) đã xoay về góc chuẩn 0 độ' }
        ];
      },
      apDungGoiY: function (state) {
        var objs = (state && state.objects) || [];
        var da1 = objs.find(function (o) { return o.id === 'da-1'; });
        var da2 = objs.find(function (o) { return o.id === 'da-2'; });
        var cua = objs.find(function (o) { return o.id === 'cua-ham'; });
        if (da1) { da1.lockAspect = true; da1.rx = 30; da1.ry = 30; }
        if (da2) { da2.x = 435; da2.y = 129; }
        if (cua) { cua.rotate = 0; }
      }
    },

    /* =========================================================================
     * MÀN 2 (LỚP 10): ADD SHAPE (BO GÓC RX) & ALIGN / DISTRIBUTE (CĂN CHỈNH)
     * Bối cảnh Mùa 9: G5 Bến sông — Ghép 4 nhịp cầu phao thẳng hàng
     * ========================================================================= */
    {
      id: 'G10-02',
      so: 2,
      lop: 10,
      ten: 'Thêm Phao Bo Góc & Căn Hàng Cầu Phao',
      boiCanh: 'Gói 5 Bến sông (cuu-ben-song.1) · Xuồng thủy lợi (R1) + Xe chở hàng (R2)',
      congCuChinh: 'Thêm hình cơ bản (Bo góc Rx) & Căn chỉnh / Phân bố đều (Align & Distribute)',
      thoaiMoDau: {
        sola: 'Trên kênh Bến sông G5, Xuồng thủy lợi (R1) đang chờ ghép cầu phao qua 4 ô nước (2..5, 3), nhưng mới có 3 tấm phao nằm lệch lạc nên Xe chở hàng (R2) báo front_clear() == False không qua sông được!',
        luna: 'Cầu phao Bến sông cần đủ 4 nhịp phao bo góc tròn (Rx >= 12) để giảm sức cản dòng chảy, sau đó cậu dùng Căn giữa ngang (Align Middle vào hàng H3) và Phân bố đều (Distribute) qua 4 cột sông là Xe chở hàng đi qua được ngay!'
      },
      thoaiLoi: 'Cảm biến front_clear() báo lỗi: Chưa đủ 4 tấm phao bo góc (Rx >= 12) hoặc các phao chưa được căn thẳng hàng ngang H3 và phân bố đều qua 4 ô sông!',
      thoaiThang: 'Tuyệt vời! Bốn nhịp cầu phao đã bo góc mượt và xếp thẳng tắp qua kênh Bến sông. Xe chở hàng (R2) băng qua cầu phao phối hợp cùng Xuồng (R1) về đích!',
      sgk: {
        bai: 'Tin học 10 — Bài 12: Vẽ hình cơ bản, Tham số đặc trưng & Căn chỉnh đối tượng',
        noiDung: 'Hình chữ nhật trong đồ họa Vector có tham số bán kính bo góc (Rx, Ry). Công cụ Align & Distribute giúp căn thẳng hàng (theo trục ngang/dọc) và chia khoảng cách đều nhau tự động mà không cần kéo tay từng hình.'
      },
      goiY: '1) Bấm nút "+ Thêm Phao thứ 4 (Add Shape)" ở bảng công cụ. 2) Kéo thanh "Bán kính bo góc (Rx)" của phao lên >= 14. 3) Bấm nút "Căn Giữa Ngang (Align Middle)" và "Phân Bố Đều Ngang (Distribute)".',
      robot: { id: 'rb-xuong-2', loai: 'xuong', x: 95, y: 260, nhan: 'Xuồng & Xe chở hàng', dichX: 520, dichY: 260 },
      nguoiCanCuu: { id: 'ng-2', x: 575, y: 255, duoiNuoc: false, nhan: 'Bên bờ đông G5', dichX: 690, dichY: 255 },
      tramCuuHo: { x: 690, y: 255, nhan: 'BẾN SÔNG G5' },
      camBien: { ten: 'front_clear()', tuX: 95, tuY: 260, denObjId: 'phao-1' },
      stateBanDau: {
        selectedId: 'phao-1',
        riverZone: { x: 165, y: 170, w: 360, h: 180 },
        objects: [
          { id: 'phao-1', ten: 'Phao nổi 1', loai: 'pontoon', x: 185, y: 215, w: 72, h: 32, rx: 14, fill: '#38bdf8', stroke: '#0369a1', editable: ['move', 'cornerRadius'] },
          { id: 'phao-2', ten: 'Phao nổi 2', loai: 'pontoon', x: 295, y: 305, w: 72, h: 32, rx: 14, fill: '#38bdf8', stroke: '#0369a1', editable: ['move', 'cornerRadius'] },
          { id: 'phao-3', ten: 'Phao nổi 3', loai: 'pontoon', x: 420, y: 200, w: 72, h: 32, rx: 14, fill: '#38bdf8', stroke: '#0369a1', editable: ['move', 'cornerRadius'] }
        ],
        daCanGiua: false,
        daPhanBoDeu: false
      },
      kiemDoHoa: function (state) {
        var phao = state.objects.filter(function (o) { return o.loai === 'pontoon'; });
        var du4Phao = phao.length >= 4;
        var boGocOk = phao.every(function (p) { return (p.rx || 0) >= 12; });
        var thangHangY = phao.length >= 4 && phao.every(function (p) { return Math.abs(p.y - 260) <= 12; });
        var xs = phao.map(function (p) { return p.x; }).sort(function (a, b) { return a - b; });
        var cachDeu = xs.length >= 4 &&
          Math.abs((xs[1] - xs[0]) - (xs[2] - xs[1])) <= 12 &&
          Math.abs((xs[2] - xs[1]) - (xs[3] - xs[2])) <= 12;
        return [
          { ok: du4Phao, txt: 'Đã dùng Add Shape triệu hồi đủ 4 tấm phao trên sông' },
          { ok: boGocOk, txt: 'Mọi tấm phao đều được bo góc tròn (Corner Radius Rx >= 12 px)' },
          { ok: thangHangY, txt: '4 tấm phao đã được Căn giữa ngang (Align Middle ở cao độ Y = 260)' },
          { ok: cachDeu, txt: '4 tấm phao đã được Phân bố đều theo chiều ngang (Distribute Horizontally)' }
        ];
      },
      apDungGoiY: function (state) {
        var phao = state.objects.filter(function (o) { return o.loai === 'pontoon'; });
        if (phao.length < 4) {
          state.objects.push({
            id: 'phao-4',
            ten: 'Phao nổi 4 (Mới)',
            loai: 'pontoon',
            x: 445,
            y: 260,
            w: 72,
            h: 32,
            rx: 16,
            fill: '#38bdf8',
            stroke: '#0369a1',
            editable: ['move', 'cornerRadius']
          });
        }
        var ds = state.objects.filter(function (o) { return o.loai === 'pontoon'; });
        var startX = 180;
        var stepX = 86;
        ds.forEach(function (p, idx) {
          p.y = 260;
          p.x = startX + idx * stepX;
          p.rx = 16;
        });
        state.daCanGiua = true;
        state.daPhanBoDeu = true;
        state.selectedId = 'phao-4';
      }
    },

    /* =========================================================================
     * MÀN 3 (LỚP 10): ĐIỂM NEO & TAY NẮM ĐƯỜNG CONG BÉZIER (NODE & HANDLES)
     * Bối cảnh Mùa 9: G4 Cảng sông — Uốn dòng chảy đưa người về lưới Xuồng
     * ========================================================================= */
    {
      id: 'G10-03',
      so: 3,
      lop: 10,
      ten: 'Uốn Dòng Chảy Bézier Né Bãi Đá Ngầm',
      boiCanh: 'Gói 5 Bến sông (cuu-ben-song.4) · Xuồng thủy lợi (R1) + Máy khai thác Omni (R2)',
      congCuChinh: 'Chuyển thành đường, Điểm neo (Anchor Nodes) & Tay nắm điều khiển (Bézier Handles)',
      thoaiMoDau: {
        sola: 'Tại Bến sông G5, Xuồng thủy lợi (R1) đang neo ở bến phao Q(6,3) chờ đón, nhưng đường dòng chảy đang gấp khúc đâm thẳng vào bãi đá ngầm Ô(3..4, 3)!',
        luna: 'Tại cậu nối các điểm neo bằng đoạn thẳng đấy! Mau chuyển nút giữa thành Nút trơn (Smooth Node) và kéo Tay nắm điều khiển uốn dòng nước vòng qua Hàng H1 phía trên bãi đá ngầm về đúng bến phao Q(6,3) của Xuồng đi!'
      },
      thoaiLoi: 'Đường dòng chảy vẫn là đoạn gấp khúc hoặc đỉnh đường cong chưa vòng lên cao (cy <= 155) qua Hàng H1 để né bãi đá ngầm và kết thúc tại bến phao Q(6,3)!',
      thoaiThang: 'Đường cong Bézier mượt tuyệt đối! Dòng nước uốn vòng qua Hàng H1 né bãi đá ngầm, đưa phao cứu hộ cập đúng mũi Xuồng tại Q(6,3)!',
      sgk: {
        bai: 'Tin học 10 — Bài 13 (C10-28): Điểm neo và Tay nắm điều khiển đường cong Bézier',
        noiDung: 'Máy tính nhớ đường Vector bằng danh sách các Điểm neo (Anchor Nodes) và Tay nắm điều khiển (Control Handles). Điểm neo quyết định đường đi qua đâu; độ dài và hướng của Tay nắm quyết định đường uốn cong theo dáng nào.'
      },
      goiY: '1) Bấm chọn "Đường dòng chảy (#dong-chay)". 2) Bật chế độ "Nút trơn Bézier (Smooth Curve)". 3) Kéo Điểm điều khiển (Control Point) lên cao (Y <= 145) để vòm cong vượt qua Bãi đá ngầm và kéo Điểm cuối về sát mũi Xuồng (X >= 535, Y = 265).',
      robot: { id: 'rb-xuong', loai: 'xuong', x: 575, y: 265, nhan: 'Xuồng thủy lợi (pull)', dichX: 640, dichY: 265 },
      nguoiCanCuu: { id: 'ng-3', x: 130, y: 265, duoiNuoc: true, nhan: 'Trôi theo dòng G5', dichX: 695, dichY: 265 },
      tramCuuHo: { x: 695, y: 265, nhan: 'BẾN PHAO Q(6,3)' },
      camBien: { ten: 'flow_dir()', tuX: 575, tuY: 265, denObjId: 'dong-chay' },
      stateBanDau: {
        selectedId: 'dong-chay',
        obstacleRock: { x: 340, y: 260, r: 48, ten: 'Bãi đá ngầm' },
        objects: [
          {
            id: 'dong-chay',
            ten: 'Đường dòng chảy (#dong-chay)',
            loai: 'bezierPath',
            x1: 130,
            y1: 265,
            cx: 340,
            cy: 265,
            x2: 470,
            y2: 330,
            smooth: false,
            stroke: '#0284c7',
            editable: ['bezier']
          }
        ]
      },
      kiemDoHoa: function (state) {
        var p = state.objects.find(function (o) { return o.id === 'dong-chay'; });
        var daChuyenCong = !!(p && p.smooth);
        var neDaNgam = p && p.cy <= 155;
        var toiMuiXuong = p && p.x2 >= 530 && Math.abs(p.y2 - 265) <= 24;
        return [
          { ok: daChuyenCong, txt: 'Đã chuyển đoạn gấp khúc thành Đường cong Bézier trơn (Smooth Node)' },
          { ok: neDaNgam, txt: 'Đã kéo Tay nắm điều khiển lên cao (Cy <= 155) để uốn vòng qua Bãi đá ngầm' },
          { ok: toiMuiXuong, txt: 'Điểm neo cuối (X2, Y2) đã nối khớp vào vùng đón của mũi Xuồng thủy lợi' }
        ];
      },
      apDungGoiY: function (state) {
        var p = state.objects.find(function (o) { return o.id === 'dong-chay'; });
        if (p) {
          p.smooth = true;
          p.cx = 340;
          p.cy = 120;
          p.x2 = 545;
          p.y2 = 265;
        }
      }
    },

    /* =========================================================================
     * MÀN 4 (LỚP 10): PHÉP GHÉP HÌNH BOOLEAN (HỢP UNION & TRỪ DIFFERENCE)
     * Bối cảnh Mùa 9: G8 Hang động — Khoét cửa đá thật sự thay vì đè hình trắng!
     * ========================================================================= */
    {
      id: 'G10-04',
      so: 4,
      lop: 10,
      ten: 'Miếng Trắng Đâu Phải Lỗ Thật! (Phép Trừ & Phép Hợp)',
      boiCanh: 'Gói 8 Hang động (cuu-hang-dong.3) · Robot Nhện từ tính (R1) + Xe bánh gai (R2)',
      congCuChinh: 'Phép Trừ / Hiệu (Boolean Difference) & Phép Hợp (Boolean Union)',
      thoaiMoDau: {
        sola: 'Trong Hang động G8, hố sụt đôi Ô(2..3, 3) đang chia cắt đường đi! Để mở vòm cửa qua vách đá Ô(5,3), tớ vẽ luôn một hình tròn màu trắng đè lên vách đá, nhìn giống hệt cái lỗ rồi nhé!',
        luna: 'Lại chiêu tô trắng giả làm lỗ của bài C10-28! Hình tròn trắng chỉ nằm đè lên chứ vách đá Ô(5,3) đã thủng đâu, Nhện từ tính (R1) và Xe bánh gai (R2) chạy tới là cụng đầu ngay! Mau dùng Phép Trừ (Difference) khoét thủng vách đá và Phép Hợp (Union) hàn 2 nhịp cầu đá đi!'
      },
      thoaiLoi: 'Vách đá Ô(5,3) chưa được khoét bằng Phép Trừ (Nhện đâm sầm vào miếng hình tròn trắng!) hoặc 2 mảnh cầu đá qua hố Ô(2..3, 3) chưa được hàn liền bằng Phép Hợp (Union)!',
      thoaiThang: 'Đúng chuẩn bài C10-28! Phép Trừ đã khoét thủng vách đá Ô(5,3) mở cửa ngách, còn Phép Hợp đã đúc liền cây cầu đá qua hố sụt cho Nhện từ tính và Xe bánh gai về đích!',
      sgk: {
        bai: 'Tin học 10 — Bài 13 (C10-28): Ba phép ghép hình (Hợp, Giao, Trừ / Hiệu)',
        noiDung: 'Đặt một hình màu trắng đè lên hình khác KHÔNG tạo ra lỗ thủng. Muốn khoét thủng hình dưới bằng hình trên, phải dùng Phép Trừ (Difference). Muốn đúc nhiều hình rời thành một khối duy nhất, dùng Phép Hợp (Union).'
      },
      goiY: '1) Chọn "Vách đá hang động", bấm nút "Phép Trừ (Boolean Difference)" để dùng hình tròn khoét thủng vách đá. 2) Chọn "Nhịp cầu đá đôi", bấm nút "Phép Hợp (Boolean Union)" để hàn liền 2 mảnh cầu.',
      robot: { id: 'rb-nhen', loai: 'nhen', x: 105, y: 270, nhan: 'Nhện từ tính (R1)', dichX: 520, dichY: 270 },
      nguoiCanCuu: { id: 'ng-4', x: 585, y: 265, duoiNuoc: false, nhan: 'Kẹt sau vách đá G8', dichX: 695, dichY: 265 },
      tramCuuHo: { x: 695, y: 265, nhan: 'HANG ĐỘNG G8' },
      camBien: { ten: 'front_clear() & sound()', tuX: 105, tuY: 270, denObjId: 'vach-da' },
      stateBanDau: {
        selectedId: 'vach-da',
        objects: [
          {
            id: 'cau-doi',
            ten: 'Nhịp cầu đá đôi (#cau-doi)',
            loai: 'booleanBridge',
            x: 235,
            y: 295,
            booleanOp: 'none', // 'none' | 'union'
            editable: ['booleanUnion']
          },
          {
            id: 'vach-da',
            ten: 'Vách đá & Hình tròn trắng đè lên (#vach-da)',
            loai: 'booleanWall',
            x: 430,
            y: 165,
            w: 90,
            h: 155,
            cutterX: 475,
            cutterY: 265,
            cutterR: 42,
            booleanOp: 'white-overlay', // 'white-overlay' | 'difference' | 'intersection'
            editable: ['booleanDiff']
          }
        ]
      },
      kiemDoHoa: function (state) {
        var vach = state.objects.find(function (o) { return o.id === 'vach-da'; });
        var cau = state.objects.find(function (o) { return o.id === 'cau-doi'; });
        var daKhoetLo = vach && vach.booleanOp === 'difference';
        var daHopCau = cau && cau.booleanOp === 'union';
        return [
          { ok: daKhoetLo, txt: 'Đã dùng Phép Trừ (Boolean Difference) khoét thủng vách đá (thay vì đè hình tròn trắng)' },
          { ok: daHopCau, txt: 'Đã dùng Phép Hợp (Boolean Union) hàn 2 mảnh đá rời thành cây cầu nguyên khối' }
        ];
      },
      apDungGoiY: function (state) {
        var vach = state.objects.find(function (o) { return o.id === 'vach-da'; });
        var cau = state.objects.find(function (o) { return o.id === 'cau-doi'; });
        if (vach) vach.booleanOp = 'difference';
        if (cau) cau.booleanOp = 'union';
      }
    },

    /* =========================================================================
     * MÀN 5 (LỚP 10): ĐỒ HỌA BITMAP VS VECTOR (SVG) & ĐỊNH DẠNG JPG VS PNG
     * Bối cảnh Mùa 9: G4 Cảng sông & G6 Nông trại — Cần cẩu đọc mã & Drone nhìn xuyên tán cây
     * ========================================================================= */
    {
      id: 'G10-05',
      so: 5,
      lop: 10,
      ten: 'Vỡ Hạt Mã Container & Khung Trắng Ảnh JPG',
      boiCanh: 'Gói 4 Cảng sông (cuu-cang-song.2) · Cần cẩu cảng (R1) + Drone cảng (R2)',
      congCuChinh: 'Chuyển đổi Bitmap sang Vector (SVG) & Xuất định dạng PNG nền trong suốt',
      thoaiMoDau: {
        sola: 'Tại Cảng sông G4, Cần cẩu (R1) trên đường ray R cần dùng read_code() đọc mã số 42 ở Ô(3,3) để bốc thùng lên boong tàu T(3,1), còn Drone (R2) thì báo không thấy thủy thủ dưới tán cây Ô(5,3)!',
        luna: 'Nhãn số 42 cậu lấy ảnh điểm (Bitmap) nhỏ xíu phóng to gấp 8 lần nên vỡ hạt nhòe nhoẹt, đầu đọc mã quet-ma chịu thua! Còn tán cây ven cảng cậu xuất tệp JPG nên dính nguyên cái nền trắng chữ nhật che kín bên dưới, phải đổi sang PNG nền trong suốt!'
      },
      thoaiLoi: 'Đầu đọc mã read_code() của Cần cẩu bị mù do nhãn Container #42 đang là ảnh Bitmap vỡ hạt, hoặc tán cây đang lưu định dạng JPG có nền trắng che mất tầm nhìn của Drone!',
      thoaiThang: 'Chuẩn không cần chỉnh! Nhãn SVG sắc nét giúp Cần cẩu đọc đúng mã 42 cẩu thùng lên boong tàu T(3,1), còn tán cây PNG nền trong suốt giúp Drone soi rõ đường về đích!',
      sgk: {
        bai: 'Tin học 10 — Bài 11 & 13 (C10-25, C10-28): Ảnh Bitmap vs Vector; Định dạng SVG, PNG, JPG',
        noiDung: 'Ảnh điểm (Bitmap) khi phóng to sẽ bị vỡ hạt (răng cưa); đồ họa Vector (SVG) dùng công thức toán học nên phóng to cỡ nào cũng nét. Định dạng JPG không hỗ trợ nền trong suốt (luôn lấp nền đặc); muốn giữ nền trong suốt phải xuất PNG hoặc SVG.'
      },
      goiY: '1) Chọn "Nhãn mã Container (#nhan-container)" và đổi sang định dạng "Vector (SVG)". 2) Chọn "Tán cây đạo cụ (#tan-cay)" và đổi định dạng xuất từ "JPG (Nền trắng)" sang "PNG (Nền trong suốt)".',
      robot: { id: 'rb-cau', loai: 'cau', x: 185, y: 255, nhan: 'Cần cẩu (read_code)', dichX: 185, dichY: 255 },
      nguoiCanCuu: { id: 'ng-5', x: 525, y: 265, duoiNuoc: false, nhan: 'Thủy thủ Cảng G4', dichX: 690, dichY: 265 },
      tramCuuHo: { x: 690, y: 265, nhan: 'CẢNG SÔNG G4' },
      camBien: { ten: 'read_code() & look()', tuX: 185, tuY: 220, denObjId: 'nhan-container' },
      stateBanDau: {
        selectedId: 'nhan-container',
        objects: [
          {
            id: 'nhan-container',
            ten: 'Nhãn mã Container #42',
            loai: 'containerBadge',
            x: 285,
            y: 230,
            w: 110,
            h: 74,
            codeText: '42',
            format: 'bitmap-low', // 'bitmap-low' | 'vector-svg'
            editable: ['vectorFormat']
          },
          {
            id: 'tan-cay',
            ten: 'Tán cây cổ thụ (#tan-cay)',
            loai: 'treeOverlay',
            x: 465,
            y: 175,
            w: 125,
            h: 125,
            imageFormat: 'jpg', // 'jpg' (opaque white bg) | 'png' (transparent alpha)
            editable: ['imageFormat']
          }
        ]
      },
      kiemDoHoa: function (state) {
        var nhan = state.objects.find(function (o) { return o.id === 'nhan-container'; });
        var cay = state.objects.find(function (o) { return o.id === 'tan-cay'; });
        var laVector = nhan && nhan.format === 'vector-svg';
        var laPng = cay && cay.imageFormat === 'png';
        return [
          { ok: laVector, txt: 'Đã chuyển nhãn mã Container #42 sang định dạng Vector (SVG) không vỡ hạt khi phóng đại' },
          { ok: laPng, txt: 'Đã chuyển tán cây đạo cụ sang định dạng PNG có nền trong suốt (loại bỏ khung trắng của JPG)' }
        ];
      },
      apDungGoiY: function (state) {
        var nhan = state.objects.find(function (o) { return o.id === 'nhan-container'; });
        var cay = state.objects.find(function (o) { return o.id === 'tan-cay'; });
        if (nhan) nhan.format = 'vector-svg';
        if (cay) cay.imageFormat = 'png';
      }
    },

    /* =========================================================================
     * MÀN 6 (LỚP 11): HỆ MÀU ÁNH SÁNG RGB, ĐỘ SÁNG & ĐỘ TƯƠNG PHẢN
     * Bối cảnh Mùa 9: G1 Kho hàng — Drone đọc vạch màu Vàng để rắc cát lên bùn trơn
     * ========================================================================= */
    {
      id: 'G11-01',
      so: 6,
      lop: 11,
      ten: 'Pha Sáng RGB & Cứu Vạch Màu Chìm Tối',
      boiCanh: 'Gói 6 Nông trại (cuu-nong-trai.2) · Drone nông nghiệp (R1) + Xe cứu hỏa bánh xích (R2)',
      congCuChinh: 'Pha kênh màu RGB (0..255), Độ sáng (Brightness) & Độ tương phản (Contrast)',
      thoaiMoDau: {
        sola: 'Tại Nông trại G6, Xe bánh xích (R2) đã ủi thùng nặng H(3,3) đè nút M(4,3) mở cổng nhà kính C(2,2) cho Drone nông nghiệp (R1) bay vào gieo hoa vàng span_sow("yellow", 2). Mà sao Camera của Drone cứ báo color() == "red" thế?',
        luna: 'Màu Vàng ánh sáng là kết hợp của Đỏ (R=255) và Lục (G=255), nhưng cậu đang để kênh Lục G = 20 nên ô mẫu ở (3..4, 2) thành màu Đỏ chứ sao! Đèn nhà kính cũng đang quá tối, mau chỉnh lại kênh RGB và tăng Độ sáng/Tương phản lên!'
      },
      thoaiLoi: 'Camera 4 hướng của Drone báo lỗi: Ô mẫu hoa chưa đạt màu Vàng chuẩn RGB(255, 255, 0) hoặc Độ sáng / Độ tương phản của nhà kính còn thấp (< 100%)!',
      thoaiThang: 'Ánh sáng chuẩn xác! Camera Drone nhận diện ngay mẫu hoa Vàng RGB(255, 255, 0), gieo nở rộ 2 luống hoa vàng tại Ô(3..4, 2) và mở đường cho Xe bánh xích về đích!',
      sgk: {
        bai: 'Tin học 10 & Tin học 11 Ứng dụng (Bài 107): Hệ màu cộng RGB, Độ sáng và Độ tương phản',
        noiDung: 'Màn hình máy tính biểu diễn màu theo hệ RGB (Red, Green, Blue), mỗi kênh 8 bit (0..255). Đỏ (255,0,0) + Lục (0,255,0) = Vàng (255,255,0). Tăng Độ sáng (Brightness) và Tương phản (Contrast) giúp tách bạch chủ thể khỏi nền tối.'
      },
      goiY: '1) Chọn "Ô đèn hiệu dẫn đường (#den-vang)". 2) Kéo kênh Red (R) >= 230, Green (G) >= 230, Blue (B) <= 30 để tạo màu Vàng. 3) Kéo Độ sáng (Brightness) >= 100% và Độ tương phản (Contrast) >= 105%.',
      robot: { id: 'rb-drone', loai: 'drone', x: 130, y: 195, nhan: 'Drone nông nghiệp (color)', dichX: 365, dichY: 195 },
      nguoiCanCuu: { id: 'ng-6', x: 545, y: 265, duoiNuoc: false, nhan: 'Nông dân G6', dichX: 690, dichY: 265 },
      tramCuuHo: { x: 690, y: 265, nhan: 'NÔNG TRẠI G6' },
      camBien: { ten: 'color() == "yellow"', tuX: 130, tuY: 195, denObjId: 'den-vang' },
      stateBanDau: {
        selectedId: 'den-vang',
        objects: [
          {
            id: 'den-vang',
            ten: 'Ô đèn hiệu dẫn đường (#den-vang)',
            loai: 'rgbPad',
            x: 330,
            y: 235,
            w: 96,
            h: 64,
            r: 255,
            g: 20,
            b: 20,
            brightness: 60,
            contrast: 75,
            editable: ['rgb', 'brightnessContrast']
          }
        ]
      },
      kiemDoHoa: function (state) {
        var den = state.objects.find(function (o) { return o.id === 'den-vang'; });
        var dungMauVang = den && den.r >= 220 && den.g >= 220 && den.b <= 40;
        var duSang = den && den.brightness >= 95 && den.contrast >= 100;
        return [
          { ok: dungMauVang, txt: 'Đã pha đúng kênh màu Vàng ánh sáng: R >= 220, G >= 220, B <= 40' },
          { ok: duSang, txt: 'Đã chỉnh Độ sáng (Brightness >= 95%) và Độ tương phản (Contrast >= 100%) rõ nét' }
        ];
      },
      apDungGoiY: function (state) {
        var den = state.objects.find(function (o) { return o.id === 'den-vang'; });
        if (den) {
          den.r = 255;
          den.g = 255;
          den.b = 0;
          den.brightness = 110;
          den.contrast = 115;
        }
      }
    },

    /* =========================================================================
     * MÀN 7 (LỚP 11): THỨ TỰ LỚP (LAYER STACK) & MẶT NẠ LỚP (LAYER MASK)
     * Bối cảnh Mùa 9: G5 Bến sông — Đưa Lớp Thảm Cát lên trên Bùn & Mở Mặt nạ Sương mù
     * ========================================================================= */
    {
      id: 'G11-02',
      so: 7,
      lop: 11,
      ten: 'Đảo Thứ Tự Lớp Cảnh & Vén Màn Sương Bằng Mặt Nạ Lớp',
      boiCanh: 'Gói 1 Kho hàng (cuu-kho-hang.1) · Xe kho hai bánh (R1) + Drone rắc cát (R2)',
      congCuChinh: 'Sắp xếp Thứ tự Lớp (Layer Z-Order) & Mặt nạ lớp không phá hủy (Layer Mask)',
      thoaiMoDau: {
        sola: 'Tại Kho hàng G1, Drone (R2) đã thả Lớp Thảm Cát chống trơn rồi mà sao trên sàn kho Ô(2..3, 3) vẫn toàn là Bùn trơn làm Xe chở hàng (R1) trượt bánh? Lại còn Lớp Sương Mù che khuất nút bấm M(5,3), tớ xóa phăng Lớp Sương Mù đi nhé?',
        luna: 'Đừng xóa! Xóa Lớp Sương Mù là mất dữ liệu gốc của cảnh! Cậu chỉ cần kéo Lớp Thảm Cát lên nằm TRÊN Lớp Bùn Trơn trong bảng Layers, rồi dùng Cọ Mặt Nạ Lớp (Layer Mask) tô màu Đen vào vùng Ô(5,3) để mở tầm nhìn cho Xe chở hàng đặt kiện hàng lên nút M(5,3) thôi!'
      },
      thoaiLoi: 'Lớp "Thảm Cát Chống Trơn" vẫn đang nằm dưới Lớp "Bùn Trơn", hoặc Mặt nạ lớp (Layer Mask) của "Sương Mù" chưa được tô Đen để mở tầm nhìn tại nút M(5,3)!',
      thoaiThang: 'Xử lý Layer hoàn hảo! Thảm cát của Drone đã phủ lên bùn trơn và Mặt nạ lớp màu Đen đã vén màn sương đúng chỗ mà không làm hỏng dữ liệu gốc. Xe chở hàng (R1) gắp kiện hàng mở cổng kho an toàn!',
      sgk: {
        bai: 'Tin học 11 Ứng dụng (Bài 106 & 108): Quản lý Lớp ảnh (Layers) và Mặt nạ lớp (Layer Mask)',
        noiDung: 'Các lớp ảnh xếp chồng lên nhau: lớp ở trên che lớp ở dưới. Mặt nạ lớp (Layer Mask) giúp ẩn/hiện một vùng ảnh mà không xóa mất điểm ảnh gốc: tô màu Đen làm ẩn vùng đó (nhìn xuyên qua), tô màu Trắng làm hiện lại.'
      },
      goiY: '1) Ở bảng Lớp (Layers) bên phải, bấm nút đưa lớp "Thảm Cát Chống Trơn" lên nằm TRÊN lớp "Bùn Trơn Sau Bão". 2) Bấm nút "Tô Đen Mặt Nạ (Mở vùng nhìn xuyên sương mù)" trên lớp Sương Mù.',
      robot: { id: 'rb-xe-kho', loai: 'hai-banh', x: 115, y: 265, nhan: 'Xe kho hai bánh (R1)', dichX: 330, dichY: 265 },
      nguoiCanCuu: { id: 'ng-7', x: 505, y: 265, duoiNuoc: false, nhan: 'Thủ kho G1', dichX: 690, dichY: 265 },
      tramCuuHo: { x: 690, y: 265, nhan: 'KHO HÀNG G1' },
      camBien: { ten: 'front_clear() & mask()', tuX: 115, tuY: 265, denObjId: 'layer-stack' },
      stateBanDau: {
        selectedId: 'layer-suong-mu',
        layers: [
          { id: 'layer-suong-mu', ten: 'Lớp Sương Mù Sân Khấu', visible: true, maskCleared: false, loai: 'fog' },
          { id: 'layer-bun-tron', ten: 'Lớp Bùn Trơn Sau Bão', visible: true, loai: 'mud' },
          { id: 'layer-tham-cat', ten: 'Lớp Thảm Cát Chống Trơn', visible: true, loai: 'sand' }
        ],
        objects: []
      },
      kiemDoHoa: function (state) {
        var idxCat = state.layers.findIndex(function (l) { return l.id === 'layer-tham-cat'; });
        var idxBun = state.layers.findIndex(function (l) { return l.id === 'layer-bun-tron'; });
        var suong = state.layers.find(function (l) { return l.id === 'layer-suong-mu'; });
        var catTrenBun = idxCat !== -1 && idxBun !== -1 && idxCat < idxBun;
        var giuSuongMu = !!(suong && suong.visible);
        var daMoMask = !!(suong && suong.maskCleared);
        return [
          { ok: catTrenBun, txt: 'Đã xếp Lớp "Thảm Cát Chống Trơn" nằm TRÊN Lớp "Bùn Trơn Sau Bão"' },
          { ok: giuSuongMu, txt: 'Không tắt/xóa mất Lớp Sương Mù của sân khấu (vẫn bật con mắt hiển thị)' },
          { ok: daMoMask, txt: 'Đã tô Màu Đen lên Mặt nạ lớp (Layer Mask) của Sương Mù để mở vùng nhìn xuyên thấu' }
        ];
      },
      apDungGoiY: function (state) {
        state.layers = [
          { id: 'layer-suong-mu', ten: 'Lớp Sương Mù Sân Khấu', visible: true, maskCleared: true, loai: 'fog' },
          { id: 'layer-tham-cat', ten: 'Lớp Thảm Cát Chống Trơn', visible: true, loai: 'sand' },
          { id: 'layer-bun-tron', ten: 'Lớp Bùn Trơn Sau Bão', visible: true, loai: 'mud' }
        ];
      }
    },

    /* =========================================================================
     * MÀN 8 (LỚP 11): DÒNG THỜI GIAN PHIM (TIMELINE CLIPS & ĐỒNG BỘ ÂM THANH)
     * Bối cảnh Mùa 9: G10 Ngày hội — Đồng bộ Nhịp Thả Phao & Song Ca Tổng Kết
     * ========================================================================= */
    {
      id: 'G11-03',
      so: 8,
      lop: 11,
      ten: 'Đạo Diễn Dòng Thời Gian: Bè Cứu Hộ & Chuông Đá Song Ca',
      boiCanh: 'Gói 10 Ngày hội Song ca (ngay-hoi-clb.2) · Xe bánh gai gắn Loa (R1) + Xuồng thủy lợi (R2)',
      congCuChinh: 'Dòng thời gian (Timeline Clips), Khung hình chính (Keyframes) & Đồng bộ Âm thanh',
      thoaiMoDau: {
        sola: 'Đến tiết mục Hợp tấu Song ca G10 rồi! Xuồng thủy lợi (R2) ở kênh nước dưới cần kéo bè gỗ tới Ô(3,3) đúng Nhịp 4, rồi Xe bánh gai gắn Loa (R1) ở hành lang trên hòa âm với chuông đá nốt 5 ở Nhịp 7. Mà sao bè cứu hộ tận Nhịp 8 mới trôi tới, còn nhạc đệm thì chạy lệch phách thế này?',
        luna: 'Trên thanh Timeline dựng phim, cậu đặt Clip "Bè Cứu Hộ" ở Nhịp 8 thì trễ mất nhịp mở cửa kênh nước rồi! Mau kéo Clip "Bè Cứu Hộ" về đúng Nhịp 4, kéo Clip "Nhạc Đệm Song Ca" khớp Nhịp 7 và bật Phụ đề ghi nguồn CC-BY nhé!'
      },
      thoaiLoi: 'Lệch nhịp Timeline: Clip "Bè Cứu Hộ" của Xuồng phải bắt đầu ở Nhịp 4, Clip "Nhạc Đệm Song Ca" của Bánh gai Loa phải khớp Nhịp 7 và phải bật Phụ đề & Nguồn nhạc!',
      thoaiThang: 'Đồng bộ tuyệt hảo! Đúng Nhịp 4 Xuồng kéo bè gỗ vào Ô(3,3) kích hoạt chuông đá nốt 3, và đúng Nhịp 7 Bánh gai Loa ngân vang nốt 5 mở cổng sân khấu Song ca!',
      sgk: {
        bai: 'Tin học 11 Ứng dụng (Bài 110, 111 & 112): Ảnh động, Dòng thời gian (Timeline) và Biên tập phim',
        noiDung: 'Trên dòng thời gian (Timeline), các lớp hình ảnh, hiệu ứng chuyển cảnh và âm thanh phải được căn chỉnh đồng bộ theo mốc thời gian (nhịp/giây). Video truyền thông hoàn chỉnh cần có phụ đề (để hiểu khi tắt tiếng) và ghi rõ nguồn bản quyền.'
      },
      goiY: '1) Kéo mốc bắt đầu của "Clip Bè Cứu Hộ" về đúng Nhịp 4. 2) Kéo mốc bắt đầu của "Clip Nhạc Đệm Song Ca" về đúng Nhịp 7. 3) Bật công tắc "Hiển thị Phụ đề & Ghi nguồn bản quyền".',
      robot: { id: 'rb-gai-loa', loai: 'gai', x: 165, y: 265, nhan: 'Bánh gai Loa (honk)', dichX: 410, dichY: 265 },
      nguoiCanCuu: { id: 'ng-8', x: 380, y: 255, duoiNuoc: true, nhan: 'Đội nhạc G10', dichX: 685, dichY: 255 },
      tramCuuHo: { x: 685, y: 255, nhan: 'SÂN KHẤU G10' },
      camBien: { ten: 'sound() @ Nhịp 7', tuX: 165, tuY: 265, denObjId: 'timeline-stage' },
      stateBanDau: {
        selectedId: 'clip-be',
        timeline: {
          beCuuHoTick: 8,
          nhacSongCaTick: 3,
          easing: 'linear',
          coPhuDeNguon: false
        },
        objects: []
      },
      kiemDoHoa: function (state) {
        var tl = state.timeline || {};
        var dungNhipBe = Number(tl.beCuuHoTick) === 4;
        var dungNhipNhac = Number(tl.nhacSongCaTick) === 7;
        var coPhuDe = !!tl.coPhuDeNguon;
        return [
          { ok: dungNhipBe, txt: 'Đã kéo Clip "Bè Cứu Hộ" về đúng Nhịp 4 (khớp lúc Xuồng kéo bè vào Ô 3,3)' },
          { ok: dungNhipNhac, txt: 'Đã đồng bộ Clip "Nhạc Đệm & Chuông Đá Song Ca" vào đúng Nhịp 7' },
          { ok: coPhuDe, txt: 'Đã bật Phụ đề và Ghi nguồn bản quyền âm thanh trên video sân khấu' }
        ];
      },
      apDungGoiY: function (state) {
        state.timeline.beCuuHoTick = 4;
        state.timeline.nhacSongCaTick = 7;
        state.timeline.coPhuDeNguon = true;
      }
    },

    /* =========================================================================
     * MÀN 9 (LỚP 12): MÔ HÌNH HỘP CSS (BOX MODEL), FLEXBOX & ĐỘ TƯƠNG PHẢN WEB
     * Bối cảnh Mùa 9: G9/G10 — Sửa Bảng Điều Khiển Web của Ngày Hội Tin Học
     * ========================================================================= */
    {
      id: 'G12-01',
      so: 9,
      lop: 12,
      ten: 'Giải Cứu Giao Diện Web Điều Phối Đội Robot',
      boiCanh: 'Gói 9 Khuôn viên CLB (cuu-clb.1) · Xe bánh xích Nhà máy (R1) + Nhện từ tính (R2)',
      congCuChinh: 'Mô hình Hộp CSS (Padding, Margin, Gap), Flexbox Wrap & Độ tương phản màu chữ',
      thoaiMoDau: {
        sola: 'Tại Cổng chính Khuôn viên CLB G9, Xe bánh xích (R1) cần bắn hơi vào van N(4,1) và Nhện từ tính (R2) cần kéo lõi sắt đè nút M(4,3) để mở đôi cửa C(5,2), C(5,3). Nhưng Bảng Điều Phối Web CSS đang bị tràn khung (nowrap) đè kín lên van N(4,1), còn nút kích hoạt thì chữ chìm nghỉm vào nền!',
        luna: 'Đó là lỗi CSS Mô hình hộp và Flexbox lớp 12 đấy! Cậu phải bật flex-wrap: wrap để các thẻ Robot tự xuống dòng không đè lên van N(4,1), tăng Padding/Gap >= 12px cho thoáng, và đổi nút sang bảng màu Tương phản cao (High Contrast)!'
      },
      thoaiLoi: 'Giao diện Web vẫn bị tràn khung đè lên van N(4,1) (chưa bật flex-wrap: wrap), khoảng cách Padding/Gap còn bằng 0, hoặc nút bấm chưa đạt độ tương phản màu (Contrast)!',
      thoaiThang: 'Hoàn hảo 10/10! Giao diện Web Điều Phối đã thu gọn chuẩn xác, Xe bánh xích bắn van N(4,1) và Nhện từ tính kích hoạt nút M(4,3) mở toang cổng chính CLB Sáng Tạo!',
      sgk: {
        bai: 'Tin học 12 (Bài 082, 083, 085 & 119): CSS Mô hình hộp (Box Model), Bố cục & Khả năng tiếp cận',
        noiDung: 'Mô hình hộp (CSS Box Model) gồm: Nội dung (Content) -> Vùng đệm (Padding) -> Đường viền (Border) -> Lề ngoài (Margin). Thuộc tính flex-wrap: wrap giúp các khối tự động xuống dòng trên màn hình điện thoại; màu chữ và màu nền phải có độ tương phản cao để dễ đọc.'
      },
      goiY: '1) Đổi Flex Wrap từ "nowrap (Tràn khung)" sang "wrap (Tự xuống dòng)". 2) Kéo Padding >= 12px và Khoảng cách Gap >= 12px. 3) Chọn bảng màu nút bấm "Tương phản cao (Chữ trắng trên nền Xanh đậm)".',
      robot: { id: 'rb-all', loai: 'xich', x: 115, y: 270, nhan: 'Xe xích & Nhện từ tính', dichX: 400, dichY: 270 },
      nguoiCanCuu: { id: 'ng-9', x: 540, y: 265, duoiNuoc: false, nhan: 'Thầy giáo & CLB G9', dichX: 685, dichY: 265 },
      tramCuuHo: { x: 685, y: 265, nhan: 'CỔNG CLB G9' },
      camBien: { ten: 'CSS Inspector', tuX: 115, tuY: 270, denObjId: 'css-web-stage' },
      stateBanDau: {
        selectedId: 'css-web-stage',
        cssBox: {
          flexWrap: 'nowrap', // 'nowrap' | 'wrap'
          padding: 0,
          gap: 0,
          buttonTheme: 'low-contrast' // 'low-contrast' | 'high-contrast'
        },
        objects: []
      },
      kiemDoHoa: function (state) {
        var c = state.cssBox || {};
        var daWrap = c.flexWrap === 'wrap';
        var duPaddingGap = Number(c.padding) >= 10 && Number(c.gap) >= 10;
        var tuongPhanCao = c.buttonTheme === 'high-contrast';
        return [
          { ok: daWrap, txt: 'Đã bật flex-wrap: wrap để các thẻ đội Robot không tràn khỏi màn hình hẹp' },
          { ok: duPaddingGap, txt: 'Đã thiết lập vùng đệm Padding >= 10px và khoảng cách Gap >= 10px (CSS Box Model)' },
          { ok: tuongPhanCao, txt: 'Đã chỉnh màu chữ và màu nền nút bấm có Độ tương phản cao (Contrast chuẩn WCAG)' }
        ];
      },
      apDungGoiY: function (state) {
        state.cssBox.flexWrap = 'wrap';
        state.cssBox.padding = 14;
        state.cssBox.gap = 14;
        state.cssBox.buttonTheme = 'high-contrast';
      }
    }
  ];

  var API = {
    MAN_CHOI: MAN_CHOI,
    cloneState: cloneState
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  if (typeof window !== 'undefined') window.ManChoi = API;
})();
