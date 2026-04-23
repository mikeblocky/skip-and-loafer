/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { differenceInSeconds, isBefore } from 'date-fns';

const TARGET_DATE = new Date(2026, 3, 24); // Local April 24, 2026

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
    initial: { rotateX: -90, opacity: 0, scale: 0.85, scaleY: 0.8 },
    animate: { rotateX: 0, opacity: 1, scale: 1, scaleY: 1 },
    exit: { rotateX: 90, opacity: 0, scale: 0.85, scaleY: 1.15 }
};

const COUNTDOWN_PALETTES = [
    {
        header: '#ff5ca8',
        ink: '#e93f86',
        shell: '#ffffff',
        ring: '#ffb8d2',
        label: '#8c5a78',
        shadow: 'rgba(233, 63, 134, 0.18)',
    },
    {
        header: '#63e08b',
        ink: '#21b95a',
        shell: '#ffffff',
        ring: '#b6ebc9',
        label: '#4d7d5d',
        shadow: 'rgba(33, 185, 90, 0.18)',
    },
    {
        header: '#63b8ff',
        ink: '#1d8fe6',
        shell: '#ffffff',
        ring: '#b9dcff',
        label: '#4e6b88',
        shadow: 'rgba(29, 143, 230, 0.18)',
    },
    {
        header: '#ffd84a',
        ink: '#e6a800',
        shell: '#ffffff',
        ring: '#f7e08a',
        label: '#8a661a',
        shadow: 'rgba(230, 168, 0, 0.18)',
    },
];

const CalendarPad = ({ value, label, delay, palette, isMobile, largeText = false, inlineMobile = false }) => (
    <motion.div
        className="calendar-pad"
        style={{
            width: isMobile ? (inlineMobile ? 'calc((100% - 12px) / 4)' : '100%') : (largeText ? '9.35rem' : '8.95rem'),
            height: isMobile ? (inlineMobile ? (largeText ? '126px' : '118px') : '86px') : (largeText ? '11.85rem' : '11.25rem'),
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
            perspective: '500px',
            flexShrink: 0,
            flex: isMobile && inlineMobile ? '0 0 calc((100% - 12px) / 4)' : undefined,
            filter: `drop-shadow(0 12px 18px ${palette.shadow})`,
        }}
        initial={{ y: -25, opacity: 0, scale: 0.85, rotate: -2 }}
        animate={{ y: 0, opacity: 1, scale: 1, rotate: 0 }}
        transition={{ delay, type: 'spring', stiffness: 300, damping: 16 }}
    >
        {/* Header */}
        <div
            style={{
                width: '100%',
                height: isMobile ? (inlineMobile ? '25px' : '26px') : (largeText ? '42px' : '40px'),
                backgroundColor: palette.header,
                position: 'relative',
                borderTopLeftRadius: '4px',
                borderTopRightRadius: '4px',
                border: `2px solid ${palette.ring}`,
                borderBottom: 'none',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.36)',
            }}
        >
            <div style={{ position: 'absolute', top: '-4px', left: 0, width: '100%', height: '12px', display: 'flex', justifyContent: 'space-between', padding: isMobile ? '0 6px' : '0 6px' }}>
                {[...Array(isMobile ? 4 : 6)].map((_, i) => (
                    <div key={i} style={{ width: isMobile ? (inlineMobile ? '7px' : '8px') : (largeText ? '11px' : '10px'), height: isMobile ? (inlineMobile ? '12px' : '14px') : (largeText ? '19px' : '18px'), borderRadius: '9999px', border: '2px solid #9ca3af', backgroundColor: '#e5e7eb', zIndex: 20 }}></div>
                ))}
            </div>
        </div>

        {/* Content - fixed vertical alignment */}
        <div style={{
            flex: 1,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: isMobile ? (inlineMobile ? '4px' : '5px') : (largeText ? '8px' : '7px'),
            paddingTop: isMobile ? (inlineMobile ? '6px' : '10px') : (largeText ? '10px' : '9px'),
            paddingBottom: isMobile ? (inlineMobile ? '6px' : '4px') : (largeText ? '10px' : '9px'),
            background: palette.shell,
            borderLeft: `2px solid ${palette.ring}`,
            borderRight: `2px solid ${palette.ring}`,
            borderBottom: `5px solid ${palette.ink}`,
            borderBottomLeftRadius: '4px',
            borderBottomRightRadius: '4px',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.88), inset 0 -3px 0 rgba(241, 245, 249, 0.9)',
        }}>
            <AnimatePresence mode="wait">
                <motion.span
                    key={value}
                    variants={flipVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ type: 'spring', stiffness: 400, damping: 15, mass: 0.5 }}
                    style={{
                        fontSize: isMobile ? (inlineMobile ? (largeText ? '2rem' : '1.88rem') : '1.9rem') : (largeText ? '3.72rem' : '3.4rem'),
                        fontFamily: 'var(--font-hand)',
                        fontWeight: 'bold',
                        color: palette.ink,
                        lineHeight: 1
                    }}
                >
                    {String(value).padStart(2, '0')}
                </motion.span>
            </AnimatePresence>

            {/* Labels - not bold, properly positioned */}
            <span style={{
                fontFamily: 'var(--font-main)',
                fontSize: isMobile ? (inlineMobile ? '0.66rem' : '0.74rem') : (largeText ? '1.02rem' : '0.96rem'),
                color: palette.label,
                letterSpacing: '0.08em',
                fontWeight: 'normal'
            }}>
                {label}
            </span>
        </div>
    </motion.div>
);

const Countdown = ({ isMobile = false, uiLanguage = 'en', largeText = false, inlineMobile = false }) => {
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
            display: isMobile ? (inlineMobile ? 'flex' : 'grid') : 'flex',
            gridTemplateColumns: isMobile && !inlineMobile ? 'repeat(2, minmax(0, 1fr))' : undefined,
            flexDirection: 'row',
            gap: isMobile ? (inlineMobile ? '4px' : '8px') : (largeText ? '16px' : '14px'),
            justifyContent: 'center',
            flexWrap: 'nowrap',
            alignItems: 'center',
            width: '100%',
            maxWidth: isMobile ? (inlineMobile ? '100%' : '320px') : (largeText ? '800px' : 'none')
        }}>
            <CalendarPad value={timeLeft.days || 0} label={t.days} delay={0.1} palette={COUNTDOWN_PALETTES[0]} isMobile={isMobile} largeText={largeText} inlineMobile={inlineMobile} />
            <CalendarPad value={timeLeft.hours || 0} label={t.hours} delay={0.2} palette={COUNTDOWN_PALETTES[1]} isMobile={isMobile} largeText={largeText} inlineMobile={inlineMobile} />
            <CalendarPad value={timeLeft.minutes || 0} label={t.minutes} delay={0.3} palette={COUNTDOWN_PALETTES[2]} isMobile={isMobile} largeText={largeText} inlineMobile={inlineMobile} />
            <CalendarPad value={timeLeft.seconds || 0} label={t.seconds} delay={0.4} palette={COUNTDOWN_PALETTES[3]} isMobile={isMobile} largeText={largeText} inlineMobile={inlineMobile} />
        </div>
    );
};

export default Countdown;

