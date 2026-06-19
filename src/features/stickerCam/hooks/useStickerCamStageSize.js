import { useEffect, useState } from 'react';
import { ASPECT_RATIOS } from '../stickerCamConfig';

function getAspectRatio(id) {
  return ASPECT_RATIOS.find(r => r.id === id) ?? ASPECT_RATIOS[0];
}

function useStickerCamStageSize({ aspectRatio, snapUrl, stageWrapRef }) {
  const [stageSize, setStageSize] = useState({ width: 640, height: 480 });

  useEffect(() => {
    if (snapUrl) return undefined;
    const wrap = stageWrapRef.current;
    if (!wrap) return undefined;

    const active = getAspectRatio(aspectRatio);
    const updateSize = () => {
      const rect = wrap.getBoundingClientRect();
      const maxW = Math.max(240, rect.width);
      const maxH = Math.max(180, rect.height);
      let width = maxW;
      let height = width / active.value;
      if (height > maxH) {
        height = maxH;
        width = height * active.value;
      }
      setStageSize({
        height: Math.max(180, Math.round(height)),
        width: Math.max(240, Math.round(width)),
      });
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(wrap);
    window.addEventListener('resize', updateSize);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateSize);
    };
  }, [aspectRatio, snapUrl, stageWrapRef]);

  return stageSize;
}

export { useStickerCamStageSize };
