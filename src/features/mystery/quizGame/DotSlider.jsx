import React from 'react';
import { motion } from 'framer-motion';

void motion;
import { triggerHaptic } from '../../../utils/haptics';
import { DOT_COLORS } from './config';

const DotSlider = ({ isMobile, value, onChange, leftLabel, rightLabel }) => {
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: isMobile ? '8px' : '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', width: '100%', alignItems: 'center', padding: '0 10px', height: isMobile ? '24px' : '32px' }}>
        <div style={{ position: 'absolute', top: '50%', left: '20px', right: '20px', height: '4px', background: isMobile ? '#bfdbfe' : '#e2e8f0', transform: 'translateY(-50%)', zIndex: 0, borderRadius: '4px' }} />
        {[1, 2, 3, 4, 5].map((point) => {
          const color = DOT_COLORS[point - 1];

          return (
            <motion.button
              key={point}
              whileHover={{ scale: 1.25 }}
              whileTap={{ scale: 0.85 }}
              onClick={() => {
                triggerHaptic('selection');
                onChange(point);
              }}
              style={{
                width: isMobile ? '20px' : '28px',
                height: isMobile ? '20px' : '28px',
                borderRadius: '50%',
                background: value === point ? color : 'white',
                border: `${isMobile ? '3px' : '4px'} solid ${value === point ? color : '#cbd5e1'}`,
                zIndex: 1,
                cursor: 'pointer',
                padding: 0,
                boxShadow: value === point ? `0 0 10px ${color}80` : '0 1px 3px rgba(0,0,0,0.1)',
                transition: 'background 0.2s, border 0.2s',
              }}
              aria-label={`Select point ${point}`}
            />
          );
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: isMobile ? 'var(--font-hand)' : 'var(--font-main)', color: '#64748b', fontSize: isMobile ? '0.95rem' : '1.15rem', lineHeight: 1.2, fontWeight: 'bold' }}>
        <span style={{ maxWidth: '45%', textAlign: 'left' }}>{leftLabel}</span>
        <span style={{ maxWidth: '45%', textAlign: 'right' }}>{rightLabel}</span>
      </div>
    </div>
  );
};

export default DotSlider;
