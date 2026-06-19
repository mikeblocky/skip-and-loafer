import { useCallback, useRef } from 'react';

function useImageLibraryImport({
  setSnapPanel,
  setSnapSize,
  setSnapStickers,
  setSnapUrl,
  stopCamera,
}) {
  const imageInputRef = useRef(null);

  const openImageLibrary = useCallback(() => {
    imageInputRef.current?.click();
  }, []);

  const handleImageImport = useCallback((event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file?.type?.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result;
      if (typeof url !== 'string') return;

      const image = new Image();
      image.onload = () => {
        stopCamera();
        setSnapSize({
          width: image.naturalWidth || image.width || 1080,
          height: image.naturalHeight || image.height || 1920,
        });
        setSnapUrl(url);
        setSnapStickers([]);
        setSnapPanel(null);
      };
      image.src = url;
    };
    reader.readAsDataURL(file);
  }, [setSnapPanel, setSnapSize, setSnapStickers, setSnapUrl, stopCamera]);

  return { handleImageImport, imageInputRef, openImageLibrary };
}

export { useImageLibraryImport };
