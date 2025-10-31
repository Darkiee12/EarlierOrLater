import { useRef, useCallback } from "react";

export const useGameTimer = () => {
  const revealTimerRef = useRef<number | null>(null);
  const scoreTimerRef = useRef<number | null>(null);

  const clearTimers = useCallback(() => {
    if (revealTimerRef.current !== null) {
      clearTimeout(revealTimerRef.current);
      revealTimerRef.current = null;
    }
    if (scoreTimerRef.current !== null) {
      clearTimeout(scoreTimerRef.current);
      scoreTimerRef.current = null;
    }
  }, []);

  const startTimers = useCallback(
    (delayMs: number, onReveal: () => void, onScore: () => void) => {
      clearTimers();

      revealTimerRef.current = window.setTimeout(() => {
        onReveal();
        revealTimerRef.current = null;
      }, delayMs);

      scoreTimerRef.current = window.setTimeout(() => {
        onScore();
        scoreTimerRef.current = null;
      }, delayMs);
    },
    [clearTimers]
  );

  const hasActiveTimers = useCallback(() => {
    return revealTimerRef.current !== null || scoreTimerRef.current !== null;
  }, []);

  return {
    startTimers,
    clearTimers,
    hasActiveTimers,
  };
};
