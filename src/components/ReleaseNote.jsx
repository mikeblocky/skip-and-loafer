/* eslint-disable no-unused-vars */
import { motion } from 'framer-motion';

const ReleaseNote = ({ isMobile }) => (
    <motion.a
        href="https://comic-days.com/episode/12207421983406221656"
        target="_blank"
        rel="noopener noreferrer"
        style={{
            position: isMobile ? 'relative' : 'absolute',
            bottom: isMobile ? 'auto' : '-10px',
            right: isMobile ? 'auto' : '64px',
            left: 'auto',
            transform: isMobile ? 'none' : 'rotate(-1deg)',
            alignSelf: 'center',
            background: '#fef3c7',
            padding: isMobile ? '8px 12px' : '10px 20px',
            borderRadius: '8px',
            boxShadow: '0 3px 10px rgba(0,0,0,0.12)',
            zIndex: 30,
            border: '1.5px solid #f59e0b',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: isMobile ? '5px' : '10px',
            justifyContent: 'center',
            marginTop: isMobile ? '16px' : 0,
            marginBottom: isMobile ? '16px' : 0,
            width: isMobile ? 'fit-content' : 'auto',
            whiteSpace: isMobile ? 'normal' : 'nowrap'
        }}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.4, type: 'spring' }}
        whileHover={{ scale: 1.03, rotate: 0 }}
    >
        <span style={{ fontSize: isMobile ? '0.75rem' : '0.85rem' }}>📢</span>
        <span style={{ fontFamily: 'var(--font-hand)', color: '#92400e', fontSize: isMobile ? '0.75rem' : '0.85rem', fontWeight: 'bold' }}>
            Chapter 78 out now!
        </span>
        <span style={{ fontFamily: 'var(--font-hand)', color: '#b45309', fontSize: isMobile ? '0.7rem' : '0.8rem', fontStyle: 'italic' }}>
            "Pure white and brand new. Step firmly and feel the crunch."
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
            Read →
        </span>
    </motion.a>
);

export default ReleaseNote;
