import HudButton from './HudButton.jsx';

export default function FooterNav({ page, setPage, onSave, onExport, disabled }) {
  return (
    <nav className="footer-nav">
      <HudButton className={page === 'library' ? 'active' : ''} onClick={() => setPage('library')}>Library</HudButton>
      <HudButton className={page === 'editor' ? 'active' : ''} onClick={() => setPage('editor')} disabled={disabled}>Editor</HudButton>
      <HudButton className={page === 'preview' ? 'active' : ''} onClick={() => setPage('preview')} disabled={disabled}>Preview</HudButton>
      <HudButton tone="primary" onClick={onSave} disabled={disabled}>Save</HudButton>
      <HudButton onClick={onExport} disabled={disabled}>Export</HudButton>
    </nav>
  );
}
