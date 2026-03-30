/* eslint-disable no-unused-vars */
import { memo, useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { triggerHaptic } from '../../utils/haptics';
import { DRAG_SPRING_HEAVY } from './animationPresets';

const MemoCard = ({ src, index, initialX, initialY, initialRotation }) => {
    const [zIndex, setZIndex] = useState(100 + index);
    const [isDragging, setIsDragging] = useState(false);
    const dragX = useMotionValue(0);
    const dragY = useMotionValue(0);
    const tiltX = useTransform(dragX, [-300, 0, 300], [-6, 0, 6]);
    const tiltY = useTransform(dragY, [-300, 0, 300], [4, 0, -4]);

    return (
        <motion.div
            className="memo-card"
            drag
            dragMomentum={true}
            dragElastic={0.2}
            dragTransition={DRAG_SPRING_HEAVY}
            onDragStart={() => {
                setZIndex(9999);
                setIsDragging(true);
                triggerHaptic('press');
            }}
            onDrag={(e, info) => {
                dragX.set(info.velocity.x);
                dragY.set(info.velocity.y);
            }}
            onDragEnd={() => {
                setZIndex(100 + index);
                setIsDragging(false);
                triggerHaptic('release');
                dragX.set(0);
                dragY.set(0);
            }}
            whileDrag={{
                scale: 1.08,
                zIndex: 9999,
                cursor: 'grabbing',
                boxShadow: '4px 8px 20px rgba(0,0,0,0.25)',
                transition: { type: 'spring', stiffness: 300, damping: 15 },
            }}
            whileHover={{
                scale: 1.03,
                y: -3,
                boxShadow: '3px 6px 14px rgba(0,0,0,0.2)',
                transition: { type: 'spring', stiffness: 300, damping: 18 },
            }}
            style={{
                position: 'absolute',
                left: initialX,
                top: initialY,
                width: '200px',
                zIndex: zIndex,
                rotate: initialRotation,
                rotateZ: tiltX,
                touchAction: 'none',
                cursor: isDragging ? 'grabbing' : 'grab',
            }}
            initial={{ y: -400, opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{
                type: 'spring',
                stiffness: 120,
                damping: 14,
                mass: 0.8,
                delay: index * 0.07,
            }}
        >
            <img
                src={src}
                alt=""
                style={{ width: '100%', height: 'auto', display: 'block', pointerEvents: 'none' }}
                loading="lazy"
                draggable="false"
            />
        </motion.div>
    );
};

export default memo(MemoCard);
