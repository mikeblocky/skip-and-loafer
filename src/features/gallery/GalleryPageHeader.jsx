import { Camera } from 'lucide-react';
import PaperHeadingBadge from '../../components/shared/paper/PaperHeadingBadge';
import PaperPageHeader from '../../components/shared/paper/PaperPageHeader';

const GalleryPageHeader = ({ isMobile, title }) => (
  <PaperPageHeader
    isMobile={isMobile}
    center={(
      <PaperHeadingBadge
        isMobile={isMobile}
        icon={Camera}
        title={title}
        palette={{
          borderColor: '#8b5cf6',
          bottomColor: '#8b5cf6',
          shadow: '0 8px 18px rgba(139, 92, 246, 0.1)',
        }}
        titleColor="#8b5cf6"
        iconColor="#8b5cf6"
      />
    )}
    marginBottomMobile="20px"
    marginBottomDesktop="32px"
    gapMobile="16px"
    paddingMobile="0 10px"
    paddingDesktop="0"
  />
);

export default GalleryPageHeader;
