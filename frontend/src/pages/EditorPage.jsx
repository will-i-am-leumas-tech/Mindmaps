import HudButton from '../components/HudButton.jsx';
import HudPanel from '../components/HudPanel.jsx';
import MindmapCanvas from '../components/MindmapCanvas.jsx';
import NodeInspector from '../components/NodeInspector.jsx';

export default function EditorPage(props) {
  const { mindmap, mode, setMode, addNode, onImportImage, selectedNode, updateNode, duplicateNode, deleteNode, onSave } = props;
  return (
    <>
      <MindmapCanvas {...props} />
      <div className="top-toolbar">
        <HudPanel className="brand-panel">
          <div className="logo" />
          <div><h1>Mindmap Canvas</h1><p>{mindmap?.description || 'Local infinite notebook'}</p></div>
        </HudPanel>
        <div className="toolbar-actions">
          <HudButton tone="primary" onClick={() => addNode({ x: -80 + Math.random() * 160, y: -60 + Math.random() * 120 })}>+ Text Node</HudButton>
          <HudButton onClick={() => addNode({ x: -180, y: -120, title: 'Section Frame', body: 'Group related ideas here', shape: 'frame', color: '#38ffb3', w: 360, h: 220 })}>+ Frame</HudButton>
          <label className="hud-button file-button">+ Image<input type="file" accept="image/*" onChange={onImportImage} /></label>
          <HudButton className={mode === 'connect' ? 'active' : ''} onClick={() => setMode(mode === 'connect' ? 'select' : 'connect')}>Connect: {mode === 'connect' ? 'On' : 'Off'}</HudButton>
          <HudButton onClick={onSave}>Save</HudButton>
        </div>
      </div>
      <aside className="right-hud">
        <NodeInspector node={selectedNode} onUpdate={updateNode} onDuplicate={duplicateNode} onDelete={deleteNode} />
        <HudPanel title="Controls">
          <p className="hint">Drag nodes to move. Drag empty space to pan. Mouse wheel zooms toward the cursor. Double-click empty canvas to add a branch. Use Connect mode to link two nodes.</p>
        </HudPanel>
      </aside>
    </>
  );
}
