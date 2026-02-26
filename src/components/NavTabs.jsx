/* eslint-disable no-unused-vars */
import { motion } from 'framer-motion';
import { Home, BookOpen, BarChart3, Cake } from 'lucide-react';

const TABS = [
    { id: 'home', label: 'Home', icon: Home, color: 'var(--pop-pink)' },
    { id: 'chapters', label: 'Chapters', icon: BookOpen, color: 'var(--pop-blue)' },
    { id: 'sync', label: 'Progress & Sync', mobileLabel: 'Sync', icon: BarChart3, color: 'var(--pop-green)' },
    { id: 'birthdays', label: 'Birthdays', mobileLabel: 'B-days', icon: Cake, color: '#f59e0b' },
];

const NavTabs = ({ activePage, onPageChange, isMobile }) => {
    return (
        <div style={{
            position: 'absolute',
            top: isMobile ? '-34px' : '-35px',
            left: isMobile ? '8px' : '16px',
            display: 'flex',
            gap: '4px',
            zIndex: 'auto',
            pointerEvents: 'auto'
        }}>
            {TABS.map((tab) => {
                const isActive = activePage === tab.id;
                const Icon = tab.icon;

                return (
                    <motion.button
                        key={tab.id}
                        onClick={() => onPageChange(tab.id)}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: isMobile ? '3px' : '5px',
                            padding: isMobile ? '7px 9px' : '8px 14px',
                            background: isActive ? 'white' : '#f3f4f6',
                            border: `2px solid ${isActive ? tab.color : '#e5e7eb'}`,
                            borderBottom: isActive ? '2px solid white' : `2px solid ${isActive ? tab.color : '#e5e7eb'}`,
                            borderRadius: '8px 8px 0 0',
                            cursor: 'pointer',
                            fontFamily: 'var(--font-hand)',
                            fontSize: isMobile ? '0.7rem' : '0.85rem',
                            fontWeight: 'bold',
                            color: isActive ? tab.color : '#9ca3af',
                            position: 'relative',
                            bottom: '-2px',
                            transition: 'color 0.2s, border-color 0.2s, background 0.2s',
                            boxShadow: isActive ? '0 -2px 6px rgba(0,0,0,0.06)' : 'none',
                            zIndex: isActive ? 20 : 5,
                            whiteSpace: 'nowrap',
                        }}
                    >
                        <Icon size={isMobile ? 12 : 14} />
                        {isMobile && tab.mobileLabel ? tab.mobileLabel : tab.label}
                    </motion.button>
                );
            })}
        </div>
    );
};

export default NavTabs;
