export const isVideoSrc = (value) => /\.mp4($|\?)/i.test(value || '');

export const isGifSrc = (value) => /\.gif($|\?)/i.test(value || '');

export const getGalleryMediaKind = (value) => {
  if (isVideoSrc(value)) return 'video';
  if (isGifSrc(value)) return 'gif';
  return 'image';
};
