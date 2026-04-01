import { motion } from 'framer-motion';
import { PAPER_FONT_FAMILY, createPaperHeadingBadgeStyle } from './paperTheme';

const PaperHeadingBadge = ({
  isMobile,
  icon: Icon,
  title,
  palette,
  titleColor,
  iconColor,
  iconSizeMobile = 28,
  iconSizeDesktop = 24,
  fontFamily = PAPER_FONT_FAMILY,
  initial = { scale: 0.9, opacity: 0 },
  animate = { scale: 1, opacity: 1 },
  style,
}) => (
  <motion.div
    initial={initial}
    animate={animate}
    style={{
      ...createPaperHeadingBadgeStyle(palette),
      ...style,
    }}
  >
    {Icon ? <Icon size={isMobile ? iconSizeMobile : iconSizeDesktop} strokeWidth={2.5} style={{ color: iconColor || palette.borderColor }} /> : null}
    <span
      style={{
        fontFamily,
        color: titleColor || palette.bottomColor,
        fontSize: isMobile ? '1.45rem' : '1.35rem',
        fontWeight: '400',
        letterSpacing: '0.2px',
        lineHeight: 1,
      }}
    >
      {title}
    </span>
  </motion.div>
);

export default PaperHeadingBadge;
