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
    whileHover={!disabled ? { scale: 1.08, y: -2 } : {}}
    whileTap={!disabled ? { scale: 0.94, y: 1 } : {}}
    style={{
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: '12px',
      background: active ? '#ff9ec6' : (disabled ? '#1e293b' : '#ffffff'),
      border: '2.5px solid #0f172a',
      borderBottom: active ? '3.5px solid #0f172a' : (disabled ? '2.5px solid #0f172a' : '5px solid #0f172a'),
      color: active ? '#0f172a' : (disabled ? '#64748b' : '#0f172a'),
      cursor: disabled ? 'not-allowed' : 'pointer',
      pointerEvents: 'auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 0,
      fontFamily: 'var(--font-main)',
      fontWeight: '900',
      transition: 'background-color 0.15s, border-color 0.15s, color 0.15s',
      flexShrink: 0,
      opacity: disabled ? 0.6 : 1,
      ...style,
    }}
  >{children}</motion.button>
);

export default Fab;
