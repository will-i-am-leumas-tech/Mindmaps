export function handleHealth(_req, res) {
  res.json(200, { ok: true, app: 'leumas-mindmap-notebook' });
}
