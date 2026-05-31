import { useState } from 'react';
import HudButton from './HudButton.jsx';
import HudPanel from './HudPanel.jsx';

export default function MindmapLibrary({ mindmaps, loading, onRefresh, onCreate, onOpen, onDuplicate, onDelete }) {
  const [name, setName] = useState('New Mindmap');
  const [description, setDescription] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    await onCreate({ name, description });
    setName('New Mindmap');
    setDescription('');
  };

  return (
    <div className="library-overlay">
      <HudPanel title="Mindmap Library" className="library-panel">
        <p className="hint">Create, reopen, duplicate, and delete local JSON mindmaps stored in the repository's <code>mindmaps/</code> folder.</p>
        <form className="create-form" onSubmit={submit}>
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Mindmap name" required />
          <input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Description" />
          <HudButton tone="primary" type="submit">Create</HudButton>
          <HudButton type="button" onClick={onRefresh}>Refresh</HudButton>
        </form>
      </HudPanel>
      <div className="map-grid">
        {loading ? <HudPanel><p>Loading mindmaps...</p></HudPanel> : null}
        {mindmaps.map((map) => (
          <HudPanel key={map.slug} className="map-card">
            <div className="map-card-title">
              <h3>{map.name}</h3>
              <span>{map.slug}</span>
            </div>
            <p>{map.description || 'No description yet.'}</p>
            <div className="map-stats">
              <span>{map.nodeCount} nodes</span>
              <span>{map.linkCount} links</span>
              <span>{map.updatedAt ? new Date(map.updatedAt).toLocaleString() : 'No date'}</span>
            </div>
            <div className="button-row">
              <HudButton tone="primary" onClick={() => onOpen(map.slug)}>Open</HudButton>
              <HudButton onClick={() => onDuplicate(map.slug, { name: `${map.name} Copy` })}>Duplicate</HudButton>
              <HudButton tone="danger" onClick={() => onDelete(map.slug)}>Delete</HudButton>
            </div>
          </HudPanel>
        ))}
      </div>
    </div>
  );
}
