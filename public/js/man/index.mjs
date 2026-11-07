// Danh sách gói, tra cứu màn, chấm điểm. Một nguồn duy nhất cho tiêu chí: tiêu chí nằm trong mỗi màn.
import goi1 from './goi-1.mjs';
import goi2 from './goi-2.mjs';
import goi3 from './goi-3.mjs';
import goi4 from './goi-4.mjs';
import goi5 from './goi-5.mjs';
import bienDoi from '../co-khi/bien-doi.mjs';
import lopNhom from '../co-khi/lop-nhom.mjs';
import nutNet from '../co-khi/nut-net.mjs';
import ghepHinh from '../co-khi/ghep-hinh.mjs';
import xuatTep from '../co-khi/xuat-tep.mjs';
import suaAnh from '../co-khi/sua-anh.mjs';
import tachNen from '../co-khi/tach-nen.mjs';
import chuAnh from '../co-khi/chu-anh.mjs';
import khungHinh from '../co-khi/khung-hinh.mjs';
import dongThoiGian from '../co-khi/dong-thoi-gian.mjs';

export const GOI = [goi1, goi2, goi3, goi4, goi5];

export const CO_KHI = {
  'bien-doi': bienDoi,
  'lop-nhom': lopNhom,
  'nut-net': nutNet,
  'ghep-hinh': ghepHinh,
  'xuat-tep': xuatTep,
  'sua-anh': suaAnh,
  'tach-nen': tachNen,
  'chu-anh': chuAnh,
  'khung-hinh': khungHinh,
  'dong-thoi-gian': dongThoiGian,
};

export const TAT_CA_MAN = GOI.flatMap((g, gi) => g.man.map((m, mi) => ({ ...m, goiId: g.id, goiChiSo: gi, chiSo: mi, baiHoc: m.baiHoc || g.baiHoc })));
export const timMan = (ma) => TAT_CA_MAN.find((m) => m.ma === ma);

export function cham(man, st) {
  const ck = CO_KHI[man.coKhi];
  const d = ck.do(st, man);
  const ds = man.tieuChi.map((t) => ({ ...t, dat: !!t.ok(d, st) }));
  const loi = ds.find((t) => !t.sao && !t.dat) || null;
  const them = ds.filter((t) => t.sao);
  const datThem = them.filter((t) => t.dat).length;
  const dat = !loi;
  const sao = !dat ? 0 : them.length ? 1 + Math.round((2 * datThem) / them.length) : 3;
  return { dat, sao, loi, ds, d };
}
