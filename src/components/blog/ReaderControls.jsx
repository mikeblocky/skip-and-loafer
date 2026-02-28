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

    {toggleControls.map(({ key, label: controlLabel, Icon }) => (
      <button
        key={key}
        onClick={() => setReaderPrefs((prev) => ({ ...prev, [key]: !prev[key] }))}
        style={getReaderControlButtonStyle({ active: readerPrefs[key], isMobile })}
        aria-pressed={readerPrefs[key]}
        title={controlLabel}
      >
        {isMobile ? <Icon size={20} /> : controlLabel}
      </button>
    ))}

    <span style={getControlsSeparatorStyle(isMobile)} />

    {themeControls.map(({ key, label: controlLabel, Icon }) => {
      const isActive = readerPrefs.theme === key;
      return (
        <button
          key={key}
          onClick={() => setReaderPrefs((prev) => ({ ...prev, theme: key }))}
          style={getReaderControlButtonStyle({ active: isActive, isMobile })}
          aria-pressed={isActive}
          title={controlLabel}
        >
          {isMobile ? <Icon size={20} /> : controlLabel}
        </button>
      );
    })}
  </div>
);

export default ReaderControls;
