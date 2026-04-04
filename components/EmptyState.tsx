import { SearchX } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export default function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
        style={{ background: 'rgba(109,40,217,0.07)', border: '1px solid rgba(109,40,217,0.15)' }}>
        <SearchX className="w-8 h-8 text-violet-400" />
      </div>
      <h3 className="text-lg font-bold text-slate-700 mb-2">{title}</h3>
      {description && <p className="text-sm text-slate-500 max-w-xs leading-relaxed mb-5">{description}</p>}
      {action && (
        <button onClick={action.onClick}
          className="px-5 py-2.5 text-sm font-semibold text-white rounded-xl transition-all hover:scale-105"
          style={{ background: 'linear-gradient(135deg, #6d28d9, #4f46e5)' }}>
          {action.label}
        </button>
      )}
    </div>
  );
}
