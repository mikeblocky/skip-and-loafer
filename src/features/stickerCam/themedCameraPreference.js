const THEMED_CAMERA_ENABLED_KEY = 'skip_themed_camera_enabled_v1';

function getThemedCameraEnabled() {
  try {
    return localStorage.getItem(THEMED_CAMERA_ENABLED_KEY) !== '0';
  } catch {
    return true;
  }
}

function setThemedCameraEnabled(enabled) {
  try {
    if (!enabled) localStorage.setItem(THEMED_CAMERA_ENABLED_KEY, '0');
    else localStorage.removeItem(THEMED_CAMERA_ENABLED_KEY);
    window.dispatchEvent(new CustomEvent('skip_themed_camera_change', { detail: { enabled } }));
  } catch {
    // Storage can fail in private mode; the current UI state can still update.
  }
}

export { getThemedCameraEnabled, setThemedCameraEnabled, THEMED_CAMERA_ENABLED_KEY };
