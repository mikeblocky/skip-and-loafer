/* eslint-disable no-unused-vars */
import { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Globe,
    BookOpen,
    List,
    ChevronLeft,
    ChevronRight,
    X,
    ShoppingBag,
    Tv,
    Award
} from 'lucide-react';
import { CHAPTERS, VOLUMES, isMainChapter, VOL_COLORS } from '../data/chapters';
import {
    UI_TEXT,
    LOCALE_BY_UI_LANGUAGE,
    SYNC_API_BASE,
    collectSyncData,
    TAB_META,
    VOL_BGS,
    getVolumeTitle
} from '../features/sync/syncConfig';
import ProgressTab from '../features/sync/tabs/ProgressTab';
import LeaderboardTab from '../features/sync/tabs/LeaderboardTab';
import SyncTab from '../features/sync/tabs/SyncTab';
import { CONTENT_SLIDE_COMPACT, TRANSITION_TAB } from '../components/shared/animationPresets';
import { ListRow, MiniChapterRow, TabSelector } from '../features/sync/syncSharedComponents';
import { useSubtabShortcutNavigation } from '../hooks/shared/useSubtabShortcutNavigation';
import { toUiLabelCase } from '../utils/textCase';
import usePageTitle from '../hooks/shared/usePageTitle';
import { getUI } from '../i18n/ui';
import PaperPageHeader from '../components/shared/paper/PaperPageHeader';
import PaperHeadingBadge from '../components/shared/paper/PaperHeadingBadge';
import { triggerHaptic } from '../utils/haptics';

const SyncPage = ({ isMobile, uiLanguage = 'en', subtabShortcut, finishedCount = 0, finished = new Set(), readCounts = {}, reloadFromStorage, onReadChapter, trackExternalLink, cancelExternalLink, unmarkFinished, incrementReadCount, getRemainingCooldown, pendingLinks, syncData, outerSwitcher }) => {
    const t = UI_TEXT[uiLanguage] || UI_TEXT.en;
    const tGlobal = getUI(uiLanguage);

    usePageTitle(tGlobal.tabs?.sync?.label || 'Reading');

    const locale = LOCALE_BY_UI_LANGUAGE[uiLanguage] || 'en-US';
    
    // Viewport tabs (Manga Progress Shelf and Community rankings)
    const tabs = [
        { id: 'progress', title: t.progress, short: t.overview, icon: BookOpen, color: '#10b981' },
        { id: 'leaderboard', title: t.leaderboard, short: t.rereads, icon: List, color: '#f59e0b' },
    ];
    const [activeTab, setActiveTab] = useState(0);
    const [expandedVol, setExpandedVol] = useState(null);

    const totalChapters = CHAPTERS.filter(c => isMainChapter(c.number) && (c.links.en || (c.links.jp?.length > 0) || (c.pages?.length > 0))).length;
    const finishedCountMain = Array.from(finished).filter(num => isMainChapter(num)).length;
    const progressPct = totalChapters > 0 ? Math.round((finishedCountMain / totalChapters) * 100) : 0;
    const activeVolumes = VOLUMES.filter((vol) => vol.chapters.some((chapterNumber) => finished.has(chapterNumber))).length;

    /* ── Reread data ── */
    const rereadEntries = Object.entries(readCounts)
        .map(([ch, count]) => ({ chapter: parseFloat(ch), count }))
        .filter(e => e.count > 0)
        .sort((a, b) => b.count - a.count);
    const totalReads = rereadEntries.reduce((sum, e) => sum + e.count, 0);

    const [leaderboard, setLeaderboard] = useState([]);
    const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);

    useEffect(() => {
        if (activeTab === 1) {
            setIsLoadingLeaderboard(true);
            fetch('/api/reads/top')
                .then(res => res.json())
                .then(data => {
                    if (data.leaderboard) setLeaderboard(data.leaderboard);
                })
                .catch(err => console.error('Failed to fetch leaderboard:', err))
                .finally(() => setIsLoadingLeaderboard(false));
        }
    }, [activeTab]);

    useSubtabShortcutNavigation({
        subtabShortcut,
        tabCount: tabs.length,
        onNavigate: setActiveTab,
    });

    /* ── Sync state ── */
    const { syncKey, setSyncKey, syncActive, setSyncActive, lastSynced, pushData, pullData, disconnect, pushNow } = syncData || {};
    
    // Local UI state
    const [inputKey, setInputKey] = useState('');
    const [loading, setLoading] = useState(null);
    const [status, setStatus] = useState(null);
    const [copied, setCopied] = useState(false);

    const handleGenerate = useCallback(async () => {
        setLoading('gen'); setStatus(null);
        try {
            const data = collectSyncData();
            const res = await fetch(`${SYNC_API_BASE}/create`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ data }) });
            if (!res.ok) throw new Error('Failed');
            const { key } = await res.json();
            setSyncKey(key); setSyncActive(true); 
            setStatus({ type: 'success', msg: (t.syncingWithKey || UI_TEXT.en.syncingWithKey).replace('{key}', key) });
        } catch (e) { setStatus({ type: 'error', msg: e.message }); } finally { setLoading(null); }
    }, [setSyncKey, setSyncActive, t.syncingWithKey]);

    const handleJoin = useCallback(async () => {
        const key = inputKey.trim();
        if (!key) { setStatus({ type: 'error', msg: t.enterKey || UI_TEXT.en.enterKey }); return; }
        setLoading('join'); setStatus(null);
        try {
            if (await pullData(key)) { 
                setSyncKey(key); 
                setSyncActive(true); 
                setInputKey(''); 
                setStatus({ type: 'success', msg: t.connectedNow || UI_TEXT.en.connectedNow }); 
            }
            else setStatus({ type: 'error', msg: t.keyNotFound || UI_TEXT.en.keyNotFound });
        } catch (e) { setStatus({ type: 'error', msg: e.message }); } finally { setLoading(null); }
    }, [inputKey, pullData, setSyncKey, setSyncActive, t.enterKey, t.connectedNow, t.keyNotFound]);

    const handleDisconnect = useCallback(() => {
        disconnect?.();
        setStatus({ type: 'info', msg: t.disconnectedCleared || UI_TEXT.en.disconnectedCleared });
    }, [disconnect, t.disconnectedCleared]);

    const handleCopy = useCallback(() => {
        if (syncKey) { navigator.clipboard.writeText(syncKey); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    }, [syncKey]);

    // Navigation inside detailed journal modal
    const expandedVolNumber = expandedVol?.number ?? expandedVol;

    const setExpandedVolNumber = useCallback((number) => {
        setExpandedVol((current) => ({
            number,
            anchorY: current?.anchorY ?? null,
        }));
    }, []);

    const handlePrevVolume = (currentVol) => {
        if (currentVol > 1) {
            triggerHaptic('tabSwitch');
            setExpandedVolNumber(currentVol - 1);
        }
    };

    const handleNextVolume = (currentVol) => {
        if (currentVol < VOLUMES.length) {
            triggerHaptic('tabSwitch');
            setExpandedVolNumber(currentVol + 1);
        }
    };

    const selectedVolume = VOLUMES.find(v => v.number === expandedVolNumber);
    const selectedVolChapters = selectedVolume
        ? selectedVolume.chapters.map((num) => CHAPTERS.find((ch) => ch.number === num)).filter(Boolean)
        : [];
    const selectedMainChapters = selectedVolume
        ? selectedVolume.chapters.filter((num) => isMainChapter(num))
        : [];
    const selectedFinishedCount = selectedMainChapters.filter((chNum) => finished.has(chNum)).length;
    const selectedTotalCount = selectedMainChapters.length;
    const selectedProgress = selectedTotalCount > 0 ? Math.round((selectedFinishedCount / selectedTotalCount) * 100) : 0;
    const selectedIsFinished = selectedTotalCount > 0 && selectedFinishedCount === selectedTotalCount;
    const selectedAccentColor = selectedVolume 
        ? (selectedIsFinished ? '#10b981' : (VOL_COLORS[selectedVolume.number] || '#8b5cf6')) 
        : '#8b5cf6';
    const selectedBgColor = selectedVolume 
        ? (selectedIsFinished ? '#e6f4ea' : (VOL_BGS[selectedVolume.number] || '#ffffff')) 
        : '#ffffff';

    return (
        <div
            style={{
                width: '100%',
                padding: isMobile ? '20px 14px 72px' : '28px 40px',
                minHeight: isMobile ? 'auto' : '620px',
                display: 'flex',
                flexDirection: 'column',
                gap: isMobile ? '16px' : '24px',
                overflow: expandedVol !== null ? 'hidden' : 'visible', // Clip modal to planner borders beautifully!
                flex: 1,
                boxSizing: 'border-box',
                position: 'relative' // Vital containment context for absolute layout modal
            }}
        >
            {/* Standardized Paper Header */}
            <PaperPageHeader
                isMobile={isMobile}
                center={outerSwitcher ?? (
                    <PaperHeadingBadge
                        isMobile={isMobile}
                        icon={Globe}
                        title={toUiLabelCase(t.syncHeader || UI_TEXT.en.syncHeader)}
                        palette={{
                            borderColor: '#3b82f6',
                            bottomColor: '#3b82f6',
                            shadow: '0 8px 18px rgba(59, 130, 246, 0.1)',
                        }}
                        titleColor="#3b82f6"
                        iconColor="#3b82f6"
                    />
                )}
                gapMobile="14px"
                paddingMobile="0"
                paddingDesktop="0"
                marginBottomMobile="0"
                marginBottomDesktop="0"
            />

            {/* Split Dashboard Content Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '300px 1fr',
                gap: isMobile ? '20px' : '28px',
                width: '100%',
                alignItems: 'start',
                flex: 1,
                boxSizing: 'border-box'
            }}>
                {/* LEFT SIDEBAR: Control Center & Stats Strip */}
                <div style={{ width: '100%', boxSizing: 'border-box' }}>
                    <SyncTab
                        isMobile={isMobile}
                        syncActive={syncActive}
                        t={t}
                        lastSynced={lastSynced}
                        locale={locale}
                        syncKey={syncKey}
                        copied={copied}
                        loading={loading}
                        inputKey={inputKey}
                        setInputKey={setInputKey}
                        status={status}
                        handleCopy={handleCopy}
                        handleDisconnect={handleDisconnect}
                        handleGenerate={handleGenerate}
                        handleJoin={handleJoin}
                        ListRow={ListRow}
                        progressPct={progressPct}
                        finishedCountMain={finishedCountMain}
                        totalChapters={totalChapters}
                        totalReads={totalReads}
                        activeVolumes={activeVolumes}
                        pushNow={pushNow}
                    />
                </div>

                {/* RIGHT HUB: Manga Shelf / Leaderboard rankings */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', minWidth: 0, boxSizing: 'border-box' }}>
                    {/* Pill view selector */}
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: isMobile ? 'center' : 'flex-start',
                        width: '100%',
                        borderBottom: '2.5px solid #e2e8f0',
                        paddingBottom: '10px',
                        boxSizing: 'border-box'
                    }}>
                        <TabSelector activeTab={activeTab} setActiveTab={setActiveTab} isMobile={isMobile} tabs={tabs} />
                    </div>

                    {/* Dashboard dynamic panel */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={CONTENT_SLIDE_COMPACT.initial} 
                            animate={CONTENT_SLIDE_COMPACT.animate} 
                            exit={CONTENT_SLIDE_COMPACT.exit}
                            transition={TRANSITION_TAB}
                            className="hide-scrollbar" 
                            style={{ 
                                display: 'flex', 
                                flexDirection: 'column', 
                                gap: '10px', 
                                overflowY: 'visible',
                                width: '100%',
                                boxSizing: 'border-box'
                            }}
                        >
                            {activeTab === 0 && (
                                <ProgressTab
                                    isMobile={isMobile}
                                    setExpandedVol={setExpandedVol}
                                    uiLanguage={uiLanguage}
                                    finished={finished}
                                />
                            )}
                            {activeTab === 1 && (
                                <LeaderboardTab
                                    isMobile={isMobile}
                                    isLoadingLeaderboard={isLoadingLeaderboard}
                                    leaderboard={leaderboard}
                                    t={t}
                                    uiLanguage={uiLanguage}
                                />
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* ── MITSUMI'S OPEN JOURNAL DETAILED DIARY MODAL (Confined inside the Planner page content block!) ── */}
            {typeof document !== 'undefined' && createPortal((
            <AnimatePresence>
                {expandedVol !== null && selectedVolume && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(15, 23, 42, 0.4)',
                            backdropFilter: 'blur(4px)',
                            zIndex: 2000,
                            display: 'flex',
                            alignItems: isMobile ? 'flex-start' : 'center',
                            justifyContent: 'center',
                            padding: isMobile ? '16px 10px' : '24px',
                            paddingTop: isMobile ? '16px' : '24px',
                            boxSizing: 'border-box',
                        }}
                        onClick={() => {
                            triggerHaptic('impactLight');
                            setExpandedVol(null);
                        }}
                    >
                        {/* Nav Arrows Outside Modal (Desktop Only) */}
                        {!isMobile && expandedVolNumber > 1 && (
                            <motion.button
                                whileHover={{ scale: 1.12, x: -4 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handlePrevVolume(expandedVolNumber);
                                }}
                                style={{
                                    position: 'absolute',
                                    left: '24px',
                                    top: '50%',
                                    marginTop: '-22px',
                                    background: '#ffffff',
                                    border: '3px solid #cbd5e1',
                                    borderBottomWidth: '6px',
                                    borderRadius: '50%',
                                    width: '44px',
                                    height: '44px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    boxShadow: '0 6px 12px rgba(0,0,0,0.1)',
                                    zIndex: 1010
                                }}
                            >
                                <ChevronLeft size={20} color="#475569" strokeWidth={3} />
                            </motion.button>
                        )}

                        {!isMobile && expandedVolNumber < VOLUMES.length && (
                            <motion.button
                                whileHover={{ scale: 1.12, x: 4 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleNextVolume(expandedVolNumber);
                                }}
                                style={{
                                    position: 'absolute',
                                    right: '24px',
                                    top: '50%',
                                    marginTop: '-22px',
                                    background: '#ffffff',
                                    border: '3px solid #cbd5e1',
                                    borderBottomWidth: '6px',
                                    borderRadius: '50%',
                                    width: '44px',
                                    height: '44px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    boxShadow: '0 6px 12px rgba(0,0,0,0.1)',
                                    zIndex: 1010
                                }}
                            >
                                <ChevronRight size={20} color="#475569" strokeWidth={3} />
                            </motion.button>
                        )}

                        {/* The Notebook Journal Container */}
                        <motion.div
                            initial={{ scale: 0.94, y: 15, rotate: -0.5 }}
                            animate={{ scale: 1, y: 0, rotate: 0 }}
                            exit={{ scale: 0.94, y: 15, rotate: 0.5 }}
                            transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                            onClick={(e) => e.stopPropagation()} // Prevent closing
                            className="planner-diary-modal no-override"
                            style={{
                                width: '100%',
                                maxWidth: isMobile ? '420px' : '820px',
                                maxHeight: isMobile ? '85vh' : '660px',
                                background: 'var(--surface-card, #ffffff)',
                                border: `3px solid ${selectedAccentColor}`,
                                borderBottom: `9px solid ${selectedAccentColor}`,
                                borderRadius: '24px',
                                display: 'flex',
                                flexDirection: 'column',
                                position: 'relative',
                                boxShadow: '0 12px 36px rgba(15, 23, 42, 0.16), 0 0 0 1px rgba(0,0,0,0.02)',
                                boxSizing: 'border-box',
                                overflowY: isMobile ? 'auto' : 'hidden',
                                overflowX: 'hidden'
                            }}
                        >
                            
                            {/* Close Button styled as a notebook tab */}
                            <motion.button
                                whileHover={{ scale: 1.05, y: -1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                    triggerHaptic('impactLight');
                                    setExpandedVol(null);
                                }}
                                style={{
                                    position: 'absolute',
                                    top: '12px',
                                    right: '12px',
                                    background: '#fef2f2',
                                    border: '2px solid #ef4444',
                                    borderBottomWidth: '4px',
                                    borderRadius: '10px',
                                    width: '32px',
                                    height: '32px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    zIndex: 20
                                }}
                            >
                                <X size={16} color="#ef4444" strokeWidth={3} />
                            </motion.button>

                            {/* Flat Notebook Spine Binders (Minimalist Sketchbook binders instead of 3D) */}
                            {!isMobile && (
                                <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    bottom: 0,
                                    left: 'calc(45% - 13px)',
                                    width: '26px',
                                    zIndex: 10,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-around',
                                    padding: '20px 0',
                                    boxSizing: 'border-box',
                                    pointerEvents: 'none',
                                }}>
                                    {Array.from({ length: 9 }).map((_, rIdx) => (
                                        <div 
                                            key={rIdx} 
                                            style={{
                                                width: '24px',
                                                height: '10px',
                                                background: '#cbd5e1',
                                                border: '2px solid #94a3b8',
                                                borderRadius: '4px',
                                                transform: 'rotate(-2deg)'
                                            }} 
                                        />
                                    ))}
                                </div>
                              )}

                            {/* JOURNAL PAGES CONTENT: Grid for double-page effect */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: isMobile ? '1fr' : '45% 55%',
                                height: isMobile ? 'auto' : '100%',
                                width: '100%',
                                boxSizing: 'border-box'
                            }}>
                                
                                {/* 📖 LEFT PAGE: Book Details & Stats */}
                                <div style={{
                                    background: `linear-gradient(135deg, ${selectedBgColor}10 0%, #ffffff 100%)`,
                                    padding: isMobile ? '16px 14px 10px' : '24px 20px',
                                    borderRight: isMobile ? 'none' : '2px dashed #cbd5e1',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '12px',
                                    boxSizing: 'border-box',
                                    overflowY: 'visible',
                                    justifyContent: 'flex-start',
                                    alignItems: 'center'
                                }}>
                                    
                                    {/* Volume Badge and Title */}
                                    <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                                        <span style={{ 
                                            fontFamily: '"Coming Soon", cursive', 
                                            fontSize: '0.8rem', 
                                            background: selectedAccentColor, 
                                            color: '#ffffff', 
                                            padding: '3px 10px', 
                                            borderRadius: '999px',
                                            fontWeight: '700',
                                            boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
                                        }}>
                                            Volume {selectedVolume.number}
                                        </span>
                                        <h2 style={{ 
                                            margin: '2px 0 0 0', 
                                            fontFamily: '"Coming Soon", cursive', 
                                            fontSize: '1.25rem', 
                                            fontWeight: '400', 
                                            color: '#1e293b' 
                                        }}>
                                            {getVolumeTitle(uiLanguage, selectedVolume.number)}
                                        </h2>
                                    </div>

                                    {/* Book Cover */}
                                    <div style={{
                                        width: isMobile ? '86px' : '110px',
                                        aspectRatio: '11 / 16',
                                        borderRadius: '10px',
                                        border: `2px solid ${selectedAccentColor}`,
                                        background: '#fff',
                                        boxShadow: '2px 4px 12px rgba(0,0,0,0.08)',
                                        position: 'relative',
                                        boxSizing: 'border-box'
                                    }}>
                                        <div style={{
                                            position: 'absolute',
                                            top: 0,
                                            bottom: 0,
                                            left: 0,
                                            width: '5px',
                                            background: 'linear-gradient(90deg, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0) 100%)',
                                            zIndex: 2,
                                            borderRadius: '6px 0 0 6px'
                                        }} />

                                        {selectedVolume.cover ? (
                                            <img 
                                                src={selectedVolume.cover} 
                                                alt="Vol Cover" 
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover',
                                                    borderRadius: '8px'
                                                }} 
                                            />
                                        ) : (
                                            <div style={{
                                                width: '100%',
                                                height: '100%',
                                                background: selectedBgColor,
                                                borderRadius: '8px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <BookOpen size={28} color={selectedAccentColor} />
                                            </div>
                                        )}
                                    </div>

                                    {/* Stats Box */}
                                    <div style={{ 
                                        width: '100%', 
                                        background: '#ffffff', 
                                        border: '2px solid #e2e8f0', 
                                        borderRadius: '14px', 
                                        padding: '8px 12px', 
                                        boxSizing: 'border-box',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.01)'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                            <span style={{ fontFamily: '"Coming Soon", cursive', fontSize: '0.74rem', color: '#64748b' }}>Completion progress</span>
                                            <span style={{ fontFamily: '"Coming Soon", cursive', fontSize: '0.8rem', fontWeight: '700', color: selectedAccentColor }}>{selectedProgress}%</span>
                                        </div>
                                        <div style={{ width: '100%', height: '6px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                                            <div style={{ width: `${selectedProgress}%`, height: '100%', background: selectedAccentColor, borderRadius: '999px' }} />
                                        </div>
                                    </div>

                                    {/* hanging Purchase Tags & Badges */}
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center', width: '100%' }}>
                                        {selectedVolume.anime && (
                                            <div style={{
                                                background: '#e0f2fe',
                                                border: '1.5px solid #7dd3fc',
                                                borderRadius: '8px',
                                                padding: '3px 8px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '3px',
                                                fontSize: '0.72rem',
                                                color: '#0369a1',
                                                fontFamily: 'var(--font-main)'
                                            }}>
                                                <Tv size={10} strokeWidth={2.5} />
                                                <span>{selectedVolume.anime}</span>
                                            </div>
                                        )}

                                        {selectedVolume.purchaseUrl && (
                                            <motion.a
                                                href={selectedVolume.purchaseUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                whileHover={{ scale: 1.03 }}
                                                whileTap={{ scale: 0.97 }}
                                                style={{
                                                    background: '#fef3c7',
                                                    border: '1.5px solid #fcd34d',
                                                    borderBottomWidth: '3px',
                                                    borderRadius: '8px',
                                                    padding: '3px 8px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '3px',
                                                    fontSize: '0.72rem',
                                                    color: '#d97706',
                                                    fontFamily: 'var(--font-main)',
                                                    textDecoration: 'none',
                                                }}
                                            >
                                                <ShoppingBag size={10} />
                                                <span>English US</span>
                                            </motion.a>
                                        )}

                                        {selectedVolume.purchaseUrlJp && (
                                            <motion.a
                                                href={selectedVolume.purchaseUrlJp}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                whileHover={{ scale: 1.03 }}
                                                whileTap={{ scale: 0.97 }}
                                                style={{
                                                    background: '#fee2e2',
                                                    border: '1.5px solid #fca5a5',
                                                    borderBottomWidth: '3px',
                                                    borderRadius: '8px',
                                                    padding: '3px 8px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '3px',
                                                    fontSize: '0.72rem',
                                                    color: '#b91c1c',
                                                    fontFamily: 'var(--font-main)',
                                                    textDecoration: 'none',
                                                }}
                                            >
                                                <ShoppingBag size={10} />
                                                <span>Japanese JP</span>
                                            </motion.a>
                                        )}
                                    </div>
                                </div>

                                {/* 🗒️ RIGHT PAGE: Chapters Checklist Scrolling Sheet */}
                                <div style={{
                                    padding: isMobile ? '8px 12px 14px' : '24px 24px 24px 30px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    height: isMobile ? 'auto' : '100%',
                                    minHeight: 0,
                                    boxSizing: 'border-box'
                                }}>
                                    {/* Journal Title Header */}
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        borderBottom: '2px solid #f1f5f9',
                                        paddingBottom: '6px',
                                        marginBottom: '10px'
                                    }}>
                                        <span style={{ 
                                            fontFamily: '"Coming Soon", cursive', 
                                            fontSize: '0.94rem', 
                                            fontWeight: '400', 
                                            color: '#475569',
                                        }}>
                                            Chapters log
                                        </span>
                                        <span style={{
                                            fontFamily: 'var(--font-hand)',
                                            fontSize: '0.76rem',
                                            color: '#94a3b8'
                                        }}>
                                            {selectedFinishedCount}/{selectedTotalCount}
                                        </span>
                                    </div>

                                    {/* Scrollable Chapter Grid */}
                                    <div 
                                        className="hide-scrollbar"
                                        style={{
                                            flex: 1,
                                            overflowY: isMobile ? 'visible' : 'auto',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '6px',
                                            paddingRight: '2px',
                                            paddingBottom: '16px'
                                        }}
                                    >
                                        {selectedVolChapters.length > 0 ? (
                                            selectedVolChapters.map((chapter, chapterIndex) => (
                                                <MiniChapterRow
                                                    key={chapter.number}
                                                    chapter={chapter}
                                                    index={chapterIndex}
                                                    isMobile={isMobile}
                                                    onReadChapter={onReadChapter}
                                                    isFinished={(num) => finished.has(num)}
                                                    trackExternalLink={trackExternalLink}
                                                    cancelExternalLink={cancelExternalLink}
                                                    unmarkFinished={unmarkFinished}
                                                    getReadCount={(num) => readCounts[num] || 0}
                                                    incrementReadCount={incrementReadCount}
                                                    getRemainingCooldown={getRemainingCooldown}
                                                    pendingLinks={pendingLinks}
                                                    plusReadLabel={t.plusRead}
                                                    uiLanguage={uiLanguage}
                                                />
                                            ))
                                        ) : (
                                            <div style={{ textAlign: 'center', padding: '30px 0', color: '#94a3b8', fontFamily: 'var(--font-hand)' }}>
                                                No chapters registered yet!
                                            </div>
                                        )}
                                    </div>
                                </div>

                            </div>

                            {/* Volume Switcher inside the modal footer (Mobile Only) */}
                            {isMobile && (
                                <div style={{
                                    position: 'sticky',
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    height: '44px',
                                    background: '#f8fafc',
                                    borderTop: '2px solid #e2e8f0',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '0 12px',
                                    boxSizing: 'border-box',
                                    zIndex: 20
                                }}>
                                    <motion.button
                                        disabled={expandedVolNumber <= 1}
                                        onClick={() => handlePrevVolume(expandedVolNumber)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: expandedVolNumber <= 1 ? '#cbd5e1' : selectedAccentColor,
                                            fontFamily: '"Coming Soon", cursive',
                                            fontSize: '0.8rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            cursor: 'pointer',
                                            opacity: expandedVolNumber <= 1 ? 0.5 : 1
                                        }}
                                    >
                                        <ChevronLeft size={14} /> Prev Vol
                                    </motion.button>
                                    <motion.button
                                        disabled={expandedVolNumber >= VOLUMES.length}
                                        onClick={() => handleNextVolume(expandedVolNumber)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: expandedVolNumber >= VOLUMES.length ? '#cbd5e1' : selectedAccentColor,
                                            fontFamily: '"Coming Soon", cursive',
                                            fontSize: '0.8rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            cursor: 'pointer',
                                            opacity: expandedVolNumber >= VOLUMES.length ? 0.5 : 1
                                        }}
                                    >
                                        Next Vol <ChevronRight size={14} />
                                    </motion.button>
                                </div>
                            )}

                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            ), document.body)}

        </div>
    );
};

export default SyncPage;
