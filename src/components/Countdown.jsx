import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { intervalToDuration, isBefore } from 'date-fns';

const TARGET_DATE = new Date('2026-01-23T00:00:00+09:00');

const flipVariants = {
    initial: { rotateX: -90, opacity: 0 },
    animate: { rotateX: 0, opacity: 1 },
    exit: { rotateX: 90, opacity: 0 }
};

const CalendarPad = ({ value, label, delay, borderColor, isMobile }) => (
    <motion.div
        className="calendar-pad"
        style={{
            width: isMobile ? '72px' : '9rem',
            height: isMobile ? '95px' : '11rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
            perspective: '500px',
            flexShrink: 0
        }}
        initial={{ y: -15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay, duration: 0.4, type: 'spring' }}
    >
        {/* Header */}
        <div style={{ width: '100%', height: isMobile ? '28px' : '40px', backgroundColor: borderColor, position: 'relative', borderTopLeftRadius: '4px', borderTopRightRadius: '4px' }}>
            <div style={{ position: 'absolute', top: '-4px', left: 0, width: '100%', height: '12px', display: 'flex', justifyContent: 'space-between', padding: '0 6px' }}>
                {[...Array(isMobile ? 4 : 6)].map((_, i) => (
                    <div key={i} style={{ width: isMobile ? '8px' : '12px', height: isMobile ? '16px' : '22px', borderRadius: '9999px', border: '2px solid #9ca3af', backgroundColor: '#e5e7eb', zIndex: 20 }}></div>
                ))}
            </div>
        </div>

        {/* Content - fixed vertical alignment */}
        <div style={{
            flex: 1,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-end',
            paddingTop: isMobile ? '14px' : '12px',
            paddingBottom: isMobile ? '4px' : '10px'
        }}>
            <AnimatePresence mode="wait">
                <motion.span
                    key={value}
                    variants={flipVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                    style={{
                        fontSize: isMobile ? '2.2rem' : '3.75rem',
                        fontFamily: 'var(--font-hand)',
                        fontWeight: 'bold',
                        color: borderColor,
                        lineHeight: 1
                    }}
                >
                    {String(value).padStart(2, '0')}
                </motion.span>
            </AnimatePresence>

            {/* Labels - not bold, properly positioned */}
            <span style={{
                fontFamily: 'var(--font-main)',
                fontSize: isMobile ? '0.85rem' : '1.1rem',
                color: '#6b7280',
                marginTop: isMobile ? '6px' : '10px',
                letterSpacing: '0.08em',
                fontWeight: 'normal'
            }}>
                {label}
            </span>
        </div>
    </motion.div>
);

const Countdown = ({ isMobile = false }) => {
    const [timeLeft, setTimeLeft] = useState(null);

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            if (isBefore(now, TARGET_DATE)) {
                setTimeLeft(intervalToDuration({ start: now, end: TARGET_DATE }));
            } else {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                clearInterval(timer);
            }
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    if (!timeLeft) return <div style={{ fontFamily: 'var(--font-main)', color: '#9ca3af' }}>Loading...</div>;

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'row',
            gap: isMobile ? '6px' : '20px',
            justifyContent: 'center',
            flexWrap: 'nowrap',
            alignItems: 'center'
        }}>
            <CalendarPad value={timeLeft.days || 0} label="days" delay={0.1} borderColor="var(--pop-pink)" isMobile={isMobile} />
            <CalendarPad value={timeLeft.hours || 0} label="hrs" delay={0.2} borderColor="var(--pop-green)" isMobile={isMobile} />
            <CalendarPad value={timeLeft.minutes || 0} label="min" delay={0.3} borderColor="var(--pop-blue)" isMobile={isMobile} />
            <CalendarPad value={timeLeft.seconds || 0} label="sec" delay={0.4} borderColor="var(--pop-yellow)" isMobile={isMobile} />
        </div>
    );
};

export default Countdown;
