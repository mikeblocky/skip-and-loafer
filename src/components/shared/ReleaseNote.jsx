/* eslint-disable no-unused-vars */
import { motion } from 'framer-motion';

const UI_TEXT = {
    en: { chapterOut: 'Chapter 79 out now!', quote: '"Today is the day. The 3rd-year students of Tsubame Nishi High School"', read: 'Read ->' },
    es: { chapterOut: '¡Capítulo 79 disponible!', quote: '"Hoy es el día. Los estudiantes de tercer año de la preparatoria Tsubame Nishi"', read: 'Leer ->' },
    pt: { chapterOut: 'Capítulo 79 disponível!', quote: '"Hoje é o dia. Os alunos do 3º ano da Escola Secundária Tsubame Nishi"', read: 'Ler ->' },
    fr: { chapterOut: 'Chapitre 79 disponible !', quote: '"C\'est aujourd\'hui le grand jour. Les élèves de 3ème année du lycée Tsubame Nishi"', read: 'Lire ->' },
    de: { chapterOut: 'Kapitel 79 ist jetzt da!', quote: '"Heute ist der Tag. Die Schüler des 3. Jahrgangs der Tsubame Nishi High School"', read: 'Lesen ->' },
    it: { chapterOut: 'Capitolo 79 disponibile ora!', quote: '"Oggi è il giorno. Gli studenti del 3° anno della Tsubame Nishi High School"', read: 'Leggi ->' },
    ja: { chapterOut: '第79話 配信中', quote: '「今日がその日だ。つばめ西高校の3年生。」', read: '読む ->' },
};

const ReleaseNote = ({ isMobile, uiLanguage = 'en', inline = false, largeText = false }) => {
    const t = UI_TEXT[uiLanguage] || UI_TEXT.en;
    const mobileInline = inline && isMobile;

    return (
        <motion.a
            href="https://comic-days.com/episode/12207421983633662678"
            target="_blank"
            rel="noopener noreferrer"
            style={{
                position: inline ? 'relative' : 'fixed',
                top: inline ? 'auto' : (isMobile ? '74vh' : '300px'),
                right: inline ? 'auto' : '50%',
                left: 'auto',
                bottom: 'auto',
                transform: inline ? 'none' : (isMobile ? 'translateX(50%)' : 'translateX(50%) rotate(-1deg)'),
                alignSelf: 'auto',
                background: '#fef3c7',
                padding: mobileInline ? '10px 12px 12px' : (isMobile ? '8px 12px' : (largeText ? '8px 16px' : '7px 15px')),
                borderRadius: '8px',
                boxShadow: '0 3px 10px rgba(0,0,0,0.12)',
                zIndex: 1150,
                border: '1.5px solid #f59e0b',
                textDecoration: 'none',
                display: mobileInline ? 'grid' : 'flex',
                alignItems: 'center',
                flexWrap: mobileInline ? 'nowrap' : ((inline && isMobile) || (inline && largeText) ? 'wrap' : 'nowrap'),
                gap: mobileInline ? '4px' : (isMobile ? '5px' : '7px'),
                justifyContent: 'center',
                marginTop: 0,
                marginBottom: 0,
                width: inline ? (isMobile ? '100%' : 'auto') : (isMobile ? 'fit-content' : 'auto'),
                maxWidth: inline ? (isMobile ? '100%' : (largeText ? 'min(100%, 700px)' : 'min(100%, 600px)')) : 'none',
                whiteSpace: mobileInline ? 'normal' : (inline && !isMobile && !largeText ? 'nowrap' : 'normal'),
                textAlign: mobileInline ? 'center' : 'initial',
                justifyItems: mobileInline ? 'center' : undefined,
            }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.4, type: 'spring' }}
            whileHover={{ scale: 1.03, rotate: 0 }}
        >
            <span style={{ fontFamily: 'var(--font-hand)', color: '#92400e', fontSize: isMobile ? '0.82rem' : (largeText ? '0.86rem' : '0.78rem'), fontWeight: 'bold' }}>
                {t.chapterOut}
            </span>
            <span style={{
                fontFamily: 'var(--font-hand)',
                color: '#b45309',
                fontSize: isMobile ? '0.74rem' : (largeText ? '0.8rem' : '0.72rem'),
                fontStyle: 'italic',
                whiteSpace: mobileInline ? 'normal' : (inline && !isMobile && !largeText ? 'nowrap' : 'normal'),
                overflow: mobileInline ? 'visible' : (inline && !isMobile && !largeText ? 'hidden' : 'visible'),
                textOverflow: mobileInline ? 'clip' : (inline && !isMobile && !largeText ? 'ellipsis' : 'clip'),
                minWidth: inline && !isMobile ? 0 : 'auto'
            }}>
                {t.quote}
            </span>
            <span style={{
                fontSize: isMobile ? '0.68rem' : (largeText ? '0.74rem' : '0.68rem'),
                color: '#fff',
                background: 'var(--pop-pink)',
                padding: '2px 7px',
                borderRadius: '9999px',
                fontFamily: 'var(--font-hand)',
                fontWeight: 'bold',
                flexShrink: 0
            }}>
                {t.read}
            </span>
        </motion.a>
    );
};

export default ReleaseNote;
