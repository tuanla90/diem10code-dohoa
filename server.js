// Máy chủ tĩnh gọn cho game. Không có phụ thuộc, không gắn đường dẫn ngoài dự án.
// Chạy ở máy: chỉ nghe trên máy này. Thử trên điện thoại cùng mạng: npm run dien-thoai
// Lên Railway: nền tảng cấp PORT, lúc đó phải nghe mọi địa chỉ thì mới nhận được yêu cầu từ ngoài.
const http = require('http');
const fs = require('fs');
const path = require('path');

const GOC = path.join(__dirname, 'public');
const CONG = Number(process.env.PORT) || 4280;
const CHU = process.env.HOST || (process.env.PORT ? '0.0.0.0' : '127.0.0.1');

const LOAI = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
};

function traVe(res, ma, thongDiep) {
  res.writeHead(ma, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end(thongDiep);
}

const server = http.createServer((req, res) => {
  let tuongDoi;
  try {
    tuongDoi = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  } catch {
    traVe(res, 400, 'Đường dẫn không hợp lệ');
    return;
  }
  if (tuongDoi.includes('\0')) {
    traVe(res, 400, 'Đường dẫn không hợp lệ');
    return;
  }
  const tep = path.join(GOC, tuongDoi === '/' ? 'index.html' : tuongDoi);
  if (tep !== GOC && !tep.startsWith(GOC + path.sep)) {
    traVe(res, 403, 'Không được phép');
    return;
  }
  fs.stat(tep, (loiStat, tt) => {
    if (loiStat || !tt.isFile()) {
      traVe(res, 404, 'Không tìm thấy');
      return;
    }
    // Mã, giao diện: luôn hỏi lại máy chủ nhưng có ETag nên tệp chưa đổi chỉ trả 304 rỗng, không tải lại cả trăm KB.
    // Phông, ảnh mặt nhân vật gần như không đổi: giữ một ngày.
    const duoi = path.extname(tep).toLowerCase();
    const etag = `W/"${tt.size.toString(16)}-${Math.floor(tt.mtimeMs).toString(16)}"`;
    const dau = {
      'Content-Type': LOAI[duoi] || 'application/octet-stream',
      'Cache-Control': ['.woff2', '.png', '.webp'].includes(duoi) ? 'public, max-age=86400' : 'no-cache',
      ETag: etag,
      'Last-Modified': tt.mtime.toUTCString(),
    };
    if (req.headers['if-none-match'] === etag) {
      res.writeHead(304, dau);
      res.end();
      return;
    }
    fs.readFile(tep, (loi, du) => {
      if (loi) {
        traVe(res, 404, 'Không tìm thấy');
        return;
      }
      res.writeHead(200, dau);
      res.end(du);
    });
  });
});

server.listen(CONG, CHU, () => {
  console.log(`Gương Mặt Ngày Hội: http://${CHU === '0.0.0.0' ? 'localhost' : CHU}:${CONG}/`);
});
