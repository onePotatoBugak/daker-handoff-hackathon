'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trophy, Users, Rocket, ExternalLink, ChevronRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import StatusBadge from '@/components/StatusBadge';
import CountdownTimer from '@/components/CountdownTimer';
import { HACKATHONS } from '@/lib/data';

const CARDS = [
  {
    title: '진행중인 해커톤',
    description:
      '세상을 바꿀 아이디어를 실현하세요. 최신 해커톤 리스트와 상세 일정을 확인하고 지금 바로 도전하세요.',
    href: '/hackathons',
    icon: <Rocket className="w-12 h-12" />,
    gradient: 'from-blue-600 to-indigo-700',
    pathName: 'HACKATHONS',
  },
  {
    title: '해커톤 팀 찾기',
    description:
      '당신의 빈자리를 채워줄 최고의 동료를 찾으세요. 기술 스택별, 프로젝트별 맞춤 팀 빌딩 서비스를 제공합니다.',
    href: '/camp',
    icon: <Users className="w-12 h-12" />,
    gradient: 'from-emerald-500 to-teal-700',
    pathName: 'TEAM FINDER',
  },
  {
    title: '랭킹 보기',
    description:
      '누가 가장 앞서가고 있을까요? 커뮤니티 기여도와 프로젝트 성과를 바탕으로 산정된 실시간 랭킹입니다.',
    href: '/rankings',
    icon: <Trophy className="w-12 h-12" />,
    gradient: 'from-purple-600 to-fuchsia-700',
    pathName: 'RANKINGS',
  },
];

const FEATURED = HACKATHONS.filter(
  (h) => h.status === 'ongoing' || h.status === 'upcoming'
);

export default function App() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      requestAnimationFrame(() => setMousePos({ x: e.clientX, y: e.clientY }));
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans overflow-x-hidden">
      <Navbar />

      {/* Mouse glow */}
      <div
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, rgba(249, 115, 22, 0.45) 0%, transparent 600px)`,
        }}
      />

      {/* Dot pattern */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,white_1px,transparent_1px)] [background-size:32px_32px] pointer-events-none z-0" />

      {/* Hero cards */}
      <section className="relative z-10 flex items-center justify-center py-16 md:py-24">
        <div className="w-full max-w-[1440px] mx-auto px-6 md:px-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3">
              Now Your Thon
            </h1>
            <p className="text-slate-400 text-base md:text-lg max-w-xl mx-auto">
              문서만 남기고 사라진 서비스를 우리 손으로 다시 완성했습니다.
              <br />
              해커톤 탐색부터 팀 빌딩, 결과 확인까지 끊기지 않는 흐름.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16 items-center justify-items-center">
            {CARDS.map((card, index) => (
              <Link
                key={index}
                href={card.href}
                className="group h-[460px] w-full max-w-[360px] [perspective:1500px] cursor-pointer"
              >
                <div className="relative h-full w-full rounded-[2.5rem] transition-all duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] shadow-2xl">
                  {/* Front */}
                  <div
                    className={`absolute inset-0 h-full w-full rounded-[2.5rem] [backface-visibility:hidden] bg-gradient-to-br ${card.gradient} flex flex-col items-center justify-center p-10 text-center border border-white/20 shadow-[0_0_40px_rgba(0,0,0,0.3)] overflow-hidden`}
                  >
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,white_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
                    <div className="relative z-10 mb-8 p-6 bg-white/10 rounded-3xl backdrop-blur-md group-hover:scale-110 transition-transform duration-500 border border-white/10">
                      {card.icon}
                    </div>
                    <div className="relative z-10">
                      <span className="text-xs font-bold tracking-[0.4em] text-white/50 mb-3 uppercase block">
                        {card.pathName}
                      </span>
                      <h2 className="text-3xl font-black text-white leading-tight">
                        {card.title}
                      </h2>
                    </div>
                    <div className="absolute bottom-12 animate-bounce opacity-40">
                      <div className="w-1 h-10 rounded-full bg-gradient-to-b from-white/60 to-transparent" />
                    </div>
                  </div>

                  {/* Back */}
                  <div className="absolute inset-0 h-full w-full rounded-[2.5rem] bg-slate-900 px-10 [transform:rotateY(180deg)] [backface-visibility:hidden] border border-white/10 flex flex-col items-center justify-center text-center shadow-[0_0_60px_rgba(0,0,0,0.5)] overflow-hidden">
                    <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_center,white_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
                    <div
                      className={`mb-8 p-4 bg-gradient-to-br ${card.gradient} rounded-2xl shadow-lg relative overflow-hidden`}
                    >
                      <ExternalLink className="w-8 h-8 relative z-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-extrabold mb-6 text-white relative z-10">
                      {card.title}
                    </h3>
                    <p className="text-slate-400 leading-relaxed text-base mb-10 px-2 relative z-10">
                      {card.description}
                    </p>
                    <button
                      className={`w-full py-4 rounded-2xl bg-gradient-to-r ${card.gradient} font-black text-sm tracking-widest cursor-pointer hover:brightness-125 hover:-translate-y-1 transition-all duration-300 hover:shadow-[0_10px_20px_rgba(0,0,0,0.3)] active:scale-95 relative z-10 text-white`}
                    >
                      GET STARTED
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 진행중/예정 해커톤 요약 */}
      {FEATURED.length > 0 && (
        <section className="relative z-10 max-w-6xl mx-auto px-6 pb-16">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-white">
              지금 주목할 해커톤
            </h2>
            <Link
              href="/hackathons"
              className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-200 transition-colors"
            >
              전체 보기
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FEATURED.map((h) => (
              <Link key={h.slug} href={`/hackathons/${h.slug}`}>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-600 hover:bg-slate-800/70 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <StatusBadge status={h.status} />
                    <CountdownTimer
                      deadline={h.period.submissionDeadlineAt}
                      label="제출 마감"
                    />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2 leading-snug">
                    {h.title}
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {h.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-slate-800 border border-slate-700 text-xs px-2 py-0.5 rounded-full text-slate-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Background decorative glows */}
      <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[140px] -z-10 pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 translate-x-1/2 w-[700px] h-[700px] bg-purple-600/5 rounded-full blur-[140px] -z-10 pointer-events-none" />
    </div>
  );
}
