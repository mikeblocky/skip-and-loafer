/* eslint-disable no-unused-vars */
import { motion } from 'framer-motion';

const FloatingSparkle = ({ children, top, left, right, delay, color }) => (
    <motion.div
        style={{ position: 'absolute', top, left, right, color, zIndex: 5, pointerEvents: 'none' }}
        animate={{ y: [0, -12, 0], rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: 4, delay, ease: "easeInOut" }}
    >
        {children}
    </motion.div>
);

export default FloatingSparkle;
