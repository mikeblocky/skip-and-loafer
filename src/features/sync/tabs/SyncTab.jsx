import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, Cloud, Clock, Check, Copy, Loader2, KeyRound, ArrowDownToLine, AlertCircle, RefreshCw, BookOpen, CheckCircle2, Milestone } from 'lucide-react';
import { toUiLabelCase } from '../../../utils/textCase';
import { createPaperPanelStyle } from '../../../components/shared/paper/paperTheme';

const COMMUNITY_FONT_FAMILY = 'var(--font-paper)';

const smashVariant = {
  hidden: { y: -80, scale: 0.8, opacity: 0, rotate: -3 },
  visible: { 
    y: 0, 
    scale: 1, 
    opacity: 1, 
    rotate: 0, 
    transition: { type: 'spring', stiffness: 500, damping: 12, mass: 1 } 
  }
};

const SidebarStatPill = ({ label, value, color, icon: Icon }) => (
  <div 
    className="sketchbook-border"
    style={{
      ...createPaperPanelStyle({
        background: '#ffffff',
        borderColor: '#cbd5e1',
        bottomColor: color,
        radius: '14px',
        shadow: '0 4px 8px rgba(15,23,42,0.01)'
      }),
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '8px 12px',
      flex: '1 1 calc(50% - 6px)',
      minWidth: '96px',
      boxSizing: 'border-box',
    }}
  >
    <div 
      className="sketchbook-border"
      style={{
        width: '28px',
        height: '28px',
        borderRadius: '8px',
        background: '#ffffff',
        border: `2px solid ${color}33`,
        borderBottom: `4px solid ${color}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: color,
        flexShrink: 0,
      }}
    >
      <Icon size={13} strokeWidth={2.8} />
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0px', minWidth: 0 }}>
      <span style={{ fontFamily: COMMUNITY_FONT_FAMILY, fontSize: '0.94rem', color: '#1f2937', fontWeight: '400', lineHeight: 1.1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</span>
      <span style={{ fontFamily: 'var(--font-hand)', fontSize: '0.72rem', color: '#64748b', fontWeight: '400', lineHeight: 1.1 }}>{label}</span>
    </div>
  </div>
);

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
  progressPct = 0,
  finishedCountMain = 0,
  totalChapters = 0,
  totalReads = 0,
  activeVolumes = 0,
}) => {
  // Circular Progress Metrics
  const strokeWidth = 6.5;
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPct / 100) * circumference;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '16px', width: '100%', boxSizing: 'border-box' }}>
      
      {/* ── SECTION 1: CORE STATISTICS DASHBOARD ── */}
      <motion.div
        initial={{ opacity: 0, y: 8, rotate: -0.2 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        className="sketchbook-border"
        style={{
          ...createPaperPanelStyle({
            background: '#f0fdf4',
            borderColor: '#bbf7d0',
            bottomColor: '#10b981',
            radius: '24px',
            shadow: '0 8px 16px rgba(16, 185, 129, 0.04)'
          }),
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          width: '100%',
          boxSizing: 'border-box',
          position: 'relative',
        }}
      >
        {/* Washi tape badge corner accent */}
        <div 
          className="washi-tape washi-tape--yellow"
          style={{
            position: 'absolute',
            top: '-10px',
            right: '20px',
            width: '60px',
            height: '16px',
            transform: 'rotate(2deg)',
            zIndex: 5
          }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div 
              className="sketchbook-border"
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '6px', 
                background: '#ffffff', 
                border: '2px solid #a7f3d0', 
                borderBottom: '4.5px solid #10b981', 
                borderRadius: '999px', 
                padding: '4px 12px', 
                width: 'fit-content' 
              }}
            >
              <BookOpen size={13} strokeWidth={2.8} style={{ color: '#10b981' }} />
              <span style={{ fontFamily: COMMUNITY_FONT_FAMILY, fontSize: '0.78rem', color: '#065f46' }}>{t.overallCompletion || 'Overall completion'}</span>
            </div>
            <div style={{ fontFamily: COMMUNITY_FONT_FAMILY, fontSize: '0.86rem', color: '#475569', marginTop: '2px', paddingLeft: '4px' }}>
              Mitsumi's progress log
            </div>
          </div>

          {/* Radial Completion SVG Ring */}
          <div style={{ position: 'relative', width: '70px', height: '70px', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="70" height="70" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="35" cy="35" r={radius} stroke="#e2e8f0" strokeWidth={strokeWidth} fill="transparent" />
              <motion.circle 
                cx="35" 
                cy="35" 
                r={radius} 
                stroke="#10b981" 
                strokeWidth={strokeWidth} 
                fill="transparent" 
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.1, ease: 'easeOut' }}
                strokeLinecap="round"
              />
            </svg>
            <div style={{ position: 'absolute', fontFamily: COMMUNITY_FONT_FAMILY, fontSize: '1.05rem', color: '#047857', fontWeight: '400', textAlign: 'center', width: '100%', left: 0, top: '50%', transform: 'translateY(-50%)', display: 'flex', justifyContent: 'center' }}>
              {progressPct}%
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', width: '100%', boxSizing: 'border-box' }}>
          <SidebarStatPill label={t.chaptersDone || 'Chapters done'} value={`${finishedCountMain}/${totalChapters}`} color="#0f766e" icon={CheckCircle2} />
          <SidebarStatPill label={t.rereads || 'Rereads'} value={String(totalReads)} color="#1d4ed8" icon={RefreshCw} />
          <SidebarStatPill label={t.volumesLabel || 'Volumes'} value={`${activeVolumes}`} color="#7c3aed" icon={Milestone} />
        </div>
      </motion.div>

      {/* ── SECTION 2: CLOUD SYNC CONTROL CENTER ── */}
      <motion.div 
        initial="hidden" 
        animate="visible" 
        variants={{ visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } } }} 
        style={{ display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center', width: '100%', boxSizing: 'border-box' }}
      >
        {/* Cloud connection status card */}
        <motion.div 
          variants={smashVariant}
          className="sketchbook-border"
          style={{
            ...createPaperPanelStyle({
              background: syncActive ? '#eff6ff' : '#ffffff',
              borderColor: syncActive ? '#bfdbfe' : '#cbd5e1',
              bottomColor: syncActive ? '#3b82f6' : '#94a3b8',
              radius: '20px',
              shadow: '0 6px 12px rgba(15,23,42,0.03)'
            }),
            position: 'relative',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            boxSizing: 'border-box',
            width: '100%',
          }}
        >
          {/* Left Side: Badge + Description */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0, flex: 1 }}>
            <div
              className="sketchbook-border"
              style={{
                width: '38px',
                height: '38px',
                background: '#ffffff',
                border: `2.5px solid ${syncActive ? '#bfdbfe' : '#cbd5e1'}`,
                borderBottom: `5px solid ${syncActive ? '#3b82f6' : '#94a3b8'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: syncActive ? '#3b82f6' : '#64748b',
                flexShrink: 0,
              }}
            >
              <Cloud size={18} strokeWidth={2.8} />
            </div>

            <div style={{ display: 'grid', gap: '2px', minWidth: 0, flex: 1 }}>
              <span
                style={{
                  fontFamily: COMMUNITY_FONT_FAMILY,
                  fontSize: '1.05rem',
                  color: syncActive ? '#1d4ed8' : '#1e293b',
                  fontWeight: '400',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  lineHeight: 1.1,
                }}
              >
                {syncActive ? t.syncActive || 'Sync active' : t.syncInactive || 'Sync inactive'}
              </span>
              <span style={{ fontFamily: 'var(--font-hand)', color: syncActive ? '#1e40af' : '#6b7280', fontSize: '0.82rem' }}>
                {syncActive ? t.syncing || 'Syncing logs...' : t.connectHint || 'Connect to sync reads'}
              </span>
            </div>
          </div>

          {/* Right Side: Connectivity Badge */}
          <div 
            className="sketchbook-border"
            style={{ 
              background: '#ffffff', 
              color: syncActive ? '#1e40af' : '#6b7280', 
              padding: '6px 12px', 
              borderRadius: '12px', 
              border: `2px solid ${syncActive ? '#93c5fd' : '#e5e7eb'}`, 
              borderBottom: `4px solid ${syncActive ? '#3b82f6' : '#cbd5e1'}`,
              fontFamily: COMMUNITY_FONT_FAMILY, 
              fontSize: '0.8rem', 
              fontWeight: '400', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              flexShrink: 0
            }}
          >
            {syncActive ? <Wifi size={14} strokeWidth={3} /> : <WifiOff size={14} strokeWidth={3} />} 
            {syncActive ? t.connected || 'Connected' : t.offline || 'Offline'}
          </div>
        </motion.div>

        {syncActive ? (
          <>
            {/* Active: Cloud Details Card (Envelope Style) */}
            <motion.div 
              variants={smashVariant} 
              whileHover={{ scale: 1.01, rotate: 0.1, y: -1.5 }} 
              className="sketchbook-border"
              style={{ 
                ...createPaperPanelStyle({
                  background: '#eff6ff', 
                  borderColor: '#3b82f6', 
                  bottomColor: '#60a5fa', 
                  radius: '24px', 
                  shadow: '0 8px 24px rgba(59, 130, 246, 0.08)'
                }),
                width: '100%', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '14px', 
                padding: '16px',
                boxSizing: 'border-box',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <motion.div animate={{ scale: [1, 1.1, 1], rotate: [0, 90, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} style={{ width: 14, height: 14, borderRadius: '5px', background: '#3b82f6', flexShrink: 0, border: '2px solid #1e40af' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: COMMUNITY_FONT_FAMILY, fontSize: '0.96rem', fontWeight: '400', color: '#1e3a8a', lineHeight: 1.2 }}>{t.cloudConnection || 'Cloud connection'}</div>
                  {lastSynced && <div style={{ fontFamily: COMMUNITY_FONT_FAMILY, fontSize: '0.84rem', fontWeight: '400', color: '#3b82f6', marginTop: '2px' }}>{t.lastSync || 'Last sync'}: {lastSynced.toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit' })}</div>}
                </div>
              </div>

              <div 
                className="sketchbook-border"
                style={{ 
                  width: '100%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '10px', 
                  background: '#ffffff', 
                  border: '2.5px solid #bfdbfe', 
                  borderBottom: '4.5px solid #bfdbfe',
                  borderRadius: '16px', 
                  padding: '10px 14px', 
                  boxSizing: 'border-box'
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-hand)', fontSize: '0.78rem', color: '#64748b', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} strokeWidth={2.5} /> {t.shareKey || 'Your sharing code'}
                  </div>
                  <span style={{ fontFamily: COMMUNITY_FONT_FAMILY, fontSize: '1.3rem', fontWeight: '400', color: '#1e40af', letterSpacing: '0.08em', lineHeight: 1, wordBreak: 'break-all' }}>{syncKey}</span>
                </div>
                
                <motion.button 
                  onClick={handleCopy} 
                  whileHover={{ scale: 1.05, rotate: 1, y: -1.5 }} 
                  whileTap={{ scale: 0.95, rotate: -1, y: 0.5 }} 
                  className="sketchbook-border"
                  style={{ 
                    background: copied ? '#dcfce7' : '#ffffff', 
                    border: copied ? '2px solid #22c55e' : '2px solid #3b82f6', 
                    borderBottom: copied ? '4px solid #16a34a' : '4.5px solid #2563eb', 
                    borderRadius: '12px', 
                    cursor: 'pointer', 
                    color: copied ? '#15803d' : '#1d4ed8', 
                    padding: '10px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    flexShrink: 0 
                  }}
                >
                  {copied ? <Check size={18} strokeWidth={4} /> : <Copy size={18} strokeWidth={4} />}
                </motion.button>
              </div>
            </motion.div>

            {/* Active: Disconnect Smash Button */}
            <motion.button 
              variants={smashVariant} 
              onClick={handleDisconnect} 
              whileHover={{ scale: 1.015, rotate: -0.2, y: -1.5 }} 
              whileTap={{ scale: 0.98, rotate: 0.2, y: 1 }} 
              className="sketchbook-border"
              style={{ 
                width: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '8px', 
                padding: '12px', 
                ...createPaperPanelStyle({
                  background: '#fef2f2',
                  borderColor: '#f87171',
                  bottomColor: '#ef4444',
                  radius: '20px',
                  shadow: '0 4px 12px rgba(239, 68, 68, 0.04)'
                }),
                cursor: 'pointer', 
                fontFamily: COMMUNITY_FONT_FAMILY, 
                fontSize: '0.96rem', 
                fontWeight: '400', 
                color: '#b91c1c', 
                marginTop: '2px', 
                boxSizing: 'border-box' 
              }}
            >
              <WifiOff size={18} strokeWidth={3} /> {toUiLabelCase(t.disconnect || 'Disconnect')}
            </motion.button>
          </>
        ) : (
          <>
            {/* Inactive: Create Sync Key Smash Button */}
            <motion.button 
              variants={smashVariant} 
              onClick={handleGenerate} 
              disabled={loading === 'gen'} 
              whileHover={{ scale: 1.015, y: -2, rotate: -0.5 }} 
              whileTap={{ scale: 0.98, y: 1, rotate: 0.5 }} 
              className="sketchbook-border"
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '10px', 
                padding: '14px 16px', 
                width: '100%', 
                ...createPaperPanelStyle({
                  background: '#eff6ff',
                  borderColor: '#bfdbfe',
                  bottomColor: '#2563eb',
                  radius: '20px',
                  shadow: '0 6px 18px rgba(59, 130, 246, 0.1)'
                }),
                cursor: loading === 'gen' ? 'wait' : 'pointer', 
                fontFamily: COMMUNITY_FONT_FAMILY, 
                fontSize: '0.98rem', 
                fontWeight: '400', 
                color: '#1d4ed8', 
                boxSizing: 'border-box' 
              }}
            >
              {loading === 'gen' ? (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}>
                  <Loader2 size={18} strokeWidth={3} />
                </motion.div>
              ) : (
                <KeyRound size={18} strokeWidth={2.8} />
              )}
              {toUiLabelCase(loading === 'gen' ? t.creating || 'Creating...' : t.createSyncKey || 'Create new sync key')}
            </motion.button>

            {/* Hand-drawn look dashed notebook line divider */}
            <motion.div variants={smashVariant} style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', margin: '4px 0', boxSizing: 'border-box' }}>
              <div style={{ flex: 1, borderTop: '2.5px dashed #cbd5e1' }} />
              <span style={{ fontFamily: COMMUNITY_FONT_FAMILY, fontSize: '0.92rem', color: '#94a3b8', fontWeight: '400', opacity: 0.8 }}>{toUiLabelCase(t.orJoin || 'Or join')}</span>
              <div style={{ flex: 1, borderTop: '2.5px dashed #cbd5e1' }} />
            </motion.div>

            {/* Inactive: Join Card */}
            <motion.div 
              variants={smashVariant} 
              whileHover={{ scale: 1.008, rotate: 0.1, y: -1.5 }}
              className="sketchbook-border"
              style={{ 
                ...createPaperPanelStyle({
                  background: '#f5f3ff', 
                  borderColor: '#ddd6fe', 
                  bottomColor: '#8b5cf6', 
                  radius: '24px', 
                  shadow: '0 8px 24px rgba(139, 92, 246, 0.04)'
                }),
                width: '100%', 
                padding: '18px', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '12px', 
                boxSizing: 'border-box' 
              }}
            >
              <span style={{ fontFamily: COMMUNITY_FONT_FAMILY, fontSize: '0.98rem', color: '#6d28d9', fontWeight: '400', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ArrowDownToLine size={16} strokeWidth={3} /> {toUiLabelCase(t.join || 'Join')}
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', boxSizing: 'border-box' }}>
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
                  className="sketchbook-border"
                  style={{ 
                    width: '100%', 
                    padding: '10px', 
                    fontFamily: COMMUNITY_FONT_FAMILY, 
                    fontSize: '1.2rem', 
                    fontWeight: '400', 
                    letterSpacing: '0.08em', 
                    textAlign: 'center', 
                    border: '2.5px solid #ddd6fe', 
                    borderBottom: '4.5px solid #c4b5fd', 
                    borderRadius: '14px', 
                    background: '#ffffff', 
                    color: '#4c1d95', 
                    outline: 'none', 
                    boxSizing: 'border-box', 
                  }}
                />
                
                <motion.button 
                  onClick={handleJoin} 
                  disabled={loading === 'join' || inputKey.length < 9} 
                  whileHover={{ scale: 1.02, y: -2, rotate: 0.5 }} 
                  whileTap={{ scale: 0.98, y: 1, rotate: -0.5 }} 
                  className="sketchbook-border"
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    padding: '12px', 
                    ...createPaperPanelStyle({
                      background: '#f5f3ff',
                      borderColor: '#ddd6fe',
                      bottomColor: '#7e22ce',
                      radius: '14px',
                      shadow: '0 4px 10px rgba(168, 85, 247, 0.08)'
                    }),
                    cursor: (loading === 'join' || inputKey.length < 9) ? 'not-allowed' : 'pointer', 
                    fontFamily: COMMUNITY_FONT_FAMILY, 
                    fontSize: '0.96rem', 
                    fontWeight: '400', 
                    width: '100%', 
                    color: '#6d28d9',
                    opacity: inputKey.length < 9 ? 0.55 : 1, 
                    boxSizing: 'border-box' 
                  }}
                >
                  {loading === 'join' ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}>
                      <Loader2 size={18} strokeWidth={3} />
                    </motion.div>
                  ) : (
                    toUiLabelCase(t.join || 'Join')
                  )}
                </motion.button>
              </div>
            </motion.div>
          </>
        )}

        <AnimatePresence>
          {status && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98, y: 6, rotate: -0.1 }} 
              animate={{ opacity: 1, scale: 1, y: 0, rotate: 0.1 }} 
              exit={{ opacity: 0, scale: 0.98, y: -6 }} 
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              className="sketchbook-border"
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                justifyContent: 'center', 
                padding: '10px 14px', 
                marginTop: '4px', 
                ...createPaperPanelStyle({
                  background: status.type === 'success' ? '#f0fdf4' : status.type === 'error' ? '#fef2f2' : '#eff6ff', 
                  borderColor: status.type === 'success' ? '#4ade80' : status.type === 'error' ? '#f87171' : '#60a5fa', 
                  bottomColor: status.type === 'success' ? '#22c55e' : status.type === 'error' ? '#ef4444' : '#3b82f6', 
                  radius: '16px',
                  shadow: '0 6px 16px rgba(0,0,0,0.04)'
                }),
                fontFamily: COMMUNITY_FONT_FAMILY, 
                fontSize: '0.94rem', 
                fontWeight: '400', 
                color: status.type === 'success' ? '#14532d' : status.type === 'error' ? '#7f1d1d' : '#1e3a8a', 
                width: '100%', 
                textAlign: 'center', 
                boxSizing: 'border-box' 
              }}
            >
              {status.type === 'success' ? <Check size={18} strokeWidth={4} /> : status.type === 'error' ? <AlertCircle size={18} strokeWidth={4} /> : <RefreshCw size={18} strokeWidth={4} />} 
              {status.msg}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default SyncTab;
