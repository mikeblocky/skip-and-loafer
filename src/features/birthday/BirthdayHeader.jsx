import { Cake } from 'lucide-react';
import PaperHeadingBadge from '../../components/shared/paper/PaperHeadingBadge';
import PaperPageHeader from '../../components/shared/paper/PaperPageHeader';

const BirthdayHeader = ({ isMobile, title }) => (
  <PaperPageHeader
    isMobile={isMobile}
    center={(
      <PaperHeadingBadge
        isMobile={isMobile}
        icon={Cake}
        title={title}
        palette={{
          borderColor: '#f59e0b',
          bottomColor: '#f59e0b',
          shadow: '0 4px 15px rgba(245, 158, 11, 0.1)',
        }}
        titleColor="#f59e0b"
        iconColor="#f59e0b"
      />
    )}
    marginBottomMobile="0"
    marginBottomDesktop="0"
    gapMobile="16px"
    paddingMobile="0"
    paddingDesktop="0"
  />
);

export default BirthdayHeader;
