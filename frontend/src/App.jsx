import { useCallback, useEffect, useMemo, useState } from 'react';
import { createMindmapSdk } from '../../sdk/index.js';
import FooterNav from './components/FooterNav.jsx';
import StatusHud from './components/StatusHud.jsx';
import { useAutosave } from './hooks/useAutosave.js';
import { useMindmapState } from './hooks/useMindmapState.js';
import EditorPage from './pages/EditorPage.jsx';
import LibraryPage from './pages/LibraryPage.jsx';
import PreviewPage from './pages/PreviewPage.jsx';

const sdk = createMindmapSdk({ adapter: 'http', baseUrl: '/api' });

export default function App() {
  const [page, setPage] = useState('library');
  const [mindmaps, setMindmaps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');
  const editor = useMindmapState(null);

  const refreshLibrary = useCallback(async () => {
    setLoading(true);
    try {
      const data = await sdk.mindmaps.list();
      setMindmaps(data.mindmaps || []);
    } catch (error) {
      setToast(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refreshLibrary(); }, [refreshLibrary]);

  const openMindmap = useCallback(async (slug) => {
    try {
      const data = await sdk.mindmaps.get(slug);
      editor.loadMindmap(data.mindmap);
      setPage('editor');
      setToast(`Opened ${data.mindmap.name}`);
    } catch (error) {
      setToast(error.message);
    }
  }, [editor]);

  const createMindmap = useCallback(async (payload) => {
    try {
      const data = await sdk.mindmaps.create(payload);
      editor.loadMindmap(data.mindmap);
      await refreshLibrary();
      setPage('editor');
      setToast(`Created ${data.mindmap.name}`);
    } catch (error) {
      setToast(error.message);
    }
  }, [editor, refreshLibrary]);

  const saveMindmap = useCallback(async () => {
    if (!editor.mindmap) return;
    editor.setSaveState('saving');
    try {
      const data = await sdk.mindmaps.save(editor.mindmap.slug, editor.mindmap);
      editor.loadMindmap(data.mindmap);
      await refreshLibrary();
      editor.setSaveState('idle');
      setToast('Saved locally');
    } catch (error) {
      editor.setSaveState('error');
      setToast(error.message);
    }
  }, [editor, refreshLibrary]);

  useAutosave({ mindmap: editor.mindmap, saveState: editor.saveState, onSave: saveMindmap });

  const duplicateMindmap = useCallback(async (slug, payload) => {
    try {
      const data = await sdk.mindmaps.duplicate(slug, payload);
      await refreshLibrary();
      setToast(`Duplicated ${data.mindmap.name}`);
    } catch (error) {
      setToast(error.message);
    }
  }, [refreshLibrary]);

  const deleteMindmap = useCallback(async (slug) => {
    if (!window.confirm(`Delete ${slug}? This removes the local JSON file.`)) return;
    try {
      await sdk.mindmaps.remove(slug);
      if (editor.mindmap?.slug === slug) editor.loadMindmap(null);
      await refreshLibrary();
      setToast(`Deleted ${slug}`);
    } catch (error) {
      setToast(error.message);
    }
  }, [editor, refreshLibrary]);

  const importImage = useCallback((event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => editor.addNode({ x: 40, y: 40, title: file.name.replace(/\.[^.]+$/, ''), body: 'Image node', image: reader.result, color: '#ff315f', w: 260, h: 180 });
    reader.readAsDataURL(file);
    event.target.value = '';
  }, [editor]);

  const exportMindmap = useCallback(() => {
    if (!editor.mindmap) return;
    const blob = new Blob([JSON.stringify(editor.mindmap, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${editor.mindmap.slug}.leumas-mindmap.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [editor.mindmap]);

  const canvasProps = useMemo(() => ({
    mindmap: editor.mindmap,
    selectedNodeId: editor.selectedNodeId,
    mode: editor.mode,
    connectFromId: editor.connectFromId,
    onSelectNode: editor.setSelectedNodeId,
    onMoveNode: editor.moveNode,
    onAddNode: editor.addNode,
    onConnectNode: editor.connectNode,
    onViewportChange: editor.updateViewport
  }), [editor]);

  return (
    <div className="app-shell">
      {page === 'library' ? (
        <LibraryPage
          {...canvasProps}
          libraryProps={{ mindmaps, loading, onRefresh: refreshLibrary, onCreate: createMindmap, onOpen: openMindmap, onDuplicate: duplicateMindmap, onDelete: deleteMindmap }}
        />
      ) : null}
      {page === 'editor' ? (
        <EditorPage
          {...canvasProps}
          selectedNode={editor.selectedNode}
          setMode={editor.setMode}
          addNode={editor.addNode}
          updateNode={editor.updateNode}
          duplicateNode={editor.duplicateNode}
          deleteNode={editor.deleteNode}
          onImportImage={importImage}
          onSave={saveMindmap}
        />
      ) : null}
      {page === 'preview' ? <PreviewPage {...canvasProps} /> : null}
      <StatusHud mindmap={editor.mindmap} selectedNode={editor.selectedNode} saveState={editor.saveState} />
      {toast ? <button className="toast" onClick={() => setToast('')}>{toast}</button> : null}
      <FooterNav page={page} setPage={setPage} onSave={saveMindmap} onExport={exportMindmap} disabled={!editor.mindmap} />
    </div>
  );
}
