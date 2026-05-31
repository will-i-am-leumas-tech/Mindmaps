export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export function screenToWorld({ clientX, clientY, rect, viewport }) {
  return {
    x: (clientX - rect.left - viewport.panX) / viewport.scale,
    y: (clientY - rect.top - viewport.panY) / viewport.scale
  };
}

export function nodeCenter(node) {
  return {
    x: node.x + (node.w || 220) / 2,
    y: node.y + (node.h || 130) / 2
  };
}
