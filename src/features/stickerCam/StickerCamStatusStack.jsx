import { StatusChip } from './stickerCamUi';

function StickerCamStatusStack({
  bgMode,
  faceStatus,
  handStatus,
  segStatus,
}) {
  return (
    <div style={{ position:'absolute', top:12, right:12, display:'flex', flexDirection:'column', gap:5, alignItems:'flex-end', zIndex:200, pointerEvents:'none' }}>
      <StatusChip label={`Hands: ${handStatus}`} color={handStatus==='ready'?'#34d399':handStatus==='loading'?'#fbbf24':'#94a3b8'} />
      {bgMode !== 'none' && <StatusChip label={`Seg: ${segStatus}`} color={segStatus==='ready'?'#34d399':segStatus==='loading'?'#fbbf24':'#94a3b8'} />}
      {faceStatus !== 'idle' && <StatusChip label={`Face: ${faceStatus}`} color={faceStatus==='ready'?'#f9a8d4':faceStatus==='loading'?'#fbbf24':'#94a3b8'} />}
    </div>
  );
}

export default StickerCamStatusStack;
