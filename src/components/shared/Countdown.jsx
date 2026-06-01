/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { differenceInSeconds, isBefore } from 'date-fns';

const TARGET_DATE = new Date('2026-06-25T00:00:00+09:00');

const UI_TEXT = {
    en: { days: 'days', hours: 'hrs', minutes: 'min', seconds: 'sec', loading: 'Loading...' },
    es: { days: 'días', hours: 'hrs', minutes: 'min', seconds: 'seg', loading: 'Cargando...' },
    pt: { days: 'dias', hours: 'hrs', minutes: 'min', seconds: 'seg', loading: 'Carregando...' },
    fr: { days: 'jours', hours: 'h', minutes: 'min', seconds: 'sec', loading: 'Chargement...' },
    de: { days: 'Tage', hours: 'Std', minutes: 'Min', seconds: 'Sek', loading: 'Lädt...' },
    it: { days: 'giorni', hours: 'ore', minutes: 'min', seconds: 'sec', loading: 'Caricamento...' },
    ja: { days: '日', hours: '時間', minutes: '分', seconds: '秒', loading: '読み込み中...' },
};

const flipVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 }
};

const COUNTDOWN_PALETTES = [
    {
        header: '#f9a8d4', // Pink
        ink: '#db2777',
        shell: '#ffffff',
        border: '#db2777',
        label: '#9d174d',
    },
    {
        header: '#86efac', // Green
        ink: '#166534',
        shell: '#ffffff',
        border: '#166534',
        label: '#14532d',
    },
    {
        header: '#93c5fd', // Blue
        ink: '#1d4ed8',
        shell: '#ffffff',
        border: '#1d4ed8',
        label: '#1e40af',
    },
    {
        header: '#fde047', // Yellow
        ink: '#a16207',
        shell: '#ffffff',
        border: '#a16207',
        label: '#713f12',
    },
];

const CalendarPad = ({ value, label, delay, palette, isMobile, largeText = false }) => (
    <motion.div
        className="sketchbook-border"
        style={{
            width: isMobile ? 'calc((100% - 18px) / 4)' : (largeText ? '9.35rem' : '8.95rem'),
            height: isMobile ? (largeText ? '110px' : '98px') : (largeText ? '11.85rem' : '11.25rem'),
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
            flexShrink: 0,
            flex: isMobile ? '1 1 0%' : undefined,
            cursor: 'pointer',
            border: `3.5px solid ${palette.border}`,
            borderBottom: `8px solid ${palette.border}`,
            borderRadius: '16px',
            overflow: 'hidden',
            backgroundColor: palette.shell,
        }}
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        whileHover={{ 
            y: -4,
            borderColor: palette.ink,
            borderBottomColor: palette.ink,
        }}
        whileTap={{ scale: 0.98 }}
        transition={{ delay, type: 'spring', stiffness: 300, damping: 18 }}
    >
        {/* Header */}
        <div
            style={{
                width: '100%',
                height: isMobile ? '22px' : (largeText ? '42px' : '40px'),
                backgroundColor: palette.header,
                borderBottom: `3.5px solid ${palette.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        />

        {/* Content */}
        <div style={{
            flex: 1,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: isMobile ? '2px' : (largeText ? '8px' : '7px'),
            background: palette.shell,
            paddingBottom: isMobile ? '2px' : '0px',
        }}>
            <AnimatePresence mode="wait">
                <motion.span
                    key={value}
                    variants={flipVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.15 }}
                    style={{
                        fontSize: isMobile ? (largeText ? '1.75rem' : '1.5rem') : (largeText ? '3.72rem' : '3.4rem'),
                        fontFamily: 'Sniglet, var(--font-hand)',
                        fontWeight: 'bold',
                        color: palette.ink,
                        lineHeight: 1
                    }}
                >
                    {String(value).padStart(2, '0')}
                </motion.span>
            </AnimatePresence>

            {/* Labels */}
            <span style={{
                fontFamily: 'var(--font-main)',
                fontSize: isMobile ? '0.62rem' : (largeText ? '1.02rem' : '0.96rem'),
                color: palette.label,
                letterSpacing: '0.04em',
                fontWeight: '500',
            }}>
                {label}
            </span>
        </div>
    </motion.div>
);

const Countdown = ({ isMobile = false, uiLanguage = 'en', largeText = false }) => {
    const [timeLeft, setTimeLeft] = useState(null);
    const t = UI_TEXT[uiLanguage] || UI_TEXT.en;

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            if (isBefore(now, TARGET_DATE)) {
                const totalSeconds = differenceInSeconds(TARGET_DATE, now);
                const days = Math.floor(totalSeconds / (60 * 60 * 24));
                const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
                const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
                const seconds = totalSeconds % 60;
                setTimeLeft({ days, hours, minutes, seconds });
            } else {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            }
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);
        return () => clearInterval(timer);
    }, []);

    if (!timeLeft) return <div style={{ fontFamily: 'var(--font-main)', color: '#9ca3af' }}>{t.loading}</div>;

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'row',
            gap: isMobile ? '6px' : (largeText ? '16px' : '14px'),
            justifyContent: 'center',
            flexWrap: 'nowrap',
            alignItems: 'center',
            width: '100%',
            maxWidth: '100%'
        }}>
            <CalendarPad value={timeLeft.days || 0} label={t.days} delay={0.05} palette={COUNTDOWN_PALETTES[0]} isMobile={isMobile} largeText={largeText} />
            <CalendarPad value={timeLeft.hours || 0} label={t.hours} delay={0.1} palette={COUNTDOWN_PALETTES[1]} isMobile={isMobile} largeText={largeText} />
            <CalendarPad value={timeLeft.minutes || 0} label={t.minutes} delay={0.15} palette={COUNTDOWN_PALETTES[2]} isMobile={isMobile} largeText={largeText} />
            <CalendarPad value={timeLeft.seconds || 0} label={t.seconds} delay={0.2} palette={COUNTDOWN_PALETTES[3]} isMobile={isMobile} largeText={largeText} />
        </div>
    );
};

export default Countdown;

