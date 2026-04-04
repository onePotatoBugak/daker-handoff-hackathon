import type { HackathonStatus } from '@/lib/types';

const CONFIG: Record<HackathonStatus, { label: string; className: string }> = {
  ongoing: {
    label: '진행중',
    className: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40',
  },
  upcoming: {
    label: '예정',
    className: 'bg-blue-500/20 text-blue-400 border border-blue-500/40',
  },
  ended: {
    label: '종료',
    className: 'bg-slate-700/60 text-slate-400 border border-slate-600/40',
  },
};

export default function StatusBadge({ status }: { status: HackathonStatus }) {
  const { label, className } = CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${className}`}>
      {status === 'ongoing' && (
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
      )}
      {label}
    </span>
  );
}
