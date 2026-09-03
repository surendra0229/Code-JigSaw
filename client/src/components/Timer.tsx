import React, { useEffect, useState } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { useGame } from '../context/GameContext';

interface TimerProps {
  onExpire?: () => void;
}

export const Timer: React.FC<TimerProps> = ({ onExpire }) => {
  const { gameState, refreshGameState } = useGame();
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);

  useEffect(() => {
    if (!gameState || gameState.completed) return;

    // Calculate seconds remaining based on expiresAt timestamp from backend
    const updateCountdown = () => {
      const expiresAtMs = new Date(gameState.expiresAt).getTime();
      const nowMs = Date.now();
      const diff = Math.max(0, Math.floor((expiresAtMs - nowMs) / 1000));
      setSecondsRemaining(diff);

      if (diff <= 0) {
        if (onExpire) onExpire();
        refreshGameState();
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [gameState, onExpire, refreshGameState]);

  if (!gameState) return null;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const isCritical = secondsRemaining <= 30;
  const isWarning = secondsRemaining <= 90 && !isCritical;

  let timerColorClass = 'text-amber bg-amber/10 border-amber/30';
  if (isCritical) {
    timerColorClass = 'text-crimson-red bg-crimson-red/10 border-crimson-red/40 animate-pulse-subtle';
  } else if (isWarning) {
    timerColorClass = 'text-amber-400 bg-amber-400/10 border-amber-400/30';
  }

  return (
    <div className={`flex items-center gap-2 px-3 py-1 rounded-md border font-mono text-sm font-semibold transition-colors ${timerColorClass}`}>
      {isCritical ? (
        <AlertTriangle className="w-4 h-4 text-crimson-red animate-bounce" />
      ) : (
        <Clock className="w-4 h-4" />
      )}
      <span>{formattedTime}</span>
    </div>
  );
};

export default Timer;
