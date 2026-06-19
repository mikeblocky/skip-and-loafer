import { useCallback, useEffect, useState } from 'react';

function buildVideoConstraints(facingMode) {
  return {
    audio: false,
    video: {
      advanced: [
        { focusMode: 'continuous' },
        { exposureMode: 'continuous' },
        { whiteBalanceMode: 'continuous' },
      ],
      facingMode,
      frameRate: { ideal: 60, max: 60 },
      height: { ideal: 1440 },
      width: { ideal: 2560 },
    },
  };
}

async function applyInitialTrackControls(track, zoomCaps) {
  if (!track?.applyConstraints) return;
  const capabilities = track.getCapabilities?.() ?? {};
  const advanced = [];

  if (Array.isArray(capabilities.focusMode) && capabilities.focusMode.includes('continuous')) {
    advanced.push({ focusMode: 'continuous' });
  }
  if (Array.isArray(capabilities.exposureMode) && capabilities.exposureMode.includes('continuous')) {
    advanced.push({ exposureMode: 'continuous' });
  }
  if (Array.isArray(capabilities.whiteBalanceMode) && capabilities.whiteBalanceMode.includes('continuous')) {
    advanced.push({ whiteBalanceMode: 'continuous' });
  }
  if (typeof capabilities.zoom?.min === 'number') {
    advanced.push({ zoom: zoomCaps.min });
  }

  if (!advanced.length) return;
  try {
    await track.applyConstraints({ advanced });
  } catch {
    // Camera-control support varies by browser/device.
  }
}

function useCameraSession({
  applyCameraControls,
  facingModeRef,
  rafRef,
  snapUrl,
  streamRef,
  updateZoomCaps,
  videoRef,
}) {
  const [stream, setStream] = useState(null);
  const [camError, setCamError] = useState(null);
  const [facingMode, setFacingMode] = useState('environment');

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
      setStream(null);
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, [rafRef, streamRef]);

  const startCamera = useCallback(async (facing) => {
    const mode = facing ?? facingModeRef.current;
    try {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      const nextStream = await navigator.mediaDevices.getUserMedia(buildVideoConstraints(mode));
      streamRef.current = nextStream;
      setStream(nextStream);
      setCamError(null);

      const track = nextStream.getVideoTracks?.()[0];
      const nextZoomCaps = updateZoomCaps(track);
      await applyInitialTrackControls(track, nextZoomCaps);
      if (facing) setFacingMode(facing);
    } catch (e) {
      setCamError(e.name === 'NotAllowedError'
        ? 'Camera permission denied. Allow access and try again.'
        : 'Camera error: ' + e.message);
    }
  }, [facingModeRef, streamRef, updateZoomCaps]);

  const flipCamera = useCallback(() => {
    startCamera(facingModeRef.current === 'user' ? 'environment' : 'user');
  }, [facingModeRef, startCamera]);

  useEffect(() => {
    facingModeRef.current = facingMode;
  }, [facingMode, facingModeRef]);

  useEffect(() => {
    if (stream && videoRef.current) videoRef.current.srcObject = stream;
  }, [stream, snapUrl, videoRef]);

  useEffect(() => {
    if (stream) applyCameraControls();
  }, [applyCameraControls, stream]);

  useEffect(() => {
    const stopForPageExit = () => {
      if (document.visibilityState === 'hidden') stopCamera();
    };
    document.addEventListener('visibilitychange', stopForPageExit);
    window.addEventListener('pagehide', stopCamera);
    return () => {
      document.removeEventListener('visibilitychange', stopForPageExit);
      window.removeEventListener('pagehide', stopCamera);
      stopCamera();
    };
  }, [stopCamera]);

  return {
    camError,
    facingMode,
    flipCamera,
    setFacingMode,
    startCamera,
    stopCamera,
    stream,
  };
}

export { useCameraSession };
