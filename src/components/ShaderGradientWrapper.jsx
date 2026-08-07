export default function ShaderGradientWrapper({ children, className = '' }) {
  return (
    <div className={`shader-gradient-wrapper ${className}`} style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'linear-gradient(135deg, #faf8f4 0%, #fff5f0 50%, #faf8f4 100%)',
        zIndex: -1
      }} />
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'radial-gradient(circle at 30% 40%, rgba(230, 112, 40, 0.08) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(255, 179, 122, 0.06) 0%, transparent 50%)',
        zIndex: -1
      }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
}
