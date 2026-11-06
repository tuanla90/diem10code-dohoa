// Bộ hít dùng chung: lệch một chút thì tự nắn về đúng chỗ, như đường gióng của các app vẽ trên máy bảng.
// Đơn vị là đơn vị sân khấu, xấp xỉ một điểm ảnh CSS trên điện thoại.

export const DUNG_SAI = 10;

// Giá trị gần mốc nhất trong dung sai, không có thì trả null.
export function hitMoc(gia, mocs, dungSai = DUNG_SAI) {
  let tot = null;
  let lech = dungSai;
  for (const m of mocs) {
    const d = Math.abs(gia - m);
    if (d <= lech) { lech = d; tot = m; }
  }
  return tot;
}

// Góc gần các góc vuông thì về hẳn góc đó.
export function hitGoc(goc, dungSai = 6) {
  return hitMoc(goc, [0, 90, -90, 180, -180], dungSai);
}

// Hộp trên một trục, từ `dau` dài `dai`. Mỗi mốc là { t: vị trí đường gióng, neo: 0 đầu hộp, 0.5 giữa, 1 cuối }.
// Trả về { doi: khoảng phải dời, moc } của mốc gần nhất.
export function hitTruc(dau, dai, mocs, dungSai = DUNG_SAI) {
  let tot = null;
  let lech = dungSai;
  for (const moc of mocs) {
    const doi = moc.t - (dau + moc.neo * dai);
    if (Math.abs(doi) <= lech) { lech = Math.abs(doi); tot = { doi, moc }; }
  }
  return tot;
}

// Mốc để khoảng hở bằng các khoảng hở đang có. `hops` là các hộp đứng yên trên trục ngang.
export function mocCachDeu(hops, rong) {
  const ds = [...hops].sort((a, b) => a.x - b.x);
  const mocs = [];
  const ho = ds.slice(1).map((b, i) => b.x - (ds[i].x + ds[i].w)).filter((g) => g > 0);
  for (const g of ho) {
    for (const b of ds) {
      mocs.push({ t: b.x + b.w + g, neo: 0, ho: true });
      mocs.push({ t: b.x - g - rong, neo: 0, ho: true });
    }
  }
  // Nằm giữa hai hình kề nhau.
  ds.slice(1).forEach((b, i) => {
    const giua = (b.x - (ds[i].x + ds[i].w) - rong) / 2;
    if (giua > 0) mocs.push({ t: ds[i].x + ds[i].w + giua, neo: 0, ho: true });
  });
  return mocs;
}
