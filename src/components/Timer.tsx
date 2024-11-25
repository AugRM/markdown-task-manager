import React, { useEffect, useState } from 'react';

interface TimerProps {
  startTime: number | null;
  estimatedTime: number;
  completionPercentage: number;
}

export const Timer: React.FC<TimerProps> = ({
  startTime,
  estimatedTime,
  completionPercentage,
}) => {
  const [elapsed, setElapsed] = useState<number>(0);

  useEffect(() => {
    if (!startTime) return;

    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  const formatTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m
      .toString()
      .padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const calculateRemainingTime = (): number => {
    if (!startTime || completionPercentage === 0) return estimatedTime;
    if (completionPercentage === 100) return 0;

    // Calculate rate of completion (percentage per second)
    const rate = completionPercentage / elapsed;
    
    // Calculate remaining percentage
    const remainingPercentage = 100 - completionPercentage;
    
    // Calculate remaining time based on current rate
    const remainingTime = Math.ceil(remainingPercentage / rate);
    
    return remainingTime;
  };

  return (
    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
      <div>Time Elapsed: {formatTime(elapsed)}</div>
      <div>Estimated Remaining: {formatTime(calculateRemainingTime())}</div>
    </div>
  );
};