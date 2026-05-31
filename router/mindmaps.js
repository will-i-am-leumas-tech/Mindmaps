import path from 'node:path';
import { promises as fs } from 'node:fs';

const extension = '.leumas-mindmap.json';
const now = () => new Date().toISOString();

function slugify(value = 'mindmap') {
  return String(value).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || `mindmap-${Date.now()}`;
}

function fileFor(mindmapsDir, slug) {
  const safeSlug = slugify(slug);
  const filePath = path.join(mindmapsDir, `${safeSlug}${extension}`);
  const resolvedDir = path.resolve(mindmapsDir);
  const resolvedFile = path.resolve(filePath);
  if (!resolvedFile.startsWith(resolvedDir + path.sep)) {
    const error = new Error('Invalid mindmap path');
    error.status = 400;
    throw error;
  }
  return { safeSlug, filePath };
}

async function readBody(req) {
  if (req.method === 'GET' || req.method === 'DELETE') return {};
  let body = '';
  for await (const chunk of req) body += chunk;
  if (!body) return {};
  return JSON.parse(body);
}

async function exists(filePath) {
  try { await fs.access(filePath); return true; } catch { return false; }
}

function normalizeNode(node, index = 0) {
  const stamp = now();
  return {
    id: node.id || `node_${index + 1}`,
    type: node.type || (node.image ? 'image' : 'text'),
    shape: node.shape || 'card',
    title: node.title || 'Untitled Node',
    body: node.body || '',
    x: Number.isFinite(Number(node.x)) ? Number(node.x) : 0,
    y: Number.isFinite(Number(node.y)) ? Number(node.y) : 0,
    w: Number.isFinite(Number(node.w)) ? Number(node.w) : 220,
    h: Number.isFinite(Number(node.h)) ? Number(node.h) : 130,
    color: node.color || '#00aaff',
    tags: Array.isArray(node.tags) ? node.tags : [],
    collapsed: Boolean(node.collapsed),
    image: node.image || null,
    createdAt: node.createdAt || stamp,
    updatedAt: node.updatedAt || stamp
  };
}

function normalizeLink(link, index = 0) {
  return {
    id: link.id || `link_${index + 1}`,
    from: link.from,
    to: link.to,
    label: link.label || '',
    color: link.color || '#00aaff',
    direction: link.direction || 'none'
  };
}

function normalizeMindmap(input = {}, fallback = {}) {
  const stamp = now();
  const name = input.name || fallback.name || 'Untitled Mindmap';
  const slug = slugify(input.slug || fallback.slug || name);
  const nodes = Array.isArray(input.nodes) ? input.nodes.map(normalizeNode) : [];
  const nodeIds = new Set(nodes.map((node) => node.id));
  const links = Array.isArray(input.links) ? input.links.map(normalizeLink).filter((link) => link.from && link.to && nodeIds.has(link.from) && nodeIds.has(link.to)) : [];
  return {
    version: Number(input.version) || 1,
    slug,
    name,
    description: input.description || fallback.description || '',
    createdAt: input.createdAt || fallback.createdAt || stamp,
    updatedAt: stamp,
    viewport: {
      scale: Number(input.viewport?.scale) || 1,
      panX: Number.isFinite(Number(input.viewport?.panX)) ? Number(input.viewport.panX) : 420,
      panY: Number.isFinite(Number(input.viewport?.panY)) ? Number(input.viewport.panY) : 220
    },
    nodes,
    links
  };
}

function metadata(mindmap) {
  return {
    slug: mindmap.slug,
    name: mindmap.name,
    description: mindmap.description,
    nodeCount: mindmap.nodes?.length || 0,
    linkCount: mindmap.links?.length || 0,
    updatedAt: mindmap.updatedAt,
    createdAt: mindmap.createdAt
  };
}

async function readMindmap(mindmapsDir, slug) {
  const { filePath } = fileFor(mindmapsDir, slug);
  const raw = await fs.readFile(filePath, 'utf8');
  return normalizeMindmap(JSON.parse(raw), { slug });
}

async function writeMindmap(mindmapsDir, mindmap) {
  const normalized = normalizeMindmap(mindmap);
  const { filePath } = fileFor(mindmapsDir, normalized.slug);
  await fs.writeFile(filePath, `${JSON.stringify(normalized, null, 2)}\n`, 'utf8');
  return normalized;
}

async function listMindmaps(mindmapsDir) {
  await fs.mkdir(mindmapsDir, { recursive: true });
  const files = (await fs.readdir(mindmapsDir)).filter((file) => file.endsWith(extension));
  const mindmaps = await Promise.all(files.map((file) => readMindmap(mindmapsDir, file.slice(0, -extension.length))));
  return mindmaps.sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt))).map(metadata);
}

async function uniqueSlug(mindmapsDir, name, requestedSlug) {
  let slug = slugify(requestedSlug || name);
  let candidate = fileFor(mindmapsDir, slug);
  let suffix = 2;
  while (await exists(candidate.filePath)) {
    slug = `${slugify(name)}-${suffix++}`;
    candidate = fileFor(mindmapsDir, slug);
  }
  return { slug, filePath: candidate.filePath };
}

export async function handleMindmaps(req, res, { mindmapsDir, pathname }) {
  try {
    const parts = pathname.split('/').filter(Boolean);
    const slug = parts[1];
    const action = parts[2];

    if (req.method === 'GET' && !slug) {
      res.json(200, { mindmaps: await listMindmaps(mindmapsDir) });
      return;
    }

    if (req.method === 'POST' && !slug) {
      const body = await readBody(req);
      const name = body.name || 'Untitled Mindmap';
      const unique = await uniqueSlug(mindmapsDir, name, body.slug);
      const mindmap = normalizeMindmap({ ...body, slug: unique.slug, name, nodes: body.nodes || [], links: body.links || [] });
      await fs.writeFile(unique.filePath, `${JSON.stringify(mindmap, null, 2)}\n`, 'utf8');
      res.json(201, { mindmap });
      return;
    }

    if (req.method === 'GET' && slug && !action) {
      res.json(200, { mindmap: await readMindmap(mindmapsDir, slug) });
      return;
    }

    if (req.method === 'PUT' && slug && !action) {
      const body = await readBody(req);
      const existing = await readMindmap(mindmapsDir, slug).catch(() => ({ slug }));
      const mindmap = normalizeMindmap({ ...body, slug }, existing);
      res.json(200, { mindmap: await writeMindmap(mindmapsDir, mindmap) });
      return;
    }

    if (req.method === 'PATCH' && slug && !action) {
      const body = await readBody(req);
      const existing = await readMindmap(mindmapsDir, slug);
      const mindmap = normalizeMindmap({ ...existing, ...body, slug });
      res.json(200, { mindmap: await writeMindmap(mindmapsDir, mindmap) });
      return;
    }

    if (req.method === 'DELETE' && slug && !action) {
      const { filePath } = fileFor(mindmapsDir, slug);
      await fs.unlink(filePath);
      res.json(200, { ok: true });
      return;
    }

    if (req.method === 'POST' && slug && action === 'duplicate') {
      const body = await readBody(req);
      const original = await readMindmap(mindmapsDir, slug);
      const name = body.name || `${original.name} Copy`;
      const unique = await uniqueSlug(mindmapsDir, name, body.slug);
      const stamp = now();
      const mindmap = normalizeMindmap({ ...original, slug: unique.slug, name, createdAt: stamp, updatedAt: stamp });
      await fs.writeFile(unique.filePath, `${JSON.stringify(mindmap, null, 2)}\n`, 'utf8');
      res.json(201, { mindmap });
      return;
    }

    res.json(404, { error: 'Mindmap route not found' });
  } catch (error) {
    if (error.code === 'ENOENT') error.status = 404;
    res.json(error.status || 500, { error: error.message || 'Mindmap request failed' });
  }
}
