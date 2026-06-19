import {
  Aperture,
  Camera,
  CameraOff,
  Circle,
  FlipHorizontal,
  ImagePlus,
  Magnet,
  SlidersHorizontal,
  Sticker,
  SwitchCamera,
  Trash2,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { ASPECT_RATIOS, CAMERA_FILTERS } from './stickerCamConfig';
import { toolbar } from './stickerCamStyles';
import { ToolBtn } from './stickerCamUi';

const themedMobileTray = {
  background: 'linear-gradient(135deg, #fff7ed 0%, #ecfeff 50%, #fdf2f8 100%)',
  borderTop: '3px solid #bae6fd',
  boxShadow: '0 -10px 26px rgba(14,165,233,0.12)',
};

const themedIconButton = (color, active = false) => ({
  border: `2px solid ${color}`,
  borderBottom: `5px solid ${color}`,
  borderRadius: 14,
  background: active ? '#ffffff' : 'rgba(255,255,255,0.86)',
  color,
  display: 'grid',
  placeItems: 'center',
  boxShadow: `0 6px 16px ${color}1f`,
});

function MobileCameraOverlayControls({
  adjustCameraZoom,
  aspectRatio,
  cameraFilter,
  cameraZoom,
  flipCamera,
  openImageLibrary,
  setAspectRatio,
  setCameraFilter,
  themedCamera = false,
}) {
  const floatButtonStyle = themedCamera
    ? { border:'2px solid rgba(14,165,233,0.55)', background:'linear-gradient(135deg, #fdf2f8, #ecfeff)', color:'#0e7490', boxShadow:'0 4px 0 rgba(14,165,233,0.22), 0 10px 22px rgba(14,165,233,0.18)' }
    : { border:'1px solid rgba(255,255,255,0.35)', background:'rgba(0,0,0,0.34)', color:'white' };

  return (
    <>
      <div style={{ position:'absolute', top:10, left:10, right:10, zIndex:180, display:'flex', justifyContent:'space-between', alignItems:'center', pointerEvents:'none' }}>
        <div style={{ display:'flex', gap:6, pointerEvents:'auto' }}>
          <button onClick={flipCamera} style={{ width:38, height:38, borderRadius:'50%', display:'grid', placeItems:'center', backdropFilter:'blur(10px)', ...floatButtonStyle }}><SwitchCamera size={17} /></button>
          <button onClick={openImageLibrary} style={{ width:38, height:38, borderRadius:'50%', display:'grid', placeItems:'center', backdropFilter:'blur(10px)', ...floatButtonStyle }}><ImagePlus size={17} /></button>
        </div>
        <div style={{ pointerEvents:'auto', display:'flex', gap:5, background:themedCamera ? 'rgba(255,255,255,0.86)' : 'rgba(0,0,0,0.28)', border:themedCamera ? '2px solid rgba(251,191,36,0.5)' : '1px solid rgba(255,255,255,0.25)', borderRadius:999, padding:4, backdropFilter:'blur(12px)', boxShadow: themedCamera ? '0 6px 18px rgba(251,191,36,0.18)' : undefined }}>
          {ASPECT_RATIOS.filter(r => ['9:16','4:5','1:1'].includes(r.id)).map(r => (
            <button key={r.id} onClick={() => setAspectRatio(r.id)} style={{ border:0, borderRadius:999, padding:'6px 9px', color:themedCamera ? (aspectRatio === r.id ? '#92400e' : '#64748b') : 'white', background: aspectRatio === r.id ? (themedCamera ? '#fef3c7' : 'rgba(255,255,255,0.28)') : 'transparent', fontFamily:'Sniglet, var(--font-hand)', fontSize:12 }}>{r.label}</button>
          ))}
        </div>
      </div>
      <div style={{ position:'absolute', left:10, top:56, zIndex:180, display:'flex', flexDirection:'column', gap:6, pointerEvents:'auto' }}>
        <button onClick={() => adjustCameraZoom(0.25)} style={{ width:38, height:38, borderRadius:'50%', display:'grid', placeItems:'center', backdropFilter:'blur(10px)', ...floatButtonStyle }} title="Zoom in"><ZoomIn size={16} /></button>
        <div style={{ minWidth:38, borderRadius:999, border:themedCamera ? '2px solid rgba(14,165,233,0.45)' : '1px solid rgba(255,255,255,0.25)', background:themedCamera ? 'rgba(236,254,255,0.9)' : 'rgba(0,0,0,0.34)', color:themedCamera ? '#0e7490' : 'white', textAlign:'center', fontFamily:'Sniglet, var(--font-hand)', fontSize:11, padding:'4px 0', backdropFilter:'blur(10px)' }}>{cameraZoom.toFixed(1)}x</div>
        <button onClick={() => adjustCameraZoom(-0.25)} style={{ width:38, height:38, borderRadius:'50%', display:'grid', placeItems:'center', backdropFilter:'blur(10px)', ...floatButtonStyle }} title="Zoom out"><ZoomOut size={16} /></button>
      </div>
      <div style={{ position:'absolute', right:9, top:88, bottom:104, zIndex:180, display:'flex', flexDirection:'column', justifyContent:'flex-start', gap:6, pointerEvents:'auto', overflowY:'auto', scrollbarWidth:'none' }}>
        {CAMERA_FILTERS.map(f => (
          <button key={f.id} onClick={() => setCameraFilter(f.id)} style={{ writingMode:'vertical-rl', transform:'rotate(180deg)', border:'1px solid rgba(255,255,255,0.28)', borderRadius:999, padding:'8px 5px', minHeight:44, color:'white', background: cameraFilter === f.id ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.34)', backdropFilter:'blur(10px)', fontFamily:'Sniglet, var(--font-hand)', fontSize:10, lineHeight:1, flex:'0 0 auto' }}>
            {f.label}
          </button>
        ))}
      </div>
    </>
  );
}

function MobileBottomControls({
  adjustSelectedLive,
  cameraFilter,
  deleteSelectedLive,
  hasCamera,
  openImageLibrary,
  selectedLive,
  setCameraFilter,
  setPanel,
  stageSize,
  startAll,
  takeSnap,
  themedCamera = false,
}) {
  const themedSmallButton = (color, active = false) => ({
    height: 42,
    ...themedIconButton(color, active),
  });

  return (
    <div style={{ ...(themedCamera ? themedMobileTray : { background:'#000', borderTop:'1px solid rgba(255,255,255,0.1)' }), flexShrink:0 }}>
      {selectedLive && (
        <div data-snap-ctrl="1" style={{ display:'grid', gridTemplateColumns:'repeat(6, minmax(0,1fr))', gap:8, padding:'8px 14px 0' }}>
          <button onClick={deleteSelectedLive} style={themedCamera ? themedSmallButton('#ef4444') : { height:42, borderRadius:14, border:'1px solid rgba(255,255,255,0.26)', background:'rgba(255,255,255,0.08)', color:'white', display:'grid', placeItems:'center' }} title="Delete"><Trash2 size={17} /></button>
          <button onClick={() => adjustSelectedLive(s => ({ ...s, zIndex: (s.zIndex ?? 1) - 1 }))} style={themedCamera ? { ...themedSmallButton('#64748b'), fontFamily:'Sniglet, var(--font-hand)', fontSize:16 } : { height:42, borderRadius:14, border:'1px solid rgba(255,255,255,0.26)', background:'rgba(255,255,255,0.08)', color:'white', display:'grid', placeItems:'center' }} title="Send backward">-</button>
          <button onClick={() => adjustSelectedLive(s => ({ ...s, zIndex: (s.zIndex ?? 1) + 1 }))} style={themedCamera ? { ...themedSmallButton('#64748b'), fontFamily:'Sniglet, var(--font-hand)', fontSize:16 } : { height:42, borderRadius:14, border:'1px solid rgba(255,255,255,0.26)', background:'rgba(255,255,255,0.08)', color:'white', display:'grid', placeItems:'center' }} title="Bring forward">+</button>
          <button onClick={() => adjustSelectedLive(s => ({ ...s, rotation: (s.rotation ?? 0) + 15 }))} style={themedCamera ? themedSmallButton('#8b5cf6') : { height:42, borderRadius:14, border:'1px solid rgba(255,255,255,0.26)', background:'rgba(255,255,255,0.08)', color:'white', display:'grid', placeItems:'center' }} title="Rotate"><SlidersHorizontal size={17} /></button>
          <button onClick={() => adjustSelectedLive(s => ({ ...s, w: Math.max(36, (s.w || 120) * 0.86), h: Math.max(36, (s.h || 120) * 0.86) }))} style={themedCamera ? { ...themedSmallButton('#06b6d4'), fontFamily:'Sniglet, var(--font-hand)', fontSize:13 } : { height:42, borderRadius:14, border:'1px solid rgba(255,255,255,0.26)', background:'rgba(255,255,255,0.08)', color:'white', display:'grid', placeItems:'center' }} title="Smaller">S</button>
          <button onClick={() => adjustSelectedLive(s => ({ ...s, w: Math.min(stageSize.width, (s.w || 120) * 1.16), h: Math.min(stageSize.height, (s.h || 120) * 1.16) }))} style={themedCamera ? { ...themedSmallButton('#10b981'), fontFamily:'Sniglet, var(--font-hand)', fontSize:13 } : { height:42, borderRadius:14, border:'1px solid rgba(255,255,255,0.26)', background:'rgba(255,255,255,0.08)', color:'white', display:'grid', placeItems:'center' }} title="Bigger">L</button>
        </div>
      )}
      <div style={{ display:'grid', gridTemplateColumns:'56px 1fr 56px', alignItems:'center', gap:12, padding:'8px 18px 10px' }}>
        <button onClick={() => setPanel(p => p==='stickers'?null:'stickers')} style={themedCamera ? { width:48, height:48, ...themedIconButton('#ec4899') } : { width:48, height:48, borderRadius:16, border:'1px solid rgba(255,255,255,0.28)', background:'rgba(255,255,255,0.08)', color:'white', display:'grid', placeItems:'center' }}><Sticker size={21} /></button>
        {hasCamera ? (
          <button onClick={takeSnap} style={themedCamera ? { justifySelf:'center', width:74, height:74, borderRadius:'50%', border:'5px solid #f472b6', background:'#fff', color:'#f472b6', display:'grid', placeItems:'center', boxShadow:'0 7px 0 rgba(244,114,182,0.28), 0 12px 28px rgba(244,114,182,0.24), inset 0 0 0 3px #fdf2f8' } : { justifySelf:'center', width:74, height:74, borderRadius:'50%', border:'5px solid rgba(255,255,255,0.92)', background:'transparent', color:'white', display:'grid', placeItems:'center', boxShadow:'0 8px 24px rgba(0,0,0,0.35), inset 0 0 0 2px rgba(255,255,255,0.9)' }}><Circle size={34} fill="currentColor" /></button>
        ) : (
          <button onClick={startAll} style={themedCamera ? { justifySelf:'center', width:74, height:74, borderRadius:'50%', border:'5px solid #38bdf8', background:'#fff', color:'#0e7490', display:'grid', placeItems:'center', boxShadow:'0 7px 0 rgba(14,165,233,0.26), 0 12px 28px rgba(14,165,233,0.2)' } : { justifySelf:'center', width:74, height:74, borderRadius:'50%', border:'5px solid rgba(255,255,255,0.92)', background:'transparent', color:'white', display:'grid', placeItems:'center', boxShadow:'0 8px 24px rgba(0,0,0,0.35)' }}><Camera size={30} /></button>
        )}
        {hasCamera ? (
          <button onClick={() => setCameraFilter((current) => {
            const idx = CAMERA_FILTERS.findIndex(f => f.id === current);
            return CAMERA_FILTERS[(idx + 1) % CAMERA_FILTERS.length].id;
          })} style={themedCamera ? { width:48, height:48, ...themedIconButton('#f59e0b'), fontFamily:'Sniglet, var(--font-hand)', fontSize:11, fontWeight:700 } : { width:48, height:48, borderRadius:16, border:'1px solid rgba(255,255,255,0.28)', background:'rgba(255,255,255,0.08)', color:'white', display:'grid', placeItems:'center', fontFamily:'Sniglet, var(--font-hand)', fontSize:11, fontWeight:700 }}>
            FX
          </button>
        ) : (
          <button onClick={openImageLibrary} style={themedCamera ? { width:48, height:48, ...themedIconButton('#8b5cf6') } : { width:48, height:48, borderRadius:16, border:'1px solid rgba(255,255,255,0.28)', background:'rgba(255,255,255,0.08)', color:'white', display:'grid', placeItems:'center' }}><ImagePlus size={20} /></button>
        )}
      </div>
    </div>
  );
}

function DesktopToolbar({
  adjustCameraZoom,
  aspectRatio,
  cameraZoom,
  clearStickers,
  flipCamera,
  gatherStickers,
  hasCamera,
  isFront,
  openImageLibrary,
  savePhoto,
  setAspectRatio,
  setPanel,
  simplePhone,
  startAll,
  stickerCount,
  stopCamera,
  takeSnap,
  themedCamera = false,
}) {
  return (
    <div style={{ ...toolbar, gap:7, padding:'7px 10px', alignItems:'center', background: themedCamera ? 'linear-gradient(135deg, rgba(255,247,237,0.96), rgba(236,254,255,0.96) 52%, rgba(253,242,248,0.96))' : toolbar.background, borderTop: themedCamera ? '2px solid #fbcfe8' : toolbar.borderTop, boxShadow: themedCamera ? '0 -6px 24px rgba(244,114,182,0.12)' : undefined }}>
      {!hasCamera
        ? <ToolBtn color="#4d9cff" onClick={startAll} title="Start camera" themed={themedCamera}><Camera size={16} /></ToolBtn>
        : <ToolBtn color="#f87171" onClick={stopCamera} title="Stop camera" themed={themedCamera}><CameraOff size={16} /></ToolBtn>
      }
      <ToolBtn color="#a78bfa" onClick={openImageLibrary} title="Open image library" themed={themedCamera}><ImagePlus size={16} /></ToolBtn>
      {hasCamera && (
        <ToolBtn color="#22d3ee" onClick={flipCamera} title={isFront ? 'Switch to back camera' : 'Switch to selfie camera'} themed={themedCamera}>
          <FlipHorizontal size={16} />
        </ToolBtn>
      )}
      {!simplePhone && (
        <div style={{ display:'flex', gap:3, padding:3, border:themedCamera ? '2px solid #bae6fd' : '1px solid rgba(255,255,255,0.1)', borderRadius:12, background:themedCamera ? 'rgba(255,255,255,0.68)' : 'rgba(255,255,255,0.04)', flex:'0 0 auto' }}>
          {ASPECT_RATIOS.map(r => (
            <button
              key={r.id}
              onClick={() => setAspectRatio(r.id)}
              title={`Aspect ${r.label}`}
              style={{
                minWidth:38,
                height:30,
                border:0,
                borderRadius:9,
                background:aspectRatio === r.id ? (themedCamera ? '#dcfce7' : 'rgba(110,231,183,0.22)') : 'transparent',
                color:aspectRatio === r.id ? '#6ee7b7' : '#94a3b8',
                cursor:'pointer',
                fontFamily:'Sniglet, var(--font-hand)',
                fontSize:12,
                transition:'background 0.14s ease, color 0.14s ease, transform 0.14s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform='translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform=''; }}
              onPointerDown={e => { e.currentTarget.style.transform='scale(0.95)'; }}
              onPointerUp={e => { e.currentTarget.style.transform='translateY(-1px)'; }}
            >
              {r.label}
            </button>
          ))}
        </div>
      )}
      {hasCamera && (
        <>
          <ToolBtn color="#94a3b8" onClick={() => adjustCameraZoom(-0.25)} title="Zoom out" themed={themedCamera}>
            <ZoomOut size={16} />
          </ToolBtn>
          <ToolBtn color="#38bdf8" onClick={() => adjustCameraZoom(0.25)} title={`Zoom in (${cameraZoom.toFixed(1)}x)`} themed={themedCamera}>
            <ZoomIn size={15} /> {cameraZoom.toFixed(1)}x
          </ToolBtn>
        </>
      )}
      {hasCamera && (
        <ToolBtn color="#f472b6" onClick={takeSnap} title="Snap photo" themed={themedCamera}>
          <Aperture size={17} />
        </ToolBtn>
      )}
      <ToolBtn color="#8b5cf6" onClick={() => setPanel(p => p==='stickers'?null:'stickers')} title="Stickers" themed={themedCamera}>
        <Sticker size={16} /> {stickerCount > 0 ? stickerCount : ''}
      </ToolBtn>
      {stickerCount > 0 && !simplePhone && (
        <>
          <ToolBtn color="#a78bfa" onClick={gatherStickers} title="Gather stickers" themed={themedCamera}>
            <Magnet size={16} />
          </ToolBtn>
          <ToolBtn color="#f97316" onClick={clearStickers} title="Clear stickers" themed={themedCamera}>
            <Trash2 size={16} />
          </ToolBtn>
        </>
      )}
      {simplePhone && (
        <ToolBtn color="#fbbf24" onClick={savePhoto}><Aperture size={16} /> Save</ToolBtn>
      )}
      {!simplePhone && (
        <ToolBtn color="#c4b5fd" onClick={() => setPanel(p => p==='controls'?null:'controls')} title="More controls" themed={themedCamera}>
          <SlidersHorizontal size={16} />
        </ToolBtn>
      )}
    </div>
  );
}

export { DesktopToolbar, MobileBottomControls, MobileCameraOverlayControls };
