'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ExternalLink, AlertCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import EmptyState from '@/components/EmptyState';
import { HACKATHONS, SEED_LEADERBOARDS } from '@/lib/data';
import type { LeaderboardEntry } from '@/lib/types';

type Period = 'all' | '30d' | '7d';

const MEDAL: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

const PERIOD_LABELS: Record<Period, string> = {
  all: '전체',
  '30d': '최근 30일',
  '7d': '최근 7일',
};

function getPeriodCutoff(period: Period): Date | null {
  if (period === 'all') return null;
  const now = new Date();
  const days = period === '7d' ? 7 : 30;
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

function Podium({ entries }: { entries: LeaderboardEntry[] }) {
  if (entries.length < 1) return null;
  const top3 = entries.slice(0, 3);
  const podiumOrder = top3.length >= 2 ? [top3[1], top3[0], top3[2]] : [undefined, top3[0], undefined];
  const heights = ['h-20', 'h-28', 'h-16'];
  const rankLabels = ['2nd', '1st', '3rd'];

  return (
    <div className="flex items-end justify-center gap-3 mb-8">
      {podiumOrder.map((entry, i) => {
        if (!entry) return <div key={i} className="w-28" />;
        return (
          <div key={entry.rank} className="flex flex-col items-center gap-2 w-28">
            <div className="text-2xl">{MEDAL[entry.rank] ?? ''}</div>
            <div className="text-sm font-bold text-white text-center leading-tight">
              {entry.teamName}
            </div>
            <div className="text-xs text-slate-400 font-mono">
              {entry.score < 2 ? entry.score.toFixed(4) : entry.score.toFixed(1)}
            </div>
            <div
              className={`w-full ${heights[i]} rounded-t-xl flex items-end justify-center pb-2 font-bold text-sm ${
                i === 1
                  ? 'bg-yellow-500/20 border border-yellow-500/30 text-yellow-400'
                  : i === 0
                  ? 'bg-slate-600/40 border border-slate-600/30 text-slate-400'
                  : 'bg-amber-700/20 border border-amber-700/30 text-amber-600'
              }`}
            >
              {rankLabels[i]}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function RankingsPage() {
  const [selectedSlug, setSelectedSlug] = useState<string>(() => {
    const slugs = Object.keys(SEED_LEADERBOARDS);
    return slugs[0] ?? '';
  });
  const [period, setPeriod] = useState<Period>('all');

  const leaderboard = SEED_LEADERBOARDS[selectedSlug];

  const filteredEntries = useMemo(() => {
    if (!leaderboard) return [];
    const cutoff = getPeriodCutoff(period);
    if (!cutoff) return leaderboard.entries;
    return leaderboard.entries.filter(
      (e) => new Date(e.submittedAt).getTime() >= cutoff.getTime()
    );
  }, [leaderboard, period]);

  const hasScoreBreakdown = filteredEntries.some((e) => e.scoreBreakdown);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-1">랭킹</h1>
          <p className="text-slate-400 text-sm">해커톤별 결과 및 전체 순위</p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-3 mb-6 p-4 bg-slate-900 rounded-xl border border-slate-800">
          {/* Hackathon selector */}
          <div className="flex gap-2 flex-wrap">
            {HACKATHONS.map((h) => {
              const hasData = !!SEED_LEADERBOARDS[h.slug];
              return (
                <button
                  key={h.slug}
                  onClick={() => {
                    if (hasData) setSelectedSlug(h.slug);
                  }}
                  disabled={!hasData}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all font-medium ${
                    selectedSlug === h.slug
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : hasData
                      ? 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'
                      : 'bg-slate-800/40 border-slate-800 text-slate-600 cursor-not-allowed'
                  }`}
                >
                  {h.slug === 'aimers-8-model-lite'
                    ? 'Aimers 8기'
                    : h.slug === 'monthly-vibe-coding-2026-02'
                    ? '바이브코딩 2026.02'
                    : '인수인계 해커톤'}
                  {!hasData && ' (집계 중)'}
                </button>
              );
            })}
          </div>

          {/* Period filter */}
          <div className="flex gap-1.5 ml-auto">
            {(['all', '30d', '7d'] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                  period === p
                    ? 'bg-slate-700 border-slate-600 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                {PERIOD_LABELS[p]}
              </button>
            ))}
          </div>
        </div>

        {!leaderboard ? (
          <EmptyState
            title="리더보드가 없습니다"
            description="이 해커톤의 집계 결과가 아직 공개되지 않았습니다."
          />
        ) : filteredEntries.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center">
            <div className="text-slate-500 text-sm flex flex-col items-center gap-2">
              <AlertCircle className="w-8 h-8 text-slate-600" />
              <p>선택한 기간에 해당하는 제출 결과가 없습니다.</p>
              <button
                onClick={() => setPeriod('all')}
                className="mt-2 text-xs text-blue-400 underline"
              >
                전체 기간으로 보기
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            {/* Hackathon title */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold">
                  {HACKATHONS.find((h) => h.slug === selectedSlug)?.title}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  업데이트: {new Date(leaderboard.updatedAt).toLocaleString('ko-KR')} ·{' '}
                  {filteredEntries.length}팀
                </p>
              </div>
              <Link
                href={`/hackathons/${selectedSlug}`}
                className="text-xs text-blue-400 hover:text-blue-300 underline flex items-center gap-1"
              >
                상세 보기
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            {/* Podium */}
            <Podium entries={filteredEntries} />

            {/* Note */}
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mb-4">
              <AlertCircle className="w-3.5 h-3.5" />
              {leaderboard.hackathonSlug === 'daker-handover-2026-03'
                ? '아이디어 해커톤의 점수(score)는 투표 결과를 기반으로 표시됩니다.'
                : 'Public 리더보드는 제출 마감 시점 기준으로 고정될 수 있습니다.'}
            </p>

            {/* Full table */}
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-800/60 text-slate-400 text-xs uppercase">
                    <th className="py-3 px-4 text-left">순위</th>
                    <th className="py-3 px-4 text-left">팀</th>
                    <th className="py-3 px-4 text-right">최종 점수</th>
                    {hasScoreBreakdown && (
                      <>
                        <th className="py-3 px-4 text-right hidden sm:table-cell">
                          참가자 (30%)
                        </th>
                        <th className="py-3 px-4 text-right hidden sm:table-cell">
                          심사위원 (70%)
                        </th>
                      </>
                    )}
                    <th className="py-3 px-4 text-right hidden md:table-cell">
                      제출일
                    </th>
                    <th className="py-3 px-4 text-right hidden md:table-cell">
                      산출물
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredEntries.map((e) => (
                    <tr
                      key={e.rank}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        e.rank <= 3 ? 'font-medium' : ''
                      }`}
                    >
                      <td className="py-3 px-4 text-slate-200">
                        {MEDAL[e.rank] ?? `#${e.rank}`}
                      </td>
                      <td className="py-3 px-4 text-white">{e.teamName}</td>
                      <td className="py-3 px-4 text-right font-mono text-slate-200">
                        {e.score < 2 ? e.score.toFixed(4) : e.score.toFixed(1)}
                      </td>
                      {hasScoreBreakdown && (
                        <>
                          <td className="py-3 px-4 text-right text-slate-400 hidden sm:table-cell">
                            {e.scoreBreakdown?.participant ?? '-'}
                          </td>
                          <td className="py-3 px-4 text-right text-slate-400 hidden sm:table-cell">
                            {e.scoreBreakdown?.judge ?? '-'}
                          </td>
                        </>
                      )}
                      <td className="py-3 px-4 text-right text-xs text-slate-500 hidden md:table-cell">
                        {new Date(e.submittedAt).toLocaleDateString('ko-KR')}
                      </td>
                      <td className="py-3 px-4 text-right hidden md:table-cell">
                        <div className="flex items-center justify-end gap-2">
                          {e.artifacts?.webUrl && (
                            <a
                              href={e.artifacts.webUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-400 hover:text-blue-300 underline"
                            >
                              웹
                            </a>
                          )}
                          {e.artifacts?.pdfUrl && (
                            <a
                              href={e.artifacts.pdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-slate-400 hover:text-slate-200 underline"
                            >
                              PDF
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
