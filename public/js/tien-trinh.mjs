// Luật tiến trình: mở khóa, màn kế, danh hiệu, huy hiệu. Không chạm DOM nên máy kiểm trên Node nhập được.
import { GOI, TAT_CA_MAN } from './man/index.mjs';
import { SO_TAY } from './so-tay.mjs';
import { saoCua, daQua, tongSao, thongKe, coHuyHieu, ghiHuyHieu, soDocTay, matTinhTot, daXemGoi } from './kho.mjs';

export const moHet = () => typeof location !== 'undefined' && new URLSearchParams(location.search).has('mo-khoa');
// Màn mới thêm vào gói cũ không được khóa lại phần người chơi đã đi qua: đã qua màn nào từ chỗ đó trở đi thì chỗ đó vẫn mở.
const daVaoTu = (ds) => ds.some((m) => daQua(m.ma));
export const dangMoGoi = (i) => moHet() || i === 0 || GOI[i - 1].man.every((m) => daQua(m.ma)) || daVaoTu(GOI.slice(i).flatMap((g) => g.man));
export const dangMoMan = (g, i) => moHet() || i === 0 || daQua(g.man[i - 1].ma) || daVaoTu(g.man.slice(i));
export const tongSaoToiDa = TAT_CA_MAN.length * 3;
export const SO_CAU_MAT_TINH = 8;
export const saoGoi = (g) => g.man.reduce((t, m) => t + saoCua(m.ma), 0);
export const xongGoi = (g) => g.man.every((m) => daQua(m.ma));
export const xongHet = () => GOI.every(xongGoi);

export function manTiepTheo() {
  for (let gi = 0; gi < GOI.length; gi++) {
    if (!dangMoGoi(gi)) break;
    const m = GOI[gi].man.find((x) => !daQua(x.ma));
    if (m) return { goi: GOI[gi], man: m, gi };
  }
  return null;
}

// Nút chính ở màn kết quả: xong gói lần đầu thì có màn ăn mừng riêng trước khi đi tiếp.
export function manSau(m) {
  const g = GOI[m.goiChiSo];
  if (xongGoi(g) && !daXemGoi(g.id)) return { hash: `#/xong-goi/${g.id}`, nhan: 'Nhận huy hiệu gói' };
  if (m.chiSo < g.man.length - 1) return { hash: `#/man/${g.man[m.chiSo + 1].ma}`, nhan: 'Màn tiếp' };
  if (m.goiChiSo < GOI.length - 1) return { hash: `#/goi/${GOI[m.goiChiSo + 1].id}`, nhan: 'Sang gói mới' };
  return { hash: xongHet() ? '#/khai-mac' : '#/', nhan: xongHet() ? 'Dự lễ khai mạc' : 'Về bản vẽ' };
}

export const DANH_HIEU = [
  { tu: 0, ten: 'Thành viên mới' },
  { tu: 6, ten: 'Tay kéo vững' },
  { tu: 15, ten: 'Thợ nắn nét' },
  { tu: 27, ten: 'Phó ban Truyền thông' },
  { tu: 40, ten: 'Trưởng ban Truyền thông' },
  { tu: tongSaoToiDa, ten: 'Gương mặt Ngày hội' },
];

export function danhHieu(sao = tongSao()) {
  let i = 0;
  DANH_HIEU.forEach((d, k) => { if (sao >= d.tu) i = k; });
  const sau = DANH_HIEU[i + 1] || null;
  const hien = DANH_HIEU[i];
  return { ten: hien.ten, sau, tiLe: sau ? (sao - hien.tu) / (sau.tu - hien.tu) : 1 };
}

// Huy hiệu thưởng tay nghề và thói quen tốt: bền bỉ được khen ngang với giỏi.
export const HUY_HIEU = [
  { id: 'goi-1', ten: 'Tay in không méo', mo: 'Xong gói Logo đi in', ic: 'doiCo', dat: () => xongGoi(GOI[0]) },
  { id: 'goi-2', ten: 'Thợ ghép lớp', mo: 'Xong gói Ghép logo CLB', ic: 'lop', dat: () => xongGoi(GOI[1]) },
  { id: 'goi-3', ten: 'Bàn tay nắn nét', mo: 'Xong gói Nắn nét và xuất tệp', ic: 'nutNeo', dat: () => xongGoi(GOI[2]) },
  { id: 'goi-4', ten: 'Mắt điểm ảnh', mo: 'Xong gói Bộ ảnh hội trường', ic: 'dua', dat: () => xongGoi(GOI[3]) },
  { id: 'goi-5', ten: 'Đạo diễn 30 giây', mo: 'Xong gói Phim quảng bá', ic: 'phim', dat: () => xongGoi(GOI[4]) },
  { id: 'ba-sao', ten: 'Ba sao đầu tiên', mo: 'Đạt 3 sao ở một màn', ic: 'sao', dat: () => thongKe().baSao >= 1 },
  { id: 'mot-lan', ten: 'Một phát ăn ngay', mo: 'Đạt 3 sao ngay lần chạy đầu tiên', ic: 'chay', dat: () => thongKe().motLan >= 1 },
  { id: 'tu-luc', ten: 'Tự lực', mo: 'Đạt 3 sao ở 5 màn mà không mở gợi ý', ic: 'denGoiY', dat: () => thongKe().tuLuc >= 5 },
  { id: 'kien-tri', ten: 'Không bỏ cuộc', mo: 'Qua một màn sau ít nhất 3 lần chạy chưa ổn', ic: 'lamLai', dat: () => thongKe().kienTri >= 1 },
  { id: 'mat-tinh', ten: 'Mắt tinh', mo: `Đúng cả ${SO_CAU_MAT_TINH} câu trong một lượt Mắt Thiết Kế`, ic: 'matNhin',dat: () => matTinhTot() >= SO_CAU_MAT_TINH },
  { id: 'doc-so-tay', ten: 'Mọt Sổ tay', mo: `Đọc ${Math.min(10, Object.keys(SO_TAY).length)} mục trong Sổ tay`, ic: 'soTay', dat: () => soDocTay() >= 10 },
  { id: 'tron-sao', ten: `Trọn ${tongSaoToiDa} sao`, mo: 'Lấy đủ sao ở mọi màn', ic: 'cup', dat: () => tongSao() >= tongSaoToiDa },
];

export function xetHuyHieu() {
  const moi = [];
  for (const h of HUY_HIEU) {
    if (!coHuyHieu(h.id) && h.dat()) {
      ghiHuyHieu(h.id);
      moi.push(h);
    }
  }
  return moi;
}

// Lần đầu gặp mục Sổ tay ở màn nào.
const NOI_GAP = {};
for (const m of TAT_CA_MAN) {
  for (const k of m.soTay || []) (NOI_GAP[k] ||= []).push(m);
}
export const noiGap = (k) => NOI_GAP[k] || [];
export const goiCuaMuc = (k) => (NOI_GAP[k] ? NOI_GAP[k][0].goiChiSo : GOI.length - 1);

// Lời khen khi xong mỗi gói. Sola hay quá khích, Luna hay giải thích.
export const LOI_XONG_GOI = {
  'goi-1': { ai: 'sola', mat: 'celebrate-jump', cau: 'Băng rôn năm nay nét căng, tiệm in còn hỏi xin tệp về làm mẫu đó!' },
  'goi-2': { ai: 'luna', mat: 'celebrate', cau: 'Logo đủ năm mảnh, đi đâu cũng đi cả cụm. Bạn đọc được thứ tự lớp rồi đấy.' },
  'goi-3': { ai: 'sola', mat: 'celebrate-jump', cau: 'Cờ bay sóng, huy hiệu xỏ dây được, biển khiên khớp bộ icon, áo không lộ khung trắng. Năm ngoái mà có bạn thì hay biết mấy!' },
  'goi-4': { ai: 'luna', mat: 'great-job', cau: 'Từng điểm ảnh đều nghe lời bạn. Giờ ảnh nào lên phim cũng yên tâm.' },
  'goi-5': { ai: 'sola', mat: 'celebrate-jump', cau: 'Phim đúng 30 giây, không lấn một câu nào. Mọi thứ đã sẵn sàng cho lễ khai mạc!' },
};
