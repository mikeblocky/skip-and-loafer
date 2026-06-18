import { memo } from 'react';
import { X, Sticker, Layers, Smile, Eye, EyeOff, Pause, Play, VideoOff, Magnet, Trash2, Download } from 'lucide-react';
import { ALL_STICKER_SRCS, BG_MODES, FACE_ANCHORS } from './stickerCamConstants';
import { ToolBtn } from './stickerCamUi';

// ── StickerPicker (shared) ────────────────────────────────────────────────────
const StickerPicker = memo(({ onSelect, onClose, hint }) => (
  <div data-snap-ctrl="1" onPointerDown={e => e.stopPropagation()} style={{
    position:'absolute', bottom:0, left:0, right:0, zIndex:300,
    background:'rgba(8,8,20,0.97)', backdropFilter:'blur(14px)',
    borderTop:'2px solid rgba(255,255,255,0.08)',
    display:'flex', flexDirection:'column', maxHeight:'52%',
  }}>
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 16px 4px', flexShrink:0 }}>
      <span style={{ color:'#c4b5fd', fontFamily:'Sniglet, var(--font-hand)', fontSize:'0.9rem' }}>
        {hint ?? 'Pick a sticker'}
      </span>
      <button onClick={onClose} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.5)', cursor:'pointer', padding:4, lineHeight:1 }}>
        <X size={20} />
      </button>
    </div>
    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(66px,1fr))', gap:6, padding:'4px 10px 16px', overflowY:'auto' }}>
      {ALL_STICKER_SRCS.map(src => (
        <button key={src} onClick={() => onSelect(src)}
          style={{ background:'rgba(255,255,255,0.05)', border:'1.5px solid rgba(255,255,255,0.08)', borderRadius:10, padding:5, cursor:'pointer', aspectRatio:'1', display:'flex', alignItems:'center', justifyContent:'center', transition:'background 0.12s,transform 0.1s' }}
          onMouseEnter={e => { e.currentTarget.style.background='rgba(196,181,253,0.2)'; e.currentTarget.style.transform='scale(1.1)'; }}
          onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.05)'; e.currentTarget.style.transform=''; }}
        >
          <img src={src} alt="" style={{ width:'100%', height:'100%', objectFit:'contain' }} />
        </button>
      ))}
    </div>
  </div>
));

// ── BgPicker ──────────────────────────────────────────────────────────────────
const BgPicker = memo(({ current, onChange, onClose }) => (
  <div data-snap-ctrl="1" onPointerDown={e => e.stopPropagation()} style={{
    position:'absolute', bottom:0, left:0, right:0, zIndex:300,
    background:'rgba(8,8,20,0.97)', backdropFilter:'blur(14px)',
    borderTop:'2px solid rgba(255,255,255,0.08)',
    padding:'12px 14px 18px', display:'flex', flexDirection:'column', gap:10,
  }}>
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
      <span style={{ color:'#6ee7b7', fontFamily:'Sniglet, var(--font-hand)', fontSize:'0.9rem' }}>Background</span>
      <button onClick={onClose} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.5)', cursor:'pointer', padding:4 }}><X size={18} /></button>
    </div>
    <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
      {BG_MODES.map(m => (
        <button key={m.id} onClick={() => { onChange(m.id); onClose(); }}
          style={{
            padding:'8px 14px', borderRadius:12,
            background: current === m.id ? 'rgba(110,231,183,0.2)' : 'rgba(255,255,255,0.06)',
            border: `1.5px solid ${current === m.id ? '#6ee7b7' : 'rgba(255,255,255,0.1)'}`,
            borderBottom: `4px solid ${current === m.id ? '#34d399' : 'rgba(255,255,255,0.08)'}`,
            color: current === m.id ? '#6ee7b7' : 'rgba(255,255,255,0.7)',
            fontFamily:'Sniglet, var(--font-hand)', fontSize:'0.85rem', cursor:'pointer',
          }}
        >{m.label}</button>
      ))}
    </div>
  </div>
));

// ── FaceAnchorPicker ──────────────────────────────────────────────────────────
const FaceAnchorPicker = memo(({ onSelect, onClose }) => (
  <div data-snap-ctrl="1" onPointerDown={e => e.stopPropagation()} style={{
    position:'absolute', bottom:0, left:0, right:0, zIndex:300,
    background:'rgba(8,8,20,0.97)', backdropFilter:'blur(14px)',
    borderTop:'2px solid rgba(255,255,255,0.08)',
    padding:'12px 14px 18px', display:'flex', flexDirection:'column', gap:10,
  }}>
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
      <span style={{ color:'#f9a8d4', fontFamily:'Sniglet, var(--font-hand)', fontSize:'0.9rem' }}>Face AR — Pick anchor</span>
      <button onClick={onClose} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.5)', cursor:'pointer', padding:4 }}><X size={18} /></button>
    </div>
    <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
      {Object.entries(FACE_ANCHORS).map(([name, lmIdx]) => (
        <button key={name} onClick={() => onSelect(name, lmIdx)}
          style={{ padding:'8px 14px', borderRadius:12, background:'rgba(249,168,212,0.1)', border:'1.5px solid rgba(249,168,212,0.25)', borderBottom:'4px solid rgba(249,168,212,0.2)', color:'#f9a8d4', fontFamily:'Sniglet, var(--font-hand)', fontSize:'0.85rem', cursor:'pointer' }}
        >
          {{ hat:'🎩 Hat', glasses:'👓 Glasses', nose:'👃 Nose', lCheek:'😊 L Cheek', rCheek:'😊 R Cheek', chin:'👇 Chin' }[name]}
        </button>
      ))}
    </div>
    <div style={{ color:'rgba(255,255,255,0.3)', fontSize:'0.75rem', fontFamily:'Sniglet, var(--font-hand)' }}>
      First pick an anchor, then pick a sticker from the Stickers panel
    </div>
  </div>
));

const ControlPanel = memo(function ControlPanel({
  hasCamera, bgLabel, onBg, faceStatus, onFace, showFaceMesh, onToggleMesh,
  trackingPaused, onTogglePause, hideCam, onToggleHideCam, showSkeleton,
  onToggleSkeleton, stickerCount, onGather, onClear, onSave, onClose,
}) {
  return (
    <div data-snap-ctrl="1" onPointerDown={e => e.stopPropagation()} style={{
      position:'absolute', bottom:0, left:0, right:0, zIndex:300,
      background:'rgba(8,8,20,0.97)', backdropFilter:'blur(14px)',
      borderTop:'2px solid rgba(255,255,255,0.08)',
      padding:'12px 14px 18px', display:'flex', flexDirection:'column', gap:10,
    }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span style={{ color:'#c4b5fd', fontFamily:'Sniglet, var(--font-hand)', fontSize:'0.9rem' }}>Camera controls</span>
        <button onClick={onClose} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.5)', cursor:'pointer', padding:4 }}><X size={18} /></button>
      </div>
      <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
        <ToolBtn color="#6ee7b7" onClick={onBg}><Layers size={16} /> {bgLabel}</ToolBtn>
        {hasCamera && (
          <ToolBtn color="#f9a8d4" onClick={onFace}>
            <Smile size={16} /> {faceStatus === 'idle' ? 'Face AR' : faceStatus === 'loading' ? 'Loading...' : 'Face AR'}
          </ToolBtn>
        )}
        {hasCamera && faceStatus === 'ready' && (
          <ToolBtn color={showFaceMesh ? '#f9a8d4' : '#475569'} onClick={onToggleMesh}>
            <Eye size={15} /> Mesh
          </ToolBtn>
        )}
        {hasCamera && (
          <ToolBtn color={trackingPaused ? '#fbbf24' : '#94a3b8'} onClick={onTogglePause}>
            {trackingPaused ? <Play size={16} /> : <Pause size={16} />} {trackingPaused ? 'Resume' : 'Pause'}
          </ToolBtn>
        )}
        {hasCamera && (
          <ToolBtn color={hideCam ? '#f472b6' : '#64748b'} onClick={onToggleHideCam}>
            <VideoOff size={16} /> {hideCam ? 'Show Cam' : 'Hide Cam'}
          </ToolBtn>
        )}
        <ToolBtn color={showSkeleton ? '#38bdf8' : '#475569'} onClick={onToggleSkeleton}>
          {showSkeleton ? <Eye size={16} /> : <EyeOff size={16} />} Skeleton
        </ToolBtn>
        {stickerCount > 0 && (
          <>
            <ToolBtn color="#a78bfa" onClick={onGather}><Magnet size={15} /> Gather</ToolBtn>
            <ToolBtn color="#f97316" onClick={onClear}><Trash2 size={15} /> Clear</ToolBtn>
          </>
        )}
        {hasCamera && <ToolBtn color="#fbbf24" onClick={onSave}><Download size={16} /> Save</ToolBtn>}
      </div>
    </div>
  );
});

export { BgPicker, ControlPanel, FaceAnchorPicker, StickerPicker };
