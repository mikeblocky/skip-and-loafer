import { motion, AnimatePresence } from 'framer-motion';
import { useState, useCallback } from 'react';
import { createPaperButtonStyle } from './paperTheme';
import { STAMP_PRESS, STAMP_SPRING, PENCIL_HOVER, PENCIL_HOVER_TRANSITION } from '../animationPresets';

const DOODLES = ['✦', '★', '♡', '✿', '✧', '◦'];
const BURST_COLORS = ['#ff9ec6', '#97eba9', '#8fd3ff', '#ffe57f', '#ffb3d1', '#b3f0c4'];

const DoodleBurst = () => (
  <>
    {[...Array(6)].map((_, i) => {
      const angle = (i * 60 - 15) * (Math.PI / 180);
      const dist = 26 + (i % 2) * 8;
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist;
      return (
        <motion.span
          key={i}
          initial={{ x: 0, y: 0, scale: 0, opacity: 1, rotate: 0 }}
          animate={{ x: dx, y: dy, scale: [0, 1.3, 0.7], opacity: [1, 1, 0], rotate: i % 2 === 0 ? 30 : -20 }}
          transition={{ duration: 0.52, ease: 'easeOut', delay: i * 0.018 }}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            pointerEvents: 'none',
            fontSize: '11px',
            color: BURST_COLORS[i],
            lineHeight: 1,
            userSelect: 'none',
            zIndex: 20,
            marginTop: -7,
            marginLeft: -5,
          }}
        >
          {DOODLES[i]}
        </motion.span>
      );
    })}
  </>
);

const PaperActionButton = ({
  icon: Icon,
  children,
  palette,
  style,
  iconSize = 18,
  iconStrokeWidth = 2.5,
  type = 'button',
  className,
  onClick,
  ...props
}) => {
  const [burstKey, setBurstKey] = useState(null);

  const handleClick = useCallback((e) => {
    setBurstKey(Date.now());
    onClick?.(e);
  }, [onClick]);

  return (
    <motion.button
      type={type}
      className={className}
      style={{
        ...createPaperButtonStyle(palette),
        position: 'relative',
        overflow: 'visible',
        ...style,
      }}
      whileHover={PENCIL_HOVER}
      whileTap={STAMP_PRESS}
      transition={STAMP_SPRING}
      onClick={handleClick}
      {...props}
    >
      {Icon ? <Icon size={iconSize} strokeWidth={iconStrokeWidth} /> : null}
      {children}
      <AnimatePresence>
        {burstKey && <DoodleBurst key={burstKey} />}
      </AnimatePresence>
    </motion.button>
  );
};

export default PaperActionButton;
