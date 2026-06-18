import { Suspense, memo, useMemo, useState } from 'react';
import PaperLoadingState from '../../components/shared/paper/PaperLoadingState';
import DropdownHeadingBadge from '../../components/shared/paper/DropdownHeadingBadge';
import useIdlePreload from './hooks/useIdlePreload';
import { BookOpen, BarChart3, ImagePlus, PenLine, Settings, HelpCircle } from 'lucide-react';
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
  StickerCamPage,
} from './appPageLoaders';

const CHAPTERS_SUBTABS = [
  { id: 'chapters', label: 'Chapters', icon: BookOpen },
  {
    id: 'reading',
    label: 'Reading',
    icon: BarChart3,
    palette: {
      borderColor: '#38c972',
      bottomColor: '#15803d',
      shadow: '0 8px 18px rgba(56, 201, 114, 0.12)',
    },
    titleColor: '#15803d',
    iconColor: '#38c972',
  },
];
const COMMUNITY_SUBTABS = [
  {
    id: 'fanGallery',
    label: 'Fan gallery',
    icon: ImagePlus,
    palette: {
      borderColor: '#2563eb',
      bottomColor: '#1e40af',
      shadow: '0 8px 18px rgba(37, 99, 235, 0.12)',
    },
    titleColor: '#1e40af',
    iconColor: '#2563eb',
  },
  {
    id: 'sign',
    label: 'Fan messages',
    icon: PenLine,
    palette: {
      borderColor: '#f97316',
      bottomColor: '#c2410c',
      shadow: '0 8px 18px rgba(249, 115, 22, 0.12)',
    },
    titleColor: '#c2410c',
    iconColor: '#f97316',
  },
];
const SETTINGS_SUBTABS = [
  { id: 'settings', label: 'Settings', icon: Settings   },
  {
    id: 'tutorial',
    label: 'Guide',
    icon: HelpCircle,
    palette: {
      borderColor: '#06b6d4',
      bottomColor: '#0891b2',
      shadow: '0 8px 18px rgba(6, 182, 212, 0.12)',
    },
    titleColor: '#0891b2',
    iconColor: '#06b6d4',
  },
];

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
      case 'blog':
        return isMobile ? 'ブログを読み込み中...' : 'ブログ記事を読み込み中...';
      case 'wiki':
        return isMobile ? 'ウィキを読み込み中...' : 'ウィキ記事を読み込み中...';
      case 'quiz':
        return isMobile ? 'クイズを読み込み中...' : 'クイズページを読み込み中...';
      case 'birthdays':
        return isMobile ? '誕生日を読み込み中...' : '誕生日ページを読み込み中...';
      case 'mystery':
        return isMobile ? 'ミステリーを読み込み中...' : 'ミステリーページを読み込み中...';
      case 'settings':
        return isMobile ? '設定を読み込み中...' : '設定ページを読み込み中...';
      default:
        return isMobile ? '読み込み中...' : 'ページを読み込み中...';
    }
  }

  switch (activePage) {
    case 'gallery':
      return isMobile ? 'Loading gallery...' : 'Loading gallery view...';
    case 'blog':
      return isMobile ? 'Loading blog...' : 'Loading blog posts...';
    case 'wiki':
      return isMobile ? 'Loading wiki...' : 'Loading wiki articles...';
    case 'quiz':
      return isMobile ? 'Loading quiz...' : 'Loading quiz page...';
    case 'birthdays':
      return isMobile ? 'Loading birthdays...' : 'Loading birthday page...';
    case 'mystery':
      return isMobile ? 'Loading mystery...' : 'Loading mystery page...';
    case 'settings':
      return isMobile ? 'Loading settings...' : 'Loading settings page...';
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
  siteStats,
  t,
}) => {
  const [chaptersSubTab, setChaptersSubTab] = useState('chapters');
  const [communitySubTab, setCommunitySubTab] = useState('fanGallery');
  const [settingsSubTab, setSettingsSubTab] = useState('settings');

  const tabPreloaders = useMemo(() => getAppTabPreloaders(activePage, uiLanguage), [activePage, uiLanguage]);
  const fallbackLabel = useMemo(() => getFallbackLabel(activePage, isMobile, uiLanguage), [activePage, isMobile, uiLanguage]);
  const isLargeText = !!accessibilityPrefs?.largeText;
  const hasReadableSpacing = !!accessibilityPrefs?.readableSpacing;
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
    case 'chapters': {
      const chaptersDropdown = (
        <DropdownHeadingBadge
          isMobile={isMobile}
          icon={BookOpen}
          options={CHAPTERS_SUBTABS}
          value={chaptersSubTab}
          onChange={setChaptersSubTab}
          palette={{
            borderColor: '#3b82f6',
            bottomColor: '#3b82f6',
            shadow: '0 8px 18px rgba(59, 130, 246, 0.1)',
          }}
          titleColor="#3b82f6"
          iconColor="#3b82f6"
        />
      );
      tabContent = chaptersSubTab === 'chapters' ? (
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
          outerSwitcher={chaptersDropdown}
        />
      ) : (
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
          unmarkFinished={unmarkFinished}
          incrementReadCount={incrementReadCount}
          getRemainingCooldown={getRemainingCooldown}
          pendingLinks={pendingLinks}
          syncData={syncData}
          outerSwitcher={chaptersDropdown}
        />
      );
      break;
    }
    case 'gallery':
      tabContent = <GalleryPage isMobile={isMobile} uiLanguage={uiLanguage} subtabShortcut={subtabShortcut} />;
      break;
    case 'community': {
      const communityDropdown = (
        <DropdownHeadingBadge
          isMobile={isMobile}
          icon={communitySubTab === 'fanGallery' ? ImagePlus : PenLine}
          options={COMMUNITY_SUBTABS}
          value={communitySubTab}
          onChange={setCommunitySubTab}
          palette={{
            borderColor: '#f97316',
            bottomColor: '#c2410c',
            shadow: '0 8px 18px rgba(249, 115, 22, 0.1)',
          }}
          titleColor="#c2410c"
          iconColor="#f97316"
        />
      );
      tabContent = communitySubTab === 'fanGallery' ? (
        <FanGalleryPage isMobile={isMobile} uiLanguage={uiLanguage} outerSwitcher={communityDropdown} />
      ) : (
        <SignPage isMobile={isMobile} uiLanguage={uiLanguage} outerSwitcher={communityDropdown} />
      );
      break;
    }
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
    case 'settings': {
      const settingsDropdown = (
        <DropdownHeadingBadge
          isMobile={isMobile}
          icon={settingsSubTab === 'settings' ? Settings : HelpCircle}
          options={SETTINGS_SUBTABS}
          value={settingsSubTab}
          onChange={setSettingsSubTab}
          palette={{
            borderColor: '#818cf8',
            bottomColor: '#4338ca',
            shadow: '0 8px 18px rgba(129, 140, 248, 0.12)',
          }}
          titleColor="#818cf8"
          iconColor="#818cf8"
        />
      );
      tabContent = settingsSubTab === 'settings' ? (
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
          siteStats={siteStats}
          outerSwitcher={settingsDropdown}
        />
      ) : (
        <TutorialPage isMobile={isMobile} uiLanguage={uiLanguage} outerSwitcher={settingsDropdown} />
      );
      break;
    }
    case 'stickerCam':
      tabContent = <StickerCamPage isMobile={isMobile} />;
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
