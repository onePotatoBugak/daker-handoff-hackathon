'use client';

import { useState, useEffect } from 'react';
import { X, ChevronDown, ChevronUp, BookOpen, HelpCircle } from 'lucide-react';
import type { HackathonDetail } from '@/lib/types';

interface InfoPanelProps {
  open: boolean;
  type: 'faq' | 'rules';
  faq?: HackathonDetail['sections']['info']['faq'];
  rules?: HackathonDetail['sections']['info']['rules'];
  onClose: () => void;
}

export default function InfoPanel({ open, type, faq, rules, onClose }: InfoPanelProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    setOpenIndex(null);
  }, [type]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity duration-300"
        style={{ opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none' }}
      />

      {/* Panel */}
      <div
        className="fixed top-0 right-0 z-50 h-full w-full max-w-[480px] flex flex-col bg-white shadow-2xl transition-transform duration-300 ease-out"
        style={{ transform: open ? 'translateX(0)' : 'translateX(100%)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-violet-100 shrink-0"
          style={{ background: 'linear-gradient(to right, #f5f3ff, #eef2ff)' }}>
          <div className="flex items-center gap-2.5">
            {type === 'faq'
              ? <HelpCircle className="w-5 h-5 text-violet-600" />
              : <BookOpen className="w-5 h-5 text-violet-600" />
            }
            <h2 className="text-lg font-black text-slate-800">
              {type === 'faq' ? 'FAQ' : '규정'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-violet-100 text-slate-400 hover:text-violet-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3">
          {/* FAQ */}
          {type === 'faq' && faq?.items.map((item, i) => (
            <div key={i} className="rounded-xl border border-violet-100 overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-violet-50 transition-colors"
                style={{ background: openIndex === i ? 'rgba(237,233,254,0.6)' : 'rgba(245,243,255,0.5)' }}
              >
                <span className="text-sm font-semibold text-slate-800 pr-2">{item.question}</span>
                {openIndex === i
                  ? <ChevronUp className="w-4 h-4 text-violet-500 shrink-0" />
                  : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                }
              </button>
              {openIndex === i && (
                <div className="px-4 py-3.5 text-sm text-slate-600 leading-relaxed bg-white border-t border-violet-50">
                  {item.answer}
                </div>
              )}
            </div>
          ))}

          {/* Rules */}
          {type === 'rules' && rules?.sections.map((sec, i) => (
            <div key={i} className="rounded-xl border border-slate-100 overflow-hidden">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-700">{sec.title}</h3>
              </div>
              <ul className="px-4 py-3 space-y-2">
                {sec.items.map((item, j) => (
                  <li key={j} className="flex gap-2.5 text-sm text-slate-600">
                    <span className="text-violet-400 shrink-0 mt-0.5">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Empty state */}
          {((type === 'faq' && !faq?.items.length) || (type === 'rules' && !rules?.sections.length)) && (
            <div className="text-center py-16 text-slate-400 text-sm">
              콘텐츠가 아직 준비되지 않았습니다.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
