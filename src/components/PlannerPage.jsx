/* eslint-disable no-unused-vars, react-hooks/purity */
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Star, Sparkles, Heart } from 'lucide-react';
import Countdown from './Countdown';
import ReleaseNote from './ReleaseNote';
import { CHARACTER_COLORS } from '../data/characters';
import { QUOTES } from '../data/quotes';

const UI_TEXT = {
    en: { agenda: 'AGENDA', breakShort: 'On break in March, Chapter 79 will be released in April issue!', breakLong: 'On break in March! Chapter 79 will be released in April issue!' },
    es: { agenda: 'AGENDA', breakShort: 'Descanso en marzo: ¡el Capítulo 79 llegará en la edición de abril!', breakLong: '¡Descanso en marzo! ¡El Capítulo 79 llegará en la edición de abril!' },
    pt: { agenda: 'AGENDA', breakShort: 'Pausa em março: o Capítulo 79 sai na edição de abril!', breakLong: 'Pausa em março! O Capítulo 79 sai na edição de abril!' },
    fr: { agenda: 'AGENDA', breakShort: 'Pause en mars : le chapitre 79 sortira dans l’édition d’avril !', breakLong: 'Pause en mars ! Le chapitre 79 sortira dans l’édition d’avril !' },
    de: { agenda: 'AGENDA', breakShort: 'Pause im März: Kapitel 79 erscheint in der April-Ausgabe!', breakLong: 'Pause im März! Kapitel 79 erscheint in der April-Ausgabe!' },
    it: { agenda: 'AGENDA', breakShort: 'Pausa a marzo: il capitolo 79 uscirà nel numero di aprile!', breakLong: 'Pausa a marzo! Il capitolo 79 uscirà nel numero di aprile!' },
};

const LOCALE_BY_UI_LANGUAGE = {
    en: 'en-US',
    es: 'es-ES',
    pt: 'pt-BR',
    fr: 'fr-FR',
    de: 'de-DE',
    it: 'it-IT',
};

const PlannerPage = ({ isMobile, uiLanguage = 'en' }) => {
    // eslint-disable-next-line react-hooks/purity
    const randomQuote = useMemo(() => QUOTES[Math.floor(Math.random() * QUOTES.length)], []);
    const t = UI_TEXT[uiLanguage] || UI_TEXT.en;
    const locale = LOCALE_BY_UI_LANGUAGE[uiLanguage] || 'en-US';

    const targetDate = new Date('2026-04-25T00:00:00+09:00');
    const localDateString = targetDate.toLocaleString(locale, {
        weekday: 'long', month: 'long', day: 'numeric',
        hour: 'numeric', minute: '2-digit'
    });
    const timezoneOffsetMinutes = -new Date().getTimezoneOffset();
    const timezoneSign = timezoneOffsetMinutes >= 0 ? '+' : '-';
    const timezoneAbsMinutes = Math.abs(timezoneOffsetMinutes);
    const timezoneHours = String(Math.floor(timezoneAbsMinutes / 60)).padStart(2, '0');
    const timezoneMinutes = String(timezoneAbsMinutes % 60).padStart(2, '0');
    const timezoneLabel = `UTC${timezoneSign}${timezoneHours}:${timezoneMinutes}`;

    return (
        <>
            {/* First Page - Desktop: Title/Quote, Mobile: Countdown */}
            <div className="planner-page" style={{
                borderRight: isMobile ? 'none' : '1px solid #e5e7eb',
                borderBottom: isMobile ? '1px solid #e5e7eb' : 'none',
                padding: isMobile ? '20px' : '52px',
                borderRadius: isMobile ? '4px 4px 0 0' : '4px 0 0 4px',
                flex: 1, display: 'flex', flexDirection: 'column'
            }}>
                {!isMobile && (
                    <div style={{ position: 'absolute', top: '28px', right: '28px', color: '#d1d5db', fontSize: '1.8rem', opacity: 0.5, transform: 'rotate(-5deg)', border: '2px solid #d1d5db', padding: '6px 14px', borderRadius: '8px', fontFamily: 'var(--font-main)' }}>
                        2026
                    </div>
                )}

                {/* Desktop: Title + Quote */}
                {!isMobile && (
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                            <Star size={22} style={{ color: 'var(--pop-yellow)', fill: 'var(--pop-yellow)' }} />
                            <span style={{ fontFamily: 'var(--font-hand)', color: '#9ca3af', fontSize: '1.1rem', fontWeight: 'bold', letterSpacing: '0.1em' }}>{t.agenda}</span>
                            <Star size={22} style={{ color: 'var(--pop-yellow)', fill: 'var(--pop-yellow)' }} />
                        </div>

                        <h1 style={{ fontFamily: 'Sniglet, var(--font-main)', fontSize: '4.5rem', fontWeight: 'normal', lineHeight: 1.1, marginBottom: '16px', textAlign: 'left' }}>
                            <span style={{ color: 'var(--pop-blue)' }}>Skip </span>
                            <span style={{ color: '#b0b8c0', fontSize: '3.5rem' }}>&</span>
                            <span style={{ color: 'var(--pop-pink)' }}> Loafer</span>
                        </h1>

                        <div style={{ marginTop: '24px', background: CHARACTER_COLORS[randomQuote.author]?.bg || '#fef9c3', padding: '16px', borderLeft: `4px solid ${CHARACTER_COLORS[randomQuote.author]?.border || 'var(--pop-yellow)'}`, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', maxWidth: '340px', transform: 'rotate(1deg)' }}>
                            <p style={{ fontFamily: 'var(--font-hand)', color: '#4b5563', fontSize: '1rem', lineHeight: 1.5, marginBottom: '10px' }}>
                                "{randomQuote.text}"
                            </p>
                            <p style={{ fontFamily: 'var(--font-hand)', color: CHARACTER_COLORS[randomQuote.author]?.text || '#9ca3af', fontSize: '0.9rem', textAlign: 'right', fontWeight: 'bold' }}>
                                — {randomQuote.author}
                            </p>
                        </div>
                    </div>
                )}

                {/* Mobile: Countdown (on top) */}
                {isMobile && (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        {/* Agenda + Title */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                            <Star size={20} style={{ color: 'var(--pop-yellow)', fill: 'var(--pop-yellow)' }} />
                            <span style={{ fontFamily: 'var(--font-hand)', color: '#9ca3af', fontSize: '1rem', fontWeight: 'bold', letterSpacing: '0.1em' }}>{t.agenda}</span>
                            <Star size={20} style={{ color: 'var(--pop-yellow)', fill: 'var(--pop-yellow)' }} />
                        </div>

                        <h1 style={{ fontFamily: 'Sniglet, var(--font-main)', fontSize: '2.5rem', fontWeight: 'normal', lineHeight: 1.1, marginBottom: '20px', textAlign: 'center' }}>
                            <span style={{ color: 'var(--pop-blue)' }}>Skip </span>
                            <span style={{ color: '#b0b8c0', fontSize: '2rem' }}>&</span>
                            <span style={{ color: 'var(--pop-pink)' }}> Loafer</span>
                        </h1>

                        <motion.div
                            style={{ marginBottom: '28px', background: 'white', padding: '6px 16px', borderRadius: '9999px', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '6px' }}
                            animate={{ y: [0, -3, 0] }}
                            transition={{ repeat: Infinity, duration: 4 }}
                        >
                            <Sparkles size={16} style={{ color: 'var(--pop-yellow)' }} />
                            <span style={{ fontFamily: 'var(--font-main)', color: '#4b5563', fontSize: '0.9rem' }}>{t.breakShort}</span>
                            <Sparkles size={16} style={{ color: 'var(--pop-pink)' }} />
                        </motion.div>

                        <Countdown isMobile={isMobile} uiLanguage={uiLanguage} />

                        <div style={{ marginTop: '16px', textAlign: 'center' }}>
                            <p style={{ fontFamily: 'var(--font-hand)', fontSize: '1rem', color: '#4b5563', background: '#eff6ff', padding: '5px 14px', borderRadius: '6px', display: 'inline-block', fontWeight: 'bold' }}>
                                {localDateString} ({timezoneLabel})
                            </p>
                        </div>

                        <div style={{ marginTop: '18px', display: 'flex', justifyContent: 'center', width: '100%' }}>
                            <ReleaseNote isMobile={isMobile} uiLanguage={uiLanguage} inline />
                        </div>
                    </div>
                )}
            </div>

            {/* Binding */}
            <div className="spiral-binding-center" style={{ zIndex: 20 }}></div>

            {/* Second Page - Desktop: Countdown, Mobile: Quote only */}
            <div className="planner-page" style={{ padding: isMobile ? '20px' : '52px', borderRadius: isMobile ? '0 0 4px 4px' : '0 4px 4px 0', flex: 1, display: 'flex', flexDirection: 'column' }}>

                {/* Desktop: Countdown */}
                {!isMobile && (
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <motion.div
                            style={{ marginBottom: '48px', background: 'white', padding: '8px 20px', borderRadius: '9999px', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '8px' }}
                            animate={{ y: [0, -4, 0] }}
                            transition={{ repeat: Infinity, duration: 4 }}
                        >
                            <Sparkles size={18} style={{ color: 'var(--pop-yellow)' }} />
                            <span style={{ fontFamily: 'var(--font-main)', color: '#4b5563', fontSize: '1rem' }}>{t.breakLong}</span>

                            <Sparkles size={18} style={{ color: 'var(--pop-pink)' }} />
                        </motion.div>

                        <Countdown isMobile={isMobile} uiLanguage={uiLanguage} />

                        <div style={{ marginTop: '45px', textAlign: 'center' }}>
                            <p style={{ fontFamily: 'var(--font-hand)', fontSize: '1.5rem', color: '#4b5563', background: '#eff6ff', padding: '6px 18px', borderRadius: '6px', display: 'inline-block', fontWeight: 'bold' }}>
                                {localDateString} ({timezoneLabel})
                            </p>
                        </div>

                        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', width: '100%' }}>
                            <ReleaseNote isMobile={isMobile} uiLanguage={uiLanguage} inline />
                        </div>
                    </div>
                )}

                {/* Mobile: Quote only (on bottom) */}
                {isMobile && (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '10px' }}>
                        <div style={{ background: CHARACTER_COLORS[randomQuote.author]?.bg || '#fef9c3', padding: '16px', borderLeft: `4px solid ${CHARACTER_COLORS[randomQuote.author]?.border || 'var(--pop-yellow)'}`, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', maxWidth: '340px', transform: 'rotate(1deg)' }}>
                            <p style={{ fontFamily: 'var(--font-hand)', color: '#4b5563', fontSize: '1rem', lineHeight: 1.5, marginBottom: '10px' }}>
                                "{randomQuote.text}"
                            </p>
                            <p style={{ fontFamily: 'var(--font-hand)', color: CHARACTER_COLORS[randomQuote.author]?.text || '#9ca3af', fontSize: '0.9rem', textAlign: 'right', fontWeight: 'bold' }}>
                                — {randomQuote.author}
                            </p>
                        </div>
                    </div>
                )}

                <motion.div
                    style={{ position: 'absolute', bottom: '28px', right: '28px', opacity: 0.3, pointerEvents: 'none' }}
                    animate={{ rotate: [10, 18, 10], scale: [1, 1.08, 1] }}
                    transition={{ repeat: Infinity, duration: 3 }}
                >
                    <Heart size={isMobile ? 32 : 48} style={{ color: 'var(--pop-pink)', fill: 'var(--pop-pink)' }} />
                </motion.div>
            </div>
        </>
    );
};

export default PlannerPage;
