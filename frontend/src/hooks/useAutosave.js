import { useEffect } from 'react';

export function useAutosave({ mindmap, saveState, onSave, delay = 1000 }) {
  useEffect(() => {
    if (!mindmap || saveState !== 'dirty') return undefined;
    const timeout = window.setTimeout(() => onSave(), delay);
    return () => window.clearTimeout(timeout);
  }, [mindmap, saveState, onSave, delay]);
}
