const PaperPageHeader = ({
  isMobile,
  center,
  leftSlot,
  rightSlot,
  marginBottomMobile = '4px',
  marginBottomDesktop = '8px',
  gapMobile = '14px',
  gapDesktop = '20px',
  paddingMobile = '0 10px',
  paddingDesktop = '0',
}) => (
  <div
    style={{
      display: isMobile ? 'flex' : 'grid',
      flexDirection: isMobile ? 'column' : 'unset',
      gridTemplateColumns: isMobile ? 'unset' : 'minmax(0, 1fr) auto minmax(0, 1fr)',
      alignItems: 'center',
      marginBottom: isMobile ? marginBottomMobile : marginBottomDesktop,
      gap: isMobile ? gapMobile : gapDesktop,
      width: '100%',
      padding: isMobile ? paddingMobile : paddingDesktop,
    }}
  >
    {/* Left Group */}
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: isMobile ? 'center' : 'flex-start', order: isMobile ? 2 : 'unset' }}>
      {leftSlot}
    </div>

    {/* Center Group */}
    <div style={{ display: 'flex', justifyContent: 'center', flexShrink: 0, order: isMobile ? 1 : 'unset' }}>
      {center}
    </div>

    {/* Right Group */}
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        flexWrap: 'wrap',
        justifyContent: isMobile ? 'center' : 'flex-end',
        zIndex: 1,
        order: isMobile ? 3 : 'unset',
      }}
    >
      {rightSlot}
    </div>
  </div>
);

export default PaperPageHeader;
