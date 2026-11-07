// Khởi động và định tuyến. Không dùng khung phần mềm, không cần build.
import { GOI, timMan } from './man/index.mjs';
import { daChao } from './kho.mjs';
import { dangMoGoi, dangMoMan, moHet } from './tien-trinh.mjs';
import { moBan } from './ban-choi.mjs';
import { trangChu } from './trang/trang-chu.mjs';
import { trangGoi } from './trang/goi.mjs';
import { trangTacPham } from './trang/tac-pham.mjs';
import { trangSoTay } from './trang/so-tay.mjs';
import { trangHoSo } from './trang/ho-so.mjs';
import { trangMoDau } from './trang/mo-dau.mjs';
import { trangMatTinh } from './trang/mat-tinh.mjs';
import { trangXongGoi } from './trang/xong-goi.mjs';
import { trangKhaiMac } from './trang/khai-mac.mjs';

const root = document.getElementById('root');
let donDep = null;

function dinhTuyen() {
  if (donDep) { donDep(); donDep = null; }
  document.querySelectorAll('.lop-phu, .phieu-nen, .rap, .bao-nhanh').forEach((n) => n.remove());
  window.scrollTo(0, 0);
  const h = location.hash.replace(/^#\/?/, '');

  // Lần đầu vào game thì qua phần mở đầu. Link thẳng tới màn hay gói vẫn đi thẳng.
  if (h === '' && !daChao() && !moHet()) { location.replace('#/chao'); return; }

  if (h === 'chao') return trangMoDau(root);
  if (h === 'tac-pham') { donDep = trangTacPham(root) || null; return undefined; }
  if (h === 'so-tay') return trangSoTay(root);
  if (h === 'ho-so') return trangHoSo(root);
  if (h === 'mat-tinh') return trangMatTinh(root);
  if (h === 'khai-mac') return trangKhaiMac(root);
  if (h.startsWith('xong-goi/')) return trangXongGoi(root, h.slice(9));
  if (h.startsWith('goi/')) return trangGoi(root, h.slice(4));
  if (h.startsWith('man/')) {
    const m = timMan(h.slice(4));
    if (m && dangMoGoi(m.goiChiSo) && dangMoMan(GOI[m.goiChiSo], m.chiSo)) {
      donDep = moBan(root, m);
      return undefined;
    }
    location.hash = '#/';
    return undefined;
  }
  return trangChu(root);
}

window.addEventListener('hashchange', dinhTuyen);
dinhTuyen();
