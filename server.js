import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promises as fs } from 'node:fs';
import { createReadStream } from 'node:fs';
import { handleApiRequest } from './router/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const port = process.env.PORT || 4173;
const mindmapsDir = path.join(__dirname, 'mindmaps');
const distDir = path.join(__dirname, 'frontend', 'dist');

await fs.mkdir(mindmapsDir, { recursive: true });

const mimeTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.ico', 'image/x-icon']
]);

function decorateResponse(res) {
  res.json = (status, payload) => {
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(payload));
  };
}

async function serveStatic(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const requested = url.pathname === '/' ? '/index.html' : decodeURIComponent(url.pathname);
  const target = path.resolve(path.join(distDir, requested));
  const root = path.resolve(distDir);
  const filePath = target.startsWith(root + path.sep) ? target : path.join(root, 'index.html');

  try {
    const stat = await fs.stat(filePath);
    if (stat.isDirectory()) throw new Error('Directory requested');
    res.writeHead(200, { 'Content-Type': mimeTypes.get(path.extname(filePath)) || 'application/octet-stream' });
    createReadStream(filePath).pipe(res);
  } catch {
    const indexPath = path.join(distDir, 'index.html');
    try {
      await fs.access(indexPath);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      createReadStream(indexPath).pipe(res);
    } catch {
      res.json(404, { error: 'Frontend build not found. Run npm run build first.' });
    }
  }
}

const server = http.createServer(async (req, res) => {
  decorateResponse(res);
  try {
    if (req.url.startsWith('/api')) {
      await handleApiRequest(req, res, { mindmapsDir });
      return;
    }
    await serveStatic(req, res);
  } catch (error) {
    console.error(error);
    res.json(error.status || 500, { error: error.message || 'Unexpected server error' });
  }
});

server.listen(port, () => {
  console.log(`Leumas Mindmap Notebook listening on http://localhost:${port}`);
});
