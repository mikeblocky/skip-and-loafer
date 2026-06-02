import { memo, useEffect, useRef, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { Home, BookOpen, BarChart3, Cake, Image as ImageIcon, FileText, Trophy, PenLine, ImagePlus, Package, Settings, HelpCircle, Tv } from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';
import { toUiLabelCase } from '../../utils/textCase';

const DEFAULT_TABS = [
    { id: 'home', label: 'Home', icon: Home, color: '#f45b93', textColor: '#be185d', desktopFlex: 1 },
    { id: 'chapters', label: 'Chapters', icon: BookOpen, color: '#4d9cff', textColor: '#1d4ed8', desktopFlex: 1.18 },
    { id: 'anime', label: 'Anime', mobileLabel: 'Anime', icon: Tv, color: '#e040fb', textColor: '#9c27b0', desktopFlex: 1 },
    { id: 'gallery', label: 'Gallery', mobileLabel: 'Arts', icon: ImageIcon, color: '#7c4dff', textColor: '#6d28d9', desktopFlex: 1 },
    { id: 'fanGallery', label: 'Fan gallery', mobileLabel: 'Fan gallery', icon: ImagePlus, color: '#2563eb', textColor: '#1e40af', desktopFlex: 1.42 },
    { id: 'sign', label: 'Sign', mobileLabel: 'Sign', icon: PenLine, color: '#f97316', textColor: '#c2410c', desktopFlex: 0.96 },
    { id: 'blog', label: 'Blog', mobileLabel: 'Blog', icon: FileText, color: '#ff7a1a', textColor: '#b45309', desktopFlex: 1 },
    { id: 'sync', label: 'Reading', mobileLabel: 'Reading', icon: BarChart3, color: '#38c972', textColor: '#15803d', desktopFlex: 1.16 },
    { id: 'quiz', label: 'Quiz', mobileLabel: 'Quiz', icon: Trophy, color: '#ff5757', textColor: '#b91c1c', desktopFlex: 1 },
    { id: 'birthdays', label: 'Birthdays', mobileLabel: 'Birthdays', icon: Cake, color: '#ffb11f', textColor: '#a16207', desktopFlex: 1.22 },
    { id: 'mystery', label: 'Mystery', mobileLabel: 'Mystery', icon: Package, color: '#f472b6', textColor: '#be185d', desktopFlex: 1.12 },
    { id: 'tutorial', label: 'Tutorial', mobileLabel: 'Guide', icon: HelpCircle, color: '#06b6d4', textColor: '#0891b2', desktopFlex: 1.05 },
    { id: 'settings', label: 'Settings', mobileLabel: 'Settings', icon: Settings, color: '#818cf8', textColor: '#4338ca', desktopFlex: 1.1 },
];

const NavTabs = ({ activePage, onPageChange, isMobile, tabs, labelsById, openTabPrefix = 'Open', tabSuffix = 'tab', unreadCount = 0 }) => {
  const railRef = useRef(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const tabsToRender = Array.isArray(tabs) && tabs.length > 0
    ? DEFAULT_TABS.filter((tab) => tabs.includes(tab.id))
    : DEFAULT_TABS;

  const handleTabPress = useCallback((tabId) => {
    triggerHaptic('selection');
    onPageChange(tabId);
    setIsMobileMenuOpen(false);
  }, [onPageChange]);

  useEffect(() => {
    if (!isMobile || !railRef.current) return;
    const activeButton = railRef.current.querySelector(`[data-tab-id="${activePage}"]`);
    if (!activeButton) return;

    activeButton.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    });
  }, [activePage, isMobile]);

  if (isMobile) {
    // Elegant space-saving frosted glass bottom dock
    return (
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'rgba(255, 255, 255, 0.82)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(15, 23, 42, 0.08)',
          boxShadow: '0 -8px 24px rgba(15, 23, 42, 0.06)',
          zIndex: 1000,
          padding: '8px 12px calc(env(safe-area-inset-bottom, 0px) + 8px) 12px',
          pointerEvents: 'auto',
        }}
      >
        <div
          ref={railRef}
          className="hide-scrollbar"
          style={{
            display: 'flex',
            gap: '8px',
            width: '100%',
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch',
            touchAction: 'pan-x',
            overscrollBehaviorX: 'contain',
            justifyContent: 'flex-start',
            alignItems: 'center',
            scrollSnapType: 'x proximity',
          }}
        >
          {tabsToRender.map((tab) => {
            const isActive = activePage === tab.id;
            const Icon = tab.icon;
            const label = toUiLabelCase(labelsById?.[tab.id]?.mobileLabel || tab.mobileLabel || labelsById?.[tab.id]?.label || tab.label);
            const iconSize = tab.iconSizeMobile || 19;
            const mobileBasis = Math.max(104, Math.min(180, Math.round(label.length * 8.6) + 38));
            return (
              <div
                key={`wrap-${tab.id}`}
                style={{
                  display: 'flex',
                  flex: '0 0 auto',
                  minWidth: `${mobileBasis}px`,
                  scrollSnapAlign: 'start',
                }}
              >
                <motion.button
                  key={tab.id}
                  data-tab-id={tab.id}
                  onClick={() => handleTabPress(tab.id)}
                  aria-label={`${openTabPrefix} ${label} ${tabSuffix}`}
                  aria-current={isActive ? 'page' : undefined}
                  whileTap={{ scale: 0.94 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: isActive ? '7px 12px 9px 12px' : '8px 12px',
                    background: isActive ? '#ffffff' : `${tab.color}15`,
                    border: `3px solid ${isActive ? tab.color : tab.color + '50'}`,
                    borderBottom: isActive
                      ? `5px solid var(--themed-nav-active-border-bottom, ${tab.textColor})`
                      : `5px solid var(--themed-nav-border-bottom, ${tab.textColor}40)`,
                    borderRadius: '14px',
                    cursor: 'pointer',
                    fontFamily: 'Sniglet, var(--font-main)',
                    fontSize: '0.86rem',
                    lineHeight: 1.1,
                    fontWeight: isActive ? '700' : '600',
                    color: isActive
                      ? `var(--themed-nav-active-text-mobile, ${tab.color})`
                      : `var(--themed-nav-text, ${tab.textColor})`,
                    opacity: isActive ? 1 : 0.82,
                    boxShadow: isActive
                      ? `0 4px 12px ${tab.color}25`
                      : `0 2px 4px ${tab.color}08`,
                    width: '100%',
                    flex: '1 1 auto',
                    minHeight: '38px',
                    overflow: 'hidden',
                    transition: 'opacity 0.15s ease',
                  }}
                >
                  <Icon size={iconSize} strokeWidth={2.4} />
                  <span>{label}</span>

                </motion.button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Elegant Desktop Vertical Solid Notebook Cover Sidebar — fills full height
  return (
    <div
      style={{
        width: '232px',
        flexShrink: 0,
        position: 'sticky',
        top: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        padding: '12px 14px',
        background: 'transparent',
        border: 'none',
        boxShadow: 'none',
        zIndex: 100,
        pointerEvents: 'auto',
        minHeight: 'unset',
        height: 'calc(100% - 24px)',
        overflow: 'visible',
      }}
    >
      {tabsToRender.map((tab) => {
        const isActive = activePage === tab.id;
        const Icon = tab.icon;
        const label = toUiLabelCase(labelsById?.[tab.id]?.label || tab.label);
        const iconSize = 18;
        return (
          <motion.button
            key={tab.id}
            data-tab-id={tab.id}
            onClick={() => handleTabPress(tab.id)}
            aria-label={`${openTabPrefix} ${label} ${tabSuffix}`}
            aria-current={isActive ? 'page' : undefined}
            animate={{ x: isActive ? -18 : 0 }}
            whileHover={{
              x: isActive ? -22 : -8,
              scale: 1.02,
              opacity: 1,
              background: isActive ? tab.color : `${tab.color}25`,
              border: `3px solid ${tab.color}`,
              borderRight: isActive ? 'none' : `3px solid ${tab.color}88`,
              borderBottom: isActive ? `5px solid ${tab.textColor}` : `5px solid var(--themed-nav-border-bottom-hover, ${tab.textColor}88)`,
              boxShadow: isActive 
                ? `0 8px 24px ${tab.color}40, 0 0 16px ${tab.color}20`
                : `0 6px 16px ${tab.color}18, 0 0 8px ${tab.color}0c`
            }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              flex: '1 1 0px',
              minHeight: 0,
              padding: '6px 14px',
              background: isActive ? tab.color : `${tab.color}15`,
              border: `3px solid ${isActive ? tab.color : tab.color + '50'}`,
              borderRight: isActive ? 'none' : `3px solid ${tab.color}40`,
              borderBottom: isActive
                ? `5px solid ${tab.textColor}`
                : `5px solid var(--themed-nav-border-bottom, ${tab.textColor}40)`,
              borderRadius: isActive ? '16px 0 0 16px' : '16px 6px 6px 16px',
              cursor: 'pointer',
              fontFamily: 'Sniglet, var(--font-main)',
              fontSize: '0.94rem',
              lineHeight: 1.2,
              fontWeight: isActive ? '700' : '600',
              color: isActive ? '#ffffff' : `var(--themed-nav-text, ${tab.textColor})`,
              opacity: isActive ? 1 : 0.82,
              boxShadow: isActive 
                ? `0 6px 18px ${tab.color}30` 
                : `0 2px 6px ${tab.color}0c`,
              width: 'calc(100% + 48px)',
              textAlign: 'left',
              overflow: 'visible',
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isActive ? '#ffffff' : `var(--themed-nav-text, ${tab.textColor})`,
                flexShrink: 0,
              }}
            >
              <Icon size={iconSize} strokeWidth={2.4} />
            </span>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {label}
            </span>

          </motion.button>
        );
      })}
    </div>
  );
};

export default memo(NavTabs);
// Force Vite HMR cache invalidation

