const defaultContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '24px',
};

const defaultCardStyle = {
  borderRadius: '24px',
  border: '3px solid #bfdbfe',
  borderBottom: '8px solid #60a5fa',
  background: '#ffffff',
  boxShadow: '0 16px 32px rgba(148, 163, 184, 0.16)',
  display: 'grid',
  gap: '12px',
};

const PaperLoadingState = ({
  isMobile,
  label = 'Loading...',
  containerStyle,
  cardStyle,
  labelStyle,
  topSlot,
  bottomSlot,
  children,
  shimmerWidth,
  shimmerHeight = '10px',
  shimmer = true,
  skeletonLines = ['100%', '86%'],
}) => (
  <div
    style={{
      ...defaultContainerStyle,
      ...containerStyle,
    }}
  >
    <div
      className="sketchbook-border"
      style={{
        ...defaultCardStyle,
        width: isMobile ? 'min(88vw, 320px)' : '340px',
        padding: isMobile ? '18px 18px 20px' : '20px 22px 22px',
        ...cardStyle,
      }}
    >
      {topSlot}
      {shimmer && (
        <div
          style={{
            width: shimmerWidth || '44%',
            height: shimmerHeight,
            borderRadius: '999px',
            background: 'linear-gradient(90deg, #dbeafe 0%, #93c5fd 50%, #dbeafe 100%)',
            backgroundSize: '200% 100%',
            animation: 'plannerShimmer 1.2s linear infinite',
          }}
        />
      )}
      {skeletonLines.map((width) => (
        <div
          key={width}
          style={{
            width,
            height: '12px',
            borderRadius: '999px',
            background: '#e0f2fe',
          }}
        />
      ))}
      {children}
      <span
        style={{
          fontFamily: 'var(--font-hand)',
          fontSize: isMobile ? '1rem' : '1.02rem',
          color: '#475569',
          textAlign: 'center',
          ...labelStyle,
        }}
      >
        {label}
      </span>
      {bottomSlot}
    </div>
  </div>
);

export default PaperLoadingState;
