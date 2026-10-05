import { createServer } from 'node:http';
import { createReadStream, statSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve('out');
const mime = { '.html':'text/html; charset=utf-8', '.css':'text/css', '.js':'text/javascript', '.json':'application/json', '.svg':'image/svg+xml', '.webp':'image/webp', '.jpg':'image/jpeg', '.png':'image/png', '.mp4':'video/mp4', '.woff2':'font/woff2', '.woff':'font/woff', '.txt':'text/plain' };
createServer((request, response) => {
  let file;
  try {
    const url = new URL(request.url, 'http://127.0.0.1');
    file = path.resolve(root, '.' + decodeURIComponent(url.pathname));
    if (!file.startsWith(root + path.sep) && file !== root) throw new Error('Invalid path');
    if (statSync(file).isDirectory()) file = path.join(file, 'index.html');
    const { size } = statSync(file);
    const type = mime[path.extname(file)] || 'application/octet-stream';
    const range = request.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
    if (range) {
      const start = Number(range[1]);
      const end = Math.min(range[2] ? Number(range[2]) : size - 1, size - 1);
      if (start > end || start >= size) { response.writeHead(416, {'Content-Range':`bytes */${size}`}); response.end(); return; }
      response.writeHead(206, {'Content-Type':type,'Content-Range':`bytes ${start}-${end}/${size}`,'Accept-Ranges':'bytes','Content-Length':end-start+1});
      createReadStream(file,{start,end}).pipe(response);
    } else {
      response.writeHead(200, {'Content-Type':type,'Content-Length':size,'Accept-Ranges':'bytes'});
      if(request.method === 'HEAD') response.end(); else createReadStream(file).pipe(response);
    }
  } catch { response.writeHead(404); response.end('Not found'); }
}).listen(5173,'127.0.0.1',() => console.log('Local: http://127.0.0.1:5173/'));
