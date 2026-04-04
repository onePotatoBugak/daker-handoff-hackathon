'use client';
import React from 'react';
import Link from 'next/link';
import { Trophy, Users, Rocket, ChevronRight, ArrowRight, Zap, Globe, Star } from 'lucide-react';
import Navbar from '@/components/Navbar';
import StatusBadge from '@/components/StatusBadge';
import CountdownTimer from '@/components/CountdownTimer';
import { HACKATHONS, SEED_TEAMS, SEED_LEADERBOARDS } from '@/lib/data';

const FEATURED = HACKATHONS.filter((h) => h.status === 'ongoing' || h.status === 'upcoming');

const STATS = [
  { value: String(HACKATHONS.length), label: '해커톤', suffix: '개' },
  { value: String(SEED_TEAMS.length), label: '등록 팀', suffix: '개+' },
  { value: String(Object.values(SEED_LEADERBOARDS).reduce((s, lb) => s + lb.entries.length, 0)), label: '제출 기록', suffix: '개' },
];

const NAV_CARDS = [
  {
    title: '해커톤 탐색',
    description: '진행 중인 해커톤을 탐색하고 상세 일정, 평가 기준, 상금 내역을 확인하세요.',
    href: '/hackathons',
    icon: <Rocket className="w-7 h-7 text-white" />,
    bg: 'linear-gradient(135deg, #6d28d9, #4f46e5)',
    shadow: 'rgba(109,40,217,0.3)',
  },
  {
    title: '팀 빌딩',
    description: '포지션별 팀원을 찾거나 내 팀을 만들어 지원자를 모집하세요.',
    href: '/camp',
    icon: <Users className="w-7 h-7 text-white" />,
    bg: 'linear-gradient(135deg, #2563eb, #7c3aed)',
    shadow: 'rgba(37,99,235,0.3)',
  },
  {
    title: '글로벌 랭킹',
    description: '전체 해커톤 참여 기록 기반 팀 랭킹을 확인하고 상위권에 도전하세요.',
    href: '/rankings',
    icon: <Trophy className="w-7 h-7 text-white" />,
    bg: 'linear-gradient(135deg, #db2777, #9333ea)',
    shadow: 'rgba(219,39,119,0.3)',
  },
];

export default function App() {
  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: '#f5f3ff' }}>
      <Navbar />

      {/* ── 히어로: 상단 그라디언트 + 비눗방울 ── */}
      <section
        className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #4c1d95 0%, #5b21b6 20%, #4338ca 45%, #2563eb 70%, #0ea5e9 100%)',
          minHeight: '480px',
        }}
      >
        {/* 비눗방울 구체들 */}
        <div className="blob1 absolute top-8 right-16 w-44 h-44 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.85) 0%, rgba(216,180,254,0.7) 30%, rgba(139,92,246,0.85) 60%, rgba(59,130,246,0.9) 100%)',
            boxShadow: '0 8px 40px rgba(109,40,217,0.35), inset -8px -8px 20px rgba(0,0,0,0.15)',
          }} />
        <div className="blob2 absolute top-28 right-48 w-24 h-24 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.9) 0%, rgba(252,211,77,0.6) 25%, rgba(236,72,153,0.8) 55%, rgba(239,68,68,0.85) 100%)',
            boxShadow: '0 6px 30px rgba(236,72,153,0.35), inset -6px -6px 14px rgba(0,0,0,0.12)',
          }} />
        <div className="blob3 absolute bottom-8 left-16 w-32 h-32 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.85) 0%, rgba(167,243,208,0.65) 30%, rgba(16,185,129,0.8) 60%, rgba(5,150,105,0.9) 100%)',
            boxShadow: '0 6px 30px rgba(16,185,129,0.3), inset -6px -6px 14px rgba(0,0,0,0.12)',
          }} />
        <div className="blob4 absolute top-16 left-1/3 w-16 h-16 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.9) 0%, rgba(186,230,253,0.7) 30%, rgba(56,189,248,0.85) 60%, rgba(2,132,199,0.9) 100%)',
            boxShadow: '0 4px 20px rgba(56,189,248,0.3), inset -4px -4px 10px rgba(0,0,0,0.1)',
          }} />
        <div className="blob5 absolute bottom-16 right-1/4 w-20 h-20 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.88) 0%, rgba(253,186,116,0.65) 30%, rgba(249,115,22,0.8) 60%, rgba(234,88,12,0.9) 100%)',
            boxShadow: '0 5px 24px rgba(249,115,22,0.3), inset -5px -5px 12px rgba(0,0,0,0.12)',
          }} />

        {/* 배경 광채 */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)' }} />

        {/* 히어로 텍스트 */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 pt-16 pb-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-white/80 text-xs font-semibold tracking-wider mb-7"
            style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)' }}>
            <Zap className="w-3.5 h-3.5" />
            <span>HACKATHON PLATFORM</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-black tracking-tight text-white mb-5 leading-tight">
            해커톤을<br />
            <span style={{
              background: 'linear-gradient(135deg, #e9d5ff 0%, #c7d2fe 50%, #bae6fd 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>제대로 경험하다</span>
          </h1>

          <p className="text-white/70 text-base md:text-lg max-w-xl mx-auto leading-relaxed mb-10">
            문서만 남기고 사라진 서비스를 우리 손으로 다시 완성했습니다.<br className="hidden md:block" />
            해커톤 탐색 · 팀 빌딩 · 결과 확인까지 끊기지 않는 흐름.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/hackathons"
              className="flex items-center gap-2 px-7 py-3 rounded-2xl font-bold text-sm text-violet-800 transition-all hover:scale-105 hover:shadow-xl"
              style={{ background: 'rgba(255,255,255,0.95)', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
              해커톤 보기
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/camp"
              className="flex items-center gap-2 px-7 py-3 rounded-2xl font-bold text-sm text-white transition-all hover:scale-105"
              style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', backdropFilter: 'blur(8px)' }}>
              팀 찾기
              <Users className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 통계 배너 ── */}
      <div className="relative z-10 max-w-3xl mx-auto px-4 -mt-8">
        <div className="grid grid-cols-3 gap-3 rounded-2xl p-5 shadow-xl"
          style={{ background: '#fff', border: '1px solid #ede9fe' }}>
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="flex items-baseline justify-center gap-0.5">
                <span className="text-3xl font-black text-violet-700">{stat.value}</span>
                <span className="text-sm font-bold text-violet-400">{stat.suffix}</span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── 네비게이션 카드 ── */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs text-violet-400 uppercase tracking-[0.3em] font-bold mb-2">EXPLORE</p>
            <h2 className="text-3xl font-black text-slate-800">무엇을 원하시나요?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {NAV_CARDS.map((card) => (
              <Link key={card.href} href={card.href} className="group">
                <div className="light-card h-full p-6 flex flex-col">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300"
                    style={{ background: card.bg, boxShadow: `0 4px 16px ${card.shadow}` }}>
                    {card.icon}
                  </div>
                  <h3 className="text-lg font-black text-slate-800 mb-2">{card.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed flex-1 mb-4">{card.description}</p>
                  <div className="flex items-center gap-1 text-sm font-semibold text-violet-600">
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
        <section className="py-4 pb-16 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-xs text-violet-400 uppercase tracking-[0.3em] font-bold mb-2">LIVE NOW</p>
                <h2 className="text-3xl font-black text-slate-800">지금 주목할 해커톤</h2>
              </div>
              <Link href="/hackathons"
                className="flex items-center gap-1 text-sm text-violet-600 hover:text-violet-700 font-semibold transition-colors">
                전체 보기 <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {FEATURED.map((h) => (
                <Link key={h.slug} href={`/hackathons/${h.slug}`} className="group">
                  <div className="light-card p-6 relative overflow-hidden">
                    <div className={`absolute top-0 left-0 w-full h-1 rounded-t-xl ${
                      h.status === 'ongoing'
                        ? 'bg-gradient-to-r from-emerald-400 to-teal-400'
                        : 'bg-gradient-to-r from-violet-500 to-blue-500'
                    }`} />
                    <div className="flex items-start justify-between mb-3 mt-1">
                      <StatusBadge status={h.status} />
                      <CountdownTimer deadline={h.period.submissionDeadlineAt} label="제출 마감" />
                    </div>
                    <h3 className="text-base font-bold text-slate-800 mb-3 leading-snug group-hover:text-violet-700 transition-colors">
                      {h.title}
                    </h3>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {h.tags.map((tag) => (
                        <span key={tag} className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-violet-50 text-violet-600 border border-violet-100">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <span className="text-xs text-slate-400">
                        마감 {new Date(h.period.submissionDeadlineAt).toLocaleDateString('ko-KR')}
                      </span>
                      <span className="flex items-center gap-1 text-xs font-semibold text-violet-500 group-hover:text-violet-700 transition-colors">
                        자세히 보기 <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA 배너 ── */}
      <section className="py-4 pb-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl p-10 md:p-14 text-center"
            style={{
              background: 'linear-gradient(135deg, #4c1d95 0%, #5b21b6 30%, #4338ca 65%, #2563eb 100%)',
            }}>
            {/* 배경 비눗방울 */}
            <div className="blob1 absolute top-4 right-8 w-28 h-28 rounded-full pointer-events-none"
              style={{
                background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.8) 0%, rgba(216,180,254,0.6) 35%, rgba(139,92,246,0.75) 65%, rgba(59,130,246,0.85) 100%)',
                boxShadow: 'inset -5px -5px 12px rgba(0,0,0,0.1)',
              }} />
            <div className="blob3 absolute bottom-4 left-10 w-20 h-20 rounded-full pointer-events-none"
              style={{
                background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.8) 0%, rgba(167,243,208,0.6) 35%, rgba(16,185,129,0.75) 65%, rgba(5,150,105,0.85) 100%)',
                boxShadow: 'inset -4px -4px 10px rgba(0,0,0,0.1)',
              }} />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-white/80 text-xs font-semibold mb-5"
                style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)' }}>
                <Star className="w-3 h-3" /> 인수인계 해커톤 참가 중
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4">명세서만 보고 구현하라</h2>
              <p className="text-white/70 text-base max-w-xl mx-auto mb-8 leading-relaxed">
                사라진 개발자가 남긴 문서를 기반으로 웹서비스를 완성하는 해커톤.<br />
                지금 바로 도전하고 리더보드에 이름을 올리세요.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link href="/hackathons/daker-handover-2026-03"
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-violet-800 transition-all hover:scale-105 hover:shadow-xl"
                  style={{ background: 'rgba(255,255,255,0.95)' }}>
                  <Globe className="w-4 h-4" /> 해커톤 상세 보기
                </Link>
                <Link href="/camp?hackathon=daker-handover-2026-03"
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white transition-all hover:scale-105"
                  style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)' }}>
                  <Users className="w-4 h-4" /> 팀원 찾기
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
