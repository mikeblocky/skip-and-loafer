import { motion } from 'framer-motion';
import { createPaperButtonStyle } from './paperTheme';

const PaperActionButton = ({
  icon: Icon,
  children,
  palette,
  style,
  iconSize = 18,
  iconStrokeWidth = 2.5,
  type = 'button',
  className,
  ...props
}) => (
  <motion.button
    type={type}
    className={className}
    style={{
      ...createPaperButtonStyle(palette),
      ...style,
    }}
    {...props}
  >
    {Icon ? <Icon size={iconSize} strokeWidth={iconStrokeWidth} /> : null}
    {children}
  </motion.button>
);

export default PaperActionButton;
