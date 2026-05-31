export default function HudPanel({ title, children, className = '' }) {
  return (
    <section className={`hud-panel ${className}`.trim()}>
      {title ? <h2>{title}</h2> : null}
      {children}
    </section>
  );
}
