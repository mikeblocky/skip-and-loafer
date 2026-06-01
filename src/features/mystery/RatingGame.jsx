import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Download, Info, Plus, Trash2, Palette, Edit3, X } from 'lucide-react';
import html2canvas from 'html2canvas';
import { triggerHaptic } from '../../utils/haptics';

const PRESET_TIER_COLORS = [
  'var(--pop-pink)',
  'var(--pop-yellow)',
  'var(--pop-green)',
  'var(--pop-blue)',
  '#fca5a5', // soft red
  '#fbcfe8', // soft pink
  '#fef3c7', // soft yellow
  '#cffafe', // soft cyan
  '#ede9fe', // soft purple
  '#f1f5f9', // ghost white
  '#dcebf7', // light blue
  '#e2e8f0', // neutral grey
];

const TAPE_COLORS = [
  '#f472b6', // pink
  '#60a5fa', // blue
  '#34d399', // green
  '#fbbf24', // yellow
  '#a78bfa', // purple
  '#fb923c', // orange
];

const StickerPortrait = ({ charName, src, isSelected, onClick, isMobile, tapeColor, isSaving }) => (
  <motion.div
    layoutId={isSaving ? undefined : charName}
    onClick={(e) => {
      if (isSaving) return;
      e.stopPropagation();
      onClick(charName);
    }}
    whileHover={isSaving ? {} : { scale: 1.05, rotate: isSelected ? 0 : (Math.random() * 4 - 2) }}
    whileTap={isSaving ? {} : { scale: 0.98 }}
    className="memo-card portrait-sticker"
    data-char-name={charName}
    style={{ 
      width: isMobile ? '64px' : '90px', 
      height: isMobile ? '64px' : '90px', 
      borderRadius: '4px', 
      padding: '4px',
      background: 'white',
      border: isSelected ? '2.5px solid var(--pop-blue)' : '1.5px solid rgba(0,0,0,0.08)',
      cursor: isSaving ? 'default' : 'pointer',
      position: 'relative',
      zIndex: isSelected ? 50 : 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: isSelected 
        ? '0 12px 24px rgba(0,0,0,0.2)' 
        : '2px 4px 12px rgba(0,0,0,0.1)',
      transform: 'none',
    }}
  >
    {/* Colorful Flat Tape effect */}
    <div className="sticker-tape" style={{
      position: 'absolute',
      top: '-10px',
      left: '50%',
      transform: 'translateX(-50%) rotate(-3deg)',
      width: '50%',
      height: '18px',
      background: tapeColor,
      opacity: 1,
      boxShadow: '0 1.5px 3px rgba(0,0,0,0.15)',
      zIndex: 2,
      pointerEvents: 'none',
      border: '1px solid rgba(0,0,0,0.05)'
    }} />
    
    <div className="sticker-image-container" style={{ 
      width: '100%', 
      height: '100%', 
      borderRadius: '2px', 
      overflow: 'hidden',
      position: 'relative',
      background: '#fff',
      // Using background-image approach as the PRIMARY method because it's the most stable for html2canvas aspect ratios
      backgroundImage: `url(${src})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      {/* 
         Hidden img tag ensures the browser loads the asset at full quality 
         and html2canvas can access it in its cache.
      */}
      <img 
        src={src} 
        alt="" 
        style={{ opacity: 0, position: 'absolute', width: '1px', height: '1px' }} 
        crossOrigin="anonymous" 
      />
    </div>
  </motion.div>
);

const RatingGame = ({ isMobile, portraitData, t }) => {
  const boardRef = useRef(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(null);
  const [boardTitle, setBoardTitle] = useState(t.mystery.rating.title);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  
  const [tiers, setTiers] = useState([
    { id: 'S', label: 'S', color: 'var(--pop-pink)', characters: [] },
    { id: 'A', label: 'A', color: 'var(--pop-yellow)', characters: [] },
    { id: 'B', label: 'B', color: 'var(--pop-green)', characters: [] },
    { id: 'C', label: 'C', color: 'var(--pop-blue)', characters: [] },
    { id: 'D', label: 'D', color: '#dcebf7', characters: [] },
    { id: 'E', label: 'E', color: '#f8fafc', characters: [] },
    { id: 'F', label: 'F', color: '#e2e8f0', characters: [] },
  ]);

  const [pool, setPool] = useState(portraitData.map(p => p.name));
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [editingTierId, setEditingTierId] = useState(null);

  const characterTapeColors = useMemo(() => {
    const colors = {};
    portraitData.forEach((p, i) => {
      colors[p.name] = TAPE_COLORS[i % TAPE_COLORS.length];
    });
    return colors;
  }, [portraitData]);

  const handleCharacterClick = (name) => {
    if (isSaving) return;
    triggerHaptic('selection');
    setSelectedCharacter(selectedCharacter === name ? null : name);
  };

  const handleTierClick = (tierId) => {
    if (!selectedCharacter || isSaving) return;
    triggerHaptic('impactLight');

    const newPool = pool.filter(n => n !== selectedCharacter);
    const newTiers = tiers.map(tier => ({
      ...tier,
      characters: tier.characters.filter(n => n !== selectedCharacter)
    }));

    const targetTierIndex = newTiers.findIndex(t => t.id === tierId);
    newTiers[targetTierIndex].characters.push(selectedCharacter);

    setPool(newPool);
    setTiers(newTiers);
    setSelectedCharacter(null);
  };

  const handlePoolClick = () => {
    if (!selectedCharacter || isSaving) return;
    triggerHaptic('impactLight');

    const newTiers = tiers.map(tier => ({
      ...tier,
      characters: tier.characters.filter(n => n !== selectedCharacter)
    }));

    if (!pool.includes(selectedCharacter)) {
      setPool([...pool, selectedCharacter]);
    }

    setTiers(newTiers);
    setSelectedCharacter(null);
  };

  const handleReset = () => {
    if (isSaving) return;
    triggerHaptic('notificationSuccess');
    setTiers(tiers.map(t => ({ ...t, characters: [] })));
    setPool(portraitData.map(p => p.name));
    setSelectedCharacter(null);
  };

  const handleAddRow = (index) => {
    triggerHaptic('selection');
    const newTier = {
      id: Math.random().toString(36).substr(2, 9),
      label: 'NEW',
      color: '#f1f5f9',
      characters: []
    };
    const newTiers = [...tiers];
    newTiers.splice(index + 1, 0, newTier);
    setTiers(newTiers);
  };

  const handleRemoveRow = (id) => {
    triggerHaptic('impactLight');
    const tierToRemove = tiers.find(t => t.id === id);
    if (tierToRemove.characters.length > 0) {
      setPool([...pool, ...tierToRemove.characters]);
    }
    setTiers(tiers.filter(t => t.id !== id));
  };

  const handleChangeColor = (id, color) => {
    triggerHaptic('selection');
    setTiers(tiers.map(t => t.id === id ? { ...t, color } : t));
    setShowColorPicker(null);
  };

  const handleSaveImage = async () => {
    if (!boardRef.current || isSaving) return;
    
    setIsSaving(true);
    triggerHaptic('selection');
    
    // Pro trick: Wait for layout to settle
    setTimeout(async () => {
      try {
        const canvas = await html2canvas(boardRef.current, {
          backgroundColor: '#ffffff',
          scale: 3, 
          useCORS: true,
          allowTaint: true,
          logging: false,
          imageTimeout: 15000,
          onclone: (clonedDoc) => {
            const board = clonedDoc.querySelector('.tier-list-container');
            if (board) {
              // Reset rotations and complex styles for the capture
              board.style.borderRadius = '24px';
              board.style.transform = 'none';
              board.style.padding = '60px 40px';
              board.style.maxWidth = 'none';
              
              // Force stickers to be PERFECTLY square in the clone
              clonedDoc.querySelectorAll('.portrait-sticker').forEach(sticker => {
                sticker.style.width = '120px';
                sticker.style.height = '120px';
                sticker.style.transform = 'none';
                sticker.style.boxShadow = 'none';
              });
              
              // Remove tape shadows and artifacts
              clonedDoc.querySelectorAll('.sticker-tape').forEach(tape => {
                tape.style.boxShadow = 'none';
                tape.style.filter = 'none';
                // Remove any pseudo-elements that might cause grey artifacts
                const style = clonedDoc.createElement('style');
                style.innerHTML = '.sticker-tape::before, .sticker-tape::after { display: none !important; }';
                clonedDoc.head.appendChild(style);
              });
              
              // Ensure images inside containers are also perfect
              clonedDoc.querySelectorAll('.sticker-image-container').forEach(imgContainer => {
                imgContainer.style.width = '100%';
                imgContainer.style.height = '100%';
              });
            }
          }
        });
        
        const link = document.createElement('a');
        link.download = `${boardTitle.toLowerCase().replace(/\s+/g, '-')}.png`;
        link.href = canvas.toDataURL('image/png', 1.0);
        link.click();
        triggerHaptic('notificationSuccess');
      } catch (error) {
        console.error('Failed to save image:', error);
      } finally {
        setIsSaving(false);
      }
    }, 600);
  };

  const updateTierLabel = (id, newLabel) => {
    setTiers(tiers.map(t => t.id === id ? { ...t, label: newLabel } : t));
  };

  const characterMap = useMemo(() => {
    const map = {};
    portraitData.forEach(p => {
      map[p.name] = p;
    });
    return map;
  }, [portraitData]);

  return (
    <div className="rating-game mystery-ui" style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: isMobile ? '0 8px' : '0 24px', flex: 1 }}>
      
      {!isSaving && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'flex-start', 
          gap: '12px', 
          background: 'rgba(255,255,255,0.7)', 
          padding: '14px 18px', 
          borderRadius: '20px', 
          border: '2.5px dashed var(--line-blue)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
        }}>
          <Info size={20} color="var(--pop-blue)" style={{ marginTop: '2px', flexShrink: 0 }} />
          <p style={{ margin: 0, fontSize: '0.95rem', color: '#4b5563', lineHeight: 1.5, fontFamily: 'var(--font-paper)' }}>
            {t.mystery.rating.instructions} Click titles to rename or the palette to change colors!
          </p>
        </div>
      )}

      <div 
        ref={boardRef}
        className="tier-list-container sketchbook-border" 
        style={{ 
          background: 'var(--planner-page-background-image)', 
          backgroundSize: '100% 32px',
          padding: isSaving ? '60px 40px' : '16px', 
          borderRadius: isSaving ? '24px' : '16px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '10px',
          boxShadow: isSaving ? 'none' : 'inset 0 2px 10px rgba(0,0,0,0.05), 0 10px 30px rgba(0,0,0,0.08)',
          border: isSaving ? '2.5px solid rgba(0,0,0,0.08)' : '1px solid rgba(0,0,0,0.1)',
          transform: 'none',
          maxWidth: '1100px',
          alignSelf: 'center',
          width: '100%',
          overflow: 'visible'
        }}
      >
        {/* Editable Main Title */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          marginBottom: isSaving ? '40px' : '16px',
        }}>
          {!isSaving && isEditingTitle ? (
            <input
              autoFocus
              value={boardTitle}
              onChange={(e) => setBoardTitle(e.target.value)}
              onBlur={() => setIsEditingTitle(false)}
              onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
              style={{ 
                fontFamily: 'var(--font-paper)', 
                fontSize: isMobile ? '1.6rem' : '2.4rem', 
                textAlign: 'center', 
                background: 'rgba(255,255,255,0.8)', 
                border: 'none', 
                borderBottom: '3px dashed var(--pop-blue)', 
                color: '#374151',
                outline: 'none',
                width: '100%',
                maxWidth: '600px',
                borderRadius: '8px',
                padding: '4px 12px'
              }}
            />
          ) : (
            <h2 
              onClick={() => !isSaving && setIsEditingTitle(true)}
              style={{ 
                textAlign: 'center', 
                fontFamily: 'var(--font-paper)', 
                color: '#374151', 
                margin: 0,
                fontSize: isMobile ? '1.6rem' : (isSaving ? '3rem' : '2.2rem'),
                cursor: isSaving ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '6px 24px',
                borderRadius: '12px',
                background: isSaving ? 'transparent' : 'rgba(255,255,255,0.3)',
                transition: 'background 0.2s ease'
              }}
            >
              {boardTitle}
              {!isSaving && <Edit3 size={18} color="var(--pop-blue)" />}
            </h2>
          )}
        </div>

        {tiers.map((tier, idx) => (
          <div key={tier.id} style={{ 
            display: 'flex', 
            minHeight: isMobile ? '92px' : '120px', 
            background: 'rgba(255,255,255,0.92)', 
            borderRadius: '16px', 
            border: '1.5px solid rgba(0,0,0,0.06)',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
            position: 'relative',
            zIndex: showColorPicker === tier.id ? 100 : 1
          }}>
            <div 
              style={{ 
                width: isMobile ? '84px' : '130px', 
                background: tier.color, 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center', 
                justifyContent: 'center', 
                color: '#374151', 
                fontWeight: 'bold', 
                fontSize: isMobile ? '1.4rem' : '1.9rem',
                cursor: isSaving ? 'default' : 'pointer',
                textAlign: 'center',
                padding: '8px',
                wordBreak: 'break-word',
                borderRight: '4px solid rgba(0,0,0,0.05)',
                fontFamily: 'var(--font-paper)',
                position: 'relative',
                borderRadius: '16px 0 0 16px'
              }}
              onClick={() => !isSaving && setEditingTierId(tier.id)}
            >
              {!isSaving && editingTierId === tier.id ? (
                <input
                  autoFocus
                  value={tier.label}
                  onChange={(e) => updateTierLabel(tier.id, e.target.value)}
                  onBlur={() => setEditingTierId(null)}
                  onKeyDown={(e) => e.key === 'Enter' && setEditingTierId(null)}
                  style={{ width: '100%', background: 'white', border: 'none', textAlign: 'center', fontWeight: 'bold', fontSize: 'inherit', color: 'inherit', outline: 'none', borderRadius: '4px' }}
                />
              ) : (
                tier.label
              )}

              {/* Row Controls */}
              {!isSaving && (
                <div style={{ 
                  position: 'absolute', 
                  bottom: '8px', 
                  left: '4px', 
                  right: '4px', 
                  display: 'flex', 
                  justifyContent: 'center', 
                  gap: '8px'
                }}>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleAddRow(idx); }}
                    style={{ background: 'white', borderRadius: '50%', border: '1.5px solid #cbd5e1', padding: '4px', cursor: 'pointer', color: '#4b5563', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', display: 'flex' }}
                  >
                    <Plus size={12} strokeWidth={3} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setShowColorPicker(showColorPicker === tier.id ? null : tier.id); }}
                    style={{ background: 'white', borderRadius: '50%', border: '1.5px solid #cbd5e1', padding: '4px', cursor: 'pointer', color: '#4b5563', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', display: 'flex' }}
                  >
                    <Palette size={12} strokeWidth={3} />
                  </button>
                  {tiers.length > 1 && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleRemoveRow(tier.id); }}
                      style={{ background: 'white', borderRadius: '50%', border: '1.5px solid #fecaca', padding: '4px', cursor: 'pointer', color: '#ef4444', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', display: 'flex' }}
                    >
                      <Trash2 size={12} strokeWidth={3} />
                    </button>
                  )}
                </div>
              )}

              {/* Color Picker Overlay - POP OUT */}
              {!isSaving && showColorPicker === tier.id && (
                <div style={{ 
                  position: 'absolute', 
                  top: '10%', 
                  left: '115%', 
                  zIndex: 200, 
                  background: 'white', 
                  padding: '16px', 
                  borderRadius: '24px', 
                  boxShadow: '0 15px 45px rgba(0,0,0,0.25)',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '12px',
                  width: '200px',
                  border: '2.5px solid var(--pop-blue)'
                }}>
                  {PRESET_TIER_COLORS.map(c => (
                    <button 
                      key={c}
                      onClick={(e) => { e.stopPropagation(); handleChangeColor(tier.id, c); }}
                      style={{ 
                        width: '36px', 
                        height: '36px', 
                        borderRadius: '10px', 
                        background: c, 
                        border: '2px solid rgba(0,0,0,0.08)',
                        cursor: 'pointer',
                        transition: 'transform 0.1s ease'
                      }}
                      onMouseEnter={(e) => e.target.style.transform = 'scale(1.2)'}
                      onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                    />
                  ))}
                  <button 
                    onClick={(e) => { e.stopPropagation(); setShowColorPicker(null); }}
                    style={{ width: '100%', marginTop: '8px', fontSize: '0.9rem', fontWeight: 'bold', color: '#64748b', background: '#f1f5f9', border: 'none', borderRadius: '10px', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <X size={16} /> Close
                  </button>
                </div>
              )}
            </div>
            <div 
              onClick={() => handleTierClick(tier.id)}
              style={{ 
                flex: 1, 
                padding: '16px', 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '20px', 
                cursor: selectedCharacter && !isSaving ? 'pointer' : 'default',
                background: selectedCharacter && !isSaving ? 'rgba(143, 211, 255, 0.12)' : 'transparent',
                transition: 'background 0.2s ease'
              }}
            >
              <AnimatePresence>
                {tier.characters.map((charName) => (
                  <StickerPortrait
                    key={charName}
                    charName={charName}
                    src={characterMap[charName].src}
                    isSelected={selectedCharacter === charName}
                    onClick={handleCharacterClick}
                    isMobile={isMobile}
                    tapeColor={characterTapeColors[charName]}
                    isSaving={isSaving}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        ))}
        
        {isSaving && (
          <p style={{ 
            textAlign: 'right', 
            fontSize: '1.1rem', 
            color: '#4b5563', 
            marginTop: '40px',
            fontFamily: 'var(--font-hand)',
            opacity: 0.8
          }}>
            skip-and-loafer.vercel.app
          </p>
        )}
      </div>

      {!isSaving && (
        <div className="pool-container" style={{ marginTop: '12px' }}>
          <h3 style={{ fontSize: '1.5rem', color: '#374151', marginBottom: '20px', fontFamily: 'var(--font-paper)', paddingLeft: '8px' }}>
            {t.mystery.rating.unranked}
          </h3>
          <div 
            onClick={handlePoolClick}
            style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '22px', 
              background: 'rgba(255,255,255,0.6)', 
              padding: '32px', 
              borderRadius: '32px', 
              minHeight: '200px',
              border: '2.5px dashed var(--line-blue)',
              cursor: selectedCharacter ? 'pointer' : 'default',
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
            }}
          >
            <AnimatePresence>
              {pool.map((charName) => (
                <StickerPortrait
                  key={charName}
                  charName={charName}
                  src={characterMap[charName].src}
                  isSelected={selectedCharacter === charName}
                  onClick={handleCharacterClick}
                  isMobile={isMobile}
                  tapeColor={characterTapeColors[charName]}
                  isSaving={isSaving}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {!isSaving && (
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '12px', paddingBottom: '32px' }}>
          <motion.button
            whileHover={{ scale: 1.015, y: -1.5 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleReset}
            className="sketchbook-border paper-interact"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '16px 32px',
              background: '#fff',
              border: '2.5px solid #fecaca',
              borderRadius: '18px',
              color: '#ef4444',
              fontWeight: 'bold',
              fontSize: '1.2rem',
              cursor: 'pointer',
              fontFamily: 'var(--font-paper)'
            }}
          >
            <RotateCcw size={24} />
            {t.mystery.rating.reset}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.015, y: -1.5 }}
            whileTap={{ scale: 0.98 }}
            disabled={isSaving}
            onClick={handleSaveImage}
            className="sketchbook-border paper-interact"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '16px 32px',
              background: '#fff',
              border: '2.5px solid var(--pop-blue)',
              borderRadius: '18px',
              color: '#2563eb',
              fontWeight: 'bold',
              fontSize: '1.2rem',
              cursor: 'pointer',
              fontFamily: 'var(--font-paper)'
            }}
          >
            <Download size={24} />
            {isSaving ? 'Processing...' : t.mystery.rating.save}
          </motion.button>
        </div>
      )}
    </div>
  );
};

export default RatingGame;
