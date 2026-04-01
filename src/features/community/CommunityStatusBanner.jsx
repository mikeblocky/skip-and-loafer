import PaperMessageCard from '../../components/shared/paper/PaperMessageCard';

const BANNER_PALETTES = {
  error: {
    border: '#fca5a5',
    bottom: '#ef4444',
    background: '#fff1f2',
    color: '#b91c1c',
  },
  success: {
    border: '#86efac',
    bottom: '#22c55e',
    background: '#f0fdf4',
    color: '#166534',
  },
};

const CommunityStatusBanner = ({ tone = 'success', message }) => {
  if (!message) return null;

  const palette = BANNER_PALETTES[tone] || BANNER_PALETTES.success;

  return (
    <PaperMessageCard
      palette={{
        borderColor: palette.border,
        bottomColor: palette.bottom,
        background: palette.background,
      }}
      style={{
        color: palette.color,
      }}
    >
      {message}
    </PaperMessageCard>
  );
};

export default CommunityStatusBanner;
