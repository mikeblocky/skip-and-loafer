import { motion } from 'framer-motion';

const Fab = ({ onClick, onPointerDown, active, disabled, children, size = 36, style = {} }) => (
  <motion.button
    onClick={(e) => {
      e.stopPropagation();
      onClick?.();
    }}
    onPointerDown={(e) => {
      if (onPointerDown) {
        e.stopPropagation();
        onPointerDown(e);
      }
    }}
    disabled={disabled}
    whileHover={!disabled ? { scale: 1.1 } : {}}
    whileTap={!disabled ? { scale: 0.88 } : {}}
    style={{
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: '10px',
      background: active ? 'rgba(255,158,198,0.22)' : 'rgba(255,255,255,0.07)',
      border: active ? '1.5px solid rgba(255,158,198,0.45)' : '1.5px solid rgba(255,255,255,0.1)',
      color: active ? '#ff9ec6' : (disabled ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.55)'),
      cursor: disabled ? 'default' : 'pointer',
      pointerEvents: 'auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 0,
      transition: 'all 0.15s',
      flexShrink: 0,
      ...style,
    }}
  >{children}</motion.button>
);

export default Fab;
