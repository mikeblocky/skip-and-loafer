/* eslint-disable no-unused-vars */
import { motion } from 'framer-motion';

const UI_TEXT = {
    en: { chapterOut: 'Chapter 78 out now!', quote: '"Pure white and brand new. Step firmly and feel the crunch."', read: 'Read ->' },
    es: { chapterOut: 'Capitulo 78 disponible!', quote: '"Puro blanco y completamente nuevo. Pisa firme y siente el crujido."', read: 'Leer ->' },
    pt: { chapterOut: 'Capitulo 78 disponivel!', quote: '"Branco puro e totalmente novo. Pise firme e sinta o estalo."', read: 'Ler ->' },
    fr: { chapterOut: 'Chapitre 78 disponible !', quote: '"Blanc pur et tout neuf. Avancez fermement et sentez le craquement."', read: 'Lire ->' },
    de: { chapterOut: 'Kapitel 78 ist jetzt da!', quote: '"Reinweiss und brandneu. Tritt fest auf und spure das Knirschen."', read: 'Lesen ->' },
    it: { chapterOut: 'Capitolo 78 disponibile ora!', quote: '"Bianco puro e nuovissimo. Cammina deciso e senti lo scricchiolio."', read: 'Leggi ->' },
};

const ReleaseNote = ({ isMobile, uiLanguage = 'en', inline = false }) => {
    const t = UI_TEXT[uiLanguage] || UI_TEXT.en;

    return (
        <motion.a
            href="https://comic-days.com/episode/12207421983406221656"
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
                padding: isMobile ? '8px 12px' : '10px 20px',
                borderRadius: '8px',
                boxShadow: '0 3px 10px rgba(0,0,0,0.12)',
                zIndex: 1150,
                border: '1.5px solid #f59e0b',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                flexWrap: inline && isMobile ? 'wrap' : 'nowrap',
                gap: isMobile ? '5px' : '10px',
                justifyContent: 'center',
                marginTop: 0,
                marginBottom: 0,
                width: isMobile ? 'fit-content' : 'auto',
                maxWidth: inline && isMobile ? '100%' : 'none',
                whiteSpace: isMobile ? 'normal' : 'nowrap'
            }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.4, type: 'spring' }}
            whileHover={{ scale: 1.03, rotate: 0 }}
        >
            <span style={{ fontFamily: 'var(--font-hand)', color: '#92400e', fontSize: isMobile ? '0.75rem' : '0.85rem', fontWeight: 'bold' }}>
                {t.chapterOut}
            </span>
            <span style={{ fontFamily: 'var(--font-hand)', color: '#b45309', fontSize: isMobile ? '0.7rem' : '0.8rem', fontStyle: 'italic' }}>
                {t.quote}
            </span>
            <span style={{
                fontSize: isMobile ? '0.65rem' : '0.75rem',
                color: '#fff',
                background: 'var(--pop-pink)',
                padding: '2px 8px',
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
