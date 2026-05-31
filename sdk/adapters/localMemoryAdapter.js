const stamp = () => new Date().toISOString();
const slugify = (value) => String(value || 'mindmap').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || `mindmap-${Date.now()}`;

function meta(mindmap) {
  return {
    slug: mindmap.slug,
    name: mindmap.name,
    description: mindmap.description || '',
    nodeCount: mindmap.nodes?.length || 0,
    linkCount: mindmap.links?.length || 0,
    updatedAt: mindmap.updatedAt,
    createdAt: mindmap.createdAt
  };
}

export function createLocalMemoryAdapter(seed = []) {
  const store = new Map(seed.map((map) => [map.slug, structuredClone(map)]));
  return {
    health: { check: async () => ({ ok: true, app: 'leumas-mindmap-notebook-memory' }) },
    mindmaps: {
      list: async () => ({ mindmaps: [...store.values()].map(meta) }),
      create: async ({ name, description = '' }) => {
        const now = stamp();
        const slug = slugify(name);
        const mindmap = { version: 1, slug, name, description, createdAt: now, updatedAt: now, viewport: { scale: 1, panX: 420, panY: 220 }, nodes: [], links: [] };
        store.set(slug, mindmap);
        return { mindmap: structuredClone(mindmap) };
      },
      get: async (slug) => ({ mindmap: structuredClone(store.get(slug)) }),
      save: async (slug, mindmap) => {
        const saved = { ...mindmap, slug, updatedAt: stamp() };
        store.set(slug, structuredClone(saved));
        return { mindmap: saved };
      },
      patch: async (slug, patch) => {
        const saved = { ...store.get(slug), ...patch, slug, updatedAt: stamp() };
        store.set(slug, structuredClone(saved));
        return { mindmap: saved };
      },
      remove: async (slug) => ({ ok: store.delete(slug) }),
      duplicate: async (slug, { name }) => {
        const source = store.get(slug);
        const copySlug = slugify(name || `${source.name} Copy`);
        const copy = { ...structuredClone(source), slug: copySlug, name: name || `${source.name} Copy`, createdAt: stamp(), updatedAt: stamp() };
        store.set(copySlug, copy);
        return { mindmap: copy };
      }
    }
  };
}
