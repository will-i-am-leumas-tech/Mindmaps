export default function MindmapNode({ node, selected, connectFrom, mode, onSelect, onMoveStart, onConnect }) {
  const handlePointerDown = (event) => {
    event.stopPropagation();
    onSelect(node.id);
    if (mode === 'connect') {
      onConnect(node.id);
      return;
    }
    onMoveStart(event, node);
  };

  return (
    <article
      className={`mindmap-node ${node.shape || 'card'} ${selected ? 'selected' : ''} ${connectFrom ? 'connect-from' : ''}`}
      style={{ left: node.x, top: node.y, width: node.w, minHeight: node.h, borderColor: node.color, '--node-color': node.color }}
      onPointerDown={handlePointerDown}
    >
      <div className="node-top">
        <strong>{node.title}</strong>
        <span>{node.shape || 'card'}</span>
      </div>
      <p>{node.body}</p>
      {node.image ? <img src={node.image} alt={node.title} draggable="false" /> : null}
    </article>
  );
}
