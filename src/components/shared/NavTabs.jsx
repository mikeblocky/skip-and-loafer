import { memo, useEffect, useRef, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, BookOpen, BarChart3, Cake, Image as ImageIcon, FileText, Trophy, PenLine, ImagePlus, ChevronDown, Package } from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';
import { toUiLabelCase } from '../../utils/textCase';

const DEFAULT_TABS = [
    { id: 'home', label: 'Home', icon: Home, color: '#f45b93', desktopFlex: 1 },
    { id: 'chapters', label: 'Chapters', icon: BookOpen, color: '#4d9cff', desktopFlex: 1.18 },
    { id: 'gallery', label: 'Gallery', mobileLabel: 'Arts', icon: ImageIcon, color: '#7c4dff', desktopFlex: 1 },
    { id: 'fanGallery', label: 'Fan gallery', mobileLabel: 'Fan gallery', icon: ImagePlus, color: '#2563eb', desktopFlex: 1.42 },
    { id: 'sign', label: 'Sign', mobileLabel: 'Sign', icon: PenLine, color: '#f97316', desktopFlex: 0.96 },
    { id: 'blog', label: 'Blog', mobileLabel: 'Blog', icon: FileText, color: '#ff7a1a', desktopFlex: 1 },
    { id: 'sync', label: 'Reading', mobileLabel: 'Reading', icon: BarChart3, color: '#38c972', desktopFlex: 1.16 },
    { id: 'quiz', label: 'Quiz', mobileLabel: 'Quiz', icon: Trophy, color: '#ff5757', desktopFlex: 1 },
    { id: 'birthdays', label: 'Birthdays', mobileLabel: 'Birthdays', icon: Cake, color: '#ffb11f', desktopFlex: 1.22 },
    { id: 'mystery', label: 'Mystery', mobileLabel: 'Mystery', icon: Package, color: '#f472b6', desktopFlex: 1.12 },
];

const DARK_OUTLINE = '#0f172a';
const USE_COMPACT_MOBILE_NAV = false;

const NavTabs = ({ activePage, onPageChange, isMobile, tabs, labelsById, openTabPrefix = 'Open', tabSuffix = 'tab' }) => {
  const railRef = useRef(null);
  const mobileSelectorRef = useRef(null);
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

  useEffect(() => {
    if (!isMobile || !USE_COMPACT_MOBILE_NAV) return undefined;

    const handleClickOutside = (event) => {
      if (mobileSelectorRef.current && !mobileSelectorRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen, isMobile]);

  const activeTab = tabsToRender.find((tab) => tab.id === activePage) || tabsToRender[0];
  const ActiveIcon = activeTab.icon;
  const activeLabel = toUiLabelCase(labelsById?.[activeTab.id]?.label || activeTab.label);
  const activeMobileLabel = toUiLabelCase(labelsById?.[activeTab.id]?.mobileLabel || activeTab.mobileLabel || activeLabel);
  const activeMobileIconSize = activeTab.iconSizeMobile || 22;

  if (isMobile && USE_COMPACT_MOBILE_NAV) {
    return (
      <div
        style={{
          position: 'relative',
          width: '100%',
          marginBottom: '26px',
          paddingTop: '4px',
          zIndex: 40,
          pointerEvents: 'auto',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <div ref={mobileSelectorRef} style={{ position: 'relative', zIndex: 100, width: 'min(100%, 316px)' }}>
          <motion.button
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            whileHover={{ scale: 1.01, y: -1 }}
            whileTap={{ scale: 0.99 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              width: '100%',
              minHeight: '64px',
              padding: '14px 20px',
              background: activeTab.color,
              color: '#ffffff',
              border: `3px solid ${DARK_OUTLINE}`,
              borderBottom: `8px solid ${DARK_OUTLINE}`,
              borderRadius: '20px',
              boxShadow: `0 12px 24px ${activeTab.color}52, inset 0 1px 0 rgba(255,255,255,0.18)`,
              fontFamily: 'Sniglet, var(--font-main)',
              fontSize: '1.08rem',
              fontWeight: '400',
              cursor: 'pointer',
              position: 'relative',
              textShadow: '0 1px 0 rgba(15,23,42,0.18)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', minWidth: 0 }}>
              <ActiveIcon size={activeMobileIconSize} strokeWidth={2.5} />
              <span
                style={{
                  minWidth: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  color: '#ffffff',
                  fontSize: '1.1rem',
                  fontWeight: '400',
                  textAlign: 'center',
                }}
              >
                {activeMobileLabel}
              </span>
            </div>
            <motion.div
              animate={{ rotate: isMobileMenuOpen ? 180 : 0 }}
              transition={{ duration: 0.18 }}
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(255,255,255,0.24)',
                color: '#ffffff',
                position: 'absolute',
                right: '10px',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18)',
              }}
            >
              <ChevronDown size={20} />
            </motion.div>
          </motion.button>

          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.97 }}
                animate={{ opacity: 1, y: 12, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.97 }}
                transition={{ duration: 0.16, ease: 'easeOut' }}
              style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: '#ffffff',
                  border: '1px solid rgba(148,163,184,0.26)',
                  borderRadius: '24px',
                  padding: '12px',
                  boxShadow: '0 20px 36px rgba(15,23,42,0.14)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {tabsToRender.map((tab) => {
                    const isActive = activePage === tab.id;
                    const Icon = tab.icon;
                    const label = toUiLabelCase(labelsById?.[tab.id]?.mobileLabel || labelsById?.[tab.id]?.label || tab.mobileLabel || tab.label);
                    return (
                      <motion.button
                        key={tab.id}
                        onClick={() => handleTabPress(tab.id)}
                        whileHover={{ y: -1, boxShadow: isActive ? `0 10px 18px ${tab.color}24` : '0 8px 16px rgba(15,23,42,0.08)' }}
                        whileTap={{ scale: 0.99 }}
                        aria-label={`${openTabPrefix} ${label} ${tabSuffix}`}
                        aria-current={isActive ? 'page' : undefined}
                        style={{
                          position: 'relative',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '14px',
                          width: '100%',
                          minHeight: '72px',
                          padding: '14px 16px',
                          background: isActive ? '#ffffff' : '#fefefe',
                          color: isActive ? tab.color : '#334155',
                          border: `3px solid ${isActive ? tab.color : '#cbd5e1'}`,
                          borderBottom: `7px solid ${isActive ? tab.color : '#cbd5e1'}`,
                          borderRadius: '18px',
                          boxShadow: isActive
                            ? `0 10px 20px ${tab.color}28`
                            : '0 6px 12px rgba(15,23,42,0.06)',
                          fontFamily: 'Sniglet, var(--font-main)',
                          fontWeight: '400',
                          cursor: 'pointer',
                          textAlign: 'left',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            position: 'absolute',
                            inset: '0 auto 0 0',
                            width: '6px',
                            background: tab.color,
                            opacity: isActive ? 1 : 0.82,
                          }}
                        />
                        <div
                          style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: `${tab.color}14`,
                            color: tab.color,
                            boxShadow: `inset 0 0 0 2px ${tab.color}30`,
                            flexShrink: 0,
                            marginLeft: '4px',
                          }}
                        >
                          <Icon size={22} strokeWidth={2.5} />
                        </div>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '1.06rem', fontWeight: '400', color: isActive ? tab.color : '#0f172a', flex: 1 }}>
                          <span>{label}</span>
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  return (
    <div
        style={{
          position: 'relative',
          width: '100%',
          marginBottom: isMobile ? '-18px' : '-10px',
          paddingTop: isMobile ? '6px' : '0',
          zIndex: 5,
          pointerEvents: 'auto',
      }}
    >
      <div
        ref={railRef}
        className={isMobile ? 'hide-scrollbar' : undefined}
        style={{
          display: 'flex',
          gap: isMobile ? '8px' : '8px',
          width: '100%',
          overflowX: isMobile ? 'auto' : 'visible',
          overflowY: isMobile ? 'hidden' : 'visible',
          WebkitOverflowScrolling: 'touch',
          touchAction: isMobile ? 'pan-x' : 'auto',
          overscrollBehaviorX: 'contain',
          justifyContent: isMobile ? 'flex-start' : 'stretch',
          padding: isMobile ? '6px 0 6px 0' : '0 2px',
          alignItems: isMobile ? 'flex-end' : 'center',
          scrollSnapType: isMobile ? 'x proximity' : 'none',
        }}
      >
        {tabsToRender.map((tab) => {
          const isActive = activePage === tab.id;
          const Icon = tab.icon;
          const label = toUiLabelCase(labelsById?.[tab.id]?.label || tab.label);
          const mobileLabel = toUiLabelCase(labelsById?.[tab.id]?.mobileLabel || tab.mobileLabel || label);
          const iconSize = isMobile ? (tab.iconSizeMobile || 21) : 21;
          const desktopBasis = Math.max(96, Math.min(192, Math.round(label.length * 9.4) + 32));
          const mobileBasis = Math.max(112, Math.min(214, Math.round(mobileLabel.length * 9.1) + 42));
          return (
            <div
              key={`wrap-${tab.id}`}
              style={{
                display: 'flex',
                flex: isMobile ? '0 0 auto' : `1 1 ${desktopBasis}px`,
                minWidth: isMobile ? `${mobileBasis}px` : 0,
                maxWidth: isMobile ? 'none' : '200px',
              }}
            >
              <button
                className="sketchbook-border"
                key={tab.id}
                data-tab-id={tab.id}
                data-nav-tab="1"
                onClick={() => handleTabPress(tab.id)}
                aria-label={`${openTabPrefix} ${label} ${tabSuffix}`}
                aria-current={isActive ? 'page' : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: isMobile ? '7px' : '6px',
                  padding: isMobile ? '14px 14px 20px' : '10px 12px 14px',
                  background: isActive ? '#ffffff' : tab.color,
                  border: `3px solid ${DARK_OUTLINE}`,
                  borderBottom: isActive ? '7px solid #ffffff' : `7px solid ${DARK_OUTLINE}`,
                  cursor: 'pointer',
                  fontFamily: 'Sniglet, var(--font-main)',
                  fontSize: isMobile ? '0.94rem' : '0.76rem',
                  lineHeight: 1.15,
                  fontWeight: 'normal',
                  color: isActive ? tab.color : '#ffffff',
                  textShadow: isActive ? 'none' : '0 1px 0 rgba(15, 23, 42, 0.18)',
                  boxShadow: isActive
                    ? `inset 0 5px 0 ${tab.color}, 0 -3px 12px rgba(15,23,42,0.08), 0 0 18px ${tab.color}32`
                    : '0 8px 18px rgba(15,23,42,0.16)',
                  zIndex: isActive ? 30 : 5,
                  whiteSpace: 'nowrap',
                  width: '100%',
                  flex: '1 1 auto',
                  minHeight: isMobile ? '70px' : '52px',
                  minWidth: 0,
                  maxWidth: '100%',
                  scrollSnapAlign: isMobile ? 'start' : 'none',
                  overflow: 'hidden',
                  transform: `translateY(${isActive ? (isMobile ? -6 : -5) : 0}px)`,
                  transition: 'transform 0.14s ease-out, box-shadow 0.14s ease-out, background-color 0.14s ease-out, color 0.14s ease-out',
                }}
              >
                <span
                  style={{
                    width: isMobile ? 'auto' : '30px',
                    minWidth: isMobile ? 'auto' : '30px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={iconSize} strokeWidth={2.5} />
                </span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', display: 'inline-flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                  <span>{isMobile ? mobileLabel : label}</span>
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default memo(NavTabs);
