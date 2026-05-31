import { createHttpMindmapAdapter } from './adapters/httpMindmapAdapter.js';
import { createLocalMemoryAdapter } from './adapters/localMemoryAdapter.js';

export function createMindmapSdk(options = {}) {
  const adapter = options.adapter === 'memory'
    ? createLocalMemoryAdapter(options.seed)
    : createHttpMindmapAdapter({ baseUrl: options.baseUrl || '/api' });
  return {
    health: adapter.health,
    mindmaps: adapter.mindmaps
  };
}
