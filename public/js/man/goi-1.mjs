// Gói 1, bài C10-09: logo đi in. Biến đổi đúng tỉ lệ và chọn đúng loại ảnh.
import { canhBanTin, posterLen, canhBangRon } from '../canh.mjs';
import { datVao, logoLong, tieuDe } from '../hinh.mjs';

const posterTu = (st) => posterLen(st.vat.map((v) =>
  v.loai === 'tieu-de' ? datVao(tieuDe(), v.x, v.y, v.w, v.h, v.goc, 200, 50) : datVao(logoLong(), v.x, v.y, v.w, v.h, v.goc)).join(''));

export default {
  id: 'goi-1',
  ten: 'Logo đi in',
  baiHoc: 'C10-09',
  mo: 'Kéo cho to mà không méo. Ảnh nào phóng lên băng rôn 3 mét vẫn nét.',
  loiMo: { ai: 'sola', mat: 'worried', cau: 'Năm ngoái băng rôn vỡ ô, tiệm in còn trả lại logo. Năm nay bạn soi giúp mình từ đầu nha.' },
  man: [
    {
      ma: 'DH-1-1', ten: 'Đừng kéo bẹp logo', coKhi: 'bien-doi', chay: 'In thử',
      ai: 'sola', mat: 'confused', vai: 'SOLA NHỜ',
      nho: 'Mình kéo logo cho đầy khung rộng, in ra bẹp dí nên đã trả về cỡ nhỏ.',
      muc: 'Đặt logo to nhất có thể trong khung vàng mà vẫn tròn.',
      dau: { vat: [{ id: 'logo', loai: 'logo', x: 96, y: 244, w: 64, h: 64, goc: 0 }], chon: 'logo', khoa: false },
      san: { nen: 'poster', vung: { logo: { x: 70, y: 40, w: 220, h: 150, ten: 'Khung đặt logo' } }, cu: ['khoa'] },
      sanNhan: 'Poster có khung vàng và logo nhỏ phía dưới',
      dan: [
        { txt: 'Chọn công cụ <b>Đổi cỡ</b>.', nhan: 'cu-co', xong: (d, st, cu) => cu === 'co' || d.logo.phu >= 0.85 },
        { txt: 'Bật <b>Khóa tỉ lệ</b> rồi kéo <b>chấm tròn ở góc</b> cho logo to lên. Gần vừa khung nó tự hít.', nhan: 'khoa', xong: (d, st) => st.khoa && d.logo.phu >= 0.85 },
        { txt: 'Chọn <b>Di chuyển</b>, kéo logo vào giữa khung. Gần tâm nó tự hít, có đường hồng báo hiệu.', nhan: 'cu-chon', xong: (d) => d.logo.lech < 5 },
        { txt: 'Xong rồi thì bấm <b>In thử</b>.', xong: () => false },
      ],
      tieuChi: [
        { id: 'meo', ok: (d) => d.logo.meo <= 0.03, ten: 'Logo còn tròn', loi: 'Logo in ra méo hẳn, vòng tròn thành quả trứng.', ai: 'sola', matLoi: 'shocked' },
        { id: 'trong', ok: (d) => d.logo.trong, ten: 'Nằm trọn trong khung', loi: 'Logo tràn khỏi khung vàng, mép poster sẽ xén mất một phần.', ai: 'luna', matLoi: 'worried' },
        { id: 'to', ok: (d) => d.logo.phu >= 0.85, ten: 'Đủ to', loi: 'Logo còn nhỏ quá, đứng xa không ai thấy. Khung vàng vẫn còn nhiều chỗ.', ai: 'sola', matLoi: 'confused' },
        { id: 'giua', sao: true, ok: (d) => d.logo.lech <= 4, ten: 'Tâm logo đúng tâm khung' },
        { id: 'kin', sao: true, ok: (d) => d.logo.phu >= 0.95, ten: 'Chạm kín cạnh ngắn của khung' },
      ],
      goiY: [
        'Khung rộng hơn cao. Hình tròn chỉ vừa được theo cạnh ngắn, hai bên sẽ thừa chỗ. Thừa vẫn đúng.',
        'Tay nắm hình vuông ở giữa cạnh kéo một chiều nên làm méo. Bật khóa tỉ lệ thì chúng biến mất.',
        'Kéo góc đến khi cạnh trên và dưới logo gần chạm khung. Đưa logo về giữa, đường hồng hiện ra là đúng tâm.',
      ],
      soTay: ['ti-le', 'tay-nam'],
      canh: (st) => canhBanTin(posterTu(st)),
      giai(st, l) { l.khoa(st, true); l.dat(st, 'logo', { x: 180, y: 115, w: 148, h: 148 }); },
      sai: [
        { ten: 'Kéo méo cho đầy khung', loi: 'meo', lam(st, l) { l.dat(st, 'logo', { x: 180, y: 115, w: 220, h: 150 }); } },
        { ten: 'Tròn nhưng nhỏ', loi: 'to', lam(st, l) { l.dat(st, 'logo', { x: 180, y: 115, w: 80, h: 80 }); } },
        { ten: 'Tròn nhưng tràn', loi: 'trong', lam(st, l) { l.dat(st, 'logo', { x: 180, y: 115, w: 190, h: 190 }); } },
      ],
    },
    {
      ma: 'DH-1-2', ten: 'Bản nháp xiêu vẹo', coKhi: 'bien-doi', chay: 'In thử',
      ai: 'luna', mat: 'thinking', vai: 'LUNA NHỜ',
      nho: 'Sola ghép poster lúc gần khuya, logo với tiêu đề nghiêng mỗi cái một hướng.',
      muc: 'Xoay thẳng, đặt logo và tiêu đề vào hai khung vàng.',
      dau: {
        vat: [
          { id: 'logo', loai: 'logo', x: 110, y: 214, w: 74, h: 74, goc: 14 },
          { id: 'tieu', loai: 'tieu-de', x: 214, y: 66, w: 120, h: 30, goc: -9 },
        ], chon: 'logo', khoa: true,
      },
      san: {
        nen: 'poster', cu: ['khoa', 'xoay'],
        vung: {
          logo: { x: 120, y: 26, w: 120, h: 120, ten: 'Logo' },
          tieu: { x: 60, y: 176, w: 240, h: 60, ten: 'Tiêu đề' },
        },
      },
      sanNhan: 'Poster có logo và tiêu đề đang nghiêng',
      dan: [
        { txt: 'Chọn công cụ <b>Xoay</b>, chạm từng món rồi kéo chấm xanh trên đỉnh. Gần thẳng nó tự hít.', nhan: 'cu-xoay', xong: (d, st, cu) => cu === 'xoay' || (d.logo.goc <= 2 && d.tieu.goc <= 2) },
        { txt: 'Kéo <b>chấm xanh</b> của cả hai món cho thẳng. Chạm món kia để đổi sang nó.', xong: (d) => d.logo.goc <= 2 && d.tieu.goc <= 2 },
        { txt: 'Xong xoay thì dùng <b>Đổi cỡ</b> và <b>Di chuyển</b> đưa từng món vào khung của nó.', xong: (d) => d.logo.phu >= 0.85 && d.tieu.phu >= 0.85 && d.logo.trong && d.tieu.trong },
        { txt: 'Bấm <b>In thử</b>.', xong: () => false },
      ],
      tieuChi: [
        { id: 'nghieng', ok: (d) => d.logo.goc <= 2 && d.tieu.goc <= 2, ten: 'Cả hai thẳng', loi: 'Treo lên bảng tin, ai đi qua cũng nghiêng đầu nhìn.', ai: 'sola', matLoi: 'facepalm' },
        { id: 'meo', ok: (d) => d.logo.meo <= 0.03 && d.tieu.meo <= 0.03, ten: 'Không méo', loi: 'Có một món bị kéo méo tỉ lệ. Chữ tiêu đề bè ra trông rất lạ.', ai: 'luna', matLoi: 'worried' },
        { id: 'trong', ok: (d) => d.logo.trong && d.tieu.trong, ten: 'Nằm trong khung', loi: 'Có món còn nằm ngoài khung vàng của nó.', ai: 'luna', matLoi: 'confused' },
        { id: 'to', ok: (d) => d.logo.phu >= 0.85 && d.tieu.phu >= 0.85, ten: 'Đủ to', loi: 'Có món còn nhỏ hơn khung nhiều, poster trông trống trải.', ai: 'luna', matLoi: 'thinking' },
        { id: 'giua', sao: true, ok: (d) => d.logo.lech <= 4 && d.tieu.lech <= 4, ten: 'Đúng tâm hai khung' },
        { id: 'kin', sao: true, ok: (d) => d.logo.phu >= 0.95 && d.tieu.phu >= 0.95, ten: 'Vừa khít khung' },
      ],
      goiY: [
        'Làm từng món một. Bấm vào món nào thì tay nắm của món đó hiện ra.',
        'Xoay trước, rồi mới đổi cỡ. Khung nghiêng rất khó căn với khung thẳng.',
        'Tiêu đề có tỉ lệ 4 phần ngang 1 phần cao, đúng tỉ lệ khung của nó nên kéo góc là vừa khít.',
      ],
      soTay: ['tay-nam', 'ti-le'],
      canh: (st) => canhBanTin(posterTu(st)),
      giai(st, l) {
        l.dat(st, 'logo', { x: 180, y: 86, w: 118, h: 118, goc: 0 });
        l.dat(st, 'tieu', { x: 180, y: 206, w: 238, h: 59.5, goc: 0 });
      },
      sai: [
        { ten: 'Chưa xoay', loi: 'nghieng', lam(st, l) { l.dat(st, 'logo', { x: 180, y: 86, w: 90, h: 90, goc: 14 }); l.dat(st, 'tieu', { x: 180, y: 206, w: 220, h: 55, goc: -9 }); } },
        { ten: 'Tiêu đề kéo méo', loi: 'meo', lam(st, l) { l.dat(st, 'logo', { x: 180, y: 86, w: 118, h: 118, goc: 0 }); l.dat(st, 'tieu', { x: 180, y: 206, w: 238, h: 40, goc: 0 }); } },
      ],
    },
    {
      ma: 'DH-1-3', ten: 'Băng rôn ba mét', coKhi: 'bien-doi', chay: 'In thử',
      ai: 'sola', mat: 'confident', vai: 'SOLA NHỜ',
      nho: 'Logo nhìn trên máy đẹp lắm, mình gửi tiệm in luôn nha? À năm ngoái cũng đẹp vậy đó.',
      muc: 'Logo cao gần hết băng rôn, đứng sát vẫn phải nét. Khung vàng dài khoảng 80 cm thật.',
      dau: { vat: [{ id: 'logo', loai: 'logo', x: 75, y: 142, w: 48, h: 48, goc: 0 }], chon: 'logo', khoa: true, tep: 'chup' },
      san: { nen: 'bang-ron', cmMoiDv: 300 / 340, vung: { logo: { x: 28, y: 96, w: 90, h: 90, ten: '' } }, cu: ['khoa', 'soi', 'tep'] },
      sanNhan: 'Băng rôn ba mét có khung vàng đặt logo',
      dan: [
        { txt: 'Chọn công cụ <b>Soi tệp</b>: kính soi cho thấy ô điểm ảnh khi in thật ra.', nhan: 'cu-soi', xong: (_d, st) => st.daSoi },
        { txt: 'Dùng <b>Đổi cỡ</b> và <b>Di chuyển</b> đưa logo vào khung. Rồi quay lại <b>Soi tệp</b> xem kính soi đã đổi ra sao.', xong: (d) => d.logo.phu >= 0.85 },
        { txt: 'Chọn được tệp ưng ý thì bấm <b>In thử</b>.', xong: () => false },
      ],
      tieuChi: [
        { id: 'to', ok: (d) => d.logo.phu >= 0.85, ten: 'Đủ to', loi: 'Logo bé tí giữa băng rôn 3 mét, đứng ngoài cổng không thấy gì.', ai: 'sola', matLoi: 'confused' },
        { id: 'net', ok: (d) => d.matDo >= 12, ten: 'Nét khi in', loi: 'Ra tới tiệm in, logo vỡ thành từng ô vuông. Cô bán nước còn hỏi đây là trò chơi gì.', ai: 'sola', matLoi: 'facepalm' },
        { id: 'trong', ok: (d) => d.logo.trong, ten: 'Trong khung', loi: 'Logo chờm khỏi khung vàng, sát mép băng rôn sẽ bị khoen móc đè lên.', ai: 'luna', matLoi: 'worried' },
        { id: 'meo', ok: (d) => d.logo.meo <= 0.03, ten: 'Không méo', loi: 'Logo bị méo tỉ lệ.', ai: 'luna', matLoi: 'worried' },
        { id: 'giua', sao: true, ok: (d) => d.logo.lech <= 4, ten: 'Đúng tâm khung' },
        { id: 'kin', sao: true, ok: (d) => d.logo.phu >= 0.95, ten: 'Vừa khít khung' },
      ],
      goiY: [
        'Màn hình điện thoại rất nhỏ nên ảnh nào cũng trông nét. Đừng tin màn hình, hãy tin kính soi.',
        'Ảnh điểm chỉ có từng ấy ô: phóng to là mỗi ô to ra. Ở băng rôn cần ít nhất 12 điểm trên mỗi cm.',
        'Tệp 800 điểm chỉ đủ nét khi logo nhỏ hơn 67 cm, mà khung cần lớn hơn thế. Còn loại tệp nào không có ô?',
      ],
      soTay: ['anh-diem', 'vector', 'mat-do'],
      canh: (st, _k, _d, man) => canhBangRon(st, man),
      giai(st, l) { l.doiTep(st, 'svg'); l.dat(st, 'logo', { x: 73, y: 141, w: 88, h: 88 }); },
      sai: [
        { ten: 'Ảnh chụp phóng to', loi: 'net', lam(st, l) { l.dat(st, 'logo', { x: 73, y: 141, w: 88, h: 88 }); } },
        { ten: 'PNG 800 điểm phóng to', loi: 'net', lam(st, l) { l.doiTep(st, 'web'); l.dat(st, 'logo', { x: 73, y: 141, w: 88, h: 88 }); } },
        { ten: 'SVG nhưng nhỏ', loi: 'to', lam(st, l) { l.doiTep(st, 'svg'); } },
      ],
    },
  ],
};
