import { useRef, useState } from 'react';
import LinkLayer from './LinkLayer.jsx';
import MindmapNode from './MindmapNode.jsx';
import { GRID_SIZE } from '../lib/constants.js';
import { screenToWorld } from '../lib/geometry.js';
import { useCanvasControls } from '../hooks/useCanvasControls.js';

export default function MindmapCanvas({
  mindmap,
  selectedNodeId,
  mode,
  connectFromId,
  readOnly = false,
  onSelectNode,
  onMoveNode,
  onAddNode,
  onConnectNode,
  onViewportChange
}) {
  const canvasRef = useRef(null);
  const dragRef = useRef(null);
  const [, forceFrame] = useState(0);
  const viewport = mindmap?.viewport || { scale: 1, panX: 0, panY: 0 };
  const { zoomAt } = useCanvasControls({ canvasRef, viewport, updateViewport: onViewportChange });

  if (!mindmap) return <section className="canvas-wrap empty"><p>Open or create a mindmap to start.</p></section>;

  const beginPan = (event) => {
    if (event.target !== canvasRef.current && !event.target.classList.contains('grid-layer')) return;
    dragRef.current = { type: 'pan', startX: event.clientX, startY: event.clientY, panX: viewport.panX, panY: viewport.panY };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const beginMove = (event, node) => {
    if (readOnly) return;
    dragRef.current = { type: 'node', nodeId: node.id, startX: event.clientX, startY: event.clientY, nodeX: node.x, nodeY: node.y };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handlePointerMove = (event) => {
    const drag = dragRef.current;
    if (!drag) return;
    if (drag.type === 'pan') {
      onViewportChange({ panX: drag.panX + event.clientX - drag.startX, panY: drag.panY + event.clientY - drag.startY });
    } else if (drag.type === 'node') {
      onMoveNode(drag.nodeId, drag.nodeX + (event.clientX - drag.startX) / viewport.scale, drag.nodeY + (event.clientY - drag.startY) / viewport.scale);
    }
    forceFrame((value) => value + 1);
  };

  const stopDrag = () => {
    dragRef.current = null;
  };

  const handleWheel = (event) => {
    event.preventDefault();
    zoomAt(event.clientX, event.clientY, event.deltaY > 0 ? 0.9 : 1.1);
  };

  const handleDoubleClick = (event) => {
    if (readOnly || event.target !== canvasRef.current && !event.target.classList.contains('grid-layer')) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const point = screenToWorld({ clientX: event.clientX, clientY: event.clientY, rect, viewport });
    onAddNode({ x: point.x, y: point.y, title: 'New Branch', body: 'Double-clicked idea...' });
  };

  const worldTransform = `translate(${viewport.panX}px, ${viewport.panY}px) scale(${viewport.scale})`;
  const gridTransform = `translate(${viewport.panX % GRID_SIZE}px, ${viewport.panY % GRID_SIZE}px) scale(${viewport.scale})`;

  return (
    <section
      ref={canvasRef}
      className={`canvas-wrap ${readOnly ? 'preview' : ''}`}
      onPointerDown={beginPan}
      onPointerMove={handlePointerMove}
      onPointerUp={stopDrag}
      onPointerCancel={stopDrag}
      onWheel={handleWheel}
      onDoubleClick={handleDoubleClick}
    >
      <div className="grid-layer" style={{ transform: gridTransform }} />
      <div className="world-layer" style={{ transform: worldTransform }}>
        <LinkLayer nodes={mindmap.nodes} links={mindmap.links} />
        {mindmap.nodes.map((node) => (
          <MindmapNode
            key={node.id}
            node={node}
            selected={node.id === selectedNodeId}
            connectFrom={node.id === connectFromId}
            mode={readOnly ? 'preview' : mode}
            onSelect={onSelectNode}
            onMoveStart={beginMove}
            onConnect={onConnectNode}
          />
        ))}
      </div>
    </section>
  );
}
