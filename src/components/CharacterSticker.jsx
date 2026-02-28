/* eslint-disable no-unused-vars, react-hooks/purity */
import { memo, useState, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Sparkles } from 'lucide-react';

const CharacterSticker = ({ character, isMobile, activePage, allPositions, onPositionUpdate, index, sidePreference, sideRank = 0, sideCount = 1 }) => {
    const [showEffect, setShowEffect] = useState(null);
    const stickerRef = useRef(null);
    const size = isMobile ? 100 : 150;
    const sidePages = ['home', 'chapters', 'sync', 'birthdays', 'gallery', 'blog'];
    const isSideLayoutPage = sidePages.includes(activePage);

    // Random position and rotation on each page load
    const randomPos = useMemo(() => {
        const w = typeof window !== 'undefined' ? window.innerWidth : 1000;
        const h = typeof window !== 'undefined' ? window.innerHeight : 800;
         
        return {
            x: isMobile ? Math.random() * (w - 120) : Math.random() * (w - 200),
            y: isMobile ? 50 + Math.random() * (h - 200) : 50 + Math.random() * (h - 250),
            rot: Math.random() * 30 - 15 // -15 to +15 degrees
        };
    }, [isMobile]);

    // Edge position for side-layout pages
    const edgePos = useMemo(() => {
        const w = typeof window !== 'undefined' ? window.innerWidth : 1000;
        const h = typeof window !== 'undefined' ? window.innerHeight : 800;
        const pad = isMobile ? -20 : -10;

        let x = 0, y = 0;

        if (isMobile) {
            // Top, Right, Bottom, Left based on index
            const side = index % 4;
            // eslint-disable-next-line react-hooks/purity
            if (side === 0) { x = Math.random() * (w - size); y = pad; } // Top
            else if (side === 1) { x = w - size - pad; y = Math.random() * (h - size); } // Right
            else if (side === 2) { x = Math.random() * (w - size); y = h - size - pad; } // Bottom
            else { x = pad; y = Math.random() * (h - size); } // Left
        } else {
            // Use balanced side assignment from App; fallback to random if unavailable
            const side = sidePreference === 'left' ? 0 : sidePreference === 'right' ? 1 : (Math.random() < 0.5 ? 0 : 1);
            // eslint-disable-next-line react-hooks/purity
            if (side === 0) { x = pad; } // Left
            else { x = w - size - pad; } // Right

            const maxY = Math.max(0, h - size);
            const safeCount = Math.max(1, sideCount);
            const minGap = size * 0.5; // allow at most 50% overlap

            if (safeCount === 1) {
                y = Math.random() * maxY;
            } else {
                const baseGap = maxY / (safeCount - 1);
                const baseY = Math.min(maxY, Math.max(0, sideRank * baseGap));
                const jitterRoom = Math.max(0, (baseGap - minGap) / 2);
                const jitter = (Math.random() * 2 - 1) * jitterRoom;
                y = Math.min(maxY, Math.max(0, baseY + jitter));
            }
        }

        // eslint-disable-next-line react-hooks/purity
        return { x, y, rot: Math.random() * 40 - 20 };
    }, [isMobile, index, size, sidePreference, sideRank, sideCount]);

    // Choose target based on current view
    const targetPos = isSideLayoutPage ? edgePos : randomPos;

    const checkProximity = useCallback(() => {
        if (!stickerRef.current) return;
        const rect = stickerRef.current.getBoundingClientRect();
        const myX = rect.left + rect.width / 2;
        const myY = rect.top + rect.height / 2;

        // Update my position
        onPositionUpdate(character.id, { x: myX, y: myY });

        // Check relationships
        let effect = null;

        // 1c + 2c = best friends (bidirectional)
        if ((character.id === '1c' && allPositions['2c']) || (character.id === '2c' && allPositions['1c'])) {
            const otherId = character.id === '1c' ? '2c' : '1c';
            const dist = Math.hypot(myX - allPositions[otherId].x, myY - allPositions[otherId].y);
            if (dist < 280) effect = 'bestfriend';
        }

        // 1c or 2c near 3c, 4c, or 5c = group friendship (bidirectional)
        if (character.id === '1c' || character.id === '2c') {
            ['3c', '4c', '5c'].forEach(otherId => {
                if (allPositions[otherId]) {
                    const dist = Math.hypot(myX - allPositions[otherId].x, myY - allPositions[otherId].y);
                    if (dist < 280) effect = 'group';
                }
            });
        }
        // 3c, 4c, 5c near 1c or 2c = group friendship (reverse)
        if (['3c', '4c', '5c'].includes(character.id)) {
            ['1c', '2c'].forEach(mainId => {
                if (allPositions[mainId]) {
                    const dist = Math.hypot(myX - allPositions[mainId].x, myY - allPositions[mainId].y);
                    if (dist < 280) effect = 'group';
                }
            });
        }

        // 4c + 5c = mutual friendship (bidirectional)
        if ((character.id === '4c' && allPositions['5c']) || (character.id === '5c' && allPositions['4c'])) {
            const otherId = character.id === '4c' ? '5c' : '4c';
            const dist = Math.hypot(myX - allPositions[otherId].x, myY - allPositions[otherId].y);
            if (dist < 280) effect = 'friendship';
        }

        // 3c near 1c = mature/growth (Mika's personal journey)
        if (character.id === '3c' && allPositions['1c']) {
            const dist = Math.hypot(myX - allPositions['1c'].x, myY - allPositions['1c'].y);
            if (dist < 280) effect = 'mature';
        }

        setShowEffect(effect);
    }, [character.id, allPositions, onPositionUpdate]);

    return (
        <AnimatePresence>
            {!(isMobile && isSideLayoutPage) && (
                <motion.div
                    ref={stickerRef}
                    drag
                    dragMomentum={false}
                    dragElastic={0}
                    onDrag={checkProximity}
                    onDragEnd={checkProximity}
                    whileDrag={{ scale: 1.1, zIndex: 9999 }}
                    whileHover={{ scale: 1.05 }}
                    style={{
                        position: 'fixed',
                        top: 0, left: 0,
                        width: size,
                        zIndex: 600,
                        cursor: 'grab',
                        filter: 'drop-shadow(3px 5px 8px rgba(0,0,0,0.25))'
                    }}
                    initial={{ scale: 0, opacity: 0, rotate: randomPos.rot * 2, x: randomPos.x, y: randomPos.y }}
                    animate={{ scale: 1, opacity: 1, rotate: targetPos.rot, x: targetPos.x, y: targetPos.y }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 180, damping: 15, delay: isSideLayoutPage ? index * 0.05 : 0.2 + index * 0.1 }}
                >
                    <img
                        src={character.src}
                        alt={character.name}
                        style={{ width: '100%', height: 'auto', pointerEvents: 'none' }}
                        draggable="false"
                    />

                    {/* Relationship Effect */}
                    <AnimatePresence>
                        {/* Best Friends (1c + 2c) - Two Stars */}
                        {showEffect === 'bestfriend' && (
                            <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                style={{ position: 'absolute', top: '-35px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '4px' }}
                            >
                                <motion.div animate={{ y: [0, -6, 0], rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 0.9 }}>
                                    <Star size={28} fill="#ffe57f" color="#ffe57f" />
                                </motion.div>
                                <motion.div animate={{ y: [0, -6, 0], rotate: [0, -10, 10, 0] }} transition={{ repeat: Infinity, duration: 0.9, delay: 0.15 }}>
                                    <Star size={28} fill="#97d5eb" color="#97d5eb" />
                                </motion.div>
                            </motion.div>
                        )}

                        {/* Group Friendship (1c with 3c/4c/5c) */}
                        {showEffect === 'group' && (
                            <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                style={{ position: 'absolute', top: '-35px', left: '50%', transform: 'translateX(-50%)' }}
                            >
                                <motion.div animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.25, 1] }} transition={{ repeat: Infinity, duration: 0.8 }}>
                                    <Sparkles size={36} color="#ff9ec6" fill="#ff9ec6" />
                                </motion.div>
                            </motion.div>
                        )}

                        {showEffect === 'friendship' && (
                            <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                style={{ position: 'absolute', top: '-30px', left: '50%', transform: 'translateX(-50%)' }}
                            >
                                <motion.div
                                    animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
                                    transition={{ repeat: Infinity, duration: 1 }}
                                >
                                    <Sparkles size={32} color="#ffe57f" fill="#ffe57f" />
                                </motion.div>
                            </motion.div>
                        )}

                        {showEffect === 'mature' && (
                            <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                style={{ position: 'absolute', top: '-30px', left: '50%', transform: 'translateX(-50%)' }}
                            >
                                <motion.div
                                    animate={{ y: [0, -5, 0], rotate: [0, 5, -5, 0] }}
                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                >
                                    <Star size={28} fill="#97eba9" color="#97eba9" />
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default memo(CharacterSticker);
