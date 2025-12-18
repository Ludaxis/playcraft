'use client';

import { useState, useEffect, useCallback } from 'react';

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
  formatted: string;
}

const INITIAL_STATE: TimeRemaining = {
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
  total: 0,
  formatted: '--:--',
};

function calculateTime(endTime: Date | null): TimeRemaining {
  if (!endTime) {
    return INITIAL_STATE;
  }

  const total = Math.max(0, endTime.getTime() - Date.now());
  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));

  let formatted: string;
  if (days > 0) {
    formatted = `${days}d ${hours}h`;
  } else if (hours > 0) {
    formatted = `${hours}h ${minutes}m`;
  } else {
    formatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  return { days, hours, minutes, seconds, total, formatted };
}

export function useTimer(endTime: Date | null): TimeRemaining {
  // Always initialize with INITIAL_STATE to prevent hydration mismatch
  // The real time will be calculated after mount
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(INITIAL_STATE);

  const updateTime = useCallback(() => {
    setTimeRemaining(calculateTime(endTime));
  }, [endTime]);

  useEffect(() => {
    // Defer initial calculation to avoid synchronous setState in effect
    // Then update every second
    const initialTimeout = setTimeout(updateTime, 0);
    const interval = setInterval(updateTime, 1000);
    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [updateTime]);

  return timeRemaining;
}
