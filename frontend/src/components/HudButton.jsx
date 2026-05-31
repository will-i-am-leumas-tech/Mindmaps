export default function HudButton({ children, className = '', tone = '', ...props }) {
  return <button className={`hud-button ${tone} ${className}`.trim()} {...props}>{children}</button>;
}
