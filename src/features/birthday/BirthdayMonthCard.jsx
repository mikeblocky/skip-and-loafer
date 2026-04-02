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
}) => {
  const [rotation] = useState(() => (Math.random() * 3) - 1.5);

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, scale: 0.95, y: 20 }}
      animate={reduceMotion ? { opacity: 1, scale: 1, y: 0, rotate: rotation } : { opacity: 1, scale: 1, y: 0, rotate: rotation }}
      transition={{ delay: 0.1 + (month * 0.05) }}
      style={{
        background: '#ffffff',
        border: '3px solid #e5e7eb',
        borderBottom: '8px solid #e5e7eb',
        borderRadius: '24px',
        padding: '20px 16px',
        position: 'relative',
        boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '-15px',
          left: '50%',
          transform: 'translateX(-50%) rotate(-2deg)',
          width: '60px',
          height: '24px',
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          backdropFilter: 'blur(2px)',
          zIndex: 2,
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span
          style={{
            fontFamily: '"Sniglet", "Coming Soon", cursive',
            fontSize: '1.2rem',
            color: isCurrentMonth ? '#3b82f6' : '#6b7280',
            fontWeight: '400',
          }}
        >
          {monthLabels[month - 1]}
        </span>
        {isCurrentMonth ? <Star size={16} fill="#3b82f6" color="#3b82f6" /> : null}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {birthdays.length ? birthdays.map((birthday) => {
          const status = getBirthdayStatus(birthday.month, birthday.day, referenceDate);

          return (
            <div
              key={birthday.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: isMobile ? '14px 12px' : '14px 16px',
                background: '#ffffff',
                borderRadius: '20px',
                border: `3px solid ${birthday.color}`,
                borderBottom: `8px solid ${birthday.color}`,
                boxShadow: `0 8px 20px ${birthday.color}15`,
                opacity: status.passed ? 0.6 : 1,
                transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                position: 'relative',
              }}
            >
              <div
                style={{
                  width: isMobile ? '40px' : '44px',
                  height: isMobile ? '40px' : '44px',
                  borderRadius: '12px',
                  background: birthday.bg,
                  border: `2.5px solid ${birthday.color}`,
                  borderBottom: `4px solid ${birthday.color}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: birthday.color,
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    fontFamily: '"Sniglet", "Coming Soon", cursive',
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
                    fontFamily: '"Sniglet", "Coming Soon", cursive',
                    fontWeight: '400',
                    fontSize: isMobile ? '1rem' : '1.1rem',
                    color: '#374151',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    lineHeight: 1,
                  }}
                >
                  {getCharacterDisplayName(birthday.name, uiLanguage)}
                </span>
                <span
                  style={{
                    fontFamily: '"Sniglet", "Coming Soon", cursive',
                    fontSize: '0.75rem',
                    color: status.isToday ? birthday.color : '#9ca3af',
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
            <Calendar size={20} color="#9ca3af" />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default BirthdayMonthCard;
