import { motion } from 'framer-motion';
import { Calendar, Gift, Pin } from 'lucide-react';
import { getDaysUntilBirthday } from './birthdayUtils';
import { getCharacterFullName } from '../../data/characterNames';

const BirthdayFeaturedHero = ({
  isMobile,
  featuredBirthday,
  isBirthdayToday,
  t,
  referenceDate,
  uiLanguage = 'en',
  darkMode = false,
}) => {
  if (!featuredBirthday) {
    return null;
  }

  const daysUntil = getDaysUntilBirthday(featuredBirthday.month, featuredBirthday.day, referenceDate);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        marginBottom: isMobile ? '48px' : '72px',
        width: '100%',
      }}
    >
      <motion.div
        className="sketchbook-border"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        whileHover={{ y: -2, scale: 1.01 }}
        style={{
          width: '100%',
          maxWidth: isMobile ? '100%' : '540px',
          background: darkMode
            ? `linear-gradient(135deg, ${featuredBirthday.darkBg || '#2e2a27'} 0%, var(--surface-card, #201e1d) 100%)`
            : `linear-gradient(135deg, ${featuredBirthday.bg} 0%, var(--surface-card, #ffffff) 100%)`,
          border: `3px solid ${darkMode ? (featuredBirthday.darkColor || '#ece3cc') : featuredBirthday.color}`,
          borderBottom: `8px solid ${darkMode ? (featuredBirthday.darkColor || '#ece3cc') : featuredBirthday.color}`,
          padding: isMobile ? '24px' : '32px',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: 'center',
          gap: '28px',
          position: 'relative',
          boxShadow: darkMode ? 'none' : `0 8px 30px ${featuredBirthday.color}20`,
          cursor: 'default',
          transform: 'none',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-20%',
            right: '-10%',
            width: '240px',
            height: '240px',
            background: darkMode
              ? `${featuredBirthday.darkColor || '#ece3cc'}05`
              : `${featuredBirthday.color}15`,
            borderRadius: '50%',
            filter: 'blur(50px)',
            zIndex: 0,
          }}
        />

        <div style={{ position: 'absolute', top: '22px', right: '22px', zIndex: 2 }}>
          <Pin
            size={32}
            color={darkMode ? (featuredBirthday.darkColor || '#ece3cc') : featuredBirthday.color}
            style={{ opacity: 0.3, transform: 'rotate(15deg)' }}
          />
        </div>

        {uiLanguage !== 'ja' ? (
          <div
            className="sketchbook-border"
            style={{
              width: isMobile ? '120px' : '150px',
              height: isMobile ? '120px' : '150px',
              background: 'var(--surface-card, #ffffff)',
              border: `3px solid ${darkMode ? (featuredBirthday.darkColor || '#ece3cc') : featuredBirthday.color}`,
              borderBottom: `6px solid ${darkMode ? (featuredBirthday.darkColor || '#ece3cc') : featuredBirthday.color}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              boxShadow: darkMode ? 'none' : `0 6px 16px ${featuredBirthday.color}25`,
              flexShrink: 0,
              zIndex: 1,
            }}
          >
            {featuredBirthday.img ? (
              <img
                src={featuredBirthday.img}
                alt={getCharacterFullName(featuredBirthday.name, uiLanguage, featuredBirthday.name)}
                style={{ width: '92%', height: '92%', objectFit: 'contain' }}
              />
            ) : (
              <featuredBirthday.icon
                size={isMobile ? 78 : 94}
                color={darkMode ? (featuredBirthday.darkColor || '#ece3cc') : featuredBirthday.color}
              />
            )}
          </div>
        ) : null}

        <div style={{ flex: 1, textAlign: isMobile ? 'center' : 'left', zIndex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: isMobile ? 'center' : 'flex-start' }}>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: darkMode ? (featuredBirthday.darkColor || '#ece3cc') : featuredBirthday.color,
              }}
            />
            <span
              className="no-override"
              style={{
                fontFamily: 'var(--font-paper)',
                color: darkMode ? (featuredBirthday.darkColor || '#ece3cc') : featuredBirthday.color,
                fontSize: '1.1rem',
                fontWeight: '400',
                opacity: 0.9,
              }}
            >
              {isBirthdayToday ? t.birthdayToday : t.featuredTitle}
            </span>
          </div>
          <h2
            style={{
              fontFamily: 'var(--font-paper)',
              fontSize: isMobile ? '1.8rem' : '2.4rem',
              fontWeight: '400',
              color: darkMode ? (featuredBirthday.darkColor || '#ece3cc') : featuredBirthday.color,
              margin: '4px 0 12px 0',
              lineHeight: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {getCharacterFullName(featuredBirthday.name, uiLanguage, featuredBirthday.fullName)}
          </h2>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              background: 'var(--surface-card, #ffffff)',
              padding: '8px 20px',
              borderRadius: '99px',
              border: `2px solid ${darkMode ? (featuredBirthday.darkColor || '#ece3cc') : featuredBirthday.color}`,
              borderBottom: `4px solid ${darkMode ? (featuredBirthday.darkColor || '#ece3cc') : featuredBirthday.color}`,
              color: darkMode ? (featuredBirthday.darkColor || '#ece3cc') : featuredBirthday.color,
              fontWeight: '400',
              fontFamily: 'var(--font-paper)',
              boxShadow: darkMode ? 'none' : `0 4px 12px ${featuredBirthday.color}15`,
            }}
          >
            {isBirthdayToday ? <Gift size={20} /> : <Calendar size={20} />}
            <span className="no-override">
              {featuredBirthday.month}/{featuredBirthday.day} •{' '}
              {isBirthdayToday ? t.today : `${t.in} ${daysUntil} ${t.dayUnit}`}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default BirthdayFeaturedHero;
