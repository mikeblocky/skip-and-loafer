import PaperLoadingState from '../../../components/shared/paper/PaperLoadingState';

const MysterySubviewFallback = ({ isMobile, label }) => (
  <PaperLoadingState
    isMobile={isMobile}
    label={label}
    containerStyle={{
      width: '100%',
      minHeight: isMobile ? '320px' : '420px',
    }}
    cardStyle={{
      width: isMobile ? 'min(88vw, 280px)' : '320px',
      padding: isMobile ? '16px 18px' : '18px 20px',
      borderBottom: '7px solid #93c5fd',
      boxShadow: '0 10px 20px rgba(148, 163, 184, 0.12)',
    }}
    shimmerWidth="36%"
    skeletonLines={[]}
    labelStyle={{
      color: '#94a3b8',
      fontSize: isMobile ? '1rem' : '1.1rem',
    }}
  />
);

export default MysterySubviewFallback;
