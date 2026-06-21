import { memo, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ImageOff } from 'lucide-react';
import PaperLoadingState from '../../../components/shared/paper/PaperLoadingState';
import useProgressiveGalleryFeed from '../hooks/useProgressiveGalleryFeed';
import { getGalleryMediaKind } from '../galleryMedia';

const KIND_ORDER = ['video', 'gif', 'image'];

const GallerySubtabPanel = ({
  tab,
  tabIndex,
  activeTab,
  isMobile,
  selectedImage,
  images,
  isLoading,
  t,
  onSelectImage,
  markLoaded,
  GalleryThumbComponent,
}) => {
  const isActive = tabIndex === activeTab;

  const availableKinds = useMemo(() => {
    const present = new Set(images.map(getGalleryMediaKind));
    return KIND_ORDER.filter((kind) => present.has(kind));
  }, [images]);
  const showFilter = availableKinds.length > 1;

  const [activeKind, setActiveKind] = useState('all');
  const effectiveKind = showFilter ? activeKind : 'all';

  const filteredImages = useMemo(
    () => (effectiveKind === 'all' ? images : images.filter((src) => getGalleryMediaKind(src) === effectiveKind)),
    [images, effectiveKind],
  );

  const filterChips = useMemo(() => {
    const labels = {
      all: t.filterAll || 'All',
      video: t.filterVideos || 'Videos',
      gif: t.filterGifs || 'GIFs',
      image: t.filterImages || 'Images',
    };
    return ['all', ...availableKinds].map((kind) => ({ kind, label: labels[kind] }));
  }, [availableKinds, t]);

  const {
    sentinelRef,
    visibleImages,
    visibleCount,
    totalCount,
    hasMore,
    remainingCount,
  } = useProgressiveGalleryFeed(filteredImages, isActive, isMobile);

  return (
    <motion.div
      key={tab.id}
      initial={{ opacity: 0, y: 8 }}
      animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 4 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="hide-scrollbar"
      style={{
        display: isActive ? 'block' : 'none',
        flex: 1,
        overflowY: 'visible',
        padding: isMobile ? '8px 6px 20px' : '10px 8px 24px',
        overflowAnchor: 'none',
      }}
    >
      {isLoading ? (
        <PaperLoadingState
          isMobile={isMobile}
          label={t.loading || 'Loading artwork...'}
          containerStyle={{ padding: isMobile ? '52px 12px' : '72px 16px' }}
          cardStyle={{
            borderColor: `${tab.color}55`,
            borderBottomColor: tab.color,
            background: '#ffffff',
            boxShadow: `0 16px 30px ${tab.color}1a`,
          }}
          shimmerWidth={isMobile ? '48%' : '38%'}
          skeletonLines={['100%', '88%', '92%']}
          labelStyle={{ color: '#475569' }}
        />
      ) : images.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', gap: '16px' }}>
          <ImageOff size={48} style={{ color: '#d1d5db' }} />
          <span style={{ fontFamily: 'var(--font-hand)', fontSize: '1.1rem', color: '#9ca3af', fontWeight: 'bold' }}>{t.noImages}</span>
        </div>
      ) : (
        <>
          {showFilter && (
            <div
              className="hide-scrollbar"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flexWrap: isMobile ? 'nowrap' : 'wrap',
                overflowX: isMobile ? 'auto' : 'visible',
                padding: isMobile ? '0 2px 12px' : '0 4px 16px',
              }}
            >
              {filterChips.map(({ kind, label }) => {
                const isChipActive = activeKind === kind;
                return (
                  <motion.button
                    key={kind}
                    type="button"
                    onClick={() => setActiveKind(kind)}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      flexShrink: 0,
                      padding: '6px 14px',
                      borderRadius: '999px',
                      border: `2px solid ${tab.color}${isChipActive ? '' : '40'}`,
                      borderBottom: isChipActive ? `4px solid ${tab.color}` : `2px solid ${tab.color}40`,
                      background: isChipActive ? `${tab.color}1a` : '#ffffff',
                      color: tab.color,
                      fontFamily: 'var(--font-main)',
                      fontSize: isMobile ? '0.82rem' : '0.88rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {label}
                  </motion.button>
                );
              })}
            </div>
          )}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(2, minmax(0, 1fr))' : 'repeat(auto-fill, minmax(210px, 1fr))',
              gap: isMobile ? '12px' : '20px',
              width: '100%',
              minWidth: 0,
              overflowAnchor: 'none' 
            }}
          >
          {visibleImages.map((src, index) => {
            const isSelected = isActive && src === selectedImage;
            return (
              <GalleryThumbComponent
                key={src}
                src={src}
                index={index}
              onLoaded={markLoaded}
              selectedBorderColor={isSelected ? tab.color : null}
              artAltLabel={t.artAlt}
              onSelect={onSelectImage}
              canSelect={isActive}
              isMobile={isMobile}
              />
            );
          })}
          </div>

          <div
            ref={hasMore ? sentinelRef : undefined}
            style={{
              display: 'grid',
              gap: '10px',
              justifyItems: 'center',
              padding: isMobile ? '18px 8px 8px' : '24px 12px 12px',
              color: '#64748b',
              textAlign: 'center',
            }}
          >
            <div
              className="sketchbook-border"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: '#ffffff',
                border: `3px solid ${tab.color}44`,
                borderBottom: `7px solid ${tab.color}`,
                borderRadius: '999px',
                padding: isMobile ? '10px 14px' : '12px 16px',
                fontFamily: 'var(--font-main)',
                fontSize: isMobile ? '0.84rem' : '0.9rem',
                fontWeight: 800,
                lineHeight: 1.2,
              }}
            >
              {hasMore
                ? `${visibleCount} / ${totalCount} loaded`
                : `${totalCount} loaded`}
            </div>

            {hasMore && (
              <div
                style={{
                  fontFamily: 'var(--font-hand)',
                  fontSize: isMobile ? '0.98rem' : '1rem',
                  color: '#94a3b8',
                }}
              >
                Loading {Math.min(remainingCount, isMobile ? 12 : 24)} more artwork...
              </div>
            )}
          </div>
        </>
      )}
    </motion.div>
  );
};

const areEqual = (previous, next) => {
  const previousActive = previous.tabIndex === previous.activeTab;
  const nextActive = next.tabIndex === next.activeTab;

  if (previousActive !== nextActive) return false;
  if (previous.tab !== next.tab) return false;
  if (previous.isMobile !== next.isMobile) return false;
  if (previous.images !== next.images) return false;
  if (previous.isLoading !== next.isLoading) return false;
  if (previous.t !== next.t) return false;
  if (previous.markLoaded !== next.markLoaded) return false;
  if (previous.GalleryThumbComponent !== next.GalleryThumbComponent) return false;
  if (previous.onSelectImage !== next.onSelectImage) return false;
  if (nextActive && previous.selectedImage !== next.selectedImage) return false;

  return true;
};

export default memo(GallerySubtabPanel, areEqual);
