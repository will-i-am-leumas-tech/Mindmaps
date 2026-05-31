import { useCallback } from 'react';
import { clamp, screenToWorld } from '../lib/geometry.js';
import { ZOOM_MAX, ZOOM_MIN } from '../lib/constants.js';

export function useCanvasControls({ canvasRef, viewport, updateViewport }) {
  const worldPoint = useCallback((event) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return screenToWorld({ clientX: event.clientX, clientY: event.clientY, rect, viewport });
  }, [canvasRef, viewport]);

  const zoomAt = useCallback((clientX, clientY, factor) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const before = screenToWorld({ clientX, clientY, rect, viewport });
    const scale = clamp(viewport.scale * factor, ZOOM_MIN, ZOOM_MAX);
    updateViewport({
      scale,
      panX: clientX - rect.left - before.x * scale,
      panY: clientY - rect.top - before.y * scale
    });
  }, [canvasRef, updateViewport, viewport]);

  return { worldPoint, zoomAt };
}
