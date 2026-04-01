const BlogReaderFallback = ({ isMobile, label }) => (
  <div
    className="sketchbook-border"
    style={{
      marginTop: '8px',
      border: '3px solid #fde68a',
      borderBottom: '8px solid #f59e0b',
      borderRadius: '24px',
      background: '#fffdf5',
      padding: isMobile ? '18px 16px' : '22px 20px',
      display: 'grid',
      gap: '12px',
      boxShadow: '0 10px 22px rgba(245, 158, 11, 0.08)',
    }}
  >
    <div
      style={{
        width: isMobile ? '42%' : '220px',
        height: '10px',
        borderRadius: '999px',
        background: 'linear-gradient(90deg, #fde68a 0%, #fdba74 50%, #fde68a 100%)',
        backgroundSize: '200% 100%',
        animation: 'plannerShimmer 1.25s linear infinite',
      }}
    />
    <div
      style={{
        width: '100%',
        height: isMobile ? '12px' : '14px',
        borderRadius: '999px',
        background: '#fdecc8',
      }}
    />
    <div
      style={{
        width: '88%',
        height: isMobile ? '12px' : '14px',
        borderRadius: '999px',
        background: '#ffedd5',
      }}
    />
    <div
      style={{
        width: '94%',
        height: isMobile ? '12px' : '14px',
        borderRadius: '999px',
        background: '#ffedd5',
      }}
    />
    <span style={{ color: '#9a3412', fontFamily: 'var(--font-hand)', fontSize: isMobile ? '0.98rem' : '1rem' }}>
      {label}
    </span>
  </div>
);

export default BlogReaderFallback;
