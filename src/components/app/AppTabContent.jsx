import { Suspense, memo, useMemo } from 'react';
import useIdlePreload from '../../hooks/app/useIdlePreload';
import {
  BlogPage,
  BirthdayPage,
  ChaptersPage,
  ChatPage,
  GalleryPage,
  getAppTabPreloaders,
  MysteryPage,
  PlannerPage,
  QuizPage,
  SyncPage,
} from './appPageLoaders';

const PAGE_SHELL_STYLE = {
  width: '100%',
  backgroundColor: 'var(--paper-white)',
  backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, var(--line-blue) 32px)',
  backgroundSize: '100% 32px',
  borderRadius: '4px',
  flex: 1,
  contain: 'layout paint style',
};

const TabFallback = ({ isMobile, label = 'Loading...' }) => (
  <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', padding: isMobile ? '20px 16px' : '28px' }}>
    <div
      className="sketchbook-border"
      style={{
        minWidth: isMobile ? 'min(88vw, 260px)' : '280px',
        padding: isMobile ? '16px 18px' : '18px 22px',
        borderRadius: '22px',
        border: '3px solid #bfdbfe',
        borderBottom: '7px solid #93c5fd',
        background: '#ffffff',
        boxShadow: '0 10px 20px rgba(148, 163, 184, 0.12)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
      }}
    >
      <div
        style={{
          width: isMobile ? '132px' : '150px',
          height: '8px',
          borderRadius: '999px',
          background: 'linear-gradient(90deg, #dbeafe 0%, #93c5fd 50%, #dbeafe 100%)',
          backgroundSize: '200% 100%',
          animation: 'plannerShimmer 1.3s linear infinite',
        }}
      />
      <span style={{ fontFamily: 'var(--font-hand)', fontSize: isMobile ? '0.98rem' : '1rem', color: '#64748b', textAlign: 'center' }}>
        {label}
      </span>
    </div>
  </div>
);

const getFallbackLabel = (activePage, isMobile) => {
  switch (activePage) {
    case 'gallery':
      return isMobile ? 'Loading gallery...' : 'Loading gallery view...';
    case 'blog':
      return isMobile ? 'Loading blog...' : 'Loading blog posts...';
    case 'sync':
      return isMobile ? 'Loading reading...' : 'Loading reading stats...';
    case 'quiz':
      return isMobile ? 'Loading quiz...' : 'Loading quiz page...';
    case 'birthdays':
      return isMobile ? 'Loading birthdays...' : 'Loading birthday page...';
    case 'mystery':
      return isMobile ? 'Loading mystery...' : 'Loading mystery page...';
    case 'chat':
      return isMobile ? 'Loading chat...' : 'Loading chat room...';
    default:
      return isMobile ? 'Loading...' : 'Loading page...';
  }
};

const TabFrame = ({ activePage, children, isMobile, style, fallbackLabel }) => (
  <div key={activePage} style={style}>
    <Suspense fallback={<TabFallback isMobile={isMobile} label={fallbackLabel} />}>
      {children}
    </Suspense>
  </div>
);

const AppTabContent = ({
  activePage,
  isMobile,
  uiLanguage,
  subtabShortcut,
  setReaderChapter,
  isFinished,
  trackExternalLink,
  cancelExternalLink,
  markFinished,
  unmarkFinished,
  getReadCount,
  incrementReadCount,
  getRemainingCooldown,
  pendingLinks,
  finishedCount,
  finished,
  readCounts,
  reloadFromStorage,
  syncData,
  accessibilityPrefs,
  handleMainTouchStart,
  handleMainTouchEnd,
}) => {
  const tabPreloaders = useMemo(() => getAppTabPreloaders(activePage), [activePage]);
  const fallbackLabel = useMemo(() => getFallbackLabel(activePage, isMobile), [activePage, isMobile]);
  const isLargeText = !!accessibilityPrefs?.largeText;
  const hasReadableSpacing = !!accessibilityPrefs?.readableSpacing;
  const homeDesktopMinHeight = isLargeText ? '590px' : (hasReadableSpacing ? '560px' : '530px');
  const homeDesktopPadding = isLargeText || hasReadableSpacing ? '10px 10px 14px' : '8px 8px 12px';
  const sharedPageShellStyle = useMemo(
    () => ({ ...PAGE_SHELL_STYLE, display: 'flex', flexDirection: 'column' }),
    [],
  );

  useIdlePreload(tabPreloaders, activePage !== 'home', {
    delayMs: activePage === 'home' ? 1100 : 520,
    staggerMs: isMobile ? 340 : 220,
    maxPreloadCount: 1,
  });

  let tabContent = null;
  let frameStyle = activePage === 'home'
    ? (isMobile
      ? { display: 'contents' }
      : { ...sharedPageShellStyle, flexDirection: 'row', width: '100%', minHeight: homeDesktopMinHeight, margin: '0 auto', minWidth: 0 })
    : sharedPageShellStyle;

  switch (activePage) {
    case 'home':
      tabContent = (
        <PlannerPage
          isMobile={isMobile}
          uiLanguage={uiLanguage}
          largeText={isLargeText}
          readableSpacing={hasReadableSpacing}
        />
      );
      break;
    case 'chapters':
      tabContent = (
        <ChaptersPage
          isMobile={isMobile}
          uiLanguage={uiLanguage}
          subtabShortcut={subtabShortcut}
          onReadChapter={(ch) => setReaderChapter(ch)}
          isFinished={isFinished}
          trackExternalLink={trackExternalLink}
          cancelExternalLink={cancelExternalLink}
          markFinished={markFinished}
          unmarkFinished={unmarkFinished}
          getReadCount={getReadCount}
          incrementReadCount={incrementReadCount}
          getRemainingCooldown={getRemainingCooldown}
          pendingLinks={pendingLinks}
        />
      );
      break;
    case 'gallery':
      tabContent = <GalleryPage isMobile={isMobile} uiLanguage={uiLanguage} subtabShortcut={subtabShortcut} />;
      break;
    case 'blog':
      tabContent = <BlogPage isMobile={isMobile} uiLanguage={uiLanguage} />;
      break;
    case 'sync':
      frameStyle = { ...sharedPageShellStyle, flexDirection: isMobile ? 'column' : 'row' };
      tabContent = (
        <SyncPage
          isMobile={isMobile}
          uiLanguage={uiLanguage}
          subtabShortcut={subtabShortcut}
          finishedCount={finishedCount}
          finished={finished}
          readCounts={readCounts}
          reloadFromStorage={reloadFromStorage}
          onReadChapter={(ch) => setReaderChapter(ch)}
          trackExternalLink={trackExternalLink}
          cancelExternalLink={cancelExternalLink}
          markFinished={markFinished}
          unmarkFinished={unmarkFinished}
          incrementReadCount={incrementReadCount}
          getRemainingCooldown={getRemainingCooldown}
          pendingLinks={pendingLinks}
          syncData={syncData}
        />
      );
      break;
    case 'quiz':
      tabContent = <QuizPage isMobile={isMobile} uiLanguage={uiLanguage} subtabShortcut={subtabShortcut} />;
      break;
    case 'birthdays':
      tabContent = (
        <BirthdayPage
          isMobile={isMobile}
          uiLanguage={uiLanguage}
          reduceMotion={accessibilityPrefs.reduceMotion}
          simplifyVisuals={accessibilityPrefs.simplifyVisuals}
        />
      );
      break;
    case 'mystery':
      tabContent = <MysteryPage isMobile={isMobile} uiLanguage={uiLanguage} />;
      break;
    case 'chat':
      tabContent = <ChatPage isMobile={isMobile} uiLanguage={uiLanguage} />;
      break;
    default:
      tabContent = (
        <PlannerPage
          isMobile={isMobile}
          uiLanguage={uiLanguage}
          largeText={isLargeText}
          readableSpacing={hasReadableSpacing}
        />
      );
      frameStyle = { display: 'contents' };
      break;
  }

  return (
    <div
      id="main-content"
      role="main"
      aria-live="polite"
      className="planner-container"
      onTouchStart={handleMainTouchStart}
      onTouchEnd={handleMainTouchEnd}
      style={{
        width: '100%',
        flex: activePage === 'home' ? '0 0 auto' : 1,
        position: 'relative',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        padding: activePage === 'home' ? (isMobile ? '8px 0 0' : homeDesktopPadding) : 0,
        zIndex: 10,
        pointerEvents: 'auto',
        minHeight: isMobile ? 0 : undefined,
        overflowX: undefined,
        overflowY: 'hidden',
      }}
    >
      <TabFrame activePage={activePage} isMobile={isMobile} fallbackLabel={fallbackLabel} style={frameStyle}>
        {tabContent}
      </TabFrame>
    </div>
  );
};

export default memo(AppTabContent);
