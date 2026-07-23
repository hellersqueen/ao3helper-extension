import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const host = '127.0.0.1';
const port = 5195;

const MIME = { '.js': 'application/javascript; charset=utf-8' };

const server = createServer(async (req, res) => {
  const file = path.join(root, path.normalize(decodeURIComponent(req.url.split('?')[0])));
  if (!file.startsWith(root)) { res.writeHead(403); res.end(); return; }
  try {
    const body = await readFile(file);
    res.writeHead(200, {
      'Content-Type': MIME[path.extname(file)] || 'application/octet-stream',
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*',
    });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(port, host, () => {
  console.log(`Serving dist/ at http://${host}:${port}/ (Ctrl+C to stop)`);
  console.log(`Build with: AO3H_ASSET_BASE=http://${host}:${port} npm run build`);
});
