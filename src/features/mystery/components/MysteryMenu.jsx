import { motion } from 'framer-motion';
import { Sparkles, Clipboard, PawPrint, Map, Star, Camera, Pin, Paperclip } from 'lucide-react';
import { triggerHaptic } from '../../../utils/haptics';
import { toMysteryLabelCase } from '../quizGame/ui';
import { getCharacterDisplayName } from '../../../data/characterNames';

// Pushpin Component
const PushPin = ({ color = '#ef4444' }) => (
  <div style={{
    position: 'absolute',
    top: '-14px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    background: `radial-gradient(circle at 6px 6px, ${color} 30%, #991b1b 90%)`,
    boxShadow: '0 4px 6px rgba(0,0,0,0.15), inset 0 -2px 4px rgba(0,0,0,0.3)',
    zIndex: 25,
    pointerEvents: 'none',
  }}>
    {/* Metal needle point shadow */}
    <div style={{
      position: 'absolute',
      top: '14px',
      left: '8px',
      width: '2px',
      height: '8px',
      background: 'rgba(15, 23, 42, 0.45)',
      transform: 'rotate(15deg) skewX(-15deg)',
      transformOrigin: 'top center',
    }} />
  </div>
);

// Transparent Washi Tape Component
const WashiTape = ({ rotate = '-4deg', color = 'rgba(244, 114, 182, 0.35)' }) => null;

// Coffee Spilled Stain Ring
const CoffeeStain = () => (
  <div style={{
    position: 'absolute',
    width: '160px',
    height: '160px',
    borderRadius: '50%',
    border: '3px solid rgba(139, 92, 26, 0.05)',
    borderBottomColor: 'rgba(139, 92, 26, 0.09)',
    borderLeftColor: 'rgba(139, 92, 26, 0.03)',
    transform: 'rotate(42deg)',
    top: '12%',
    left: '8%',
    pointerEvents: 'none',
    zIndex: 0,
  }}>
    <div style={{
      position: 'absolute',
      width: '142px',
      height: '142px',
      borderRadius: '50%',
      border: '1.5px dashed rgba(139, 92, 26, 0.03)',
      top: '7px',
      left: '7px',
    }} />
  </div>
);

// Handwritten Memo Sticky Note
const MemoStickyNote = ({ isMobile }) => (
  <motion.div
    initial={{ scale: 0.9, rotate: -6, opacity: 0 }}
    animate={{ scale: 1, rotate: -4, opacity: 0.88 }}
    whileHover={{ rotate: -1, scale: 1.05, y: -2 }}
    style={{
      position: isMobile ? 'relative' : 'absolute',
      bottom: isMobile ? '0' : '20px',
      right: isMobile ? 'auto' : '30px',
      width: '180px',
      minHeight: '130px',
      background: 'var(--note-bg, linear-gradient(135deg, #fef9c3 0%, #fef08a 100%))',
      boxShadow: '3px 8px 20px rgba(0, 0, 0, 0.06)',
      padding: '16px',
      borderRadius: '2px',
      zIndex: 5,
      cursor: 'default',
      borderLeft: '1.5px solid var(--note-border, rgba(0,0,0,0.05))',
      borderBottom: '4.5px solid var(--note-border-bottom, transparent)',
    }}
  >
    <PushPin color="#3b82f6" />
    <p style={{
      margin: 0,
      fontFamily: 'var(--font-hand)',
      fontSize: '0.95rem',
      color: 'var(--note-text, #854d0e)',
      lineHeight: 1.4,
      paddingTop: '8px',
      textAlign: 'center',
      fontWeight: 'bold',
    }}>
      📁 Mika's detective log<br />
      <span style={{ fontSize: '0.8rem', fontWeight: 'normal', color: 'var(--note-text, #a16207)', opacity: 0.85 }}>
        * Follow instincts.<br />
        * Play every day.<br />
        * Keep it light!
      </span>
    </p>
  </motion.div>
);

const MysteryMenu = ({ isMobile, t, animalQuizCopy, onSelectView, pulledCharacter, uiLanguage = 'en' }) => {
  const menuOptions = [
    {
      view: 'gacha',
      icon: Camera,
      title: t.mystery.characterDraw,
      description: t.mystery.characterDrawDesc,
      styleType: 'polaroid',
      pinColor: '#f43f5e',
      theme: {
        background: 'var(--themed-card-bg-gacha, #ffffff)',
        border: 'var(--themed-card-border-gacha, rgba(0,0,0,0.06))',
        shadow: '0 12px 28px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.02)',
        textColor: 'var(--themed-card-text-gacha, #374151)',
      },
    },
    {
      view: 'quiz',
      icon: Clipboard,
      title: t.mystery.whoAreYou,
      description: t.mystery.whoAreYouDesc,
      styleType: 'document',
      paperclip: true,
      theme: {
        background: 'var(--themed-card-bg-quiz, #f8fafc)',
        border: 'var(--themed-card-border-quiz, #cbd5e1)',
        borderBottom: 'var(--themed-card-bottom-quiz, #94a3b8)',
        shadow: '0 8px 24px rgba(148, 163, 184, 0.08)',
        textColor: 'var(--themed-card-text-quiz, #1e293b)',
      },
    },
    {
      view: 'animalQuiz',
      icon: PawPrint,
      title: animalQuizCopy.menuTitle,
      description: animalQuizCopy.menuDescription,
      styleType: 'notebook',
      washiColor: 'rgba(52, 211, 153, 0.35)',
      theme: {
        background: 'var(--themed-card-bg-animal, #f0fdf4)',
        border: 'var(--themed-card-border-animal, #a7f3d0)',
        borderBottom: 'var(--themed-card-bottom-animal, #34d399)',
        shadow: '0 8px 24px rgba(52, 211, 153, 0.08)',
        textColor: 'var(--themed-card-text-animal, #065f46)',
      },
    },
    {
      view: 'map',
      icon: Map,
      title: t.mystery.map.title,
      description: t.mystery.map.instructions,
      styleType: 'blueprint',
      washiColor: 'rgba(167, 139, 250, 0.35)',
      theme: {
        background: 'var(--themed-card-bg-map, #faf5ff)',
        border: 'var(--themed-card-border-map, #ddd6fe)',
        borderBottom: 'var(--themed-card-bottom-map, #a78bfa)',
        shadow: '0 8px 24px rgba(167, 139, 250, 0.08)',
        textColor: 'var(--themed-card-text-map, #5b21b6)',
      },
    },
    {
      view: 'rating',
      icon: Star,
      title: t.mystery.characterRating,
      description: t.mystery.characterRatingDesc,
      styleType: 'sticker-board',
      pinColor: '#fbbf24',
      theme: {
        background: 'var(--themed-card-bg-rating, #fffbeb)',
        border: 'var(--themed-card-border-rating, #fde68a)',
        borderBottom: 'var(--themed-card-bottom-rating, #f59e0b)',
        shadow: '0 8px 24px rgba(245, 158, 11, 0.08)',
        textColor: 'var(--themed-card-text-rating, #78350f)',
      },
    },
  ];

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        padding: isMobile ? '12px 4px' : '24px 8px',
        width: '100%',
        zIndex: 1,
      }}
    >
      {/* Background spill stains */}
      {!isMobile && <CoffeeStain />}

      <div style={{ textAlign: 'center', marginBottom: isMobile ? '24px' : '44px', zIndex: 5 }}>
        <h1
          style={{
            fontFamily: 'var(--font-paper)',
            fontSize: isMobile ? '1.85rem' : '2.8rem',
            color: '#db2777',
            margin: '0 0 6px 0',
            transform: 'rotate(-0.8deg)',
            textShadow: '1px 1px 0px rgba(255,255,255,0.8)',
          }}
        >
          {toMysteryLabelCase(t.mystery.title || 'Mystery Cabin')}
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-hand)',
            fontSize: isMobile ? '1.05rem' : '1.35rem',
            color: '#6b7280',
            margin: 0,
            transform: 'rotate(0.5deg)',
          }}
        >
          {t.mystery.subtitle}
        </p>
      </div>

      {/* Grid of Corkboard Cards */}
      <div
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? '32px' : '36px',
          alignItems: 'center',
          width: '100%',
          justifyContent: 'center',
          flexWrap: 'wrap',
          zIndex: 5,
          paddingBottom: isMobile ? '40px' : '120px',
        }}
      >
        {menuOptions.map((option, index) => {
          const IconComponent = option.icon;
          const isPolaroid = option.styleType === 'polaroid';
          const isDoc = option.styleType === 'document';
          const isNotebook = option.styleType === 'notebook';
          const isBlueprint = option.styleType === 'blueprint';
          const isStickerBoard = option.styleType === 'sticker-board';

          // Random rotation for natural scrapbook look
          const randomRotation = isMobile ? 0 : (index % 2 === 0 ? -1.5 : 1.5);

          return (
            <motion.button
              key={option.view}
              onClick={() => {
                triggerHaptic('selection');
                onSelectView(option.view);
              }}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: index * 0.05, type: 'spring', stiffness: 100 }}
              whileHover={{
                scale: 1.025,
                rotate: randomRotation * 0.3,
                y: -4,
                boxShadow: '0 20px 38px rgba(0, 0, 0, 0.12)',
              }}
              whileTap={{ scale: 0.98, y: 1 }}
              style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                background: option.theme.background,
                border: isPolaroid ? '1px solid rgba(0,0,0,0.06)' : `2px solid ${option.theme.border}`,
                borderBottom: isPolaroid ? '8px solid rgba(0,0,0,0.04)' : `4.5px solid ${option.theme.borderBottom || option.theme.border}`,
                borderRadius: isPolaroid ? '4px' : isNotebook ? '24px 4px 20px 4px' : '18px',
                padding: isPolaroid 
                  ? (isMobile ? '12px 12px 24px 12px' : '16px 16px 36px 16px')
                  : (isMobile ? '24px 20px' : '28px 32px'),
                width: isMobile ? 'min(100%, 320px)' : '280px',
                minHeight: isMobile ? '220px' : '280px',
                boxShadow: option.theme.shadow,
                cursor: 'pointer',
                textAlign: 'center',
                transform: `rotate(${randomRotation}deg)`,
                gap: '12px',
              }}
              className="paper-interact"
            >
              {/* Pushpins or Washi Tape elements */}
              {option.pinColor && <PushPin color={option.pinColor} />}
              {option.washiColor && <WashiTape color={option.washiColor} rotate={index % 2 === 0 ? '-3deg' : '3deg'} />}
              
              {/* Stamped paperclip effect for Document style */}
              {option.paperclip && (
                <div style={{
                  position: 'absolute',
                  top: '-10px',
                  right: '25px',
                  zIndex: 20,
                  transform: 'rotate(15deg)',
                  opacity: 0.9,
                  pointerEvents: 'none',
                }}>
                  <Paperclip size={32} color="#64748b" strokeWidth={2.5} />
                </div>
              )}

              {/* Unique Visual Card Presentation */}
              {isPolaroid ? (
                // Polaroid Photo Draw Card
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                  {/* Photo frame */}
                  <div style={{
                    width: '100%',
                    height: isMobile ? '120px' : '140px',
                    background: pulledCharacter ? 'var(--surface-card, white)' : 'var(--surface-shell, #f3f4f6)',
                    border: '1.5px solid var(--surface-border, rgba(0,0,0,0.06))',
                    borderRadius: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    position: 'relative',
                    boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.04)',
                  }}>
                    {pulledCharacter ? (
                      <motion.img
                        initial={{ scale: 1.1, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        src={pulledCharacter.src}
                        alt={pulledCharacter.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                        }}
                      />
                    ) : (
                      <motion.div
                        animate={{ rotate: [0, -10, 10, 0] }}
                        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: 'var(--text-secondary, #9ca3af)' }}
                      >
                        <Camera size={38} strokeWidth={1.8} />
                        <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-hand)', color: 'var(--text-secondary, #9ca3af)' }}>Draw spirit!</span>
                      </motion.div>
                    )}
                  </div>
                  
                  {/* Polaroid Label */}
                  <span style={{
                    fontFamily: 'var(--font-hand)',
                    fontSize: '1.25rem',
                    color: 'var(--text-primary, #1f2937)',
                    fontWeight: 'bold',
                    marginTop: '4px',
                    letterSpacing: '-0.02em',
                  }}>
                    {pulledCharacter 
                      ? `✨ ${getCharacterDisplayName(pulledCharacter.name, uiLanguage)}`
                      : toMysteryLabelCase(option.title)
                    }
                  </span>
                </div>
              ) : (
                // Standard Scrapbook / Sketch Styled Cards
                <>
                  <div style={{
                    background: isNotebook ? 'var(--surface-card, #fff)' : isBlueprint ? 'var(--keycap-bg, #1e3a8a)' : 'transparent',
                    border: isNotebook ? '2.5px solid var(--themed-card-border-animal, #a7f3d0)' : isBlueprint ? '2px solid var(--themed-card-border-map, #60a5fa)' : 'none',
                    borderRadius: '50%',
                    width: '64px',
                    height: '64px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: isNotebook ? '0 4px 10px rgba(167, 243, 208, 0.3)' : 'none',
                    color: isBlueprint ? 'var(--keycap-color, #1d4ed8)' : option.theme.textColor,
                  }}>
                    <IconComponent size={34} strokeWidth={isBlueprint ? 2.2 : 2.5} />
                  </div>

                  <span style={{
                    fontSize: isMobile ? '1.35rem' : '1.5rem',
                    color: isBlueprint ? 'var(--themed-card-text-map, #1e3a8a)' : option.theme.textColor,
                    fontFamily: 'var(--font-paper)',
                    fontWeight: 'bold',
                  }}>
                    {toMysteryLabelCase(option.title)}
                  </span>
                  
                  <span style={{
                    color: isBlueprint ? 'var(--text-secondary, #475569)' : 'var(--text-secondary, #64748b)',
                    fontSize: isMobile ? '0.9rem' : '0.95rem',
                    fontFamily: 'var(--font-hand)',
                    lineHeight: 1.35,
                  }}>
                    {option.description}
                  </span>

                  {/* Micro Sticker stacks for Tier Maker card */}
                  {isStickerBoard && (
                    <div style={{ display: 'flex', gap: '-4px', overflow: 'visible', marginTop: 'auto', justifyContent: 'center' }}>
                      <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--pop-pink)', border: '1.5px solid white', boxShadow: '1px 2px 4px rgba(0,0,0,0.1)' }} />
                      <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--pop-yellow)', border: '1.5px solid white', boxShadow: '1px 2px 4px rgba(0,0,0,0.1)', marginLeft: '-6px' }} />
                      <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--pop-green)', border: '1.5px solid white', boxShadow: '1px 2px 4px rgba(0,0,0,0.1)', marginLeft: '-6px' }} />
                      <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--pop-blue)', border: '1.5px solid white', boxShadow: '1px 2px 4px rgba(0,0,0,0.1)', marginLeft: '-6px' }} />
                    </div>
                  )}
                </>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Decorative sticky note at desktop corner */}
      <MemoStickyNote isMobile={isMobile} />
    </div>
  );
};

export default MysteryMenu;
