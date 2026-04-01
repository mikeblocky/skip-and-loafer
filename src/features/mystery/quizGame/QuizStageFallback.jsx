import PaperLoadingState from '../../../components/shared/paper/PaperLoadingState';

const QuizStageFallback = ({ isMobile, label }) => (
  <PaperLoadingState
    isMobile={isMobile}
    label={label}
    containerStyle={{
      width: '100%',
      minHeight: isMobile ? '420px' : '500px',
    }}
    cardStyle={{
      width: isMobile ? 'min(88vw, 280px)' : '320px',
      padding: isMobile ? '16px 20px' : '18px 24px',
      borderBottom: '7px solid #93c5fd',
      boxShadow: '0 10px 20px rgba(148, 163, 184, 0.12)',
    }}
    shimmerWidth="38%"
    skeletonLines={[]}
    labelStyle={{
      color: '#64748b',
      fontSize: isMobile ? '0.98rem' : '1.02rem',
    }}
  />
);

export default QuizStageFallback;
