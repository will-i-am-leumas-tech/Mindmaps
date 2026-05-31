import { SAVE_STATES } from '../lib/constants.js';

export default function StatusHud({ mindmap, selectedNode, saveState }) {
  if (!mindmap) return null;
  return (
    <div className={`status-hud ${saveState}`}>
      <span>{mindmap.name}</span>
      <span>Zoom {Math.round((mindmap.viewport?.scale || 1) * 100)}%</span>
      <span>{mindmap.nodes.length} nodes</span>
      <span>{mindmap.links.length} links</span>
      <span>{selectedNode ? `Selected ${selectedNode.title}` : 'No selection'}</span>
      <strong>{SAVE_STATES[saveState] || saveState}</strong>
    </div>
  );
}
