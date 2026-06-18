const TARGET_IMAGE_BYTES = 100 * 1024;
const ABSOLUTE_MAX_IMAGE_BYTES = 160 * 1024;
const START_MAX_DIMENSION = 1200;
const MIN_MAX_DIMENSION = 520;
const QUALITY_STEPS = [0.88, 0.80, 0.72, 0.64, 0.56, 0.48];

let preferredMimeType = null;

function getPreferredMimeType() {
  if (preferredMimeType) return preferredMimeType;

  const probeCanvas = document.createElement('canvas');
  probeCanvas.width = 1;
  probeCanvas.height = 1;

  try {
    const webpDataUrl = probeCanvas.toDataURL('image/webp', 0.8);
    preferredMimeType = webpDataUrl.startsWith('data:image/webp') ? 'image/webp' : 'image/jpeg';
  } catch {
    preferredMimeType = 'image/jpeg';
  }

  return preferredMimeType;
}

function estimateDataUrlBytes(dataUrl) {
  const base64 = String(dataUrl || '').split(',')[1] || '';
  const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0;
  return Math.ceil((base64.length * 3) / 4) - padding;
}

function scaleDimensions(width, height, maxDimension) {
  if (width <= maxDimension && height <= maxDimension) {
    return { width, height };
  }

  const scale = Math.min(maxDimension / width, maxDimension / height);
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Could not read that image.'));
    };

    image.src = objectUrl;
  });
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve(String(reader.result || ''));
    };

    reader.onerror = () => {
      reject(new Error('Could not read that image.'));
    };

    reader.readAsDataURL(file);
  });
}

export async function prepareImageForUpload(file) {
  if (!(file instanceof File)) {
    throw new Error('Choose an image file first.');
  }

  if (!String(file.type || '').startsWith('image/')) {
    throw new Error('Only image files can be uploaded.');
  }

  if (file.size > 15 * 1024 * 1024) {
    throw new Error('That image is too large to process in-browser.');
  }

  if (file.type === 'image/gif') {
    const image = await loadImageFromFile(file);
    const dataUrl = await readFileAsDataUrl(file);
    return {
      dataUrl,
      width: image.naturalWidth || image.width,
      height: image.naturalHeight || image.height,
      mimeType: 'image/gif',
      bytes: estimateDataUrlBytes(dataUrl),
      isAnimated: true,
    };
  }

  const image = await loadImageFromFile(file);
  const sourceWidth = image.naturalWidth || image.width;
  const sourceHeight = image.naturalHeight || image.height;
  const mimeType = getPreferredMimeType();
  let bestCandidate = null;

  for (let maxDimension = START_MAX_DIMENSION; maxDimension >= MIN_MAX_DIMENSION; maxDimension = Math.round(maxDimension * 0.86)) {
    const { width, height } = scaleDimensions(sourceWidth, sourceHeight, maxDimension);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d', { alpha: mimeType === 'image/webp' });
    if (!context) {
      throw new Error('Your browser could not prepare this image.');
    }

    if (mimeType === 'image/jpeg') {
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, width, height);
    }

    context.drawImage(image, 0, 0, width, height);

    for (const quality of QUALITY_STEPS) {
      const dataUrl = canvas.toDataURL(mimeType, quality);
      const bytes = estimateDataUrlBytes(dataUrl);

      if (!bestCandidate || bytes < bestCandidate.bytes) {
        bestCandidate = { dataUrl, bytes, width, height, mimeType };
      }

      if (bytes <= TARGET_IMAGE_BYTES) {
        return {
          dataUrl,
          width,
          height,
          mimeType,
          bytes,
        };
      }
    }
  }

  if (bestCandidate && bestCandidate.bytes <= ABSOLUTE_MAX_IMAGE_BYTES) {
    return bestCandidate;
  }

  throw new Error('That image is still too large after compression. Try cropping it first.');
}
