import { motion } from 'framer-motion';
import {
  getReaderControlButtonStyle,
  getReaderControlsContainerStyle,
  READER_CONTROLS_LABEL_STYLE,
  getControlsSeparatorStyle,
} from './blogStyles';

const ReaderControls = ({
  floating = false,
  isMobile,
  showFloatingControls,
  readerPrefs,
  setReaderPrefs,
  toggleControls,
  themeControls,
  label,
}) => (
  <div style={getReaderControlsContainerStyle({ floating, isMobile, showFloatingControls })}>
    {!isMobile && !floating && (
      <span style={READER_CONTROLS_LABEL_STYLE}>{label}</span>
    )}

    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: isMobile ? '8px' : '10px', flexWrap: 'nowrap', flex: floating ? '0 0 auto' : 1, minWidth: 'max-content', margin: isMobile ? '0 auto' : 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '10px', flexWrap: 'nowrap', justifyContent: 'center' }}>
        {toggleControls.map(({ key, label: controlLabel, Icon }) => (
          <motion.button
            key={key}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.85, y: 4 }}
            onClick={() => setReaderPrefs((prev) => ({ ...prev, [key]: !prev[key] }))}
            style={getReaderControlButtonStyle({ active: readerPrefs[key], isMobile })}
            aria-pressed={readerPrefs[key]}
            title={controlLabel}
          >
            {isMobile ? <Icon size={18} strokeWidth={2.75} /> : controlLabel}
          </motion.button>
        ))}
      </div>

      <span style={getControlsSeparatorStyle(isMobile)} />

      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '10px', flexWrap: 'nowrap', justifyContent: 'center' }}>
        {themeControls.map(({ key, label: controlLabel, Icon }) => {
          const isActive = readerPrefs.theme === key;
          return (
            <motion.button
              key={key}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.85, y: 4 }}
              onClick={() => setReaderPrefs((prev) => ({ ...prev, theme: key }))}
              style={getReaderControlButtonStyle({ active: isActive, isMobile })}
              aria-pressed={isActive}
              title={controlLabel}
            >
              {isMobile ? <Icon size={18} strokeWidth={2.75} /> : controlLabel}
            </motion.button>
          );
        })}
      </div>
    </div>
  </div>
);

export default ReaderControls;
