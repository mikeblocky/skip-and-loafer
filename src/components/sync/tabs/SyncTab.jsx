import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, Cloud, Clock, Check, Copy, Loader2, KeyRound, ArrowDownToLine, AlertCircle, RefreshCw } from 'lucide-react';
import { toUiLabelCase } from '../../../utils/textCase';

const smashVariant = {
  hidden: { y: -60, scale: 0.85, opacity: 0, rotate: -2 },
  visible: { 
    y: 0, 
    scale: 1, 
    opacity: 1, 
    rotate: 0, 
    transition: { type: 'spring', stiffness: 500, damping: 12, mass: 1 } 
  }
};

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
  <div style={{ display: 'grid', gap: '20px', paddingBottom: '32px' }}>
    {/* Always visible header status row */}
    {/* Always visible header status row */}
    <motion.div 
      initial={{ scale: 0, rotate: 10, y: -50 }} 
      animate={{ scale: 1, rotate: 0, y: 0 }} 
      transition={{ type: 'spring', stiffness: 400, damping: 12 }}
    >
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
          <span style={{ fontFamily: 'var(--font-main)', fontWeight: '900', fontSize: isMobile ? '0.9rem' : '1rem', color: syncActive ? '#1e40af' : '#6b7280' }}>
            {syncActive ? t.syncing : t.connectHint}
          </span>
        }
        rightContent={
          <motion.div 
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}
            style={{ background: syncActive ? '#dbeafe' : '#f3f4f6', color: syncActive ? '#1e40af' : '#6b7280', padding: '8px 16px', borderRadius: '16px', border: syncActive ? '3.5px solid #93c5fd' : '3.5px solid #e5e7eb', borderBottomWidth: '7px', boxShadow: syncActive ? '0 4px 10px rgba(59,130,246,0.1)' : '0 4px 10px rgba(0,0,0,0.05)', fontFamily: 'var(--font-main)', fontSize: isMobile ? '0.8rem' : '0.9rem', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            {syncActive ? <Wifi size={18} strokeWidth={3} /> : <WifiOff size={18} strokeWidth={3} />} {syncActive ? t.connected : t.offline}
          </motion.div>
        }
      />
    </motion.div>

    <motion.div 
      initial="hidden" 
      animate="visible" 
      variants={{ visible: { transition: { staggerChildren: 0.15, delayChildren: 0.1 } } }} 
      style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', width: '100%', maxWidth: isMobile ? '100%' : '440px', margin: '0 auto' }}
    >
      {syncActive ? (
        <>
          {/* Active: Cloud Details Card */}
          <motion.div 
            variants={smashVariant} 
            whileHover={{ scale: 1.025, rotate: 1, y: -4 }} 
            style={{ 
              width: '100%', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '20px', 
              background: '#eff6ff', 
              border: '3.5px solid #93c5fd', 
              borderBottom: '9.5px solid #60a5fa', 
              borderRadius: '28px', 
              padding: isMobile ? '18px' : '24px',
              boxShadow: '0 12px 32px rgba(59, 130, 246, 0.15)'
            }}
          >
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} style={{ width: 16, height: 16, borderRadius: '6px', background: '#3b82f6', flexShrink: 0, border: '2.5px solid #1e40af' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-main)', fontSize: isMobile ? '1rem' : '1.2rem', fontWeight: '900', color: '#1e3a8a' }}>{t.cloudConnection}</div>
                {lastSynced && <div style={{ fontFamily: 'var(--font-main)', fontSize: '0.9rem', fontWeight: '900', color: '#3b82f6', marginTop: '4px' }}>{t.lastSync}: {lastSynced.toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit' })}</div>}
              </div>
            </div>

            <div style={{ 
              width: '100%', 
              display: 'flex', 
              flexDirection: isMobile ? 'column' : 'row', 
              alignItems: isMobile ? 'stretch' : 'center', 
              gap: '14px', 
              background: '#fff', 
              border: '3.5px solid #bfdbfe', 
              borderBottom: '6px solid #bfdbfe',
              borderRadius: '20px', 
              padding: '16px 20px', 
              boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.03)' 
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-main)', fontWeight: '900', fontSize: '0.85rem', color: '#64748b', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={14} strokeWidth={2.5} /> {t.shareKey}
                </div>
                <span style={{ fontFamily: 'var(--font-main)', fontSize: isMobile ? '1.35rem' : '1.8rem', fontWeight: '900', color: '#1e40af', letterSpacing: isMobile ? '0.08em' : '0.15em', lineHeight: 1 }}>{syncKey}</span>
              </div>
              
              <motion.button 
                onClick={handleCopy} 
                whileHover={{ scale: 1.15, rotate: 5, y: -2 }} 
                whileTap={{ scale: 0.9, rotate: -5, y: 8 }} 
                style={{ background: copied ? '#dcfce7' : '#eff6ff', border: copied ? '3px solid #22c55e' : '3px solid #3b82f6', borderBottom: copied ? '7px solid #16a34a' : '7px solid #2563eb', borderRadius: '16px', cursor: 'pointer', color: copied ? '#15803d' : '#1d4ed8', padding: isMobile ? '12px' : '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}
              >
                {copied ? <Check size={24} strokeWidth={4} /> : <Copy size={24} strokeWidth={4} />}
              </motion.button>
            </div>
            
          </motion.div>

          {/* Active: Disconnect Smash Button */}
          <motion.button 
            variants={smashVariant} 
            onClick={handleDisconnect} 
            whileHover={{ scale: 1.04, rotate: -1.5, y: -4 }} 
            whileTap={{ scale: 0.9, rotate: 2, y: 10 }} 
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '18px', background: '#fef2f2', border: '3.5px solid #f87171', borderBottom: '9.5px solid #ef4444', borderRadius: '20px', cursor: 'pointer', fontFamily: 'var(--font-main)', fontSize: isMobile ? '1rem' : '1.2rem', fontWeight: '900', color: '#b91c1c', marginTop: '12px', boxShadow: '0 8px 24px rgba(239, 68, 68, 0.1)' }}
          >
            <WifiOff size={22} strokeWidth={3} /> {toUiLabelCase(t.disconnect)}
          </motion.button>
        </>
      ) : (
        <>
          {/* Inactive: Create Sync Key Smash Button */}
          <motion.button 
            variants={smashVariant} 
            onClick={handleGenerate} 
            disabled={loading === 'gen'} 
            whileHover={{ scale: 1.03, y: -4, rotate: -1.5 }} 
            whileTap={{ scale: 0.9, y: 10, rotate: 2 }} 
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: isMobile ? '16px 18px' : '20px 28px', width: '100%', background: '#3b82f6', color: '#fff', border: '3.5px solid #1e40af', borderBottom: '9.5px solid #1e3a8a', borderRadius: '24px', cursor: loading === 'gen' ? 'wait' : 'pointer', fontFamily: 'var(--font-main)', fontSize: isMobile ? '1.08rem' : '1.3rem', fontWeight: '900', boxShadow: '0 12px 32px rgba(59, 130, 246, 0.25)', transition: 'background 0.2s ease' }}
          >
            {loading === 'gen' ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}><Loader2 size={24} strokeWidth={4} /></motion.div> : <KeyRound size={24} strokeWidth={4} />}
            {toUiLabelCase(loading === 'gen' ? t.creating : t.createSyncKey)}
          </motion.button>

          <motion.div variants={smashVariant} style={{ display: 'flex', alignItems: 'center', gap: '18px', width: '100%', margin: '12px 0' }}>
            <div style={{ flex: 1, height: '3.5px', background: '#e2e8f0', borderRadius: '999px' }} />
            <span style={{ fontFamily: 'var(--font-main)', fontSize: '1.1rem', color: '#94a3b8', fontWeight: '900', opacity: 0.8 }}>{toUiLabelCase(t.orJoin)}</span>
            <div style={{ flex: 1, height: '3.5px', background: '#e2e8f0', borderRadius: '999px' }} />
          </motion.div>

          {/* Inactive: Join Card */}
          <motion.div 
            variants={smashVariant} 
            whileHover={{ scale: 1.02, rotate: 0.8, y: -2 }}
            style={{ width: '100%', background: '#f5f3ff', border: '3.5px solid #c4b5fd', borderBottom: '9.5px solid #8b5cf6', borderRadius: '28px', padding: isMobile ? '18px' : '24px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 8px 24px rgba(139, 92, 246, 0.1)' }}
          >
            <span style={{ fontFamily: 'var(--font-main)', fontSize: '1.1rem', color: '#6d28d9', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ArrowDownToLine size={20} strokeWidth={3} /> {toUiLabelCase(t.join)}
            </span>
            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '12px' }}>
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
                style={{ flex: 1, padding: '14px', fontFamily: 'var(--font-main)', fontSize: isMobile ? '1.12rem' : '1.4rem', fontWeight: '900', letterSpacing: isMobile ? '0.08em' : '0.15em', textAlign: 'center', border: '3.5px solid #ddd6fe', borderBottom: '7px solid #c4b5fd', borderRadius: '18px', background: '#fff', color: '#4c1d95', outline: 'none', transition: 'all 0.2s', minWidth: 0, boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.03)' }}
                onFocus={e => { e.target.style.borderColor = '#a78bfa'; e.target.style.borderBottomColor = '#8b5cf6'; }}
                onBlur={e => { e.target.style.borderColor = '#ddd6fe'; e.target.style.borderBottomColor = '#c4b5fd'; }}
              />
              <motion.button 
                onClick={handleJoin} 
                disabled={loading === 'join' || inputKey.length < 9} 
                whileHover={{ scale: 1.08, y: -4, rotate: 3 }} 
                whileTap={{ scale: 0.9, y: 10, rotate: -2 }} 
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: isMobile ? '12px 18px' : '0 24px', background: '#a855f7', color: '#fff', border: '3.5px solid #9333ea', borderBottom: '7.5px solid #7e22ce', borderRadius: '18px', cursor: (loading === 'join' || inputKey.length < 9) ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-main)', fontSize: isMobile ? '1rem' : '1.2rem', fontWeight: '900', flexShrink: 0, width: isMobile ? '100%' : 'auto', opacity: inputKey.length < 9 ? 0.5 : 1, boxShadow: '0 4px 12px rgba(168, 85, 247, 0.2)' }}
              >
                {loading === 'join' ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}><Loader2 size={24} strokeWidth={4} /></motion.div> : toUiLabelCase(t.join)}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}

      <AnimatePresence>
        {status && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: 20, rotate: -1 }} 
            animate={{ opacity: 1, scale: 1, y: 0, rotate: 1 }} 
            exit={{ opacity: 0, scale: 0.8, y: -20 }} 
            transition={{ type: 'spring', stiffness: 500, damping: 15 }}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center', padding: '16px 20px', marginTop: '16px', borderRadius: '24px', border: '3.5px solid', borderBottomWidth: '10.5px', fontFamily: 'var(--font-main)', fontSize: '1.1rem', fontWeight: '900', background: status.type === 'success' ? '#f0fdf4' : status.type === 'error' ? '#fef2f2' : '#eff6ff', borderColor: status.type === 'success' ? '#4ade80' : status.type === 'error' ? '#f87171' : '#60a5fa', borderBottomColor: status.type === 'success' ? '#22c55e' : status.type === 'error' ? '#ef4444' : '#3b82f6', color: status.type === 'success' ? '#14532d' : status.type === 'error' ? '#7f1d1d' : '#1e3a8a', width: '100%', textAlign: 'center', boxShadow: '0 12px 32px rgba(0,0,0,0.1)' }}
          >
            {status.type === 'success' ? <Check size={22} strokeWidth={4} /> : status.type === 'error' ? <AlertCircle size={22} strokeWidth={4} /> : <RefreshCw size={22} strokeWidth={4} />} {status.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  </div>
);

export default SyncTab;

