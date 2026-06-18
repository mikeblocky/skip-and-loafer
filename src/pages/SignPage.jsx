import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PenLine } from 'lucide-react';
import usePageTitle from '../hooks/shared/usePageTitle';
import { getUI } from '../i18n/ui';
import {
  createSignature,
  fetchSignatures,
  getCachedSignatures,
} from '../features/community/signaturesApi';
import CommunityPageHero from '../features/community/CommunityPageHero';
import CommunityModal from '../features/community/CommunityModal';
import CommunityStatusBanner from '../features/community/CommunityStatusBanner';
import {
  MAX_GESTURE_SCALE,
  MIN_GESTURE_SCALE,
  clamp,
  getTouchAngle,
  getTouchDistance,
  getWheelGestureAngle,
} from '../features/community/communityGestures';
import { useCommunityEntries } from '../features/community/hooks/useCommunityEntries';
import SignComposerForm from '../features/community/sign/SignComposerForm';
import SignNotesBoard from '../features/community/sign/SignNotesBoard';
import {
  COMMUNITY_PAGE_STYLE,
} from '../features/community/communityTheme';

const PAGE_COPY = {
  en: {
    title: 'Fan messages',
    badge: 'Guestbook messages',
    subtitle: 'Short messages from visitors, readers, and anyone passing through this place.',
    button: 'Write',
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
  ja: {
    title: 'ファンメッセージ',
    badge: 'メッセージ帳',
    subtitle: '訪れた人、読者、ここを通る誰でも残せる短いメッセージです。',
    button: 'メッセージを書く',
    modalTitle: 'メッセージを書く',
    nameLabel: '名前',
    namePlaceholder: 'どう呼ばれたいですか？',
    messageLabel: 'メッセージ',
    messagePlaceholder: 'やさしいひと言や短いあいさつを残してください...',
    submit: '投稿する',
    close: '閉じる',
    resetCanvas: 'キャンバスをリセット',
    notesCountLabel: '件',
    posting: '投稿中...',
    empty: 'まだメッセージはありません。最初の一件をどうぞ。',
    success: 'メッセージをページに追加しました。',
    helper: 'ボタンを押してメッセージを追加してください。',
    loadError: '今はメッセージページを読み込めませんでした。',
    nameRequired: '投稿する前に名前を入力してください。',
    messageRequired: '投稿する前に短いメッセージを入力してください。',
    submitError: 'メッセージを投稿できませんでした。',
  },
};

function getCopy(uiLanguage) {
  return PAGE_COPY[uiLanguage] || PAGE_COPY.en;
}

export const SignPage = ({ isMobile, uiLanguage = 'en', outerSwitcher }) => {
  const copy = getCopy(uiLanguage);
  const tGlobal = getUI(uiLanguage);

  usePageTitle(tGlobal.tabs?.sign?.label || 'Sign');
  const {
    entries,
    setEntries,
    isLoading,
    errorMessage,
    setErrorMessage,
  } = useCommunityEntries({
    getCachedEntries: getCachedSignatures,
    fetchEntries: fetchSignatures,
    loadErrorMessage: copy.loadError,
  });
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const notesBoardRef = useRef(null);
  const [activeDraggedId, setActiveDraggedId] = useState(null);
  const [stackOrder, setStackOrder] = useState([]);
  const noteGestureStartRef = useRef(new Map());
  const [noteGestures, setNoteGestures] = useState({});
  const [canvasResetVersion, setCanvasResetVersion] = useState(0);
  const [isResettingCanvas, setIsResettingCanvas] = useState(false);
  const activeTab = 'sign';

  const filteredEntries = useMemo(() => {
    if (activeTab === 'pride') return entries.filter(e => e.type === 'pride');
    return entries.filter(e => e.type !== 'pride');
  }, [entries, activeTab]);

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

  useEffect(() => {
    setStackOrder((current) => {
      const entryIds = filteredEntries.map((entry) => entry.id);
      const preserved = current.filter((id) => entryIds.includes(id));
      const appended = entryIds.filter((id) => !preserved.includes(id));
      return [...preserved, ...appended];
    });
  }, [filteredEntries]);

  const stackOrderIndex = useMemo(
    () => Object.fromEntries(stackOrder.map((id, index) => [id, index + 1])),
    [stackOrder],
  );

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
    setStackOrder(filteredEntries.map((entry) => entry.id));
    window.setTimeout(() => {
      setCanvasResetVersion((current) => current + 1);
      window.requestAnimationFrame(() => {
        setIsResettingCanvas(false);
      });
    }, 140);
  }, [filteredEntries]);

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
        type: activeTab === 'pride' ? 'pride' : 'sign',
      });

      setEntries(response.signatures);
      setMessage('');
      setSuccessMessage(activeTab === 'pride' ? 'Your Pride note is on the wall! ❤️‍🔥' : copy.success);
      setIsComposerOpen(false);
    } catch (error) {
      setErrorMessage(error.message || copy.submitError);
    } finally {
      setIsSubmitting(false);
    }
  }

  const isPride = false;

  const heroConfig = {
    title: copy.title,
    icon: PenLine,
    titleColors: {
      borderColor: '#f97316',
      bottomColor: '#ea580c',
      shadow: '0 8px 18px rgba(249, 115, 22, 0.12)',
    },
    counterColors: {
      borderColor: '#fdba74',
      bottomColor: '#f97316',
      color: '#c2410c',
    },
    actionLabel: copy.button,
    actionIcon: PenLine,
    actionColors: {
      borderColor: '#fdba74',
      bottomColor: '#f97316',
      color: '#c2410c',
    },
    modalTitle: copy.modalTitle,
    modalAccent: '#f97316',
    modalAccentBottom: '#ea580c',
  };

  return (
    <div
      className="hide-scrollbar"
      style={{
        ...COMMUNITY_PAGE_STYLE,
        padding: isMobile ? '20px 14px 72px' : '28px 40px',
        overflowX: 'hidden',
        overflowY: 'auto',
      }}
    >
      <div style={{ display: 'grid', gap: isMobile ? '16px' : '18px' }}>
        <CommunityPageHero
          isMobile={isMobile}
          title={heroConfig.title}
          icon={heroConfig.icon}
          titleColors={heroConfig.titleColors}
          countValue={filteredEntries.length}
          countLabel={isPride ? 'notes' : copy.notesCountLabel}
          counterColors={heroConfig.counterColors}
          actionLabel={heroConfig.actionLabel}
          actionIcon={heroConfig.actionIcon}
          actionColors={heroConfig.actionColors}
          onAction={() => setIsComposerOpen(true)}
          resetLabel={copy.resetCanvas}
          onReset={resetCanvas}
          outerSwitcher={outerSwitcher}
        />

        <CommunityStatusBanner tone="error" message={errorMessage} />
        <CommunityStatusBanner tone="success" message={successMessage} />

        <SignNotesBoard
          isMobile={isMobile}
          entries={filteredEntries}
          isLoading={isLoading}
          emptyMessage={isPride ? 'No Pride notes yet — be the first to send one! ❤️‍🔥' : copy.empty}
          uiLanguage={uiLanguage}
          notesBoardRef={notesBoardRef}
          noteBoardMinHeight={noteBoardMinHeight}
          isResettingCanvas={isResettingCanvas}
          canvasResetVersion={canvasResetVersion}
          noteGestures={noteGestures}
          activeDraggedId={activeDraggedId}
          noteDragConstraints={noteDragConstraints}
          stackOrderIndex={stackOrderIndex}
          onDragStart={(entryId) => {
            setActiveDraggedId(entryId);
            setStackOrder((current) => {
              const nextOrder = current.filter((id) => id !== entryId);
              nextOrder.push(entryId);
              return nextOrder;
            });
          }}
          onDragEnd={(entryId) => setActiveDraggedId((current) => (current === entryId ? null : current))}
          onTouchStart={handleNoteTouchStart}
          onTouchMove={handleNoteTouchMove}
          onTouchEnd={handleNoteTouchEnd}
          onWheel={handleNoteWheel}
        />

      </div>

      <CommunityModal
        open={isComposerOpen}
        onClose={() => setIsComposerOpen(false)}
        icon={heroConfig.icon}
        title={heroConfig.modalTitle}
        accentColor={heroConfig.modalAccent}
        accentBottom={heroConfig.modalAccentBottom}
        maxWidth="580px"
      >
        <SignComposerForm
          copy={{
            ...copy,
            subtitle: isPride
              ? 'Send a warm Pride Month note for readers, fans, and the community!'
              : copy.subtitle,
            messagePlaceholder: isPride
              ? 'Send a supportive message, share your pride, or just say hello...'
              : copy.messagePlaceholder,
          }}
          name={name}
          message={message}
          isSubmitting={isSubmitting}
          onNameChange={setName}
          onMessageChange={setMessage}
          onClose={() => setIsComposerOpen(false)}
          onSubmit={handleSubmit}
        />
      </CommunityModal>
    </div>
  );
};

export default SignPage;
