/**
 * Shared page shell — provides consistent padding, flex-column layout and gap
 * for all standard pages. Complex pages (Community board, Mystery sidebar)
 * use this for padding only and manage their own internal layout.
 */
const PageLayout = ({
  children,
  isMobile,
  gap,
  overflow = 'visible',
  style = {},
  className = '',
}) => (
  <div
    className={`hide-scrollbar ${className}`}
    style={{
      width: '100%',
      padding: isMobile ? '20px 14px 72px' : '28px 40px',
      display: 'flex',
      flexDirection: 'column',
      gap: gap !== undefined ? gap : (isMobile ? '20px' : '28px'),
      flex: 1,
      overflow,
      overflowX: 'hidden',
      position: 'relative',
      boxSizing: 'border-box',
      ...style,
    }}
  >
    {children}
  </div>
);

export default PageLayout;
