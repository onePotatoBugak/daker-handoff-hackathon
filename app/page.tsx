'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trophy, Users, Rocket, ChevronRight, ArrowRight, Zap, Globe, Star } from 'lucide-react';
import Navbar from '@/components/Navbar';
import StatusBadge from '@/components/StatusBadge';
import CountdownTimer from '@/components/CountdownTimer';
import { HACKATHONS, SEED_TEAMS, SEED_LEADERBOARDS } from '@/lib/data';

const FEATURED = HACKATHONS.filter(
  (h) => h.status === 'ongoing' || h.status === 'upcoming'
);

const STATS = [
  { value: String(HACKATHONS.length), label: '해커톤', suffix: '개', gradient: 'from-blue-500 to-blue-600' },
  { value: String(SEED_TEAMS.length), label: '등록 팀', suffix: '개+', gradient: 'from-violet-500 to-purple-600' },
  {
    value: String(Object.values(SEED_LEADERBOARDS).reduce((s, lb) => s + lb.entries.length, 0)),
    label: '제출 기록',
    suffix: '개',
    gradient: 'from-emerald-500 to-teal-600',
  },
];

const NAV_CARDS = [
  {
    title: '해커톤 탐색',
    subtitle: 'HACKATHONS',
    description: '진행 중인 해커톤을 탐색하고 상세 일정, 평가 기준, 상금 내역을 확인하세요.',
    href: '/hackathons',
    icon: <Rocket className="w-10 h-10 text-white" />,
    gradient: 'from-blue-600 via-blue-700 to-indigo-800',
    glow: 'rgba(59,130,246,0.4)',
    border: 'border-blue-500/30',
  },
  {
    title: '팀 빌딩',
    subtitle: 'TEAM FINDER',
    description: '포지션별 팀원을 찾거나 내 팀을 만들어 지원자를 모집하세요.',
    href: '/camp',
    icon: <Users className="w-10 h-10 text-white" />,
    gradient: 'from-violet-600 via-violet-700 to-purple-800',
    glow: 'rgba(139,92,246,0.4)',
    border: 'border-violet-500/30',
  },
  {
    title: '글로벌 랭킹',
    subtitle: 'RANKINGS',
    description: '전체 해커톤 참여 기록 기반 팀 랭킹을 확인하고 상위권에 도전하세요.',
    href: '/rankings',
    icon: <Trophy className="w-10 h-10 text-white" />,
    gradient: 'from-amber-500 via-orange-600 to-red-700',
    glow: 'rgba(245,158,11,0.4)',
    border: 'border-amber-500/30',
  },
];

export default function App() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleMouseMove = (e: MouseEvent) => {
      requestAnimationFrame(() => setMousePos({ x: e.clientX, y: e.clientY }));
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen text-white overflow-x-hidden" style={{ background: '#020817' }}>
      <Navbar />

      {/* 마우스 글로우 */}
      {mounted && (
        <div
          className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-500"
          style={{
            background: `radial-gradient(circle 600px at ${mousePos.x}px ${mousePos.y}px, rgba(99,102,241,0.06) 0%, transparent 70%)`,
          }}
        />
      )}

      {/* 배경 그라디언트 오브 */}
      <div className="absolute top-0 left-1/4 w-[800px] h-[600px] bg-blue-700/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-[600px] h-[500px] bg-violet-700/5 rounded-full blur-[120px] pointer-events-none" />

      {/* ── 히어로 섹션 ── */}
      <section className="relative z-10 pt-20 pb-16 px-4">
        <div className="max-w-5xl mx-auto text-center">

          {/* 배지 */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold tracking-wider mb-8">
            <Zap className="w-3.5 h-3.5" />
            <span>HACKATHON PLATFORM</span>
          </div>

          {/* 헤드라인 */}
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-[1.05]">
            <span className="text-white">해커톤을</span>
            <br />
            <span
              className="inline-block"
              style={{
                background: 'linear-gradient(135deg, #60a5fa 0%, #818cf8 50%, #a78bfa 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              제대로 경험하다
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10">
            문서만 남기고 사라진 서비스를 우리 손으로 다시 완성했습니다.
            <br className="hidden md:block" />
            해커톤 탐색 · 팀 빌딩 · 결과 확인까지 끊기지 않는 흐름.
          </p>

          {/* CTA 버튼 */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-16">
            <Link
              href="/hackathons"
              className="flex items-center gap-2 px-7 py-3.5 rounded-2xl font-semibold text-sm text-white transition-all duration-200 hover:scale-105 hover:shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #7c3aed)',
                boxShadow: '0 0 20px rgba(99,102,241,0.3)',
              }}
            >
              해커톤 보기
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/camp"
              className="flex items-center gap-2 px-7 py-3.5 rounded-2xl font-semibold text-sm text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition-all duration-200 hover:scale-105"
            >
              팀 찾기
              <Users className="w-4 h-4" />
            </Link>
          </div>

          {/* 통계 */}
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="relative overflow-hidden rounded-2xl border border-slate-800 p-5"
                style={{ background: 'rgba(15,23,42,0.8)' }}
              >
                <div className={`absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r ${stat.gradient}`} />
                <div className="flex items-center justify-center gap-1 mb-1">
                  <span className="text-3xl font-black text-white">{stat.value}</span>
                  <span className="text-lg font-bold text-slate-400">{stat.suffix}</span>
                </div>
                <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 네비게이션 카드 ── */}
      <section className="relative z-10 py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs text-slate-500 uppercase tracking-[0.3em] font-semibold mb-2">EXPLORE</p>
            <h2 className="text-3xl font-black text-white">무엇을 원하시나요?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {NAV_CARDS.map((card) => (
              <Link key={card.href} href={card.href} className="group">
                <div
                  className={`relative h-full overflow-hidden rounded-2xl border ${card.border} p-6 transition-all duration-300 hover:scale-[1.02]`}
                  style={{
                    background: 'rgba(15, 23, 42, 0.9)',
                    boxShadow: `0 0 0 1px rgba(255,255,255,0.05)`,
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 40px ${card.glow}, 0 0 0 1px rgba(255,255,255,0.05)`;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow = `0 0 0 1px rgba(255,255,255,0.05)`;
                  }}
                >
                  {/* 배경 그라디언트 */}
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${card.gradient} opacity-5 rounded-full blur-2xl group-hover:opacity-15 transition-opacity duration-500`} />

                  {/* 아이콘 */}
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {card.icon}
                  </div>

                  <p className="text-[10px] font-bold tracking-[0.2em] text-slate-500 mb-1">{card.subtitle}</p>
                  <h3 className="text-xl font-black text-white mb-3">{card.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed mb-5">{card.description}</p>

                  <div className="flex items-center gap-1.5 text-sm font-semibold"
                    style={{ color: 'rgb(147,197,253)' }}
                  >
                    바로가기
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 주목할 해커톤 ── */}
      {FEATURED.length > 0 && (
        <section className="relative z-10 py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-[0.3em] font-semibold mb-2">LIVE NOW</p>
                <h2 className="text-3xl font-black text-white">지금 주목할 해커톤</h2>
              </div>
              <Link
                href="/hackathons"
                className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors font-medium"
              >
                전체 보기
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {FEATURED.map((h) => (
                <Link key={h.slug} href={`/hackathons/${h.slug}`} className="group">
                  <div
                    className="relative overflow-hidden rounded-2xl border border-slate-800 p-6 transition-all duration-300 hover:border-slate-600 group-hover:translate-y-[-2px]"
                    style={{ background: 'rgba(15,23,42,0.8)' }}
                  >
                    {/* 상단 액센트 라인 */}
                    <div className={`absolute top-0 left-0 w-full h-0.5 ${
                      h.status === 'ongoing'
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                        : 'bg-gradient-to-r from-blue-500 to-violet-500'
                    }`} />

                    <div className="flex items-start justify-between mb-4">
                      <StatusBadge status={h.status} />
                      <CountdownTimer deadline={h.period.submissionDeadlineAt} label="제출 마감" />
                    </div>

                    <h3 className="text-base font-bold text-white mb-3 leading-snug group-hover:text-blue-200 transition-colors">
                      {h.title}
                    </h3>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {h.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2.5 py-1 rounded-full font-medium"
                          style={{ background: 'rgba(59,130,246,0.1)', color: '#93c5fd', border: '1px solid rgba(59,130,246,0.2)' }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                      <span className="text-xs text-slate-500">
                        마감 {new Date(h.period.submissionDeadlineAt).toLocaleDateString('ko-KR')}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-400 group-hover:text-blue-300 transition-colors">
                        자세히 보기
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Feature 하이라이트 ── */}
      <section className="relative z-10 py-16 px-4 mb-8">
        <div className="max-w-5xl mx-auto">
          <div
            className="relative overflow-hidden rounded-3xl p-10 md:p-14 text-center border border-slate-800"
            style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.06) 0%, rgba(139,92,246,0.06) 50%, rgba(16,185,129,0.04) 100%)' }}
          >
            {/* 배경 오브 */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 bg-violet-600/8 rounded-full blur-3xl pointer-events-none" />

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold mb-6">
              <Star className="w-3 h-3" />
              인수인계 해커톤 참가 중
            </div>

            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              명세서만 보고 구현하라
            </h2>
            <p className="text-slate-400 text-base max-w-xl mx-auto mb-8 leading-relaxed">
              사라진 개발자가 남긴 문서를 기반으로 웹서비스를 완성하는 해커톤.<br/>
              지금 바로 도전하고 리더보드에 이름을 올리세요.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                href="/hackathons/daker-handover-2026-03"
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white transition-all hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', boxShadow: '0 0 20px rgba(124,58,237,0.3)' }}
              >
                <Globe className="w-4 h-4" />
                해커톤 상세 보기
              </Link>
              <Link
                href="/camp?hackathon=daker-handover-2026-03"
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all hover:scale-105"
              >
                <Users className="w-4 h-4" />
                팀원 찾기
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
