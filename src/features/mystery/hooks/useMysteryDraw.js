import { useCallback, useEffect, useRef, useState } from 'react';
import { triggerHaptic } from '../../../utils/haptics';

const REVEAL_DELAY_MS = 2200;
const REDRAW_DELAY_MS = 50;

const pickRandomCharacter = (portraitData) => portraitData[Math.floor(Math.random() * portraitData.length)];

export const useMysteryDraw = ({ portraitData }) => {
  const [pulledCharacter, setPulledCharacter] = useState(null);
  const [isOpening, setIsOpening] = useState(false);
  const revealTimeoutRef = useRef(null);
  const redrawTimeoutRef = useRef(null);

  const clearTimers = useCallback(() => {
    if (revealTimeoutRef.current) {
      window.clearTimeout(revealTimeoutRef.current);
      revealTimeoutRef.current = null;
    }

    if (redrawTimeoutRef.current) {
      window.clearTimeout(redrawTimeoutRef.current);
      redrawTimeoutRef.current = null;
    }
  }, []);

  const beginPull = useCallback(() => {
    clearTimers();
    triggerHaptic('success');
    setIsOpening(true);
    revealTimeoutRef.current = window.setTimeout(() => {
      revealTimeoutRef.current = null;
      setPulledCharacter(pickRandomCharacter(portraitData));
    }, REVEAL_DELAY_MS);
  }, [clearTimers, portraitData]);

  const handlePull = useCallback(() => {
    if (isOpening || pulledCharacter) return;
    beginPull();
  }, [beginPull, isOpening, pulledCharacter]);

  const handleReset = useCallback(() => {
    clearTimers();
    setPulledCharacter(null);
    setIsOpening(false);
  }, [clearTimers]);

  const handleDrawAgain = useCallback(() => {
    triggerHaptic('selection');
    handleReset();
    redrawTimeoutRef.current = window.setTimeout(() => {
      redrawTimeoutRef.current = null;
      beginPull();
    }, REDRAW_DELAY_MS);
  }, [beginPull, handleReset]);

  useEffect(() => () => {
    clearTimers();
  }, [clearTimers]);

  return {
    pulledCharacter,
    isOpening,
    handlePull,
    handleReset,
    handleDrawAgain,
  };
};
