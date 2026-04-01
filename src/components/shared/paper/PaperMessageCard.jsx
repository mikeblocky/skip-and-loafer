import { PAPER_FONT_FAMILY, createPaperPanelStyle } from './paperTheme';

const PaperMessageCard = ({
  children,
  palette,
  style,
  className,
  fontFamily = PAPER_FONT_FAMILY,
  fontSize = '0.95rem',
  lineHeight = 1.4,
}) => (
  <div
    className={className}
    style={{
      ...createPaperPanelStyle(palette),
      padding: '14px 18px',
      fontFamily,
      fontSize,
      lineHeight,
      ...style,
    }}
  >
    {children}
  </div>
);

export default PaperMessageCard;
