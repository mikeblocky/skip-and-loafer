import { motion } from 'framer-motion';
import PaperLoadingState from '../../../components/shared/paper/PaperLoadingState';
import { QuizActionButton, QuizPanel, QUIZ_BUTTON_PALETTES } from './QuizPrimitives';
import { toMysteryLabelCase } from './ui';

export const QuizStageShell = ({ isMobile, children }) => (
  <div
    style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      width: '100%',
      minHeight: isMobile ? '460px' : '580px',
      paddingTop: isMobile ? '4px' : '8px',
    }}
  >
    <div
      style={{
        width: '100%',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {children}
    </div>
  </div>
);

export const QuizIntroCard = ({
  isMobile,
  icon: Icon,
  title,
  description,
  note,
  actionLabel,
  onStart,
  panelPalette = {
    background: '#f8fbff',
    borderColor: '#bfdbfe',
    bottomColor: '#93c5fd',
    shadow: '0 12px 32px rgba(59, 130, 246, 0.1)',
  },
  iconColor = '#3b82f6',
  titleColor = '#1e40af',
  descriptionBackground = '#eff6ff',
  descriptionBorderColor = '#bfdbfe',
  actionPalette = QUIZ_BUTTON_PALETTES.blue,
  maxWidthMobile = '380px',
  maxWidthDesktop = '480px',
  descriptionFontSizeMobile = '1.15rem',
  descriptionFontSizeDesktop = '1.35rem',
  noteFontSizeMobile = '0.95rem',
  noteFontSizeDesktop = '1rem',
}) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -15 }}
    style={{
      textAlign: 'center',
      width: '100%',
      maxWidth: isMobile ? maxWidthMobile : maxWidthDesktop,
    }}
  >
    <QuizPanel
      palette={panelPalette}
      style={{
        padding: isMobile ? '24px 20px' : '32px 24px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
        <Icon size={isMobile ? 56 : 72} color={iconColor} strokeWidth={3.5} />
      </div>
      <h2
        style={{
          fontSize: isMobile ? '2.4rem' : '3rem',
          color: titleColor,
          margin: '0 0 18px 0',
          transform: 'rotate(-2deg)',
        }}
      >
        {toMysteryLabelCase(title)}
      </h2>
      <p
        style={{
          fontSize: isMobile ? descriptionFontSizeMobile : descriptionFontSizeDesktop,
          color: '#1e293b',
          marginBottom: note ? '12px' : '28px',
          lineHeight: 1.5,
          background: descriptionBackground,
          padding: '16px 20px',
          borderRadius: '20px',
          border: `3px dashed ${descriptionBorderColor}`,
        }}
      >
        {description}
      </p>
      {note ? (
        <p
          style={{
            color: '#64748b',
            fontSize: isMobile ? noteFontSizeMobile : noteFontSizeDesktop,
            lineHeight: 1.45,
            margin: '0 0 28px 0',
          }}
        >
          {note}
        </p>
      ) : null}
      <QuizActionButton
        isMobile={isMobile}
        onClick={onStart}
        palette={actionPalette}
        whileHover={{ scale: 1.06, rotate: 2, y: -6 }}
        whileTap={{ scale: 0.9, y: 12 }}
        style={{
          padding: isMobile ? '14px 42px' : '18px 64px',
          fontSize: isMobile ? '1.25rem' : '1.45rem',
          borderRadius: '24px',
          boxShadow: '0 10px 0 rgba(37, 99, 235, 0.2)',
        }}
      >
        {toMysteryLabelCase(actionLabel)}
      </QuizActionButton>
    </QuizPanel>
  </motion.div>
);

export const QuizLoadingCard = ({
  isMobile,
  icon: Icon,
  title,
  subtitle,
  iconColor = '#3b82f6',
  titleColor = '#1e40af',
  widthMobile = 'min(88vw, 320px)',
  widthDesktop = '340px',
}) => (
  <PaperLoadingState
    isMobile={isMobile}
    label={toMysteryLabelCase(title)}
    containerStyle={{ padding: 0 }}
    cardStyle={{
      width: isMobile ? widthMobile : widthDesktop,
      padding: isMobile ? '20px 20px 22px' : '22px 24px 24px',
      justifyItems: 'center',
      gap: '14px',
    }}
    topSlot={<Icon size={isMobile ? 56 : 64} color={iconColor} className="pulse-slow" />}
    shimmerWidth="52%"
    skeletonLines={['100%', '78%']}
    labelStyle={{ color: titleColor, fontSize: isMobile ? '1.6rem' : '2rem' }}
    bottomSlot={subtitle ? (
      <p
        style={{
          color: '#64748b',
          fontSize: isMobile ? '1.05rem' : '1.25rem',
          margin: 0,
          textAlign: 'center',
        }}
      >
        {subtitle}
      </p>
    ) : null}
  />
);
