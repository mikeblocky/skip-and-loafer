/* eslint-disable no-unused-vars */
import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cake, Sparkles, Star, Heart, Dog, Cat, Music, Coffee, Gift, Pizza, Sun, Cloud, Ghost, Gem, Rabbit, Bird, Fish, Snail, Skull, PawPrint } from 'lucide-react';

const UI_TEXT = {
    en: { title: 'Birthdays', next: 'Next', in: 'in', today: 'TODAY!', passed: 'passed', tomorrow: 'Tomorrow!', birthdayToday: 'birthday today!', characters: 'characters', dayUnit: 'days' },
    es: { title: 'Cumpleaños', next: 'Siguiente', in: 'en', today: '¡HOY!', passed: 'pasó', tomorrow: '¡Mañana!', birthdayToday: 'cumpleaños hoy!', characters: 'personajes', dayUnit: 'días' },
    pt: { title: 'Aniversários', next: 'Próximo', in: 'em', today: 'HOJE!', passed: 'passou', tomorrow: 'Amanhã!', birthdayToday: 'aniversário hoje!', characters: 'personagens', dayUnit: 'dias' },
    fr: { title: 'Anniversaires', next: 'Prochain', in: 'dans', today: 'AUJOURD’HUI !', passed: 'passé', tomorrow: 'Demain !', birthdayToday: 'anniversaire aujourd’hui !', characters: 'personnages', dayUnit: 'jours' },
    de: { title: 'Geburtstage', next: 'Nächster', in: 'in', today: 'HEUTE!', passed: 'vorbei', tomorrow: 'Morgen!', birthdayToday: 'hat heute Geburtstag!', characters: 'Charaktere', dayUnit: 'Tage' },
    it: { title: 'Compleanni', next: 'Prossimo', in: 'tra', today: 'OGGI!', passed: 'passato', tomorrow: 'Domani!', birthdayToday: 'compie gli anni oggi!', characters: 'personaggi', dayUnit: 'giorni' },
};

const LOCALE_BY_UI_LANGUAGE = {
    en: 'en-US',
    es: 'es-ES',
    pt: 'pt-BR',
    fr: 'fr-FR',
    de: 'de-DE',
    it: 'it-IT',
};

/* ─── Birthday data ─── */
const BIRTHDAYS = [
    { name: 'Kanechika', fullName: 'Kanechika Narumi', month: 2, day: 1, color: '#4338ca', bg: '#eef2ff' },
    { name: 'Mitsumi', fullName: 'Iwakura Mitsumi', month: 3, day: 3, color: '#e67e5f', bg: '#fff2ed' },
    { name: 'Makoto', fullName: 'Kurume Makoto', month: 4, day: 17, color: '#7c3aed', bg: '#f5f3ff' },
    { name: 'Kazakami', fullName: 'Kazakami Hiroto', month: 4, day: 24, color: '#fb923c', bg: '#fffaf5' },
    { name: 'Mukai', fullName: 'Mukai Tsukasa', month: 5, day: 19, color: '#64748b', bg: '#f1f5f9' },
    { name: 'Takamine', fullName: 'Takamine Tokiko', month: 6, day: 30, color: '#b91c1c', bg: '#fef2f2' },
    { name: 'Mika', fullName: 'Egashira Mika', month: 7, day: 29, color: '#f43f5e', bg: '#fff1f2' },
    { name: 'Yamada', fullName: 'Yamada Kentaro', month: 8, day: 6, color: '#f97316', bg: '#fff7ed' },
    { name: 'Chris', fullName: 'Fukunaga Chris', month: 8, day: 24, color: '#0ea5e9', bg: '#f0f9ff' },
    { name: 'Shima', fullName: 'Shima Sousuke', month: 10, day: 9, color: '#eab308', bg: '#fefce8' },
    { name: 'Ririka', fullName: 'Saijou Ririka', month: 10, day: 30, color: '#881337', bg: '#fff1f2' },
    { name: 'Yuzuki', fullName: 'Murashige Yuzuki', month: 12, day: 11, color: '#14b8a6', bg: '#f0fdfa' },
];

const isTodayBirthday = (m, d) => { const n = new Date(); return n.getMonth() + 1 === m && n.getDate() === d; };
const hasPassed = (month, day) => {
    const n = new Date(); return new Date(n.getFullYear(), month - 1, day, 23, 59, 59) < new Date(n.getFullYear(), n.getMonth(), n.getDate());
};
const getDaysUntil = (month, day) => {
    const n = new Date(), y = n.getFullYear();
    let bd = new Date(y, month - 1, day);
    if (bd.getMonth() === n.getMonth() && bd.getDate() === n.getDate()) return 0;
    if (bd < n) bd = new Date(y + 1, month - 1, day);
    return Math.ceil((bd - n) / 864e5);
};

/* ─── Per-character funky & fluffy animations ─── */
const CHAR_ANIM = {
    Mitsumi: { animate: { y: [0, -12, 0], rotate: [0, 8, -8, 0], scale: [1, 1.05, 1] }, dur: 3.8 },
    Shima: { animate: { scale: [1, 1.15, 1], rotate: [0, -5, 5, 0], skewX: [0, 5, -5, 0] }, dur: 5.0 },
    Makoto: { animate: { y: [0, -8, 0], scale: [1, 1.1, 1], skewY: [0, 3, -3, 0] }, dur: 4.5 },
    Kazakami: { animate: { rotate: [-8, 8, -8], y: [0, -5, 0], scale: [1, 1.05, 1] }, dur: 3.5 },
    Mukai: { animate: { x: [-6, 6, -6], rotate: [-4, 4, -4], scale: [1, 1.08, 1] }, dur: 4.2 },
    Takamine: { animate: { scale: [1, 1.1, 1], y: [0, -7, 0], rotateX: [0, 15, -15, 0] }, dur: 3.0 },
    Mika: { animate: { y: [0, -10, 0], rotate: [0, -8, 8, 0], x: [-3, 3, -3], scale: [1, 1.12, 1] }, dur: 3.4 },
    Yamada: { animate: { y: [0, -15, 0], scale: [1, 1.2, 0.9, 1], rotate: [0, 10, -10, 0] }, dur: 2.2 },
    Chris: { animate: { x: [-8, 8, -8], y: [0, -5, 0], rotate: [-10, 10, -10], scale: [1, 1.1, 1] }, dur: 4.0 },
    Kanechika: { animate: { rotate: [-12, 12, -12], scale: [1, 1.15, 1], y: [0, -4, 0] }, dur: 3.2 },
    Ririka: { animate: { scale: [1, 1.2, 1], rotate: [0, 5, -5, 0], skewX: [0, 8, -8, 0] }, dur: 5.2 },
    Yuzuki: { animate: { y: [0, -10, 0], x: [-5, 5, -5], rotate: [-6, 6, -6], scale: [1, 1.08, 1] }, dur: 3.8 },
};

/* ── Character bubble ── */
const CharBubble = ({ char, index, isMobile, t, reduceMotion = false }) => {
    const today = isTodayBirthday(char.month, char.day);
    const passed = hasPassed(char.month, char.day);
    const days = getDaysUntil(char.month, char.day);
    const ca = CHAR_ANIM[char.name] || { animate: { y: [0, -3, 0] }, dur: 3 };
    const [tilt] = useState(() => (Math.random() * 8) - 4);

    return (
        <div style={{ transform: `rotate(${tilt}deg)`, position: 'relative', overflow: 'visible' }}>
        <motion.div
            initial={reduceMotion ? false : { opacity: 0, scale: 0.85 }}
            animate={reduceMotion ? (passed ? { opacity: 0.45, scale: 1 } : { opacity: 1, scale: 1 }) : (passed ? { opacity: 0.45, scale: 1 } : { opacity: 1, scale: 1, ...ca.animate })}
            transition={reduceMotion ? { duration: 0 } : (passed ? { duration: 0.4, delay: 0.03 * index } : {
                opacity: { duration: 0.3, delay: 0.03 * index },
                y: ca.animate.y ? { duration: ca.dur, repeat: Infinity, ease: 'easeInOut', delay: index * 0.25 } : undefined,
                x: ca.animate.x ? { duration: ca.dur, repeat: Infinity, ease: 'easeInOut', delay: index * 0.3 } : undefined,
                rotate: ca.animate.rotate ? { duration: ca.dur, repeat: Infinity, ease: 'easeInOut', delay: index * 0.2 } : undefined,
                scale: ca.animate.scale ? { duration: ca.dur, repeat: Infinity, ease: 'easeInOut', delay: index * 0.15 } : undefined,
                skewX: ca.animate.skewX ? { duration: ca.dur * 1.5, repeat: Infinity, ease: 'easeInOut', delay: index * 0.4 } : undefined,
                skewY: ca.animate.skewY ? { duration: ca.dur * 1.5, repeat: Infinity, ease: 'easeInOut', delay: index * 0.45 } : undefined,
                rotateX: ca.animate.rotateX ? { duration: ca.dur * 2, repeat: Infinity, ease: 'easeInOut', delay: index * 0.5 } : undefined,
            })}
            whileHover={reduceMotion || passed ? {} : { scale: 1.1, y: -2 }}
            style={{
                background: today ? char.color : passed ? '#f5f5f5' : char.bg,
                border: `2px solid ${passed ? '#ddd' : char.color}`,
                borderRadius: isMobile ? '13px' : '14px',
                padding: isMobile ? '8px 6px' : '10px 8px',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: isMobile ? '2px' : '3px',
                position: 'relative', cursor: 'default',
                boxShadow: passed ? 'none' : today ? `0 4px 16px ${char.color}50` : `0 2px 8px ${char.color}20`,
                filter: passed ? 'grayscale(0.5)' : 'none',
                minWidth: isMobile ? '52px' : '60px',
                overflow: 'visible',
            }}
        >
            {today && <motion.div animate={reduceMotion ? undefined : { scale: [1, 1.35, 1], opacity: [0.5, 0, 0.5] }} transition={reduceMotion ? undefined : { duration: 2, repeat: Infinity }} style={{ position: 'absolute', inset: '-4px', borderRadius: '16px', border: `2px solid ${char.color}`, pointerEvents: 'none' }} />}
            <span style={{ fontFamily: 'var(--font-hand)', fontSize: isMobile ? '1.1rem' : '1.3rem', fontWeight: 'bold', color: today ? '#fff' : passed ? '#c8c8c8' : char.color, lineHeight: 1 }}>{char.day}</span>
            <span style={{ fontFamily: 'var(--font-hand)', fontSize: isMobile ? '0.5rem' : '0.6rem', fontWeight: 'bold', color: today ? 'rgba(255,255,255,0.9)' : passed ? '#aaa' : '#374151', textAlign: 'center', lineHeight: 1.1 }}>{char.name}</span>
            {today ? (
                <motion.span animate={reduceMotion ? undefined : { scale: [1, 1.1, 1] }} transition={reduceMotion ? undefined : { duration: 1.5, repeat: Infinity }}
                    style={{ fontFamily: 'var(--font-hand)', fontSize: '0.38rem', fontWeight: 'bold', color: '#fff', background: 'rgba(255,255,255,0.25)', padding: '1px 5px', borderRadius: '99px' }}>{t.today}</motion.span>
            ) : (
                <span style={{ fontFamily: 'var(--font-hand)', fontSize: '0.36rem', color: passed ? '#bbb' : '#9ca3af', fontWeight: 'bold' }}>
                    {passed ? t.passed : days === 1 ? t.tomorrow : `${days} ${t.dayUnit || 'days'}`}
                </span>
            )}
        </motion.div>
        </div>
    );
};

/* ── Month column ── */
const MonthColumn = ({ month, chars, isMobile, isNow, t, monthLabels, reduceMotion = false }) => {
    const hasBday = chars.length > 0;
    const allPassed = hasBday && chars.every(c => hasPassed(c.month, c.day));

    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: isMobile ? '4px' : '8px', minWidth: 0 }}>
            <motion.div
                animate={reduceMotion ? undefined : (isNow ? { scale: [1, 1.04, 1] } : {})}
                transition={reduceMotion ? undefined : { duration: 3, repeat: Infinity }}
                style={{
                    fontFamily: 'var(--font-hand)',
                    fontSize: isMobile ? '0.55rem' : '0.75rem',
                    fontWeight: 'bold',
                    color: isNow ? '#f472b6' : hasBday ? '#374151' : '#d1d5db',
                    background: isNow ? '#ffe4ec' : 'transparent',
                    padding: isNow ? (isMobile ? '2px 6px' : '3px 10px') : (isMobile ? '2px 3px' : '3px 6px'),
                    borderRadius: '99px',
                    border: isNow ? '1.5px solid #f472b6' : '1.5px solid transparent',
                    whiteSpace: 'nowrap',
                }}
            >{monthLabels[month - 1]}</motion.div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '4px' : '8px', alignItems: 'center', flex: 1, justifyContent: 'flex-start' }}>
                {hasBday ? chars.map((c, j) => (
                    <CharBubble key={c.name} char={c} index={j} isMobile={isMobile} t={t} reduceMotion={reduceMotion} />
                )) : (
                    <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: isNow ? '#f472b640' : '#ebebeb', marginTop: isMobile ? '12px' : '30px' }} />
                )}
            </div>

            <motion.div
                initial={reduceMotion ? false : { scaleX: 0 }} animate={reduceMotion ? undefined : { scaleX: 1 }} transition={reduceMotion ? undefined : { delay: 0.03 * (month - 1), duration: 0.3 }}
                style={{ width: '100%', height: isNow ? '5px' : hasBday ? '3px' : '2px', background: allPassed ? '#ddd' : isNow ? '#f472b6' : hasBday ? chars[0].color : '#f3f4f6', borderRadius: '4px', marginTop: 'auto' }}
            />
        </div>
    );
};

/* ─── Main ─── */
const BirthdayPage = ({ isMobile, uiLanguage = 'en', reduceMotion = false, simplifyVisuals = false }) => {
    const t = UI_TEXT[uiLanguage] || UI_TEXT.en;
    const locale = LOCALE_BY_UI_LANGUAGE[uiLanguage] || 'en-US';
    const currentMonth = new Date().getMonth() + 1;
    const monthLabels = useMemo(() => {
        return Array.from({ length: 12 }, (_, index) => {
            const date = new Date(2026, index, 1);
            return new Intl.DateTimeFormat(locale, { month: 'short' }).format(date);
        });
    }, [locale]);

    const byMonth = useMemo(() => {
        const map = {};
        for (let m = 1; m <= 12; m++) map[m] = [];
        BIRTHDAYS.forEach(c => map[c.month].push(c));
        return map;
    }, []);

    const nextBday = useMemo(() => {
        const u = BIRTHDAYS.filter(c => !hasPassed(c.month, c.day) && !isTodayBirthday(c.month, c.day));
        u.sort((a, b) => getDaysUntil(a.month, a.day) - getDaysUntil(b.month, b.day));
        return u[0] || null;
    }, []);

    const todayBday = BIRTHDAYS.find(c => isTodayBirthday(c.month, c.day));

    return (
        <div style={{
            width: '100%',
            padding: isMobile ? '24px 8px 10px 8px' : '28px 40px',
            display: 'flex', flexDirection: 'column',
            justifyContent: isMobile ? 'center' : 'flex-start',
            overflow: 'visible', flex: 1,
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: isMobile ? 'center' : 'center',
                justifyContent: 'space-between',
                marginBottom: isMobile ? '16px' : '22px',
                flexDirection: isMobile ? 'column' : 'row',
                gap: isMobile ? '10px' : '12px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Cake size={isMobile ? 24 : 22} style={{ color: '#f59e0b' }} />
                    <span style={{ fontFamily: 'Sniglet, var(--font-main)', color: '#6b7280', fontSize: isMobile ? '1.5rem' : '1.3rem', fontWeight: 'normal' }}>{t.title}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {nextBday && !todayBday && (
                        <motion.span
                            initial={reduceMotion ? false : { opacity: 0, x: 10 }}
                            animate={reduceMotion ? undefined : { opacity: 1, x: 0 }}
                            style={{ fontFamily: 'var(--font-hand)', fontSize: isMobile ? '0.85rem' : '0.75rem', color: nextBday.color, fontWeight: 'bold', background: `${nextBday.color}15`, padding: '4px 12px', borderRadius: '99px', border: `1.5px solid ${nextBday.color}30` }}
                        >
                            {t.next}: {nextBday.name} {t.in} {getDaysUntil(nextBday.month, nextBday.day)} {t.dayUnit || 'days'}
                        </motion.span>
                    )}
                    {todayBday && (
                        <motion.span
                            animate={reduceMotion ? undefined : { scale: [1, 1.08, 1], rotate: [-2, 2, -2] }}
                            transition={reduceMotion ? undefined : { duration: 2, repeat: Infinity }}
                            style={{ fontFamily: 'var(--font-hand)', fontSize: isMobile ? '0.9rem' : '0.75rem', color: todayBday.color, fontWeight: 'bold', background: `${todayBday.color}15`, padding: '4px 12px', borderRadius: '99px', border: `1.5px solid ${todayBday.color}40`, boxShadow: `0 4px 12px ${todayBday.color}20` }}
                        >
                            🎂 {todayBday.name} {t.birthdayToday}
                        </motion.span>
                    )}
                </div>
            </div>

            {/* Background decorations for extra "funky" feel */}
            {!reduceMotion && !simplifyVisuals && <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0, opacity: 0.4 }}>
                <motion.div animate={{ y: [0, -25, 0], rotate: [0, 45, 0], scale: [1, 1.2, 1] }} transition={{ duration: 15, repeat: Infinity }} style={{ position: 'absolute', bottom: '15%', right: '10%', color: 'var(--pop-yellow)' }}><Dog size={32} /></motion.div>
                <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.7, 0.3], rotate: [0, -20, 0] }} transition={{ duration: 12, repeat: Infinity }} style={{ position: 'absolute', top: '40%', right: '5%', color: 'var(--pop-green)' }}><Cat size={28} /></motion.div>
                <motion.div animate={{ x: [0, 20, 0], y: [0, 20, 0], scale: [1, 1.1, 1] }} transition={{ duration: 18, repeat: Infinity }} style={{ position: 'absolute', bottom: '10%', left: '8%', color: 'var(--pop-blue)' }}><Pizza size={30} /></motion.div>
                <motion.div animate={{ rotate: [-10, 10, -10], y: [0, -12, 0] }} transition={{ duration: 14, repeat: Infinity }} style={{ position: 'absolute', top: '25%', left: '15%', color: 'var(--pop-pink)' }}><Music size={24} /></motion.div>
                <motion.div animate={{ scale: [1, 1.15, 1], x: [0, -15, 0] }} transition={{ duration: 16, repeat: Infinity }} style={{ position: 'absolute', top: '65%', right: '20%', color: 'var(--pop-yellow)' }}><Coffee size={26} /></motion.div>
                <motion.div animate={{ y: [0, 12, 0], rotate: [0, 15, -15, 0] }} transition={{ duration: 10, repeat: Infinity }} style={{ position: 'absolute', bottom: '30%', left: '20%', color: 'var(--pop-green)' }}><Gift size={22} /></motion.div>
                <motion.div animate={{ scale: [1, 1.25, 1], opacity: [0.2, 0.5, 0.2] }} transition={{ duration: 19, repeat: Infinity }} style={{ position: 'absolute', top: '5%', right: '35%', color: 'var(--pop-blue)' }}><Ghost size={26} /></motion.div>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} style={{ position: 'absolute', top: '45%', left: '30%', opacity: 0.25, color: '#fde047' }}><Sun size={48} /></motion.div>
                <motion.div animate={{ y: [0, -10, 0], rotate: [0, 10, -10, 0] }} transition={{ duration: 8, repeat: Infinity }} style={{ position: 'absolute', top: '20%', right: '15%', color: 'var(--pop-pink)' }}><Rabbit size={28} /></motion.div>
                <motion.div animate={{ x: [0, -15, 0], y: [0, -15, 0] }} transition={{ duration: 12, repeat: Infinity }} style={{ position: 'absolute', bottom: '5%', right: '25%', color: 'var(--pop-blue)' }}><Bird size={24} /></motion.div>
                <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 15, repeat: Infinity }} style={{ position: 'absolute', top: '55%', left: '5%', color: 'var(--pop-yellow)' }}><Fish size={26} /></motion.div>
                <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 30, repeat: Infinity }} style={{ position: 'absolute', bottom: '20%', left: '35%', color: 'var(--pop-green)' }}><Snail size={22} /></motion.div>
                <motion.div animate={{ scale: [0.9, 1.1, 0.9] }} transition={{ duration: 13, repeat: Infinity }} style={{ position: 'absolute', top: '35%', right: '40%', color: 'var(--pop-pink)' }}><PawPrint size={24} /></motion.div>
            </div>}

            {/* Month columns */}
            {isMobile ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                    {[[1, 2, 3], [4, 5, 6], [7, 8, 9], [10, 11, 12]].map((row, ri) => (
                        <div key={ri} style={{ display: 'flex', gap: '4px', flex: 1 }}>
                            {row.map(m => <MonthColumn key={m} month={m} chars={byMonth[m]} isMobile isNow={m === currentMonth} t={t} monthLabels={monthLabels} reduceMotion={reduceMotion} />)}
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ display: 'flex', gap: '4px' }}>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                        <MonthColumn key={m} month={m} chars={byMonth[m]} isMobile={false} isNow={m === currentMonth} t={t} monthLabels={monthLabels} reduceMotion={reduceMotion} />
                    ))}
                </div>
            )}

            {!isMobile && (
                <div style={{ textAlign: 'center', padding: '10px', fontFamily: 'var(--font-hand)', fontSize: '0.6rem', color: '#d1d5db' }}>
                    {BIRTHDAYS.length} {t.characters} • {new Date().getFullYear()}
                </div>
            )}
        </div>
    );
};

export default BirthdayPage;
