import { RotateCcw } from 'lucide-react';
import PaperActionButton from '../../components/shared/paper/PaperActionButton';
import PaperHeadingBadge from '../../components/shared/paper/PaperHeadingBadge';
import PaperPageHeader from '../../components/shared/paper/PaperPageHeader';
import { createCommunityCounterStyle } from './communityTheme';

const CommunityPageHero = ({
  isMobile,
  title,
  icon: Icon,
  titleColors,
  countValue,
  countLabel,
  counterColors,
  actionLabel,
  actionIcon: ActionIcon,
  actionColors,
  onAction,
  resetLabel,
  onReset,
}) => {
  const center = (
    <PaperHeadingBadge
      isMobile={isMobile}
      icon={Icon}
      title={title}
      palette={titleColors}
    />
  );

  const leftSlot = !isMobile && onReset ? (
    <PaperActionButton
      onClick={onReset}
      aria-label={resetLabel}
      icon={RotateCcw}
      palette={{
        borderColor: '#cbd5e1',
        bottomColor: '#94a3b8',
        background: '#ffffff',
        color: '#475569',
      }}
      style={{
        opacity: 0.96,
      }}
    >
      {resetLabel}
    </PaperActionButton>
  ) : null;

  const rightSlot = (
    <>
      <div
        style={{
          ...createCommunityCounterStyle({
            borderColor: counterColors.borderColor,
            bottomColor: counterColors.bottomColor,
            background: '#ffffff',
            color: counterColors.color,
          }),
          minWidth: '126px',
        }}
      >
        {countValue} {countLabel}
      </div>
      <PaperActionButton
        onClick={onAction}
        icon={ActionIcon}
        palette={{
          borderColor: actionColors.borderColor,
          bottomColor: actionColors.bottomColor,
          background: '#ffffff',
          color: actionColors.color,
        }}
      >
        {actionLabel}
      </PaperActionButton>
    </>
  );

  return (
    <>
      <PaperPageHeader
        isMobile={isMobile}
        center={center}
        leftSlot={leftSlot}
        rightSlot={rightSlot}
      />

      {isMobile && onReset && (
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: '-2px' }}>
          <PaperActionButton
            onClick={onReset}
            aria-label={resetLabel}
            icon={RotateCcw}
            palette={{
              borderColor: '#cbd5e1',
              bottomColor: '#94a3b8',
              background: '#ffffff',
              color: '#475569',
            }}
            style={{
              position: 'static',
              zIndex: 1,
              opacity: 0.96,
            }}
          >
            {resetLabel}
          </PaperActionButton>
        </div>
      )}
    </>
  );
};

export default CommunityPageHero;
