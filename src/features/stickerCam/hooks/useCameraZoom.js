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

function addCameraModeConstraint(advanced, capabilities, key, modes) {
  const supportedModes = Array.isArray(capabilities[key]) ? capabilities[key] : [];
  const mode = modes.find(item => supportedModes.includes(item));
  if (mode) advanced.push({ [key]: mode });
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
    const supportedConstraints = navigator.mediaDevices?.getSupportedConstraints?.() ?? {};
    const advanced = [];

    addCameraModeConstraint(advanced, capabilities, 'focusMode', point ? ['single-shot', 'manual', 'continuous'] : ['continuous', 'single-shot']);
    addCameraModeConstraint(advanced, capabilities, 'exposureMode', ['continuous', 'single-shot']);
    addCameraModeConstraint(advanced, capabilities, 'whiteBalanceMode', ['continuous', 'manual']);

    if (point && (supportedConstraints.pointsOfInterest || 'pointsOfInterest' in capabilities)) {
      advanced.unshift({ pointsOfInterest: [{ x: point.x, y: point.y }] });
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
      if (!point) return;
      try {
        await track.applyConstraints({ advanced: [{ pointsOfInterest: [{ x: point.x, y: point.y }] }] });
      } catch {
        // Browser camera-control support varies per device.
      }
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
