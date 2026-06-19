import { useEffect, useMemo, useState } from 'react';
import {
  PERFORMANCE_MODE_CHANGE_EVENT,
  getDevicePerformanceSnapshot,
  readPerformanceModePreference,
  resolvePerformanceMode,
} from '../../../utils/performanceMode.js';

export const useAdaptivePerformanceMode = () => {
  const [preference, setPreference] = useState(readPerformanceModePreference);
  const [snapshot, setSnapshot] = useState(getDevicePerformanceSnapshot);

  useEffect(() => {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection || null;

    const refreshSnapshot = () => setSnapshot(getDevicePerformanceSnapshot());
    const handlePreferenceChange = (event) => {
      setPreference(event.detail?.value || readPerformanceModePreference());
    };

    window.addEventListener(PERFORMANCE_MODE_CHANGE_EVENT, handlePreferenceChange);
    connection?.addEventListener?.('change', refreshSnapshot);

    return () => {
      window.removeEventListener(PERFORMANCE_MODE_CHANGE_EVENT, handlePreferenceChange);
      connection?.removeEventListener?.('change', refreshSnapshot);
    };
  }, []);

  const resolved = useMemo(() => resolvePerformanceMode(preference, snapshot), [preference, snapshot]);

  useEffect(() => {
    document.documentElement.dataset.appPerformance = resolved;
    document.documentElement.dataset.appPerformancePref = preference;
  }, [preference, resolved]);

  return {
    preference,
    resolved,
    snapshot,
    isEfficient: resolved === 'efficient',
  };
};
