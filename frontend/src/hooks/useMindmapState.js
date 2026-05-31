import { useCallback, useMemo, useState } from 'react';
import { nextId } from '../lib/ids.js';
import { normalizeMindmap } from '../lib/mindmapSchema.js';

const stamp = () => new Date().toISOString();

export function useMindmapState(initialMindmap = null) {
  const [mindmap, setMindmap] = useState(initialMindmap ? normalizeMindmap(initialMindmap) : null);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [mode, setMode] = useState('select');
  const [connectFromId, setConnectFromId] = useState(null);
  const [saveState, setSaveState] = useState('idle');

  const markDirty = useCallback(() => setSaveState((current) => current === 'saving' ? current : 'dirty'), []);

  const loadMindmap = useCallback((nextMindmap) => {
    setMindmap(nextMindmap ? normalizeMindmap(nextMindmap) : null);
    setSelectedNodeId(null);
    setConnectFromId(null);
    setMode('select');
    setSaveState('idle');
  }, []);

  const updateMindmap = useCallback((updater, dirty = true) => {
    setMindmap((current) => {
      if (!current) return current;
      const next = typeof updater === 'function' ? updater(current) : updater;
      return { ...next, updatedAt: stamp() };
    });
    if (dirty) markDirty();
  }, [markDirty]);

  const updateViewport = useCallback((viewport) => {
    updateMindmap((current) => ({ ...current, viewport: { ...current.viewport, ...viewport } }));
  }, [updateMindmap]);

  const addNode = useCallback((node = {}) => {
    updateMindmap((current) => {
      const nextNode = {
        id: nextId('node', current.nodes),
        type: node.image ? 'image' : 'text',
        shape: node.shape || 'card',
        title: node.title || 'New Idea',
        body: node.body || 'Write your thought here...',
        x: node.x ?? 0,
        y: node.y ?? 0,
        w: node.w || 220,
        h: node.h || 130,
        color: node.color || '#00aaff',
        tags: node.tags || [],
        collapsed: Boolean(node.collapsed),
        image: node.image || null,
        createdAt: stamp(),
        updatedAt: stamp()
      };
      setSelectedNodeId(nextNode.id);
      return { ...current, nodes: [...current.nodes, nextNode] };
    });
  }, [updateMindmap]);

  const updateNode = useCallback((id, patch) => {
    updateMindmap((current) => ({
      ...current,
      nodes: current.nodes.map((node) => node.id === id ? { ...node, ...patch, updatedAt: stamp() } : node)
    }));
  }, [updateMindmap]);

  const moveNode = useCallback((id, x, y) => {
    updateNode(id, { x, y });
  }, [updateNode]);

  const duplicateNode = useCallback((id) => {
    updateMindmap((current) => {
      const source = current.nodes.find((node) => node.id === id);
      if (!source) return current;
      const copy = { ...source, id: nextId('node', current.nodes), title: `${source.title} Copy`, x: source.x + 44, y: source.y + 44, createdAt: stamp(), updatedAt: stamp() };
      setSelectedNodeId(copy.id);
      return { ...current, nodes: [...current.nodes, copy] };
    });
  }, [updateMindmap]);

  const deleteNode = useCallback((id) => {
    updateMindmap((current) => ({
      ...current,
      nodes: current.nodes.filter((node) => node.id !== id),
      links: current.links.filter((link) => link.from !== id && link.to !== id)
    }));
    setSelectedNodeId(null);
  }, [updateMindmap]);

  const connectNode = useCallback((id) => {
    if (!connectFromId) {
      setConnectFromId(id);
      return;
    }
    if (connectFromId === id) {
      setConnectFromId(null);
      return;
    }
    updateMindmap((current) => {
      const duplicate = current.links.some((link) => (link.from === connectFromId && link.to === id) || (link.from === id && link.to === connectFromId));
      if (duplicate) return current;
      const fromNode = current.nodes.find((node) => node.id === connectFromId);
      return {
        ...current,
        links: [...current.links, { id: nextId('link', current.links), from: connectFromId, to: id, label: '', color: fromNode?.color || '#00aaff', direction: 'none' }]
      };
    });
    setConnectFromId(null);
  }, [connectFromId, updateMindmap]);

  const selectedNode = useMemo(() => mindmap?.nodes.find((node) => node.id === selectedNodeId) || null, [mindmap, selectedNodeId]);

  return {
    mindmap,
    selectedNode,
    selectedNodeId,
    mode,
    connectFromId,
    saveState,
    setSaveState,
    setSelectedNodeId,
    setMode,
    setConnectFromId,
    loadMindmap,
    updateMindmap,
    updateViewport,
    addNode,
    updateNode,
    moveNode,
    duplicateNode,
    deleteNode,
    connectNode
  };
}
