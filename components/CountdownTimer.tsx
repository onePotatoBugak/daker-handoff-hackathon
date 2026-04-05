'use client';

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  deadline: string;
  label?: string;
}

export default function CountdownTimer({ deadline, label }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number; hours: number; minutes: number; expired: boolean;
  } | null>(() => {
    const diff = new Date(deadline).getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, expired: true };
    const days = Math.floor(diff / 86_400_000);
    const hours = Math.floor((diff % 86_400_000) / 3_600_000);
    const minutes = Math.floor((diff % 3_600_000) / 60_000);
    return { days, hours, minutes, expired: false };
  });

  useEffect(() => {
    function calc() {
      const diff = new Date(deadline).getTime() - Date.now();
      if (diff <= 0) return { days: 0, hours: 0, minutes: 0, expired: true };
      const days = Math.floor(diff / 86_400_000);
      const hours = Math.floor((diff % 86_400_000) / 3_600_000);
      const minutes = Math.floor((diff % 3_600_000) / 60_000);
      return { days, hours, minutes, expired: false };
    }
    const id = setInterval(() => setTimeLeft(calc()), 60_000);
    return () => clearInterval(id);
  }, [deadline]);

  if (!timeLeft) return null;

  if (timeLeft.expired) {
    return (
      <span className="flex items-center gap-1 text-xs text-slate-400 font-medium">
        <Clock className="w-3 h-3" />마감됨
      </span>
    );
  }

  const isUrgent = timeLeft.days < 3;

  return (
    <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
      style={{
        background: isUrgent ? 'rgba(239,68,68,0.08)' : 'rgba(109,40,217,0.08)',
        color: isUrgent ? '#dc2626' : '#6d28d9',
        border: `1px solid ${isUrgent ? 'rgba(239,68,68,0.2)' : 'rgba(109,40,217,0.2)'}`,
      }}>
      <Clock className="w-3 h-3" />
      {label && <span className="font-normal opacity-70">{label}</span>}
      {timeLeft.days > 0 ? `D-${timeLeft.days}` : `${timeLeft.hours}h ${timeLeft.minutes}m`}
    </span>
  );
}
