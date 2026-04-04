'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { SlidersHorizontal, Users, ArrowRight, Tag, Clock } from 'lucide-react';
import Navbar from '@/components/Navbar';
import StatusBadge from '@/components/StatusBadge';
import CountdownTimer from '@/components/CountdownTimer';
import EmptyState from '@/components/EmptyState';
import { HACKATHONS } from '@/lib/data';
import { getTeams } from '@/lib/storage';
import type { HackathonStatus, Team } from '@/lib/types';

type SortKey = 'deadline' | 'newest' | 'enddate';

const ALL_TAGS = Array.from(new Set(HACKATHONS.flatMap((h) => h.tags)));

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
  const [statusFilter, setStatusFilter] = useState<HackathonStatus | 'all'>('all');
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [sort, setSort] = useState<SortKey>('deadline');
  const [allTeams, setAllTeams] = useState<Team[]>([]);

  useEffect(() => {
    setAllTeams(getTeams());
  }, []);

  function getTeamCount(slug: string) {
    return allTeams.filter((t) => t.hackathonSlug === slug).length;
  }

  const filtered = useMemo(() => {
    let result = HACKATHONS;
    if (statusFilter !== 'all') result = result.filter((h) => h.status === statusFilter);
    if (tagFilter !== 'all') result = result.filter((h) => h.tags.includes(tagFilter));
    return [...result].sort((a, b) => {
      if (sort === 'newest') return new Date(b.period.submissionDeadlineAt).getTime() - new Date(a.period.submissionDeadlineAt).getTime();
      if (sort === 'enddate') return new Date(a.period.endAt).getTime() - new Date(b.period.endAt).getTime();
      return new Date(a.period.submissionDeadlineAt).getTime() - new Date(b.period.submissionDeadlineAt).getTime();
    });
  }, [statusFilter, tagFilter, sort]);

  const hasActiveFilter = statusFilter !== 'all' || tagFilter !== 'all';

  function resetFilters() {
    setStatusFilter('all');
    setTagFilter('all');
  }

  return (
    <div className="min-h-screen text-white" style={{ background: '#020817' }}>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-10">

        {/* 헤더 */}
        <div className="mb-8">
          <p className="text-xs text-slate-500 uppercase tracking-[0.3em] font-semibold mb-2">HACKATHONS</p>
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-4xl font-black text-white">해커톤 목록</h1>
              <p className="text-slate-400 text-sm mt-1.5">
                총 <span className="text-white font-semibold">{HACKATHONS.length}개</span> 해커톤 ·
                조건에 맞는 <span className="text-white font-semibold">{filtered.length}개</span> 표시 중
              </p>
            </div>
          </div>
        </div>

        {/* 필터 & 정렬 */}
        <div
          className="rounded-2xl border border-slate-800 p-5 mb-7"
          style={{ background: 'rgba(15,23,42,0.8)' }}
        >
          <div className="flex flex-wrap gap-4 items-center">
            {/* 상태 필터 - pill 형태 */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">상태</span>
              <div className="flex gap-1.5">
                {STATUS_OPTIONS.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setStatusFilter(value)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
                    style={
                      statusFilter === value
                        ? { background: 'linear-gradient(135deg, #3b82f6, #7c3aed)', color: '#fff' }
                        : { background: 'rgba(30,41,59,0.8)', color: '#94a3b8', border: '1px solid rgba(51,65,85,0.8)' }
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* 태그 필터 */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1">
                <Tag className="w-3 h-3" />태그
              </span>
              <select
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value)}
                className="text-xs px-3 py-1.5 rounded-lg transition-all focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                style={{ background: 'rgba(30,41,59,0.8)', color: '#94a3b8', border: '1px solid rgba(51,65,85,0.8)' }}
              >
                <option value="all">전체 태그</option>
                {ALL_TAGS.map((tag) => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>

            {/* 정렬 */}
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">정렬</span>
              <div className="flex gap-1.5">
                {SORT_OPTIONS.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setSort(value)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
                    style={
                      sort === value
                        ? { background: 'rgba(59,130,246,0.2)', color: '#93c5fd', border: '1px solid rgba(59,130,246,0.3)' }
                        : { background: 'rgba(30,41,59,0.8)', color: '#64748b', border: '1px solid rgba(51,65,85,0.8)' }
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {hasActiveFilter && (
              <button
                onClick={resetFilters}
                className="text-xs text-slate-500 hover:text-slate-300 underline underline-offset-2 transition-colors"
              >
                초기화
              </button>
            )}
          </div>
        </div>

        {/* 결과 */}
        {filtered.length === 0 ? (
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
                  <article
                    className="relative overflow-hidden rounded-2xl border border-slate-800 p-5 transition-all duration-300 hover:border-slate-600 group-hover:translate-y-[-2px] h-full flex flex-col"
                    style={{ background: 'rgba(15,23,42,0.9)' }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 30px rgba(0,0,0,0.4)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                    }}
                  >
                    {/* 상단 상태 라인 */}
                    <div className={`absolute top-0 left-0 w-full h-0.5 ${
                      h.status === 'ongoing' ? 'bg-gradient-to-r from-emerald-500 to-teal-400' :
                      h.status === 'upcoming' ? 'bg-gradient-to-r from-blue-500 to-violet-500' :
                      'bg-gradient-to-r from-slate-700 to-slate-600'
                    }`} />

                    <div className="flex items-center justify-between mb-3">
                      <StatusBadge status={h.status} />
                      {h.status !== 'ended' && (
                        <CountdownTimer deadline={h.period.submissionDeadlineAt} />
                      )}
                    </div>

                    <h2 className="text-[15px] font-bold text-white mb-3 leading-snug flex-1 group-hover:text-blue-100 transition-colors">
                      {h.title}
                    </h2>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {h.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[11px] px-2.5 py-0.5 rounded-full font-medium"
                          style={{ background: 'rgba(30,41,59,0.9)', color: '#94a3b8', border: '1px solid rgba(51,65,85,0.7)' }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="space-y-1.5 pt-3 border-t border-slate-800/80">
                      <div className="flex justify-between items-center text-xs">
                        <span className="flex items-center gap-1 text-slate-500">
                          <Clock className="w-3 h-3" />제출 마감
                        </span>
                        <span className="text-slate-300 font-medium">
                          {new Date(h.period.submissionDeadlineAt).toLocaleDateString('ko-KR')}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500">대회 종료</span>
                        <span className="text-slate-400">
                          {new Date(h.period.endAt).toLocaleDateString('ko-KR')}
                        </span>
                      </div>
                      {teamCount > 0 && (
                        <div className="flex justify-between items-center text-xs pt-1">
                          <span className="flex items-center gap-1 text-slate-500">
                            <Users className="w-3 h-3" />참여 팀
                          </span>
                          <span className="text-emerald-400 font-semibold">{teamCount}팀</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-end mt-3 pt-2">
                      <span className="flex items-center gap-1 text-xs text-slate-500 group-hover:text-blue-300 transition-colors">
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
