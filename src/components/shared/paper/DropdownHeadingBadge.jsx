import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { PAPER_FONT_FAMILY, createPaperHeadingBadgeStyle } from './paperTheme';

/**
 * DropdownHeadingBadge
 *
 * Looks like a PaperHeadingBadge but includes a chevron and a dropdown
 * popover that lists sub-tab options. When only one option is provided
 * (or no options at all) it renders like a plain badge with no dropdown.
 *
 * Props:
 *  isMobile      – bool
 *  icon          – Lucide icon component
 *  options       – [{ id, label, icon?, palette?, titleColor?, iconColor? }] — the sub-tab list
 *  value         – currently active sub-tab id
 *  onChange      – (id) => void
 *  palette       – { borderColor, bottomColor, shadow }
 *  titleColor    – string
 *  iconColor     – string
 *  fontFamily    – string
 */
const DropdownHeadingBadge = ({
  isMobile,
  icon: Icon,
  options = [],
  value,
  onChange,
  palette = {},
  titleColor = 'var(--text-primary)',
  iconColor,
  fontFamily = PAPER_FONT_FAMILY,
}) => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  const activeOption = options.find((o) => o.id === value) || options[0];
  const label = activeOption?.label || '';
  const hasDropdown = options.length > 1;
  const activePalette = activeOption?.palette || palette;
  const activeTitleColor = activeOption?.titleColor || titleColor;
  const activeIconColor = activeOption?.iconColor || iconColor || activeTitleColor;

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [open]);

  const badgeStyle = createPaperHeadingBadgeStyle({
    borderColor: activePalette.borderColor,
    bottomColor: activePalette.bottomColor,
    shadow: activePalette.shadow,
    padding: isMobile ? '9px 20px' : '11px 26px',
  });

  const handleSelect = (id) => {
    onChange?.(id);
    setOpen(false);
  };

  return (
    <div
      ref={wrapperRef}
      style={{ position: 'relative', display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}
    >
      {/* The badge trigger */}
      <button
        type="button"
        onClick={() => hasDropdown && setOpen((prev) => !prev)}
        aria-haspopup={hasDropdown ? 'listbox' : undefined}
        aria-expanded={hasDropdown ? open : undefined}
        style={{
          ...badgeStyle,
          cursor: hasDropdown ? 'pointer' : 'default',
          // override display from inline-flex so button works
          display: 'inline-flex',
          background: 'none',
          fontFamily: 'inherit',
          fontSize: 'inherit',
          // add a subtle active press
          transition: 'transform 0.12s ease, box-shadow 0.12s ease',
          userSelect: 'none',
          gap: isMobile ? '8px' : '10px',
        }}
        className="dropdown-heading-badge-trigger"
      >
        {/* Page icon */}
        {Icon && (
          <span style={{ display: 'inline-flex', color: activeIconColor, flexShrink: 0 }}>
            <Icon size={isMobile ? 17 : 20} strokeWidth={2.2} />
          </span>
        )}

        {/* Active tab label */}
        <span style={{
          fontFamily,
          fontSize: isMobile ? '1.05rem' : '1.22rem',
          fontWeight: '400',
          color: activeTitleColor,
          lineHeight: 1.1,
          letterSpacing: '0.012em',
          whiteSpace: 'nowrap',
        }}>
          {label}
        </span>

        {/* Chevron — only if there are multiple options */}
        {hasDropdown && (
          <span
            style={{
              display: 'inline-flex',
              color: activeTitleColor,
              opacity: 0.65,
              transition: 'transform 0.2s ease',
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
              marginLeft: '-2px',
              flexShrink: 0,
            }}
          >
            <ChevronDown size={isMobile ? 14 : 16} strokeWidth={2.5} />
          </span>
        )}
      </button>

      {/* Dropdown popover */}
      {hasDropdown && open && (
        <div
          role="listbox"
          aria-label="Sub-tab options"
          style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginTop: '8px',
            background: 'var(--surface-card, #ffffff)',
            border: `2px solid ${activePalette.borderColor || 'var(--surface-border, #cbd5e1)'}`,
            borderBottom: `5px solid ${activePalette.bottomColor || 'var(--surface-border-strong, #94a3b8)'}`,
            borderRadius: '16px',
            boxShadow: '0 8px 24px rgba(15,23,42,0.12)',
            zIndex: 9999,
            minWidth: '160px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            padding: '6px',
            gap: '4px',
          }}
        >
          {options.map((opt) => {
            const isActive = opt.id === value;
            const OptIcon = opt.icon;
            const optPalette = opt.palette || palette;
            const optTitleColor = opt.titleColor || activeTitleColor;
            const optBorderColor = optPalette.borderColor || 'var(--surface-border, #cbd5e1)';
            return (
              <button
                key={opt.id}
                role="option"
                aria-selected={isActive}
                type="button"
                onClick={() => handleSelect(opt.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 14px',
                  fontFamily,
                  fontSize: '0.9rem',
                  fontWeight: isActive ? '700' : '400',
                  cursor: 'pointer',
                  color: isActive ? optTitleColor : 'var(--text-secondary, #475569)',
                  background: isActive
                    ? `${optBorderColor}18`
                    : 'transparent',
                  border: isActive
                    ? `1.5px solid ${optBorderColor}`
                    : '1.5px solid transparent',
                  borderRadius: '10px',
                  textAlign: 'left',
                  transition: 'all 0.12s ease',
                  whiteSpace: 'nowrap',
                }}
                className="dropdown-heading-badge-option"
              >
                {OptIcon && (
                  <span style={{ display: 'inline-flex', color: isActive ? (opt.iconColor || optTitleColor) : 'var(--text-secondary)', flexShrink: 0, opacity: isActive ? 1 : 0.6 }}>
                    <OptIcon size={15} strokeWidth={2.2} />
                  </span>
                )}
                {opt.label}
                {isActive && (
                  <span style={{ marginLeft: 'auto', fontSize: '10px', color: optTitleColor, opacity: 0.7 }}>✦</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DropdownHeadingBadge;
