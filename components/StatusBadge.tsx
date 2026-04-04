import type { HackathonStatus } from '@/lib/types';

const CONFIG: Record<
  HackathonStatus,
  { label: string; bg: string; text: string; border: string; dot?: string }
> = {
  ongoing: {
    label: '진행중',
    bg: 'rgba(16,185,129,0.1)',
    text: '#34d399',
    border: 'rgba(52,211,153,0.25)',
    dot: '#10b981',
  },
  upcoming: {
    label: '예정',
    bg: 'rgba(59,130,246,0.1)',
    text: '#93c5fd',
    border: 'rgba(147,197,253,0.25)',
  },
  ended: {
    label: '종료',
    bg: 'rgba(100,116,139,0.1)',
    text: '#94a3b8',
    border: 'rgba(148,163,184,0.15)',
  },
};

export default function StatusBadge({ status }: { status: HackathonStatus }) {
  const c = CONFIG[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}
    >
      {c.dot && (
        <span
          className="w-1.5 h-1.5 rounded-full animate-pulse"
          style={{ background: c.dot }}
        />
      )}
      {c.label}
    </span>
  );
}
