'use client';
import React from 'react';
import { Trophy, Users, Rocket, ExternalLink } from 'lucide-react';

/**
 * Main Page Component
 * Features:
 * 1. Top-left Logo
 * 2. Centered 3-Card Layout
 * 3. 3D Flip Animation on Hover
 * 4. Gradient styling and clean UI
 */
export default function App() {
  const cards = [
    {
      title: "해커톤 보러가기",
      description: "세상을 바꿀 아이디어를 실현하세요. 최신 해커톤 리스트와 상세 일정을 확인하고 지금 바로 도전하세요.",
      href: "/hackathons",
      icon: <Rocket className="w-12 h-12" />,
      gradient: "from-blue-600 to-indigo-700",
      pathName: "HACKATHONS"
    },
    {
      title: "팀 찾기",
      description: "당신의 빈자리를 채워줄 최고의 동료를 찾으세요. 기술 스택별, 프로젝트별 맞춤 팀 빌딩 서비스를 제공합니다.",
      href: "/camp",
      icon: <Users className="w-12 h-12" />,
      gradient: "from-emerald-500 to-teal-700",
      pathName: "TEAM FINDER"
    },
    {
      title: "랭킹 보기",
      description: "누가 가장 앞서가고 있을까요? 커뮤니티 기여도와 프로젝트 성과를 바탕으로 산정된 실시간 랭킹입니다.",
      href: "/rankings",
      icon: <Trophy className="w-12 h-12" />,
      gradient: "from-purple-600 to-fuchsia-700",
      pathName: "RANKINGS"
    }
  ];

  const handleNavigation = (path: string) => {
    console.log(`Navigating to: ${path}`);
    window.location.href = path;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans overflow-hidden flex items-center justify-center relative">
      
      {/* 1. Top-Left Logo */}
      <div className="absolute top-8 left-8 z-50">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-xl flex items-center justify-center font-black text-xl shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
            D
          </div>
          <span className="text-xl font-bold tracking-tighter text-slate-100 group-hover:text-white transition-colors">
            Now Your Thon
          </span>
        </div>
      </div>

      {/* 2. Main Centered Content */}
      <main className="w-full max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {cards.map((card, index) => (
            <div 
              key={index} 
              className="group h-[450px] [perspective:1000px] cursor-pointer"
              onClick={() => handleNavigation(card.href)}
            >
              <div className="relative h-full w-full rounded-3xl transition-all duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] shadow-2xl">
                
                {/* Front Side */}
                <div className={`absolute inset-0 h-full w-full rounded-3xl [backface-visibility:hidden] bg-gradient-to-br ${card.gradient} flex flex-col items-center justify-center p-8 text-center border border-white/10`}>
                  <div className="mb-6 p-5 bg-white/10 rounded-2xl backdrop-blur-sm group-hover:scale-110 transition-transform duration-500">
                    {card.icon}
                  </div>
                  <span className="text-xs font-medium tracking-[0.3em] text-white/60 mb-2 uppercase">
                    {card.pathName}
                  </span>
                  <h2 className="text-3xl font-bold text-white">
                    {card.title}
                  </h2>
                  
                  {/* Subtle Hint */}
                  <div className="absolute bottom-10 animate-bounce opacity-50">
                    <div className="w-1 h-8 rounded-full bg-gradient-to-b from-white/40 to-transparent" />
                  </div>
                </div>

                {/* Back Side */}
                <div className="absolute inset-0 h-full w-full rounded-3xl bg-slate-900 px-10 [transform:rotateY(180deg)] [backface-visibility:hidden] border border-white/10 flex flex-col items-center justify-center text-center">
                  <div className={`mb-6 p-3 bg-gradient-to-br ${card.gradient} rounded-full`}>
                    <ExternalLink className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold mb-6">{card.title}</h3>
                  <p className="text-slate-400 leading-relaxed text-lg mb-8">
                    {card.description}
                  </p>
                  <button className={`px-8 py-3 rounded-full bg-gradient-to-r ${card.gradient} font-bold text-sm hover:scale-105 transition-transform active:scale-95`}>
                    입장하기
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Decorative background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute -bottom-48 -right-48 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[100px] -z-10 pointer-events-none" />
    </div>
  );
}