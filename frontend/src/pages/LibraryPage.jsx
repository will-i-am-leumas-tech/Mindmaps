import MindmapCanvas from '../components/MindmapCanvas.jsx';
import MindmapLibrary from '../components/MindmapLibrary.jsx';

export default function LibraryPage(props) {
  return (
    <>
      <MindmapCanvas mindmap={props.mindmap} readOnly selectedNodeId={props.selectedNodeId} onViewportChange={props.onViewportChange} onSelectNode={() => {}} onMoveNode={() => {}} onAddNode={() => {}} onConnectNode={() => {}} />
      <MindmapLibrary {...props.libraryProps} />
    </>
  );
}
