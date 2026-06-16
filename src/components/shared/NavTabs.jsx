import { memo, useEffect, useRef, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { Home, BookOpen, BarChart3, Cake, Image as ImageIcon, FileText, Trophy, PenLine, ImagePlus, Package, Settings, HelpCircle, Users2 } from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';
import { toUiLabelCase } from '../../utils/textCase';

const DEFAULT_TABS = [
    { id: 'home',       label: 'Home',       icon: Home,      color: '#f45b93', textColor: '#be185d', group: 'main' },
    { id: 'chapters',   label: 'Chapters',   icon: BookOpen,  color: '#4d9cff', textColor: '#1d4ed8', group: 'main' },
    { id: 'gallery',    label: 'Gallery',    icon: ImageIcon, color: '#7c4dff', textColor: '#6d28d9', group: 'gallery' },
    { id: 'fanGallery', label: 'Fan gallery', mobileLabel: 'Fan art', icon: ImagePlus, color: '#2563eb', textColor: '#1e40af', group: 'gallery' },
    { id: 'sign',       label: 'Sign',       icon: PenLine,   color: '#f97316', textColor: '#c2410c', group: 'community' },
    { id: 'community',  label: 'Community',  icon: Users2,    color: '#f97316', textColor: '#c2410c', group: 'gallery' },
    { id: 'blog',       label: 'Blog',       icon: FileText,  color: '#ff7a1a', textColor: '#b45309', group: 'community' },
    { id: 'sync',       label: 'Reading',    icon: BarChart3, color: '#38c972', textColor: '#15803d', group: 'community' },
    { id: 'quiz',       label: 'Quiz',       icon: Trophy,    color: '#ff5757', textColor: '#b91c1c', group: 'activities' },
    { id: 'mystery',    label: 'Mystery',    icon: Package,   color: '#f472b6', textColor: '#be185d', group: 'activities' },
    { id: 'birthdays',  label: 'Birthdays',  icon: Cake,      color: '#ffb11f', textColor: '#a16207', group: 'activities' },
    { id: 'tutorial',   label: 'Tutorial',   mobileLabel: 'Guide', icon: HelpCircle, color: '#06b6d4', textColor: '#0891b2', group: 'misc' },
    { id: 'settings',   label: 'Settings',   icon: Settings,  color: '#818cf8', textColor: '#4338ca', group: 'misc' },
];

const GROUP_LABELS = {
    gallery:    'Gallery',
    community:  'Community',
    activities: 'Activities',
    misc:       null, // just a divider
};

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
          background: 'rgba(255, 255, 255, 0.94)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
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
                  whileHover={{ scale: 1.06, y: -2, rotate: 1 }}
                  whileTap={{ scale: 0.88, rotate: -2, y: 2 }}
                  transition={{ type: 'spring', stiffness: 550, damping: 14 }}
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

  // Notebook Bookmark Sidebar — tabs look like physical paper dividers
  const items = [];
  tabsToRender.forEach((tab) => {
    const isActive = activePage === tab.id;
    const Icon = tab.icon;
    const label = toUiLabelCase(labelsById?.[tab.id]?.label || tab.label);
    const iconSize = 17;
    items.push(
      <motion.button
        key={tab.id}
        data-tab-id={tab.id}
        data-active={isActive ? 'true' : 'false'}
        onClick={() => handleTabPress(tab.id)}
        aria-label={`${openTabPrefix} ${label} ${tabSuffix}`}
        aria-current={isActive ? 'page' : undefined}
        className="nav-bookmark-btn"
        whileHover={{ x: 4, scale: 1.03, rotate: 0.5, boxShadow: `0 6px 18px ${tab.color}50` }}
        whileTap={{ scale: 0.91, x: 2, rotate: -1 }}
        transition={{ type: 'spring', stiffness: 480, damping: 16 }}
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flex: '1 1 0px',
          minHeight: 0,
          padding: '0 10px 0 8px',
          background: isActive ? tab.color : `${tab.color}22`,
          border: 'none',
          borderLeft: `5px solid ${tab.color}`,
          borderBottom: isActive ? `3px solid ${tab.textColor}` : `2px solid ${tab.color}55`,
          borderRadius: '10px 0 0 10px',
          cursor: 'pointer',
          fontFamily: 'Sniglet, var(--font-main)',
          fontSize: '0.84rem',
          lineHeight: 1.2,
          fontWeight: isActive ? '700' : '600',
          color: isActive ? '#ffffff' : tab.textColor,
          boxShadow: isActive
            ? `0 4px 14px ${tab.color}40`
            : `0 1px 4px ${tab.color}18`,
          width: 'calc(100% + 32px)',
          textAlign: 'left',
          overflow: 'visible',
        }}
      >
        <motion.span
          style={{ display: 'inline-flex', alignItems: 'center', color: isActive ? '#ffffff' : tab.color, flexShrink: 0 }}
          animate={isActive ? { rotate: [0, -8, 6, -3, 0], scale: [1, 1.2, 1.05, 1.1, 1] } : {}}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <Icon size={iconSize} strokeWidth={isActive ? 2.6 : 2.2} />
        </motion.span>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {label}
        </span>
        {isActive && (
          <motion.span
            initial={{ scale: 0, rotate: -20, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 14, delay: 0.05 }}
            style={{
              position: 'absolute',
              right: -22,
              top: '50%',
              marginTop: -8,
              fontSize: '13px',
              pointerEvents: 'none',
              filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.15))',
            }}
          >
            ✦
          </motion.span>
        )}
      </motion.button>
    );
  });

  return (
    <div
      style={{
        width: '175px',
        flexShrink: 0,
        position: 'sticky',
        top: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '5px',
        padding: '10px 0 10px 16px',
        background: 'transparent',
        border: 'none',
        boxShadow: 'none',
        zIndex: 100,
        pointerEvents: 'auto',
        height: 'calc(100dvh - 154px)',
        overflow: 'visible',
      }}
    >
      {items}
    </div>
  );
};

export default memo(NavTabs);
// Force Vite HMR cache invalidation

