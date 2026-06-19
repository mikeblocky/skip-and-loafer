import { useEffect, useState } from 'react';
import { CheckCircle, RefreshCw, UploadCloud, WifiOff } from 'lucide-react';
import {
  PWA_SYNC_COMPLETE_EVENT,
  PWA_SYNC_IDLE_EVENT,
  PWA_SYNC_START_EVENT,
  PWA_UPDATE_APPLY_EVENT,
  PWA_UPDATE_READY_EVENT,
} from '../../utils/pwaEvents.js';
import { getPendingOfflineRequestCount } from '../../utils/offlineSync.js';

const statusStyle = (isMobile, tone) => ({
  position: 'fixed',
  top: isMobile ? 'auto' : '16px',
  right: isMobile ? '14px' : '16px',
  bottom: isMobile ? 'calc(env(safe-area-inset-bottom, 0px) + 78px)' : 'auto',
  zIndex: 2000,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  minWidth: isMobile ? '34px' : '38px',
  height: isMobile ? '34px' : '38px',
  maxWidth: isMobile ? '54vw' : '320px',
  padding: isMobile ? '0 10px' : '0 12px',
  color: tone.color,
  background: tone.background,
  border: `2px solid ${tone.border}`,
  borderBottom: `4px solid ${tone.bottom}`,
  borderRadius: '9999px',
  boxShadow: `0 8px 24px ${tone.shadow}`,
  fontFamily: 'var(--font-paper)',
  fontSize: isMobile ? '0.72rem' : '0.78rem',
  lineHeight: 1,
  cursor: tone.actionable ? 'pointer' : 'default',
  pointerEvents: tone.actionable ? 'auto' : 'none',
});

const tones = {
  offline: {
    color: '#b45309',
    background: '#fef3c7',
    border: '#d97706',
    bottom: '#b45309',
    shadow: 'rgba(180, 83, 9, 0.15)',
  },
  update: {
    color: '#1d4ed8',
    background: '#dbeafe',
    border: '#60a5fa',
    bottom: '#2563eb',
    shadow: 'rgba(37, 99, 235, 0.14)',
    actionable: true,
  },
  sync: {
    color: '#047857',
    background: '#d1fae5',
    border: '#34d399',
    bottom: '#059669',
    shadow: 'rgba(5, 150, 105, 0.14)',
  },
};

const AppStatusChip = ({ isMobile, uiLanguage }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [updateReady, setUpdateReady] = useState(!!window.__skipWaitingServiceWorker);
  const [syncStatus, setSyncStatus] = useState({
    syncing: false,
    pending: getPendingOfflineRequestCount(),
    completedAt: 0,
  });

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    const handleUpdateReady = () => setUpdateReady(true);
    const handleSyncStart = (event) => {
      setSyncStatus({
        syncing: true,
        pending: Number(event.detail?.pending || getPendingOfflineRequestCount()),
        completedAt: 0,
      });
    };
    const handleSyncIdle = (event) => {
      const pending = Number(event.detail?.pending || getPendingOfflineRequestCount());
      setSyncStatus({
        syncing: false,
        pending,
        completedAt: pending === 0 ? Date.now() : 0,
      });
    };
    const handleSyncComplete = () => {
      setSyncStatus({
        syncing: false,
        pending: getPendingOfflineRequestCount(),
        completedAt: Date.now(),
      });
    };
    const clearRecentSync = window.setInterval(() => {
      setSyncStatus((current) => (
        current.completedAt && Date.now() - current.completedAt > 5200
          ? { ...current, completedAt: 0 }
          : current
      ));
    }, 1200);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener(PWA_UPDATE_READY_EVENT, handleUpdateReady);
    window.addEventListener(PWA_SYNC_START_EVENT, handleSyncStart);
    window.addEventListener(PWA_SYNC_IDLE_EVENT, handleSyncIdle);
    window.addEventListener(PWA_SYNC_COMPLETE_EVENT, handleSyncComplete);

    return () => {
      window.clearInterval(clearRecentSync);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener(PWA_UPDATE_READY_EVENT, handleUpdateReady);
      window.removeEventListener(PWA_SYNC_START_EVENT, handleSyncStart);
      window.removeEventListener(PWA_SYNC_IDLE_EVENT, handleSyncIdle);
      window.removeEventListener(PWA_SYNC_COMPLETE_EVENT, handleSyncComplete);
    };
  }, []);

  if (!isOnline) {
    const label = uiLanguage === 'ja' ? 'オフライン' : 'Offline mode';
    return (
      <div style={statusStyle(isMobile, tones.offline)} role="status" aria-label={label} title={label}>
        <WifiOff size={isMobile ? 16 : 18} strokeWidth={2.8} aria-hidden="true" />
        {!isMobile && <span>{label}</span>}
      </div>
    );
  }

  if (updateReady) {
    const label = uiLanguage === 'ja' ? '更新する' : 'Update app';
    return (
      <button
        type="button"
        style={statusStyle(isMobile, tones.update)}
        aria-label={label}
        title={label}
        onClick={() => window.dispatchEvent(new CustomEvent(PWA_UPDATE_APPLY_EVENT))}
      >
        <RefreshCw size={isMobile ? 15 : 17} strokeWidth={2.6} aria-hidden="true" />
        {!isMobile && <span>{label}</span>}
      </button>
    );
  }

  if (syncStatus.syncing || syncStatus.pending > 0 || syncStatus.completedAt) {
    if (isMobile && !syncStatus.syncing && syncStatus.pending === 0 && syncStatus.completedAt) {
      return null;
    }

    const label = syncStatus.syncing
      ? 'Syncing saved actions'
      : syncStatus.pending > 0
        ? `${syncStatus.pending} action${syncStatus.pending === 1 ? '' : 's'} waiting`
        : 'Synced';
    const Icon = syncStatus.pending > 0 || syncStatus.syncing ? UploadCloud : CheckCircle;
    return (
      <div style={statusStyle(isMobile, tones.sync)} role="status" aria-label={label} title={label}>
        <Icon size={isMobile ? 15 : 17} strokeWidth={2.6} aria-hidden="true" />
        {!isMobile && <span>{label}</span>}
      </div>
    );
  }

  return null;
};

export default AppStatusChip;
