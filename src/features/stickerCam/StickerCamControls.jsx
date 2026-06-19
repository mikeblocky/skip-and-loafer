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

function MobileCameraOverlayControls({
  adjustCameraZoom,
  aspectRatio,
  cameraFilter,
  cameraZoom,
  flipCamera,
  openImageLibrary,
  setAspectRatio,
  setCameraFilter,
}) {
  return (
    <>
      <div style={{ position:'absolute', top:10, left:10, right:10, zIndex:180, display:'flex', justifyContent:'space-between', alignItems:'center', pointerEvents:'none' }}>
        <div style={{ display:'flex', gap:6, pointerEvents:'auto' }}>
          <button onClick={flipCamera} style={{ width:38, height:38, borderRadius:'50%', border:'1px solid rgba(255,255,255,0.35)', background:'rgba(0,0,0,0.34)', color:'white', display:'grid', placeItems:'center', backdropFilter:'blur(10px)' }}><SwitchCamera size={17} /></button>
          <button onClick={openImageLibrary} style={{ width:38, height:38, borderRadius:'50%', border:'1px solid rgba(255,255,255,0.35)', background:'rgba(0,0,0,0.34)', color:'white', display:'grid', placeItems:'center', backdropFilter:'blur(10px)' }}><ImagePlus size={17} /></button>
        </div>
        <div style={{ pointerEvents:'auto', display:'flex', gap:5, background:'rgba(0,0,0,0.28)', border:'1px solid rgba(255,255,255,0.25)', borderRadius:999, padding:4, backdropFilter:'blur(12px)' }}>
          {ASPECT_RATIOS.filter(r => ['9:16','4:5','1:1'].includes(r.id)).map(r => (
            <button key={r.id} onClick={() => setAspectRatio(r.id)} style={{ border:0, borderRadius:999, padding:'6px 9px', color:'white', background: aspectRatio === r.id ? 'rgba(255,255,255,0.28)' : 'transparent', fontFamily:'Sniglet, var(--font-hand)', fontSize:12 }}>{r.label}</button>
          ))}
        </div>
      </div>
      <div style={{ position:'absolute', left:10, top:56, zIndex:180, display:'flex', flexDirection:'column', gap:6, pointerEvents:'auto' }}>
        <button onClick={() => adjustCameraZoom(0.25)} style={{ width:38, height:38, borderRadius:'50%', border:'1px solid rgba(255,255,255,0.35)', background:'rgba(0,0,0,0.34)', color:'white', display:'grid', placeItems:'center', backdropFilter:'blur(10px)' }} title="Zoom in"><ZoomIn size={16} /></button>
        <div style={{ minWidth:38, borderRadius:999, border:'1px solid rgba(255,255,255,0.25)', background:'rgba(0,0,0,0.34)', color:'white', textAlign:'center', fontFamily:'Sniglet, var(--font-hand)', fontSize:11, padding:'4px 0', backdropFilter:'blur(10px)' }}>{cameraZoom.toFixed(1)}x</div>
        <button onClick={() => adjustCameraZoom(-0.25)} style={{ width:38, height:38, borderRadius:'50%', border:'1px solid rgba(255,255,255,0.35)', background:'rgba(0,0,0,0.34)', color:'white', display:'grid', placeItems:'center', backdropFilter:'blur(10px)' }} title="Zoom out"><ZoomOut size={16} /></button>
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
}) {
  return (
    <div style={{ background:'#000', borderTop:'1px solid rgba(255,255,255,0.1)', flexShrink:0 }}>
      {selectedLive && (
        <div data-snap-ctrl="1" style={{ display:'grid', gridTemplateColumns:'repeat(6, minmax(0,1fr))', gap:8, padding:'8px 14px 0' }}>
          <button onClick={deleteSelectedLive} style={{ height:42, borderRadius:14, border:'1px solid rgba(255,255,255,0.26)', background:'rgba(255,255,255,0.08)', color:'white', display:'grid', placeItems:'center' }} title="Delete"><Trash2 size={17} /></button>
          <button onClick={() => adjustSelectedLive(s => ({ ...s, zIndex: (s.zIndex ?? 1) - 1 }))} style={{ height:42, borderRadius:14, border:'1px solid rgba(255,255,255,0.26)', background:'rgba(255,255,255,0.08)', color:'white', display:'grid', placeItems:'center' }} title="Send backward">-</button>
          <button onClick={() => adjustSelectedLive(s => ({ ...s, zIndex: (s.zIndex ?? 1) + 1 }))} style={{ height:42, borderRadius:14, border:'1px solid rgba(255,255,255,0.26)', background:'rgba(255,255,255,0.08)', color:'white', display:'grid', placeItems:'center' }} title="Bring forward">+</button>
          <button onClick={() => adjustSelectedLive(s => ({ ...s, rotation: (s.rotation ?? 0) + 15 }))} style={{ height:42, borderRadius:14, border:'1px solid rgba(255,255,255,0.26)', background:'rgba(255,255,255,0.08)', color:'white', display:'grid', placeItems:'center' }} title="Rotate"><SlidersHorizontal size={17} /></button>
          <button onClick={() => adjustSelectedLive(s => ({ ...s, w: Math.max(36, (s.w || 120) * 0.86), h: Math.max(36, (s.h || 120) * 0.86) }))} style={{ height:42, borderRadius:14, border:'1px solid rgba(255,255,255,0.26)', background:'rgba(255,255,255,0.08)', color:'white', display:'grid', placeItems:'center' }} title="Smaller">S</button>
          <button onClick={() => adjustSelectedLive(s => ({ ...s, w: Math.min(stageSize.width, (s.w || 120) * 1.16), h: Math.min(stageSize.height, (s.h || 120) * 1.16) }))} style={{ height:42, borderRadius:14, border:'1px solid rgba(255,255,255,0.26)', background:'rgba(255,255,255,0.08)', color:'white', display:'grid', placeItems:'center' }} title="Bigger">L</button>
        </div>
      )}
      <div style={{ display:'grid', gridTemplateColumns:'56px 1fr 56px', alignItems:'center', gap:12, padding:'8px 18px 10px' }}>
        <button onClick={() => setPanel(p => p==='stickers'?null:'stickers')} style={{ width:48, height:48, borderRadius:16, border:'1px solid rgba(255,255,255,0.28)', background:'rgba(255,255,255,0.08)', color:'white', display:'grid', placeItems:'center' }}><Sticker size={21} /></button>
        {hasCamera ? (
          <button onClick={takeSnap} style={{ justifySelf:'center', width:74, height:74, borderRadius:'50%', border:'5px solid rgba(255,255,255,0.92)', background:'transparent', color:'white', display:'grid', placeItems:'center', boxShadow:'0 8px 24px rgba(0,0,0,0.35), inset 0 0 0 2px rgba(255,255,255,0.9)' }}><Circle size={34} fill="currentColor" /></button>
        ) : (
          <button onClick={startAll} style={{ justifySelf:'center', width:74, height:74, borderRadius:'50%', border:'5px solid rgba(255,255,255,0.92)', background:'transparent', color:'white', display:'grid', placeItems:'center', boxShadow:'0 8px 24px rgba(0,0,0,0.35)' }}><Camera size={30} /></button>
        )}
        {hasCamera ? (
          <button onClick={() => setCameraFilter((current) => {
            const idx = CAMERA_FILTERS.findIndex(f => f.id === current);
            return CAMERA_FILTERS[(idx + 1) % CAMERA_FILTERS.length].id;
          })} style={{ width:48, height:48, borderRadius:16, border:'1px solid rgba(255,255,255,0.28)', background:'rgba(255,255,255,0.08)', color:'white', display:'grid', placeItems:'center', fontFamily:'Sniglet, var(--font-hand)', fontSize:11, fontWeight:700 }}>
            FX
          </button>
        ) : (
          <button onClick={openImageLibrary} style={{ width:48, height:48, borderRadius:16, border:'1px solid rgba(255,255,255,0.28)', background:'rgba(255,255,255,0.08)', color:'white', display:'grid', placeItems:'center' }}><ImagePlus size={20} /></button>
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
}) {
  return (
    <div style={toolbar}>
      {!hasCamera
        ? <ToolBtn color="#4d9cff" onClick={startAll}><Camera size={16} /> Start</ToolBtn>
        : <ToolBtn color="#f87171" onClick={stopCamera}><CameraOff size={16} /> Stop</ToolBtn>
      }
      <ToolBtn color="#a78bfa" onClick={openImageLibrary}><ImagePlus size={16} /> Library</ToolBtn>
      {hasCamera && (
        <ToolBtn color="#22d3ee" onClick={flipCamera}>
          <FlipHorizontal size={16} /> {isFront ? 'Rear' : 'Selfie'}
        </ToolBtn>
      )}
      {!simplePhone && ASPECT_RATIOS.map(r => (
        <ToolBtn key={r.id} color={aspectRatio === r.id ? '#6ee7b7' : '#64748b'} onClick={() => setAspectRatio(r.id)}>
          {r.label}
        </ToolBtn>
      ))}
      {hasCamera && (
        <>
          <ToolBtn color="#94a3b8" onClick={() => adjustCameraZoom(-0.25)}>
            <ZoomOut size={16} /> Zoom
          </ToolBtn>
          <ToolBtn color="#38bdf8" onClick={() => adjustCameraZoom(0.25)}>
            <ZoomIn size={16} /> {cameraZoom.toFixed(1)}x
          </ToolBtn>
        </>
      )}
      {hasCamera && (
        <ToolBtn color="#f472b6" onClick={takeSnap}>
          <Aperture size={17} /> Snap!
        </ToolBtn>
      )}
      <ToolBtn color="#8b5cf6" onClick={() => setPanel(p => p==='stickers'?null:'stickers')}>
        <Sticker size={16} /> Stickers{stickerCount > 0 ? ` (${stickerCount})` : ''}
      </ToolBtn>
      {stickerCount > 0 && !simplePhone && (
        <>
          <ToolBtn color="#a78bfa" onClick={gatherStickers}>
            <Magnet size={16} /> Gather
          </ToolBtn>
          <ToolBtn color="#f97316" onClick={clearStickers}>
            <Trash2 size={16} /> Clear
          </ToolBtn>
        </>
      )}
      {simplePhone && (
        <ToolBtn color="#fbbf24" onClick={savePhoto}><Aperture size={16} /> Save</ToolBtn>
      )}
      {!simplePhone && (
        <ToolBtn color="#c4b5fd" onClick={() => setPanel(p => p==='controls'?null:'controls')}>
          <SlidersHorizontal size={16} /> More
        </ToolBtn>
      )}
    </div>
  );
}

export { DesktopToolbar, MobileBottomControls, MobileCameraOverlayControls };
