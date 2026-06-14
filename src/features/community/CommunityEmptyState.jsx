import PaperMessageCard from '../../components/shared/paper/PaperMessageCard';

const CommunityEmptyState = ({ message }) => (
  <PaperMessageCard
    style={{
      columnSpan: 'all',
      breakInside: 'avoid',
      padding: '22px 20px',
      color: '#64748b',
      lineHeight: 1.6,
      textAlign: 'center',
      background: '#ffffff',
      maxWidth: '380px',
      margin: '20px auto',
    }}
  >
    {message}
  </PaperMessageCard>
);

export default CommunityEmptyState;
