export const PERFORMANCE_MODE_KEY = 'skip_performance_mode_v1';
export const PERFORMANCE_MODE_CHANGE_EVENT = 'skip_performance_mode_change';
export const PERFORMANCE_MODES = ['auto', 'efficient', 'full'];

const getConnection = () => {
  if (typeof navigator === 'undefined') return null;
  return navigator.connection || navigator.mozConnection || navigator.webkitConnection || null;
};

export const readPerformanceModePreference = () => {
  try {
    const value = localStorage.getItem(PERFORMANCE_MODE_KEY);
    return PERFORMANCE_MODES.includes(value) ? value : 'auto';
  } catch {
    return 'auto';
  }
};

export const writePerformanceModePreference = (value) => {
  const normalized = PERFORMANCE_MODES.includes(value) ? value : 'auto';
  try {
    localStorage.setItem(PERFORMANCE_MODE_KEY, normalized);
  } catch {
    // Private browsing can block localStorage; the in-memory UI state still updates.
  }
  window.dispatchEvent(new CustomEvent(PERFORMANCE_MODE_CHANGE_EVENT, { detail: { value: normalized } }));
  return normalized;
};

export const getDevicePerformanceSnapshot = () => {
  if (typeof navigator === 'undefined') {
    return {
      constrained: false,
      saveData: false,
      effectiveType: 'unknown',
      deviceMemory: 0,
      hardwareConcurrency: 0,
      mobileLike: false,
      reason: 'unknown',
    };
  }

  const connection = getConnection();
  const effectiveType = connection?.effectiveType || 'unknown';
  const saveData = !!connection?.saveData;
  const deviceMemory = Number(navigator.deviceMemory || 0);
  const hardwareConcurrency = Number(navigator.hardwareConcurrency || 0);
  const userAgent = navigator.userAgent || '';
  const mobileLike = /Android|iPhone|iPad|iPod|Mobile/i.test(userAgent);
  const lowMemory = deviceMemory > 0 && deviceMemory <= 4;
  const modestMobileMemory = mobileLike && deviceMemory > 0 && deviceMemory <= 6;
  const lowCpu = hardwareConcurrency > 0 && hardwareConcurrency <= 4;
  const modestMobileCpu = mobileLike && hardwareConcurrency > 0 && hardwareConcurrency <= 8;
  const slowConnection = /(^slow-2g$|^2g$|^3g$)/.test(effectiveType);
  const constrained =
    saveData ||
    slowConnection ||
    lowMemory ||
    modestMobileMemory ||
    lowCpu ||
    modestMobileCpu;
  const reason = saveData
    ? 'save-data'
    : slowConnection
      ? effectiveType
      : lowMemory || modestMobileMemory
        ? 'memory'
        : lowCpu || modestMobileCpu
          ? 'cpu'
          : 'comfortable';

  return {
    constrained,
    saveData,
    effectiveType,
    deviceMemory,
    hardwareConcurrency,
    mobileLike,
    reason,
  };
};

export const resolvePerformanceMode = (preference = 'auto', snapshot = getDevicePerformanceSnapshot()) => {
  if (preference === 'efficient') return 'efficient';
  if (preference === 'full') return 'full';
  return snapshot.constrained ? 'efficient' : 'full';
};
