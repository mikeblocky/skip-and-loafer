/* eslint-disable no-unused-vars */
import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';

const FloatingSparkle = ({ children, top, left, right, delay, color }) => {
    // Each sparkle gets its own organic rhythm
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const rhythm = useMemo(() => ({
        duration: 3 + Math.random() * 3,
        yRange: -8 - Math.random() * 10,
        rotRange: 8 + Math.random() * 8,
        scaleMax: 1.05 + Math.random() * 0.15,
        pauseDelay: Math.random() * 0.5,
    }), []);

    return (
        <motion.div
            style={{ position: 'absolute', top, left, right, color, zIndex: 5, pointerEvents: 'none' }}
            animate={{
                y: [0, rhythm.yRange * 0.4, rhythm.yRange, rhythm.yRange * 0.6, 0],
                rotate: [0, rhythm.rotRange, -rhythm.rotRange * 0.7, rhythm.rotRange * 0.3, 0],
                scale: [1, rhythm.scaleMax, 1, rhythm.scaleMax * 0.97, 1],
                opacity: [0.9, 1, 0.85, 1, 0.9],
            }}
            transition={{
                repeat: Infinity,
                duration: rhythm.duration,
                delay: delay + rhythm.pauseDelay,
                ease: [0.42, 0, 0.58, 1], // cubic-bezier for organic feel
                times: [0, 0.25, 0.5, 0.75, 1],
            }}
        >
            {children}
        </motion.div>
    );
};

export default memo(FloatingSparkle);
