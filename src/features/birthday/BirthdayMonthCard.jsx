import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Star } from 'lucide-react';
import { getBirthdayStatus } from './birthdayUtils';
import { getCharacterDisplayName } from '../../data/characterNames';

const BirthdayMonthCard = ({
  month,
  birthdays,
  isMobile,
  isCurrentMonth,
  t,
  monthLabels,
  reduceMotion,
  referenceDate,
  uiLanguage = 'en',
  darkMode = false,
}) => {
  const [rotation] = useState(() => (Math.random() * 3) - 1.5);

  return (
    <motion.div
      className="sketchbook-border"
      initial={reduceMotion ? false : { opacity: 0, scale: 0.95, y: 20 }}
      animate={reduceMotion ? { opacity: 1, scale: 1, y: 0, rotate: rotation } : { opacity: 1, scale: 1, y: 0, rotate: rotation }}
      transition={{ delay: 0.1 + (month * 0.05) }}
      style={{
        background: 'var(--surface-card, #ffffff)',
        border: isCurrentMonth ? (darkMode ? '3px solid #60a5fa' : '3px solid #3b82f6') : (darkMode ? '3px solid var(--surface-border)' : '3px solid #cbd5e1'),
        borderBottom: isCurrentMonth ? (darkMode ? '8px solid #60a5fa' : '8px solid #1d4ed8') : (darkMode ? '8px solid var(--surface-border-strong)' : '8px solid #cbd5e1'),
        padding: '20px 16px',
        position: 'relative',
        boxShadow: darkMode ? 'none' : (isCurrentMonth ? '0 8px 24px rgba(59, 130, 246, 0.12)' : '0 4px 12px rgba(0, 0, 0, 0.02)'),
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      <div
        className={`washi-tape ${isCurrentMonth ? 'washi-tape--blue' : (month % 2 === 0 ? 'washi-tape--pink' : 'washi-tape--yellow')}`}
        style={{
          top: '-14px',
          left: '50%',
          transform: 'translateX(-50%) rotate(-2.5deg)',
          width: '74px',
          height: '22px',
          zIndex: 5,
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span
          style={{
            fontFamily: 'var(--font-paper)',
            fontSize: '1.2rem',
            color: isCurrentMonth ? (darkMode ? '#60a5fa' : '#3b82f6') : (darkMode ? 'var(--text-secondary)' : '#6b7280'),
            fontWeight: '400',
          }}
        >
          {monthLabels[month - 1]}
        </span>
        {isCurrentMonth ? <Star size={16} fill={darkMode ? '#60a5fa' : '#3b82f6'} color={darkMode ? '#60a5fa' : '#3b82f6'} /> : null}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {birthdays.length ? birthdays.map((birthday) => {
          const status = getBirthdayStatus(birthday.month, birthday.day, referenceDate);

          return (
            <div
              key={birthday.name}
              className="sketchbook-border"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: isMobile ? '14px 12px' : '14px 16px',
                background: 'var(--surface-card, #ffffff)',
                border: `3px solid ${darkMode ? (birthday.darkColor || '#4d4641') : birthday.color}`,
                borderBottom: `5px solid ${darkMode ? (birthday.darkColor || '#4d4641') : birthday.color}`,
                boxShadow: darkMode ? 'none' : `0 6px 16px ${birthday.color}15`,
                opacity: status.passed ? 0.6 : 1,
                transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                position: 'relative',
              }}
            >
              <div
                className="sketchbook-border"
                style={{
                  width: isMobile ? '40px' : '44px',
                  height: isMobile ? '40px' : '44px',
                  background: darkMode ? (birthday.darkBg || 'var(--surface-card)') : birthday.bg,
                  border: `2.5px solid ${darkMode ? (birthday.darkColor || 'var(--surface-border)') : birthday.color}`,
                  borderBottom: `4px solid ${darkMode ? (birthday.darkColor || 'var(--surface-border)') : birthday.color}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: darkMode ? (birthday.darkColor || 'var(--text-primary)') : birthday.color,
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-paper)',
                    fontWeight: '400',
                    fontSize: isMobile ? '1.1rem' : '1.2rem',
                  }}
                >
                  {birthday.day}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <span
                  style={{
                    fontFamily: 'var(--font-paper)',
                    fontWeight: '400',
                    fontSize: isMobile ? '1rem' : '1.1rem',
                    color: darkMode ? 'var(--text-primary)' : '#374151',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    lineHeight: 1,
                  }}
                >
                  {getCharacterDisplayName(birthday.name, uiLanguage)}
                </span>
                <span
                  className="no-override"
                  style={{
                    fontFamily: 'var(--font-paper)',
                    fontSize: '0.75rem',
                    color: status.isToday
                      ? (darkMode ? (birthday.darkColor || '#60a5fa') : birthday.color)
                      : (darkMode ? 'var(--text-muted)' : '#9ca3af'),
                    fontWeight: '400',
                    marginTop: '2px',
                    opacity: 0.8,
                  }}
                >
                  {status.isToday
                    ? t.today
                    : status.passed
                      ? t.passed
                      : status.daysUntil === 1
                        ? t.tomorrow
                        : `${status.daysUntil} ${t.dayUnit}`}
                </span>
              </div>
            </div>
          );
        }) : (
          <div style={{ padding: '12px', textAlign: 'center', opacity: 0.2 }}>
            <Calendar size={20} color={darkMode ? 'var(--text-muted)' : '#9ca3af'} />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default BirthdayMonthCard;
