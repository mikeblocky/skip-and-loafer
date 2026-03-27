/* eslint-disable no-unused-vars */
import { memo, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Home, BookOpen, BarChart3, Cake, Image as ImageIcon, FileText, Trophy, Package } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

const TABS = [
    { id: 'home', label: 'Home', icon: Home, color: 'var(--pop-pink)' },
    { id: 'chapters', label: 'Chapters', icon: BookOpen, color: 'var(--pop-blue)' },
    { id: 'gallery', label: 'Gallery', mobileLabel: 'Arts', icon: ImageIcon, color: '#8b5cf6' },
    { id: 'blog', label: 'Blog', mobileLabel: 'Blog', icon: FileText, color: '#f97316' },
    { id: 'sync', label: 'Progress & Sync', mobileLabel: 'Sync', icon: BarChart3, color: 'var(--pop-green)' },
    { id: 'quiz', label: 'Quiz', mobileLabel: 'Quiz', icon: Trophy, color: '#ef4444' },
    { id: 'birthdays', label: 'Birthdays', mobileLabel: 'B-days', icon: Cake, color: '#f59e0b' },
    { id: 'mystery', label: 'Mystery', mobileLabel: 'Mystery', icon: Package, color: '#ec4899' },
];

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
            marginBottom: '-16px',
            paddingTop: isMobile ? '18px' : '0',
            zIndex: 5,
            pointerEvents: 'auto'
        }}>
            <div
                ref={railRef}
                className={isMobile ? 'hide-scrollbar' : undefined}
                style={{
                    display: 'flex',
                    gap: '4px',
                    width: '100%',
                    overflowX: isMobile ? 'auto' : 'visible',
                    overflowY: isMobile ? 'hidden' : 'visible',
                    WebkitOverflowScrolling: 'touch',
                    touchAction: isMobile ? 'pan-x' : 'auto',
                    overscrollBehaviorX: 'contain',
                    justifyContent: isMobile ? 'flex-start' : 'stretch',
                    padding: isMobile ? '8px 16px 4px 16px' : '0',
                    alignItems: isMobile ? 'flex-end' : 'center',
                    scrollSnapType: isMobile ? 'x proximity' : 'none',
                }}
            >
                {TABS.map((tab, idx) => {
                    const isActive = activePage === tab.id;
                    const Icon = tab.icon;
                    const label = labelsById?.[tab.id]?.label || tab.label;
                    // Stable random tilt for sticky note effect
                    // eslint-disable-next-line react-hooks/purity
                    const initialTilt = isActive ? 0 : (Math.random() * 6) - 3;

                    return (
                        <motion.div
                            key={`wrap-${tab.id}`}
                            initial={{ y: -60, x: (Math.random() - 0.5) * 40, opacity: 0, rotate: (Math.random() - 0.5) * 30 }}
                            animate={{ y: 0, x: 0, opacity: 1, rotate: initialTilt }}
                            transition={{ type: 'spring', stiffness: 220, damping: 16, delay: 0.3 + idx * 0.07 }}
                            style={{ display: 'flex', flex: isMobile ? '0 0 auto' : '1 1 0', minWidth: isMobile ? 'auto' : 0 }}
                        >
                            <motion.button
                                className="sketchbook-border paper-interact"
                                key={tab.id}
                                data-tab-id={tab.id}
                                onClick={() => handleTabPress(tab.id)}
                                aria-label={`${openTabPrefix} ${label} ${tabSuffix}`}
                                aria-current={isActive ? 'page' : undefined}
                                animate={{
                                    y: isActive ? (isMobile ? -6 : -10) : 0,
                                }}
                                whileHover={{
                                    y: isActive ? (isMobile ? -8 : -12) : -3,
                                    transition: { type: 'spring', stiffness: 400, damping: 25 },
                                }}
                                whileTap={{
                                    y: isActive ? (isMobile ? -5 : -8) : 2,
                                }}
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: isMobile ? '3px' : '5px',
                                    padding: isMobile ? '8px 10px 16px' : '10px 16px 20px',
                                    background: isActive ? 'white' : tab.color,
                                    border: `2px solid ${isActive ? tab.color : 'transparent'}`,
                                    borderBottom: isActive ? '2px solid white' : `2px solid ${tab.color}`,
                                    cursor: 'pointer',
                                    fontFamily: 'Sniglet, var(--font-main)',
                                    fontSize: isMobile ? '0.7rem' : '0.85rem',
                                    lineHeight: 1.2,
                                    fontWeight: 'normal',
                                    color: isActive ? tab.color : 'white',
                                    boxShadow: isActive
                                        ? `inset 0 3px 0 ${tab.color}, 0 -2px 10px rgba(0,0,0,0.08), 0 0 16px ${tab.color}35`
                                        : '0 2px 4px rgba(0,0,0,0.06)',
                                    zIndex: isActive ? 30 : 5,
                                    whiteSpace: 'nowrap',
                                    flex: '1 1 100%',
                                    scrollSnapAlign: isMobile ? 'start' : 'none',
                                    overflow: 'hidden',
                                }}
                            >
                                <Icon size={isMobile ? 12 : 14} />
                                {isMobile && tab.mobileLabel ? tab.mobileLabel : label}
                            </motion.button>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export default memo(NavTabs);
