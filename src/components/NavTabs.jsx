/* eslint-disable no-unused-vars */
import { memo, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Home, BookOpen, BarChart3, Cake, Image as ImageIcon, FileText, Trophy, Package } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';
import { toUiLabelCase } from '../utils/textCase';

const TABS = [
    { id: 'home', label: 'Home', icon: Home, color: 'var(--pop-pink)' },
    { id: 'chapters', label: 'Chapters', icon: BookOpen, color: 'var(--pop-blue)' },
    { id: 'gallery', label: 'Gallery', mobileLabel: 'Arts', icon: ImageIcon, color: '#8b5cf6' },
    { id: 'blog', label: 'Blog', mobileLabel: 'Blog', icon: FileText, color: '#f97316' },
    { id: 'sync', label: 'Reading', mobileLabel: 'Reading', icon: BarChart3, color: 'var(--pop-green)' },
    { id: 'quiz', label: 'Quiz', mobileLabel: 'Quiz', icon: Trophy, color: '#ef4444' },
    { id: 'birthdays', label: 'Birthdays', mobileLabel: 'Birthdays', icon: Cake, color: '#f59e0b' },
    { id: 'mystery', label: 'Mystery', mobileLabel: 'Mystery', icon: Package, color: '#ec4899' },
];

const DARK_OUTLINE = '#0f172a';

const NavTabs = ({ activePage, onPageChange, isMobile, labelsById, openTabPrefix = 'Open', tabSuffix = 'tab' }) => {
    const railRef = useRef(null);

    const handleTabPress = useCallback((tabId) => {
        triggerHaptic('selection');
        onPageChange(tabId);
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

    return (
        <div style={{
            position: 'relative',
            width: '100%',
            marginBottom: isMobile ? '-18px' : '-20px',
            paddingTop: isMobile ? '18px' : '0',
            zIndex: 5,
            pointerEvents: 'auto'
        }}>
            <div
                ref={railRef}
                className={isMobile ? 'hide-scrollbar' : undefined}
                style={{
                    display: 'flex',
                    gap: isMobile ? '8px' : '10px',
                    width: '100%',
                    overflowX: isMobile ? 'auto' : 'visible',
                    overflowY: isMobile ? 'hidden' : 'visible',
                    WebkitOverflowScrolling: 'touch',
                    touchAction: isMobile ? 'pan-x' : 'auto',
                    overscrollBehaviorX: 'contain',
                    justifyContent: isMobile ? 'flex-start' : 'stretch',
                    padding: isMobile ? '10px 16px 6px 16px' : '0 4px',
                    alignItems: isMobile ? 'flex-end' : 'center',
                    scrollSnapType: isMobile ? 'x proximity' : 'none',
                }}
            >
                {TABS.map((tab, idx) => {
                    const isActive = activePage === tab.id;
                    const Icon = tab.icon;
                    const label = toUiLabelCase(labelsById?.[tab.id]?.label || tab.label);
                    const mobileLabel = toUiLabelCase(labelsById?.[tab.id]?.mobileLabel || tab.mobileLabel || label);
                    const initialTilt = isActive ? 0 : (Math.random() * 6) - 3;
                    const iconSize = isMobile ? 21 : 23;

                    return (
                        <motion.div
                            key={`wrap-${tab.id}`}
                            initial={{ y: -60, x: (Math.random() - 0.5) * 40, opacity: 0, rotate: (Math.random() - 0.5) * 30 }}
                            animate={{ y: 0, x: 0, opacity: 1, rotate: initialTilt }}
                            transition={{ type: 'spring', stiffness: 220, damping: 16, delay: 0.3 + idx * 0.07 }}
                            style={{
                                display: 'flex',
                                flex: isMobile ? '0 0 auto' : '1 1 0',
                                minWidth: isMobile ? '124px' : 0,
                            }}
                        >
                            <motion.button
                                className="sketchbook-border paper-interact"
                                key={tab.id}
                                data-tab-id={tab.id}
                                onClick={() => handleTabPress(tab.id)}
                                aria-label={`${openTabPrefix} ${label} ${tabSuffix}`}
                                aria-current={isActive ? 'page' : undefined}
                                animate={{ y: isActive ? (isMobile ? -8 : -12) : 0 }}
                                whileHover={{
                                    y: isActive ? (isMobile ? -10 : -14) : -4,
                                    transition: { type: 'spring', stiffness: 400, damping: 25 },
                                }}
                                whileTap={{ y: isActive ? (isMobile ? -6 : -10) : 2 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: isMobile ? '6px' : '8px',
                                    padding: isMobile ? '15px 18px 22px' : '17px 20px 26px',
                                    background: isActive ? '#ffffff' : tab.color,
                                    border: `3px solid ${DARK_OUTLINE}`,
                                    borderBottom: isActive ? '8px solid #ffffff' : `8px solid ${DARK_OUTLINE}`,
                                    cursor: 'pointer',
                                    fontFamily: 'Sniglet, var(--font-main)',
                                    fontSize: isMobile ? '1rem' : '1.08rem',
                                    lineHeight: 1.15,
                                    fontWeight: 'normal',
                                    color: isActive ? tab.color : '#ffffff',
                                    textShadow: isActive ? 'none' : '0 1px 0 rgba(15, 23, 42, 0.18)',
                                    boxShadow: isActive
                                        ? `inset 0 4px 0 ${tab.color}, 0 -3px 12px rgba(15,23,42,0.08), 0 0 18px ${tab.color}33`
                                        : '0 8px 18px rgba(15,23,42,0.16)',
                                    zIndex: isActive ? 30 : 5,
                                    whiteSpace: 'nowrap',
                                    flex: '1 1 100%',
                                    minHeight: isMobile ? '68px' : '74px',
                                    minWidth: isMobile ? '124px' : 'auto',
                                    scrollSnapAlign: isMobile ? 'start' : 'none',
                                    overflow: 'hidden',
                                }}
                            >
                                <Icon size={iconSize} strokeWidth={2.5} />
                                {isMobile ? mobileLabel : label}
                            </motion.button>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export default memo(NavTabs);
