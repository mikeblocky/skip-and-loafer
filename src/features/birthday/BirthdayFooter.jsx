import { Star } from 'lucide-react';

const BirthdayFooter = ({ isMobile, count, label, year }) => {
  if (isMobile) {
    return null;
  }

  return (
    <div
      style={{
        marginTop: '80px',
        textAlign: 'center',
        fontFamily: '"Sniglet", "Coming Soon", cursive',
        fontSize: '1.2rem',
        color: '#9ca3af',
        fontWeight: '400',
      }}
    >
      <Star size={24} style={{ display: 'inline', marginRight: '10px', verticalAlign: 'middle', color: '#fcd34d' }} />
      {count} {label} • {year}
      <Star size={24} style={{ display: 'inline', marginLeft: '10px', verticalAlign: 'middle', color: '#fcd34d' }} />
    </div>
  );
};

export default BirthdayFooter;
