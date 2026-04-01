import { motion } from 'framer-motion';
import PaperActionButton from '../../../components/shared/paper/PaperActionButton';
import PaperMessageCard from '../../../components/shared/paper/PaperMessageCard';
import { createPaperChipStyle } from '../../../components/shared/paper/paperTheme';
import { instructionStyle } from './interactive/utils';

export const QUIZ_PANEL_PALETTES = {
  prompt: {
    background: '#ffffff',
    borderColor: '#bfdbfe',
    bottomColor: '#93c5fd',
    shadow: '0 8px 24px rgba(15, 23, 42, 0.05)',
  },
  neutral: {
    background: '#ffffff',
    borderColor: '#cbd5e1',
    bottomColor: '#94a3b8',
    shadow: '0 10px 24px rgba(15, 23, 42, 0.08)',
  },
};

export const QUIZ_BUTTON_PALETTES = {
  blue: {
    background: '#3b82f6',
    borderColor: '#2563eb',
    bottomColor: '#1d4ed8',
    color: '#ffffff',
    shadow: '0 10px 24px rgba(59, 130, 246, 0.3)',
  },
  sky: {
    background: '#0ea5e9',
    borderColor: '#0284c7',
    bottomColor: '#0369a1',
    color: '#ffffff',
    shadow: '0 10px 24px rgba(14, 165, 233, 0.3)',
  },
  violet: {
    background: '#7c3aed',
    borderColor: '#6d28d9',
    bottomColor: '#5b21b6',
    color: '#ffffff',
    shadow: '0 10px 24px rgba(124, 58, 237, 0.3)',
  },
  cyan: {
    background: '#06b6d4',
    borderColor: '#0891b2',
    bottomColor: '#0e7490',
    color: '#ffffff',
    shadow: '0 10px 24px rgba(6, 182, 212, 0.3)',
  },
  emerald: {
    background: '#10b981',
    borderColor: '#059669',
    bottomColor: '#047857',
    color: '#ffffff',
    shadow: '0 10px 24px rgba(16, 185, 129, 0.24)',
  },
  indigo: {
    background: '#312e81',
    borderColor: '#1e1b4b',
    bottomColor: '#0f172a',
    color: '#ffffff',
    shadow: '0 10px 24px rgba(15, 23, 42, 0.22)',
  },
  whiteSlate: {
    background: '#ffffff',
    borderColor: '#94a3b8',
    bottomColor: '#64748b',
    color: '#334155',
    shadow: '0 8px 20px rgba(100, 116, 139, 0.16)',
  },
  softBlue: {
    background: '#eff6ff',
    borderColor: '#93c5fd',
    bottomColor: '#2563eb',
    color: '#1e40af',
    shadow: '0 6px 16px rgba(37, 99, 235, 0.12)',
  },
};

export const QuizPanel = ({
  children,
  palette = QUIZ_PANEL_PALETTES.neutral,
  style,
  className = 'sketchbook-border',
  fontFamily = 'var(--font-main)',
  fontSize = '1rem',
  lineHeight = 1.45,
}) => (
  <PaperMessageCard
    className={className}
    palette={palette}
    fontFamily={fontFamily}
    fontSize={fontSize}
    lineHeight={lineHeight}
    style={{
      display: 'grid',
      gap: '12px',
      padding: '18px 20px',
      ...style,
    }}
  >
    {children}
  </PaperMessageCard>
);

export const QuizChip = ({
  children,
  palette,
  className = 'sketchbook-border',
  style,
  fontFamily = 'var(--font-main)',
  fontSize = '0.88rem',
}) => (
  <div
    className={className}
    style={{
      ...createPaperChipStyle(palette),
      fontFamily,
      fontSize,
      fontWeight: '700',
      ...style,
    }}
  >
    {children}
  </div>
);

export const QuizInstruction = ({ isMobile, children, style }) => (
  <div style={{ ...instructionStyle(isMobile), ...style }}>
    {children}
  </div>
);

export const QuizActionButton = ({
  isMobile,
  palette,
  disabled,
  className = 'sketchbook-border paper-interact',
  style,
  whileHover,
  whileTap,
  children,
  ...props
}) => {
  const resolvedPalette = disabled
    ? {
        ...palette,
        background: '#94a3b8',
        shadow: 'none',
      }
    : palette;

  return (
    <PaperActionButton
      type="button"
      className={className}
      palette={resolvedPalette}
      disabled={disabled}
      whileHover={disabled ? undefined : (whileHover || { scale: 1.05, y: -4 })}
      whileTap={disabled ? undefined : (whileTap || { scale: 0.92, y: 10 })}
      style={{
        fontFamily: 'var(--font-main)',
        fontSize: isMobile ? '1.1rem' : '1.15rem',
        fontWeight: '700',
        borderRadius: '24px',
        padding: isMobile ? '12px 32px' : '14px 48px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        ...style,
      }}
      {...props}
    >
      {children}
    </PaperActionButton>
  );
};

export const QuizStageFrame = ({
  isMobile,
  currentStep,
  totalQuestions,
  progressLabel,
  questionLabel,
  children,
  motionKey,
}) => (
  <motion.div
    key={motionKey}
    initial={{ opacity: 0, x: 40 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -40 }}
    transition={{ type: 'spring', damping: 22, stiffness: 120 }}
    style={{
      width: '100%',
      maxWidth: '580px',
      minHeight: isMobile ? '430px' : '480px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}
  >
    <QuizChip
      palette={{
        background: '#eff6ff',
        borderColor: '#bfdbfe',
        bottomColor: '#93c5fd',
        color: '#1d4ed8',
      }}
      style={{
        alignSelf: 'flex-start',
        marginBottom: isMobile ? '12px' : '16px',
        padding: isMobile ? '4px 14px' : '6px 18px',
        fontSize: isMobile ? '0.9rem' : '1rem',
        boxShadow: '0 4px 0 rgba(59, 130, 246, 0.1)',
      }}
    >
      {progressLabel}
    </QuizChip>

    <QuizPanel
      palette={QUIZ_PANEL_PALETTES.prompt}
      style={{
        width: '100%',
        padding: isMobile ? '16px 18px' : '22px 24px',
        marginBottom: isMobile ? '20px' : '28px',
      }}
    >
      <h3
        style={{
          fontFamily: 'var(--font-hand)',
          fontSize: isMobile ? '1.5rem' : '1.9rem',
          color: '#1e293b',
          textAlign: 'left',
          width: '100%',
          margin: 0,
          lineHeight: 1.3,
          fontWeight: '700',
        }}
      >
        {questionLabel}
      </h3>
    </QuizPanel>

    {children}
  </motion.div>
);
