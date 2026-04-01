import PaperLoadingState from '../../components/shared/paper/PaperLoadingState';

const ReaderOverlayFallback = ({ isMobile, label }) => (
  <PaperLoadingState
    isMobile={isMobile}
    label={label}
    containerStyle={{
      position: 'fixed',
      inset: 0,
      zIndex: 1300,
      background: 'rgba(248, 250, 252, 0.82)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
    }}
    cardStyle={{
      width: isMobile ? 'min(88vw, 320px)' : '340px',
      borderBottom: '8px solid #60a5fa',
    }}
  />
);

export default ReaderOverlayFallback;
