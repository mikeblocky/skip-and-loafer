import * as FramerMotion from 'framer-motion';
import { ChevronRight } from 'lucide-react';

const BUTTON_RESET_STYLE = {
  width: '100%',
  textAlign: 'left',
  background: 'none',
  border: 'none',
  padding: 0,
  fontFamily: 'inherit',
  fontSize: 'inherit',
  fontWeight: 'inherit',
  color: 'inherit',
  outline: 'none',
  margin: 0,
};

const SETTINGS_GROUP_STYLE = {
  background: 'var(--surface-panel)',
  border: '2.5px solid var(--surface-border)',
  borderBottom: '5px solid var(--surface-border-strong)',
  borderRadius: '18px',
  overflow: 'hidden',
};

const getSettingsRowStyle = (disabled = false) => ({
  ...BUTTON_RESET_STYLE,
  minHeight: '54px',
  display: 'grid',
  gridTemplateColumns: '32px minmax(0, 1fr) auto',
  alignItems: 'center',
  gap: '12px',
  padding: '12px 14px',
  borderBottom: '1.5px solid rgba(148, 163, 184, 0.32)',
  cursor: disabled ? 'default' : 'pointer',
  opacity: disabled ? 0.58 : 1,
});

const SETTINGS_ROW_LAST_STYLE = {
  borderBottom: 'none',
};

const getSettingsIconStyle = (background, color) => ({
  width: '30px',
  height: '30px',
  borderRadius: '9px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background,
  color,
  flexShrink: 0,
});

const SETTINGS_VALUE_STYLE = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  fontFamily: 'var(--font-paper)',
  fontSize: '0.76rem',
  color: 'var(--text-secondary)',
  whiteSpace: 'nowrap',
};

export const SettingsRow = ({
  icon,
  iconBackground,
  iconColor,
  title,
  detail,
  value,
  onClick,
  disabled = false,
  destructive = false,
  last = false,
  role,
  ariaChecked,
}) => {
  const content = (
    <>
      <span style={getSettingsIconStyle(iconBackground, iconColor)}>{icon}</span>
      <span style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <span style={{
          fontFamily: 'var(--font-paper)',
          fontSize: '0.9rem',
          color: destructive ? '#b91c1c' : 'var(--text-primary)',
          lineHeight: 1.25,
        }}>
          {title}
        </span>
        {detail && (
          <span style={{
            fontFamily: 'var(--font-paper)',
            fontSize: '0.74rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.3,
          }}>
            {detail}
          </span>
        )}
      </span>
      <span style={SETTINGS_VALUE_STYLE}>
        {value}
        {onClick && !disabled && <ChevronRight size={15} strokeWidth={2.4} aria-hidden="true" />}
      </span>
    </>
  );

  if (!onClick) {
    return <div style={{ ...getSettingsRowStyle(false), cursor: 'default', ...(last ? SETTINGS_ROW_LAST_STYLE : {}) }}>{content}</div>;
  }

  return (
    <FramerMotion.motion.button
      type="button"
      role={role}
      aria-checked={ariaChecked}
      onClick={onClick}
      disabled={disabled}
      whileTap={disabled ? undefined : { scale: 0.995 }}
      style={{ ...getSettingsRowStyle(disabled), ...(last ? SETTINGS_ROW_LAST_STYLE : {}) }}
    >
      {content}
    </FramerMotion.motion.button>
  );
};

export const SettingsToggleRow = ({
  icon,
  iconBackground = '#dbeafe',
  iconColor = '#1d4ed8',
  title,
  detail,
  checked,
  onClick,
  last = false,
}) => (
  <SettingsRow
    icon={icon}
    iconBackground={checked ? iconBackground : '#e2e8f0'}
    iconColor={checked ? iconColor : '#64748b'}
    title={title}
    detail={detail}
    value={checked ? 'On' : 'Off'}
    onClick={onClick}
    role="checkbox"
    ariaChecked={checked}
    last={last}
  />
);

export const SettingsChoiceRow = ({
  icon,
  iconBackground = '#dbeafe',
  iconColor = '#1d4ed8',
  title,
  detail,
  selected,
  onClick,
  last = false,
}) => (
  <SettingsRow
    icon={icon}
    iconBackground={selected ? iconBackground : '#e2e8f0'}
    iconColor={selected ? iconColor : '#64748b'}
    title={title}
    detail={detail}
    value={selected ? 'Selected' : ''}
    onClick={onClick}
    role="radio"
    ariaChecked={selected}
    last={last}
  />
);

export const SettingsDropdown = ({
  title,
  value,
  children,
  defaultOpen = false,
}) => (
  <details
    open={defaultOpen}
    style={{
      ...SETTINGS_GROUP_STYLE,
      overflow: 'hidden',
    }}
  >
    <summary
      style={{
        minHeight: '52px',
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) auto',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 14px',
        cursor: 'pointer',
        listStyle: 'none',
        fontFamily: 'var(--font-paper)',
        color: 'var(--text-primary)',
        borderBottom: '1.5px solid rgba(148, 163, 184, 0.32)',
      }}
    >
      <span style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <span style={{ fontSize: '0.9rem', lineHeight: 1.25 }}>{title}</span>
      </span>
      <span style={SETTINGS_VALUE_STYLE}>{value}</span>
    </summary>
    <div>{children}</div>
  </details>
);
