import { useCallback, useRef, useState } from 'react';

const DEFAULT_ZOOM_CAPS = {
  max: 3,
  min: 1,
  step: 0.25,
  supported: false,
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getZoomCaps(track) {
  const capabilities = track?.getCapabilities?.() ?? {};
  if (typeof capabilities.zoom?.min !== 'number') return DEFAULT_ZOOM_CAPS;
  return {
    max: capabilities.zoom.max ?? 3,
    min: capabilities.zoom.min ?? 1,
    step: capabilities.zoom.step || 0.1,
    supported: true,
  };
}

function useCameraZoom(streamRef) {
  const [cameraZoom, setCameraZoomState] = useState(1);
  const [zoomCaps, setZoomCaps] = useState(DEFAULT_ZOOM_CAPS);
  const cameraZoomRef = useRef(1);

  const setCameraZoom = useCallback((next) => {
    cameraZoomRef.current = next;
    setCameraZoomState(next);
  }, []);

  const updateZoomCaps = useCallback((track) => {
    const nextCaps = getZoomCaps(track);
    setZoomCaps(nextCaps);
    setCameraZoom(nextCaps.min);
    return nextCaps;
  }, [setCameraZoom]);

  const applyCameraControls = useCallback(async (point = null, zoomValue = cameraZoomRef.current) => {
    const track = streamRef.current?.getVideoTracks?.()[0];
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
    if (point && 'pointsOfInterest' in capabilities) {
      advanced.unshift({ pointsOfInterest: [point] });
    }
    if (typeof capabilities.zoom?.min === 'number') {
      const min = capabilities.zoom.min ?? zoomCaps.min;
      const max = capabilities.zoom.max ?? zoomCaps.max;
      advanced.push({ zoom: clamp(zoomValue, min, max) });
    }

    if (!advanced.length) return;
    try {
      await track.applyConstraints({ advanced });
    } catch {
      // Browser camera-control support varies per device.
    }
  }, [streamRef, zoomCaps.max, zoomCaps.min]);

  const setZoomValue = useCallback((value) => {
    const next = Number(clamp(value, zoomCaps.min, zoomCaps.max).toFixed(2));
    setCameraZoom(next);
    applyCameraControls(null, next);
    return next;
  }, [applyCameraControls, setCameraZoom, zoomCaps.max, zoomCaps.min]);

  const adjustCameraZoom = useCallback((delta) => {
    setZoomValue(cameraZoomRef.current + delta);
  }, [setZoomValue]);

  const renderZoom = zoomCaps.supported ? 1 : cameraZoom;

  return {
    adjustCameraZoom,
    applyCameraControls,
    cameraZoom,
    cameraZoomRef,
    renderZoom,
    setCameraZoom,
    setZoomValue,
    updateZoomCaps,
    zoomCaps,
  };
}

export { useCameraZoom };
