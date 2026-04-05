'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Users, ArrowRight, Tag, Clock } from 'lucide-react';
import Navbar from '@/components/Navbar';
import StatusBadge from '@/components/StatusBadge';
import CountdownTimer from '@/components/CountdownTimer';
import EmptyState from '@/components/EmptyState';
import { SkeletonList } from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';
import { fetchHackathons } from '@/lib/api';
import { getTeams } from '@/lib/storage';
import { useAsync } from '@/hooks/useAsync';
import type { HackathonStatus, Team } from '@/lib/types';

type SortKey = 'deadline' | 'newest' | 'enddate';

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'deadline', label: '마감임박순' },
  { value: 'newest', label: '최신순' },
  { value: 'enddate', label: '종료일순' },
];

const STATUS_OPTIONS: { value: HackathonStatus | 'all'; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'ongoing', label: '진행중' },
  { value: 'upcoming', label: '예정' },
  { value: 'ended', label: '종료' },
];

export default function HackathonsPage() {
  const { data: hackathons, loading, error, retry } = useAsync(fetchHackathons);
  const [statusFilter, setStatusFilter] = useState<HackathonStatus | 'all'>('all');
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [sort, setSort] = useState<SortKey>('deadline');
  const [allTeams] = useState<Team[]>(() => getTeams());

  function getTeamCount(slug: string) {
    return allTeams.filter((t) => t.hackathonSlug === slug).length;
  }

  const allTags = useMemo(
    () => Array.from(new Set((hackathons ?? []).flatMap((h) => h.tags))),
    [hackathons],
  );

  const filtered = useMemo(() => {
    let result = hackathons ?? [];
    if (statusFilter !== 'all') result = result.filter((h) => h.status === statusFilter);
    if (tagFilter !== 'all') result = result.filter((h) => h.tags.includes(tagFilter));
    // 마감임박순은 "아직 마감 전" 맥락 — 종료 상태는 제외(단, 상태 필터가 종료일 때는 그대로)
    if (sort === 'deadline' && statusFilter !== 'ended') {
      result = result.filter((h) => h.status !== 'ended');
    }
    return [...result].sort((a, b) => {
      if (sort === 'newest') return new Date(b.period.submissionDeadlineAt).getTime() - new Date(a.period.submissionDeadlineAt).getTime();
      if (sort === 'enddate') return new Date(a.period.endAt).getTime() - new Date(b.period.endAt).getTime();
      return new Date(a.period.submissionDeadlineAt).getTime() - new Date(b.period.submissionDeadlineAt).getTime();
    });
  }, [hackathons, statusFilter, tagFilter, sort]);

  const hasActiveFilter = statusFilter !== 'all' || tagFilter !== 'all';

  function resetFilters() {
    setStatusFilter('all');
    setTagFilter('all');
  }

  return (
    <div className="min-h-screen" style={{ background: '#f5f3ff' }}>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-10">

        {/* 헤더 */}
        <div className="mb-8">
          <p className="text-xs text-violet-400 uppercase tracking-[0.3em] font-bold mb-2">HACKATHONS</p>
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-4xl font-black text-slate-800">해커톤 목록</h1>
              <p className="text-slate-500 text-sm mt-1.5">
                총 <span className="text-violet-700 font-semibold">{hackathons?.length ?? '-'}개</span> 해커톤 ·
                조건에 맞는 <span className="text-violet-700 font-semibold">{loading ? '-' : filtered.length}개</span> 표시 중
              </p>
            </div>
          </div>
        </div>

        {/* 필터 & 정렬 */}
        <div className="rounded-2xl bg-white border border-violet-100 p-5 mb-7 shadow-sm">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">상태</span>
              <div className="flex gap-1.5">
                {STATUS_OPTIONS.map(({ value, label }) => (
                  <button key={value} onClick={() => setStatusFilter(value)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
                    style={statusFilter === value
                      ? { background: 'linear-gradient(135deg, #6d28d9, #4f46e5)', color: '#fff' }
                      : { background: '#f5f3ff', color: '#64748b', border: '1px solid #e2e8f0' }
                    }>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                <Tag className="w-3 h-3" />태그
              </span>
              <select value={tagFilter} onChange={(e) => setTagFilter(e.target.value)}
                className="text-xs px-3 py-1.5 rounded-lg focus:outline-none"
                style={{ background: '#f5f3ff', color: '#64748b', border: '1px solid #e2e8f0' }}>
                <option value="all">전체 태그</option>
                {allTags.map((tag) => <option key={tag} value={tag}>{tag}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">정렬</span>
              <div className="flex gap-1.5">
                {SORT_OPTIONS.map(({ value, label }) => (
                  <button key={value} onClick={() => setSort(value)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
                    style={sort === value
                      ? { background: 'rgba(109,40,217,0.1)', color: '#6d28d9', border: '1px solid rgba(109,40,217,0.25)' }
                      : { background: '#f5f3ff', color: '#94a3b8', border: '1px solid #e2e8f0' }
                    }>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {hasActiveFilter && (
              <button onClick={resetFilters}
                className="text-xs text-violet-500 hover:text-violet-700 underline underline-offset-2 transition-colors">
                초기화
              </button>
            )}
          </div>
        </div>

        {/* 결과 */}
        {loading ? (
          <SkeletonList count={3} />
        ) : error ? (
          <ErrorState
            description="해커톤 목록을 불러오는 중 오류가 발생했습니다."
            onRetry={retry}
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="조건에 맞는 해커톤이 없습니다"
            description="다른 상태나 태그를 선택하거나 필터를 초기화해보세요."
            action={{ label: '필터 초기화', onClick: resetFilters }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((h) => {
              const teamCount = getTeamCount(h.slug);
              return (
                <Link key={h.slug} href={`/hackathons/${h.slug}`} className="group">
                  <article className="light-card relative overflow-hidden p-5 h-full flex flex-col">
                    <div className={`absolute top-0 left-0 w-full h-1 rounded-t-xl ${
                      h.status === 'ongoing' ? 'bg-gradient-to-r from-emerald-400 to-teal-400' :
                      h.status === 'upcoming' ? 'bg-gradient-to-r from-violet-500 to-blue-500' :
                      'bg-gradient-to-r from-slate-200 to-slate-300'
                    }`} />

                    <div className="flex items-center justify-between mt-1 mb-3">
                      <StatusBadge status={h.status} />
                      {h.status !== 'ended' && <CountdownTimer deadline={h.period.submissionDeadlineAt} />}
                    </div>

                    <h2 className="text-[15px] font-bold text-slate-800 mb-3 leading-snug flex-1 group-hover:text-violet-700 transition-colors">
                      {h.title}
                    </h2>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {h.tags.map((tag) => (
                        <span key={tag} className="text-[11px] px-2.5 py-0.5 rounded-full font-medium bg-violet-50 text-violet-600 border border-violet-100">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="space-y-1.5 pt-3 border-t border-slate-100">
                      <div className="flex justify-between items-center text-xs">
                        <span className="flex items-center gap-1 text-slate-400">
                          <Clock className="w-3 h-3" />제출 마감
                        </span>
                        <span className="text-slate-600 font-medium">
                          {new Date(h.period.submissionDeadlineAt).toLocaleDateString('ko-KR')}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">대회 종료</span>
                        <span className="text-slate-500">{new Date(h.period.endAt).toLocaleDateString('ko-KR')}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs pt-1">
                        <span className="flex items-center gap-1 text-slate-400">
                          <Users className="w-3 h-3" />참여 팀
                        </span>
                        <span className={teamCount > 0 ? 'text-emerald-600 font-semibold' : 'text-slate-400 font-medium'}>
                          {teamCount}팀
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end mt-3 pt-2">
                      <span className="flex items-center gap-1 text-xs font-semibold text-violet-400 group-hover:text-violet-600 transition-colors">
                        자세히
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}