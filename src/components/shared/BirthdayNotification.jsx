/* eslint-disable no-unused-vars */
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cake, X, PartyPopper, Gift, Sparkles, Heart } from 'lucide-react';
import { getCharacterDisplayName } from '../../data/characterNames';

/* ─── Birthday data ─── */
const CHARACTER_BIRTHDAYS = [
    { name: 'Mitsumi', fullName: 'Iwakura Mitsumi', month: 3, day: 3, color: '#e67e5f', bg: '#fff2ed', emoji: '�' },
    { name: 'Shima', fullName: 'Shima Sousuke', month: 10, day: 9, color: '#eab308', bg: '#fefce8', emoji: '�' },
    { name: 'Makoto', fullName: 'Kurume Makoto', month: 4, day: 17, color: '#7c3aed', bg: '#f5f3ff', emoji: '📖' },
    { name: 'Yuzu', fullName: 'Murashige Yuzuki', month: 12, day: 11, color: '#14b8a6', bg: '#f0fdfa', emoji: '🌿' },
    { name: 'Mika', fullName: 'Egashira Mika', month: 7, day: 29, color: '#f43f5e', bg: '#fff1f2', emoji: '🎀' },
    { name: 'Yamada', fullName: 'Yamada Kentaro', month: 8, day: 6, color: '#f97316', bg: '#fff7ed', emoji: '🏀' },
    { name: 'Mukai', fullName: 'Mukai Tsukasa', month: 5, day: 19, color: '#64748b', bg: '#f1f5f9', emoji: '🥤' },
    { name: 'Takamine', fullName: 'Takamine Tokiko', month: 6, day: 30, color: '#b91c1c', bg: '#fef2f2', emoji: '�' },
    { name: 'Kazakami', fullName: 'Kazakami Hiroto', month: 4, day: 24, color: '#fb923c', bg: '#fffaf5', emoji: '✨' },
    { name: 'Kanechika', fullName: 'Kanechika Narumi', month: 2, day: 1, color: '#4338ca', bg: '#eef2ff', emoji: '�' },
    { name: 'Chris', fullName: 'Fukunaga Chris', month: 8, day: 24, color: '#0ea5e9', bg: '#f0f9ff', emoji: '⚓' },
    { name: 'Ririka', fullName: 'Saijou Ririka', month: 10, day: 30, color: '#881337', bg: '#fff1f2', emoji: '✨' },
];

/* ─── Announcement variations per character ─── */
const ANNOUNCEMENTS = {
    Mitsumi: [
        "Happy birthday, Mitsumi! From Ishikawa all the way to Tokyo, you've put in real effort every step of the way. Hope this year keeps going your direction.",
        "Happy birthday, Iwakura Mitsumi. You give everything you have and do it sincerely. That counts for a lot.",
        "March 3rd — happy birthday, Mitsumi. Your honesty makes the people around you better. Have a great one.",
        "Happy birthday, Mitsumi. You work hard and you mean it. May this year match the effort you put in."
    ],
    Shima: [
        "Happy birthday, Shima. You're easy to be around and people feel it. Hope today is a good, easy day for you.",
        "October 9th — happy birthday to Shima. Quiet, thoughtful, and always a step ahead. May this year bring something worth staying for.",
        "Happy birthday, Shima. You carry a lot quietly. Hope this birthday gives you a moment that's just for you.",
        "Happy birthday, Sousuke. You make the people around you feel comfortable without trying too hard. That's a real thing."
    ],
    Makoto: [
        "Happy birthday, Makoto. You notice more than you let on, and you show up for people in the right moments. Hope this year treats you well.",
        "April 17th — happy birthday, Kurume Makoto. Steady, thoughtful, and honest. You're someone people are glad to know.",
        "Happy birthday, Makoto. You stepped into a new place and made it work. That took more than it looked like. Have a good one.",
        "Happy birthday, Makoto. More people are glad you're here than you probably realize."
    ],
    Yuzu: [
        "Happy birthday, Yuzuki. You look after people without making a big deal of it. That matters more than most things. Hope today is good.",
        "December 11th — happy birthday, Yuzu. You see people clearly and stay loyal. That's rare. Have a great birthday.",
        "Happy birthday, Murashige Yuzuki. You give people a steady place to land. Hope this year gives you the same.",
        "Happy birthday, Yuzu. You carry yourself with confidence, but it's how you look out for others that really stands out."
    ],
    Mika: [
        "Happy birthday, Mika. You hold yourself to a high standard and you put in the work. Hope this year reflects that effort.",
        "July 29th — happy birthday, Egashira Mika. You've grown a lot and you've done it on your own terms. That deserves a proper celebration.",
        "Happy birthday, Mika. You've come a long way and the direction is good. Have a birthday that matches how far you've come.",
        "Happy birthday, Mika. You're more honest with yourself than most people are. That's worth something."
    ],
    Yamada: [
        "Happy birthday, Yamada! You make every room a little louder and a lot more fun. Hope this birthday delivers on that energy.",
        "August 6th — happy birthday, Yamada. You keep things moving and you bring people along with you. Have a great one.",
        "Happy birthday, Yamada. You don't overthink it and people appreciate that more than you know. Enjoy the day.",
        "Happy birthday, Yamada. You're a good person to have around. Hope today is exactly your kind of day."
    ],
    Mukai: [
        "Happy birthday, Mukai. You pay attention to things other people miss and you don't make a big deal out of it. That's a good quality. Have a calm, good day.",
        "May 19th — happy birthday, Mukai Tsukasa. You're steady and reliable, and people count on that more than they say.",
        "Happy birthday, Mukai. You listen well and say what you mean. Hope today is easy and enjoyable.",
        "Happy birthday, Mukai. You hold the group together in a quiet way. Hope your year is as solid as you are."
    ],
    Takamine: [
        "Happy birthday, Takamine. You run things well and you take it seriously. Hope today is one where you get to step back and enjoy the results.",
        "June 30th — happy birthday, Tokiko. You set the bar high and you clear it. May this year give you something worth organizing.",
        "Happy birthday, Takamine-san. You lead with purpose and you follow through. That combination is harder than it looks.",
        "Happy birthday, Takamine. You've earned a day off. Hope you actually take it."
    ],
    Kazakami: [
        "Happy birthday, Kazakami. You make the people around you feel less tense without even trying. That's a good thing to be. Have a quiet, good day.",
        "April 24th — happy birthday, Kazakami. You pay attention to what's going on in the background and that keeps things from going sideways.",
        "Happy birthday, Kazakami. You're easy to be around and that makes a real difference. Hope this year is as steady as you are.",
        "Happy birthday, Hiroto. You don't need the spotlight to make an impression. Hope today is genuinely good for you."
    ],
    Kanechika: [
        "Happy birthday, Kanechika! You go all in on what you care about and people can feel that. Hope this birthday matches your energy.",
        "February 1st — happy birthday, Taichi. You have a vision and you pursue it seriously. Keep going.",
        "Happy birthday, Kanechika. You make things happen when you commit. May this year give you something worth that commitment.",
        "Happy birthday, Kanechika. The stage is yours today. Have a birthday as bold as everything you do."
    ],
    Chris: [
        "Happy birthday, Chris. You say what you mean and you mean what you say. That's something people can rely on. Have a good one.",
        "August 24th — happy birthday, Christopher Walard. You're honest with the people you care about and that takes some courage.",
        "Happy birthday, Chris. You see people clearly and you're willing to say so. That's a good thing to be. Hope today is a great one.",
        "Happy birthday, Chris. You're direct and you're kind and you make both of those work together. Hope this year is a good one."
    ],
    Ririka: [
        "Happy birthday, Ririka. You navigate a lot with more composure than most people could manage. Hope today brings something that's just for you.",
        "October 30th — happy birthday, Ririka. You're more than what people see on the surface. Hope this birthday reflects who you actually are.",
        "Happy birthday, Ririka. You've dealt with a lot and you're still here. That counts for something. Have a good birthday.",
        "Happy birthday, Ririka. This year, may things get a little easier and a little more yours."
    ],
};

const DISMISS_KEY = 'skip_birthday_dismissed';

const BirthdayNotification = ({ isMobile, uiLanguage = 'en' }) => {
    const [dismissed, setDismissed] = useState(false);

    // Find today's birthday character(s)
    const todaysBirthdays = useMemo(() => {
        const now = new Date();
        const month = now.getMonth() + 1;
        const day = now.getDate();
        return CHARACTER_BIRTHDAYS.filter(c => c.month === month && c.day === day);
    }, []);

    // Pick a random announcement (stable per session via useMemo)
    const announcements = useMemo(() => {
        return todaysBirthdays.map(char => {
            const options = ANNOUNCEMENTS[char.name] || [`Happy Birthday, ${char.name}!`];
            const idx = Math.floor(Math.random() * options.length);
            return { ...char, message: options[idx] };
        });
    }, [todaysBirthdays]);

    // Check if already dismissed today
    useEffect(() => {
        try {
            const raw = localStorage.getItem(DISMISS_KEY);
            if (raw) {
                const data = JSON.parse(raw);
                const now = new Date();
                const key = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
                if (data.date === key) setDismissed(true);
            }
        } catch { /* ignore */ }
    }, []);

    // Browser push notification (once per day per birthday)
    useEffect(() => {
        if (announcements.length === 0) return;
        if (!('Notification' in window)) return;

        const now = new Date();
        const todayKey = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
        const NOTIF_KEY = 'skip_birthday_notified';

        try {
            const sent = JSON.parse(localStorage.getItem(NOTIF_KEY) || '{}');
            if (sent.date === todayKey) return; // already sent today

            const sendNotifications = () => {
                announcements.forEach(char => {
                    const displayName = getCharacterDisplayName(char.name, uiLanguage);
                    new Notification(`Happy birthday, ${displayName}!`, {
                        body: char.message,
                        icon: '/swt2-512.png',
                        badge: '/swt2-512.png',
                        tag: `birthday-${char.name}-${todayKey}`,
                    });
                });
                localStorage.setItem(NOTIF_KEY, JSON.stringify({ date: todayKey }));
            };

            if (Notification.permission === 'granted') {
                sendNotifications();
            } else if (Notification.permission !== 'denied') {
                Notification.requestPermission().then(perm => {
                    if (perm === 'granted') sendNotifications();
                });
            }
        } catch { /* ignore */ }
    }, [announcements]);

    const handleDismiss = () => {
        setDismissed(true);
        const now = new Date();
        const key = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
        localStorage.setItem(DISMISS_KEY, JSON.stringify({ date: key }));
    };

    if (todaysBirthdays.length === 0 || dismissed) return null;

    return (
        <AnimatePresence>
            {announcements.map((char, i) => (
                <motion.div
                    key={char.name}
                    initial={{ opacity: 0, y: -40, scale: 0.95, x: '-50%' }}
                    animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
                    exit={{ opacity: 0, y: -30, scale: 0.95, x: '-50%' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25, delay: i * 0.15 }}
                    style={{
                        position: 'fixed',
                        top: isMobile ? `calc(env(safe-area-inset-top, 0px) + ${8 + i * 74}px)` : `${16 + i * 90}px`,
                        left: '50%',
                        zIndex: 10001,
                        width: isMobile ? 'calc(100vw - 16px)' : 'auto',
                        maxWidth: isMobile ? 'calc(100vw - 16px)' : '480px',
                        minWidth: isMobile ? 'auto' : '380px',
                        pointerEvents: 'auto',
                    }}
                >
                    <div style={{
                        background: char.bg,
                        border: `2px solid ${char.color}`,
                        borderRadius: '16px',
                        padding: isMobile ? '14px 14px 14px 16px' : '16px 18px 16px 20px',
                        boxShadow: `0 8px 32px ${char.color}30, 0 4px 12px rgba(0,0,0,0.08)`,
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        position: 'relative',
                        overflow: 'hidden',
                        maxHeight: isMobile ? 'calc(100vh - env(safe-area-inset-top, 0px) - 16px)' : 'none',
                        pointerEvents: 'auto',
                    }}>
                        {/* Confetti background particles */}
                        {[...Array(6)].map((_, j) => (
                            <motion.div
                                key={j}
                                animate={{
                                    y: [0, -20, 0],
                                    opacity: [0.3, 0.7, 0.3],
                                    rotate: [0, 180, 360],
                                }}
                                transition={{
                                    duration: 2 + j * 0.3,
                                    repeat: Infinity,
                                    delay: j * 0.4,
                                }}
                                style={{
                                    position: 'absolute',
                                    right: `${10 + j * 14}%`,
                                    top: `${20 + (j % 3) * 25}%`,
                                    color: char.color,
                                    opacity: 0.2,
                                    fontSize: '14px',
                                    pointerEvents: 'none',
                                }}
                            >
                                {['🎂', '🎉', '🎈', '🎁', '⭐', '🎊'][j]}
                            </motion.div>
                        ))}

                        {/* Cake icon */}
                        <motion.div
                            animate={{ rotate: [0, -8, 8, -4, 4, 0], scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                            style={{
                                background: `${char.color}20`,
                                borderRadius: '12px',
                                padding: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                            }}
                        >
                            <Cake size={isMobile ? 24 : 28} style={{ color: char.color }} />
                        </motion.div>

                        {/* Content */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                marginBottom: '4px',
                            }}>
                                <span style={{
                                    fontFamily: 'var(--font-hand)',
                                    fontSize: isMobile ? '0.76rem' : '0.84rem',
                                    fontWeight: 'bold',
                                    color: char.color,
                                    opacity: 0.9,
                                }}>
                                    {getCharacterDisplayName(char.name, uiLanguage)}
                                </span>
                                <span style={{
                                    fontFamily: 'var(--font-hand)',
                                    fontSize: isMobile ? '0.82rem' : '0.88rem',
                                    fontWeight: 'bold',
                                    color: char.color,
                                    letterSpacing: '0.02em',
                                }}>
                                    Birthday
                                </span>
                                <motion.span
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                    style={{ fontSize: '1rem' }}
                                >
                                    {char.emoji}
                                </motion.span>
                            </div>
                            <p style={{
                                fontFamily: 'var(--font-hand)',
                                fontSize: isMobile ? '0.78rem' : '0.82rem',
                                color: '#374151',
                                margin: 0,
                                lineHeight: 1.4,
                            }}>
                                {char.message}
                            </p>
                            <span style={{
                                fontFamily: 'var(--font-hand)',
                                fontSize: '0.68rem',
                                color: '#9ca3af',
                                marginTop: '4px',
                                display: 'block',
                            }}>
                                {getCharacterDisplayName(char.name, uiLanguage)} • {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][char.month - 1]} {char.day}
                            </span>
                        </div>

                        {/* Dismiss */}
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={handleDismiss}
                            aria-label="Dismiss birthday notification"
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#9ca3af',
                                padding: isMobile ? '8px' : '4px',
                                flexShrink: 0,
                                marginTop: '-2px',
                                minWidth: isMobile ? '36px' : '24px',
                                minHeight: isMobile ? '36px' : '24px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 2,
                            }}
                        >
                            <X size={16} />
                        </motion.button>
                    </div>
                </motion.div>
            ))}
        </AnimatePresence>
    );
};

export default BirthdayNotification;
