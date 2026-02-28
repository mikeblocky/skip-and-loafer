/* eslint-disable no-unused-vars */
import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';

const InteractiveShape = ({ color, size, initialTop, initialLeft, index }) => {
    const pathX = useMemo(() => [0, 30, -20, 15, 0], []);
    const pathY = useMemo(() => [0, -25, 10, -15, 0], []);

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
                x: pathX,
                y: pathY,
                scale: [1, 1.15, 0.9, 1.1, 1],
                rotate: [0, 10, -8, 5, 0]
            }}
            transition={{
                repeat: Infinity,
                duration: 12 + index * 2,
                ease: "easeInOut"
            }}
        />
    );
};

export default memo(InteractiveShape);
