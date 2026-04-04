'use client';
import React from 'react';
import Link from 'next/link';
import { Trophy, Users, Rocket, ChevronRight, ArrowRight, Star } from 'lucide-react';
import Navbar from '@/components/Navbar';
import StatusBadge from '@/components/StatusBadge';
import CountdownTimer from '@/components/CountdownTimer';
import { HACKATHONS, SEED_TEAMS, SEED_LEADERBOARDS } from '@/lib/data';

const FEATURED = HACKATHONS.filter((h) => h.status === 'ongoing' || h.status === 'upcoming');

const STATS = [
  { value: String(HACKATHONS.length), label: '해커톤', suffix: '개' },
  { value: String(SEED_TEAMS.length), label: '등록 팀', suffix: '개+' },
  {
    value: String(Object.values(SEED_LEADERBOARDS).reduce((s, lb) => s + lb.entries.length, 0)),
    label: '제출 기록',
    suffix: '개',
  },
];

const NAV_CARDS = [
  {
    title: '해커톤 탐색',
    description: '진행 중인 해커톤을 탐색하고 상세 일정, 평가 기준, 상금 내역을 확인하세요.',
    href: '/hackathons',
    icon: <Rocket className="w-6 h-6" />,
    color: '#7c3aed',
    bg: 'rgba(124,58,237,0.08)',
    border: 'rgba(124,58,237,0.2)',
  },
  {
    title: '팀 빌딩',
    description: '포지션별 팀원을 찾거나 내 팀을 만들어 지원자를 모집하세요.',
    href: '/camp',
    icon: <Users className="w-6 h-6" />,
    color: '#2563eb',
    bg: 'rgba(37,99,235,0.08)',
    border: 'rgba(37,99,235,0.2)',
  },
  {
    title: '글로벌 랭킹',
    description: '전체 해커톤 참여 기록 기반 팀 랭킹을 확인하고 상위권에 도전하세요.',
    href: '/rankings',
    icon: <Trophy className="w-6 h-6" />,
    color: '#db2777',
    bg: 'rgba(219,39,119,0.08)',
    border: 'rgba(219,39,119,0.2)',
  },
];

/* ── 웨일 스페이스 스타일 블롭 오브젝트 ── */
function FloatingBlobs() {
  return (
    <>
      {/* 큰 보라 블롭 - 오른쪽 상단 */}
      <div
        className="blob-float-a absolute pointer-events-none"
        style={{
          top: '-40px', right: '80px',
          width: '260px', height: '260px',
          borderRadius: '50%',
          background: 'radial-gradient(circle at 38% 32%, rgba(255,255,255,0.9) 0%, rgba(216,180,254,0.75) 28%, rgba(167,139,250,0.85) 55%, rgba(124,58,237,0.7) 80%, rgba(91,33,182,0.5) 100%)',
          filter: 'blur(0.5px)',
          boxShadow: '0 20px 60px rgba(124,58,237,0.25), inset -12px -12px 30px rgba(0,0,0,0.08), inset 6px 6px 20px rgba(255,255,255,0.6)',
        }}
      />
      {/* 핑크/분홍 블롭 - 왼쪽 */}
      <div
        className="blob-float-b absolute pointer-events-none"
        style={{
          top: '60px', left: '-30px',
          width: '180px', height: '180px',
          borderRadius: '50%',
          background: 'radial-gradient(circle at 38% 32%, rgba(255,255,255,0.92) 0%, rgba(251,207,232,0.8) 25%, rgba(244,114,182,0.8) 55%, rgba(219,39,119,0.65) 80%, rgba(157,23,77,0.45) 100%)',
          filter: 'blur(0.5px)',
          boxShadow: '0 16px 50px rgba(219,39,119,0.2), inset -10px -10px 24px rgba(0,0,0,0.07), inset 5px 5px 16px rgba(255,255,255,0.6)',
        }}
      />
      {/* 민트/청록 블롭 - 왼쪽 하단 */}
      <div
        className="blob-float-c absolute pointer-events-none"
        style={{
          bottom: '-20px', left: '15%',
          width: '140px', height: '140px',
          borderRadius: '50%',
          background: 'radial-gradient(circle at 38% 32%, rgba(255,255,255,0.9) 0%, rgba(167,243,208,0.75) 28%, rgba(52,211,153,0.8) 55%, rgba(16,185,129,0.65) 80%, rgba(5,150,105,0.45) 100%)',
          filter: 'blur(0.5px)',
          boxShadow: '0 12px 40px rgba(16,185,129,0.2), inset -8px -8px 20px rgba(0,0,0,0.07), inset 4px 4px 14px rgba(255,255,255,0.6)',
        }}
      />
      {/* 하늘 블롭 - 오른쪽 중간 */}
      <div
        className="blob-float-d absolute pointer-events-none"
        style={{
          top: '45%', right: '5%',
          width: '110px', height: '110px',
          borderRadius: '50%',
          background: 'radial-gradient(circle at 38% 32%, rgba(255,255,255,0.92) 0%, rgba(186,230,253,0.8) 28%, rgba(56,189,248,0.8) 55%, rgba(2,132,199,0.65) 80%, rgba(7,89,133,0.45) 100%)',
          filter: 'blur(0.5px)',
          boxShadow: '0 10px 36px rgba(2,132,199,0.2), inset -7px -7px 18px rgba(0,0,0,0.07), inset 4px 4px 12px rgba(255,255,255,0.6)',
        }}
      />
      {/* 보라 작은 블롭 - 왼쪽 중상단 */}
      <div
        className="blob-float-e absolute pointer-events-none"
        style={{
          top: '25%', left: '38%',
          width: '80px', height: '80px',
          borderRadius: '50%',
          background: 'radial-gradient(circle at 38% 32%, rgba(255,255,255,0.92) 0%, rgba(237,233,254,0.85) 30%, rgba(196,181,253,0.8) 55%, rgba(139,92,246,0.7) 80%, rgba(109,40,217,0.5) 100%)',
          filter: 'blur(0.5px)',
          boxShadow: '0 8px 28px rgba(139,92,246,0.2), inset -5px -5px 14px rgba(0,0,0,0.06), inset 3px 3px 10px rgba(255,255,255,0.65)',
        }}
      />
      {/* 오렌지/살구 블롭 - 오른쪽 하단 */}
      <div
        className="blob-float-f absolute pointer-events-none"
        style={{
          bottom: '10px', right: '20%',
          width: '96px', height: '96px',
          borderRadius: '50%',
          background: 'radial-gradient(circle at 38% 32%, rgba(255,255,255,0.92) 0%, rgba(253,186,116,0.8) 28%, rgba(249,115,22,0.78) 55%, rgba(234,88,12,0.65) 80%, rgba(194,65,12,0.45) 100%)',
          filter: 'blur(0.5px)',
          boxShadow: '0 8px 28px rgba(249,115,22,0.2), inset -5px -5px 14px rgba(0,0,0,0.06), inset 3px 3px 10px rgba(255,255,255,0.6)',
        }}
      />

      {/* 배경 mesh gradient orbs - 은은하게 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div style={{
          position: 'absolute', top: '-10%', right: '-5%',
          width: '55%', height: '70%',
          background: 'radial-gradient(ellipse, rgba(216,180,254,0.35) 0%, rgba(196,181,253,0.15) 40%, transparent 70%)',
          filter: 'blur(40px)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-10%', left: '-5%',
          width: '50%', height: '60%',
          background: 'radial-gradient(ellipse, rgba(167,243,208,0.25) 0%, rgba(147,197,253,0.15) 40%, transparent 70%)',
          filter: 'blur(40px)',
        }} />
        <div style={{
          position: 'absolute', top: '20%', left: '20%',
          width: '40%', height: '50%',
          background: 'radial-gradient(ellipse, rgba(251,207,232,0.2) 0%, transparent 65%)',
          filter: 'blur(50px)',
        }} />
      </div>
    </>
  );
}

export default function App() {
  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: '#f8f7ff' }}>
      <Navbar />

      {/* ── Hero 섹션 ── */}
      <section className="relative overflow-hidden" style={{ minHeight: '520px' }}>
        {/* 배경: 파스텔 mesh gradient */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f3e8ff 25%, #ede9fe 45%, #e0f2fe 70%, #fdf4ff 90%, #ffffff 100%)',
        }} />

        {/* 떠다니는 3D 블롭들 */}
        <FloatingBlobs />

        {/* Hero 콘텐츠 */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 pt-20 pb-24">
          <div className="max-w-xl">
            {/* 뱃지 */}
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-wider mb-7"
              style={{
                background: 'rgba(255,255,255,0.7)',
                border: '1px solid rgba(167,139,250,0.4)',
                color: '#6d28d9',
                backdropFilter: 'blur(8px)',
              }}
            >
              <Star className="w-3.5 h-3.5 fill-violet-400 text-violet-400" />
              HACKATHON PLATFORM
            </div>

            {/* 타이틀 */}
            <h1 className="text-5xl md:text-6xl font-black leading-tight mb-5" style={{ color: '#1e1b4b' }}>
              해커톤을<br />
              <span style={{
                background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 40%, #2563eb 80%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                제대로 경험하다
              </span>
            </h1>

            <p className="text-base md:text-lg leading-relaxed mb-10" style={{ color: '#6b7280' }}>
              문서만 남기고 사라진 서비스를 우리 손으로 다시 완성했습니다.<br />
              해커톤 탐색 · 팀 빌딩 · 결과 확인까지 끊기지 않는 흐름.
            </p>

            {/* CTA */}
            <div className="flex flex-wrap gap-3">
              <Link
                href="/hackathons"
                className="flex items-center gap-2 px-7 py-3.5 rounded-2xl font-bold text-sm text-white transition-all hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                  boxShadow: '0 4px 20px rgba(124,58,237,0.35)',
                }}
              >
                해커톤 시작하기
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/camp"
                className="flex items-center gap-2 px-7 py-3.5 rounded-2xl font-bold text-sm transition-all hover:scale-105"
                style={{
                  background: 'rgba(255,255,255,0.8)',
                  border: '1px solid rgba(167,139,250,0.4)',
                  color: '#6d28d9',
                  backdropFilter: 'blur(8px)',
                  boxShadow: '0 2px 12px rgba(124,58,237,0.1)',
                }}
              >
                팀원 찾기
                <Users className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 통계 배너 ── */}
      <div className="max-w-6xl mx-auto px-6 -mt-6 mb-6 relative z-10">
        <div
          className="grid grid-cols-3 gap-px rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(167,139,250,0.15)',
            boxShadow: '0 4px 24px rgba(124,58,237,0.1)',
          }}
        >
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="text-center py-5 px-4"
              style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)' }}
            >
              <div className="flex items-baseline justify-center gap-0.5">
                <span className="text-3xl font-black" style={{ color: '#6d28d9' }}>{stat.value}</span>
                <span className="text-sm font-bold" style={{ color: '#a78bfa' }}>{stat.suffix}</span>
              </div>
              <p className="text-xs font-medium mt-0.5" style={{ color: '#9ca3af' }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── 네비게이션 카드 ── */}
      <section className="py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-bold tracking-[0.3em] uppercase mb-2" style={{ color: '#a78bfa' }}>EXPLORE</p>
            <h2 className="text-3xl font-black" style={{ color: '#1e1b4b' }}>무엇을 원하시나요?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {NAV_CARDS.map((card) => (
              <Link key={card.href} href={card.href} className="group">
                <div
                  className="light-card h-full p-6 flex flex-col"
                  style={{ background: 'rgba(255,255,255,0.9)' }}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                    style={{ background: card.bg, border: `1px solid ${card.border}`, color: card.color }}
                  >
                    {card.icon}
                  </div>
                  <h3 className="text-base font-black mb-2" style={{ color: '#1e1b4b' }}>{card.title}</h3>
                  <p className="text-sm leading-relaxed flex-1 mb-4" style={{ color: '#6b7280' }}>{card.description}</p>
                  <div className="flex items-center gap-1 text-sm font-semibold" style={{ color: card.color }}>
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
        <section className="pb-12 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-xs font-bold tracking-[0.3em] uppercase mb-2" style={{ color: '#a78bfa' }}>LIVE NOW</p>
                <h2 className="text-3xl font-black" style={{ color: '#1e1b4b' }}>지금 주목할 해커톤</h2>
              </div>
              <Link href="/hackathons" className="flex items-center gap-1 text-sm font-semibold transition-colors"
                style={{ color: '#7c3aed' }}>
                전체 보기 <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {FEATURED.map((h) => (
                <Link key={h.slug} href={`/hackathons/${h.slug}`} className="group">
                  <div className="light-card p-6 relative overflow-hidden">
                    {/* 상단 컬러 라인 */}
                    <div className={`absolute top-0 left-0 w-full h-1 rounded-t-xl ${
                      h.status === 'ongoing'
                        ? 'bg-gradient-to-r from-emerald-400 to-teal-400'
                        : 'bg-gradient-to-r from-violet-500 to-blue-500'
                    }`} />

                    {/* 배경 glow */}
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.1) 0%, transparent 70%)' }} />

                    <div className="flex items-start justify-between mb-3 mt-1">
                      <StatusBadge status={h.status} />
                      <CountdownTimer deadline={h.period.submissionDeadlineAt} label="제출 마감" />
                    </div>
                    <h3 className="text-base font-bold mb-3 leading-snug group-hover:text-violet-700 transition-colors"
                      style={{ color: '#1e1b4b' }}>
                      {h.title}
                    </h3>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {h.tags.map((tag) => (
                        <span key={tag} className="text-xs px-2.5 py-0.5 rounded-full font-medium"
                          style={{ background: 'rgba(124,58,237,0.07)', color: '#6d28d9', border: '1px solid rgba(124,58,237,0.15)' }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-3"
                      style={{ borderTop: '1px solid rgba(196,181,253,0.3)' }}>
                      <span className="text-xs" style={{ color: '#9ca3af' }}>
                        마감 {new Date(h.period.submissionDeadlineAt).toLocaleDateString('ko-KR')}
                      </span>
                      <span className="flex items-center gap-1 text-xs font-semibold group-hover:text-violet-700 transition-colors"
                        style={{ color: '#7c3aed' }}>
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
      <section className="pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div
            className="relative overflow-hidden rounded-3xl p-10 md:p-14 text-center"
            style={{
              background: 'linear-gradient(135deg, #f3e8ff 0%, #ede9fe 30%, #e0e7ff 65%, #dbeafe 100%)',
              border: '1px solid rgba(196,181,253,0.4)',
            }}
          >
            {/* 배경 블롭 */}
            <div
              className="blob-float-a absolute pointer-events-none"
              style={{
                top: '-40px', right: '-20px',
                width: '200px', height: '200px',
                borderRadius: '50%',
                background: 'radial-gradient(circle at 38% 32%, rgba(255,255,255,0.85) 0%, rgba(216,180,254,0.65) 30%, rgba(167,139,250,0.7) 60%, rgba(124,58,237,0.55) 100%)',
                boxShadow: 'inset -8px -8px 20px rgba(0,0,0,0.06)',
                opacity: 0.7,
              }}
            />
            <div
              className="blob-float-c absolute pointer-events-none"
              style={{
                bottom: '-30px', left: '-10px',
                width: '150px', height: '150px',
                borderRadius: '50%',
                background: 'radial-gradient(circle at 38% 32%, rgba(255,255,255,0.85) 0%, rgba(167,243,208,0.65) 30%, rgba(52,211,153,0.7) 60%, rgba(16,185,129,0.55) 100%)',
                boxShadow: 'inset -6px -6px 16px rgba(0,0,0,0.05)',
                opacity: 0.65,
              }}
            />

            <div className="relative z-10">
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-5"
                style={{ background: 'rgba(255,255,255,0.7)', color: '#6d28d9', border: '1px solid rgba(167,139,250,0.3)' }}
              >
                <Star className="w-3 h-3 fill-violet-400 text-violet-400" />
                인수인계 해커톤 참가 중
              </div>
              <h2 className="text-3xl md:text-4xl font-black mb-4" style={{ color: '#1e1b4b' }}>
                명세서만 보고 구현하라
              </h2>
              <p className="text-base max-w-xl mx-auto mb-8 leading-relaxed" style={{ color: '#4b5563' }}>
                사라진 개발자가 남긴 문서를 기반으로 웹서비스를 완성하는 해커톤.<br />
                지금 바로 도전하고 리더보드에 이름을 올리세요.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link
                  href="/hackathons/daker-handover-2026-03"
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white transition-all hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', boxShadow: '0 4px 16px rgba(124,58,237,0.3)' }}
                >
                  해커톤 상세 보기
                </Link>
                <Link
                  href="/camp?hackathon=daker-handover-2026-03"
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all hover:scale-105"
                  style={{
                    background: 'rgba(255,255,255,0.8)',
                    border: '1px solid rgba(167,139,250,0.4)',
                    color: '#6d28d9',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <Users className="w-4 h-4" />
                  팀원 찾기
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
