import HudPanel from '../components/HudPanel.jsx';
import MindmapCanvas from '../components/MindmapCanvas.jsx';

export default function PreviewPage(props) {
  return (
    <>
      <MindmapCanvas {...props} readOnly />
      <HudPanel className="preview-badge">
        <strong>Preview Mode</strong>
        <span>Pan and zoom are enabled. Editing is locked.</span>
      </HudPanel>
    </>
  );
}
