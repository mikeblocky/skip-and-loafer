import { Suspense, memo, useMemo } from 'react';
import PaperLoadingState from '../../components/shared/paper/PaperLoadingState';
import useIdlePreload from './hooks/useIdlePreload';
import {
  BlogPage,
  BirthdayPage,
  ChaptersPage,
  FanGalleryPage,
  GalleryPage,
  getAppTabPreloaders,
  MysteryPage,
  PlannerPage,
  QuizPage,
  SignPage,
  SyncPage,
  WikiPage,
  SettingsPage,
  TutorialPage,
  AnimePage,
} from './appPageLoaders';

const PAGE_SHELL_STYLE = {
  width: '100%',
  borderRadius: '4px',
  flex: 1,
  contain: 'layout paint style',
};

const TabFallback = ({ isMobile, label = 'Loading...' }) => (
  <PaperLoadingState
    isMobile={isMobile}
    label={label}
    containerStyle={{
      display: 'flex',
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: isMobile ? '20px 16px' : '28px',
    }}
    cardStyle={{
      minWidth: isMobile ? 'min(88vw, 260px)' : '280px',
      padding: isMobile ? '16px 18px' : '18px 22px',
      borderRadius: '22px',
      borderBottom: '7px solid #93c5fd',
      boxShadow: '0 10px 20px rgba(148, 163, 184, 0.12)',
    }}
    shimmerWidth={isMobile ? '132px' : '150px'}
    shimmerHeight="8px"
    skeletonLines={[]}
    labelStyle={{
      fontSize: isMobile ? '0.98rem' : '1rem',
      color: '#64748b',
    }}
  />
);

const getFallbackLabel = (activePage, isMobile, uiLanguage) => {
  if (uiLanguage === 'ja') {
    switch (activePage) {
      case 'gallery':
        return isMobile ? 'ギャラリーを読み込み中...' : 'ギャラリーページを読み込み中...';
      case 'sign':
        return isMobile ? 'サインページを読み込み中...' : 'サインページを読み込み中...';
      case 'fanGallery':
        return isMobile ? 'ファンギャラリーを読み込み中...' : 'ファンギャラリーページを読み込み中...';
      case 'blog':
        return isMobile ? 'ブログを読み込み中...' : 'ブログ記事を読み込み中...';
      case 'wiki':
        return isMobile ? 'ウィキを読み込み中...' : 'ウィキ記事を読み込み中...';
      case 'sync':
        return isMobile ? '読書を読み込み中...' : '読書データを読み込み中...';
      case 'quiz':
        return isMobile ? 'クイズを読み込み中...' : 'クイズページを読み込み中...';
      case 'birthdays':
        return isMobile ? '誕生日を読み込み中...' : '誕生日ページを読み込み中...';
      case 'mystery':
        return isMobile ? 'ミステリーを読み込み中...' : 'ミステリーページを読み込み中...';
      case 'tutorial':
        return isMobile ? 'ガイドを読み込み中...' : '使い方ガイドページを読み込み中...';
      case 'settings':
        return isMobile ? '設定を読み込み中...' : '設定ページを読み込み中...';
      case 'anime':
        return isMobile ? 'アニメを読み込み中...' : 'アニメ動画を読み込み中...';
      default:
        return isMobile ? '読み込み中...' : 'ページを読み込み中...';
    }
  }

  switch (activePage) {
    case 'gallery':
      return isMobile ? 'Loading gallery...' : 'Loading gallery view...';
    case 'sign':
      return isMobile ? 'Loading sign page...' : 'Loading sign page...';
    case 'fanGallery':
      return isMobile ? 'Loading fan gallery...' : 'Loading fan gallery...';
    case 'blog':
      return isMobile ? 'Loading blog...' : 'Loading blog posts...';
    case 'wiki':
      return isMobile ? 'Loading wiki...' : 'Loading wiki articles...';
    case 'sync':
      return isMobile ? 'Loading reading...' : 'Loading reading stats...';
    case 'quiz':
      return isMobile ? 'Loading quiz...' : 'Loading quiz page...';
    case 'birthdays':
      return isMobile ? 'Loading birthdays...' : 'Loading birthday page...';
    case 'mystery':
      return isMobile ? 'Loading mystery...' : 'Loading mystery page...';
    case 'tutorial':
      return isMobile ? 'Loading guide...' : 'Loading website guide...';
    case 'settings':
      return isMobile ? 'Loading settings...' : 'Loading settings page...';
    case 'anime':
      return isMobile ? 'Loading anime...' : 'Loading anime player...';
    default:
      return isMobile ? 'Loading...' : 'Loading page...';
  }
};

const TabFrame = ({ activePage, children, isMobile, style, fallbackLabel }) => (
  <div 
    key={activePage} 
    className="hide-scrollbar"
    style={{ 
      ...style, 
      height: isMobile ? 'auto' : '100%', 
      overflowY: isMobile ? 'visible' : 'auto',
      display: 'flex',
      flexDirection: 'column',
    }}
  >
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
  readerPrefs,
  setReaderPrefs,
  handleMainTouchStart,
  handleMainTouchEnd,
  setUiLanguage,
  toggleAccessibilityPref,
  setAccessibilityColorBlindMode,
  shortcutStats,
  t,
}) => {
  const tabPreloaders = useMemo(() => getAppTabPreloaders(activePage, uiLanguage), [activePage, uiLanguage]);
  const fallbackLabel = useMemo(() => getFallbackLabel(activePage, isMobile, uiLanguage), [activePage, isMobile, uiLanguage]);
  const isLargeText = !!accessibilityPrefs?.largeText;
  const hasReadableSpacing = !!accessibilityPrefs?.readableSpacing;
  const homeDesktopMinHeight = isLargeText ? '590px' : (hasReadableSpacing ? '560px' : '530px');
  const homeDesktopPadding = isLargeText || hasReadableSpacing ? '28px 10px 14px' : '24px 8px 12px';
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
  let frameStyle = sharedPageShellStyle;

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
          pushNow={syncData?.pushNow}
        />
      );
      break;
    case 'gallery':
      tabContent = <GalleryPage isMobile={isMobile} uiLanguage={uiLanguage} subtabShortcut={subtabShortcut} />;
      break;
    case 'sign':
      tabContent = <SignPage isMobile={isMobile} uiLanguage={uiLanguage} />;
      break;
    case 'fanGallery':
      tabContent = <FanGalleryPage isMobile={isMobile} uiLanguage={uiLanguage} />;
      break;
    case 'blog':
      tabContent = (
        <BlogPage
          isMobile={isMobile}
          uiLanguage={uiLanguage}
          readerPrefs={readerPrefs}
          setReaderPrefs={setReaderPrefs}
        />
      );
      break;
    case 'wiki':
      tabContent = <WikiPage isMobile={isMobile} uiLanguage={uiLanguage} />;
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
          darkMode={accessibilityPrefs.darkMode}
        />
      );
      break;
    case 'mystery':
      tabContent = <MysteryPage isMobile={isMobile} uiLanguage={uiLanguage} darkMode={accessibilityPrefs.darkMode} />;
      break;
    case 'tutorial':
      tabContent = <TutorialPage isMobile={isMobile} uiLanguage={uiLanguage} />;
      break;
    case 'settings':
      tabContent = (
        <SettingsPage
          isMobile={isMobile}
          uiLanguage={uiLanguage}
          setUiLanguage={setUiLanguage}
          accessibilityPrefs={accessibilityPrefs}
          toggleAccessibilityPref={toggleAccessibilityPref}
          setAccessibilityColorBlindMode={setAccessibilityColorBlindMode}
          shortcutStats={shortcutStats}
          readerPrefs={readerPrefs}
          setReaderPrefs={setReaderPrefs}
          t={t}
        />
      );
      break;
    case 'anime':
      tabContent = <AnimePage isMobile={isMobile} uiLanguage={uiLanguage} />;
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
        maxWidth: '100%',
        minWidth: 0,
        flex: 1,
        position: 'relative',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        padding: activePage === 'mystery' ? (isMobile ? '8px 16px 0' : homeDesktopPadding) : 0,
        zIndex: 110,
        pointerEvents: 'auto',
        minHeight: isMobile ? 0 : '100%',
        height: isMobile ? 'auto' : '100%',
        overflow: 'hidden',
        border: isMobile ? 'none' : '3.5px solid #cbd5e1',
        borderLeft: isMobile ? 'none' : '3.5px solid #cbd5e1',
        borderRadius: isMobile ? '12px' : '24px',
        boxShadow: isMobile ? 'none' : '12px 16px 28px rgba(15, 23, 42, 0.05), 0 4px 10px rgba(15, 23, 42, 0.02)',
      }}
    >
      <TabFrame activePage={activePage} isMobile={isMobile} fallbackLabel={fallbackLabel} style={frameStyle}>
        {tabContent}
      </TabFrame>
    </div>
  );
};

export default memo(AppTabContent);
