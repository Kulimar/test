const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;

function sendJson(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function sendFile(res, filePath, contentType) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    }
  });
}

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url, true);
  if (parsed.pathname === '/images-list') {
    const dir = path.join(__dirname, 'images');
    fs.readdir(dir, (err, files) => {
      if (err) return sendJson(res, 500, { error: 'Unable to scan directory' });
      const imageFiles = Array.from(new Set(
        files
          .filter(f => /\.(jpe?g|png|gif|bmp|webp|heic)$/i.test(f))
          .map(f => f.replace(/\.heic$/i, '.png'))
      ));
      sendJson(res, 200, imageFiles);
    });
    return;
  }

  let filePath = path.join(__dirname, parsed.pathname);
  if (parsed.pathname === '/') filePath = path.join(__dirname, 'index.html');
  const ext = path.extname(filePath).toLowerCase();
  const map = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.mp3': 'audio/mpeg'
  };
  const type = map[ext] || 'application/octet-stream';
  sendFile(res, filePath, type);
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
