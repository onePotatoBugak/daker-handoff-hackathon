'use client';

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  deadline: string;
  label?: string;
}

function calcRemaining(deadline: string) {
  const diff = new Date(deadline).getTime() - Date.now();
  if (diff <= 0) return null;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return { days, hours, minutes };
}

export default function CountdownTimer({ deadline, label = '제출 마감' }: CountdownTimerProps) {
  const [remaining, setRemaining] = useState<{ days: number; hours: number; minutes: number } | null>(null);

  useEffect(() => {
    setRemaining(calcRemaining(deadline));
    const id = setInterval(() => setRemaining(calcRemaining(deadline)), 60_000);
    return () => clearInterval(id);
  }, [deadline]);

  if (remaining === null) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-medium">
        <Clock className="w-3.5 h-3.5" />
        {label} 마감됨
      </span>
    );
  }

  const isUrgent = remaining.days < 3;

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
        isUrgent ? 'text-red-400' : 'text-amber-400'
      }`}
    >
      <Clock className="w-3.5 h-3.5" />
      {label}까지&nbsp;
      {remaining.days > 0 && `${remaining.days}일 `}
      {remaining.hours}시간 {remaining.minutes}분
    </span>
  );
}
