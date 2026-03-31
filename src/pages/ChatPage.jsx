import { MessageSquareOff } from 'lucide-react';

export const ChatPage = ({ isMobile }) => {
  return (
    <div
      className="planner-container planner-page"
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: isMobile ? 'calc(100dvh - 120px)' : 'calc(100vh - 120px)',
        padding: isMobile ? '24px 14px' : '32px',
      }}
    >
      <div
        className="sketchbook-border"
        style={{
          width: '100%',
          maxWidth: '720px',
          borderRadius: '30px',
          border: '3px solid #cbd5e1',
          borderBottom: '8px solid #94a3b8',
          background: '#fffefc',
          boxShadow: '0 18px 42px rgba(15, 23, 42, 0.12)',
          padding: isMobile ? '24px 20px' : '30px 32px',
          display: 'grid',
          gap: '14px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '58px',
            height: '58px',
            margin: '0 auto',
            borderRadius: '18px',
            border: '3px solid #cbd5e1',
            borderBottom: '8px solid #94a3b8',
            background: '#f8fafc',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#64748b',
          }}
        >
          <MessageSquareOff size={28} strokeWidth={2.4} />
        </div>
        <h2 style={{ margin: 0, fontFamily: '"Sniglet", "Coming Soon", cursive', fontSize: isMobile ? '1.5rem' : '1.7rem', color: '#334155' }}>
          Character chat has been retired
        </h2>
        <p style={{ margin: 0, color: '#475569', lineHeight: 1.7 }}>
          This page stays in the codebase for archival purposes only. Live rooms, Redis access, and navigation entry points have been disabled.
        </p>
      </div>
    </div>
  );
};

export default ChatPage;
