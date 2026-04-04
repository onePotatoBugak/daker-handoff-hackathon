'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { ExternalLink, AlertCircle, Trophy, Globe } from 'lucide-react';
import Navbar from '@/components/Navbar';
import EmptyState from '@/components/EmptyState';
import { HACKATHONS, SEED_LEADERBOARDS } from '@/lib/data';
import { getLocalLeaderboardEntries } from '@/lib/storage';
import type { LocalLeaderboardEntry } from '@/lib/storage';

type Period = 'all' | '30d' | '7d';
type ViewMode = 'global' | 'hackathon';

const PERIOD_LABELS: Record<Period, string> = { all: '전체', '30d': '최근 30일', '7d': '최근 7일' };
const MEDAL: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

function getPeriodCutoff(period: Period): Date | null {
  if (period === 'all') return null;
  const now = new Date();
  return new Date(now.getTime() - (period === '7d' ? 7 : 30) * 86_400_000);
}

function normalizeScore(score: number): number {
  return score < 2 ? Math.round(score * 1000) / 10 : score;
}

function PodiumGlobal({ entries }: { entries: { rank: number; teamName: string; totalPoints: number }[] }) {
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
            <div className="text-sm font-bold text-slate-700 text-center leading-tight">{entry.teamName}</div>
            <div className="text-xs text-slate-500 font-mono">{entry.totalPoints.toFixed(1)}pt</div>
            <div className={`w-full ${heights[i]} rounded-t-xl flex items-end justify-center pb-2 font-bold text-sm ${
              i === 1 ? 'bg-yellow-50 border border-yellow-200 text-yellow-600'
              : i === 0 ? 'bg-slate-100 border border-slate-200 text-slate-500'
              : 'bg-amber-50 border border-amber-200 text-amber-600'
            }`}>
              {rankLabels[i]}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function RankingsPage() {
  const [view, setView] = useState<ViewMode>('global');
  const [period, setPeriod] = useState<Period>('all');
  const [selectedSlug, setSelectedSlug] = useState<string>(() => Object.keys(SEED_LEADERBOARDS)[0] ?? '');
  const [localEntries, setLocalEntries] = useState<LocalLeaderboardEntry[]>([]);

  useEffect(() => { setLocalEntries(getLocalLeaderboardEntries()); }, []);

  const globalRanking = useMemo(() => {
    const cutoff = getPeriodCutoff(period);
    const allEntries: {
      teamName: string; hackathonSlug: string; hackathonTitle: string;
      normalizedScore: number; submittedAt: string; isPending?: boolean;
    }[] = [];

    Object.entries(SEED_LEADERBOARDS).forEach(([slug, lb]) => {
      const hackathon = HACKATHONS.find((h) => h.slug === slug);
      lb.entries.forEach((entry) => {
        if (cutoff && new Date(entry.submittedAt) < cutoff) return;
        allEntries.push({
          teamName: entry.teamName, hackathonSlug: slug,
          hackathonTitle: hackathon?.title ?? slug,
          normalizedScore: normalizeScore(entry.score), submittedAt: entry.submittedAt,
        });
      });
    });

    localEntries.forEach((entry) => {
      if (cutoff && new Date(entry.submittedAt) < cutoff) return;
      const hackathon = HACKATHONS.find((h) => h.slug === entry.hackathonSlug);
      const exists = allEntries.some((e) => e.hackathonSlug === entry.hackathonSlug && e.teamName === entry.teamName);
      if (!exists) {
        allEntries.push({
          teamName: entry.teamName, hackathonSlug: entry.hackathonSlug,
          hackathonTitle: hackathon?.title ?? entry.hackathonSlug,
          normalizedScore: 0, submittedAt: entry.submittedAt, isPending: true,
        });
      }
    });

    const byTeam = new Map<string, { teamName: string; totalPoints: number; hackathons: { title: string; slug: string; score: number; isPending?: boolean }[]; lastSubmitted: string }>();
    allEntries.forEach((entry) => {
      if (!byTeam.has(entry.teamName)) {
        byTeam.set(entry.teamName, { teamName: entry.teamName, totalPoints: 0, hackathons: [], lastSubmitted: entry.submittedAt });
      }
      const team = byTeam.get(entry.teamName)!;
      team.totalPoints += entry.normalizedScore;
      team.hackathons.push({ title: entry.hackathonTitle, slug: entry.hackathonSlug, score: entry.normalizedScore, isPending: entry.isPending });
      if (new Date(entry.submittedAt) > new Date(team.lastSubmitted)) team.lastSubmitted = entry.submittedAt;
    });

    return Array.from(byTeam.values())
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .map((team, idx) => ({ ...team, rank: idx + 1 }));
  }, [period, localEntries]);

  const hackathonLeaderboard = SEED_LEADERBOARDS[selectedSlug];

  const filteredHackathonEntries = useMemo(() => {
    if (!hackathonLeaderboard) return [];
    const cutoff = getPeriodCutoff(period);
    const seed = cutoff ? hackathonLeaderboard.entries.filter((e) => new Date(e.submittedAt) >= cutoff) : hackathonLeaderboard.entries;
    const localForSlug = localEntries.filter((e) => e.hackathonSlug === selectedSlug);
    const localRows = localForSlug.filter((e) => !seed.some((s) => s.teamName === e.teamName))
      .map((e, i) => ({ rank: seed.length + i + 1, teamName: e.teamName, score: 0, submittedAt: e.submittedAt, isPending: true }));
    return [...seed, ...localRows];
  }, [hackathonLeaderboard, selectedSlug, period, localEntries]);

  const hasScoreBreakdown = filteredHackathonEntries.some((e) => 'scoreBreakdown' in e && e.scoreBreakdown);

  return (
    <div className="min-h-screen" style={{ background: '#f5f3ff' }}>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-10">
        <div className="mb-8">
          <p className="text-xs text-violet-400 uppercase tracking-[0.3em] font-bold mb-2">RANKINGS</p>
          <h1 className="text-4xl font-black text-slate-800">글로벌 랭킹</h1>
          <p className="text-slate-500 text-sm mt-1.5">전체 해커톤 참여 기록 기반 · 기간별 필터 지원</p>
        </div>

        {/* 컨트롤 */}
        <div className="flex flex-wrap items-center gap-3 mb-7 p-5 rounded-2xl bg-white border border-violet-100 shadow-sm">
          <div className="flex gap-1.5">
            <button onClick={() => setView('global')}
              className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border transition-all font-semibold ${
                view === 'global'
                  ? 'text-white border-transparent'
                  : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-700'
              }`}
              style={view === 'global' ? { background: 'linear-gradient(135deg, #6d28d9, #4f46e5)' } : {}}>
              <Globe className="w-4 h-4" />글로벌 랭킹
            </button>
            <button onClick={() => setView('hackathon')}
              className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border transition-all font-semibold ${
                view === 'hackathon'
                  ? 'text-white border-transparent'
                  : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-700'
              }`}
              style={view === 'hackathon' ? { background: 'linear-gradient(135deg, #6d28d9, #4f46e5)' } : {}}>
              <Trophy className="w-4 h-4" />해커톤별
            </button>
          </div>

          {view === 'hackathon' && (
            <div className="flex gap-1.5 flex-wrap">
              {HACKATHONS.map((h) => {
                const hasData = !!SEED_LEADERBOARDS[h.slug];
                return (
                  <button key={h.slug} onClick={() => hasData && setSelectedSlug(h.slug)} disabled={!hasData}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                      selectedSlug === h.slug && hasData
                        ? 'bg-violet-100 border-violet-300 text-violet-700 font-semibold'
                        : hasData
                        ? 'bg-slate-50 border-slate-200 text-slate-600 hover:border-violet-200'
                        : 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed'
                    }`}>
                    {h.slug === 'aimers-8-model-lite' ? 'Aimers 8기' : h.slug === 'monthly-vibe-coding-2026-02' ? '바이브코딩' : '인수인계'}
                    {!hasData && ' (집계 중)'}
                  </button>
                );
              })}
            </div>
          )}

          <div className="flex gap-1.5 ml-auto">
            {(['all', '30d', '7d'] as Period[]).map((p) => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                  period === p
                    ? 'bg-violet-100 border-violet-300 text-violet-700 font-semibold'
                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-700'
                }`}>
                {PERIOD_LABELS[p]}
              </button>
            ))}
          </div>
        </div>

        {/* 글로벌 랭킹 뷰 */}
        {view === 'global' && (
          globalRanking.length === 0 ? (
            <EmptyState
              title="선택한 기간에 데이터가 없습니다"
              description="기간을 변경하거나 전체 기간으로 보기를 시도해보세요."
              action={{ label: '전체 기간으로 보기', onClick: () => setPeriod('all') }}
            />
          ) : (
            <div className="bg-white border border-violet-100 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-violet-500" />글로벌 랭킹
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">전체 해커톤 참여 기록 · {globalRanking.length}팀</p>
                </div>
              </div>

              <PodiumGlobal entries={globalRanking} />

              <div className="overflow-x-auto rounded-xl border border-slate-100">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-violet-50 text-slate-500 text-xs uppercase">
                      <th className="py-3 px-4 text-left">순위</th>
                      <th className="py-3 px-4 text-left">팀명</th>
                      <th className="py-3 px-4 text-right">포인트</th>
                      <th className="py-3 px-4 text-left hidden sm:table-cell">참여 해커톤</th>
                      <th className="py-3 px-4 text-right hidden md:table-cell">최근 제출</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {globalRanking.map((team) => (
                      <tr key={team.teamName} className="hover:bg-violet-50/50 transition-colors">
                        <td className="py-3 px-4 text-slate-600 font-medium">{MEDAL[team.rank] ?? `#${team.rank}`}</td>
                        <td className="py-3 px-4 font-semibold text-slate-800">{team.teamName}</td>
                        <td className="py-3 px-4 text-right font-mono text-emerald-600 font-bold">{team.totalPoints.toFixed(1)}pt</td>
                        <td className="py-3 px-4 hidden sm:table-cell">
                          <div className="flex flex-wrap gap-1">
                            {team.hackathons.map((h) => (
                              <Link key={h.slug} href={`/hackathons/${h.slug}`}
                                className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
                                  h.isPending
                                    ? 'bg-slate-50 border-slate-200 text-slate-400'
                                    : 'bg-violet-50 border-violet-200 text-violet-600 hover:border-violet-400'
                                }`}>
                                {h.slug === 'aimers-8-model-lite' ? 'Aimers' : h.slug === 'monthly-vibe-coding-2026-02' ? 'Vibe' : '인수인계'}
                                {h.isPending ? ' (집계중)' : ` ${h.score.toFixed(1)}pt`}
                              </Link>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right text-xs text-slate-400 hidden md:table-cell">
                          {new Date(team.lastSubmitted).toLocaleDateString('ko-KR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-slate-400 mt-3 text-right">* 포인트: 각 해커톤 점수를 100점 기준으로 정규화 후 합산</p>
            </div>
          )
        )}

        {/* 해커톤별 리더보드 뷰 */}
        {view === 'hackathon' && (
          !hackathonLeaderboard ? (
            <EmptyState title="리더보드가 없습니다" description="이 해커톤의 집계 결과가 아직 공개되지 않았습니다." />
          ) : filteredHackathonEntries.length === 0 ? (
            <div className="bg-white border border-violet-100 rounded-2xl p-10 text-center shadow-sm">
              <div className="flex flex-col items-center gap-2 text-slate-400 text-sm">
                <AlertCircle className="w-8 h-8 text-violet-300" />
                <p>선택한 기간에 제출 결과가 없습니다.</p>
                <button onClick={() => setPeriod('all')} className="mt-1 text-xs text-violet-500 underline">
                  전체 기간으로 보기
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-violet-100 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">
                    {HACKATHONS.find((h) => h.slug === selectedSlug)?.title}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    업데이트: {new Date(hackathonLeaderboard.updatedAt).toLocaleString('ko-KR')} · {filteredHackathonEntries.length}팀
                  </p>
                </div>
                <Link href={`/hackathons/${selectedSlug}`}
                  className="text-xs text-violet-500 hover:text-violet-700 underline flex items-center gap-1">
                  상세 보기<ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-100">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-violet-50 text-slate-500 text-xs uppercase">
                      <th className="py-3 px-4 text-left">순위</th>
                      <th className="py-3 px-4 text-left">팀</th>
                      <th className="py-3 px-4 text-right">점수</th>
                      {hasScoreBreakdown && (
                        <>
                          <th className="py-3 px-4 text-right hidden sm:table-cell">참가자(30%)</th>
                          <th className="py-3 px-4 text-right hidden sm:table-cell">심사위원(70%)</th>
                        </>
                      )}
                      <th className="py-3 px-4 text-right hidden md:table-cell">제출일</th>
                      <th className="py-3 px-4 text-right hidden md:table-cell">산출물</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredHackathonEntries.map((e) => {
                      const isPending = 'isPending' in e && e.isPending;
                      return (
                        <tr key={e.rank} className="hover:bg-violet-50/50 transition-colors">
                          <td className="py-3 px-4 text-slate-600">{isPending ? '-' : (MEDAL[e.rank] ?? `#${e.rank}`)}</td>
                          <td className="py-3 px-4 font-semibold text-slate-800">
                            <div className="flex items-center gap-2">
                              {e.teamName}
                              {isPending && (
                                <span className="text-xs text-amber-600 border border-amber-200 bg-amber-50 px-1.5 py-0.5 rounded-full">
                                  집계 예정
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-slate-700">
                            {isPending ? <span className="text-slate-400 text-xs">집계 중</span>
                              : e.score < 2 ? e.score.toFixed(4) : e.score.toFixed(1)}
                          </td>
                          {hasScoreBreakdown && (
                            <>
                              <td className="py-3 px-4 text-right text-slate-500 hidden sm:table-cell">
                                {'scoreBreakdown' in e ? (e.scoreBreakdown?.participant ?? '-') : '-'}
                              </td>
                              <td className="py-3 px-4 text-right text-slate-500 hidden sm:table-cell">
                                {'scoreBreakdown' in e ? (e.scoreBreakdown?.judge ?? '-') : '-'}
                              </td>
                            </>
                          )}
                          <td className="py-3 px-4 text-right text-xs text-slate-400 hidden md:table-cell">
                            {new Date(e.submittedAt).toLocaleDateString('ko-KR')}
                          </td>
                          <td className="py-3 px-4 text-right hidden md:table-cell">
                            {'artifacts' in e && e.artifacts && (
                              <div className="flex items-center justify-end gap-2">
                                {e.artifacts.webUrl && (
                                  <a href={e.artifacts.webUrl} target="_blank" rel="noopener noreferrer"
                                    className="text-xs text-violet-500 hover:text-violet-700 underline">웹</a>
                                )}
                                {e.artifacts.pdfUrl && (
                                  <a href={e.artifacts.pdfUrl} target="_blank" rel="noopener noreferrer"
                                    className="text-xs text-slate-500 hover:text-slate-700 underline">PDF</a>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )
        )}
      </main>
    </div>
  );
}
