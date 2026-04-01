import { QuizActionButton, QuizInstruction, QuizPanel } from '../QuizPrimitives';

export const toggleBoundedSelection = (previous, index, limit) => {
  if (previous.includes(index)) {
    return previous.filter((value) => value !== index);
  }

  if (previous.length >= limit) {
    return [...previous.slice(1), index];
  }

  return [...previous, index];
};

export const QuestionContinueAction = ({
  isMobile,
  onClick,
  disabled,
  palette,
  children,
  marginTop = '8px',
  style,
  whileHover,
  whileTap,
}) => (
  <div style={{ display: 'flex', justifyContent: 'center', marginTop }}>
    <QuizActionButton
      isMobile={isMobile}
      onClick={onClick}
      disabled={disabled}
      palette={palette}
      whileHover={whileHover}
      whileTap={whileTap}
      style={style}
    >
      {children}
    </QuizActionButton>
  </div>
);

export const QuestionInstructionBlock = ({ isMobile, children, style }) => (
  <QuizInstruction isMobile={isMobile} style={style}>
    {children}
  </QuizInstruction>
);

export const QuestionMetricCard = ({
  palette,
  label,
  value,
  style,
  labelStyle,
  valueStyle,
}) => (
  <QuizPanel
    palette={{
      background: palette.background,
      borderColor: palette.borderColor,
      bottomColor: palette.bottomColor,
      shadow: palette.shadow || '0 4px 0 rgba(0,0,0,0.02)',
    }}
    style={{
      padding: '10px 12px',
      gap: '6px',
      borderRadius: '18px',
      ...style,
    }}
  >
    <span
      style={{
        color: palette.labelColor || '#64748b',
        fontFamily: 'Sniglet, var(--font-main)',
        fontSize: '0.84rem',
        lineHeight: 1,
        fontWeight: '400',
        ...labelStyle,
      }}
    >
      {label}
    </span>
    <span
      style={{
        color: palette.valueColor || '#334155',
        fontFamily: 'var(--font-main)',
        fontSize: '0.92rem',
        lineHeight: 1.2,
        fontWeight: '700',
        ...valueStyle,
      }}
    >
      {value}
    </span>
  </QuizPanel>
);

export const QuestionSelectionSlots = ({
  count,
  getSlotTitle,
  getSlotLabel,
  containerStyle,
  slotStyle,
}) => (
  <div style={containerStyle}>
    {Array.from({ length: count }).map((_, slot) => (
      <div
        key={`slot-${slot}`}
        className="sketchbook-border"
        style={{
          background: '#f8fafc',
          border: '3px solid #cbd5e1',
          borderBottom: '7px solid #94a3b8',
          borderRadius: '18px',
          padding: '10px 12px',
          display: 'grid',
          gap: '6px',
          ...slotStyle,
        }}
      >
        <span
          style={{
            color: '#64748b',
            fontFamily: 'Sniglet, var(--font-main)',
            fontSize: '0.84rem',
            lineHeight: 1,
            fontWeight: '400',
          }}
        >
          {getSlotTitle(slot)}
        </span>
        <span
          style={{
            color: '#334155',
            fontFamily: 'var(--font-main)',
            fontSize: '0.86rem',
            lineHeight: 1.2,
            fontWeight: '700',
          }}
        >
          {getSlotLabel(slot)}
        </span>
      </div>
    ))}
  </div>
);

export const QuestionOrderButton = ({
  isMobile,
  selected,
  order,
  label,
  onClick,
  palette,
  badgePalette,
  layout = 'row',
  style,
  labelStyle,
  badgeStyle,
  whileHover,
  whileTap,
}) => {
  const isRowLayout = layout === 'row';

  return (
    <QuizActionButton
      isMobile={isMobile}
      onClick={onClick}
      aria-pressed={selected}
      palette={palette}
      whileHover={whileHover}
      whileTap={whileTap}
      style={{
        width: '100%',
        height: 'auto',
        whiteSpace: 'normal',
        justifyContent: 'stretch',
        padding: isRowLayout ? (isMobile ? '14px 16px' : '16px 20px') : (isMobile ? '14px 12px' : '16px 14px'),
        display: 'grid',
        ...(isRowLayout
          ? {
              gridTemplateColumns: 'auto 1fr',
              gap: '12px',
              alignItems: 'center',
              textAlign: 'left',
            }
          : {
              gap: '10px',
              alignContent: 'space-between',
              textAlign: 'left',
              minHeight: isMobile ? '102px' : '114px',
            }),
        ...style,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: badgePalette.size || '30px',
          minWidth: badgePalette.size || '30px',
          height: badgePalette.size || '30px',
          borderRadius: badgePalette.radius || '12px',
          border: `3px solid ${badgePalette.borderColor}`,
          background: badgePalette.background,
          color: badgePalette.color,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Sniglet, var(--font-main)',
          fontSize: badgePalette.fontSize || '0.92rem',
          lineHeight: 1,
          fontWeight: '400',
          boxShadow: badgePalette.shadow || 'none',
          ...badgeStyle,
        }}
      >
        {selected ? order + 1 : ''}
      </span>
      <span
        style={{
          fontFamily: 'var(--font-main)',
          color: palette.color,
          fontSize: isMobile ? (isRowLayout ? '1.02rem' : '0.96rem') : '1rem',
          lineHeight: isRowLayout ? 1.3 : 1.28,
          fontWeight: '700',
          ...labelStyle,
        }}
      >
        {label}
      </span>
    </QuizActionButton>
  );
};
