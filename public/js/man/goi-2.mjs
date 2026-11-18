// Gói 2, bài C10-10: logo vector nhiều mảnh. Thứ tự lớp, nhóm, căn hàng.
import { canhBanTin, logoTheoLop, canhStandee } from '../canh.mjs';
import { MAU } from '../hinh.mjs';

const CHUNG = { x: 60, y: 30, s: 2.4 };
const manhLogo = (ids) => ids.map((id) => ({ id, ...CHUNG, nhom: 0 }));

const gocCum = { x: 40, y: 18, s: 1.4 };
const IDS = ['nen', 'vong', 'dai', 'sao', 'chu'];

export default {
  id: 'goi-2',
  ten: 'Ghép logo CLB',
  baiHoc: 'C10-10',
  mo: 'Logo vector là nhiều mảnh chồng lên nhau. Mảnh nào nằm trên, mảnh nào đi cùng nhau.',
  loiMo: { ai: 'luna', mat: 'wave', cau: 'Logo CLB vẽ bằng năm mảnh. Bạn sẽ thấy chữ bị che khi xếp sai lớp, và logo rơi rụng khi quên nhóm.' },
  man: [
    {
      ma: 'DH-2-1', ten: 'Chữ bị che', coKhi: 'lop-nhom', chay: 'In thử',
      ai: 'sola', mat: 'shocked', vai: 'SOLA NHỜ',
      nho: 'Mình mở tệp logo ra, chữ TIN HỌC với ngôi sao biến đâu mất rồi. Mảnh nền nó đè hết lên!',
      muc: 'Xếp lại thứ tự lớp để thấy đủ cả năm mảnh.',
      dau: { manh: manhLogo(['chu', 'sao', 'dai', 'vong', 'nen']), chon: ['nen'] },
      san: { nen: 'poster', cu: ['lop'], khoaKeo: true },
      sanNhan: 'Logo năm mảnh, mảnh nền đang đè lên trên',
      phaiTren: [['chu', 'dai'], ['chu', 'nen'], ['dai', 'nen'], ['sao', 'nen'], ['vong', 'nen'], ['dai', 'vong'], ['sao', 'vong']],
      dan: [
        { txt: 'Kéo thẻ <b>Nền tròn</b> về tận cùng bên trái: đó là lớp dưới cùng.', nhan: 'm-nen', xong: (d) => d.nenDay },
        { txt: 'Thẻ bên phải đè thẻ bên trái. Kéo tiếp các thẻ khác cho đủ năm mảnh hiện ra.', xong: (d) => d.saiThuTu.length === 0 },
        { txt: 'Đủ năm mảnh rồi, bấm <b>In thử</b>.', xong: () => false },
      ],
      tieuChi: [
        { id: 'thuTu', ok: (d) => d.saiThuTu.length === 0, ten: 'Thấy đủ năm mảnh', loi: 'In ra vẫn có mảnh bị che: dải tên phải đè lên vòng trong, chữ phải đè lên dải tên, sao phải đè lên vòng.', ai: 'sola', matLoi: 'worried' },
      ],
      goiY: [
        'Hình ảnh trên sân được vẽ từ trái sang phải của hàng thẻ. Mảnh vẽ sau đè mảnh vẽ trước.',
        'Mảnh to nhất phải vẽ đầu tiên, nên nó nằm tận cùng bên trái hàng.',
        'Chữ nằm trên dải tên, dải tên nằm trên vòng trong, vòng trong nằm trên nền. Sao nằm trên vòng.',
      ],
      soTay: ['lop', 'vector'],
      canh: (st) => canhBanTin(`<rect x="20" y="10" width="320" height="280" rx="8" fill="url(#gr-poster)"/>${logoTheoLop(st)}`),
      giai(st) {
        st.manh = ['nen', 'vong', 'dai', 'sao', 'chu'].map((id) => st.manh.find((m) => m.id === id));
      },
      sai: [
        { ten: 'Chỉ đưa nền xuống đáy', loi: 'thuTu', lam(st) { const n = st.manh.pop(); st.manh.unshift(n); } },
        { ten: 'Dải tên nằm trên chữ', loi: 'thuTu', lam(st) { st.manh = ['nen', 'vong', 'chu', 'sao', 'dai'].map((id) => st.manh.find((m) => m.id === id)); } },
      ],
    },
    {
      ma: 'DH-2-2', ten: 'Logo rời từng mảnh', coKhi: 'lop-nhom', chay: 'In thử',
      ai: 'sola', mat: 'facepalm', vai: 'SOLA NHỜ',
      nho: 'Mình kéo logo sang góc poster, chỉ mỗi hình tròn nền chạy theo, ngôi sao với chữ nằm lại chỗ cũ. Kéo tiếp thì lệch hết cả.',
      muc: 'Đưa nguyên logo vào khung vàng ở góc, tiêu đề giữ nguyên chỗ cũ.',
      dau: {
        manh: [
          { id: 'tieu-de', x: 55, y: 178, s: 1.25, nhom: 0 },
          ...IDS.map((id) => ({ id, ...gocCum, nhom: 0 })),
        ], chon: [],
      },
      san: { nen: 'poster', cu: ['nhom', 'coCum'], vung: { x: 222, y: 24, w: 104, h: 104, ten: 'Góc logo' } },
      sanNhan: 'Poster có logo năm mảnh, tiêu đề và khung vàng ở góc phải',
      cumLogo: { goc: Object.fromEntries(IDS.map((id) => [id, gocCum])), tieuDe: { x: 55, y: 178 } },
      dan: [
        { txt: 'Kéo trên nền một khung <b>quét qua cả logo</b> để chọn năm mảnh. Đừng quét trúng Tiêu đề.', xong: (_d, st) => (st.chon || []).filter((k) => k !== 'tieu-de').length === 5 || st.manh.some((m) => m.nhom) },
        { txt: 'Bấm <b>Nhóm</b> để năm mảnh đi cùng nhau.', nhan: 'nhom', xong: (d) => d.cungNhom },
        { txt: 'Kéo <b>chấm tròn ở góc</b> để thu nhỏ cả cụm. Gần vừa khung nó tự hít.', xong: (d) => d.phu <= 1.03 },
        { txt: 'Kéo cụm vào khung vàng. Gần mép khung nó tự hít.', xong: (d) => d.trongVung },
        { txt: 'Bấm <b>In thử</b>.', xong: () => false },
      ],
      tieuChi: [
        { id: 'roi', ok: (d) => d.roi <= 3, ten: 'Logo còn nguyên hình', loi: 'Các mảnh logo lệch khỏi nhau, in ra nền tròn một đằng, sao với chữ một nẻo.', ai: 'sola', matLoi: 'shocked' },
        { id: 'tieu', ok: (d) => d.tieuDeYen, ten: 'Tiêu đề không xê dịch', loi: 'Tiêu đề bị kéo theo hoặc bị nhóm vào logo. Sola bảo tiêu đề phải ở yên.', ai: 'luna', matLoi: 'worried' },
        { id: 'trong', ok: (d) => d.trongVung, ten: 'Nằm trong khung', loi: 'Logo chưa vào hết khung vàng ở góc.', ai: 'luna', matLoi: 'thinking' },
        { id: 'to', ok: (d) => d.phu >= 0.75, ten: 'Đủ to', loi: 'Logo bị thu nhỏ quá tay, khung vàng còn trống nhiều.', ai: 'luna', matLoi: 'thinking' },
        { id: 'nhom', sao: true, ok: (d) => d.cungNhom, ten: 'Năm mảnh cùng một nhóm', chiTiet: () => 'Bạn dời từng mảnh mà chưa bấm lệnh Nhóm cho 5 mảnh logo' },
        { id: 'kin', sao: true, ok: (d) => d.phu >= 0.9, ten: 'Vừa khít khung', chiTiet: (d) => `Cụm logo đang phủ ${Math.round(d.phu * 100)}% khung (cần từ 90%)` },
      ],
      goiY: [
        'Vector giữ từng mảnh riêng, nên kéo là chỉ một mảnh đi. Phải bảo máy rằng chúng đi cùng nhau.',
        'Quét khung trên nền qua cả logo, rồi Nhóm. Sau đó chạm mảnh nào cũng kéo được cả cụm.',
        'Thu nhỏ trước rồi kéo vào khung thì dễ hơn. Nếu lỡ nhóm cả Tiêu đề, bấm Rã nhóm làm lại.',
      ],
      soTay: ['nhom', 'lop'],
      canh: (st, ket) => canhBanTin(`<rect x="20" y="10" width="320" height="280" rx="8" fill="url(#gr-poster)"/>${logoTheoLop(st, ket.loi?.id === 'roi')}`),
      giai(st, l) {
        l.nhom(st, IDS);
        l.coCum(st, 'nen', 0.72);
        l.di(st, 'nen', 183, 7);
      },
      sai: [
        { ten: 'Chỉ kéo hình tròn nền', loi: 'roi', lam(st, l) { l.di(st, 'nen', 180, 10); } },
        { ten: 'Nhóm cả tiêu đề', loi: 'tieu', lam(st, l) { l.nhom(st, [...IDS, 'tieu-de']); l.coCum(st, 'nen', 0.4); l.di(st, 'nen', 183, 7); } },
      ],
    },
    {
      ma: 'DH-2-4', ten: 'Đôi standee chào khách', coKhi: 'lop-nhom', chay: 'Dựng standee',
      ai: 'sola', mat: 'worried', vai: 'SOLA NHỜ',
      nho: 'Cổng vào gian Rô bốt cần hai tấm standee đứng hai bên chỉ tay mời khách. Mình làm xong tấm bên trái là hết giờ, chẳng lẽ bên phải lại ngồi vẽ từ đầu?',
      muc: 'Nhân đôi standee bên trái, lật ngang cho mũi tên chỉ vào giữa rồi đặt khớp khung bên phải.',
      dau: {
        manh: [{ id: 'standee-trai', loai: 'standee', x: 24, y: 104, s: 1.05, lat: false, nhom: 0 }],
        chon: ['standee-trai'],
      },
      san: { nen: 'sanh-standee', cu: ['lat', 'coCum'], vung: { x: 241, y: 111, w: 95, h: 129, ten: 'Standee phải' } },
      doiXung: { trai: { x: 24, y: 104, s: 1.05 } },
      sanNhan: 'Cổng gian Rô bốt mới có standee chào khách bên trái, bên phải còn trống',
      dan: [
        { txt: 'Standee bên trái đang chọn. Bấm <b>Nhân đôi</b> để tạo tấm thứ hai giống hệt bản gốc.', nhan: 'nhan-doi', xong: (d) => d.soStandee >= 2 },
        { txt: 'Bấm <b>Lật ngang</b> để rô bốt bên phải quay tay cầm mũi tên chỉ vào gian hàng.', nhan: 'lat-ngang', xong: (d) => d.daLatPhai },
        { txt: 'Kéo standee mới vào khung <b>Standee phải</b>. Gần ngang hàng và đối xứng nó tự hít.', xong: (d) => d.phaiTrong && d.traiDung },
        { txt: 'Bấm <b>Dựng standee</b>.', xong: () => false },
      ],
      tieuChi: [
        { id: 'duHai', ok: (d) => d.soStandee === 2, ten: 'Đủ hai tấm standee hai bên', loi: 'Cổng gian hàng mới có một standee hoặc còn dư bản sao thừa chưa xóa.', ai: 'sola', matLoi: 'confused' },
        { id: 'traiYen', ok: (d) => d.traiDung, ten: 'Standee trái giữ đúng chỗ', loi: 'Tấm standee gốc bên trái bị kéo lệch đi hoặc bị lật ngược mũi tên ra ngoài.', ai: 'luna', matLoi: 'worried' },
        { id: 'doiXung', ok: (d) => d.daLatPhai, ten: 'Hai mũi tên cùng chỉ vào cổng', loi: 'Standee bên phải chưa lật ngang nên rô bốt quay tay chỉ khách đi ra ngoài mất rồi!', ai: 'sola', matLoi: 'facepalm' },
        { id: 'trongPhai', ok: (d) => d.phaiTrong && d.cungCoStandee, ten: 'Đặt gọn khung phải, bằng cỡ nhau', loi: 'Standee phải chưa vào gọn khung hoặc bị đổi lệch kích cỡ so với tấm bên trái.', ai: 'luna', matLoi: 'thinking' },
        { id: 'ngangHang', sao: true, ok: (d) => d.lechCao <= 3, ten: 'Hai chân đế ngang hàng nhau', chiTiet: (d) => `Độ cao hai tấm đang lệch ${Math.round(d.lechCao)} đơn vị (kéo cho đường hồng ngang hiện ra)` },
        { id: 'canTam', sao: true, ok: (d) => d.lechTruc <= 3, ten: 'Đối xứng chuẩn qua cổng gian hàng', chiTiet: (d) => `Độ đối xứng qua cổng đang lệch ${Math.round(d.lechTruc)} đơn vị (kéo hít giữa khung phải)` },
      ],
      goiY: [
        'Đừng vẽ lại hay kéo đổi cỡ bằng tay: lệnh Nhân đôi tạo ra tấm standee bằng hệt bên trái.',
        'Nhân đôi xong thì hai mũi tên đều chỉ sang phải. Bấm Lật ngang để tấm mới quay mũi tên vào cổng giữa.',
        'Giữ yên tấm bên trái, kéo tấm đã lật vào khung bên phải tới khi đường hồng hiện lên.',
      ],
      soTay: ['nhan-ban-lat', 'can-hang'],
      canh: (st, ket) => canhStandee(st, ket.dat),
      giai(st, l) {
        const m = l.nhanDoi(st, 'standee-trai');
        l.latNgang(st, m);
        l.di(st, m, 241.5 - 52, 104 - 114);
      },
      sai: [
        { ten: 'Chưa nhân đôi', loi: 'duHai', lam() {} },
        { ten: 'Dời mất standee gốc bên trái', loi: 'traiYen', lam(st, l) { const m = l.nhanDoi(st, 'standee-trai'); l.di(st, 'standee-trai', 110, 0); l.latNgang(st, m); } },
        { ten: 'Nhân đôi mà quên lật ngang', loi: 'doiXung', lam(st, l) { const m = l.nhanDoi(st, 'standee-trai'); l.di(st, m, 189.5, -10); } },
        { ten: 'Đã lật mà chưa đưa vào khung phải', loi: 'trongPhai', lam(st, l) { const m = l.nhanDoi(st, 'standee-trai'); l.latNgang(st, m); } },
      ],
    },
    {
      ma: 'DH-2-3', ten: 'Năm biểu tượng lởm chởm', coKhi: 'lop-nhom', chay: 'Dán thử', thuThach: true,
      ai: 'luna', mat: 'worried', vai: 'LUNA NHỜ',
      nho: 'Năm biểu tượng nằm lên xuống, to nhỏ đủ kiểu, biểu tượng Lập trình nhanh còn đứng sau poster.',
      muc: 'Cùng cỡ, thẳng hàng, cách đều trong khung vàng. Thứ tự: lập trình, poster, an toàn mạng, phim, rô bốt.',
      dau: {
        manh: [
          { id: 'hd2', x: 16, y: 100, s: 0.5, nhom: 0 },
          { id: 'hd1', x: 92, y: 70, s: 0.72, nhom: 0 },
          { id: 'hd3', x: 172, y: 148, s: 0.56, nhom: 0 },
          { id: 'hd4', x: 232, y: 86, s: 0.66, nhom: 0 },
          { id: 'hd5', x: 318, y: 120, s: 0.6, nhom: 0 },
        ], chon: [],
      },
      san: { nen: 'bang', cu: ['can'], vung: { x: 14, y: 66, w: 332, h: 150, ten: '' } },
      sanNhan: 'Bảng tin có năm biểu tượng so le',
      hang: ['hd1', 'hd2', 'hd3', 'hd4', 'hd5'],
      dan: [
        { txt: 'Kéo cho đúng thứ tự, hình nào thò ra thì kéo vào khung. Đường hồng hiện là đã hít thẳng hàng hoặc cách đều.', xong: (d) => d.dungThu && d.trongVung },
        { txt: 'Chạm một hình rồi kéo <b>chấm góc</b>: cỡ gần bằng hình khác thì tự hít. Hoặc quét khung (trên máy tính: giữ Shift hay Ctrl rồi bấm từng hình) chọn cả năm rồi bấm <b>Cùng cỡ</b>.', nhan: 'cungco', xong: (d) => d.lechCo <= 0.03 },
        { txt: 'Cho thẳng hàng và cách đều bằng tay hoặc bằng lệnh. Lệnh <b>Cách đều</b> giữ yên hai hình ngoài cùng.', xong: (d) => d.lechHang <= 3 && d.lechHo <= 3 && !d.hoAm },
        { txt: 'Bấm <b>Dán thử</b>.', xong: () => false },
      ],
      tieuChi: [
        { id: 'trong', ok: (d) => d.trongVung, ten: 'Trong khung', loi: 'Có biểu tượng thò khỏi khung vàng, tờ in sẽ cắt mất.', ai: 'luna', matLoi: 'worried' },
        { id: 'co', ok: (d) => d.lechCo <= 0.03, ten: 'Cùng cỡ', loi: 'Biểu tượng to nhỏ khác nhau, nhìn như hoạt động này quan trọng hơn hoạt động kia.', ai: 'sola', matLoi: 'confused' },
        { id: 'hang', ok: (d) => d.lechHang <= 3, ten: 'Thẳng hàng', loi: 'Năm biểu tượng vẫn nhấp nhô, kẻ thước vào là thấy lệch.', ai: 'sola', matLoi: 'facepalm' },
        { id: 'deu', ok: (d) => d.lechHo <= 3 && !d.hoAm, ten: 'Cách đều', loi: 'Khoảng hở giữa các biểu tượng không đều nhau, có cái còn đè lên cái khác.', ai: 'luna', matLoi: 'thinking' },
        { id: 'thu', sao: true, ok: (d) => d.dungThu, ten: 'Đúng thứ tự hoạt động', chiTiet: () => 'Thứ tự trái sang phải cần là: lập trình, poster, an toàn mạng, phim, rô bốt' },
        { id: 'min', sao: true, ok: (d) => d.lechHo <= 0.5 && d.lechHang <= 0.5, ten: 'Căn bằng lệnh, sai số gần bằng không', chiTiet: (d) => `Sai số tay đang ${Math.max(d.lechHo, d.lechHang).toFixed(1)} đơn vị (dùng lệnh Căn hàng và Cách đều)` },
      ],
      goiY: [
        'Có một biểu tượng đang thò ra ngoài khung. Lệnh căn hàng giữ nguyên hai đầu, nên phải kéo nó vào trước.',
        'Thứ tự lệnh có ý nghĩa: cùng cỡ làm mọi khoảng hở thay đổi, nên Cách đều phải làm sau Cùng cỡ.',
        'Kéo đổi chỗ hai biểu tượng đầu, quét chọn cả năm, chạm hình làm mẫu, rồi Cùng cỡ, Căn hàng, Cách đều.',
      ],
      soTay: ['can-hang'],
      canh: (st) => canhBanTin(`<rect width="360" height="300" fill="${MAU.trang}"/>${logoTheoLop(st)}`),
      giai(st, l) {
        const ids = st.manh.map((m) => m.id);
        l.di(st, 'hd5', -34, 0);
        l.di(st, 'hd1', -80, 0);
        l.di(st, 'hd2', 80, 0);
        l.cungCo(st, ids);
        l.canGiua(st, ids);
        l.cachDeu(st, ids);
      },
      sai: [
        { ten: 'Chỉ cùng cỡ', loi: 'trong', lam(st, l) { l.cungCo(st, st.manh.map((m) => m.id)); } },
        { ten: 'Cách đều rồi mới cùng cỡ', loi: 'deu', lam(st, l) { const ids = st.manh.map((m) => m.id); l.di(st, 'hd5', -34, 0); l.canGiua(st, ids); l.cachDeu(st, ids); l.cungCo(st, ids); l.canGiua(st, ids); st.manh[1].x += 12; } },
      ],
    },
  ],
};
