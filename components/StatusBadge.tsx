import type { HackathonStatus } from '@/lib/types';

const CONFIG: Record<HackathonStatus, { label: string; bg: string; text: string; border: string; dot?: string }> = {
  ongoing: { label: '진행중', bg: '#ecfdf5', text: '#065f46', border: '#a7f3d0', dot: '#10b981' },
  upcoming: { label: '예정', bg: '#ede9fe', text: '#5b21b6', border: '#c4b5fd' },
  ended: { label: '종료', bg: '#f1f5f9', text: '#64748b', border: '#e2e8f0' },
};

export default function StatusBadge({ status }: { status: HackathonStatus }) {
  const c = CONFIG[status];
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}>
      {c.dot && <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: c.dot }} />}
      {c.label}
    </span>
  );
}
