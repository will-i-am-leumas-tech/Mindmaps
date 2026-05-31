import { handleHealth } from './health.js';
import { handleMindmaps } from './mindmaps.js';

export async function handleApiRequest(req, res, options) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname.replace(/^\/api/, '') || '/';

  if (pathname === '/health') {
    handleHealth(req, res);
    return true;
  }

  if (pathname === '/mindmaps' || pathname.startsWith('/mindmaps/')) {
    await handleMindmaps(req, res, { ...options, pathname });
    return true;
  }

  res.json(404, { error: 'API route not found' });
  return true;
}
