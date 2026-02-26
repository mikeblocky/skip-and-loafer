/* eslint-disable no-unused-vars */
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cake, X, PartyPopper, Gift, Sparkles, Heart } from 'lucide-react';

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
        "From the salt-aired hills of Ishikawa to the bustling pulse of Tokyo, the girl with the earnest heart finds her stride. Happy birthday, Mitsumi; may your spirit always keep flapping toward the light. 🌊",
        "Today we celebrate the girl who turns every stumble into a dance. Happy birthday, Iwakura Mitsumi—our future bureaucrat and our constant sun.",
        "It is March 3rd, the day the plum blossoms begin to wake. Happy birthday to Mitsumi, whose honesty is the heartbeat of our school. 🌸",
        "To the girl who gives her all until her cheeks are flushed and her heart is full: may your year be as bright as your dreams. Happy birthday, Mitsumi."
    ],
    Shima: [
        "Like a soft autumn breeze that asks for nothing in return, Sousuke moves through the world. Today, we celebrate the boy who is finally learning to stay. Happy birthday, Shima-kun. 🍃",
        "October 9th marks the birth of a boy with a gentle smile and a quiet depth. May you find the things that make your own heart beat faster this year.",
        "Happy birthday, Shima. May you shed the weight of expectations and find the joy in the simple, unscripted moments of life. 🌟",
        "To the boy who brings the golden hour with him wherever he goes: may your day be as effortless and kind as you are."
    ],
    Makoto: [
        "Between the quiet rustle of pages and the soft courage of a new friendship, Makoto has found her voice. Happy birthday to our most thoughtful soul. 📖",
        "It's April 17th, a day for the girl who observes the world with kindness and steady eyes. Happy birthday, Makoto; your strength is in your steadiness.",
        "To Kurume Makoto, who stepped out of the shadows and into a circle of friends: may your year be filled with stories worth sharing. ✨",
        "Happy birthday, Makoto. You are the quiet bridge that connects us all, more brave and more loved than you know."
    ],
    Yuzu: [
        "Behind the striking silhouette and the fashionable grace lies a heart of pure, protective gold. Happy birthday, Yuzuki. 🌿",
        "December 11th belongs to the girl who stands tall and sees the truth in others. Happy birthday, Yuzu; stay as grounded and as beautiful as you are.",
        "To the girl who is a sanctuary for her friends: may you receive all the warmth you so freely give. Happy birthday, Murashige Yuzuki. ✨",
        "Happy birthday, Yuzu. You walk through the world with style, but it's your loyalty that leaves the lasting impression."
    ],
    Mika: [
        "A summer's day for the girl who works harder than the sun to shine. Happy birthday, Mika; your growth is a melody we all love to hear. ☀️",
        "July 29th is for Mika, the girl who learned that being herself is more than enough. May your year be as rewarding as your efforts.",
        "Happy birthday, Mika-chan. From the sharp edges of competition to the soft landing of true friendship, you have traveled so far. 🎀",
        "To the most relatable heart in Tokyo: may your birthday be a reflection of the beautiful, honest person you've become."
    ],
    Yamada: [
        "The rhythm of a bouncing ball and the echo of a loud laugh—August 6th is for the boy who keeps our energy high. Happy birthday, Yamada! 🏀",
        "To the life of the classroom and the king of the court: may your energy never fade and your appetite always be satisfied. Happy birthday, Yamada.",
        "Happy birthday to the boy who wears his heart on his sleeve and his enthusiasm like a badge of honor. Keep making some noise! 📣",
        "Yamada, you are the bright spark in every school day. May your birthday be a championship win for the books."
    ],
    Mukai: [
        "The steady hum of a summer afternoon and a cool drink in hand—today we celebrate the calm in the center of the storm. Happy birthday, Mukai. 🥤",
        "May 19th be a day of leisure for the boy who notices the small things and keeps his friends close. Happy birthday, Mukai Tsukasa.",
        "To the boy who listens more than he speaks: your quiet kindness is the glue that holds the group together. Happy birthday. 🍃",
        "Happy birthday, Mukai. May your year be as chill as your vibes and as meaningful as your observations."
    ],
    Takamine: [
        "The click of heels on a direct path to success—today our president takes a well-earned breath. Happy birthday, Takamine-san. 👠",
        "June 30th is for the girl who masters every minute. May you find the beauty in the unplanned detours this year, Tokiko.",
        "Happy birthday to the girl who leads with iron will and a hidden, soft heart. Your discipline inspires us all. 🏔️",
        "To Takamine-senpai: may your schedule today be cleared for nothing but joy and the fragrance of blooming flowers."
    ],
    Kazakami: [
        "Like the scent of spring rain on a quiet street, Kazakami-kun brings a gentle peace to every room. Happy birthday. 🌧️",
        "April 24th belongs to the boy with the soft voice and the kindest eyes in the class. Happy birthday, Kazakami.",
        "To the boy who finds the wonder in the background: may your own light shine a little brighter this year. ✨",
        "Happy birthday, Kazakami. You are the soft melody in the soundtrack of our school days."
    ],
    Kanechika: [
        "Curtain up and lights bright for the boy who dreams in cinematic sweeps! Happy birthday, Kanechika-senpai. 🎭",
        "February 1st marks the birth of a director whose passion is the greatest show on earth. Keep chasing that vision, Taichi!",
        "Happy birthday to the boy who refuses to live a boring life. May your year be a masterpiece of your own making. 🎬",
        "To Kanechika: the stage is yours today. May your birthday be filled with the applause you deserve."
    ],
    Chris: [
        "A voice that cuts through the fog of a polite smile with the clarity of a bell. Happy birthday, Chris. �",
        "August 24th is for the friend who knows that honesty is the highest form of love. Happy birthday, Christopher Walard.",
        "To the boy who sees Shima for who he truly is: thank you for being the anchor in the drifting wind. Happy birthday. ⚓",
        "Happy birthday, Chris. May your straightforward heart find all the sincerity it looks for in the world."
    ],
    Ririka: [
        "Draped in the elegance of an autumn evening, Ririka navigates a world that watches her every move. May you find peace today. �",
        "October 30th is for the girl with the fragile grace and the hidden scars. Happy birthday, Ririka; you are more than your reflection.",
        "Happy birthday, Ririka. May the shadows of the past soften into the light of a kinder, gentler future. ✨",
        "To a girl of complex beauty and deep longing: may this year bring you a happiness that is entirely your own."
    ],
};

const DISMISS_KEY = 'skip_birthday_dismissed';

const BirthdayNotification = ({ isMobile }) => {
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
                    new Notification(`🎂 Happy birthday, ${char.name}!`, {
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
                    initial={{ opacity: 0, y: -40, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -30, scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25, delay: i * 0.15 }}
                    style={{
                        position: 'fixed',
                        top: isMobile ? `${12 + i * 110}px` : `${16 + i * 90}px`,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 10001,
                        width: isMobile ? 'calc(100vw - 24px)' : 'auto',
                        maxWidth: '480px',
                        minWidth: isMobile ? 'auto' : '380px',
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
                                    fontSize: isMobile ? '0.82rem' : '0.88rem',
                                    fontWeight: 'bold',
                                    color: char.color,
                                    letterSpacing: '0.02em',
                                }}>
                                    🎂 Birthday Alert!
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
                                {char.fullName} • {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][char.month - 1]} {char.day}
                            </span>
                        </div>

                        {/* Dismiss */}
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={handleDismiss}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#9ca3af',
                                padding: '4px',
                                flexShrink: 0,
                                marginTop: '-2px',
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
