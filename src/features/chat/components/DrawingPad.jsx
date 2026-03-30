import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Pencil, Eraser, Undo, Redo, PaintBucket, Trash2, X, Download, Check, CornerUpLeft } from 'lucide-react';
import { DRAWING_COLORS, CHAT_FONT_FAMILY, BUTTON_STYLE } from '../chatConstants';

export function DrawingPad({
  canvasRef,
  isMobile,
  brushSize,
  color,
  mode,
  palette,
  onBrushSizeChange,
  onColorChange,
  onModeChange,
  onUndo,
  onRedo,
  onFill,
  onClear,
  onDownload,
  onSave,
  onClose,
  copy
}) {
  const [clearTapCount, setClearTapCount] = useState(0);
  const isEraser = mode === 'eraser';

  useEffect(() => {
    let timer;
    if (clearTapCount > 0) {
      timer = setTimeout(() => setClearTapCount(0), 1800);
    }
    return () => clearTimeout(timer);
  }, [clearTapCount]);

  const handleClearRequest = () => {
    if (clearTapCount >= 2) {
      onClear();
      setClearTapCount(0);
    } else {
      setClearTapCount(prev => prev + 1);
    }
  };

  const handleFill = () => {
    if (window.confirm('Fill the entire canvas with the current color?')) {
      onFill();
    }
  };

  const ToolButton = ({ active, onClick, icon: Icon, title, color }) => (
    <button
      type="button"
      onClick={onClick}
      style={{
        ...BUTTON_STYLE,
        width: isMobile ? '48px' : '44px',
        height: isMobile ? '48px' : '44px',
        padding: 0,
        background: active ? '#ffffff' : '#f8fafc',
        color: active ? color : '#64748b',
        borderColor: active ? color : '#e2e8f0',
        borderBottomWidth: isMobile ? '5px' : '5px',
        borderRadius: '12px',
        transform: active ? 'scale(1.05)' : 'scale(1)',
        transition: 'all 0.16s cubic-bezier(0.17, 0.67, 0.83, 0.67)',
        boxShadow: active ? `0 8px 18px ${color}22` : 'none',
        flexShrink: 0
      }}
      title={title}
    >
      <Icon size={isMobile ? 24 : 21} strokeWidth={active ? 3 : 2} />
    </button>
  );

  const ToolSection = (
    <div style={{ 
      display: 'flex', 
      flexDirection: isMobile ? 'row' : 'column', 
      gap: isMobile ? '8px' : '12px',
      alignItems: 'center',
      justifyContent: 'center',
      padding: isMobile ? '0' : '6px 0',
      background: 'transparent',
      borderRadius: '16px',
      border: 'none',
      minWidth: isMobile ? 'auto' : '60px'
    }}>
      <div style={{ display: 'flex', flexDirection: isMobile ? 'row' : 'column', gap: '8px' }}>
        <ToolButton active={mode === 'brush' && !isEraser} onClick={() => onModeChange('brush')} icon={Pencil} title="Brush" color="#f97316" />
        <ToolButton active={isEraser} onClick={() => onModeChange('eraser')} icon={Eraser} title="Eraser" color="#64748b" />
        <ToolButton active={false} onClick={handleFill} icon={PaintBucket} title="Fill" color="#3b82f6" />
      </div>
      <div style={{ width: isMobile ? '2px' : '36px', height: isMobile ? '36px' : '2px', background: '#e2e8f0' }} />
      <div style={{ display: 'flex', flexDirection: isMobile ? 'row' : 'column', gap: '8px' }}>
        <ToolButton active={false} onClick={onUndo} icon={Undo} title="Undo" color="#475569" />
        <ToolButton active={false} onClick={onRedo} icon={Redo} title="Redo" color="#475569" />
      </div>
    </div>
  );

  const ColorSection = (
    <div style={{ 
      display: 'flex', 
      flexDirection: isMobile ? 'row' : 'column', 
      flexWrap: isMobile ? 'wrap' : 'nowrap',
      gap: isMobile ? '6px' : '10px',
      justifyContent: 'center',
      alignItems: 'center',
      padding: isMobile ? '4px 0' : '6px 0',
      minWidth: isMobile ? '100%' : '56px'
    }}>
      {DRAWING_COLORS.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onColorChange(c)}
          style={{
            width: isMobile ? '42px' : '40px',
            height: isMobile ? '42px' : '40px',
            borderRadius: '999px',
            background: c,
            border: color === c ? '3.5px solid #0f172a' : '2px solid #e2e8f0',
            cursor: 'pointer',
            transition: 'transform 160ms cubic-bezier(0.17, 0.67, 0.83, 0.67)',
            transform: color === c ? 'scale(1.18)' : 'scale(1)',
            boxShadow: color === c ? '0 8px 18px rgba(0,0,0,0.15)' : 'none',
          }}
        />
      ))}
    </div>
  );

  const SliderInner = (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'min-content 1fr min-content', 
      alignItems: 'center', 
      gap: '12px',
      width: '100%',
      padding: '0 4px'
    }}>
      <span style={{ fontSize: '0.86rem', color: '#64748b', fontFamily: CHAT_FONT_FAMILY, fontWeight: 400, minWidth: '18px' }}>{brushSize}</span>
      <input
        type="range"
        min="0.5"
        max="100"
        step="0.5"
        value={brushSize}
        onChange={(event) => onBrushSizeChange(Number(event.target.value))}
        style={{ 
          width: '100%', 
          accentColor: palette?.border || '#0f172a',
          height: isMobile ? '18px' : '12px',
          borderRadius: '999px',
          cursor: 'pointer',
          appearance: 'auto'
        }}
      />
      <span style={{ fontSize: '0.86rem', color: '#94a3b8', fontFamily: CHAT_FONT_FAMILY }}>100</span>
    </div>
  );

  return (
    <motion.div
      data-no-tab-swipe="1"
      initial={{ opacity: 0, scale: 0.98, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: isMobile ? '10px' : '24px',
        padding: isMobile ? '8px 10px 8px' : '20px',
        background: '#ffffff',
        border: isMobile ? 'none' : '2.5px solid #e2e8f0',
        borderBottom: isMobile ? 'none' : `10px solid ${palette?.border || '#cbd5e1'}`,
        borderRadius: isMobile ? '0' : '32px',
        boxShadow: isMobile ? 'none' : '0 24px 64px rgba(15, 23, 42, 0.22)',
        zIndex: 100,
        position: 'relative',
        width: '100%',
        maxWidth: '100%',
        minHeight: isMobile ? '100%' : 'calc(100vh - 140px)',
        height: isMobile ? '100%' : 'calc(100vh - 140px)',
        maxHeight: isMobile ? '100%' : 'calc(100vh - 140px)',
        overflow: 'hidden',
        touchAction: isMobile ? 'pan-x pan-y pinch-zoom' : 'none'
      }}
      className="hide-scrollbar"
    >
      {/* Header Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto minmax(0, 1fr)', alignItems: 'center', width: '100%', gap: '12px', paddingTop: isMobile ? '10px' : '0' }}>
        <div style={{ justifySelf: 'start' }}>
          <motion.button
            type="button"
            onClick={handleClearRequest}
            whileTap={{ scale: 0.95 }}
            style={{
              ...BUTTON_STYLE,
              height: isMobile ? '48px' : '46px',
              padding: isMobile ? '0 14px' : '0 20px',
              background: clearTapCount > 0 ? '#e11d48' : '#fff1f2',
              color: clearTapCount > 0 ? '#ffffff' : '#e11d48',
              borderColor: clearTapCount > 0 ? '#be123c' : '#fecaca',
              borderBottomWidth: isMobile ? '6px' : '6px',
              fontFamily: CHAT_FONT_FAMILY,
              fontSize: isMobile ? '0.84rem' : '1rem',
              fontWeight: 400,
              borderRadius: '14px',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <Trash2 size={18} />
            {isMobile ? "" : (clearTapCount === 0 ? "Clear" : `Tap ${3 - clearTapCount}x`)}
          </motion.button>
        </div>

        <motion.button
          type="button"
          onClick={() => {
            if (canvasRef?.current && onSave) {
              onSave(canvasRef.current.toDataURL('image/png'));
            } else {
              onClose();
            }
          }}
          whileTap={{ scale: 0.95 }}
          style={{
            ...BUTTON_STYLE,
            height: isMobile ? '48px' : '46px',
            padding: isMobile ? '0 20px' : '0 28px',
            background: '#ecfdf5',
            color: '#059669',
            borderColor: '#6ee7b7',
            borderBottomWidth: isMobile ? '6px' : '6px',
            fontFamily: CHAT_FONT_FAMILY,
            fontSize: isMobile ? '0.84rem' : '1rem',
            fontWeight: 400,
            borderRadius: isMobile ? '12px' : '16px',
          }}
        >
          <Check size={20} />
          {isMobile ? "Done!" : "I'm done!"}
        </motion.button>

        <div style={{ display: 'flex', gap: isMobile ? '10px' : '14px', justifySelf: 'end' }}>
          <button
            type="button"
            onClick={onDownload}
            style={{
              ...BUTTON_STYLE,
              width: isMobile ? '44px' : '46px',
              height: isMobile ? '44px' : '46px',
              padding: 0,
              background: '#f0fdf4',
              color: '#16a34a',
              borderColor: '#bbf7d0',
              borderBottomWidth: isMobile ? '5px' : '6px',
              borderRadius: '10px'
            }}
          >
            <Download size={isMobile ? 20 : 22} />
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{
              ...BUTTON_STYLE,
              width: isMobile ? '44px' : '46px',
              height: isMobile ? '44px' : '46px',
              padding: 0,
              background: '#f8fafc',
              color: '#64748b',
              borderColor: '#e2e8f0',
              borderBottomWidth: isMobile ? '5px' : '6px',
              borderRadius: '10px'
            }}
          >
            <X size={isMobile ? 20 : 22} />
          </button>
        </div>
      </div>

      {isMobile && (
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: '26px' }}>
            {ToolSection}
          </div>
        </div>
      )}

      {/* Main Drawing Area Wrapper */}
      <div style={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'center' : 'stretch',
        justifyContent: isMobile ? 'flex-start' : 'center',
        gap: isMobile ? '18px' : '24px',
        flex: isMobile ? '0 0 auto' : 1,
        width: '100%',
        minHeight: 0,
        paddingTop: isMobile ? '18px' : '0'
      }}>
        {!isMobile && ToolSection}
        
        <div style={{ 
          display: 'flex',
          alignItems: isMobile ? 'center' : 'stretch',
          justifyContent: 'center',
          width: '100%',
          flex: isMobile ? '0 0 auto' : 1,
          padding: isMobile ? '0' : '2px',
          minHeight: 0
        }}>
        <div style={{
          width: '100%',
          maxWidth: isMobile ? '100%' : 'min(58vh, 600px)',
          display: 'flex',
          justifyContent: 'center',
          zIndex: 1,
          minHeight: 0,
          flex: isMobile ? '0 0 auto' : 1
        }}>
            <div style={{
              width: '100%',
              maxWidth: isMobile ? '100%' : 'min(58vh, 600px)',
              aspectRatio: '1 / 1',
              position: 'relative',
              padding: isMobile ? '0' : '2px',
              background: '#ffffff',
              borderRadius: isMobile ? '20px' : '26px',
              boxShadow: '0 0 0 1.5px #e2e8f0',
              overflow: 'hidden',
              minHeight: 0,
              flex: isMobile ? '0 0 auto' : 1
            }}>
              <canvas
                ref={canvasRef}
                width={1000}
                height={1000}
                data-no-tab-swipe="1"
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: isMobile ? '22px' : '24px',
                  cursor: isEraser ? 'cell' : 'crosshair',
                  display: 'block',
                  touchAction: isMobile ? 'pan-x pan-y pinch-zoom' : 'none'
                }}
              />
            </div>
          </div>
        </div>

        {!isMobile && ColorSection}
      </div>

      {/* Footer Controls */}
      {isMobile ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', paddingBottom: '0', alignItems: 'center', marginTop: '24px' }}>
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: '0' }}>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              {SliderInner}
            </div>
          </div>
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: '0' }}>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              {ColorSection}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', paddingBottom: '8px' }}>
          <div style={{ width: '100%', maxWidth: '860px', display: 'grid', gap: '6px' }}>
            {SliderInner}
          </div>
        </div>
      )}
    </motion.div>
  );
}
