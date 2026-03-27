/* eslint-disable no-unused-vars */
import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';

const InteractiveShape = ({ color, size, initialTop, initialLeft, index }) => {
    // Each shape gets a unique organic path
    const motion_config = useMemo(() => {
        const spread = 35;
        return {
            pathX: [0, spread * (Math.random() - 0.3), -spread * (Math.random() + 0.2), spread * (Math.random() - 0.5), 0],
            pathY: [0, -spread * (Math.random() + 0.3), spread * (Math.random() - 0.4), -spread * (Math.random() - 0.2), 0],
            duration: 10 + index * 2.5 + Math.random() * 4,
        };
    }, [index]);

    return (
        <motion.div
            className="morphing-shape"
            style={{
                position: 'absolute',
                top: initialTop,
                left: initialLeft,
                width: size,
                height: size,
                background: color,
                opacity: 0.35,
                zIndex: 2,
                pointerEvents: 'none'
            }}
            animate={{
                x: motion_config.pathX,
                y: motion_config.pathY,
                scale: [1, 1.18, 0.88, 1.12, 1],
                rotate: [0, 12, -10, 6, 0],
                opacity: [0.35, 0.28, 0.38, 0.3, 0.35],
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
