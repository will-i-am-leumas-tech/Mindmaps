import HudPanel from './HudPanel.jsx';
import HudButton from './HudButton.jsx';
import { NODE_SHAPES } from '../lib/constants.js';

export default function NodeInspector({ node, onUpdate, onDuplicate, onDelete }) {
  return (
    <HudPanel title="Selected Node" className="inspector-panel">
      {!node ? <p className="hint">Select a node to edit its long-term notebook details.</p> : (
        <>
          <label>Title<input value={node.title} onChange={(event) => onUpdate(node.id, { title: event.target.value })} /></label>
          <label>Body<textarea value={node.body} onChange={(event) => onUpdate(node.id, { body: event.target.value })} /></label>
          <label>Shape<select value={node.shape} onChange={(event) => onUpdate(node.id, { shape: event.target.value })}>{NODE_SHAPES.map((shape) => <option key={shape} value={shape}>{shape}</option>)}</select></label>
          <label>Accent<input type="color" value={node.color} onChange={(event) => onUpdate(node.id, { color: event.target.value })} /></label>
          <div className="button-row">
            <HudButton onClick={() => onDuplicate(node.id)}>Duplicate</HudButton>
            <HudButton tone="danger" onClick={() => onDelete(node.id)}>Delete</HudButton>
          </div>
        </>
      )}
    </HudPanel>
  );
}
