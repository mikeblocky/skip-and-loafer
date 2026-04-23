import { useEffect } from 'react';
import './index.css';

const RetiredPage = () => {
  useEffect(() => {
    document.title = 'skip-and-loafer';
  }, []);

  return (
    <div style={{
      minHeight: '100dvh',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <p style={{
        fontFamily: 'var(--font-hand)',
        color: '#9ca3af',
        fontSize: '1.05rem',
        textAlign: 'center',
        lineHeight: 1.7,
        margin: 0,
      }}>
        This website has been retired and is no longer active.
        <br />
        <span style={{ fontSize: '0.9rem', opacity: 0.7 }}>
          Thank you for all of the support to this fan-made website. ♡
        </span>
        <br />
        <a 
          href="https://skip-and-loafer.com" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ 
            fontSize: '0.85rem', 
            color: '#8b5cf6', 
            textDecoration: 'none', 
            marginTop: '12px', 
            display: 'inline-block',
            fontWeight: 'bold'
          }}
        >
          skip-and-loafer.com
        </a>
      </p>
    </div>
  );
};

export default RetiredPage;
