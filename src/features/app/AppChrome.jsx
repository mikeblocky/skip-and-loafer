import { Suspense, useState, useEffect } from 'react';
import { ChevronUp, WifiOff } from 'lucide-react';
import NavTabs from '../../components/shared/NavTabs';
import {
  AppDisclaimerModal,
  AppDecorativeLayer,
  BirthdayNotification,
  ChangelogPopup,
  MangaReader,
} from './appLazyComponents';
import AppTabContent from './AppTabContent';
import ReaderOverlayFallback from './ReaderOverlayFallback';

const skipLinkStyle = {
  position: 'absolute',
  left: '10px',
  top: '10px',
  zIndex: 1100,
  background: 'white',
  border: '2px solid var(--pop-blue)',
  borderRadius: '8px',
  padding: '6px 10px',
  color: '#374151',
  fontFamily: 'var(--font-hand)',
  fontWeight: 'bold',
  transform: 'translateY(-180%)',
  transition: 'transform 0.2s ease',
};

const shellViewportStyle = {
  minHeight: '100dvh',
  height: '100dvh',
  width: '100%',
  position: 'relative',
  overflowX: 'hidden',
  overflowY: 'visible',
};

const copyrightStyle = {
  display: 'none',
};

const offlineBannerStyle = (isMobile) => ({
  position: 'fixed',
  top: isMobile ? '12px' : '20px',
  left: '50%',
  zIndex: 2000,
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  background: '#fef3c7',
  border: '3px solid #d97706',
  borderBottom: '7px solid #b45309',
  borderRadius: '16px',
  padding: isMobile ? '10px 16px' : '12px 24px',
  color: '#b45309',
  fontFamily: 'Sniglet, var(--font-hand)',
  fontSize: isMobile ? '0.88rem' : '0.96rem',
  fontWeight: 'bold',
  boxShadow: '0 8px 24px rgba(180, 83, 9, 0.15)',
  pointerEvents: 'auto',
  maxWidth: '90%',
  width: isMobile ? '340px' : 'auto',
  textAlign: 'center',
});

const OFFLINE_COPY = {
  en: "Offline Mode — Caching active! Chat and syncing are paused.",
  es: "Modo sin conexión — ¡Caché activo! Chat y sincronización pausados.",
  pt: "Modo offline — Cache ativo! Chat e sincronização pausados.",
  fr: "Mode hors ligne — Cache actif ! Le chat et la synchronisation sont suspendus.",
  de: "Offline-Modus — Cache aktiv! Chat und Synchronisierung pausiert.",
  it: "Modalità offline — Cache attiva! Chat e sincronizzazione sono in pausa.",
  ja: "オフラインモード — キャッシュ有効！チャットと同期は一時停止中です。",
};

const getOfflineLabel = (uiLanguage) => OFFLINE_COPY[uiLanguage] || OFFLINE_COPY.en;

const AppChrome = ({ app }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (app.uiLanguage === 'ja') {
      let styleEl = document.getElementById('japanese-fonts-style');
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'japanese-fonts-style';
        styleEl.textContent = `
          @font-face {
            font-family: 'Keiji';
            src: url('/Kei_Ji.woff2') format('woff2');
            font-display: swap;
          }
          @font-face {
            font-family: 'Keiji_P';
            src: url('/Kei_Ji-P.woff2') format('woff2');
            font-display: swap;
          }
        `;
        document.head.appendChild(styleEl);
      }
    }
  }, [app.uiLanguage]);

  return (
    <div className="app-surface-shell" style={shellViewportStyle}>
      {/* SVG Color Blindness Matrix Filters */}
      <svg style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }}>
        <defs>
          <filter id="filter-protanopia">
            <feColorMatrix type="matrix" values="0.567, 0.433, 0, 0, 0, 0.558, 0.442, 0, 0, 0, 0, 0.242, 0.758, 0, 0, 0, 0, 0, 1, 0" />
          </filter>
          <filter id="filter-deuteranopia">
            <feColorMatrix type="matrix" values="0.625, 0.375, 0, 0, 0, 0.7, 0.3, 0, 0, 0, 0, 0.3, 0.7, 0, 0, 0, 0, 0, 1, 0" />
          </filter>
          <filter id="filter-tritanopia">
            <feColorMatrix type="matrix" values="0.95, 0.05, 0, 0, 0, 0, 0.433, 0.567, 0, 0, 0, 0, 0.475, 0.525, 0, 0, 0, 0, 0, 1, 0" />
          </filter>
          <filter id="filter-black-white">
            <feColorMatrix type="matrix" values="0.2126, 0.7152, 0.0722, 0, 0, 0.2126, 0.7152, 0.0722, 0, 0, 0.2126, 0.7152, 0.0722, 0, 0, 0, 0, 1, 0" />
          </filter>
        </defs>
      </svg>

      {!isOnline && (
        <div
          key="offline-banner"
          className="offline-banner-visible"
          style={offlineBannerStyle(app.isMobile)}
        >
          <WifiOff size={18} strokeWidth={2.5} />
          <span>{getOfflineLabel(app.uiLanguage)}</span>
        </div>
      )}

      <a
        href="#main-content"
        style={skipLinkStyle}
        onFocus={(event) => {
          event.currentTarget.style.transform = 'translateY(0)';
        }}
        onBlur={(event) => {
          event.currentTarget.style.transform = 'translateY(-180%)';
        }}
      >
        {app.t.skipToContent}
      </a>

      {app.showDisclaimer && app.deferredShellMount && (
        <Suspense fallback={null}>
          <AppDisclaimerModal showDisclaimer={app.showDisclaimer} onClose={app.closeDisclaimer} />
        </Suspense>
      )}

      {app.showDecorativeLayer && (
        <Suspense fallback={null}>
          <AppDecorativeLayer
            accessibilityPrefs={app.accessibilityPrefs}
            isMobile={app.isMobile}
            activePage={app.activePage}
            showCharacterStickers={!app.accessibilityPrefs.hideStickers}
            showCoverCards={false}
            handlePositionUpdate={app.handlePositionUpdate}
            stickerPositions={app.stickerPositions}
            stickerLayoutById={app.stickerLayoutById}
            cardPositions={app.cardPositions}
          />
        </Suspense>
      )}

      {app.showUI && (
        <div
          ref={app.mainScrollRef}
          className="hide-scrollbar app-shell-scroll app-shell-fadein"
          style={{
            position: 'relative',
            zIndex: 500,
            height: '100dvh',
            minHeight: '100dvh',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            overflowY: 'auto',
            overflowX: 'visible',
            WebkitOverflowScrolling: 'touch',
            overscrollBehaviorY: 'contain',
            padding: app.isMobile
              ? 'calc(env(safe-area-inset-top, 0px) + 20px) 0 calc(env(safe-area-inset-bottom, 0px) + 96px) 0'
              : '56px 48px 56px',
            pointerEvents: 'auto',
          }}
        >
          {app.showMitsumiReplayBanner && (
            <a
              href="/mitsumi"
              className="app-tactile mitsumi-replay-banner"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: app.isMobile ? '4px' : '8px',
                marginBottom: app.isMobile ? '8px' : '10px',
                padding: app.isMobile ? '8px 12px' : '10px 14px',
                borderRadius: '9999px',
                textDecoration: 'none',
                fontFamily: 'var(--font-hand)',
                fontSize: app.isMobile ? '0.85rem' : '0.92rem',
                fontWeight: 'bold',
                color: '#be185d',
                background: '#fdf2f8',
                border: '2px solid #f9a8d4',
                boxShadow: '0 4px 10px rgba(244,114,182,0.18)',
                zIndex: 900,
              }}
            >
              Replay Mitsumi&apos;s birthday surprise!
            </a>
          )}

          <div
            className="app-content-fadein"
            style={{
              position: 'relative',
              scrollMarginTop: '0px',
              width: '100%',
              maxWidth: app.isMobile
                ? '100%'
                : (app.accessibilityPrefs.largeText ? '1300px' : '1180px'),
              minHeight: app.isMobile ? 'calc(100dvh - 72px)' : 'calc(100dvh - 154px)',
              height: app.isMobile ? 'auto' : 'calc(100dvh - 154px)',
              display: 'flex',
              flexDirection: app.isMobile ? 'column' : 'row',
              alignItems: 'stretch',
              gap: '10px',
              pointerEvents: 'auto',
              flex: '1 0 auto',
              flexShrink: 0,
            }}
          >
            {/* Desktop sidebar NavTabs — stays inside scroll layout */}
            {!app.isMobile && (
              <NavTabs
                activePage={app.activePage}
                onPageChange={app.handlePageChange}
                isMobile={false}
                tabs={app.visibleTabPages}
                labelsById={app.t.tabs}
                openTabPrefix={app.t.openTabPrefix}
                tabSuffix={app.t.tabSuffix}
                unreadCount={app.unreadCount}
              />
            )}

            <AppTabContent
              activePage={app.activePage}
              isMobile={app.isMobile}
              uiLanguage={app.uiLanguage}
              subtabShortcut={app.subtabShortcut}
              setReaderChapter={app.handleReaderChapterChange}
              isFinished={app.isFinished}
              trackExternalLink={app.trackExternalLink}
              cancelExternalLink={app.cancelExternalLink}
              markFinished={app.markFinished}
              unmarkFinished={app.unmarkFinished}
              getReadCount={app.getReadCount}
              incrementReadCount={app.incrementReadCount}
              getRemainingCooldown={app.getRemainingCooldown}
              pendingLinks={app.pendingLinks}
              finishedCount={app.finishedCount}
              finished={app.finished}
              readCounts={app.readCounts}
              reloadFromStorage={app.reloadFromStorage}
              syncData={app.syncData}
              accessibilityPrefs={app.accessibilityPrefs}
              readerPrefs={app.readerPrefs}
              setReaderPrefs={app.setReaderPrefs}
              handleMainTouchStart={app.handleMainTouchStart}
              handleMainTouchEnd={app.handleMainTouchEnd}
              setUiLanguage={app.setUiLanguage}
              toggleAccessibilityPref={app.toggleAccessibilityPref}
              setAccessibilityColorBlindMode={app.setAccessibilityColorBlindMode}
              shortcutStats={app.shortcutStats}
              t={app.t}
            />
          </div>

        </div>
      )}

      {/* Mobile NavTabs — rendered OUTSIDE the scroll container so position:fixed works */}
      {app.showUI && app.isMobile && (
        <NavTabs
          activePage={app.activePage}
          onPageChange={app.handlePageChange}
          isMobile={true}
          tabs={app.visibleTabPages}
          labelsById={app.t.tabs}
          openTabPrefix={app.t.openTabPrefix}
          tabSuffix={app.t.tabSuffix}
          unreadCount={app.unreadCount}
        />
      )}

      {app.deferredShellMount && (
        <Suspense fallback={null}>
          <ChangelogPopup isMobile={app.isMobile} uiLanguage={app.uiLanguage} />
        </Suspense>
      )}

      {app.deferredShellMount && (
        <Suspense fallback={null}>
          <BirthdayNotification isMobile={app.isMobile} uiLanguage={app.uiLanguage} />
        </Suspense>
      )}

      <div style={copyrightStyle}>© Takamatsu Misaki / KODANSHA</div>

      {app.showScrollTop && !app.readerChapter && app.activePage !== 'blog' && app.activePage !== 'quiz' && (
        <button
          key="scroll-top"
          className="app-tactile no-override scroll-top-fadein"
          onClick={app.scrollToTop}
          style={{
            position: 'fixed',
            right: app.isMobile ? '16px' : '28px',
            bottom: app.isMobile ? 'calc(env(safe-area-inset-bottom, 0px) + 96px)' : '106px',
            zIndex: 1100,
            border: '3px solid var(--surface-border, #cbd5e1)',
            borderBottom: '7px solid var(--surface-border-strong, #94a3b8)',
            background: 'var(--surface-card, #fff)',
            color: 'var(--text-primary, #374151)',
            borderRadius: '20px',
            padding: app.isMobile ? '14px' : '14px 20px',
            fontFamily: 'var(--font-hand)',
            fontWeight: 'bold',
            fontSize: app.isMobile ? '0.98rem' : '1.05rem',
            boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: app.isMobile ? '0' : '6px',
          }}
        >
          <ChevronUp size={22} /> {!app.isMobile && app.t.returnToTop}
        </button>
      )}

      {app.readerChapter && app.readerChapter.pages && (
        <Suspense fallback={<ReaderOverlayFallback isMobile={app.isMobile} label={app.t.openingReader || 'Opening chapter...'} />}>
          <MangaReader
            key={`reader-${app.readerChapter.number}`}
            chapter={app.readerChapter}
            pages={app.readerChapter.pages}
            onClose={app.closeReader}
            onNextChapter={app.hasNextChapter ? app.handleNextChapter : undefined}
            onPrevChapter={app.hasPrevChapter ? app.handlePrevChapter : undefined}
            isMobile={app.isMobile}
            uiLanguage={app.uiLanguage}
            onChapterFinished={app.markFinished}
            getRemainingCooldown={app.getRemainingCooldown}
          />
        </Suspense>
      )}
    </div>
  );
};

export default AppChrome;
