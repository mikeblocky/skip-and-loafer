import { ArrowLeft, Package } from 'lucide-react';
import PaperActionButton from '../../../components/shared/paper/PaperActionButton';
import PaperHeadingBadge from '../../../components/shared/paper/PaperHeadingBadge';
import PaperPageHeader from '../../../components/shared/paper/PaperPageHeader';
import { toMysteryLabelCase } from '../quizGame/ui';

const MysteryHeader = ({ isMobile, showBackButton, title, onBack, backLabel }) => {
  const center = (
    <PaperHeadingBadge
      isMobile={isMobile}
      icon={Package}
      title={toMysteryLabelCase(title)}
      palette={{
        borderColor: '#db2777',
        bottomColor: '#db2777',
        shadow: '0 8px 18px rgba(219, 39, 119, 0.1)',
      }}
      iconSizeMobile={22}
      iconSizeDesktop={20}
      initial={{ scale: 0.9, opacity: 0, rotate: -3 }}
      animate={{ scale: 1, opacity: 1, rotate: 0 }}
    />
  );

  const leftSlot = showBackButton ? (
    <PaperActionButton
      onClick={onBack}
      icon={ArrowLeft}
      whileHover={{ x: -2, scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      palette={{
        borderColor: '#e5e7eb',
        bottomColor: '#d1d5db',
        background: '#ffffff',
        color: '#4b5563',
      }}
      style={{
        padding: '8px 16px',
        borderRadius: '16px',
        fontSize: isMobile ? '1.05rem' : '1.2rem',
      }}
    >
      {toMysteryLabelCase(backLabel)}
    </PaperActionButton>
  ) : null;

  return (
    <PaperPageHeader
      isMobile={isMobile}
      center={center}
      leftSlot={leftSlot}
      marginBottomMobile="20px"
      marginBottomDesktop="32px"
      gapMobile="12px"
      gapDesktop="16px"
      paddingMobile="0"
      paddingDesktop="0"
    />
  );
};

export default MysteryHeader;
