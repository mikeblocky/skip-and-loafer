import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LoaderCircle, PenLine, RotateCcw, Send, UserRound } from 'lucide-react';
import {
  createSignature,
  getCachedSignatures,
  preloadSignatures,
  refreshSignatures,
} from '../features/community/communityApi';
import CommunityModal from '../features/community/CommunityModal';
import {
  COMMUNITY_FONT_FAMILY,
  COMMUNITY_INPUT_STYLE,
  COMMUNITY_PAGE_STYLE,
  COMMUNITY_PANEL_STYLE,
  COMMUNITY_TEXTAREA_STYLE,
  createCommunityButtonStyle,
  createCommunityCounterStyle,
  createCommunityChipStyle,
  createCommunityTimestampStyle,
  formatCommunityTimestamp,
} from '../features/community/communityTheme';

const PAGE_COPY = {
  en: {
    title: 'Fan messages',
    badge: 'Guestbook messages',
    subtitle: 'Short messages from visitors, readers, and anyone passing through this place.',
    button: 'Write a message',
    modalTitle: 'Write your message',
    nameLabel: 'Name',
    namePlaceholder: 'How should people remember you?',
    messageLabel: 'Message',
    messagePlaceholder: 'Leave a kind note or a quick hello...',
    submit: 'Post message',
    close: 'Close',
    resetCanvas: 'Reset canvas',
    notesCountLabel: 'notes',
    posting: 'Posting...',
    empty: 'No messages yet. Leave the first one.',
    success: 'Your message is on the page.',
    helper: 'Tap the button to add a message.',
    loadError: 'Could not load the message page right now.',
    nameRequired: 'Add a name before posting.',
    messageRequired: 'Add a short message before posting.',
    submitError: 'Could not post your message.',
  },
  es: {
    title: 'Mensajes de fans',
    badge: 'Mensajes de visitantes',
    subtitle: 'Mensajes breves de visitantes, lectores y cualquiera que pase por este lugar.',
    button: 'Escribir un mensaje',
    modalTitle: 'Escribe tu mensaje',
    nameLabel: 'Nombre',
    namePlaceholder: '¿Cómo quieres que te recuerden?',
    messageLabel: 'Mensaje',
    messagePlaceholder: 'Deja una nota amable o un saludo rápido...',
    submit: 'Publicar mensaje',
    close: 'Cerrar',
    resetCanvas: 'Restablecer lienzo',
    notesCountLabel: 'firmas',
    posting: 'Publicando...',
    empty: 'Aún no hay mensajes. Deja el primero.',
    success: 'Tu mensaje ya está en la página.',
    helper: 'Toca el botón para añadir un mensaje.',
    loadError: 'No se pudo cargar la página de mensajes ahora mismo.',
    nameRequired: 'Añade un nombre antes de publicar.',
    messageRequired: 'Añade un mensaje breve antes de publicar.',
    submitError: 'No se pudo publicar tu mensaje.',
  },
  pt: {
    title: 'Mensagens dos fãs',
    badge: 'Mensagens dos visitantes',
    subtitle: 'Mensagens curtas de visitantes, leitores e qualquer pessoa que passe por este lugar.',
    button: 'Escrever uma mensagem',
    modalTitle: 'Escreva sua mensagem',
    nameLabel: 'Nome',
    namePlaceholder: 'Como as pessoas devem se lembrar de você?',
    messageLabel: 'Mensagem',
    messagePlaceholder: 'Deixe uma nota gentil ou um oi rápido...',
    submit: 'Publicar mensagem',
    close: 'Fechar',
    resetCanvas: 'Redefinir tela',
    notesCountLabel: 'assinaturas',
    posting: 'Publicando...',
    empty: 'Ainda não há mensagens. Deixe a primeira.',
    success: 'Sua mensagem já está na página.',
    helper: 'Toque no botão para adicionar uma mensagem.',
    loadError: 'Não foi possível carregar a página de mensagens agora.',
    nameRequired: 'Adicione um nome antes de publicar.',
    messageRequired: 'Adicione uma mensagem curta antes de publicar.',
    submitError: 'Não foi possível publicar sua mensagem.',
  },
  fr: {
    title: 'Messages fan',
    badge: 'Messages des visiteurs',
    subtitle: 'Courts messages de visiteurs, lecteurs et de toute personne qui passe ici.',
    button: 'Écrire un message',
    modalTitle: 'Écris ton message',
    nameLabel: 'Nom',
    namePlaceholder: 'Comment veux-tu être mémorisé ?',
    messageLabel: 'Message',
    messagePlaceholder: 'Laisse une note gentille ou un petit bonjour...',
    submit: 'Publier le message',
    close: 'Fermer',
    resetCanvas: 'Réinitialiser le canevas',
    notesCountLabel: 'signatures',
    posting: 'Publication...',
    empty: 'Aucun message pour le moment. Laisse le premier.',
    success: 'Ton message est sur la page.',
    helper: 'Appuie sur le bouton pour ajouter un message.',
    loadError: 'Impossible de charger la page de messages pour le moment.',
    nameRequired: 'Ajoute un nom avant de publier.',
    messageRequired: 'Ajoute un court message avant de publier.',
    submitError: 'Impossible de publier ton message.',
  },
  de: {
    title: 'Fan-Nachrichten',
    badge: 'Nachrichten der Besucher',
    subtitle: 'Kurze Nachrichten von Besuchern, Lesern und allen, die hier vorbeischauen.',
    button: 'Nachricht schreiben',
    modalTitle: 'Schreibe deine Nachricht',
    nameLabel: 'Name',
    namePlaceholder: 'Wie sollen sich Leute an dich erinnern?',
    messageLabel: 'Nachricht',
    messagePlaceholder: 'Hinterlasse eine nette Notiz oder ein kurzes Hallo...',
    submit: 'Nachricht posten',
    close: 'Schließen',
    resetCanvas: 'Leinwand zurücksetzen',
    notesCountLabel: 'Autogramme',
    posting: 'Wird gepostet...',
    empty: 'Noch keine Nachrichten. Hinterlasse die erste.',
    success: 'Deine Nachricht ist auf der Seite.',
    helper: 'Tippe auf den Button, um eine Nachricht hinzuzufügen.',
    loadError: 'Die Nachrichtenseite konnte gerade nicht geladen werden.',
    nameRequired: 'Bitte gib einen Namen ein, bevor du postest.',
    messageRequired: 'Bitte gib eine kurze Nachricht ein, bevor du postest.',
    submitError: 'Deine Nachricht konnte nicht gepostet werden.',
  },
  it: {
    title: 'Messaggi fan',
    badge: 'Messaggi dei visitatori',
    subtitle: 'Brevi messaggi di visitatori, lettori e chiunque passi di qui.',
    button: 'Scrivi un messaggio',
    modalTitle: 'Scrivi il tuo messaggio',
    nameLabel: 'Nome',
    namePlaceholder: 'Come vuoi che ti ricordino?',
    messageLabel: 'Messaggio',
    messagePlaceholder: 'Lascia un pensiero gentile o un saluto veloce...',
    submit: 'Pubblica messaggio',
    close: 'Chiudi',
    resetCanvas: 'Reimposta tela',
    notesCountLabel: 'firme',
    posting: 'Pubblicazione...',
    empty: 'Ancora nessun messaggio. Lascia il primo.',
    success: 'Il tuo messaggio è sulla pagina.',
    helper: 'Tocca il pulsante per aggiungere un messaggio.',
    loadError: 'Impossibile caricare la pagina dei messaggi in questo momento.',
    nameRequired: 'Aggiungi un nome prima di pubblicare.',
    messageRequired: 'Aggiungi un breve messaggio prima di pubblicare.',
    submitError: 'Impossibile pubblicare il tuo messaggio.',
  },
};

const NOTE_PALETTES = [
  { background: '#fff8be', border: '#facc15', bottom: '#eab308', accent: '#a16207' },
  { background: '#fee2e2', border: '#fda4af', bottom: '#fb7185', accent: '#be123c' },
  { background: '#dbeafe', border: '#93c5fd', bottom: '#60a5fa', accent: '#1d4ed8' },
  { background: '#dcfce7', border: '#86efac', bottom: '#4ade80', accent: '#15803d' },
  { background: '#fce7f3', border: '#f9a8d4', bottom: '#f472b6', accent: '#be185d' },
  { background: '#ede9fe', border: '#c4b5fd', bottom: '#a78bfa', accent: '#6d28d9' },
  { background: '#ffedd5', border: '#fdba74', bottom: '#fb923c', accent: '#c2410c' },
  { background: '#ecfeff', border: '#67e8f9', bottom: '#22d3ee', accent: '#0f766e' },
];

const STACK_OFFSETS = [
  { x: -8, y: 0, rotate: -2.8 },
  { x: 6, y: 4, rotate: 2.2 },
  { x: -4, y: 1, rotate: -1.6 },
  { x: 7, y: 6, rotate: 3 },
  { x: -6, y: 2, rotate: -2.2 },
  { x: 5, y: 5, rotate: 1.8 },
];

const MIN_GESTURE_SCALE = 0.9;
const MAX_GESTURE_SCALE = 2.4;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getTouchDistance(touchA, touchB) {
  return Math.hypot(touchB.clientX - touchA.clientX, touchB.clientY - touchA.clientY);
}

function getTouchAngle(touchA, touchB) {
  return Math.atan2(touchB.clientY - touchA.clientY, touchB.clientX - touchA.clientX) * (180 / Math.PI);
}

function getWheelGestureAngle(deltaY, deltaX = 0) {
  return Math.max(-18, Math.min(18, (Math.atan2(deltaY, deltaX || 0.001) * 180) / Math.PI * 0.08));
}

function getEntryStackLayout(entry, index) {
  const seedSource = `${entry?.id || ''}:${entry?.createdAt || ''}:${entry?.name || ''}`;
  let seed = 0;
  for (let i = 0; i < seedSource.length; i += 1) {
    seed = (seed * 31 + seedSource.charCodeAt(i)) >>> 0;
  }

  const variant = (seed + index) % STACK_OFFSETS.length;
  const spread = (seed % 3) - 1;

  return {
    offsetX: STACK_OFFSETS[variant].x + spread * 2,
    offsetY: STACK_OFFSETS[variant].y,
    rotate: STACK_OFFSETS[variant].rotate + spread * 0.35,
  };
}

function getCopy(uiLanguage) {
  return PAGE_COPY[uiLanguage] || PAGE_COPY.en;
}

function StatusBanner({ tone, message }) {
  if (!message) return null;

  const palette = tone === 'error'
    ? { border: '#fca5a5', bottom: '#ef4444', background: '#fff1f2', color: '#b91c1c' }
    : { border: '#86efac', bottom: '#22c55e', background: '#f0fdf4', color: '#166534' };

  return (
    <div
      style={{
        ...COMMUNITY_PANEL_STYLE,
        borderColor: palette.border,
        borderBottomColor: palette.bottom,
        background: palette.background,
        color: palette.color,
        padding: '14px 18px',
        fontFamily: COMMUNITY_FONT_FAMILY,
        fontSize: '0.95rem',
        lineHeight: 1.4,
      }}
    >
      {message}
    </div>
  );
}

void preloadSignatures();

export const SignPage = ({ isMobile, uiLanguage = 'en' }) => {
  const copy = getCopy(uiLanguage);
  const [entries, setEntries] = useState(() => getCachedSignatures() || []);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(() => getCachedSignatures() == null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const notesBoardRef = useRef(null);
  const [activeDraggedId, setActiveDraggedId] = useState(null);
    const noteGestureStartRef = useRef(new Map());
    const [noteGestures, setNoteGestures] = useState({});
    const [canvasResetVersion, setCanvasResetVersion] = useState(0);
    const [isResettingCanvas, setIsResettingCanvas] = useState(false);
    const noteDragConstraints = useMemo(() => {
      if (!isMobile) return notesBoardRef;
      return undefined;
    }, [isMobile]);
  const noteBoardMinHeight = useMemo(() => {
    if (!isMobile) return '78vh';
    const maxScale = Math.max(1, ...Object.values(noteGestures).map((gesture) => gesture?.scale ?? 1));
    const dragLift = activeDraggedId ? 12 : 0;
    return `${Math.round(Math.max(72, 72 + (maxScale - 1) * 28 + dragLift))}vh`;
  }, [activeDraggedId, isMobile, noteGestures]);

  const syncEntries = useCallback(async () => {
    const nextEntries = await refreshSignatures();
    setEntries(nextEntries);
    return nextEntries;
  }, []);

  const setNoteGesture = useCallback((entryId, nextGesture) => {
    setNoteGestures((current) => ({
      ...current,
      [entryId]: nextGesture,
    }));
  }, []);

  const clearNoteGesture = useCallback((entryId) => {
    noteGestureStartRef.current.delete(entryId);
    setNoteGestures((current) => {
      if (!current[entryId]) return current;
      const next = { ...current };
      delete next[entryId];
      return next;
    });
  }, []);

  const handleNoteTouchStart = useCallback((entryId, event) => {
    if (event.touches.length < 2) return;
    event.preventDefault();
    event.stopPropagation();
    const [touchA, touchB] = event.touches;
    noteGestureStartRef.current.set(entryId, {
      distance: getTouchDistance(touchA, touchB),
      angle: getTouchAngle(touchA, touchB),
      scale: noteGestures[entryId]?.scale ?? 1,
      rotate: noteGestures[entryId]?.rotate ?? 0,
    });
  }, [noteGestures]);

  const handleNoteTouchMove = useCallback((entryId, event) => {
    if (event.touches.length < 2) return;
    event.preventDefault();
    event.stopPropagation();

    const start = noteGestureStartRef.current.get(entryId);
    if (!start) return;

    const [touchA, touchB] = event.touches;
    const distance = getTouchDistance(touchA, touchB);
    const angle = getTouchAngle(touchA, touchB);

    setNoteGesture(entryId, {
      scale: clamp(start.scale * (distance / Math.max(start.distance, 1)), MIN_GESTURE_SCALE, MAX_GESTURE_SCALE),
      rotate: start.rotate + (angle - start.angle),
    });
  }, [setNoteGesture]);

  const handleNoteTouchEnd = useCallback((entryId, event) => {
    if (event.touches.length >= 2) return;
    noteGestureStartRef.current.delete(entryId);
    event.stopPropagation();
  }, []);

  const resetCanvas = useCallback(() => {
    setIsResettingCanvas(true);
    noteGestureStartRef.current.clear();
    setNoteGestures({});
    setActiveDraggedId(null);
    window.setTimeout(() => {
      setCanvasResetVersion((current) => current + 1);
      window.requestAnimationFrame(() => {
        setIsResettingCanvas(false);
      });
    }, 140);
  }, []);

  const handleNoteWheel = useCallback((entryId, event) => {
    if (!event.ctrlKey && !event.metaKey) return;
    event.preventDefault();
    event.stopPropagation();

    const current = noteGestures[entryId] || { scale: 1, rotate: 0 };
    const scaleDelta = Math.exp(-event.deltaY * 0.0012);
    const rotateDelta = getWheelGestureAngle(event.deltaY, event.deltaX);

    setNoteGesture(entryId, {
      scale: clamp(current.scale * scaleDelta, MIN_GESTURE_SCALE, MAX_GESTURE_SCALE),
      rotate: clamp(current.rotate + rotateDelta, -24, 24),
    });
  }, [noteGestures, setNoteGesture]);

  useEffect(() => {
    let active = true;

    syncEntries()
      .then((nextEntries) => {
        if (!active) return;
        setEntries(nextEntries);
      })
      .catch((error) => {
        if (!active) return;
        setErrorMessage(error.message || copy.loadError);
      })
      .finally(() => {
        if (!active) return;
        setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [copy.loadError, syncEntries]);

  useEffect(() => {
    const handleRefresh = () => {
      if (document.visibilityState !== 'visible') return;
      void syncEntries().catch(() => {});
    };

    const intervalId = window.setInterval(handleRefresh, 5000);
    window.addEventListener('focus', handleRefresh);
    document.addEventListener('visibilitychange', handleRefresh);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', handleRefresh);
      document.removeEventListener('visibilitychange', handleRefresh);
    };
  }, [syncEntries]);

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!name.trim()) {
      setErrorMessage(copy.nameRequired);
      return;
    }

    if (!message.trim()) {
      setErrorMessage(copy.messageRequired);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await createSignature({
        name,
        message,
      });

      setEntries(response.signatures);
      void syncEntries().catch(() => {});
      setMessage('');
      setSuccessMessage(copy.success);
      setIsComposerOpen(false);
    } catch (error) {
      setErrorMessage(error.message || copy.submitError);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="hide-scrollbar"
      style={{
        ...COMMUNITY_PAGE_STYLE,
        padding: isMobile ? '24px 8px 10px 8px' : '28px 40px',
        overflowX: isMobile ? 'visible' : 'hidden',
        overflowY: 'hidden',
      }}
    >
      <div style={{ display: 'grid', gap: isMobile ? '16px' : '18px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: isMobile ? '4px' : '8px',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? '14px' : '0',
            position: 'relative',
            width: '100%',
            padding: isMobile ? '0 10px' : '0',
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 24px',
              borderRadius: '24px',
              background: '#ffffff',
              border: '3.5px solid #f97316',
              borderBottom: '9.5px solid #ea580c',
              boxShadow: '0 8px 18px rgba(249, 115, 22, 0.12)',
              zIndex: 1,
            }}
          >
            <PenLine size={isMobile ? 28 : 24} strokeWidth={2.5} style={{ color: '#f97316' }} />
            <span
              style={{
                fontFamily: '"Sniglet", "Coming Soon", cursive',
                color: '#ea580c',
                fontSize: isMobile ? '1.45rem' : '1.35rem',
                fontWeight: '400',
                letterSpacing: '0.2px',
                lineHeight: 1,
              }}
            >
              {copy.title}
            </span>
          </motion.div>

          {!isMobile && (
            <button
              type="button"
              onClick={resetCanvas}
              aria-label={copy.resetCanvas}
              style={{
                ...createCommunityButtonStyle({
                  borderColor: '#cbd5e1',
                  bottomColor: '#94a3b8',
                  background: '#ffffff',
                  color: '#475569',
                }),
                position: 'absolute',
                top: '50%',
                left: '0',
                transform: 'translateY(-50%)',
                zIndex: 0,
                opacity: 0.96,
              }}
            >
              <RotateCcw size={18} strokeWidth={2.4} />
              {copy.resetCanvas}
            </button>
          )}

          <div
            style={{
              position: isMobile ? 'static' : 'absolute',
              right: isMobile ? 'auto' : '0',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              flexWrap: 'wrap',
              justifyContent: isMobile ? 'center' : 'flex-end',
              zIndex: 1,
            }}
          >
            <div
              style={{
                ...createCommunityCounterStyle({
                  borderColor: '#fdba74',
                  bottomColor: '#f97316',
                  background: '#ffffff',
                  color: '#c2410c',
                }),
                minWidth: '126px',
              }}
            >
              {entries.length} {copy.notesCountLabel}
            </div>
            <button
              type="button"
              onClick={() => setIsComposerOpen(true)}
              style={createCommunityButtonStyle({
                borderColor: '#fdba74',
                bottomColor: '#f97316',
                background: '#ffffff',
                color: '#c2410c',
              })}
            >
              <PenLine size={18} strokeWidth={2.5} />
              {copy.button}
            </button>
          </div>

          {isMobile && (
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: '-2px' }}>
              <button
                type="button"
                onClick={resetCanvas}
                aria-label={copy.resetCanvas}
                style={{
                  ...createCommunityButtonStyle({
                    borderColor: '#cbd5e1',
                    bottomColor: '#94a3b8',
                    background: '#ffffff',
                    color: '#475569',
                  }),
                  position: 'static',
                  zIndex: 1,
                  opacity: 0.96,
                }}
              >
                <RotateCcw size={18} strokeWidth={2.4} />
                {copy.resetCanvas}
              </button>
            </div>
          )}
        </div>

        <StatusBanner tone="error" message={errorMessage} />
        <StatusBanner tone="success" message={successMessage} />

          <div
            style={{
              columns: isMobile ? 2 : 3,
              columnGap: isMobile ? '10px' : '14px',
              marginTop: isMobile ? '14px' : '20px',
              minHeight: noteBoardMinHeight,
              paddingBottom: '8px',
              position: 'relative',
              overflow: 'visible',
              opacity: isResettingCanvas ? 0.26 : 1,
              transform: isResettingCanvas ? 'translateY(8px) scale(0.992)' : 'translateY(0) scale(1)',
              transition: 'opacity 180ms ease, transform 180ms ease',
              pointerEvents: isResettingCanvas ? 'none' : 'auto',
            }}
          ref={notesBoardRef}
        >
          {!isLoading && entries.length === 0 && (
            <div
              style={{
                ...COMMUNITY_PANEL_STYLE,
                breakInside: 'avoid',
                padding: '22px 20px',
                color: '#64748b',
                lineHeight: 1.6,
                textAlign: 'center',
                background: '#ffffff',
              }}
            >
              {copy.empty}
            </div>
          )}

          <AnimatePresence initial={false}>
            {entries.map((entry, index) => {
              const palette = NOTE_PALETTES[index % NOTE_PALETTES.length];
              const stackLayout = getEntryStackLayout(entry, index);
              const gesture = noteGestures[entry.id] || { scale: 1, rotate: 0 };
              const cardDragConstraints = isMobile ? undefined : noteDragConstraints;

              return (
                <motion.article
                  key={`${entry.id}-${canvasResetVersion}`}
                  className="sketchbook-border"
                  data-no-tab-swipe="1"
                  layout
                  drag
                    dragConstraints={cardDragConstraints}
                    dragElastic={isMobile ? 0.82 : 0.16}
                    dragMomentum={false}
                  onDragStart={() => setActiveDraggedId(entry.id)}
                  onDragEnd={() => setActiveDraggedId((current) => (current === entry.id ? null : current))}
                  whileDrag={{ scale: 1.03, rotate: 0 }}
                  initial={{ opacity: 0, y: 18, x: stackLayout.offsetX * 0.25, rotate: stackLayout.rotate - 0.45, scale: 0.985 }}
                  animate={{
                    opacity: 1,
                    y: stackLayout.offsetY,
                    x: isMobile ? stackLayout.offsetX * 0.18 : stackLayout.offsetX * 0.45,
                    rotate: isMobile ? stackLayout.rotate * 0.15 : stackLayout.rotate * 0.45,
                    scale: 1,
                  }}
                  exit={{ opacity: 0, y: 10, scale: 0.98 }}
                  transition={{
                    layout: { duration: 0.26, ease: 'easeOut' },
                    opacity: { duration: 0.22, ease: 'easeOut' },
                    y: { duration: 0.22, ease: 'easeOut' },
                    scale: { duration: 0.22, ease: 'easeOut' },
                    delay: Math.min(index * 0.03, 0.18),
                  }}
                  style={{
                    breakInside: 'avoid',
                    maxWidth: '100%',
                    marginBottom: isMobile ? '12px' : '18px',
                    position: 'relative',
                    zIndex: activeDraggedId === entry.id ? 50 : entries.length - index,
                    cursor: 'grab',
                    touchAction: 'none',
                    background: 'transparent',
                    border: 'none',
                    padding: 0,
                    boxShadow: 'none',
                  }}
                >
                  <div
                    style={{
                      ...COMMUNITY_PANEL_STYLE,
                      padding: isMobile ? '14px 14px 12px' : '18px 20px 16px',
                      background: '#fffdf7',
                      borderColor: palette.border,
                      borderBottomColor: palette.bottom,
                      borderRadius: '26px',
                      display: 'grid',
                      gap: isMobile ? '8px' : '10px',
                      boxShadow: `0 14px 26px ${palette.shadow || 'rgba(15, 23, 42, 0.1)'}`,
                      transform: `translateZ(0) scale(${gesture.scale}) rotate(${gesture.rotate}deg)`,
                      transformOrigin: 'center center',
                      willChange: 'transform',
                      transition: 'transform 120ms ease-out',
                    }}
                    onTouchStart={(event) => handleNoteTouchStart(entry.id, event)}
                    onTouchMove={(event) => handleNoteTouchMove(entry.id, event)}
                    onTouchEnd={(event) => handleNoteTouchEnd(entry.id, event)}
                    onTouchCancel={(event) => handleNoteTouchEnd(entry.id, event)}
                    onWheel={(event) => handleNoteWheel(entry.id, event)}
                  >
                    <div style={{ display: 'grid', gap: '8px' }}>
                      <span style={{ fontFamily: COMMUNITY_FONT_FAMILY, fontSize: isMobile ? '0.95rem' : '1rem', color: palette.accent, lineHeight: 1, fontWeight: '400' }}>
                        {entry.name}
                      </span>
                      <p style={{ margin: 0, color: '#334155', lineHeight: 1.7, whiteSpace: 'pre-wrap', fontSize: isMobile ? '0.95rem' : '1rem' }}>
                        {entry.message}
                      </p>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                      <span
                        className="sketchbook-border"
                        style={createCommunityTimestampStyle({
                          borderColor: palette.border,
                          bottomColor: palette.bottom,
                          background: '#ffffff',
                          color: palette.accent,
                        })}
                      >
              {formatCommunityTimestamp(entry.createdAt, uiLanguage)}
                      </span>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </div>

      </div>

      <CommunityModal
        open={isComposerOpen}
        onClose={() => setIsComposerOpen(false)}
        icon={PenLine}
        title={copy.modalTitle}
        accentColor="#f97316"
        accentBottom="#ea580c"
        maxWidth="580px"
      >
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '12px' }}>
          <p style={{ margin: 0, color: '#7c2d12', lineHeight: 1.6 }}>
            {copy.subtitle}
          </p>

          <label style={{ display: 'grid', gap: '8px' }}>
            <span style={{ fontFamily: COMMUNITY_FONT_FAMILY, color: '#9a3412', fontSize: '0.95rem' }}>
              {copy.nameLabel}
            </span>
            <div style={{ position: 'relative' }}>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={copy.namePlaceholder}
                maxLength={48}
                style={{ ...COMMUNITY_INPUT_STYLE, paddingLeft: '44px' }}
              />
              <UserRound
                size={18}
                strokeWidth={2.3}
                style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#f97316' }}
              />
            </div>
          </label>

          <label style={{ display: 'grid', gap: '8px' }}>
            <span style={{ fontFamily: COMMUNITY_FONT_FAMILY, color: '#9a3412', fontSize: '0.95rem' }}>
              {copy.messageLabel}
            </span>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder={copy.messagePlaceholder}
              maxLength={280}
              style={COMMUNITY_TEXTAREA_STYLE}
            />
          </label>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setIsComposerOpen(false)}
              style={createCommunityButtonStyle({
                borderColor: '#cbd5e1',
                bottomColor: '#94a3b8',
                background: '#ffffff',
                color: '#475569',
              })}
            >
              {copy.close}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                ...createCommunityButtonStyle({
                  borderColor: '#fdba74',
                  bottomColor: '#f97316',
                  background: '#f97316',
                }),
                opacity: isSubmitting ? 0.72 : 1,
              }}
            >
              {isSubmitting ? <LoaderCircle size={18} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Send size={18} strokeWidth={2.5} />}
              {isSubmitting ? copy.posting : copy.submit}
            </button>
          </div>
        </form>
      </CommunityModal>
    </div>
  );
};

export default SignPage;
