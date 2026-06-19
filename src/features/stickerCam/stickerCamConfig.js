const ASPECT_RATIOS = [
  { id: '9:16', label: '9:16', value: 9 / 16 },
  { id: '4:5', label: '4:5', value: 4 / 5 },
  { id: '4:3', label: '4:3', value: 4 / 3 },
  { id: '3:2', label: '3:2', value: 3 / 2 },
  { id: '1:1', label: '1:1', value: 1 },
  { id: '16:9', label: '16:9', value: 16 / 9 },
];

const CAMERA_FILTERS = [
  { id: 'none', label: 'Original', css: 'none' },
  { id: 'soft', label: 'Soft', css: 'brightness(1.06) contrast(0.96) saturate(1.08)' },
  { id: 'pop', label: 'Pop', css: 'brightness(1.04) contrast(1.12) saturate(1.28)' },
  { id: 'film', label: 'Film', css: 'contrast(0.95) saturate(0.86) sepia(0.18)' },
  { id: 'dream', label: 'Dream', css: 'brightness(1.09) contrast(0.9) saturate(1.16) hue-rotate(-8deg)' },
  { id: 'mono', label: 'Mono', css: 'grayscale(1) contrast(1.08)' },
];

export { ASPECT_RATIOS, CAMERA_FILTERS };
