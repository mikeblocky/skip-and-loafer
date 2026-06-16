import { PAPER_FONT_FAMILY, createPaperHeadingBadgeStyle } from './paperTheme';

const PaperHeadingBadge = ({
  isMobile,
  icon: Icon,
  title,
  palette = {},
  titleColor = 'var(--text-primary)',
  iconColor,
  fontFamily = PAPER_FONT_FAMILY,
}) => {
  const badgeStyle = createPaperHeadingBadgeStyle({
    borderColor: palette.borderColor,
    bottomColor: palette.bottomColor,
    shadow: palette.shadow,
    padding: isMobile ? '9px 20px' : '11px 26px',
  });

  return (
    <div style={badgeStyle}>
      {Icon && (
        <span style={{ display: 'inline-flex', color: iconColor || titleColor, flexShrink: 0 }}>
          <Icon size={isMobile ? 17 : 20} strokeWidth={2.2} />
        </span>
      )}
      <span style={{
        fontFamily,
        fontSize: isMobile ? '1.05rem' : '1.22rem',
        fontWeight: '400',
        color: titleColor,
        lineHeight: 1.1,
        letterSpacing: '0.012em',
        whiteSpace: 'nowrap',
      }}>
        {title}
      </span>
    </div>
  );
};

export default PaperHeadingBadge;
