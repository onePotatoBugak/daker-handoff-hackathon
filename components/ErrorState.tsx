import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export default function ErrorState({
  title = '오류가 발생했습니다',
  description = '잠시 후 다시 시도해주세요.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
        style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)' }}>
        <AlertTriangle className="w-8 h-8 text-red-400" />
      </div>
      <h3 className="text-lg font-bold text-slate-700 mb-2">{title}</h3>
      {description && <p className="text-sm text-slate-500 max-w-xs leading-relaxed mb-5">{description}</p>}
      {onRetry && (
        <button onClick={onRetry}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-600 rounded-xl transition-all hover:bg-slate-100 bg-white border border-slate-200 shadow-sm">
          <RefreshCw className="w-4 h-4" />
          다시 시도
        </button>
      )}
    </div>
  );
}
