/* eslint-disable no-unused-vars */
import { motion } from 'framer-motion';

const UI_TEXT = {
    en: { chapterOut: 'Chapter 80 out now!', quote: '"Haa... heartbreak"', read: 'Read ->' },
    es: { chapterOut: '¡Capítulo 80 disponible!', quote: '"Haa... desamor"', read: 'Leer ->' },
    pt: { chapterOut: 'Capítulo 80 disponível!', quote: '"Haa... desilusão amorosa"', read: 'Ler ->' },
    fr: { chapterOut: 'Chapitre 80 disponible !', quote: '"Haa... chagrin d\'amour"', read: 'Lire ->' },
    de: { chapterOut: 'Kapitel 80 ist jetzt da!', quote: '"Haa... Herzschmerz"', read: 'Lesen ->' },
    it: { chapterOut: 'Capitolo 80 disponibile ora!', quote: '"Haa... crepacuore"', read: 'Leggi ->' },
    ja: { chapterOut: '第80話 配信中', quote: '「ハァ〜の失恋②」', read: '読む ->' },
};

const ReleaseNote = ({ isMobile, uiLanguage = 'en', inline = false, largeText = false }) => {
    const t = UI_TEXT[uiLanguage] || UI_TEXT.en;
    const mobileInline = inline && isMobile;

    return (
        <motion.a
            href="https://comic-days.com/episode/12207421983746014862"
            target="_blank"
            rel="noopener noreferrer"
            style={{
                position: inline ? 'relative' : 'fixed',
                top: inline ? 'auto' : (isMobile ? '74vh' : '300px'),
                right: inline ? 'auto' : '50%',
                left: 'auto',
                bottom: 'auto',
                transform: inline ? 'none' : (isMobile ? 'translateX(50%)' : 'translateX(50%)'),
                alignSelf: 'auto',
                background: 'var(--themed-note-bg-1, #fef3c7)',
                padding: mobileInline ? '10px 12px 12px' : (isMobile ? '8px 12px' : (largeText ? '8px 16px' : '7px 15px')),
                borderRadius: '8px',
                zIndex: 1150,
                border: '3px solid var(--themed-note-border-1, #f59e0b)',
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
            whileHover={{ scale: 1.02, borderColor: '#d97706' }}
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
