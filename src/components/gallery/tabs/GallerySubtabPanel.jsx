import { motion } from 'framer-motion';
import { ImageOff } from 'lucide-react';
import { TAB_PANEL_INITIAL, getTabPanelAnimate, TRANSITION_FAST } from '../../shared/animationPresets';

const GallerySubtabPanel = ({
  tab,
  tabIndex,
  activeTab,
  isMobile,
  selectedImage,
  images,
  t,
  setSelectedImage,
  markLoaded,
  GalleryThumbComponent,
}) => {
  const isActive = tabIndex === activeTab;

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
        overflowY: isMobile ? 'visible' : 'auto',
        maxHeight: isMobile ? 'none' : 'min(550px, calc(100vh - 280px))',
        padding: isMobile ? '8px 6px 20px' : '10px 8px 24px',
        overflowAnchor: 'none',
      }}
    >
      {images.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', gap: '16px' }}>
          <ImageOff size={48} style={{ color: '#d1d5db' }} />
          <span style={{ fontFamily: 'var(--font-hand)', fontSize: '1.1rem', color: '#9ca3af', fontWeight: 'bold' }}>{t.noImages}</span>
        </div>
      ) : (
        <div className="columns-2 md:columns-3 lg:columns-4 gap-5 space-y-5" style={{ overflowAnchor: 'none' }}>
          {images.map((src, index) => {
            const isSelected = isActive && src === selectedImage;
            return (
              <GalleryThumbComponent
                key={src}
                src={src}
                index={index}
                onLoaded={markLoaded}
                selectedBorderColor={isSelected ? tab.color : null}
                artAltLabel={t.artAlt}
                onClick={() => {
                  if (!isActive) return;
                  setSelectedImage(src);
                }}
              />
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default GallerySubtabPanel;
