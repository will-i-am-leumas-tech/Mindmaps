const stamp = () => new Date().toISOString();
export const slugify = (value = 'mindmap') => String(value).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || `mindmap-${Date.now()}`;

export function createEmptyMindmap(name = 'Untitled Mindmap', description = '') {
  const now = stamp();
  return {
    version: 1,
    slug: slugify(name),
    name,
    description,
    createdAt: now,
    updatedAt: now,
    viewport: { scale: 1, panX: 420, panY: 220 },
    nodes: [],
    links: []
  };
}

export function normalizeMindmap(input = {}) {
  const fallback = createEmptyMindmap(input.name || 'Untitled Mindmap', input.description || '');
  return {
    ...fallback,
    ...input,
    viewport: { ...fallback.viewport, ...(input.viewport || {}) },
    nodes: Array.isArray(input.nodes) ? input.nodes.map((node, index) => ({
      id: node.id || `node_${index + 1}`,
      type: node.type || (node.image ? 'image' : 'text'),
      shape: node.shape || 'card',
      title: node.title || 'Untitled Node',
      body: node.body || '',
      x: Number(node.x) || 0,
      y: Number(node.y) || 0,
      w: Number(node.w) || 220,
      h: Number(node.h) || 130,
      color: node.color || '#00aaff',
      tags: Array.isArray(node.tags) ? node.tags : [],
      collapsed: Boolean(node.collapsed),
      image: node.image || null,
      createdAt: node.createdAt || stamp(),
      updatedAt: node.updatedAt || stamp()
    })) : [],
    links: Array.isArray(input.links) ? input.links.map((link, index) => ({
      id: link.id || `link_${index + 1}`,
      from: link.from,
      to: link.to,
      label: link.label || '',
      color: link.color || '#00aaff',
      direction: link.direction || 'none'
    })) : []
  };
}
