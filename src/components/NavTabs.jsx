import { motion } from 'framer-motion';
import { Home, BookOpen } from 'lucide-react';

const TABS = [
    { id: 'home', label: 'Home', icon: Home, color: 'var(--pop-pink)' },
    { id: 'chapters', label: 'Chapters', icon: BookOpen, color: 'var(--pop-blue)' },
];

const NavTabs = ({ activePage, onPageChange, isMobile }) => {
    return (
        <div style={{
            position: 'absolute',
            top: isMobile ? '-38px' : '-36px',
            left: isMobile ? '8px' : '16px',
            display: 'flex',
            gap: '4px',
            zIndex: 40
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
                            gap: '5px',
                            padding: isMobile ? '8px 14px' : '8px 14px',
                            background: isActive ? 'white' : '#f3f4f6',
                            border: `2px solid ${isActive ? tab.color : '#e5e7eb'}`,
                            borderBottom: isActive ? '2px solid white' : `2px solid ${isActive ? tab.color : '#e5e7eb'}`,
                            borderRadius: '8px 8px 0 0',
                            cursor: 'pointer',
                            fontFamily: 'var(--font-hand)',
                            fontSize: isMobile ? '0.85rem' : '0.85rem',
                            fontWeight: 'bold',
                            color: isActive ? tab.color : '#9ca3af',
                            position: 'relative',
                            bottom: '-2px',
                            transition: 'color 0.2s, border-color 0.2s, background 0.2s',
                            boxShadow: isActive ? '0 -2px 6px rgba(0,0,0,0.06)' : 'none'
                        }}
                    >
                        <Icon size={isMobile ? 14 : 14} />
                        {tab.label}
                    </motion.button>
                );
            })}
        </div>
    );
};

export default NavTabs;
