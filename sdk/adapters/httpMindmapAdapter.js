async function request(baseUrl, path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Request failed: ${response.status}`);
  return data;
}

export function createHttpMindmapAdapter({ baseUrl = '/api' } = {}) {
  return {
    health: {
      check: () => request(baseUrl, '/health')
    },
    mindmaps: {
      list: () => request(baseUrl, '/mindmaps'),
      create: (payload) => request(baseUrl, '/mindmaps', { method: 'POST', body: payload }),
      get: (slug) => request(baseUrl, `/mindmaps/${encodeURIComponent(slug)}`),
      save: (slug, mindmap) => request(baseUrl, `/mindmaps/${encodeURIComponent(slug)}`, { method: 'PUT', body: mindmap }),
      patch: (slug, patch) => request(baseUrl, `/mindmaps/${encodeURIComponent(slug)}`, { method: 'PATCH', body: patch }),
      remove: (slug) => request(baseUrl, `/mindmaps/${encodeURIComponent(slug)}`, { method: 'DELETE' }),
      duplicate: (slug, payload) => request(baseUrl, `/mindmaps/${encodeURIComponent(slug)}/duplicate`, { method: 'POST', body: payload })
    }
  };
}
