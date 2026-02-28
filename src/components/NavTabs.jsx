/* eslint-disable no-unused-vars */
import { memo, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Home, BookOpen, BarChart3, Cake, Image as ImageIcon, FileText } from 'lucide-react';

const TABS = [
    { id: 'home', label: 'Home', icon: Home, color: 'var(--pop-pink)' },
    { id: 'chapters', label: 'Chapters', icon: BookOpen, color: 'var(--pop-blue)' },
    { id: 'gallery', label: 'Gallery', mobileLabel: 'Arts', icon: ImageIcon, color: '#8b5cf6' },
    { id: 'blog', label: 'Blog', mobileLabel: 'Blog', icon: FileText, color: '#f97316' },
    { id: 'sync', label: 'Progress & Sync', mobileLabel: 'Sync', icon: BarChart3, color: 'var(--pop-green)' },
    { id: 'birthdays', label: 'Birthdays', mobileLabel: 'B-days', icon: Cake, color: '#f59e0b' },
];

const NavTabs = ({ activePage, onPageChange, isMobile, labelsById, openTabPrefix = 'Open', tabSuffix = 'tab' }) => {
    const railRef = useRef(null);

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
            marginBottom: 0,
            zIndex: 25,
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
                    overflowY: 'visible',
                    WebkitOverflowScrolling: 'touch',
                    touchAction: isMobile ? 'pan-x' : 'auto',
                    overscrollBehaviorX: 'contain',
                    justifyContent: isMobile ? 'flex-start' : 'stretch',
                    padding: isMobile ? '0 2px' : '0',
                    alignItems: 'center',
                    scrollSnapType: isMobile ? 'x proximity' : 'none',
                }}
            >
                {TABS.map((tab) => {
                    const isActive = activePage === tab.id;
                    const Icon = tab.icon;
                    const label = labelsById?.[tab.id]?.label || tab.label;
                    const mobileLabel = labelsById?.[tab.id]?.mobileLabel || tab.mobileLabel;

                    return (
                        <motion.button
                            key={tab.id}
                            data-tab-id={tab.id}
                            onClick={() => onPageChange(tab.id)}
                            aria-label={`${openTabPrefix} ${label} ${tabSuffix}`}
                            aria-current={isActive ? 'page' : undefined}
                            whileHover={{
                                scale: 1.02,
                                boxShadow: `inset 0 3px 0 ${tab.color}, 0 0 0 1px rgba(0,0,0,0.02), 0 -2px 8px rgba(0,0,0,0.08)`,
                            }}
                            whileTap={{ scale: 0.97 }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: isMobile ? '3px' : '5px',
                                padding: isMobile ? '7px 9px' : '8px 14px',
                                background: isActive ? 'white' : '#f3f4f6',
                                border: `2px solid ${isActive ? tab.color : '#e5e7eb'}`,
                                borderBottom: isActive ? '2px solid white' : `2px solid ${isActive ? tab.color : '#e5e7eb'}`,
                                borderRadius: '8px 8px 0 0',
                                cursor: 'pointer',
                                fontFamily: 'Sniglet, var(--font-main)',
                                fontSize: isMobile ? '0.7rem' : '0.85rem',
                                lineHeight: 1.2,
                                fontWeight: 'normal',
                                color: isActive ? tab.color : '#9ca3af',
                                transition: 'color 0.2s, border-color 0.2s, background 0.2s, box-shadow 0.2s',
                                boxShadow: isActive
                                    ? `inset 0 3px 0 ${tab.color}, 0 0 0 1px rgba(0,0,0,0.02), 0 -2px 6px rgba(0,0,0,0.06)`
                                    : '0 1px 3px rgba(0,0,0,0.04)',
                                zIndex: isActive ? 20 : 5,
                                whiteSpace: 'nowrap',
                                flex: isMobile ? '0 0 auto' : '1 1 0',
                                minWidth: isMobile ? 'auto' : 0,
                                minHeight: isMobile ? '34px' : '38px',
                                scrollSnapAlign: isMobile ? 'start' : 'none',
                                overflow: 'hidden',
                            }}
                        >
                            <Icon size={isMobile ? 12 : 14} />
                            {isMobile && mobileLabel ? mobileLabel : label}
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
};

export default memo(NavTabs);
