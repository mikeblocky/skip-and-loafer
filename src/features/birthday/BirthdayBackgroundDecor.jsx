import { motion } from 'framer-motion';
import { Dog, Heart, Rabbit, Star, Sun } from 'lucide-react';

const BirthdayBackgroundDecor = ({ reduceMotion, simplifyVisuals }) => {
  if (reduceMotion || simplifyVisuals) {
    return null;
  }

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.25,
      }}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
        style={{ position: 'absolute', top: '10%', left: '5%', color: '#fb923c' }}
      >
        <Sun size={80} />
      </motion.div>
      <motion.div
        animate={{ y: [0, -30, 0], rotate: [0, 20, 0] }}
        transition={{ duration: 7, repeat: Infinity }}
        style={{ position: 'absolute', top: '45%', right: '3%', color: '#f43f5e' }}
      >
        <Heart size={64} />
      </motion.div>
      <motion.div
        animate={{ scale: [1, 1.2, 1], rotate: [-10, 10, -10] }}
        transition={{ duration: 9, repeat: Infinity }}
        style={{ position: 'absolute', bottom: '15%', left: '12%', color: '#3b82f6' }}
      >
        <Dog size={72} />
      </motion.div>
      <motion.div
        animate={{ x: [-15, 15, -15], y: [0, 10, 0] }}
        transition={{ duration: 11, repeat: Infinity }}
        style={{ position: 'absolute', bottom: '8%', right: '18%', color: '#10b981' }}
      >
        <Rabbit size={56} />
      </motion.div>
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 13, repeat: Infinity }}
        style={{ position: 'absolute', top: '25%', right: '15%', color: '#fcd34d' }}
      >
        <Star size={56} />
      </motion.div>
    </div>
  );
};

export default BirthdayBackgroundDecor;
