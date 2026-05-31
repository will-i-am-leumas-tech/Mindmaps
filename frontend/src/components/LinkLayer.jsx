import { nodeCenter } from '../lib/geometry.js';

export default function LinkLayer({ nodes, links }) {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  return (
    <svg className="link-layer" aria-hidden="true">
      {links.map((link) => {
        const from = byId.get(link.from);
        const to = byId.get(link.to);
        if (!from || !to) return null;
        const p1 = nodeCenter(from);
        const p2 = nodeCenter(to);
        const dx = Math.abs(p2.x - p1.x) * 0.45;
        return (
          <path
            key={link.id}
            d={`M ${p1.x} ${p1.y} C ${p1.x + dx} ${p1.y}, ${p2.x - dx} ${p2.y}, ${p2.x} ${p2.y}`}
            fill="none"
            stroke={link.color || '#00aaff'}
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.8"
          />
        );
      })}
    </svg>
  );
}
