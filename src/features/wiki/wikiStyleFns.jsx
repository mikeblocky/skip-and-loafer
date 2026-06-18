import { BookOpen, FileText, Sparkles, Users } from 'lucide-react';

export const CATEGORY_ICON_BY_ID = {
  characters: Users,
  story: BookOpen,
  influences: Sparkles,
};

export const getCategoryIcon = (categoryId) => CATEGORY_ICON_BY_ID[categoryId] || FileText;

export const mainPillStyle = (isMobile) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '12px',
  background: '#ffffff',
  border: '3.5px solid #0ea5e9',
  borderBottom: '9px solid #0284c7',
  borderRadius: '24px',
  padding: isMobile ? '10px 18px' : '12px 24px',
  color: '#0f766e',
  fontFamily: '"Sniglet", "Coming Soon", cursive',
  fontSize: isMobile ? '1.3rem' : '1.4rem',
  fontWeight: '400',
  lineHeight: 1,
  boxShadow: '0 10px 20px rgba(14,165,233,0.12)',
});

export const statPillStyle = (border, bottom, color, isMobile) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '50px',
  padding: isMobile ? '12px 16px' : '12px 18px',
  background: '#ffffff',
  border: `3px solid ${border}`,
  borderBottom: `8px solid ${bottom}`,
  borderRadius: '999px',
  color,
  fontFamily: '"Sniglet", "Coming Soon", cursive',
  fontSize: isMobile ? '0.96rem' : '1rem',
  fontWeight: '400',
  lineHeight: 1,
  boxShadow: '0 10px 18px rgba(15,23,42,0.08)',
});

export const backButtonStyle = (isMobile) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  border: '3px solid #bfdbfe',
  borderBottom: '7px solid #60a5fa',
  background: '#ffffff',
  borderRadius: '18px',
  color: '#1d4ed8',
  fontFamily: '"Sniglet", "Coming Soon", cursive',
  fontWeight: '400',
  fontSize: isMobile ? '0.92rem' : '1rem',
  padding: '10px 18px',
  cursor: 'pointer',
});

export const articleButtonStyle = (border, accent, surface, isMobile) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  border: `3px solid ${border}`,
  borderBottom: `7px solid ${border}`,
  background: surface,
  color: accent,
  borderRadius: '18px',
  padding: isMobile ? '12px 14px' : '12px 16px',
  cursor: 'pointer',
  fontFamily: '"Sniglet", "Coming Soon", cursive',
  fontSize: '0.98rem',
  fontWeight: '400',
  lineHeight: 1,
  whiteSpace: 'nowrap',
});

export const renderBadge = (label, border, bottom, background, color) => (
  <span
    className="sketchbook-border"
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '38px',
      padding: '7px 12px',
      background,
      border: `2.5px solid ${border}`,
      borderBottom: `6px solid ${bottom}`,
      borderRadius: '999px',
      color,
      fontFamily: 'var(--font-main)',
      fontSize: '0.84rem',
      fontWeight: '800',
      lineHeight: 1,
    }}
  >
    {label}
  </span>
);

export const searchInputWrapStyle = (isMobile) => ({
  display: 'grid',
  gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1fr) auto',
  gap: '12px',
  alignItems: 'center',
});

export const sectionCardStyle = (isMobile) => ({
  background: '#ffffff',
  border: '3px solid #cbd5e1',
  borderBottom: '10px solid #94a3b8',
  borderRadius: '26px',
  padding: isMobile ? '18px 16px' : '20px 22px',
  display: 'grid',
  gap: '14px',
  boxShadow: '0 10px 18px rgba(15,23,42,0.05)',
});

export const subsectionCardStyle = (isMobile) => ({
  background: '#f8fafc',
  border: '2.5px solid #dbeafe',
  borderBottom: '8px solid #93c5fd',
  borderRadius: '20px',
  padding: isMobile ? '14px 14px 14px 16px' : '16px 16px 16px 18px',
  display: 'grid',
  gap: '10px',
  boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.8)',
});

export const tablePanelStyle = {
  background: '#ffffff',
  border: '2.5px solid #dbeafe',
  borderBottom: '7px solid #93c5fd',
  borderRadius: '20px',
  display: 'grid',
  gap: '12px',
};
