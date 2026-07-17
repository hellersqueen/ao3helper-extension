import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const dist = path.resolve(dirname, '../../dist');
const allowed = new Set(['ao3-helper.modules.js', 'ao3-helper.panel.js']);

export async function startBundleServer() {
  const requests = [];
  const server = http.createServer(async (request, response) => {
    const name = new URL(request.url, 'http://localhost').pathname.slice(1);
    requests.push(name);
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Cache-Control', 'no-store');
    if (!allowed.has(name)) {
      response.writeHead(404).end('Not found');
      return;
    }
    try {
      const source = await readFile(path.join(dist, name));
      response.writeHead(200, { 'Content-Type': 'application/javascript; charset=utf-8' });
      response.end(source);
    } catch (error) {
      response.writeHead(500).end(String(error));
    }
  });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  server.unref();
  const { port } = server.address();
  return {
    baseURL: `http://127.0.0.1:${port}/`,
    requests,
    close: () => new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve())),
  };
}
