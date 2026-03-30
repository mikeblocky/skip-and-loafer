import { useState, useEffect } from 'react';

const FallbackImage = ({ src, forwardedRef, ...props }) => {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    setCurrentSrc(src);
    setAttempts(0);
  }, [src]);

  const handleError = () => {
    if (attempts === 0) {
      setCurrentSrc((prev) => (prev.endsWith('.jpg') ? prev.replace('.jpg', '.png') : prev.replace('.png', '.jpg')));
      setAttempts(1);
    } else if (attempts === 1) {
      setCurrentSrc((prev) => prev.replace(/\.(jpg|png)$/, '.jpeg'));
      setAttempts(2);
    } else if (attempts === 2) {
      setCurrentSrc((prev) => prev.replace(/\.jpeg$/, '.webp'));
      setAttempts(3);
    }
  };

  return <img src={currentSrc} ref={forwardedRef} onError={handleError} {...props} />;
};

export default FallbackImage;
