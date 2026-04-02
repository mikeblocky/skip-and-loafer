import { motion } from 'framer-motion';
import { triggerHaptic } from '../../../utils/haptics';
import { QuizActionButton, QUIZ_BUTTON_PALETTES } from '../quizGame/QuizPrimitives';
import { toMysteryLabelCase } from '../quizGame/ui';

const createResultPanelStyle = ({
  background,
  borderColor,
  bottomColor,
  padding = '20px',
}) => ({
  background,
  border: `3.5px solid ${borderColor}`,
  borderBottom: `9.5px solid ${bottomColor}`,
  borderRadius: '24px',
  padding,
  display: 'grid',
  gap: '14px',
});

const createResultMiniCardStyle = ({
  background,
  borderColor,
  bottomColor,
  padding = '14px 14px 12px 14px',
}) => ({
  background,
  border: `3px solid ${borderColor}`,
  borderBottom: `7px solid ${bottomColor}`,
  borderRadius: '18px',
  padding,
  display: 'grid',
  gap: '6px',
});

export const MysteryResultStage = ({ children }) => (
  <motion.div
    initial={{ scale: 0.94, opacity: 0, y: 24 }}
    animate={{ scale: 1, opacity: 1, y: 0 }}
    transition={{ type: 'spring', damping: 22, stiffness: 120 }}
    style={{
      width: '100%',
      maxWidth: '940px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
    }}
  >
    {children}
  </motion.div>
);

export const MysteryResultHeader = ({
  isMobile,
  title,
  subtitle,
  subtitleNote,
  titleColor = '#1e40af',
}) => (
  <div style={{ textAlign: 'center', display: 'grid', gap: '8px' }}>
    <div style={{ color: titleColor, fontSize: isMobile ? '2.1rem' : '2.7rem', lineHeight: 1.1 }}>
      {toMysteryLabelCase(title)}
    </div>
    <div style={{ color: '#475569', fontSize: isMobile ? '1.1rem' : '1.25rem' }}>{subtitle}</div>
    {subtitleNote ? (
      <div
        style={{
          color: '#64748b',
          fontSize: '0.95rem',
          maxWidth: '620px',
          margin: '0 auto',
          lineHeight: 1.45,
        }}
      >
        {subtitleNote}
      </div>
    ) : null}
  </div>
);

export const MysteryResultBody = ({ isMobile, artwork, children }) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: artwork && !isMobile ? '260px minmax(0, 1fr)' : '1fr',
      gap: '24px',
      alignItems: 'start',
    }}
  >
    {artwork ? <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>{artwork}</div> : null}
    <div style={{ display: 'grid', gap: '20px' }}>{children}</div>
  </div>
);

export const MysteryResultCharacterCard = ({ isMobile, colors, name, imageSrc, hideImage = false }) => (
  <motion.div
    whileHover={isMobile ? {} : { scale: 1.05, rotate: 1.5, y: -4 }}
    style={{
      background: colors.bg,
      border: `3.5px solid ${colors.border}`,
      borderRadius: '24px',
      borderBottomWidth: '11.5px',
      padding: '16px',
      boxShadow: `0 12px 32px ${colors.border}35`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '14px',
      position: 'relative',
      transform: 'rotate(-1.5deg)',
      width: isMobile ? '200px' : '240px',
      maxWidth: '100%',
    }}
    className="paper-interact"
  >
    {!hideImage && imageSrc ? (
      <img
        src={imageSrc}
        alt={name}
        style={{
          width: '100%',
          height: isMobile ? '180px' : '240px',
          objectFit: 'contain',
          filter: 'drop-shadow(4px 6px 12px rgba(0,0,0,0.2))',
        }}
        draggable="false"
      />
    ) : null}
    <div
      style={{
        fontSize: isMobile ? '1.35rem' : '1.55rem',
        color: colors.text,
        background: '#ffffff',
        padding: '4px 20px',
        borderRadius: '99px',
        border: `3.5px solid ${colors.border}`,
        boxShadow: '0 4px 0 rgba(0,0,0,0.05)',
        transform: 'rotate(1deg)',
        textAlign: 'center',
      }}
    >
      {name}
    </div>
  </motion.div>
);

export const MysteryResultOverviewGrid = ({ isMobile, items }) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr 1fr' : `repeat(${items.length}, minmax(0, 1fr))`,
      gap: '12px',
    }}
  >
    {items.map((item) => (
      <div
        key={item.key}
        className="sketchbook-border"
        style={createResultMiniCardStyle({
          background: item.bg,
          borderColor: item.border,
          bottomColor: item.border,
        })}
      >
        <div style={{ color: item.text, fontSize: '0.88rem', lineHeight: 1.2 }}>
          {toMysteryLabelCase(item.label)}
        </div>
        <div style={{ color: item.text, fontSize: isMobile ? '1.15rem' : '1.2rem', lineHeight: 1 }}>
          {item.value}
        </div>
      </div>
    ))}
  </div>
);

export const MysteryResultTextPanel = ({
  isMobile,
  icon: Icon,
  title,
  body,
  palette,
  paddingMobile = '20px',
  paddingDesktop = '20px',
  bodyFontSizeMobile = '1rem',
  bodyFontSizeDesktop = '1rem',
}) => (
  <div
    className="sketchbook-border"
    style={createResultPanelStyle({
      background: palette.background,
      borderColor: palette.borderColor,
      bottomColor: palette.bottomColor,
      padding: isMobile ? paddingMobile : paddingDesktop,
    })}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: palette.titleColor, fontSize: '1.15rem' }}>
      <Icon size={22} />
      {toMysteryLabelCase(title)}
    </div>
    <div
      style={{
        color: palette.textColor,
        fontSize: isMobile ? bodyFontSizeMobile : bodyFontSizeDesktop,
        lineHeight: 1.55,
      }}
    >
      {body}
    </div>
  </div>
);

export const MysteryResultContributionPanel = ({
  title,
  totalValue,
  totalLabel,
  entries,
  formatLabel,
  limit = 8,
}) => (
  <div
    className="sketchbook-border"
    style={createResultPanelStyle({
      background: '#f8fafc',
      borderColor: '#cbd5e1',
      bottomColor: '#94a3b8',
    })}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
      <div style={{ color: '#334155', fontSize: '1.15rem' }}>{toMysteryLabelCase(title)}</div>
      <div
        style={{
          color: '#0f172a',
          background: '#ffffff',
          border: '2px solid #cbd5e1',
          borderRadius: '999px',
          padding: '6px 12px',
          fontSize: '0.92rem',
        }}
      >
        {(totalValue || 0) > 0 ? '+' : ''}
        {Math.round(totalValue || 0)} {totalLabel}
      </div>
    </div>
    <div style={{ display: 'grid', gap: '10px' }}>
      {entries.slice(0, limit).map((entry) => (
        <div
          key={`${entry.label}-${entry.value}`}
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            alignItems: 'center',
            gap: '12px',
            background: '#ffffff',
            border: '2px solid #e2e8f0',
            borderRadius: '16px',
            padding: '12px 14px',
          }}
        >
          <div style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.25 }}>{formatLabel(entry)}</div>
          <div style={{ color: entry.value >= 0 ? '#166534' : '#b91c1c', fontSize: '0.95rem' }}>
            {entry.value >= 0 ? '+' : ''}
            {Math.round(entry.value)}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const MysteryResultTraitPanel = ({ isMobile, icon: Icon, title, children }) => (
  <div
    className="sketchbook-border"
    style={createResultPanelStyle({
      background: '#f8fbff',
      borderColor: '#bfdbfe',
      bottomColor: '#93c5fd',
    })}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#1e40af', fontSize: '1.15rem' }}>
      <Icon size={22} />
      {toMysteryLabelCase(title)}
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
      {children}
    </div>
  </div>
);

export const MysteryResultTraitCard = ({
  trait,
  valueLabel,
  valueMinWidth = '58px',
  badges = [],
}) => (
  <div
    className="sketchbook-border"
    style={createResultMiniCardStyle({
      background: '#ffffff',
      borderColor: trait.color,
      bottomColor: trait.color,
      padding: '14px 16px',
    })}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'start' }}>
      <div style={{ color: '#1e293b', fontSize: '1rem', lineHeight: 1.2 }}>{toMysteryLabelCase(trait.label)}</div>
      <div
        style={{
          minWidth: valueMinWidth,
          textAlign: 'center',
          color: trait.color,
          background: `${trait.color}14`,
          border: `2px solid ${trait.color}`,
          borderRadius: '999px',
          padding: '4px 10px',
          fontSize: '0.92rem',
          lineHeight: 1,
        }}
      >
        {valueLabel}
      </div>
    </div>
    <div style={{ color: '#475569', fontSize: '0.92rem', lineHeight: 1.4 }}>{trait.description}</div>
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      {badges.filter(Boolean).map((badge, index) => (
        <span
          key={badge.key || `${trait.key}-badge-${index}`}
          style={{
            color: badge.color || '#475569',
            background: badge.background || '#f8fafc',
            borderRadius: '999px',
            padding: '4px 10px',
            fontSize: '0.82rem',
            lineHeight: 1,
          }}
        >
          {badge.label}
        </span>
      ))}
    </div>
  </div>
);

export const MysteryResultRankingPanel = ({
  isMobile,
  title,
  headerAction,
  scores,
  scoreFormatter,
  bottomStats,
  maxBottomColumns = 4,
}) => (
  <div
    className="sketchbook-border"
    style={createResultPanelStyle({
      background: '#ffffff',
      borderColor: '#cbd5e1',
      bottomColor: '#94a3b8',
    })}
  >
    <div style={{ display: 'grid', gap: '12px' }}>
      <div style={{ color: '#334155', fontSize: '1.15rem', textAlign: isMobile ? 'center' : 'left' }}>
        {toMysteryLabelCase(title)}
      </div>
      {headerAction}
    </div>
    <div style={{ display: 'grid', gap: '10px' }}>
      {scores.map((entry, index) => (
        <div
          key={entry.name}
          style={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr auto',
            alignItems: 'center',
            gap: '12px',
            background: index === 0 ? '#eff6ff' : '#f8fafc',
            border: `2px solid ${index === 0 ? '#93c5fd' : '#e2e8f0'}`,
            borderRadius: '18px',
            padding: '12px 14px',
          }}
        >
          <span style={{ color: '#64748b', fontSize: '0.92rem' }}>{index + 1}</span>
          <span style={{ color: index === 0 ? '#1e40af' : '#334155', fontSize: '1rem' }}>{entry.name}</span>
          <span style={{ color: '#0f172a', fontSize: '0.95rem' }}>{scoreFormatter(entry)}</span>
        </div>
      ))}
    </div>
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr 1fr' : `repeat(${Math.min(bottomStats.length, maxBottomColumns)}, minmax(0, 1fr))`,
        gap: '10px',
      }}
    >
      {bottomStats.map((item) => (
        <div
          key={item.label}
          className="sketchbook-border"
          style={createResultMiniCardStyle({
            background: '#f8fafc',
            borderColor: '#e2e8f0',
            bottomColor: '#cbd5e1',
            padding: '12px 12px 10px 12px',
          })}
        >
          <div style={{ color: '#64748b', fontSize: '0.82rem', lineHeight: 1.2 }}>
            {toMysteryLabelCase(item.label)}
          </div>
          <div style={{ color: '#0f172a', fontSize: '1rem', lineHeight: 1.15 }}>{item.value}</div>
        </div>
      ))}
    </div>
  </div>
);

export const MysteryResultRestartButton = ({ isMobile, label, onRestart }) => (
  <div style={{ display: 'flex', justifyContent: 'center' }}>
    <QuizActionButton
      isMobile={isMobile}
      onClick={() => {
        triggerHaptic('success');
        onRestart();
      }}
      palette={QUIZ_BUTTON_PALETTES.blue}
      whileHover={{ scale: 1.04, y: -3 }}
      whileTap={{ scale: 0.95, y: 6 }}
      style={{
        padding: isMobile ? '14px 28px' : '16px 44px',
        borderRadius: '22px',
        fontSize: isMobile ? '1.15rem' : '1.25rem',
        boxShadow: '0 10px 0 rgba(37, 99, 235, 0.2)',
      }}
    >
      {toMysteryLabelCase(label)}
    </QuizActionButton>
  </div>
);
