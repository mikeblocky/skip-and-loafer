import { useState } from 'react';
import { motion } from 'framer-motion';

const MemoCard = ({ src, index, initialX, initialY, initialRotation }) => {
    const [zIndex, setZIndex] = useState(100 + index);

    return (
        <motion.div
            className="memo-card"
            drag
            dragMomentum={false}
            dragElastic={0}
            whileDrag={{ scale: 1.05, zIndex: 9999, cursor: 'grabbing' }}
            whileHover={{ scale: 1.02 }}
            onDragStart={() => setZIndex(9999)}
            onDragEnd={() => setZIndex(100 + index)}
            style={{
                position: 'absolute',
                left: initialX,
                top: initialY,
                width: '200px',
                zIndex: zIndex,
                rotate: initialRotation,
                touchAction: 'none',
                cursor: 'grab'
            }}
            initial={{ y: -400, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
                type: 'spring',
                stiffness: 100,
                damping: 18,
                delay: index * 0.07
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

export default MemoCard;
