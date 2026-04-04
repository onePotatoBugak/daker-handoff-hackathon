'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Filter, SortAsc, Users } from 'lucide-react';
import Navbar from '@/components/Navbar';
import StatusBadge from '@/components/StatusBadge';
import CountdownTimer from '@/components/CountdownTimer';
import EmptyState from '@/components/EmptyState';
import { HACKATHONS } from '@/lib/data';
import { getTeams } from '@/lib/storage';
import type { HackathonStatus, Team } from '@/lib/types';

type SortKey = 'deadline' | 'newest' | 'enddate';

const ALL_TAGS = Array.from(new Set(HACKATHONS.flatMap((h) => h.tags)));

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
      if (sort === 'newest') {
        return (
          new Date(b.period.submissionDeadlineAt).getTime() -
          new Date(a.period.submissionDeadlineAt).getTime()
        );
      }
      if (sort === 'enddate') {
        return (
          new Date(a.period.endAt).getTime() - new Date(b.period.endAt).getTime()
        );
      }
      // deadline: 마감임박순 (가장 빨리 끝나는 것 먼저)
      return (
        new Date(a.period.submissionDeadlineAt).getTime() -
        new Date(b.period.submissionDeadlineAt).getTime()
      );
    });
  }, [statusFilter, tagFilter, sort]);

  const hasActiveFilter = statusFilter !== 'all' || tagFilter !== 'all';

  function resetFilters() {
    setStatusFilter('all');
    setTagFilter('all');
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-1">해커톤 목록</h1>
          <p className="text-slate-400 text-sm">
            총 {HACKATHONS.length}개 해커톤 · 조건에 맞는 {filtered.length}개 표시 중
          </p>
        </div>

        {/* Filter & Sort Bar */}
        <div className="flex flex-wrap items-center gap-3 mb-6 p-4 bg-slate-900 rounded-xl border border-slate-800">
          <div className="flex items-center gap-1.5 text-slate-400 text-sm">
            <Filter className="w-4 h-4" />
            <span>필터</span>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as HackathonStatus | 'all')}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 cursor-pointer focus:outline-none focus:border-slate-500"
          >
            <option value="all">전체 상태</option>
            <option value="ongoing">진행중</option>
            <option value="upcoming">예정</option>
            <option value="ended">종료</option>
          </select>

          <select
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 cursor-pointer focus:outline-none focus:border-slate-500"
          >
            <option value="all">전체 태그</option>
            {ALL_TAGS.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1.5 text-slate-400 text-sm ml-auto">
            <SortAsc className="w-4 h-4" />
            <span>정렬</span>
          </div>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 cursor-pointer focus:outline-none focus:border-slate-500"
          >
            <option value="deadline">마감임박순</option>
            <option value="newest">최신순</option>
            <option value="enddate">종료일순</option>
          </select>

          {hasActiveFilter && (
            <button
              onClick={resetFilters}
              className="text-xs text-slate-400 underline underline-offset-2 hover:text-slate-200 transition-colors"
            >
              필터 초기화
            </button>
          )}
        </div>

        {/* Results */}
        {filtered.length === 0 ? (
          <EmptyState
            title="조건에 맞는 해커톤이 없습니다"
            description="다른 상태나 태그를 선택하거나 필터를 초기화해보세요."
            action={{ label: '필터 초기화', onClick: resetFilters }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((h) => (
              <Link key={h.slug} href={`/hackathons/${h.slug}`}>
                <article className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-600 hover:bg-slate-800/70 transition-all h-full flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <StatusBadge status={h.status} />
                    {h.status !== 'ended' && (
                      <CountdownTimer
                        deadline={h.period.submissionDeadlineAt}
                        label="제출 마감"
                      />
                    )}
                  </div>

                  <h2 className="text-base font-semibold text-white mb-3 leading-snug flex-1">
                    {h.title}
                  </h2>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {h.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-slate-800 border border-slate-700 text-xs px-2 py-0.5 rounded-full text-slate-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="text-xs text-slate-500 space-y-1 border-t border-slate-800 pt-3">
                    <div className="flex justify-between">
                      <span>제출 마감</span>
                      <span className="text-slate-400">
                        {new Date(h.period.submissionDeadlineAt).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>대회 종료</span>
                      <span className="text-slate-400">
                        {new Date(h.period.endAt).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                    {getTeamCount(h.slug) > 0 && (
                      <div className="flex items-center justify-between pt-1">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          참여 팀
                        </span>
                        <span className="text-slate-300 font-medium">
                          {getTeamCount(h.slug)}팀
                        </span>
                      </div>
                    )}
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
