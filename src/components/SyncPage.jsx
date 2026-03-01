/* eslint-disable no-unused-vars */
import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Globe,
} from 'lucide-react';
import { CHAPTERS, VOLUMES, isMainChapter, VOL_COLORS } from '../data/chapters';
import {
    UI_TEXT,
    LOCALE_BY_UI_LANGUAGE,
    NOTE_PALETTES,
    VOL_BGS,
    getChapterWord,
    getVolumeTitle,
    getReadTier,
    MEDAL_ICONS,
    MEDAL_COLORS,
    SYNC_API_BASE,
    collectSyncData,
    TAB_META,
} from './sync/syncConfig';
import ProgressTab from './sync/tabs/ProgressTab';
import LeaderboardTab from './sync/tabs/LeaderboardTab';
import SyncTab from './sync/tabs/SyncTab';
import { CONTENT_SLIDE, TRANSITION_TAB } from './shared/animationPresets';
import { ListRow, MiniChapterRow, TabSelector } from './sync/syncSharedComponents';
import { useSubtabShortcutNavigation } from '../hooks/useSubtabShortcutNavigation';

const SyncPage = ({ isMobile, uiLanguage = 'en', subtabShortcut, finishedCount = 0, finished = new Set(), readCounts = {}, reloadFromStorage, onReadChapter, trackExternalLink, cancelExternalLink, unmarkFinished, incrementReadCount, getRemainingCooldown, pendingLinks, syncData }) => {
    const t = UI_TEXT[uiLanguage] || UI_TEXT.en;
    const locale = LOCALE_BY_UI_LANGUAGE[uiLanguage] || 'en-US';
    const tabs = [
        { ...TAB_META[0], title: t.progress, short: t.overview },
        { ...TAB_META[1], title: t.leaderboard, short: t.rereads },
        { ...TAB_META[2], title: t.sync, short: t.sync },
    ];
    const [activeTab, setActiveTab] = useState(0);
    const [expandedVol, setExpandedVol] = useState(null);

    const totalChapters = CHAPTERS.filter(c => isMainChapter(c.number) && (c.links.en || (c.links.jp?.length > 0) || (c.pages?.length > 0))).length;
    const finishedCountMain = Array.from(finished).filter(num => isMainChapter(num)).length;
    const progressPct = totalChapters > 0 ? Math.round((finishedCountMain / totalChapters) * 100) : 0;

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
    // Using global sync hook passed as prop
    const { syncKey, setSyncKey, syncActive, setSyncActive, lastSynced, pushData, pullData, disconnect } = syncData || {};
    
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
        // Clear all progress data and disconnect
        disconnect?.();
        setStatus({ type: 'info', msg: t.disconnectedCleared || UI_TEXT.en.disconnectedCleared });
    }, [disconnect, t.disconnectedCleared]);


    const handleCopy = useCallback(() => {
        if (syncKey) { navigator.clipboard.writeText(syncKey); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    }, [syncKey]);

    return (
        <div style={{ width: '100%', padding: isMobile ? '24px 8px 10px 8px' : '28px 40px', minHeight: isMobile ? 'auto' : '600px', display: 'flex', flexDirection: 'column', overflow: 'visible', flex: 1 }}>
            {/* Header (Desktop + Mobile inline) */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: isMobile ? 'center' : 'space-between', marginBottom: isMobile ? '16px' : '26px', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '12px' : '0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', justifyContent: 'center' }}>
                    <Globe size={isMobile ? 24 : 22} style={{ color: 'var(--pop-blue)' }} />
                    <span style={{ fontFamily: 'Sniglet, var(--font-main)', color: '#6b7280', fontSize: isMobile ? '1.5rem' : '1.3rem', fontWeight: 'normal' }}>{t.syncHeader || UI_TEXT.en.syncHeader}</span>
                </div>
                <TabSelector activeTab={activeTab} setActiveTab={setActiveTab} isMobile={isMobile} tabs={tabs} />
            </div>

            {/* Content pane */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={CONTENT_SLIDE.initial} animate={CONTENT_SLIDE.animate} exit={CONTENT_SLIDE.exit}
                    transition={TRANSITION_TAB}
                    className="hide-scrollbar" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', overflowY: isMobile ? 'visible' : 'auto', maxHeight: isMobile ? 'none' : 'min(550px, calc(100vh - 280px))', padding: '4px' }}
                >
                    {activeTab === 0 && (
                        <ProgressTab
                            isMobile={isMobile}
                            progressPct={progressPct}
                            t={t}
                            finishedCountMain={finishedCountMain}
                            totalChapters={totalChapters}
                            totalReads={totalReads}
                            expandedVol={expandedVol}
                            setExpandedVol={setExpandedVol}
                            uiLanguage={uiLanguage}
                            finished={finished}
                            onReadChapter={onReadChapter}
                            trackExternalLink={trackExternalLink}
                            cancelExternalLink={cancelExternalLink}
                            unmarkFinished={unmarkFinished}
                            readCounts={readCounts}
                            incrementReadCount={incrementReadCount}
                            getRemainingCooldown={getRemainingCooldown}
                            pendingLinks={pendingLinks}
                            ListRow={ListRow}
                            MiniChapterRow={MiniChapterRow}
                        />
                    )}
                    {activeTab === 1 && (
                        <LeaderboardTab
                            isMobile={isMobile}
                            isLoadingLeaderboard={isLoadingLeaderboard}
                            leaderboard={leaderboard}
                            t={t}
                            uiLanguage={uiLanguage}
                            ListRow={ListRow}
                        />
                    )}
                    {activeTab === 2 && (
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
                        />
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default SyncPage;
