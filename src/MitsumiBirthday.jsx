import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Heart, Star, Cake, Music, PartyPopper } from 'lucide-react';

/*
  REFINED 30-SECOND STORY TIMELINE:
  ─────────────────────────────────────────────────────
  DURATION: 30s
  
  ACT 1 — "The Lonely Walk" (0s - 6s)
    T=0.5s Mitsumi sneaky walks from bottom center.
    T=3.5s She reaches center stage and waits.
    T=4.0s She looks around (scaleX flips).
  
  ACT 2 — "The Tease" (6s - 12s)
    T=6.0s Banner drops halfway down, then pulls back up.
    T=8.0s Shima tiptoes in from the right, peek-a-boo, then hides.
    T=10.0s Mika tiptoes in from the left, shushes, then hides.
  
  ACT 3 — "The Ambush" (12s - 18s)
    T=12.0s Banner drops fully behind characters.
    T=13.0s Shima slides in fast from right.
    T=13.8s Shima presents the cake.
    T=14.0s Mika joins from the left.
    T=15.0s Mitsumi startle jump + spin "?!".
  
  ACT 4 — "Everyone Gathers" (18s - 25s)
    T=18.0s Yuzuki floats from bottom-left.
    T=20.5s Makoto stumbles from bottom-right.
    T=22.0s Everyone starts moving to the center and resizing.
    T=24.0s Everyone is clustered in the center at the same size.
  
  FINALE (25s+) — Confetti + Return Button.
  ─────────────────────────────────────────────────────
*/

const MitsumiBirthday = () => {
    const [windowSize, setWindowSize] = useState({
        width: typeof window !== 'undefined' ? window.innerWidth : 1200,
        height: typeof window !== 'undefined' ? window.innerHeight : 800
    });
    const isMobile = windowSize.width <= 768;

    useEffect(() => {
        const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Confetti particles — fixed natural fall
    const confetti = useMemo(() => {
        const colors = ['#f472b6', '#fbbf24', '#38bdf8', '#34d399', '#a78bfa', '#fb923c'];
        return Array.from({ length: isMobile ? 18 : 30 }).map((_, i) => ({
            id: i,
            Icon: i % 2 === 0 ? Heart : Star,
            color: colors[i % colors.length],
            size: 14 + (i % 5) * 3,
            leftPct: 3 + (i * 97 / (isMobile ? 17 : 29)),
            delay: 29 + (i % 8) * 0.6,
            duration: 3.5 + (i % 4) * 0.7
        }));
    }, [isMobile]);

    // Flower petals
    const petals = useMemo(() => {
        const colors = ['#fce7f3', '#fbcfe8', '#f9a8d4', '#fda4af', '#fef9c3'];
        return Array.from({ length: isMobile ? 14 : 22 }).map((_, i) => ({
            id: i,
            color: colors[i % colors.length],
            w: 16 + (i % 4) * 5,
            h: 10 + (i % 3) * 4,
            leftPct: 4 + (i * 92 / (isMobile ? 13 : 21)),
            delay: 16 + (i % 11) * 1.3,
            duration: 5.5 + (i % 5) * 0.9,
            driftX: (i % 2 === 0 ? 1 : -1) * (18 + (i % 4) * 12),
            startRot: (i % 6) * 30,
        }));
    }, [isMobile]);

    // Character sizes
    const mitsumiSize = isMobile ? 280 : 420;
    const friendSize = isMobile ? 160 : 240;
    const finalSize = isMobile ? 200 : 280;
    // Shima walk-in approach sizes (small far → full close)
    const shimaMed = Math.round(mitsumiSize * 0.55);
    const shimaFar = Math.round(mitsumiSize * 0.35);

    // Easing - Stop-motion paper cutout feel
    const paperStep = "steps(5, end)";
    const roughStep = "steps(3, end)";
    const veryRough = "steps(2, end)";

    // Shared line — 50% vertical center, slightly below midpoint to leave banner room
    const charLine = '52%';

    const DURATION = 40;
    const t = (sec) => sec / DURATION;

    return (
        <div style={{
            position: 'absolute', inset: 0,
            overflow: 'hidden', backgroundColor: 'var(--paper-white)',
            backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, var(--line-blue) 32px)',
            backgroundSize: '100% 32px',
            display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>

            {/* FLOWER PETALS — fall from T=12 */}
            {petals.map((p) => (
                <motion.div
                    key={`p-${p.id}`}
                    style={{
                        position: 'absolute',
                        left: `${p.leftPct}%`,
                        top: -p.h - 5,
                        zIndex: 190,
                        width: p.w,
                        height: p.h,
                        background: p.color,
                        borderRadius: '60% 40% 60% 40% / 60% 60% 40% 40%',
                        boxShadow: `inset 0 0 4px rgba(244,114,182,0.3)`,
                        pointerEvents: 'none'
                    }}
                    animate={{
                        y: [0, windowSize.height + 40],
                        x: [0, p.driftX, p.driftX * 0.3, p.driftX * 0.8, 0],
                        rotate: [p.startRot, p.startRot + 360],
                        opacity: [0, 0.9, 0.9, 0]
                    }}
                    transition={{
                        y: { duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'linear' },
                        x: { duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut', times: [0, 0.3, 0.6, 0.85, 1] },
                        rotate: { duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'linear' },
                        opacity: { duration: p.duration, delay: p.delay, repeat: Infinity, times: [0, 0.08, 0.88, 1] }
                    }}
                />
            ))}

            {/* CONFETTI */}
            {confetti.map((c) => {
                const Icon = c.Icon;
                return (
                    <motion.div
                        key={`c-${c.id}`}
                        style={{ position: 'absolute', left: `${c.leftPct}%`, top: -40, zIndex: 200 }}
                        animate={{
                            y: [0, windowSize.height + 60],
                            rotate: [0, 270],
                            opacity: [0, 1, 1, 0]
                        }}
                        transition={{
                            duration: c.duration,
                            delay: c.delay,
                            repeat: Infinity,
                            ease: 'linear',
                            times: [0, 0.08, 0.85, 1]
                        }}
                    >
                        <Icon size={c.size} color={c.color} fill={c.color} />
                    </motion.div>
                );
            })}

            {/* SCENE CONTAINER */}
            <div style={{ position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none' }}>

                {/* BANNER - PERFECTLY CENTERED */}
                <div style={{ position: 'absolute', width: '100%', top: 0, display: 'flex', justifyContent: 'center' }}>
                    <motion.div
                        animate={{
                        y: ['-100%', '-100%', '2vh', '2vh', '-100%', '-100%', isMobile ? '22vh' : '18vh', isMobile ? '22vh' : '18vh'],
                            opacity: [0, 0, 1, 1, 0, 0, 1, 1],
                            rotate: [0, 0, -2, 2, 0, 0, -1, 1]
                        }}
                        transition={{
                            times: [0, t(7), t(8), t(9), t(10), t(15), t(15.5), 1],
                            duration: DURATION, repeat: Infinity, ease: paperStep
                        }}
                        style={{ zIndex: 5, pointerEvents: 'auto' }}
                    >
                        <motion.h1
                            animate={{ rotate: [-1, 1, -1] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: roughStep }}
                            style={{
                                fontFamily: 'var(--font-main)', fontSize: isMobile ? '1.3rem' : '2.2rem',
                                color: '#f472b6', margin: 0, textShadow: '3px 3px 0px #be185d',
                                whiteSpace: 'nowrap', lineHeight: 1
                            }}
                        >
                            Happy birthday, Mitsumi!
                        </motion.h1>
                    </motion.div>
                </div>


                {/* MITSUMI - CENTER STAR */}
                <motion.div
                    animate={{
                        top: ['120vh', '120vh', charLine, charLine, '46%', charLine, charLine, charLine, charLine],
                        left: ['50%', '50%', '50%', '50%', '50%', '50%', '50%', '50%', '50%'],
                        width: [mitsumiSize, mitsumiSize, mitsumiSize, mitsumiSize, mitsumiSize, mitsumiSize, mitsumiSize, finalSize, finalSize],
                        height: [mitsumiSize, mitsumiSize, mitsumiSize, mitsumiSize, mitsumiSize, mitsumiSize, mitsumiSize, finalSize, finalSize]
                    }}
                    transition={{
                        times: [0, t(0.5), t(4), t(19.5), t(20), t(20.5), t(22), t(27), 1],
                        duration: DURATION, repeat: Infinity, ease: paperStep
                    }}
                    style={{
                        position: 'absolute', zIndex: 30,
                        transform: 'translateX(-50%) translateY(-50%)',
                        filter: 'drop-shadow(0px 8px 20px rgba(0,0,0,0.2))'
                    }}
                >
                    <motion.div
                        animate={{ scaleX: [1, 1, -1, -1, 1, 1, -1, -1, 1, 1, -1, -1, 1, 1, -1, -1, 1, 1] }}
                        transition={{
                            times: [0, t(5), t(5.5), t(6.5), t(7), t(8), t(8.5), t(9.5), t(10), t(19.5), t(19.55), t(19.65), t(19.7), t(19.9), t(19.95), t(20.0), t(20.1), 1],
                            duration: DURATION, repeat: Infinity, ease: veryRough
                        }}
                        style={{ width: '100%', height: '100%' }}
                    >
                        <motion.div
                            animate={{ y: [0, -10, 0, -10, 0], x: [0, 2, -2, 2, 0], rotate: [-2, 2, -2, 2, -2] }}
                            transition={{ duration: 1.2, repeat: Infinity, ease: roughStep }}
                            style={{ width: '100%', height: '100%' }}
                        >
                            <img src="/1c.png" alt="Mitsumi" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </motion.div>

                        <motion.div
                            animate={{ opacity: [0, 0, 1, 1, 0, 0] }}
                            transition={{ times: [0, t(1.5), t(1.6), t(6), t(6.1), 1], duration: DURATION, repeat: Infinity, ease: veryRough }}
                            style={{ position: 'absolute', top: 0, right: 0 }}
                        >
                            <motion.div animate={{ y: [0, -10, -20], x: [0, 5, 10], rotate: [-10, 10, -10] }} transition={{ duration: 1.5, repeat: Infinity, ease: roughStep }}>
                                <Music size={isMobile ? 30 : 40} color="#e67e5f" fill="#fef2f2" />
                            </motion.div>
                        </motion.div>

                        <motion.div
                            animate={{ opacity: [0, 0, 1, 1, 0, 0], scale: [0, 0, 1.3, 1, 1, 0], rotate: [0, 0, -10, 10, 0, 0] }}
                            transition={{ times: [0, t(19.5), t(20), t(22.5), t(22.6), 1], duration: DURATION, repeat: Infinity, ease: roughStep }}
                            style={{
                                position: 'absolute', top: '-15%', right: '10%',
                                fontSize: isMobile ? '2.5rem' : '3.5rem', color: '#ef4444', fontWeight: '900',
                                textShadow: '2px 2px 0 #fff'
                            }}
                        >
                            !?
                        </motion.div>

                        {/* Happy ♥ reaction after the shock */}
                        <motion.div
                            animate={{ opacity: [0, 0, 1, 1, 0], scale: [0, 0, 1.5, 1, 0], rotate: [0, 0, 15, -5, 0] }}
                            transition={{ times: [0, t(23), t(23.5), t(26), t(27), 1], duration: DURATION, repeat: Infinity, ease: roughStep }}
                            style={{
                                position: 'absolute', top: '-18%', left: '5%',
                                fontSize: isMobile ? '2rem' : '3rem', color: '#f472b6',
                                textShadow: '2px 2px 0 #fff'
                            }}
                        >
                            ♥
                        </motion.div>

                        {/* Cake floats above Mitsumi when Shima surprises her */}
                        <motion.div
                            animate={{ opacity: [0, 0, 1, 1, 1], scale: [0, 0, 1.4, 1, 1], rotate: [0, 0, -15, 5, 5] }}
                            transition={{ times: [0, t(19.5), t(19.7), t(21), 1], duration: DURATION, repeat: Infinity, ease: roughStep }}
                            style={{ position: 'absolute', top: '-22%', left: '50%', transform: 'translateX(-50%)', zIndex: 40 }}
                        >
                            <Cake size={isMobile ? 48 : 72} color="#f472b6" fill="#fff" />
                        </motion.div>
                    </motion.div>
                </motion.div>


                {/* SHIMA — PEEK #1 (edge, tiny) → RETREAT → PEEK #2 (closer, bigger) → RETREAT → SLOW APPROACH → ARRIVE */}
                <motion.div
                    animate={{
                        left: ['120vw','120vw', '97%', '97%', '120vw','120vw', '92%', '92%', '120vw','120vw', '88%', '75%', '64%', '64%', isMobile ? '60%' : '58%', isMobile ? '60%' : '58%'],
                        top:  [charLine,charLine,charLine,charLine,charLine,charLine,charLine,charLine,charLine,charLine,charLine,charLine,charLine,charLine,charLine,charLine],
                        width:  [mitsumiSize,mitsumiSize, shimaFar, shimaFar, mitsumiSize,mitsumiSize, shimaMed, shimaMed, mitsumiSize,mitsumiSize, shimaFar, shimaMed, mitsumiSize, mitsumiSize, finalSize, finalSize],
                        height: [mitsumiSize,mitsumiSize, shimaFar, shimaFar, mitsumiSize,mitsumiSize, shimaMed, shimaMed, mitsumiSize,mitsumiSize, shimaFar, shimaMed, mitsumiSize, mitsumiSize, finalSize, finalSize]
                    }}
                    transition={{ times: [0, t(9), t(9.8), t(10.5), t(11.2), t(13), t(13.8), t(14.5), t(15.2), t(15.5), t(17), t(18.5), t(19.5), t(27), t(29), 1], duration: DURATION, repeat: Infinity, ease: paperStep }}
                    style={{
                        position: 'absolute', zIndex: 28,
                        transform: 'translateX(-50%) translateY(-50%)',
                        filter: 'drop-shadow(0px 8px 20px rgba(0,0,0,0.15))'
                    }}
                >
                    {/* scaleX(-1) so he faces LEFT toward Mitsumi */}
                    <div style={{ width: '100%', height: '100%', transform: 'scaleX(-1)' }}>
                        <motion.div
                            animate={{ y: [0, -8, 0], x: [0, 3, 0], rotate: [0, -2, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: roughStep }}
                            style={{ width: '100%', height: '100%' }}
                        >
                            <img src="/2c.png" alt="Shima" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </motion.div>
                    </div>
                </motion.div>


                {/* MIKA — PEEK from left edge, then rush in after surprise */}
                <motion.div
                    animate={{
                        left: ['-20vw','-20vw', '3%', '3%', '-20vw','-20vw', isMobile ? '28%' : '34%', isMobile ? '28%' : '34%', isMobile ? '40%' : '42%', isMobile ? '40%' : '42%'],
                        top: [charLine,charLine,charLine,charLine,charLine,charLine,charLine,charLine,charLine,charLine],
                        width: [friendSize,friendSize,friendSize,friendSize,friendSize,friendSize,friendSize,friendSize,finalSize,finalSize],
                        height: [friendSize,friendSize,friendSize,friendSize,friendSize,friendSize,friendSize,friendSize,finalSize,finalSize]
                    }}
                    transition={{ times: [0, t(11), t(11.8), t(12.5), t(13.2), t(21), t(22), t(22.5), t(27), 1], duration: DURATION, repeat: Infinity, ease: paperStep }}
                    style={{
                        position: 'absolute', zIndex: 22,
                        transform: 'translateX(-50%) translateY(-50%)',
                        filter: 'drop-shadow(0px 8px 20px rgba(0,0,0,0.15))'
                    }}
                >
                    <motion.div
                        animate={{ y: [0, -8, 0], x: [0, -3, 0], rotate: [-2, 2, -2] }}
                        transition={{ duration: 1.3, repeat: Infinity, ease: roughStep }}
                        style={{ width: '100%', height: '100%' }}
                    >
                        <img src="/3c.png" alt="Mika" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        <motion.div
                            animate={{ opacity: [0, 0, 1, 1, 0, 0], rotate: [0, 0, 10, -10, 0, 0] }}
                            transition={{ times: [0, t(22), t(22.1), t(26), t(26.1), 1], duration: DURATION, repeat: Infinity, ease: veryRough }}
                            style={{ position: 'absolute', top: 0, right: 0, fontSize: isMobile ? '1.8rem' : '2.5rem' }}
                        >
                            🎀
                        </motion.div>
                    </motion.div>
                </motion.div>


                {/* YUZUKI - FROM BOTTOM LEFT CLUSTERING CENTER */}
                <motion.div
                    animate={{
                        left: ['-20vw', '-20vw', isMobile ? '20%' : '25%', isMobile ? '20%' : '25%', isMobile ? '30%' : '34%', isMobile ? '30%' : '34%'],
                        top: ['120vh', '120vh', charLine, charLine, charLine, charLine],
                        width: [friendSize, friendSize, friendSize, friendSize, finalSize, finalSize],
                        height: [friendSize, friendSize, friendSize, friendSize, finalSize, finalSize]
                    }}
                    transition={{ times: [0, t(23), t(25), t(27), t(29), 1], duration: DURATION, repeat: Infinity, ease: paperStep }}
                    style={{
                        position: 'absolute', zIndex: 20,
                        transform: 'translateX(-50%) translateY(-50%)',
                        filter: 'drop-shadow(0px 8px 20px rgba(0,0,0,0.15))'
                    }}
                >
                    <motion.div
                        animate={{ y: [0, -12, 0], x: [0, 4, 0], rotate: [1, -1, 1] }}
                        transition={{ duration: 2, repeat: Infinity, ease: roughStep }}
                        style={{ width: '100%', height: '100%' }}
                    >
                        <img src="/4c.png" alt="Yuzuki" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        <motion.div
                            animate={{ opacity: [0, 0, 1, 1, 0, 0], scale: [0, 0, 1.2, 1, 0, 0], rotate: [0, 0, -10, 10, 0, 0] }}
                            transition={{ times: [0, t(25), t(25.1), t(27), t(27.1), 1], duration: DURATION, repeat: Infinity, ease: veryRough }}
                            style={{ position: 'absolute', top: 0, left: 0 }}
                        >
                            <Heart size={isMobile ? 30 : 45} color="#f472b6" fill="#f472b6" />
                        </motion.div>
                    </motion.div>
                </motion.div>


                {/* MAKOTO - FROM BOTTOM RIGHT CLUSTERING CENTER */}
                <motion.div
                    animate={{
                        left: ['120vw', '120vw', isMobile ? '80%' : '75%', isMobile ? '80%' : '75%', isMobile ? '70%' : '66%', isMobile ? '70%' : '66%'],
                        top: ['120vh', '120vh', charLine, charLine, charLine, charLine],
                        width: [friendSize, friendSize, friendSize, friendSize, finalSize, finalSize],
                        height: [friendSize, friendSize, friendSize, friendSize, finalSize, finalSize]
                    }}
                    transition={{ times: [0, t(25), t(27), t(27), t(29), 1], duration: DURATION, repeat: Infinity, ease: paperStep }}
                    style={{
                        position: 'absolute', zIndex: 18,
                        transform: 'translateX(-50%) translateY(-50%)',
                        filter: 'drop-shadow(0px 8px 20px rgba(0,0,0,0.15))'
                    }}
                >
                    <motion.div
                        animate={{ y: [0, -6, 0], x: [0, -4, 0], rotate: [-1, 1, -1] }}
                        transition={{ duration: 1.1, repeat: Infinity, ease: roughStep }}
                        style={{ width: '100%', height: '100%' }}
                    >
                        <img src="/5c.png" alt="Makoto" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        <motion.div
                            animate={{ opacity: [0, 0, 1, 1, 0, 0], rotate: [0, 0, -15, 15, 0, 0] }}
                            transition={{ times: [0, t(26), t(26.1), t(28), t(28.1), 1], duration: DURATION, repeat: Infinity, ease: veryRough }}
                            style={{ position: 'absolute', top: '10px', left: '10px', fontSize: isMobile ? '1.8rem' : '2.5rem' }}
                        >
                            👓
                        </motion.div>
                    </motion.div>
                </motion.div>

            </div>

            {/* BUTTON - REFINED SIZE & PERFECT CENTER */}
            <div style={{ position: 'absolute', bottom: '30px', width: '100%', display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
                <motion.a
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 31, duration: 1.2, ease: paperStep }}
                    href="/"
                    style={{
                        padding: '12px 24px', background: '#fff', color: '#f472b6',
                        fontFamily: 'var(--font-hand)', fontSize: '1.3rem', fontWeight: 'bold',
                        borderRadius: '9999px', textDecoration: 'none',
                        boxShadow: '0 5px 15px rgba(244, 114, 182, 0.3)',
                        border: '2.5px solid #f472b6', zIndex: 300, pointerEvents: 'auto'
                    }}
                    whileHover={{ scale: 1.05, background: '#fdf2f8' }}
                    whileTap={{ scale: 0.98 }}
                >
                    Back to Tracker
                </motion.a>
            </div>
        </div>
    );
};

export default MitsumiBirthday;
