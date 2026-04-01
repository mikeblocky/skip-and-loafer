const PaperPageHeader = ({
  isMobile,
  center,
  leftSlot,
  rightSlot,
  marginBottomMobile = '4px',
  marginBottomDesktop = '8px',
  gapMobile = '14px',
  gapDesktop = '0',
  paddingMobile = '0 10px',
  paddingDesktop = '0',
}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: isMobile ? marginBottomMobile : marginBottomDesktop,
      flexDirection: isMobile ? 'column' : 'row',
      gap: isMobile ? gapMobile : gapDesktop,
      position: 'relative',
      width: '100%',
      padding: isMobile ? paddingMobile : paddingDesktop,
    }}
  >
    {center}
    {leftSlot ? (
      <div style={{ position: isMobile ? 'static' : 'absolute', left: isMobile ? 'auto' : '0' }}>
        {leftSlot}
      </div>
    ) : null}
    {rightSlot ? (
      <div
        style={{
          position: isMobile ? 'static' : 'absolute',
          right: isMobile ? 'auto' : '0',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          flexWrap: 'wrap',
          justifyContent: isMobile ? 'center' : 'flex-end',
          zIndex: 1,
        }}
      >
        {rightSlot}
      </div>
    ) : null}
  </div>
);

export default PaperPageHeader;
