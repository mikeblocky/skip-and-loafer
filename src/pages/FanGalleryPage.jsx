import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ImagePlus, LoaderCircle, RotateCcw, Shield, Upload, UserRound } from 'lucide-react';
import ImageLightbox from '../components/shared/ImageLightbox';
import {
  createFanGalleryEntry,
  getCachedFanGalleryEntries,
  preloadFanGalleryEntries,
  refreshFanGalleryEntries,
} from '../features/community/communityApi';
import CommunityModal from '../features/community/CommunityModal';
import { prepareImageForUpload } from '../features/community/imageUpload';
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
    title: 'Fan gallery',
    badge: 'Series gallery',
    subtitle: 'A gallery wall for anything around the series: artwork, cosplay, merch finds, event photos, shelf shots, or favorite little moments.',
    artistLabel: 'Name / source',
    artistPlaceholder: 'Optional credit or source',
    descriptionLabel: 'Description',
    descriptionPlaceholder: 'Optional note about what this is or why it matters...',
    uploadLabel: 'Choose image',
    preparing: 'Preparing image...',
    uploadHint: 'Accepted formats: PNG, JPG, WebP, and GIF. The image is redrawn in-browser before upload so embedded metadata is stripped for safety, and GIFs stay animated.',
    button: 'Add item',
    submit: 'Upload item',
    close: 'Close',
    resetCanvas: 'Reset canvas',
    itemsCountLabel: 'items',
    posting: 'Uploading...',
    empty: 'No gallery items yet. Add the first one.',
    previewAlt: 'Prepared image preview',
    dimensionsLabel: 'Prepared size',
    previewPlaceholder: 'Prepared preview will appear here.',
    success: 'Your gallery item is live.',
    modalTitle: 'Add to gallery',
    helper: 'Choose an image. PNG, JPG, WebP, and GIF are accepted.',
    loadError: 'Could not load the fan gallery right now.',
    prepareError: 'Could not prepare that image.',
    imageRequired: 'Choose an image before uploading.',
    submitError: 'Could not upload that image.',
    archiveItemAlt: 'Fan gallery item',
  },
  es: {
    title: 'Galería de fans',
    badge: 'Galería de la serie',
    subtitle: 'Una galería para todo lo relacionado con la serie: arte, cosplay, hallazgos de merchandising, fotos de eventos, estanterías o momentos pequeños favoritos.',
    artistLabel: 'Nombre / fuente',
    artistPlaceholder: 'Crédito o fuente opcional',
    descriptionLabel: 'Descripción',
    descriptionPlaceholder: 'Nota opcional sobre qué es o por qué importa...',
    uploadLabel: 'Elegir imagen',
    preparing: 'Preparando imagen...',
    uploadHint: 'Formatos aceptados: PNG, JPG, WebP y GIF. La imagen se vuelve a dibujar en el navegador antes de subirla para eliminar los metadatos incrustados por seguridad, y los GIF siguen animados.',
    button: 'Añadir elemento',
    submit: 'Subir elemento',
    close: 'Cerrar',
    resetCanvas: 'Restablecer lienzo',
    itemsCountLabel: 'elementos',
    posting: 'Subiendo...',
    empty: 'Aún no hay elementos en la galería. Añade el primero.',
    previewAlt: 'Vista previa de la imagen preparada',
    dimensionsLabel: 'Tamaño preparado',
    previewPlaceholder: 'La vista previa preparada aparecerá aquí.',
    success: 'Tu elemento ya está en vivo.',
    modalTitle: 'Añadir a la galería',
    helper: 'Elige una imagen. Se aceptan PNG, JPG, WebP y GIF.',
    loadError: 'No se pudo cargar la galería de fans ahora mismo.',
    prepareError: 'No se pudo preparar esa imagen.',
    imageRequired: 'Elige una imagen antes de subirla.',
    submitError: 'No se pudo subir esa imagen.',
    archiveItemAlt: 'Elemento de la galería de fans',
  },
  pt: {
    title: 'Galeria dos fãs',
    badge: 'Galeria da série',
    subtitle: 'Uma galeria para tudo da série: arte, cosplay, achados de merchandising, fotos de eventos, fotos de prateleira ou pequenos momentos favoritos.',
    artistLabel: 'Nome / fonte',
    artistPlaceholder: 'Crédito ou fonte opcional',
    descriptionLabel: 'Descrição',
    descriptionPlaceholder: 'Observação opcional sobre o que é ou por que importa...',
    uploadLabel: 'Escolher imagem',
    preparing: 'Preparando imagem...',
    uploadHint: 'Formatos aceitos: PNG, JPG, WebP e GIF. A imagem é redesenhada no navegador antes do envio para remover metadados incorporados por segurança, e GIFs continuam animados.',
    button: 'Adicionar item',
    submit: 'Enviar item',
    close: 'Fechar',
    resetCanvas: 'Redefinir tela',
    itemsCountLabel: 'itens',
    posting: 'Enviando...',
    empty: 'Ainda não há itens na galeria. Adicione o primeiro.',
    previewAlt: 'Prévia da imagem preparada',
    dimensionsLabel: 'Tamanho preparado',
    previewPlaceholder: 'A prévia preparada aparecerá aqui.',
    success: 'Seu item já está no ar.',
    modalTitle: 'Adicionar à galeria',
    helper: 'Escolha uma imagem. PNG, JPG, WebP e GIF são aceitos.',
    loadError: 'Não foi possível carregar a galeria dos fãs agora.',
    prepareError: 'Não foi possível preparar essa imagem.',
    imageRequired: 'Escolha uma imagem antes de enviar.',
    submitError: 'Não foi possível enviar essa imagem.',
    archiveItemAlt: 'Item da galeria dos fãs',
  },
  fr: {
    title: 'Galerie fan',
    badge: 'Galerie de la série',
    subtitle: 'Une galerie pour tout ce qui touche à la série : fan art, cosplay, trouvailles, photos d’événements, étagères ou petits moments favoris.',
    artistLabel: 'Nom / source',
    artistPlaceholder: 'Crédit, source ou nom de l’auteur en option',
    descriptionLabel: 'Description',
    descriptionPlaceholder: 'Note facultative sur ce que c’est ou pourquoi c’est important...',
    uploadLabel: 'Choisir une image',
    preparing: 'Préparation de l’image...',
    uploadHint: 'Formats acceptés : PNG, JPG, WebP et GIF. L’image est redessinée dans le navigateur avant l’envoi afin de retirer les métadonnées intégrées pour plus de sécurité, et les GIF restent animés.',
    button: 'Ajouter un élément',
    submit: 'Téléverser l’élément',
    close: 'Fermer',
    resetCanvas: 'Réinitialiser le canevas',
    itemsCountLabel: 'éléments',
    posting: 'Téléversement...',
    empty: 'Aucun élément pour le moment. Ajoute le premier.',
    previewAlt: 'Aperçu de l’image préparée',
    dimensionsLabel: 'Taille préparée',
    previewPlaceholder: 'L’aperçu préparé apparaîtra ici.',
    success: 'Ton élément est en ligne.',
    modalTitle: 'Ajouter à la galerie',
    helper: 'Choisis une image. PNG, JPG, WebP et GIF sont acceptés.',
    loadError: 'Impossible de charger la galerie fan pour le moment.',
    prepareError: 'Impossible de préparer cette image.',
    imageRequired: 'Choisis une image avant de téléverser.',
    submitError: 'Impossible de téléverser cette image.',
    archiveItemAlt: 'Élément de la galerie fan',
  },
  de: {
    title: 'Fan-Galerie',
    badge: 'Seriengalerie',
    subtitle: 'Eine Galerie für alles rund um die Serie: Kunst, Cosplay, Merch-Funde, Eventfotos, Regalshots oder Lieblingsmomente.',
    artistLabel: 'Name / Quelle',
    artistPlaceholder: 'Optionaler Credit, Quelle oder Uploader-Name',
    descriptionLabel: 'Beschreibung',
    descriptionPlaceholder: 'Optionale Notiz dazu, was es ist oder warum es wichtig ist...',
    uploadLabel: 'Bild auswählen',
    preparing: 'Bild wird vorbereitet...',
    uploadHint: 'Akzeptierte Formate: PNG, JPG, WebP und GIF. Das Bild wird vor dem Hochladen im Browser neu gerendert, damit eingebettete Metadaten aus Sicherheitsgründen entfernt werden, und GIFs bleiben animiert.',
    button: 'Element hinzufügen',
    submit: 'Element hochladen',
    close: 'Schließen',
    resetCanvas: 'Leinwand zurücksetzen',
    itemsCountLabel: 'Elemente',
    posting: 'Wird hochgeladen...',
    empty: 'Noch keine Galerystücke. Füge das erste hinzu.',
    previewAlt: 'Vorschau des vorbereiteten Bildes',
    dimensionsLabel: 'Vorbereitete Größe',
    previewPlaceholder: 'Die vorbereitete Vorschau wird hier angezeigt.',
    success: 'Dein Galerystück ist live.',
    modalTitle: 'Zur Galerie hinzufügen',
    helper: 'Wähle ein Bild aus. PNG, JPG, WebP und GIF werden akzeptiert.',
    loadError: 'Die Fan-Galerie konnte gerade nicht geladen werden.',
    prepareError: 'Dieses Bild konnte nicht vorbereitet werden.',
    imageRequired: 'Wähle vor dem Hochladen ein Bild aus.',
    submitError: 'Dieses Bild konnte nicht hochgeladen werden.',
    archiveItemAlt: 'Galeriestück der Fan-Galerie',
  },
  it: {
    title: 'Galleria fan',
    badge: 'Galleria della serie',
    subtitle: 'Una galleria per tutto ciò che riguarda la serie: fan art, cosplay, acquisti, foto di eventi, scaffali o piccoli momenti preferiti.',
    artistLabel: 'Nome / fonte',
    artistPlaceholder: 'Credito, fonte o nome dell’upload facoltativi',
    descriptionLabel: 'Descrizione',
    descriptionPlaceholder: 'Nota facoltativa su cosa sia o perché conti...',
    uploadLabel: 'Scegli immagine',
    preparing: 'Preparazione immagine...',
    uploadHint: 'Formati supportati: PNG, JPG, WebP e GIF. L’immagine viene ridisegnata nel browser prima del caricamento per rimuovere i metadati incorporati per sicurezza, e i GIF restano animati.',
    button: 'Aggiungi elemento',
    submit: 'Carica elemento',
    close: 'Chiudi',
    resetCanvas: 'Reimposta tela',
    itemsCountLabel: 'elementi',
    posting: 'Caricamento...',
    empty: 'Nessun elemento ancora. Aggiungi il primo.',
    previewAlt: 'Anteprima dell’immagine preparata',
    dimensionsLabel: 'Dimensione preparata',
    previewPlaceholder: 'L’anteprima preparata apparirà qui.',
    success: 'Il tuo elemento è online.',
    modalTitle: 'Aggiungi alla galleria',
    helper: 'Scegli un’immagine. PNG, JPG, WebP e GIF sono supportati.',
    loadError: 'Impossibile caricare la galleria fan in questo momento.',
    prepareError: 'Impossibile preparare questa immagine.',
    imageRequired: 'Scegli un’immagine prima di caricare.',
    submitError: 'Impossibile caricare questa immagine.',
    archiveItemAlt: 'Elemento della galleria fan',
  },
};

const CARD_PALETTES = [
  { frame: '#fff8ef', border: '#f7b267', bottom: '#ea7c31', label: '#9a3412', shadow: 'rgba(234, 124, 49, 0.16)' },
  { frame: '#f6fbff', border: '#8dc8ff', bottom: '#4d9de0', label: '#1d4ed8', shadow: 'rgba(77, 157, 224, 0.16)' },
  { frame: '#fff5fb', border: '#f39acb', bottom: '#e0569f', label: '#9d174d', shadow: 'rgba(224, 86, 159, 0.16)' },
  { frame: '#f5fff8', border: '#77d59a', bottom: '#22a86f', label: '#166534', shadow: 'rgba(34, 168, 111, 0.16)' },
  { frame: '#f7f0ff', border: '#b98cff', bottom: '#8b5cf6', label: '#6d28d9', shadow: 'rgba(139, 92, 246, 0.16)' },
  { frame: '#fff1e6', border: '#ffb36b', bottom: '#f97316', label: '#9a3412', shadow: 'rgba(249, 115, 22, 0.16)' },
  { frame: '#eff6ff', border: '#93c5fd', bottom: '#2563eb', label: '#1e3a8a', shadow: 'rgba(37, 99, 235, 0.16)' },
  { frame: '#f0fdf4', border: '#86efac', bottom: '#16a34a', label: '#166534', shadow: 'rgba(22, 163, 74, 0.16)' },
];

const STACK_OFFSETS = [
  { x: -10, y: 0, rotate: -2.2 },
  { x: 7, y: 3, rotate: 1.8 },
  { x: -5, y: 2, rotate: -1.5 },
  { x: 8, y: 4, rotate: 2.4 },
  { x: -7, y: 1, rotate: -1.8 },
  { x: 6, y: 5, rotate: 1.6 },
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
  const seedSource = `${entry?.id || ''}:${entry?.createdAt || ''}:${entry?.name || ''}:${entry?.description || ''}`;
  let seed = 0;
  for (let i = 0; i < seedSource.length; i += 1) {
    seed = (seed * 33 + seedSource.charCodeAt(i)) >>> 0;
  }

  const variant = (seed + index) % STACK_OFFSETS.length;
  const spread = (seed % 4) - 1;

  return {
    offsetX: STACK_OFFSETS[variant].x + spread * 1.5,
    offsetY: STACK_OFFSETS[variant].y,
    rotate: STACK_OFFSETS[variant].rotate + spread * 0.2,
    imageTilt: spread * 0.12,
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

void preloadFanGalleryEntries();

export const FanGalleryPage = ({ isMobile, uiLanguage = 'en' }) => {
  const copy = getCopy(uiLanguage);
  const [entries, setEntries] = useState(() => getCachedFanGalleryEntries() || []);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [preparedImage, setPreparedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(() => getCachedFanGalleryEntries() == null);
  const [isPreparing, setIsPreparing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const galleryBoardRef = useRef(null);
  const [activeDraggedId, setActiveDraggedId] = useState(null);
  const lastDragEndedAtRef = useRef(0);
  const [stackOrder, setStackOrder] = useState([]);
  const galleryGestureStartRef = useRef(new Map());
    const [galleryGestures, setGalleryGestures] = useState({});
    const [activeGalleryGestureId, setActiveGalleryGestureId] = useState(null);
    const [galleryDragOffsets, setGalleryDragOffsets] = useState({});
    const [canvasResetVersion, setCanvasResetVersion] = useState(0);
    const [isResettingCanvas, setIsResettingCanvas] = useState(false);
    const galleryDragConstraints = useMemo(() => {
      if (!isMobile) return galleryBoardRef;
      return undefined;
    }, [isMobile]);
  const galleryBoardMinHeight = useMemo(() => {
    if (!isMobile) return '78vh';
    const maxScale = Math.max(1, ...Object.values(galleryGestures).map((gesture) => gesture?.scale ?? 1));
    const maxDragOffset = Math.max(0, ...Object.values(galleryDragOffsets).map((offset) => Math.max(0, offset || 0)));
    const dragLift = activeDraggedId ? 12 : 0;
    const extraHeight = Math.round((maxScale - 1) * 28 + dragLift);
    return `calc(${Math.max(72, 72 + extraHeight)}vh + ${Math.round(maxDragOffset * 0.75)}px)`;
  }, [activeDraggedId, galleryDragOffsets, isMobile, galleryGestures]);

  useEffect(() => {
    setStackOrder((current) => {
      const entryIds = entries.map((entry) => entry.id);
      const preserved = current.filter((id) => entryIds.includes(id));
      const appended = entryIds.filter((id) => !preserved.includes(id));
      return [...preserved, ...appended];
    });
  }, [entries]);

  const setGalleryGesture = useCallback((entryId, nextGesture) => {
    setGalleryGestures((current) => ({
      ...current,
      [entryId]: nextGesture,
    }));
  }, []);

  const clearGalleryGesture = useCallback((entryId) => {
    galleryGestureStartRef.current.delete(entryId);
    setGalleryGestures((current) => {
      if (!current[entryId]) return current;
      const next = { ...current };
      delete next[entryId];
      return next;
    });
    setActiveGalleryGestureId((current) => (current === entryId ? null : current));
  }, []);

  const handleGalleryTouchStart = useCallback((entryId, event) => {
    if (event.touches.length < 2) return;
    event.preventDefault();
    event.stopPropagation();
    const [touchA, touchB] = event.touches;
    galleryGestureStartRef.current.set(entryId, {
      distance: getTouchDistance(touchA, touchB),
      angle: getTouchAngle(touchA, touchB),
      scale: galleryGestures[entryId]?.scale ?? 1,
      rotate: galleryGestures[entryId]?.rotate ?? 0,
    });
    setActiveGalleryGestureId(entryId);
  }, [galleryGestures]);

  const handleGalleryTouchMove = useCallback((entryId, event) => {
    if (event.touches.length < 2) return;
    event.preventDefault();
    event.stopPropagation();

    const start = galleryGestureStartRef.current.get(entryId);
    if (!start) return;

    const [touchA, touchB] = event.touches;
    const distance = getTouchDistance(touchA, touchB);
    const angle = getTouchAngle(touchA, touchB);

    setGalleryGesture(entryId, {
      scale: clamp(start.scale * (distance / Math.max(start.distance, 1)), MIN_GESTURE_SCALE, MAX_GESTURE_SCALE),
      rotate: start.rotate + (angle - start.angle),
    });
  }, [setGalleryGesture]);

  const handleGalleryTouchEnd = useCallback((entryId, event) => {
    if (event.touches.length >= 2) return;
    galleryGestureStartRef.current.delete(entryId);
    setActiveGalleryGestureId((current) => (current === entryId ? null : current));
    event.stopPropagation();
  }, []);

  const handleGalleryWheel = useCallback((entryId, event) => {
    if (!event.ctrlKey && !event.metaKey) return;
    event.preventDefault();
    event.stopPropagation();

    const current = galleryGestures[entryId] || { scale: 1, rotate: 0 };
    const scaleDelta = Math.exp(-event.deltaY * 0.0012);
    const rotateDelta = getWheelGestureAngle(event.deltaY, event.deltaX);

    setGalleryGesture(entryId, {
      scale: clamp(current.scale * scaleDelta, MIN_GESTURE_SCALE, MAX_GESTURE_SCALE),
      rotate: clamp(current.rotate + rotateDelta, -24, 24),
    });
    setActiveGalleryGestureId(entryId);
  }, [galleryGestures, setGalleryGesture]);

  const resetCanvas = useCallback(() => {
    setIsResettingCanvas(true);
    galleryGestureStartRef.current.clear();
    setGalleryGestures({});
    setGalleryDragOffsets({});
    setActiveGalleryGestureId(null);
    setActiveDraggedId(null);
    lastDragEndedAtRef.current = 0;
    setSelectedImage(null);
    setStackOrder(entries.map((entry) => entry.id));
    window.setTimeout(() => {
      setCanvasResetVersion((current) => current + 1);
      window.requestAnimationFrame(() => {
        setIsResettingCanvas(false);
      });
    }, 140);
  }, [entries]);

  const syncEntries = useCallback(async () => {
    const nextEntries = await refreshFanGalleryEntries();
    setEntries(nextEntries);
    return nextEntries;
  }, []);

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

  async function handleFileChange(event) {
    const file = event.target.files?.[0];
    setErrorMessage('');
    setSuccessMessage('');

    if (!file) {
      setPreparedImage(null);
      return;
    }

    setIsPreparing(true);

    try {
      const prepared = await prepareImageForUpload(file);
      setPreparedImage(prepared);
    } catch (error) {
      setPreparedImage(null);
      setErrorMessage(error.message || copy.prepareError);
    } finally {
      setIsPreparing(false);
      event.target.value = '';
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!preparedImage?.dataUrl) {
      setErrorMessage(copy.imageRequired);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await createFanGalleryEntry({
        name,
        description,
        imageDataUrl: preparedImage.dataUrl,
        mimeType: preparedImage.mimeType,
        width: preparedImage.width,
        height: preparedImage.height,
      });

      setEntries(response.entries);
      void syncEntries().catch(() => {});
      setDescription('');
      setPreparedImage(null);
      setSuccessMessage(copy.success);
      setIsComposerOpen(false);
    } catch (error) {
      setErrorMessage(error.message || copy.submitError);
    } finally {
      setIsSubmitting(false);
    }
  }

  const lightboxImages = entries.map((entry) => entry.imageDataUrl);

  return (
    <div
      className="hide-scrollbar"
      style={{ ...COMMUNITY_PAGE_STYLE, padding: isMobile ? '24px 8px 10px 8px' : '28px 40px', overflow: 'hidden' }}
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
              border: '3.5px solid #2563eb',
              borderBottom: '9.5px solid #1d4ed8',
              boxShadow: '0 8px 18px rgba(37, 99, 235, 0.12)',
              zIndex: 1,
            }}
          >
            <ImagePlus size={isMobile ? 28 : 24} strokeWidth={2.5} style={{ color: '#2563eb' }} />
            <span
              style={{
                fontFamily: '"Sniglet", "Coming Soon", cursive',
                color: '#2563eb',
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
                  borderColor: '#93c5fd',
                  bottomColor: '#2563eb',
                  background: '#ffffff',
                  color: '#1d4ed8',
                }),
                minWidth: '126px',
              }}
            >
              {entries.length} {copy.itemsCountLabel}
            </div>
            <button
              type="button"
              onClick={() => setIsComposerOpen(true)}
              style={createCommunityButtonStyle({
                borderColor: '#93c5fd',
                bottomColor: '#2563eb',
                background: '#ffffff',
                color: '#1d4ed8',
              })}
              >
              <Upload size={18} strokeWidth={2.5} />
              {copy.button}
            </button>
          </div>

          {isMobile && (
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: '8px' }}>
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
            columnGap: isMobile ? '6px' : '20px',
            marginTop: isMobile ? '12px' : '16px',
            minHeight: galleryBoardMinHeight,
            paddingBottom: '8px',
            position: 'relative',
            opacity: isResettingCanvas ? 0.22 : 1,
            transform: isResettingCanvas ? 'translateY(8px) scale(0.992)' : 'translateY(0) scale(1)',
            transition: 'opacity 180ms ease, transform 180ms ease',
            pointerEvents: isResettingCanvas ? 'none' : 'auto',
          }}
          ref={galleryBoardRef}
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
              const palette = CARD_PALETTES[index % CARD_PALETTES.length];
              const stackLayout = getEntryStackLayout(entry, index);
              const origin = stackLayout.offsetX < 0 ? 'left top' : 'right top';
              const gesture = galleryGestures[entry.id] || { scale: 1, rotate: 0 };
              const cardDragConstraints = isMobile ? undefined : galleryDragConstraints;

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
                onDrag={(event, info) => {
                  if (!isMobile) return;
                  setGalleryDragOffsets((current) => ({
                    ...current,
                    [entry.id]: info.offset.y,
                  }));
                }}
                  onDragStart={() => {
                    setActiveDraggedId(entry.id);
                    setStackOrder((current) => {
                      const nextOrder = current.filter((id) => id !== entry.id);
                      nextOrder.push(entry.id);
                      return nextOrder;
                    });
                  }}
                  onDragEnd={() => {
                    lastDragEndedAtRef.current = Date.now();
                    setActiveDraggedId((current) => (current === entry.id ? null : current));
                    setGalleryDragOffsets((current) => ({
                      ...current,
                      [entry.id]: Math.max(0, current[entry.id] || 0),
                    }));
                  }}
                whileDrag={{ scale: 1.03, rotate: 0 }}
                initial={{ opacity: 0, y: 18, x: stackLayout.offsetX * 0.24, rotate: stackLayout.rotate - 0.4, scale: 0.985 }}
                animate={{ opacity: 1, y: stackLayout.offsetY, x: isMobile ? stackLayout.offsetX * 0.32 : stackLayout.offsetX * 0.42, rotate: isMobile ? stackLayout.rotate * 0.32 : stackLayout.rotate * 0.42, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.98 }}
                  transition={{
                    layout: { duration: 0.26, ease: 'easeOut' },
                    opacity: { duration: 0.22, ease: 'easeOut' },
                    y: { duration: 0.22, ease: 'easeOut' },
                    scale: { duration: 0.22, ease: 'easeOut' },
                    delay: Math.min(index * 0.025, 0.18),
                  }}
                  style={{
                    breakInside: 'avoid',
                    maxWidth: '100%',
                    marginBottom: isMobile ? '12px' : '18px',
                    position: 'relative',
                    zIndex: activeDraggedId === entry.id
                      ? 1000
                      : (stackOrder.indexOf(entry.id) >= 0 ? stackOrder.indexOf(entry.id) + 1 : entries.length - index),
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
                      background: palette.frame,
                      padding: isMobile ? '12px' : '16px',
                      boxShadow: `0 16px 28px ${palette.shadow}, 0 4px 10px rgba(15,23,42,0.09)`,
                      borderRadius: '26px',
                      border: `3px solid ${palette.border}`,
                      borderBottom: `9px solid ${palette.bottom}`,
                      display: 'grid',
                      gap: isMobile ? '10px' : '12px',
                      transformOrigin: 'center center',
                      transform: `translateZ(0) scale(${gesture.scale}) rotate(${gesture.rotate}deg)`,
                      willChange: 'transform',
                      transition: 'transform 120ms ease-out',
                    }}
                    onTouchStart={(event) => handleGalleryTouchStart(entry.id, event)}
                    onTouchMove={(event) => handleGalleryTouchMove(entry.id, event)}
                    onTouchEnd={(event) => handleGalleryTouchEnd(entry.id, event)}
                    onTouchCancel={(event) => handleGalleryTouchEnd(entry.id, event)}
                    onWheel={(event) => handleGalleryWheel(entry.id, event)}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        if (activeDraggedId === entry.id) return;
                        if (activeGalleryGestureId === entry.id) return;
                        if (Date.now() - lastDragEndedAtRef.current < 220) return;
                        setSelectedImage(entry.imageDataUrl);
                      }}
                    style={{
                      border: 'none',
                      background: '#ffffff',
                      padding: 0,
                      cursor: 'pointer',
                        borderRadius: '20px',
                        overflow: 'hidden',
                        width: '100%',
                        maxWidth: '100%',
                        boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.95)',
                        transform: `rotate(${stackLayout.imageTilt * 0.4}deg)`,
                        transformOrigin: origin,
                      }}
                    >
                      <img
                        src={entry.imageDataUrl}
                        alt={entry.description || entry.name || 'Gallery item'}
                        style={{
                          width: '100%',
                          display: 'block',
                          maxWidth: '100%',
                          borderRadius: '20px',
                          background: '#f8fafc',
                          objectFit: 'cover',
                          userSelect: 'none',
                        WebkitUserDrag: 'none',
                        pointerEvents: activeGalleryGestureId === entry.id ? 'none' : 'auto',
                        transform: `rotate(${(isMobile ? stackLayout.imageTilt * 0.35 : stackLayout.imageTilt * 0.4) * -0.35}deg)`,
                      }}
                      draggable={false}
                    />
                    </button>

                    <div style={{ display: 'grid', gap: '6px' }}>
                      {(entry.name || entry.description) && (
                        <div style={{ display: 'grid', gap: '4px' }}>
                          {entry.name && (
                            <strong style={{ fontFamily: COMMUNITY_FONT_FAMILY, color: palette.label, fontSize: isMobile ? '0.95rem' : '1.02rem' }}>
                              {entry.name}
                            </strong>
                          )}
                          {entry.description && (
                            <p style={{ margin: 0, color: '#475569', lineHeight: 1.5, whiteSpace: 'pre-wrap', fontSize: isMobile ? '0.9rem' : '0.98rem' }}>
                              {entry.description}
                            </p>
                          )}
                        </div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                      <span
                        className="sketchbook-border"
                        style={createCommunityTimestampStyle({
                          borderColor: palette.border,
                          bottomColor: palette.bottom,
                          background: '#ffffff',
                          color: palette.label,
                        })}
                        >
                          {formatCommunityTimestamp(entry.createdAt, uiLanguage)}
                        </span>
                      </div>
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
        icon={ImagePlus}
        title={copy.modalTitle}
        accentColor="#2563eb"
        accentBottom="#1d4ed8"
        maxWidth="640px"
      >
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '12px' }}>
          <p style={{ margin: 0, color: '#334155', lineHeight: 1.6 }}>
            {copy.subtitle}
          </p>

          <label style={{ display: 'grid', gap: '8px' }}>
            <span style={{ fontFamily: COMMUNITY_FONT_FAMILY, color: '#1d4ed8', fontSize: '0.95rem' }}>
              {copy.artistLabel}
            </span>
            <div style={{ position: 'relative' }}>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={copy.artistPlaceholder}
                maxLength={60}
                style={{ ...COMMUNITY_INPUT_STYLE, paddingLeft: '44px' }}
              />
              <UserRound
                size={18}
                strokeWidth={2.3}
                style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#2563eb' }}
              />
            </div>
          </label>

          <label style={{ display: 'grid', gap: '8px' }}>
            <span style={{ fontFamily: COMMUNITY_FONT_FAMILY, color: '#1d4ed8', fontSize: '0.95rem' }}>
              {copy.descriptionLabel}
            </span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder={copy.descriptionPlaceholder}
              maxLength={240}
              style={{ ...COMMUNITY_TEXTAREA_STYLE, minHeight: '112px' }}
            />
          </label>

          <div
            style={{
              ...COMMUNITY_PANEL_STYLE,
              borderStyle: 'dashed',
              borderColor: '#93c5fd',
              borderBottomColor: '#60a5fa',
              background: '#f8fbff',
              padding: '14px',
              display: 'grid',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
              <span style={{ fontFamily: COMMUNITY_FONT_FAMILY, color: '#1d4ed8', fontSize: '0.95rem' }}>
                {copy.uploadLabel}
              </span>
              <label
                style={{
                  ...createCommunityButtonStyle({
                    borderColor: '#93c5fd',
                    bottomColor: '#60a5fa',
                    background: '#ffffff',
                    color: '#2563eb',
                  }),
                  padding: '12px 16px',
                }}
              >
                {isPreparing ? <LoaderCircle size={18} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Upload size={18} strokeWidth={2.5} />}
                {isPreparing ? copy.preparing : copy.uploadLabel}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </label>
            </div>

            <div style={{ display: 'flex', alignItems: 'start', gap: '10px', color: '#475569', lineHeight: 1.55 }}>
              <Shield size={18} strokeWidth={2.3} style={{ flexShrink: 0, marginTop: '2px', color: '#2563eb' }} />
              <span>{copy.uploadHint}</span>
            </div>

            <div
              style={{
                ...COMMUNITY_PANEL_STYLE,
                borderColor: '#bfdbfe',
                borderBottomColor: '#60a5fa',
                background: '#ffffff',
                padding: '12px',
                minHeight: '220px',
                display: 'grid',
                placeItems: 'center',
                overflow: 'hidden',
              }}
            >
              {preparedImage?.dataUrl ? (
                <img
                  src={preparedImage.dataUrl}
                  alt={copy.previewAlt}
                  style={{ width: '100%', height: '100%', maxHeight: '320px', objectFit: 'contain', borderRadius: '16px' }}
                />
              ) : (
                <div style={{ color: '#94a3b8', fontFamily: COMMUNITY_FONT_FAMILY, textAlign: 'center', lineHeight: 1.5 }}>
                  {isPreparing ? copy.preparing : copy.previewPlaceholder}
                </div>
              )}
            </div>

            {preparedImage && (
              <div style={{ color: '#475569', fontSize: '0.92rem', lineHeight: 1.6 }}>
                <strong style={{ color: '#1d4ed8' }}>{copy.dimensionsLabel}:</strong>{' '}
                {preparedImage.width} x {preparedImage.height}
              </div>
            )}
          </div>

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
              Close
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isPreparing}
              style={{
                ...createCommunityButtonStyle({
                  borderColor: '#93c5fd',
                  bottomColor: '#2563eb',
                  background: '#2563eb',
                }),
                opacity: isSubmitting || isPreparing ? 0.72 : 1,
              }}
            >
              {isSubmitting ? <LoaderCircle size={18} style={{ animation: 'spin 0.8s linear infinite' }} /> : <ImagePlus size={18} strokeWidth={2.5} />}
              {isSubmitting ? copy.posting : copy.submit}
            </button>
          </div>
        </form>
      </CommunityModal>

      <AnimatePresence>
        {selectedImage && (
          <ImageLightbox
            src={selectedImage}
            images={lightboxImages}
            onClose={() => setSelectedImage(null)}
            onNavigate={setSelectedImage}
            isMobile={isMobile}
            altText={copy.archiveItemAlt}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default FanGalleryPage;
