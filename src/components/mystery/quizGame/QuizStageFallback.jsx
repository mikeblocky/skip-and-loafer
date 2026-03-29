const QuizStageFallback = ({ isMobile, label }) => (
  <div
    style={{
      width: '100%',
      minHeight: isMobile ? '420px' : '500px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}
  >
    <div
      className="sketchbook-border"
      style={{
        background: '#ffffff',
        border: '3px solid #bfdbfe',
        borderBottom: '7px solid #93c5fd',
        borderRadius: '24px',
        padding: isMobile ? '16px 20px' : '18px 24px',
        color: '#64748b',
        fontFamily: 'var(--font-hand)',
        fontSize: isMobile ? '0.98rem' : '1.02rem',
        textAlign: 'center',
      }}
    >
      {label}
    </div>
  </div>
);

export default QuizStageFallback;
