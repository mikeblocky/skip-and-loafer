import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, Cloud, Clock, Check, Copy, Loader2, KeyRound, ArrowDownToLine, AlertCircle, RefreshCw } from 'lucide-react';

const SyncTab = ({
  isMobile,
  syncActive,
  t,
  lastSynced,
  locale,
  syncKey,
  copied,
  loading,
  inputKey,
  setInputKey,
  status,
  handleCopy,
  handleDisconnect,
  handleGenerate,
  handleJoin,
  ListRow,
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
    <ListRow
      isMobile={isMobile}
      index={0}
      finished={syncActive}
      noteColor={1}
      tierBg="#3b82f6"
      tierBorder="#2563eb"
      tierText="#fff"
      tierAccent="#1e40af"
      numberLine1={<Cloud size={14} />}
      title={syncActive ? t.syncActive : t.syncInactive}
      subtitle={
        <span style={{ fontFamily: 'var(--font-hand)', fontSize: isMobile ? '0.8rem' : '0.9rem', color: syncActive ? '#1e40af' : '#6b7280' }}>
          {syncActive ? t.syncing : t.connectHint}
        </span>
      }
      rightContent={
        <div style={{ background: syncActive ? '#dbeafe' : '#f3f4f6', color: syncActive ? '#1e40af' : '#6b7280', padding: '4px 10px', borderRadius: '9999px', fontFamily: 'var(--font-hand)', fontSize: isMobile ? '0.75rem' : '0.85rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
          {syncActive ? <Wifi size={14} /> : <WifiOff size={14} />} {syncActive ? t.connected : t.offline}
        </div>
      }
    />

    <div style={{ marginTop: '8px', padding: isMobile ? '16px' : '24px', background: '#f9fafb', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
      {syncActive ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
          <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'white', border: '1.5px solid #bfdbfe', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <motion.div animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }} transition={{ duration: 2, repeat: Infinity }} style={{ width: 10, height: 10, borderRadius: '50%', background: '#3b82f6', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-hand)', fontSize: '0.9rem', fontWeight: 'bold', color: '#1e40af' }}>{t.cloudConnection}</div>
              {lastSynced && <div style={{ fontFamily: 'var(--font-hand)', fontSize: '0.8rem', color: '#60a5fa' }}>{t.lastSync}: {lastSynced.toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit' })}</div>}
            </div>
          </div>

          <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', background: '#f0f9ff', border: '2px dashed #93c5fd', borderRadius: '8px', padding: '14px 20px', justifyContent: 'center' }}>
            <span style={{ fontFamily: 'var(--font-hand)', fontSize: '1.4rem', fontWeight: 'bold', color: '#1e40af', letterSpacing: '0.15em' }}>{syncKey}</span>
            <motion.button onClick={handleCopy} whileTap={{ scale: 0.85 }} style={{ background: 'white', border: '1px solid #bfdbfe', borderRadius: '6px', cursor: 'pointer', color: copied ? '#16a34a' : '#3b82f6', padding: '6px' }}>
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </motion.button>
          </div>

          <div style={{ fontFamily: 'var(--font-hand)', fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={12} /> {t.shareKey}
          </div>

          <motion.button onClick={handleDisconnect} whileTap={{ scale: 0.95 }} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 20px', background: 'white', border: '1.5px solid #fecaca', borderRadius: '8px', cursor: 'pointer', fontFamily: 'var(--font-hand)', fontSize: '0.9rem', fontWeight: 'bold', color: '#ef4444', marginTop: '8px' }}>
            <WifiOff size={14} /> {t.disconnect}
          </motion.button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
          <motion.button onClick={handleGenerate} disabled={loading === 'gen'} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px 24px', width: '100%', maxWidth: '300px', background: 'linear-gradient(135deg, #3b82f6, #60a5fa)', color: 'white', border: 'none', borderRadius: '12px', cursor: loading === 'gen' ? 'wait' : 'pointer', fontFamily: 'var(--font-hand)', fontSize: '1.05rem', fontWeight: 'bold', boxShadow: '0 4px 14px rgba(59,130,246,0.25)' }}>
            {loading === 'gen' ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}><Loader2 size={16} /></motion.div> : <KeyRound size={16} />}
            {loading === 'gen' ? t.creating : t.createSyncKey}
          </motion.button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', maxWidth: '300px' }}>
            <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
            <span style={{ fontFamily: 'var(--font-hand)', fontSize: '0.8rem', color: '#9ca3af', fontWeight: 'bold' }}>{t.orJoin}</span>
            <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
          </div>

          <div style={{ display: 'flex', gap: '8px', width: '100%', maxWidth: '300px' }}>
            <input
              type="text"
              value={inputKey}
              onChange={e => {
                let val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                if (val.length > 4) val = val.substring(0, 4) + '-' + val.substring(4);
                setInputKey(val.substring(0, 9));
              }}
              onKeyDown={e => e.key === 'Enter' && handleJoin()}
              placeholder="XXXX-XXXX"
              maxLength={9}
              style={{ flex: 1, padding: '10px 14px', fontFamily: 'var(--font-hand)', fontSize: '1.05rem', fontWeight: 'bold', letterSpacing: '0.15em', textAlign: 'center', border: '2px solid #e5e7eb', borderRadius: '10px', background: 'white', color: '#374151', outline: 'none' }}
              onFocus={e => { e.target.style.borderColor = '#3b82f6'; }}
              onBlur={e => { e.target.style.borderColor = '#e5e7eb'; }}
            />
            <motion.button onClick={handleJoin} disabled={loading === 'join'} whileTap={{ scale: 0.95 }} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)', color: 'white', border: 'none', borderRadius: '10px', cursor: loading === 'join' ? 'wait' : 'pointer', fontFamily: 'var(--font-hand)', fontSize: '1rem', fontWeight: 'bold', flexShrink: 0 }}>
              {loading === 'join' ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}><Loader2 size={14} /></motion.div> : <ArrowDownToLine size={14} />} {t.join}
            </motion.button>
          </div>
        </div>
      )}

      <AnimatePresence>
        {status && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', padding: '10px 14px', marginTop: '16px', borderRadius: '8px', fontFamily: 'var(--font-hand)', fontSize: '0.9rem', fontWeight: 'bold', background: status.type === 'success' ? '#f0fdf4' : status.type === 'error' ? '#fef2f2' : '#eff6ff', border: `1.5px solid ${status.type === 'success' ? '#86efac' : status.type === 'error' ? '#fca5a5' : '#93c5fd'}`, color: status.type === 'success' ? '#166534' : status.type === 'error' ? '#991b1b' : '#1e40af', maxWidth: '300px', margin: '16px auto 0' }}>
            {status.type === 'success' ? <Check size={14} /> : status.type === 'error' ? <AlertCircle size={14} /> : <RefreshCw size={14} />} {status.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </div>
);

export default SyncTab;
