import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ImagePlus, Upload } from 'lucide-react';
import usePageTitle from '../hooks/shared/usePageTitle';
import APP_UI_TEXT_GLOBAL from '../config/appUiText';
import {
  createFanGalleryEntry,
  fetchFanGalleryEntries,
  getCachedFanGalleryEntries,
} from '../features/community/fanGalleryApi';
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
import { prepareImageForUpload } from '../features/community/imageUpload';
import FanGalleryBoard from '../features/community/fanGallery/FanGalleryBoard';
import FanGalleryComposerForm from '../features/community/fanGallery/FanGalleryComposerForm';
import {
  COMMUNITY_PAGE_STYLE,
} from '../features/community/communityTheme';

const loadImageLightbox = () => import('../components/shared/ImageLightbox');
const ImageLightbox = lazy(loadImageLightbox);

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
  ja: {
    title: 'ファンギャラリー',
    badge: 'シリーズギャラリー',
    subtitle: '作品にまつわるものなら何でも置けるギャラリーです。イラスト、コスプレ、グッズ、イベント写真、棚の写真、お気に入りのひとこまなど。',
    artistLabel: '名前 / 出典',
    artistPlaceholder: '任意のクレジットや出典',
    descriptionLabel: '説明',
    descriptionPlaceholder: 'これは何か、どうして大事なのかなどのメモを任意で記入できます。',
    uploadLabel: '画像を選ぶ',
    preparing: '画像を準備中...',
    uploadHint: '対応形式: PNG、JPG、WebP、GIF。安全性のため、アップロード前にブラウザ上で再描画して埋め込みメタデータを除去します。GIFはアニメーションのまま保持されます。',
    button: '項目を追加',
    submit: 'アップロード',
    close: '閉じる',
    resetCanvas: 'キャンバスをリセット',
    itemsCountLabel: '件',
    posting: 'アップロード中...',
    empty: 'まだ項目はありません。最初の1件を追加してください。',
    previewAlt: '準備済み画像のプレビュー',
    dimensionsLabel: '準備済みサイズ',
    previewPlaceholder: '準備済みのプレビューはここに表示されます。',
    success: '項目を公開しました。',
    modalTitle: 'ギャラリーに追加',
    helper: '画像を選んでください。PNG、JPG、WebP、GIFに対応しています。',
    loadError: '現在、ファンギャラリーを読み込めません。',
    prepareError: 'その画像を準備できませんでした。',
    imageRequired: 'アップロードする前に画像を選んでください。',
    submitError: 'その画像をアップロードできませんでした。',
    archiveItemAlt: 'ファンギャラリーの項目',
  },
};

function getCopy(uiLanguage) {
  return PAGE_COPY[uiLanguage] || PAGE_COPY.en;
}

export const FanGalleryPage = ({ isMobile, uiLanguage = 'en' }) => {
  const copy = getCopy(uiLanguage);
  const tGlobal = APP_UI_TEXT_GLOBAL[uiLanguage] || APP_UI_TEXT_GLOBAL.en;

  usePageTitle(tGlobal.tabs?.fanGallery?.label || 'Fan gallery');
  const {
    entries,
    setEntries,
    isLoading,
    errorMessage,
    setErrorMessage,
  } = useCommunityEntries({
    getCachedEntries: getCachedFanGalleryEntries,
    fetchEntries: fetchFanGalleryEntries,
    loadErrorMessage: copy.loadError,
  });
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [preparedImage, setPreparedImage] = useState(null);
  const [isPreparing, setIsPreparing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const galleryBoardRef = useRef(null);
  const [activeDraggedId, setActiveDraggedId] = useState(null);
  const lastDragEndedAtRef = useRef(0);
  const [stackOrder, setStackOrder] = useState([]);
  const galleryGestureStartRef = useRef(new Map());
  const [galleryGestures, setGalleryGestures] = useState({});
  const [activeGalleryGestureId, setActiveGalleryGestureId] = useState(null);
  const [canvasResetVersion, setCanvasResetVersion] = useState(0);
  const [isResettingCanvas, setIsResettingCanvas] = useState(false);
  const galleryDragConstraints = useMemo(() => {
    if (!isMobile) return galleryBoardRef;
    return undefined;
  }, [isMobile]);
  const galleryBoardMinHeight = useMemo(() => {
    if (!isMobile) return '78vh';
    const maxScale = Math.max(1, ...Object.values(galleryGestures).map((gesture) => gesture?.scale ?? 1));
    const dragLift = activeDraggedId ? 12 : 0;
    const extraHeight = Math.round((maxScale - 1) * 28 + dragLift);
    return `${Math.max(72, 72 + extraHeight)}vh`;
  }, [activeDraggedId, isMobile, galleryGestures]);

  useEffect(() => {
    setStackOrder((current) => {
      const entryIds = entries.map((entry) => entry.id);
      const preserved = current.filter((id) => entryIds.includes(id));
      const appended = entryIds.filter((id) => !preserved.includes(id));
      return [...preserved, ...appended];
    });
  }, [entries]);

  const stackOrderIndex = useMemo(
    () => Object.fromEntries(stackOrder.map((id, index) => [id, index + 1])),
    [stackOrder],
  );

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
          title={copy.title}
          icon={ImagePlus}
          titleColors={{
            borderColor: '#2563eb',
            bottomColor: '#1d4ed8',
            shadow: '0 8px 18px rgba(37, 99, 235, 0.12)',
          }}
          countValue={entries.length}
          countLabel={copy.itemsCountLabel}
          counterColors={{
            borderColor: '#93c5fd',
            bottomColor: '#2563eb',
            color: '#1d4ed8',
          }}
          actionLabel={copy.button}
          actionIcon={Upload}
          actionColors={{
            borderColor: '#93c5fd',
            bottomColor: '#2563eb',
            color: '#1d4ed8',
          }}
          onAction={() => setIsComposerOpen(true)}
          resetLabel={copy.resetCanvas}
          onReset={resetCanvas}
        />

        <CommunityStatusBanner tone="error" message={errorMessage} />
        <CommunityStatusBanner tone="success" message={successMessage} />

        <FanGalleryBoard
          isMobile={isMobile}
          entries={entries}
          isLoading={isLoading}
          emptyMessage={copy.empty}
          uiLanguage={uiLanguage}
          galleryBoardRef={galleryBoardRef}
          galleryBoardMinHeight={galleryBoardMinHeight}
          isResettingCanvas={isResettingCanvas}
          canvasResetVersion={canvasResetVersion}
          galleryGestures={galleryGestures}
          activeDraggedId={activeDraggedId}
          activeGalleryGestureId={activeGalleryGestureId}
          galleryDragConstraints={galleryDragConstraints}
          stackOrderIndex={stackOrderIndex}
          onDragStart={(entryId) => {
            setActiveDraggedId(entryId);
            setStackOrder((current) => {
              const nextOrder = current.filter((id) => id !== entryId);
              nextOrder.push(entryId);
              return nextOrder;
            });
          }}
          onDragEnd={(entryId) => {
            lastDragEndedAtRef.current = Date.now();
            setActiveDraggedId((current) => (current === entryId ? null : current));
          }}
          onTouchStart={handleGalleryTouchStart}
          onTouchMove={handleGalleryTouchMove}
          onTouchEnd={handleGalleryTouchEnd}
          onWheel={handleGalleryWheel}
          onSelectEntry={(entryId, imageDataUrl) => {
            if (activeDraggedId === entryId) return;
            if (activeGalleryGestureId === entryId) return;
            if (Date.now() - lastDragEndedAtRef.current < 220) return;
            setSelectedImage(imageDataUrl);
          }}
        />

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
        <FanGalleryComposerForm
          copy={copy}
          name={name}
          description={description}
          preparedImage={preparedImage}
          isPreparing={isPreparing}
          isSubmitting={isSubmitting}
          onNameChange={setName}
          onDescriptionChange={setDescription}
          onFileChange={handleFileChange}
          onClose={() => setIsComposerOpen(false)}
          onSubmit={handleSubmit}
        />
      </CommunityModal>

      <AnimatePresence>
        {selectedImage && (
          <Suspense fallback={null}>
            <ImageLightbox
              src={selectedImage}
              images={lightboxImages}
              onClose={() => setSelectedImage(null)}
              onNavigate={setSelectedImage}
              isMobile={isMobile}
              altText={copy.archiveItemAlt}
            />
          </Suspense>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FanGalleryPage;
