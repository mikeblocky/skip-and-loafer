/* eslint-disable no-unused-vars */
import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';

const InteractiveShape = ({ color, size, initialTop, initialLeft, index, subtle = false }) => {
    // Each shape gets a unique organic path with wider drift spread
    const motion_config = useMemo(() => {
        const spread = subtle ? 40 : 80;
        return {
            pathX: [0, spread * (Math.random() - 0.3), -spread * (Math.random() + 0.2), spread * (Math.random() - 0.5), 0],
            pathY: [0, -spread * (Math.random() + 0.3), spread * (Math.random() - 0.4), -spread * (Math.random() - 0.2), 0],
            duration: (subtle ? 18 : 14) + index * 3.5 + Math.random() * 5,
        };
    }, [index, subtle]);

    return (
        <motion.div
            className="morphing-shape"
            style={{
                position: 'fixed', // Changed from absolute to fixed so they float with page scroll
                top: initialTop,
                left: initialLeft,
                width: `calc(${size} * 2.2)`,
                height: `calc(${size} * 2.2)`,
                background: `radial-gradient(circle, ${color} 0%, rgba(255, 255, 255, 0) 70%)`,
                opacity: subtle ? 0.38 : 0.55,
                zIndex: 1,
                pointerEvents: 'none',
                willChange: 'transform, border-radius'
            }}
            animate={{
                x: motion_config.pathX,
                y: motion_config.pathY,
                scale: subtle ? [1, 1.12, 0.94, 1.06, 1] : [1, 1.22, 0.84, 1.16, 1],
                rotate: subtle ? [0, 8, -6, 4, 0] : [0, 18, -14, 8, 0],
                opacity: subtle ? [0.38, 0.32, 0.42, 0.34, 0.38] : [0.55, 0.44, 0.60, 0.48, 0.55],
            }}
            transition={{
                repeat: Infinity,
                duration: motion_config.duration,
                ease: [0.42, 0, 0.58, 1],
                times: [0, 0.25, 0.5, 0.75, 1],
            }}
        />
    );
};

export default memo(InteractiveShape);
