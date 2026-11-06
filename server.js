// Máy chủ tĩnh gọn cho game. Không có phụ thuộc, không gắn đường dẫn ngoài dự án.
// Mặc định chỉ nghe trên máy này. Thử trên điện thoại cùng mạng: npm run dien-thoai
const http = require('http');
const fs = require('fs');
const path = require('path');

const GOC = path.join(__dirname, 'public');
const CONG = Number(process.env.PORT) || 4280;
const CHU = process.env.HOST || '127.0.0.1';

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
  fs.readFile(tep, (loi, du) => {
    if (loi) {
      traVe(res, 404, 'Không tìm thấy');
      return;
    }
    res.writeHead(200, {
      'Content-Type': LOAI[path.extname(tep).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
    });
    res.end(du);
  });
});

server.listen(CONG, CHU, () => {
  console.log(`Gương Mặt Ngày Hội: http://${CHU === '0.0.0.0' ? 'localhost' : CHU}:${CONG}/`);
});
