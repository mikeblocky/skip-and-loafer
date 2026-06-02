import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, AlertCircle } from 'lucide-react';
import usePageTitle from '../hooks/shared/usePageTitle';

const EPISODE_1_VIDEO_SOURCES = [
  import.meta.env.VITE_ANIME_EPISODE_1_URL || 'https://media.githubusercontent.com/media/mikeblocky/skip-and-loafer/main/public/anime/episode1.mp4',
  '/anime/episode1.mp4',
];

const ANIME_COPY = {
  en: {
    title: 'Watch Episode 1',
    subtitle: 'Pika Pika (Sparkling)',
    warning: 'Note: This episode is Japanese audio only with no subtitles.',
    play: 'Play',
    pause: 'Pause',
    mute: 'Mute',
    unmute: 'Unmute',
    fullscreen: 'Fullscreen',
    exitFullscreen: 'Exit fullscreen',
    videoError: 'This episode could not be loaded. Check that the video source is reachable and uses a browser-supported MP4 format.',
  },
  es: {
    title: 'Ver Episodio 1',
    subtitle: 'Pika Pika (Brillante)',
    warning: 'Nota: Este episodio solo tiene audio en japonés sin subtítulos.',
    play: 'Reproducir',
    pause: 'Pausar',
    mute: 'Silenciar',
    unmute: 'Activar sonido',
    fullscreen: 'Pantalla completa',
    exitFullscreen: 'Salir de pantalla completa',
    videoError: 'No se pudo cargar este episodio. Comprueba que la fuente del video sea accesible y use un formato MP4 compatible.',
  },
  pt: {
    title: 'Assistir Episódio 1',
    subtitle: 'Pika Pika (Brilhante)',
    warning: 'Nota: Este episódio possui apenas áudio em japonês e sem legendas.',
    play: 'Jogar',
    pause: 'Pausar',
    mute: 'Mudo',
    unmute: 'Ativar som',
    fullscreen: 'Tela cheia',
    exitFullscreen: 'Sair da tela cheia',
    videoError: 'Este episódio não pôde ser carregado. Verifique se a fonte do vídeo está acessível e usa um formato MP4 compatível.',
  },
  fr: {
    title: 'Regarder l\'Épisode 1',
    subtitle: 'Pika Pika (Étincelant)',
    warning: 'Note : Cet épisode est uniquement disponible en audio japonais sans sous-titres.',
    play: 'Lecture',
    pause: 'Pause',
    mute: 'Muet',
    unmute: 'Activer le son',
    fullscreen: 'Plein écran',
    exitFullscreen: 'Quitter le plein écran',
    videoError: 'Impossible de charger cet épisode. Vérifiez que la source vidéo est accessible et utilise un format MP4 compatible.',
  },
  de: {
    title: 'Folge 1 ansehen',
    subtitle: 'Pika Pika (Funkelnd)',
    warning: 'Hinweis: Diese Episode enthält nur japanische Audio-Spuren ohne Untertitel.',
    play: 'Abspielen',
    pause: 'Pause',
    mute: 'Stummschalten',
    unmute: 'Ton einschalten',
    fullscreen: 'Vollbild',
    exitFullscreen: 'Vollbild verlassen',
    videoError: 'Diese Folge konnte nicht geladen werden. Prüfe, ob die Videoquelle erreichbar ist und ein unterstütztes MP4-Format verwendet.',
  },
  it: {
    title: 'Guarda l\'Episodio 1',
    subtitle: 'Pika Pika (Scintillante)',
    warning: 'Nota: Questo episodio ha solo l\'audio in giapponese e non ha sottotitoli.',
    play: 'Riproduci',
    pause: 'Pausa',
    mute: 'Muto',
    unmute: 'Riattiva audio',
    fullscreen: 'Schermo intero',
    exitFullscreen: 'Esci da schermo intero',
    videoError: 'Non è stato possibile caricare questo episodio. Verifica che la sorgente video sia raggiungibile e usi un formato MP4 supportato.',
  },
  ja: {
    title: '第1話を見る',
    subtitle: 'ピカピカ',
    warning: '注意：このエピソードは日本語音声のみで、字幕はありません。',
    play: '再生',
    pause: '一時停止',
    mute: 'ミュート',
    unmute: 'ミュート解除',
    fullscreen: '全画面表示',
    exitFullscreen: '全画面解除',
    videoError: 'このエピソードを読み込めませんでした。動画ソースにアクセスでき、対応するMP4形式であることを確認してください。',
  },
};

const formatTime = (timeInSeconds) => {
  if (isNaN(timeInSeconds)) return '0:00';
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

// Module-level state survives unmount/remount within the same session
let _persistedState = {
  currentTime: 0,
  isPlaying: false,
  volume: 1,
  isMuted: false,
};

export const AnimePage = ({ isMobile, uiLanguage = 'en' }) => {
  const t = ANIME_COPY[uiLanguage] || ANIME_COPY.en;
  usePageTitle(t.title);

  const videoRef = useRef(null);
  const containerRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(_persistedState.currentTime);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(_persistedState.volume);
  const [isMuted, setIsMuted] = useState(_persistedState.isMuted);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const controlsTimeoutRef = useRef(null);
  const wasPlayingRef = useRef(_persistedState.isPlaying);

  // Restore playback position + state on mount, save on unmount, exit PIP on unmount
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Restore persisted state
    video.volume = _persistedState.volume;
    video.muted = _persistedState.isMuted;

    const handleCanPlay = () => {
      if (_persistedState.currentTime > 0) {
        video.currentTime = _persistedState.currentTime;
      }
      if (wasPlayingRef.current) {
        video.play().catch(() => {});
      }
    };

    // If metadata is already loaded (cached), restore immediately
    if (video.readyState >= 1) {
      handleCanPlay();
    } else {
      video.addEventListener('loadedmetadata', handleCanPlay, { once: true });
    }

    return () => {
      // Save state before unmount
      _persistedState = {
        currentTime: video.currentTime || 0,
        isPlaying: !video.paused,
        volume: video.volume,
        isMuted: video.muted,
      };

      // Exit PIP so the stale video element doesn't keep floating
      if (document.pictureInPictureElement === video) {
        document.exitPictureInPicture().catch(() => {});
      }

      video.removeEventListener('loadedmetadata', handleCanPlay);
      video.pause();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep wasPlayingRef in sync so unmount cleanup reads the latest value
  useEffect(() => {
    wasPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Handle play/pause toggles
  const handlePlayPause = useCallback(() => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(() => {
        setVideoError(true);
        setIsPlaying(false);
      });
    }
  }, [isPlaying]);

  // Handle seeking
  const handleScrub = useCallback((event) => {
    const nextTime = parseFloat(event.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = nextTime;
      setCurrentTime(nextTime);
    }
  }, []);

  // Handle volume changes
  const handleVolumeChange = useCallback((event) => {
    const nextVolume = parseFloat(event.target.value);
    setVolume(nextVolume);
    setIsMuted(nextVolume === 0);
    if (videoRef.current) {
      videoRef.current.volume = nextVolume;
      videoRef.current.muted = nextVolume === 0;
    }
  }, []);

  // Handle mute toggles
  const handleMuteToggle = useCallback(() => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (videoRef.current) {
      videoRef.current.muted = nextMuted;
      videoRef.current.volume = nextMuted ? 0 : volume || 0.5;
    }
  }, [isMuted, volume]);

  // Handle fullscreen toggle
  const handleFullscreenToggle = useCallback(() => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        void containerRef.current.requestFullscreen();
      } else if (containerRef.current.webkitRequestFullscreen) {
        void containerRef.current.webkitRequestFullscreen();
      } else if (containerRef.current.msRequestFullscreen) {
        void containerRef.current.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        void document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        void document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        void document.msExitFullscreen();
      }
    }
  }, [isFullscreen]);

  // Mouse movement control display timer
  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying) {
      controlsTimeoutRef.current = window.setTimeout(() => {
        setShowControls(false);
      }, 2500);
    }
  }, [isPlaying]);

  // Listen to fullscreen changes globally
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Reset controls hide timer on pause/play
  useEffect(() => {
    if (!isPlaying) {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    } else {
      controlsTimeoutRef.current = window.setTimeout(() => {
        setShowControls(false);
      }, 2500);
    }
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [isPlaying]);


  return (
    <div
      style={{
        width: '100%',
        maxWidth: '900px',
        margin: '0 auto',
        padding: isMobile ? '16px 12px 80px' : '32px 40px',
        display: 'flex',
        flexDirection: 'column',
        gap: isMobile ? '14px' : '18px',
        boxSizing: 'border-box',
        flex: isMobile ? '0 0 auto' : 1,
      }}
    >
      {/* Clean page header */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
      >
        <span
          style={{
            fontFamily: '"Sniglet", "Coming Soon", cursive',
            color: '#a855f7',
            fontWeight: 'bold',
            fontSize: '0.82rem',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}
        >
          {t.title}
        </span>
        <h1
          style={{
            margin: 0,
            fontFamily: '"Sniglet", "Coming Soon", cursive',
            fontSize: isMobile ? '1.4rem' : '2rem',
            color: '#1e293b',
          }}
        >
          {t.subtitle}
        </h1>
      </div>

      {/* Warning banner — clean rounded */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          backgroundColor: '#fffbeb',
          border: '1.5px solid #fbbf24',
          borderRadius: '12px',
          padding: isMobile ? '10px 14px' : '12px 16px',
          color: '#92400e',
        }}
      >
        <AlertCircle size={18} style={{ flexShrink: 0 }} />
        <span
          style={{
            fontFamily: 'var(--font-main)',
            fontSize: isMobile ? '0.82rem' : '0.9rem',
            fontWeight: 600,
            lineHeight: 1.4,
          }}
        >
          {t.warning}
        </span>
      </div>

      {/* Video Player Container — clean rounded corners */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => isPlaying && setShowControls(false)}
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16/9',
          backgroundColor: '#0f0f0f',
          borderRadius: isFullscreen ? '0' : '16px',
          overflow: 'hidden',
          boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
          flexShrink: 0,
        }}
      >
        <video
          ref={videoRef}
          onClick={handlePlayPause}
          onTimeUpdate={() => {
            if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
          }}
          onLoadedMetadata={() => {
            if (videoRef.current) setDuration(videoRef.current.duration);
          }}
          onCanPlay={() => setVideoError(false)}
          onError={() => {
            setVideoError(true);
            setIsPlaying(false);
          }}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          preload="metadata"
          playsInline
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            cursor: 'pointer',
            display: 'block',
          }}
        >
          {EPISODE_1_VIDEO_SOURCES.map((source) => (
            <source key={source} src={source} type="video/mp4" />
          ))}
        </video>

        {videoError && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: isMobile ? '18px' : '24px',
              background: 'rgba(15, 15, 15, 0.88)',
              color: '#ffffff',
              textAlign: 'center',
              fontFamily: 'var(--font-main)',
              fontSize: isMobile ? '0.9rem' : '1rem',
              fontWeight: 700,
              lineHeight: 1.45,
            }}
          >
            {t.videoError}
          </div>
        )}

        {/* Play overlay */}
        <AnimatePresence>
          {!isPlaying && !videoError && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={handlePlayPause}
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(0, 0, 0, 0.35)',
                cursor: 'pointer',
              }}
            >
              <motion.div
                initial={{ scale: 0.85 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.85 }}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  width: isMobile ? '56px' : '72px',
                  height: isMobile ? '56px' : '72px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(8px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
                }}
              >
                <Play
                  size={isMobile ? 24 : 30}
                  fill="#1e293b"
                  color="#1e293b"
                  style={{ marginLeft: isMobile ? '3px' : '4px' }}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Controls bar — frosted glass */}
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 10,
                background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.35) 70%, transparent 100%)',
                padding: isMobile ? '32px 12px 10px' : '40px 20px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                boxSizing: 'border-box',
              }}
            >
              {/* Timeline scrubber */}
              <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  step={0.1}
                  value={currentTime}
                  onChange={handleScrub}
                  className="anime-timeline-slider"
                  style={{
                    flex: 1,
                    height: '4px',
                    borderRadius: '2px',
                    appearance: 'none',
                    background: `linear-gradient(to right, #a855f7 ${duration ? (currentTime / duration) * 100 : 0}%, rgba(255,255,255,0.3) ${duration ? (currentTime / duration) * 100 : 0}%)`,
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Bottom controls row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '12px' }}>
                  {/* Play / Pause */}
                  <button
                    onClick={handlePlayPause}
                    aria-label={isPlaying ? t.pause : t.play}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#ffffff',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {isPlaying
                      ? <Pause size={isMobile ? 18 : 20} fill="#ffffff" />
                      : <Play size={isMobile ? 18 : 20} fill="#ffffff" />}
                  </button>

                  {/* Volume */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <button
                      onClick={handleMuteToggle}
                      aria-label={isMuted ? t.unmute : t.mute}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#ffffff',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      {isMuted ? <VolumeX size={isMobile ? 16 : 18} /> : <Volume2 size={isMobile ? 16 : 18} />}
                    </button>
                    {!isMobile && (
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        style={{
                          width: '60px',
                          height: '3px',
                          appearance: 'none',
                          background: `linear-gradient(to right, #ffffff ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.3) ${(isMuted ? 0 : volume) * 100}%)`,
                          borderRadius: '2px',
                          cursor: 'pointer',
                          outline: 'none',
                        }}
                      />
                    )}
                  </div>

                  {/* Time */}
                  <span
                    style={{
                      fontFamily: '"Sniglet", "Coming Soon", cursive',
                      fontSize: isMobile ? '0.78rem' : '0.84rem',
                      color: 'rgba(255,255,255,0.9)',
                      fontWeight: 600,
                      userSelect: 'none',
                    }}
                  >
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                {/* Fullscreen */}
                <button
                  onClick={handleFullscreenToggle}
                  aria-label={isFullscreen ? t.exitFullscreen : t.fullscreen}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#ffffff',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {isFullscreen ? <Minimize size={isMobile ? 16 : 18} /> : <Maximize size={isMobile ? 16 : 18} />}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Slider thumb styles */}
      <style>{`
        .anime-timeline-slider::-webkit-slider-thumb {
          appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #a855f7;
          border: 2px solid #ffffff;
          box-shadow: 0 1px 4px rgba(0,0,0,0.3);
          cursor: pointer;
          transition: transform 0.1s ease;
        }
        .anime-timeline-slider::-webkit-slider-thumb:hover {
          transform: scale(1.25);
        }
        .anime-timeline-slider::-moz-range-thumb {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #a855f7;
          border: 2px solid #ffffff;
          box-shadow: 0 1px 4px rgba(0,0,0,0.3);
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default AnimePage;
