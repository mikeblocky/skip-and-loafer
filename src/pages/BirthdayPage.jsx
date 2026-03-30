/* eslint-disable no-unused-vars */
import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cake, Sparkles, Star, Heart, Dog, Cat, Music, Coffee, Gift, 
  Pizza, Sun, Cloud, Ghost, Gem, Rabbit, Bird, Fish, Snail, 
  Skull, PawPrint, Calendar, ArrowRight, Pin
} from 'lucide-react';

/* ─── UI Localization ─── */
const UI_TEXT = {
    en: { 
        title: 'Birthdays', 
        next: 'Upcoming', 
        in: 'in', 
        today: 'TODAY!', 
        passed: 'passed', 
        tomorrow: 'Tomorrow!', 
        birthdayToday: 'birthday today!', 
        characters: 'characters', 
        dayUnit: 'days',
        celebrate: 'Celebrate!',
        featuredTitle: 'Next birthday',
        noMore: 'No more birthdays this year!'
    },
    ja: { 
        title: '誕生日', 
        next: '次回の誕生日', 
        in: 'あと', 
        today: '今日！', 
        passed: '終了', 
        tomorrow: '明日！', 
        birthdayToday: '今日が誕生日です！', 
        characters: 'キャラクター', 
        dayUnit: '日',
        celebrate: 'お祝いする！',
        featuredTitle: '次の誕生日',
        noMore: '今年の誕生日はすべて終了しました！'
    },
    es: { title: 'Cumpleaños', next: 'Siguiente', in: 'en', today: '¡HOY!', passed: 'pasó', tomorrow: '¡Mañana!', birthdayToday: 'cumpleaños hoy!', characters: 'personajes', dayUnit: 'días', featuredTitle: 'Próximo cumpleaños' },
    pt: { title: 'Aniversários', next: 'Próximo', in: 'em', today: 'HOJE!', passed: 'passou', tomorrow: 'Amanhã!', birthdayToday: 'aniversário hoje!', characters: 'personagens', dayUnit: 'dias', featuredTitle: 'Próximo aniversário' },
    fr: { title: 'Anniversaires', next: 'Prochain', in: 'dans', today: 'AUJOURD’HUI !', passed: 'passé', tomorrow: 'Demain !', birthdayToday: 'anniversaire aujourd’hui !', characters: 'personnages', dayUnit: 'jours', featuredTitle: 'Prochain anniversaire' },
    de: { title: 'Geburtstage', next: 'Nächster', in: 'in', today: 'HEUTE!', passed: 'vorbei', tomorrow: 'Morgen!', birthdayToday: 'hat heute Geburtstag!', characters: 'Charaktere', dayUnit: 'Tage', featuredTitle: 'Nächster geburtstag' },
    it: { title: 'Compleanni', next: 'Prossimo', in: 'tra', today: 'OGGI!', passed: 'passato', tomorrow: 'Domani!', birthdayToday: 'compie gli anni oggi!', characters: 'personaggi', dayUnit: 'giorni', featuredTitle: 'Prossimo compleanno' },
};

const LOCALE_BY_UI_LANGUAGE = {
    en: 'en-US',
    ja: 'ja-JP',
    es: 'es-ES',
    pt: 'pt-BR',
    fr: 'fr-FR',
    de: 'de-DE',
    it: 'it-IT',
};

/* ─── Birthday Data ─── */
const BIRTHDAYS = [
    { name: 'Kanechika', fullName: 'Kanechika Narumi', month: 2, day: 1, color: '#4338ca', bg: '#efefff', icon: Skull, img: null },
    { name: 'Mitsumi', fullName: 'Iwakura Mitsumi', month: 3, day: 3, color: '#e67e5f', bg: '#fff5f2', icon: Sun, img: '/characters/1c.png' },
    { name: 'Makoto', fullName: 'Kurume Makoto', month: 4, day: 17, color: '#7c3aed', bg: '#f8f5ff', icon: Music, img: '/characters/5c.png' },
    { name: 'Kazakami', fullName: 'Kazakami Hiroto', month: 4, day: 24, color: '#fb923c', bg: '#fffbf5', icon: Coffee, img: null },
    { name: 'Mukai', fullName: 'Mukai Tsukasa', month: 5, day: 19, color: '#64748b', bg: '#f8fafc', icon: Dog, img: null },
    { name: 'Takamine', fullName: 'Takamine Tokiko', month: 6, day: 30, color: '#b91c1c', bg: '#fff5f5', icon: Star, img: null },
    { name: 'Mika', fullName: 'Egashira Mika', month: 7, day: 29, color: '#f43f5e', bg: '#fff5f6', icon: Rabbit, img: '/characters/3c.png' },
    { name: 'Yamada', fullName: 'Yamada Kentaro', month: 8, day: 6, color: '#f97316', bg: '#fff9f5', icon: Pizza, img: null },
    { name: 'Chris', fullName: 'Fukunaga Chris', month: 8, day: 24, color: '#0ea5e9', bg: '#f5fbff', icon: Cat, img: null },
    { name: 'Shima', fullName: 'Shima Sousuke', month: 10, day: 9, color: '#eab308', bg: '#fffdf5', icon: Star, img: '/characters/2c.png' },
    { name: 'Ririka', fullName: 'Saijou Ririka', month: 10, day: 30, color: '#881337', bg: '#fff5f6', icon: Heart, img: null },
    { name: 'Yuzuki', fullName: 'Murashige Yuzuki', month: 12, day: 11, color: '#14b8a6', bg: '#f5fffd', icon: Gem, img: '/characters/4c.png' },
];

/* ─── Helpers ─── */
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

/* ─── Components ─── */

const MonthCard = ({ month, chars, isMobile, isNow, t, monthLabels, reduceMotion }) => {
    const hasBday = chars.length > 0;
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
                gap: '12px'
            }}
        >
            {/* "Tape" Decoration */}
            <div style={{
                position: 'absolute',
                top: '-15px',
                left: '50%',
                transform: 'translateX(-50%) rotate(-2deg)',
                width: '60px',
                height: '24px',
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                backdropFilter: 'blur(2px)',
                zIndex: 2
            }} />

            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <span style={{ 
                    fontFamily: '"Sniglet", "Coming Soon", cursive', 
                    fontSize: '1.2rem', 
                    color: isNow ? '#3b82f6' : '#6b7280',
                    fontWeight: '400'
                }}>
                    {monthLabels[month - 1]}
                </span>
                {isNow && <Sparkles size={16} color="#3b82f6" />}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {hasBday ? chars.map((char) => {
                    const today = isTodayBirthday(char.month, char.day);
                    const passed = hasPassed(char.month, char.day);
                    const days = getDaysUntil(char.month, char.day);
                    
                    return (
                        <div key={char.name} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: isMobile ? '14px 12px' : '14px 16px',
                            background: '#ffffff',
                            borderRadius: '20px',
                            border: `3px solid ${char.color}`,
                            borderBottom: `8px solid ${char.color}`,
                            boxShadow: `0 8px 20px ${char.color}15`,
                            opacity: passed ? 0.6 : 1,
                            transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                            position: 'relative'
                        }}>
                             <div style={{
                                width: isMobile ? '40px' : '44px',
                                height: isMobile ? '40px' : '44px',
                                borderRadius: '12px',
                                background: char.bg,
                                border: `2.5px solid ${char.color}`,
                                borderBottom: `4px solid ${char.color}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: char.color,
                                flexShrink: 0,
                            }}>
                                <span style={{ fontFamily: '"Sniglet", "Coming Soon", cursive', fontWeight: '400', fontSize: isMobile ? '1.1rem' : '1.2rem' }}>{char.day}</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                                <span style={{ 
                                    fontFamily: '"Sniglet", "Coming Soon", cursive', 
                                    fontWeight: '400', 
                                    fontSize: isMobile ? '1rem' : '1.1rem',
                                    color: '#374151',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    lineHeight: 1
                                }}>
                                    {char.name}
                                </span>
                                <span style={{ 
                                    fontFamily: '"Sniglet", "Coming Soon", cursive',
                                    fontSize: '0.75rem', 
                                    color: today ? char.color : '#9ca3af',
                                    fontWeight: '400',
                                    marginTop: '2px',
                                    opacity: 0.8
                                }}>
                                    {today ? t.today : (passed ? t.passed : (days === 1 ? t.tomorrow : `${days}${t.dayUnit}`))}
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

const BirthdayPage = ({ isMobile, uiLanguage = 'en', reduceMotion = false, simplifyVisuals = false }) => {
    const t = UI_TEXT[uiLanguage] || UI_TEXT.en;
    const locale = LOCALE_BY_UI_LANGUAGE[uiLanguage] || 'en-US';
    const currentMonth = new Date().getMonth() + 1;
    
    const monthLabels = useMemo(() => {
        return Array.from({ length: 12 }, (_, index) => {
            const date = new Date(2026, index, 1);
            return new Intl.DateTimeFormat(locale, { month: 'long' }).format(date);
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
    const featuredChar = todayBday || nextBday;

    return (
        <div style={{ 
            width: '100%', 
            minHeight: '100vh',
            padding: isMobile ? '24px 16px 40px 16px' : '28px 40px 60px 40px',
            background: '#ffffff',
            backgroundImage: `repeating-linear-gradient(transparent, transparent 31px, #eef1f6 32px)`,
            backgroundSize: '100% 32px',
            display: 'flex', flexDirection: 'column',
            overflow: 'visible',
            position: 'relative'
        }}>
            {/* Standard "Sketchbook" Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: isMobile ? '32px' : '56px',
                position: 'relative',
                width: '100%'
            }}>
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '12px', 
                        padding: '10px 28px', 
                        borderRadius: '20px', 
                        background: '#ffffff', 
                        border: '3px solid #f59e0b',
                        borderBottom: '8px solid #f59e0b',
                        boxShadow: '0 4px 15px rgba(245, 158, 11, 0.1)',
                        zIndex: 10
                    }}
                >
                    <Cake size={isMobile ? 24 : 22} style={{ color: '#f59e0b' }} />
                    <span style={{ 
                        fontFamily: '"Sniglet", "Coming Soon", cursive', 
                        color: '#f59e0b', 
                        fontSize: isMobile ? '1.5rem' : '1.4rem', 
                        fontWeight: '400',
                        letterSpacing: '0.2px',
                        lineHeight: 1
                    }}>
                        {t.title}
                    </span>
                </motion.div>
            </div>

            {/* Featured Hero Card - ABSOLUTELY NO ROTATION */}
            {featuredChar && (
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    marginBottom: isMobile ? '48px' : '72px',
                    width: '100%'
                }}>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0, rotate: 0 }}
                        whileHover={{ y: -5, scale: 1.01 }}
                        style={{
                            width: '100%',
                            maxWidth: isMobile ? '100%' : '540px',
                            background: `linear-gradient(135deg, ${featuredChar.bg} 0%, #ffffff 100%)`,
                            border: `3px solid ${featuredChar.color}`,
                            borderBottom: `10px solid ${featuredChar.color}`,
                            borderRadius: '32px',
                            padding: isMobile ? '24px' : '32px',
                            display: 'flex',
                            flexDirection: isMobile ? 'column' : 'row',
                            alignItems: 'center',
                            gap: '28px',
                            position: 'relative',
                            boxShadow: `0 20px 40px ${featuredChar.color}20`,
                            cursor: 'default',
                            transform: 'none',
                            overflow: 'hidden'
                        }}
                    >
                        {/* Decorative background glow */}
                        <div style={{ 
                            position: 'absolute', 
                            top: '-20%', 
                            right: '-10%', 
                            width: '240px', 
                            height: '240px', 
                            background: `${featuredChar.color}15`, 
                            borderRadius: '50%',
                            filter: 'blur(50px)',
                            zIndex: 0
                        }} />

                        {/* Pin decoration */}
                        <div style={{ position: 'absolute', top: '22px', right: '22px', zIndex: 2 }}>
                            <Pin size={32} color={featuredChar.color} style={{ opacity: 0.3, transform: 'rotate(15deg)' }} />
                        </div>

                        {/* Character Image or Large Icon */}
                        <div style={{
                            width: isMobile ? '120px' : '150px',
                            height: isMobile ? '120px' : '150px',
                            borderRadius: '24px',
                            background: '#ffffff',
                            border: `3px solid ${featuredChar.color}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            boxShadow: `0 8px 24px ${featuredChar.color}25`,
                            flexShrink: 0,
                            zIndex: 1
                        }}>
                            {featuredChar.img ? (
                                <img src={featuredChar.img} alt={featuredChar.name} style={{ width: '92%', height: '92%', objectFit: 'contain' }} />
                            ) : (
                                <featuredChar.icon size={isMobile ? 78 : 94} color={featuredChar.color} />
                            )}
                        </div>

                        <div style={{ flex: 1, textAlign: isMobile ? 'center' : 'left', zIndex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: isMobile ? 'center' : 'flex-start' }}>
                                <motion.div 
                                    animate={{ scale: [1, 1.2, 1] }} 
                                    transition={{ duration: 2, repeat: Infinity }}
                                    style={{ width: '10px', height: '10px', borderRadius: '50%', background: featuredChar.color }} 
                                />
                                <span style={{ 
                                    fontFamily: '"Sniglet", "Coming Soon", cursive', 
                                    color: featuredChar.color, 
                                    fontSize: '1.1rem', 
                                    fontWeight: '400',
                                    opacity: 0.9
                                }}>
                                    {todayBday ? t.birthdayToday : t.featuredTitle}
                                </span>
                            </div>
                            <h2 style={{ 
                                fontFamily: '"Sniglet", "Coming Soon", cursive', 
                                fontSize: isMobile ? '1.8rem' : '2.4rem', 
                                fontWeight: '400', 
                                color: featuredChar.color,
                                margin: '4px 0 12px 0',
                                lineHeight: 1,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}>
                                {featuredChar.fullName}
                            </h2>
                            <div style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '10px', 
                                background: '#ffffff', 
                                padding: '8px 20px', 
                                borderRadius: '99px',
                                border: `3px solid ${featuredChar.color}`,
                                borderBottom: `6px solid ${featuredChar.color}`,
                                color: featuredChar.color,
                                fontWeight: '400',
                                fontFamily: '"Sniglet", "Coming Soon", cursive',
                                boxShadow: `0 4px 12px ${featuredChar.color}15`
                            }}>
                                {todayBday ? <Gift size={20} /> : <Calendar size={20} />}
                                <span>
                                    {featuredChar.month}/{featuredChar.day} • {todayBday ? t.today : `${t.in} ${getDaysUntil(featuredChar.month, featuredChar.day)} ${t.dayUnit}`}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Monthly Scrapbook Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: isMobile ? '24px' : '32px',
                width: '100%',
                zIndex: 5
            }}>
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                    <MonthCard 
                        key={m} 
                        month={m} 
                        chars={byMonth[m]} 
                        isMobile={isMobile} 
                        isNow={m === currentMonth} 
                        t={t} 
                        monthLabels={monthLabels} 
                        reduceMotion={reduceMotion} 
                    />
                ))}
            </div>

            {/* Footer decoration */}
            {!isMobile && (
                <div style={{ 
                    marginTop: '80px',
                    textAlign: 'center', 
                    fontFamily: '"Sniglet", "Coming Soon", cursive', 
                    fontSize: '1.2rem', 
                    color: '#9ca3af',
                    fontWeight: '400'
                }}>
                    <Star size={24} style={{ display: 'inline', marginRight: '10px', verticalAlign: 'middle', color: '#fcd34d' }} />
                    {BIRTHDAYS.length} {t.characters} • 2026
                    <Star size={24} style={{ display: 'inline', marginLeft: '10px', verticalAlign: 'middle', color: '#fcd34d' }} />
                </div>
            )}

            {/* Background floating icons */}
            {!reduceMotion && !simplifyVisuals && (
                <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0, opacity: 0.25 }}>
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: 'linear' }} style={{ position: 'absolute', top: '10%', left: '5%', color: '#fb923c' }}><Sun size={80} /></motion.div>
                    <motion.div animate={{ y: [0, -30, 0], rotate: [0, 20, 0] }} transition={{ duration: 7, repeat: Infinity }} style={{ position: 'absolute', top: '45%', right: '3%', color: '#f43f5e' }}><Heart size={64} /></motion.div>
                    <motion.div animate={{ scale: [1, 1.2, 1], rotate: [-10, 10, -10] }} transition={{ duration: 9, repeat: Infinity }} style={{ position: 'absolute', bottom: '15%', left: '12%', color: '#3b82f6' }}><Dog size={72} /></motion.div>
                    <motion.div animate={{ x: [-15, 15, -15], y: [0, 10, 0] }} transition={{ duration: 11, repeat: Infinity }} style={{ position: 'absolute', bottom: '8%', right: '18%', color: '#10b981' }}><Rabbit size={56} /></motion.div>
                    <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 13, repeat: Infinity }} style={{ position: 'absolute', top: '25%', right: '15%', color: '#fcd34d' }}><Star size={56} /></motion.div>
                </div>
            )}
        </div>
    );
};

export default BirthdayPage;

