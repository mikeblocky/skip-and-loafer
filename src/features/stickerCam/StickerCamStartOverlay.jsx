import { Camera, CameraOff, ImagePlus } from 'lucide-react';
import { primaryBtn } from './stickerCamStyles';

function StickerCamStartOverlay({
  camError,
  onStart,
  onOpenLibrary,
  simplePhone,
}) {
  return (
    <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:20, background: simplePhone ? '#111118' : undefined }}>
      <div style={{ width:88, height:88, borderRadius:'50%', background: simplePhone ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)', border: simplePhone ? '1px solid rgba(255,255,255,0.28)' : '2px solid rgba(255,255,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <CameraOff size={38} color={simplePhone ? 'rgba(255,255,255,0.84)' : 'rgba(255,255,255,0.22)'} />
      </div>
      {camError
        ? <p style={{ color:'#fca5a5', fontFamily:'Sniglet, var(--font-hand)', fontSize:'0.9rem', textAlign:'center', maxWidth:280, margin:0 }}>{camError}</p>
        : <p style={{ color: simplePhone ? 'rgba(255,255,255,0.82)' : 'rgba(255,255,255,0.28)', fontFamily:'Sniglet, var(--font-hand)', fontSize:'0.95rem', margin:0 }}>{simplePhone ? 'Open camera' : 'Tap to start camera & hand tracking'}</p>
      }
      <div style={{ display:'flex', gap:10, flexWrap:'wrap', justifyContent:'center' }}>
        <button onClick={onStart} style={simplePhone ? { ...primaryBtn, background:'rgba(255,255,255,0.94)', border:'1px solid rgba(255,255,255,0.84)', borderBottom:'3px solid rgba(255,255,255,0.58)', color:'#050505', boxShadow:'0 8px 26px rgba(0,0,0,0.28)' } : primaryBtn}>
          <Camera size={17} /> {simplePhone ? 'Start camera' : 'Start camera + Hand tracking'}
        </button>
        <button onClick={onOpenLibrary} style={simplePhone ? { ...primaryBtn, background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.28)', borderBottom:'3px solid rgba(255,255,255,0.16)', color:'white', boxShadow:'0 8px 26px rgba(0,0,0,0.22)' } : { ...primaryBtn, background:'rgba(139,92,246,0.18)', borderColor:'rgba(196,181,253,0.4)', color:'#ddd6fe' }}>
          <ImagePlus size={17} /> Library
        </button>
      </div>
    </div>
  );
}

export default StickerCamStartOverlay;
