import { motion } from 'framer-motion';

/* Four characters — two on each side, tucked to the viewport edges.
   Rendered only on desktop (hidden via display:none on mobile). */
const CHARS = [
  { src: '/characters/1c.png', alt: 'Mitsumi', side: 'left',  top: '18%', rotate: 6,  floatY: [0, -14, 0], dur: 4.0 },
  { src: '/characters/3c.png', alt: 'Mika',    side: 'left',  top: '58%', rotate: -8, floatY: [0, -10, 0], dur: 5.2 },
  { src: '/characters/2c.png', alt: 'Sousuke', side: 'right', top: '22%', rotate: -6, floatY: [0, -12, 0], dur: 4.6 },
  { src: '/characters/4c.png', alt: 'Makoto',  side: 'right', top: '62%', rotate: 9,  floatY: [0, -8,  0], dur: 3.8 },
];

const SideCharacters = ({ isMobile }) => {
  if (isMobile) return null;

  return (
    <>
      {CHARS.map((c) => (
        <motion.img
          key={c.src + c.side}
          src={c.src}
          alt={c.alt}
          initial={{ opacity: 0, x: c.side === 'left' ? -30 : 30 }}
          animate={{ opacity: 1, x: 0, y: c.floatY }}
          transition={{
            opacity: { duration: 0.6 },
            x:       { duration: 0.6 },
            y:       { duration: c.dur, repeat: Infinity, ease: 'easeInOut' },
          }}
          style={{
            position: 'fixed',
            [c.side]: '-8px',
            top: c.top,
            width: '130px',
            rotate: `${c.rotate}deg`,
            zIndex: 0,
            pointerEvents: 'none',
            userSelect: 'none',
            filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.12))',
          }}
        />
      ))}
    </>
  );
};

export default SideCharacters;
