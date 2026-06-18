import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageLayout from '../components/shared/paper/PageLayout';
import {
  BookOpen,
  Trophy,
  PenLine,
  BarChart3,
  Keyboard,
  Home,
  Cake,
  Sparkles,
  Settings,
  HelpCircle,
  Copy,
  Check,
  Calendar,
  ChevronRight,
  Star,
  Crown,
  Medal,
} from 'lucide-react';
import usePageTitle from '../hooks/shared/usePageTitle';
import { getUI } from '../i18n/ui';
import { createPaperPanelStyle } from '../components/shared/paper/paperTheme';
import PaperPageHeader from '../components/shared/paper/PaperPageHeader';
import PaperHeadingBadge from '../components/shared/paper/PaperHeadingBadge';

const COMMUNITY_FONT_FAMILY = 'var(--font-paper)';

const SECTION_COPY = {
  en: {
    title: 'Website guide',
    subtitle: 'An overview of the features available on this site.',
    welcome: 'How this site works',
    welcomeBody: 'This site has a scrapbook-style layout. You can drag elements around, tap stickers, and adjust your experience in Settings. Select a section below to see how each feature works.',
    clickToExplore: 'Select a section to see its preview:',
    sections: [
      {
        id: 'home',
        title: 'Home & countdown',
        icon: Home,
        color: '#f43f5e',
        bg: '#fff5f8',
        border: '#fda4af',
        washi: 'pink',
        text: 'Shows a live countdown to the next manga chapter release, upcoming character birthdays, and quick navigation controls.',
        details: [
          'Countdown timer with days, hours, minutes, and seconds until the next chapter.',
          'Birthdays widget showing characters with upcoming birthdays in the next 30 days.',
          'Quick-access shortcuts bar at the top of the page.'
        ]
      },
      {
        id: 'chapters',
        title: 'Manga & checklist',
        icon: BookOpen,
        color: '#2563eb',
        bg: '#eff6ff',
        border: '#bfdbfe',
        washi: 'blue',
        text: 'Mark chapters as read using the chapter checklist. Use "+1 read" to log rereads, and follow links to official releases in Japanese or English.',
        details: [
          'Chapter checkboxes that save automatically in your browser.',
          '"+1 read" button to track reread sessions and milestone progress.',
          'Links to official Shonen Jump Plus and English platforms.'
        ]
      },
      {
        id: 'sync',
        title: 'Reread logs & syncing',
        icon: BarChart3,
        color: '#16a34a',
        bg: '#f0fdf4',
        border: '#bbf7d0',
        washi: 'yellow',
        text: 'Generate a sync key in the Reading tab to transfer your checklist, read history, and milestones to another device. No account required.',
        details: [
          'One-click sync key generation covering all checklist and milestone data.',
          'Paste the key on any device to merge your reading logs instantly.',
          'No account, email, or password needed.'
        ]
      },
      {
        id: 'gallery',
        title: 'Fan gallery',
        icon: PenLine,
        color: '#ea580c',
        bg: '#fff7ed',
        border: '#fdba74',
        washi: 'pink',
        text: 'Browse and submit fan art, merchandise photos, or cosplay shots. Photos can be dragged, rotated, and repositioned on the canvas.',
        details: [
          'Draggable, rotatable photo canvas for fan submissions.',
          'Guestbook note composer to post a message on the wall.',
          'Submission form with title and artist credit fields.'
        ]
      },
      {
        id: 'quiz',
        title: 'Trivia & rankings',
        icon: Trophy,
        color: '#dc2626',
        bg: '#fff1f2',
        border: '#fca5a5',
        washi: 'blue',
        text: 'Take timed trivia quizzes on the series. Choose a question set and difficulty level, then submit your score to the global leaderboard.',
        details: [
          'Timed quizzes covering characters, volumes, and story trivia.',
          'Global leaderboard showing top scores and attempt counts.',
          'Personal score history saved locally in your browser.'
        ]
      },
      {
        id: 'birthdays',
        title: 'Character birthdays',
        icon: Cake,
        color: '#d97706',
        bg: '#fffbeb',
        border: '#fcd34d',
        washi: 'yellow',
        text: 'View character birthdays with profile cards showing birth dates, zodiac signs, and relationships. Birthday notifications appear automatically on the day.',
        details: [
          'Profile cards with birthday dates, zodiac signs, and character relationships.',
          'Birthday alerts and confetti on the character\'s actual birthday.',
          'Candle display and tribute message panel on birthday pages.'
        ]
      },
      {
        id: 'shortcuts',
        title: 'Keyboard shortcuts',
        icon: Keyboard,
        color: '#4f46e5',
        bg: '#e0e7ff',
        border: '#a5b4fc',
        washi: 'blue',
        text: 'Use keyboard shortcuts to navigate the site quickly. See the full reference below.',
        details: [
          'Press 1–8 to switch between main tabs.',
          'Press Q and E to move between sub-tabs within a page.',
          'Press Escape to close any open overlay or dialog.'
        ]
      },
    ],
    shortcutsTitle: 'Keyboard shortcuts',
    shortcutsIntro: 'Keyboard shortcuts available across the site:',
    shortcutsList: [
      { key: '1..8', desc: 'Switch to a main tab by number' },
      { key: 'Q / E', desc: 'Go to the previous or next sub-tab' },
      { key: 'Alt + A', desc: 'Open the accessibility panel in Settings' },
      { key: 'Alt + K', desc: 'Open the keyboard shortcuts reference' },
      { key: 'Esc', desc: 'Close any open overlay or dialog' },
    ],
  },
  ja: {
    title: 'ガイドブック',
    subtitle: 'このインタラクティブな手書きスケッチブック型サイトの使い方をご案内します。',
    welcome: 'ファンハブへようこそ！',
    welcomeBody: 'このサイトは手書きのスクラップブックを模してデザインされています。カードをドラッグして並び替えたり、ステッカーをタップしたりできます。設定パネルから各種アクセシビリティもカスタマイズ可能です！',
    clickToExplore: 'タブを選択してプレビューを表示します：',
    sections: [
      {
        id: 'home',
        title: 'ホームとカウントダウン',
        icon: Home,
        color: '#f43f5e',
        bg: '#fff5f8',
        border: '#fda4af',
        washi: 'pink',
        text: '最新話（第81話など）の更新カウントダウンを表示します。他にもキャラクターの誕生日予定やクイックコントロールが利用可能です。',
        details: [
          '最新話の更新までのリアルタイムのカウントダウン表示。',
          '直近30日のキャラクター誕生日をお祝いするウィジェット。',
          'サイト内をサクサク移動できる上部クイックコントロール。'
        ]
      },
      {
        id: 'chapters',
        title: 'コミックスとチェックリスト',
        icon: BookOpen,
        color: '#2563eb',
        bg: '#eff6ff',
        border: '#bfdbfe',
        washi: 'blue',
        text: '読んだ話をチェックリストで管理できます。「+1 読了」ボタンで再読ログを登録でき、公式の日本語版リンクへスムーズにアクセス可能です。',
        details: [
          'ブラウザに自動保存される手書き風チェックリスト。',
          '再読回数を記録できる「+1 読了」カウンター。',
          '少年ジャンプ＋公式や各言語の配信プラットフォームへのダイレクトリンク。'
        ]
      },
      {
        id: 'sync',
        title: '再読記録と同期設定',
        icon: BarChart3,
        color: '#16a34a',
        bg: '#f0fdf4',
        border: '#bbf7d0',
        washi: 'yellow',
        text: '読書タブで独自の「同期キー」を発行することで、ログイン不要で他のスマホやPCと既読チェックリストや再読マイルストーンを安全に共有できます！',
        details: [
          '既読データや統計ログを記録するワンクリック同期キー発行。',
          '他のスマホやPCにキーを入力するだけで瞬時にデータをマージ。',
          '個人情報不要の安心・安全なパスワードレス設計。'
        ]
      },
      {
        id: 'gallery',
        title: 'ポラロイドギャラリー',
        icon: PenLine,
        color: '#ea580c',
        bg: '#fff7ed',
        border: '#fdba74',
        washi: 'pink',
        text: 'ファンギャラリーにイラストやグッズ棚、コスプレの写真を投稿できます！キャンバス上でポラロイド写真やゲストブックのメモを自由にドラッグ＆回転させられます。',
        details: [
          '自由にドラッグ、スロー、回転できるインタラクティブキャンバス。',
          'メッセージを書き残せる手書きのゲストブック付箋機能。',
          'タイトルや作者名タグを添えて作品を登録できる投稿パネル。'
        ]
      },
      {
        id: 'quiz',
        title: 'クイズとランキング',
        icon: Trophy,
        color: '#dc2626',
        bg: '#fff1f2',
        border: '#fca5a5',
        washi: 'blue',
        text: '作品に関するファンクイズに挑戦できます！問題数や難易度（イージー、ノーマル、ハード、激ムズ）を選んで、ハイスコアを全世界ランキングへ登録しましょう！',
        details: [
          '難易度別、出題範囲別に挑戦できる制限時間付きのファンクイズ。',
          '全世界のハイスコアや挑戦結果が集うグローバルランキング。',
          '個人スクラップブックに保存されるパーソナル挑戦履歴。'
        ]
      },
      {
        id: 'birthdays',
        title: '誕生日お祝いページ',
        icon: Cake,
        color: '#d97706',
        bg: '#fffbeb',
        border: '#fcd34d',
        washi: 'yellow',
        text: '美津未や誠の誕生日をかわいいお祝いカードでカウントダウン！誕生日当日は特別なフルスクリーンアニメーションと通知が自動で出現します。',
        details: [
          '誕生日や星座、関係図を表示するキャラクター図鑑。',
          '当日に出現するバースデー特製お祝いエフェクト。',
          'ケーキのキャンドルを消してお祝いメッセージを残すトリビュート板。'
        ]
      },
      {
        id: 'shortcuts',
        title: 'ショートカットキー',
        icon: Keyboard,
        color: '#4f46e5',
        bg: '#e0e7ff',
        border: '#a5b4fc',
        washi: 'blue',
        text: 'キーボードショートカットを使ってサクサク移動できます。詳細はページ下部のリファレンスを参照してください。',
        details: [
          '1〜8キーを押すことで、左側のメインタブを瞬時に切り替え。',
          'QキーとEキーでパネル内のサブタブを前後フリップ。',
          'Escキーを押すことで開いているダイアログや投稿画面をクローズ。'
        ]
      },
    ],
    shortcutsTitle: 'ショートカットキー一覧',
    shortcutsIntro: 'サイト内で次のキーボード入力を使うと、瞬時にナビゲーションが可能です：',
    shortcutsList: [
      { key: '1..8', desc: '左メニューのメインタブへ瞬時に切り替え' },
      { key: 'Q / E', desc: 'ページ内のサブタブを前後に切り替え' },
      { key: 'Alt + A', desc: '設定のアクセシビリティパネルを直接起動' },
      { key: 'Alt + K', desc: 'ショートカット使用状況のヘルプを起動' },
      { key: 'Esc', desc: '開いている各種ダイアログやモーダルシートを閉じる' },
    ],
  },
};

export const TutorialPage = ({ isMobile, uiLanguage = 'en', outerSwitcher }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [copiedSync, setCopiedSync] = useState(false);
  const [mangaChecked, setMangaChecked] = useState([true, false]);
  const [mangaReads, setMangaReads] = useState([3, 0]);

  const t = SECTION_COPY[uiLanguage] || SECTION_COPY.en;
  const tGlobal = getUI(uiLanguage);

  usePageTitle(tGlobal.tabs?.tutorial?.label || 'Tutorial');

  const selectedSection = t.sections.find((s) => s.id === activeTab) || t.sections[0];
  const IconActive = selectedSection.icon;

  // Helper to render responsive animated mini visual mockup simulations
  const renderVisualMockup = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div style={{ display: 'grid', gap: '14px', justifyItems: 'center', textAlign: 'center', width: '100%' }}>
            {/* Mini Countdown Container */}
            <div 
              className="sketchbook-border"
              style={{
                ...createPaperPanelStyle({ background: '#ffffff', borderColor: '#fbcfe8', bottomColor: '#f43f5e', radius: '16px' }),
                padding: '12px 20px',
                width: '100%',
                maxWidth: '260px',
                boxSizing: 'border-box'
              }}
            >
              <div style={{ fontFamily: 'var(--font-hand)', color: '#f43f5e', fontSize: '0.88rem' }}>Chapter 81 countdown</div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '6px' }}>
                {['23d', '11h', '42m', '08s'].map((timeUnit, idx) => (
                  <div 
                    key={idx}
                    className="sketchbook-border"
                    style={{
                      background: '#fff5f8',
                      border: '2px solid #fda4af',
                      borderBottom: '4px solid #f43f5e',
                      borderRadius: '8px',
                      padding: '4px 6px',
                      fontFamily: COMMUNITY_FONT_FAMILY,
                      fontSize: '0.86rem',
                      color: '#9f1239',
                      minWidth: '32px',
                    }}
                  >
                    {timeUnit}
                  </div>
                ))}
              </div>
            </div>

            {/* Mini Birthday Calendar */}
            <div 
              className="sketchbook-border"
              style={{
                ...createPaperPanelStyle({ background: '#ffffff', borderColor: '#fed7aa', bottomColor: '#ea580c', radius: '16px' }),
                padding: '10px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                maxWidth: '260px',
                boxSizing: 'border-box'
              }}
            >
              <div 
                className="sketchbook-border"
                style={{
                  background: '#ffeded',
                  border: '2.5px solid #fca5a5',
                  borderBottom: '4.5px solid #ef4444',
                  borderRadius: '10px',
                  padding: '4px 8px',
                  display: 'grid',
                  justifyItems: 'center',
                  fontFamily: COMMUNITY_FONT_FAMILY,
                  color: '#991b1b',
                  fontSize: '0.74rem',
                  lineHeight: 1
                }}
              >
                <span style={{ fontSize: '0.6rem', color: '#ef4444' }}>OCT</span>
                <span>9</span>
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontFamily: COMMUNITY_FONT_FAMILY, fontSize: '0.9rem', color: '#1f2937' }}>Shima</div>
                <div style={{ fontFamily: 'var(--font-hand)', fontSize: '0.76rem', color: '#ea580c' }}>Birthday in 24 days</div>
              </div>
            </div>
          </div>
        );

      case 'chapters':
        return (
          <div style={{ display: 'grid', gap: '10px', width: '100%', maxWidth: '280px' }}>
            {[
              { num: 78, title: uiLanguage === 'ja' ? 'みつみの高校生活' : "Mitsumi's school life" },
              { num: 79, title: uiLanguage === 'ja' ? 'まことの夏休み' : "Makoto's summer vacation" }
            ].map((chap, idx) => (
              <div 
                key={idx}
                className="sketchbook-border"
                style={{
                  ...createPaperPanelStyle({ 
                    background: mangaChecked[idx] ? '#eff6ff' : '#ffffff', 
                    borderColor: '#bfdbfe', 
                    bottomColor: '#2563eb', 
                    radius: '14px' 
                  }),
                  padding: '8px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  boxSizing: 'border-box'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                  {/* Wobbly Checkbox Toggle Simulation */}
                  <button 
                    onClick={() => {
                      const newChecked = [...mangaChecked];
                      newChecked[idx] = !newChecked[idx];
                      setMangaChecked(newChecked);
                    }}
                    className="sketchbook-border"
                    style={{
                      width: '22px',
                      height: '22px',
                      background: '#ffffff',
                      border: '2px solid #3b82f6',
                      borderBottom: '4px solid #1d4ed8',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      padding: 0,
                      color: '#1d4ed8',
                      flexShrink: 0
                    }}
                  >
                    {mangaChecked[idx] && <Check size={14} strokeWidth={3} />}
                  </button>
                  <span style={{ 
                    fontFamily: COMMUNITY_FONT_FAMILY, 
                    fontSize: '0.84rem', 
                    color: '#1e293b',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    textDecoration: mangaChecked[idx] ? 'line-through' : 'none',
                    opacity: mangaChecked[idx] ? 0.6 : 1
                  }}>
                    {chap.num}: {chap.title}
                  </span>
                </div>

                {/* Counter Simulation Button */}
                <button
                  onClick={() => {
                    const newReads = [...mangaReads];
                    newReads[idx] += 1;
                    setMangaReads(newReads);
                  }}
                  className="sketchbook-border"
                  style={{
                    background: '#ffffff',
                    border: '1.5px solid #bfdbfe',
                    borderBottom: '3px solid #2563eb',
                    borderRadius: '8px',
                    padding: '2px 6px',
                    fontFamily: 'var(--font-hand)',
                    fontSize: '0.74rem',
                    color: '#1d4ed8',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  +{mangaReads[idx]} {uiLanguage === 'ja' ? '読了' : 'reads'}
                </button>
              </div>
            ))}
          </div>
        );

      case 'sync':
        return (
          <div style={{ display: 'grid', gap: '12px', justifyItems: 'center', width: '100%', maxWidth: '280px' }}>
            <div 
              className="sketchbook-border"
              style={{
                ...createPaperPanelStyle({ background: '#f0fdf4', borderColor: '#bbf7d0', bottomColor: '#16a34a', radius: '16px' }),
                padding: '14px',
                textAlign: 'center',
                width: '100%',
                boxSizing: 'border-box',
                position: 'relative'
              }}
            >
              <div 
                className="washi-tape washi-tape--yellow" 
                style={{ position: 'absolute', top: '-10px', right: '12px', width: '50px', height: '14px', transform: 'rotate(5deg)' }}
              />
              <div style={{ fontFamily: 'var(--font-hand)', color: '#15803d', fontSize: '0.84rem' }}>Your sync key</div>
              <div 
                className="sketchbook-border"
                style={{
                  background: '#ffffff',
                  border: '2px dashed #86efac',
                  borderRadius: '10px',
                  padding: '6px 10px',
                  marginTop: '8px',
                  fontFamily: COMMUNITY_FONT_FAMILY,
                  fontSize: '0.9rem',
                  color: '#166534',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <span>SM-SKIP-1009</span>
                <button
                  onClick={() => {
                    setCopiedSync(true);
                    setTimeout(() => setCopiedSync(false), 2000);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    color: copiedSync ? '#16a34a' : '#86efac',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {copiedSync ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
              <div style={{ fontFamily: 'var(--font-hand)', fontSize: '0.74rem', color: '#16a34a', marginTop: '6px' }}>
                {copiedSync ? 'Copied' : 'Click to copy sync key'}
              </div>
            </div>
          </div>
        );

      case 'gallery':
        return (
          <div style={{ position: 'relative', width: '100%', height: '150px', background: '#fef08a', border: '3px solid #eab308', borderRadius: '16px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Decorative push-pin simulation */}
            <div style={{ position: 'absolute', top: '6px', left: '50%', transform: 'translateX(-50%)', width: '12px', height: '12px', background: '#ef4444', borderRadius: '999px', boxShadow: '0 2px 4px rgba(0,0,0,0.2)', zIndex: 10 }} />
            
            {/* Left mini polaroid mock */}
            <motion.div 
              style={{
                background: '#ffffff',
                border: '1.5px solid #e2e8f0',
                borderBottomWidth: '10px',
                padding: '6px',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                width: '64px',
                height: '76px',
                transform: 'rotate(-8deg) translate(-10px, 5px)',
                display: 'grid',
                justifyItems: 'center'
              }}
            >
              <div style={{ width: '52px', height: '48px', background: '#eff6ff', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
                {/* SVG cartoon smiley */}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
              </div>
              <span style={{ fontFamily: 'var(--font-hand)', fontSize: '0.48rem', color: '#64748b', marginTop: '2px' }}>mitsumi</span>
            </motion.div>

            {/* Right mini polaroid mock */}
            <motion.div 
              style={{
                background: '#ffffff',
                border: '1.5px solid #e2e8f0',
                borderBottomWidth: '10px',
                padding: '6px',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                width: '64px',
                height: '76px',
                transform: 'rotate(6deg) translate(10px, -5px)',
                display: 'grid',
                justifyItems: 'center'
              }}
            >
              <div style={{ width: '52px', height: '48px', background: '#fff5f8', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#db2777" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
              </div>
              <span style={{ fontFamily: 'var(--font-hand)', fontSize: '0.48rem', color: '#64748b', marginTop: '2px' }}>sousuke</span>
            </motion.div>
          </div>
        );

      case 'quiz':
        return (
          <div style={{ display: 'grid', gap: '8px', width: '100%', maxWidth: '280px' }}>
            {[
              { rank: 1, name: uiLanguage === 'ja' ? 'みつみ' : 'Mitsumi', score: 100, icon: Crown, color: '#f59e0b', bg: '#fffbeb', border: '#fcd34d' },
              { rank: 2, name: uiLanguage === 'ja' ? '聡介' : 'Sousuke', score: 90, icon: Trophy, color: '#475569', bg: '#f8fafc', border: '#cbd5e1' }
            ].map((player, idx) => {
              const P_Icon = player.icon;
              return (
                <div 
                  key={idx}
                  className="sketchbook-border"
                  style={{
                    ...createPaperPanelStyle({ background: player.bg, borderColor: player.border, bottomColor: player.color, radius: '12px' }),
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                    boxSizing: 'border-box'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div 
                      className="sketchbook-border"
                      style={{ 
                        width: '24px', 
                        height: '24px', 
                        background: '#ffffff', 
                        border: '2px solid #cbd5e1', 
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: COMMUNITY_FONT_FAMILY,
                        fontSize: '0.74rem',
                        color: player.color
                      }}
                    >
                      #{player.rank}
                    </div>
                    <span style={{ fontFamily: COMMUNITY_FONT_FAMILY, fontSize: '0.84rem', color: '#1e293b' }}>{player.name}</span>
                    <P_Icon size={14} color={player.color} />
                  </div>
                  <div 
                    className="sketchbook-border"
                    style={{
                      background: '#ffffff',
                      border: '1.5px solid #cbd5e1',
                      borderBottom: '3px solid #64748b',
                      borderRadius: '8px',
                      padding: '2px 8px',
                      fontFamily: COMMUNITY_FONT_FAMILY,
                      fontSize: '0.78rem',
                      color: player.color
                    }}
                  >
                    {player.score}%
                  </div>
                </div>
              );
            })}
          </div>
        );

      case 'birthdays':
        return (
          <div style={{ display: 'grid', justifyItems: 'center', width: '100%', maxWidth: '280px', position: 'relative' }}>
            {/* Animated birthday visual simulator */}
            <div 
              className="sketchbook-border"
              style={{
                ...createPaperPanelStyle({ background: '#fffbeb', borderColor: '#fcd34d', bottomColor: '#d97706', radius: '16px' }),
                padding: '14px',
                width: '100%',
                boxSizing: 'border-box',
                textAlign: 'center',
                position: 'relative'
              }}
            >
              <div 
                className="washi-tape washi-tape--pink" 
                style={{ position: 'absolute', top: '-10px', left: '16px', width: '48px', height: '14px', transform: 'rotate(-4deg)' }}
              />
              
              {/* Cute mini cake graphic */}
              <motion.div 
                animate={{ y: [0, -4, 0] }}
                transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
                style={{ display: 'inline-flex', marginBottom: '4px' }}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2">
                  <path d="M12 2v4M8 6h8M6 10h12v12H6zM4 14h16M4 18h16"/>
                </svg>
              </motion.div>
              
              <div style={{ fontFamily: COMMUNITY_FONT_FAMILY, fontSize: '0.88rem', color: '#78350f' }}>
                {uiLanguage === 'ja' ? '美津未の誕生日！' : "Mitsumi's birthday!"}
              </div>
              <div style={{ fontFamily: 'var(--font-hand)', fontSize: '0.78rem', color: '#d97706', marginTop: '2px' }}>
                {uiLanguage === 'ja' ? 'バースデー特製スタンプ & バルーン出現' : 'Birthday page active'}
              </div>
            </div>
          </div>
        );

      case 'shortcuts':
        return (
          <div style={{ display: 'grid', gap: '8px', justifyItems: 'center', width: '100%' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['Q', 'E'].map((keyChar, idx) => (
                <div
                  key={idx}
                  className="sketchbook-border"
                  style={{
                    border: '2px solid #a5b4fc',
                    borderBottom: '5px solid #4f46e5',
                    borderRadius: '8px',
                    background: '#e0e7ff',
                    color: '#4338ca',
                    padding: '4px 10px',
                    fontSize: '0.82rem',
                    fontFamily: COMMUNITY_FONT_FAMILY,
                    minWidth: '24px',
                    textAlign: 'center',
                    cursor: 'pointer'
                  }}
                >
                  {keyChar}
                </div>
              ))}
            </div>
            <span style={{ fontFamily: 'var(--font-hand)', fontSize: '0.78rem', color: '#4f46e5', textAlign: 'center' }}>
              {uiLanguage === 'ja' ? 'サブタブを前後にフリップ切り替え' : 'Switch sub-tabs with Q / E'}
            </span>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <PageLayout isMobile={isMobile}>
      {/* Intro Header Section */}
      <div style={{ display: 'grid', gap: '8px' }}>
        <PaperPageHeader
          isMobile={isMobile}
          center={
            outerSwitcher ?? (
              <PaperHeadingBadge
                isMobile={isMobile}
                icon={HelpCircle}
                title={t.title}
                palette={{
                  borderColor: '#06b6d4',
                  bottomColor: '#0891b2',
                  shadow: '0 8px 18px rgba(6, 182, 212, 0.12)',
                }}
                titleColor="#06b6d4"
                iconColor="#06b6d4"
              />
            )
          }
          marginBottomMobile="0"
          marginBottomDesktop="0"
          paddingMobile="0 10px"
          paddingDesktop="0"
        />
        <p style={{ margin: 0, color: '#475569', fontSize: isMobile ? '0.98rem' : '1.1rem', lineHeight: 1.6, textAlign: 'center' }}>
          {t.subtitle}
        </p>
      </div>

      {/* Welcome Wobbly Card */}
      <div
        className="sketchbook-border"
        style={{
          ...createPaperPanelStyle({
            background: '#ecfeff',
            borderColor: '#a5f3fc',
            bottomColor: '#06b6d4',
            radius: '24px',
            shadow: '0 8px 20px rgba(6, 182, 212, 0.05)',
          }),
          padding: isMobile ? '16px 18px' : '20px 24px',
          position: 'relative',
          display: 'grid',
          gap: '10px',
        }}
      >
        <div
          className="washi-tape washi-tape--yellow"
          style={{
            top: '-12px',
            left: '28px',
            transform: 'rotate(-2.5deg)',
            width: '80px',
            height: '20px',
            zIndex: 5,
          }}
        />
        <h2
          style={{
            margin: 0,
            fontFamily: COMMUNITY_FONT_FAMILY,
            color: '#0891b2',
            fontSize: '1.35rem',
            fontWeight: '400',
          }}
        >
          {t.welcome}
        </h2>
        <p style={{ margin: 0, color: '#164e63', lineHeight: 1.6, fontSize: isMobile ? '0.94rem' : '1rem' }}>
          {t.welcomeBody}
        </p>
      </div>

      {/* Main Interactive Guide Selector Dashboard */}
      <div style={{ display: 'grid', gap: '6px' }}>
        <span style={{ fontFamily: COMMUNITY_FONT_FAMILY, fontSize: '1.05rem', color: '#475569' }}>
          {t.clickToExplore || 'Select a tab to view its interactive preview:'}
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '3fr 4fr',
          gap: '24px',
          alignItems: 'start',
        }}
      >
        {/* Left Side Tab Buttons Selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {t.sections.map((section, idx) => {
            const SectionIcon = section.icon;
            const isSelected = activeTab === section.id;
            return (
              <motion.button
                key={section.id}
                onClick={() => setActiveTab(section.id)}
                whileHover={{ scale: 1.015, x: 4 }}
                className="sketchbook-border"
                style={{
                  ...createPaperPanelStyle({
                    background: isSelected ? section.bg : '#ffffff',
                    borderColor: isSelected ? section.border : '#cbd5e1',
                    bottomColor: isSelected ? section.color : '#94a3b8',
                    radius: '20px',
                    shadow: isSelected ? '0 6px 12px rgba(15,23,42,0.04)' : '0 2px 4px rgba(15,23,42,0.01)',
                  }),
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                  position: 'relative',
                }}
              >
                {/* Visual indicator stamp */}
                <div
                  className="sketchbook-border"
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '10px',
                    border: `2px solid ${isSelected ? section.border : '#cbd5e1'}`,
                    borderBottom: `4px solid ${isSelected ? section.color : '#94a3b8'}`,
                    background: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isSelected ? section.color : '#64748b',
                    flexShrink: 0,
                  }}
                >
                  <SectionIcon size={16} strokeWidth={2.8} />
                </div>
                <div style={{ display: 'grid', gap: '2px', minWidth: 0 }}>
                  <span
                    style={{
                      margin: 0,
                      fontFamily: COMMUNITY_FONT_FAMILY,
                      color: isSelected ? '#1f2937' : '#475569',
                      fontSize: '1.05rem',
                      fontWeight: '400',
                    }}
                  >
                    {section.title}
                  </span>
                </div>
                <ChevronRight 
                  size={16} 
                  color={isSelected ? section.color : '#94a3b8'} 
                  style={{ marginLeft: 'auto', flexShrink: 0, opacity: isSelected ? 1 : 0.4 }} 
                />
              </motion.button>
            );
          })}
        </div>

        {/* Right Side Visual Showcase Board */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.22 }}
            className="sketchbook-border"
            style={{
              ...createPaperPanelStyle({
                background: selectedSection.bg,
                borderColor: selectedSection.border,
                bottomColor: selectedSection.color,
                radius: '28px',
                shadow: '0 10px 24px rgba(15,23,42,0.04)',
              }),
              padding: '24px 20px',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            {/* Visual Tape Accent */}
            <div
              className={`washi-tape washi-tape--${selectedSection.washi}`}
              style={{
                top: '-12px',
                left: '24px',
                transform: 'rotate(-3deg)',
                width: '74px',
                height: '18px',
                zIndex: 5,
              }}
            />

            {/* Title & Icon Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                className="sketchbook-border"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  border: `2px solid ${selectedSection.border}`,
                  borderBottom: `5px solid ${selectedSection.color}`,
                  background: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: selectedSection.color,
                  flexShrink: 0,
                }}
              >
                <IconActive size={18} strokeWidth={2.8} />
              </div>
              <h3
                style={{
                  margin: 0,
                  fontFamily: COMMUNITY_FONT_FAMILY,
                  color: '#1f2937',
                  fontSize: '1.25rem',
                  fontWeight: '400',
                }}
              >
                {selectedSection.title}
              </h3>
            </div>

            {/* Description Paragraph */}
            <p style={{ margin: 0, color: '#475569', fontSize: '0.94rem', lineHeight: 1.6 }}>
              {selectedSection.text}
            </p>

            {/* Live Interactive CSS/SVG Simulation Mockup */}
            <div 
              className="sketchbook-border"
              style={{
                background: '#ffffff',
                border: `2px dashed ${selectedSection.border}`,
                borderRadius: '20px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '140px',
                boxSizing: 'border-box'
              }}
            >
              {renderVisualMockup()}
            </div>

            {/* Detailed Notepad Breakdown list */}
            <div style={{ display: 'grid', gap: '8px', marginTop: '4px' }}>
              {selectedSection.details.map((detail, dIdx) => (
                <div 
                  key={dIdx} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'start', 
                    gap: '8px',
                    fontSize: '0.88rem',
                    color: '#334155',
                    lineHeight: 1.4
                  }}
                >
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: selectedSection.color, marginTop: '7px', flexShrink: 0 }} />
                  <span>{detail}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Keyboard Shortcuts Reference Block */}
      <div
        className="sketchbook-border"
        style={{
          ...createPaperPanelStyle({
            background: '#ffffff',
            borderColor: '#cbd5e1',
            bottomColor: '#94a3b8',
            radius: '28px',
            shadow: '0 8px 24px rgba(15,23,42,0.02)',
          }),
          padding: isMobile ? '20px 16px' : '24px 28px',
          position: 'relative',
          display: 'grid',
          gap: '16px',
          marginTop: '8px',
        }}
      >
        <div
          className="washi-tape washi-tape--yellow"
          style={{
            top: '-12px',
            right: '32px',
            transform: 'rotate(2.5deg)',
            width: '84px',
            height: '22px',
            zIndex: 5,
          }}
        />

        <div style={{ display: 'grid', gap: '6px' }}>
          <h2
            style={{
              margin: 0,
              fontFamily: COMMUNITY_FONT_FAMILY,
              color: '#334155',
              fontSize: '1.38rem',
              fontWeight: '400',
              borderBottom: '2px dashed #cbd5e1',
              paddingBottom: '8px',
            }}
          >
            {t.shortcutsTitle}
          </h2>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.94rem', lineHeight: 1.5, marginTop: '4px' }}>
            {t.shortcutsIntro}
          </p>
        </div>

        <div style={{ display: 'grid', gap: '12px', marginTop: '4px' }}>
          {t.shortcutsList.map((sc, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                paddingBottom: '10px',
                borderBottom: idx === t.shortcutsList.length - 1 ? 'none' : '1px dashed #f1f5f9',
              }}
            >
              <div
                className="sketchbook-border"
                style={{
                  border: '2px solid #93c5fd',
                  borderBottom: '5px solid #60a5fa',
                  borderRadius: '10px',
                  background: '#eff6ff',
                  color: '#1d4ed8',
                  padding: '5px 12px',
                  fontSize: '0.86rem',
                  fontFamily: COMMUNITY_FONT_FAMILY,
                  minWidth: '70px',
                  textAlign: 'center',
                  fontWeight: '400',
                  lineHeight: 1.1,
                  flexShrink: 0,
                }}
              >
                {sc.key}
              </div>
              <span style={{ color: '#475569', fontSize: '0.94rem', lineHeight: 1.4 }}>
                {sc.desc}
              </span>
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  );
};

export default TutorialPage;

