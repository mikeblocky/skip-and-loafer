import { memo, useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useVelocity, useTransform, animate } from 'framer-motion';
import { Star, Sparkles, Heart, Zap, Music } from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';

const SIZE = 140;

const IDLE_CLASS = {
    Mitsumi: 'idle-mitsumi',
    Sousuke: 'idle-sousuke',
    Mika:    'idle-mika',
    Makoto:  'idle-makoto',
    Yuzuki:  'idle-yuzuki',
};

const computeEdgePos = (windowW, windowH, sidePreference, sideRank, sideCount) => {
    const isLeft = sidePreference !== 'right';
    const x = isLeft ? 0 : windowW - SIZE;
    const maxY = windowH - SIZE;
    const safeCount = Math.max(1, sideCount);
    let y;
    if (safeCount === 1) {
        y = maxY * 0.25 + Math.random() * maxY * 0.5;
    } else {
        const slot = maxY / safeCount;
        const base = sideRank * slot;
        y = base + slot * 0.1 + Math.random() * slot * 0.8;
        y = Math.min(maxY, Math.max(0, y));
    }
    return { x, y, rot: Math.random() * 22 - 11 };
};

// Pre-compute per-sticker random entrance params so they're stable across renders
const makeEntryParams = (edgePos, windowW) => ({
    startY:   -(SIZE + 60 + Math.random() * 280),
    startX:   edgePos.x + (Math.random() - 0.5) * 160,
    startRot: (Math.random() - 0.5) * 80,  // -40 to +40 degrees tumble
    driftX:   (Math.random() - 0.5) * 60,  // sideways air-resistance drift
});

const CharacterSticker = ({
    character, isMobile, allPositions, onPositionUpdate,
    index, sidePreference, sideRank = 0, sideCount = 1,
}) => {
    const [showEffect, setShowEffect] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [bursts, setBursts] = useState([]);
    const stickerRef = useRef(null);

    const windowW = typeof window !== 'undefined' ? window.innerWidth  : 1280;
    const windowH = typeof window !== 'undefined' ? window.innerHeight : 800;

    const edgePos = useMemo(
        () => computeEdgePos(windowW, windowH, sidePreference, sideRank, sideCount),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [windowW, windowH, sidePreference, sideRank, sideCount],
    );

    // Stable random entrance params (computed once per mount)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const entry = useMemo(() => makeEntryParams(edgePos, windowW), []);

    // Position motion values — start at random entry point
    const x = useMotionValue(entry.startX);
    const y = useMotionValue(entry.startY);

    // Rotation: single source of truth.
    // manualRotate handles entrance tumble → rest angle.
    // velTilt adds real-time lean from horizontal drag velocity.
    const manualRotate = useMotionValue(entry.startRot);
    const xVel = useVelocity(x);
    // Paper tilts up to ±18° based on how fast you're moving it sideways
    const velTilt = useTransform(xVel, [-900, 0, 900], [-18, 0, 18]);
    const totalRotate = useTransform([manualRotate, velTilt], ([r, v]) => r + v);

    // Paper-fall entrance: random position + tumbling rotation → spring to edge
    useEffect(() => {
        const delay = 80 + index * 200;
        const timer = setTimeout(() => {
            // y falls into place with a slight overshoot (paper landing)
            animate(y, edgePos.y, {
                type: 'spring',
                stiffness: 90,
                damping: 14,
                mass: 1.4,
            });
            // x drifts sideways as it falls, then snaps to edge
            animate(x, edgePos.x, {
                type: 'spring',
                stiffness: 110,
                damping: 18,
                mass: 1.0,
                delay: 0.04,
            });
            // rotation tumbles and wobbles to rest angle
            animate(manualRotate, edgePos.rot, {
                type: 'spring',
                stiffness: 70,
                damping: 11,
                mass: 1.2,
            });
        }, delay);
        return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const triggerBurst = useCallback(() => {
        triggerHaptic('success');
        const list = ['✨', '🌸', '⭐', '🎈', '💖', '🍀', '🌈', '🍭', '🐾'];
        const words = ['YAY!', 'SKIP!', 'LOAFER!', 'Cute!', 'Hehe!', 'Oh!', 'Yay!'];
        const newBursts = Array.from({ length: 6 }).map((_, i) => ({
            id: Math.random(),
            char: i === 0 ? words[Math.floor(Math.random() * words.length)] : list[Math.floor(Math.random() * list.length)],
            dx: Math.random() * 90 - 45,
            dy: Math.random() * 90 - 45,
            angle: Math.random() * 360,
            scale: Math.random() * 0.5 + 0.8,
        }));
        setBursts(prev => [...prev, ...newBursts]);
        setTimeout(() => setBursts(prev => prev.filter(b => !newBursts.find(n => n.id === b.id))), 1100);
    }, []);

    const checkProximity = useCallback(() => {
        if (!stickerRef.current) return;
        const rect = stickerRef.current.getBoundingClientRect();
        const myX = rect.left + rect.width  / 2;
        const myY = rect.top  + rect.height / 2;

        onPositionUpdate(character.id, { x: myX, y: myY });

        const dist = (id) => allPositions[id]
            ? Math.hypot(myX - allPositions[id].x, myY - allPositions[id].y)
            : Infinity;

        const NEAR = 260;
        let effect = null;

        const allIds = ['1c', '2c', '3c', '4c', '5c'].filter(id => id !== character.id);
        if (allIds.every(id => allPositions[id]) && allIds.every(id => dist(id) < 340))
            effect = 'all_together';

        if (!effect && ((character.id === '1c' && dist('2c') < NEAR) || (character.id === '2c' && dist('1c') < NEAR)))
            effect = 'bestfriend';
        if (!effect && ((character.id === '2c' && dist('3c') < NEAR) || (character.id === '3c' && dist('2c') < NEAR)))
            effect = 'rivals';
        if (!effect && ((character.id === '1c' && dist('5c') < NEAR) || (character.id === '5c' && dist('1c') < NEAR)))
            effect = 'support';
        if (!effect && ((character.id === '3c' && dist('5c') < NEAR) || (character.id === '5c' && dist('3c') < NEAR)))
            effect = 'girlpower';
        if (!effect && character.id === '3c' && dist('1c') < NEAR)
            effect = 'mature';
        if (!effect && ((character.id === '4c' && dist('5c') < NEAR) || (character.id === '5c' && dist('4c') < NEAR)))
            effect = 'friendship';
        if (!effect) {
            if (character.id === '1c' || character.id === '2c')
                ['3c', '4c', '5c'].forEach(id => { if (!effect && dist(id) < NEAR) effect = 'group'; });
            if (['3c', '4c', '5c'].includes(character.id))
                ['1c', '2c'].forEach(id => { if (!effect && dist(id) < NEAR) effect = 'group'; });
        }

        setShowEffect(effect);
    }, [character.id, allPositions, onPositionUpdate]);

    if (isMobile) return null;

    return (
        <motion.div
            ref={stickerRef}
            drag
            // Re-enable momentum: paper glides to a stop smoothly, doesn't snap
            dragMomentum={true}
            dragTransition={{
                power: 0.18,          // moderate throw distance on release
                timeConstant: 210,    // decay in ~210ms — paper sliding to rest
                bounceStiffness: 220, // soft spring when hitting boundary
                bounceDamping: 28,    // damps the boundary bounce quickly
            }}
            dragElastic={0.07}        // tiny squish at edges, like paper hitting a wall
            dragConstraints={{ left: 0, top: 0, right: windowW - SIZE, bottom: windowH - SIZE }}
            onDragStart={() => { setIsDragging(true); triggerHaptic('press'); }}
            onDrag={checkProximity}
            onDragEnd={() => {
                setIsDragging(false);
                triggerHaptic('release');
                checkProximity();
                // Snap manualRotate back to rest — paper settles after being released
                animate(manualRotate, edgePos.rot, { type: 'spring', stiffness: 180, damping: 18 });
            }}
            onTap={triggerBurst}
            // Hover: peeling a corner off the wall
            whileHover={{ scale: 1.1, transition: { type: 'spring', stiffness: 360, damping: 22 } }}
            // Drag: lifted off the surface, light and floating
            whileDrag={{ scale: 1.2, transition: { type: 'spring', stiffness: 440, damping: 26 } }}
            // Tap: quick squish like pressing the sticker down
            whileTap={{ scale: 0.91, transition: { type: 'spring', stiffness: 700, damping: 20 } }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.18, delay: (80 + index * 200) / 1000 }}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                x,
                y,
                rotate: totalRotate, // entrance tumble + velocity lean, all in one
                width: SIZE,
                zIndex: isDragging ? 9999 : 1200,
                cursor: isDragging ? 'grabbing' : 'grab',
                filter: isDragging
                    ? 'drop-shadow(8px 20px 28px rgba(0,0,0,0.36))'
                    : 'drop-shadow(2px 6px 14px rgba(0,0,0,0.20))',
                willChange: 'transform',
                userSelect: 'none',
                touchAction: 'none',
            }}
        >
            {/* Idle float via CSS — pauses while dragging */}
            <div
                className={isDragging ? undefined : IDLE_CLASS[character.name]}
                style={{ width: '100%' }}
            >
                <img
                    src={character.src}
                    alt={character.name}
                    style={{ width: '100%', height: 'auto', display: 'block', pointerEvents: 'none' }}
                    draggable={false}
                />
            </div>

            {/* Tap burst particles */}
            <AnimatePresence>
                {bursts.map(b => (
                    <motion.div
                        key={b.id}
                        initial={{ opacity: 1, scale: 0.3, x: SIZE / 2 - 12, y: SIZE / 2 - 12, rotate: 0 }}
                        animate={{ opacity: 0, scale: b.scale, x: SIZE / 2 - 12 + b.dx * 2.4, y: SIZE / 2 - 12 + b.dy * 2.4 - 40, rotate: b.angle }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
                        style={{
                            position: 'absolute', pointerEvents: 'none',
                            fontSize: b.char.length > 2 ? '0.95rem' : '1.35rem',
                            fontFamily: 'var(--font-hand)', fontWeight: 'bold',
                            color: '#e11d48',
                            textShadow: '2px 2px 0 #fff, -2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff',
                            zIndex: 10000,
                        }}
                    >
                        {b.char}
                    </motion.div>
                ))}
            </AnimatePresence>

            {/* Relationship proximity effects */}
            <AnimatePresence>
                {showEffect === 'all_together' && (
                    <motion.div key="all_together" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
                        style={{ position: 'absolute', top: '-46px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '3px' }}>
                        {['#ffe57f','#ff9ec6','#97d5eb','#97eba9','#c4b5fd'].map((color, i) => (
                            <motion.div key={i} animate={{ y: [0, -8, 0], rotate: [0, 18, -18, 0], scale: [1, 1.35, 1] }} transition={{ repeat: Infinity, duration: 0.72, delay: i * 0.1 }}>
                                <Star size={20} fill={color} color={color} />
                            </motion.div>
                        ))}
                    </motion.div>
                )}
                {showEffect === 'bestfriend' && (
                    <motion.div key="bestfriend" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
                        style={{ position: 'absolute', top: '-40px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '4px' }}>
                        <motion.div animate={{ y: [0, -6, 0], rotate: [0, 14, -14, 0] }} transition={{ repeat: Infinity, duration: 0.88 }}>
                            <Star size={26} fill="#ffe57f" color="#ffe57f" />
                        </motion.div>
                        <motion.div animate={{ y: [0, -6, 0], rotate: [0, -14, 14, 0] }} transition={{ repeat: Infinity, duration: 0.88, delay: 0.16 }}>
                            <Star size={26} fill="#97d5eb" color="#97d5eb" />
                        </motion.div>
                    </motion.div>
                )}
                {showEffect === 'rivals' && (
                    <motion.div key="rivals" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
                        style={{ position: 'absolute', top: '-40px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '3px' }}>
                        <motion.div animate={{ y: [0, -9, 0], scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 0.52 }}>
                            <Zap size={24} fill="#fbbf24" color="#fbbf24" />
                        </motion.div>
                        <motion.div animate={{ y: [0, -9, 0], scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 0.52, delay: 0.17 }}>
                            <Zap size={24} fill="#f472b6" color="#f472b6" />
                        </motion.div>
                    </motion.div>
                )}
                {showEffect === 'support' && (
                    <motion.div key="support" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
                        style={{ position: 'absolute', top: '-40px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '4px' }}>
                        <motion.div animate={{ y: [0, -5, 0], scale: [1, 1.22, 1] }} transition={{ repeat: Infinity, duration: 1.05 }}>
                            <Heart size={22} fill="#f9a8d4" color="#f9a8d4" />
                        </motion.div>
                        <motion.div animate={{ y: [0, -5, 0], scale: [1, 1.22, 1] }} transition={{ repeat: Infinity, duration: 1.05, delay: 0.24 }}>
                            <Heart size={22} fill="#fb923c" color="#fb923c" />
                        </motion.div>
                    </motion.div>
                )}
                {showEffect === 'girlpower' && (
                    <motion.div key="girlpower" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
                        style={{ position: 'absolute', top: '-40px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '4px' }}>
                        <motion.div animate={{ y: [0, -4, 0], rotate: [-12, 12, -12] }} transition={{ repeat: Infinity, duration: 1.15 }}>
                            <Music size={22} fill="#c4b5fd" color="#c4b5fd" />
                        </motion.div>
                        <motion.div animate={{ y: [0, -4, 0], rotate: [12, -12, 12] }} transition={{ repeat: Infinity, duration: 1.15, delay: 0.22 }}>
                            <Music size={22} fill="#86efac" color="#86efac" />
                        </motion.div>
                    </motion.div>
                )}
                {showEffect === 'group' && (
                    <motion.div key="group" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
                        style={{ position: 'absolute', top: '-40px', left: '50%', transform: 'translateX(-50%)' }}>
                        <motion.div animate={{ rotate: [0, 18, -18, 0], scale: [1, 1.28, 1] }} transition={{ repeat: Infinity, duration: 0.78 }}>
                            <Sparkles size={32} color="#ff9ec6" fill="#ff9ec6" />
                        </motion.div>
                    </motion.div>
                )}
                {showEffect === 'friendship' && (
                    <motion.div key="friendship" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
                        style={{ position: 'absolute', top: '-36px', left: '50%', transform: 'translateX(-50%)' }}>
                        <motion.div animate={{ rotate: [0, 16, -16, 0], scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
                            <Sparkles size={28} color="#ffe57f" fill="#ffe57f" />
                        </motion.div>
                    </motion.div>
                )}
                {showEffect === 'mature' && (
                    <motion.div key="mature" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
                        style={{ position: 'absolute', top: '-36px', left: '50%', transform: 'translateX(-50%)' }}>
                        <motion.div animate={{ y: [0, -5, 0], rotate: [0, 7, -7, 0] }} transition={{ repeat: Infinity, duration: 1.45 }}>
                            <Star size={26} fill="#97eba9" color="#97eba9" />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default memo(CharacterSticker);
