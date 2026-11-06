/**
 * Máy chủ tĩnh thuần Node.js (không phụ thuộc gói ngoài) cho game Đồ họa Điểm 10 Code.
 * Tích hợp trực tiếp tài nguyên gốc từ 2 dự án mẹ:
 * - /tin-hoc/    -> D:\Users\tuanla2\tin_hoc\public (Ảnh Sola, Luna, Badges, Tokens, Xưởng Đồ Họa)
 * - /robot-game/ -> D:\Users\tuanla2\game\doi-robot-chan-hung\hoc\game (Engine VeVector, VeRobot, HuyHieu, PhimVector)
 * - /robot-hoc/  -> D:\Users\tuanla2\game\doi-robot-chan-hung\hoc (Bảng ghép robot, cấu hình 8 máy)
 * Mở http://localhost:4280 (Màn chơi chính) hoặc http://localhost:4280/sink.html (Kitchen Sink).
 */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT) || 4280;
const PUBLIC_DIR = path.resolve(__dirname, 'public');
const TIN_HOC_DIR = path.resolve('D:/Users/tuanla2/tin_hoc/public');
const ROBOT_GAME_DIR = path.resolve('D:/Users/tuanla2/game/doi-robot-chan-hung/hoc/game');
const ROBOT_HOC_DIR = path.resolve('D:/Users/tuanla2/game/doi-robot-chan-hung/hoc');

const MOUNT_POINTS = [
  { prefix: '/tin-hoc/', dir: TIN_HOC_DIR },
  { prefix: '/robot-game/', dir: ROBOT_GAME_DIR },
  { prefix: '/robot-hoc/', dir: ROBOT_HOC_DIR }
];

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.webmanifest': 'application/manifest+json; charset=utf-8'
};

/**
 * Phân giải đường dẫn URL sang tệp vật lý an toàn trên ổ đĩa.
 * @param {string} rawPath Đường dẫn URL đã bỏ query string
 * @returns {{ baseDir: string, filePath: string } | null}
 */
function resolveMountedPath(rawPath) {
  const cleanUrl = decodeURIComponent(rawPath === '/' ? '/index.html' : rawPath);
  for (let i = 0; i < MOUNT_POINTS.length; i++) {
    const mount = MOUNT_POINTS[i];
    if (cleanUrl.startsWith(mount.prefix)) {
      const subPath = cleanUrl.slice(mount.prefix.length).replace(/^(\.\.[/\\])+/, '');
      const fullPath = path.resolve(mount.dir, subPath);
      if (fullPath.startsWith(mount.dir)) {
        return { baseDir: mount.dir, filePath: fullPath };
      }
      return null;
    }
  }
  const relPath = cleanUrl.replace(/^[/\\]+/, '').replace(/^(\.\.[/\\])+/, '');
  const fullPath = path.resolve(PUBLIC_DIR, relPath);
  if (fullPath.startsWith(PUBLIC_DIR)) {
    return { baseDir: PUBLIC_DIR, filePath: fullPath };
  }
  return null;
}

/**
 * Xử lý yêu cầu HTTP và trả về tệp tĩnh từ public/ hoặc thư mục dự án mẹ.
 * @param {http.IncomingMessage} req Yêu cầu HTTP
 * @param {http.ServerResponse} res Phản hồi HTTP
 */
function handleRequest(req, res) {
  const rawUrl = (req.url || '/').split('?')[0];
  const resolved = resolveMountedPath(rawUrl);

  if (!resolved) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('403 Forbidden');
    return;
  }

  fs.readFile(resolved.filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Không tìm thấy tệp: ' + rawUrl);
      return;
    }
    const ext = path.extname(resolved.filePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
      'Cache-Control': 'no-cache'
    });
    res.end(content);
  });
}

if (require.main === module) {
  const server = http.createServer(handleRequest);
  server.listen(PORT, () => {
    console.log('Sân Khấu Đồ Họa Robot Chấn Hưng đang chạy tại: http://localhost:' + PORT);
    console.log('Trang Kitchen Sink kiểm thử hệ thống thiết kế: http://localhost:' + PORT + '/sink.html');
  });
}

module.exports = { handleRequest, resolveMountedPath };
