'use client';
import React, { useState, useEffect } from 'react';
import { Trophy, Users, Rocket, ExternalLink } from 'lucide-react';

/**
 * Main Page Component
 * Features:
 * 1. Top-left Logo
 * 2. Centered 3-Card Layout with generous spacing
 * 3. 3D Flip Animation on Hover
 * 4. Smooth & Visible Interactive Mouse Glow
 */
export default function App() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Update mouse position for the background glow effect with performance optimization
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // requestAnimationFrame을 사용하여 부드럽게 마우스를 따라가도록 최적화합니다.
      requestAnimationFrame(() => {
        setMousePos({ x: e.clientX, y: e.clientY });
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const cards = [
    {
      title: "진행중인 해커톤",
      description: "세상을 바꿀 아이디어를 실현하세요. 최신 해커톤 리스트와 상세 일정을 확인하고 지금 바로 도전하세요.",
      href: "/hackathons",
      icon: <Rocket className="w-12 h-12" />,
      gradient: "from-blue-600 to-indigo-700",
      pathName: "HACKATHONS",
      statusColor: "bg-emerald-500/20 text-emerald-100 border-emerald-400/50"
    },
    {
      title: "해커톤 팀 찾기",
      description: "당신의 빈자리를 채워줄 최고의 동료를 찾으세요. 기술 스택별, 프로젝트별 맞춤 팀 빌딩 서비스를 제공합니다.",
      href: "/camp",
      icon: <Users className="w-12 h-12" />,
      gradient: "from-emerald-500 to-teal-700",
      pathName: "TEAM FINDER",
      statusColor: "bg-emerald-500/20 text-emerald-100 border-emerald-400/50"
    },
    {
      title: "랭킹 보기",
      description: "누가 가장 앞서가고 있을까요? 커뮤니티 기여도와 프로젝트 성과를 바탕으로 산정된 실시간 랭킹입니다.",
      href: "/rankings",
      icon: <Trophy className="w-12 h-12" />,
      gradient: "from-purple-600 to-fuchsia-700",
      pathName: "RANKINGS",
      statusColor: "bg-emerald-500/20 text-emerald-100 border-emerald-400/50"
    }
  ];

  const handleNavigation = (path: string) => {
    console.log(`Navigating to: ${path}`);
    window.location.href = path;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans overflow-x-hidden flex items-center justify-center relative py-20">
      
      {/* 1. Interactive Mouse Glow Effect (Fixed & Enhanced Visibility) */}
      <div 
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300"
        style={{
          // === [요청하신 수정 사항 적용 부분] ===
          // 오렌지 컬러(rgba(249, 115, 22))로 변경하고 
          // 투명도를 0.45로 높여 색이 훨씬 강하고 선명하게 보이도록 수정했습니다.
          background: `radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, rgba(249, 115, 22, 0.45) 0%, transparent 600px)`
          // ===================================
        }}
      />

      {/* 2. Page Background Pattern */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,white_1px,transparent_1px)] [background-size:32px_32px] pointer-events-none z-0"></div>

      {/* 3. Top-Left Logo */}
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

      {/* 4. Main Centered Content */}
      <main className="w-full max-w-[1440px] mx-auto px-12 md:px-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 lg:gap-32 items-center justify-items-center">
          {cards.map((card, index) => (
            <div 
              key={index} 
              className="group h-[500px] w-full max-w-[380px] [perspective:1500px] cursor-pointer"
              onClick={() => handleNavigation(card.href)}
            >
              <div className="relative h-full w-full rounded-[2.5rem] transition-all duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] shadow-2xl">
                
                {/* Front Side */}
                <div className={`absolute inset-0 h-full w-full rounded-[2.5rem] [backface-visibility:hidden] bg-gradient-to-br ${card.gradient} flex flex-col items-center justify-center p-10 text-center border border-white/20 shadow-[0_0_40px_rgba(0,0,0,0.3)] overflow-hidden opacity-90 group-hover:opacity-100 transition-opacity`}>
                  
                  {/* Overlay Pattern */}
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,white_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none"></div>
                  
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
                  
                  {/* Subtle Hint */}
                  <div className="absolute bottom-12 animate-bounce opacity-40">
                    <div className="w-1 h-10 rounded-full bg-gradient-to-b from-white/60 to-transparent" />
                  </div>
                </div>

                {/* Back Side */}
                <div className="absolute inset-0 h-full w-full rounded-[2.5rem] bg-slate-900 px-10 [transform:rotateY(180deg)] [backface-visibility:hidden] border border-white/10 flex flex-col items-center justify-center text-center shadow-[0_0_60px_rgba(0,0,0,0.5)] overflow-hidden">
                  
                  {/* Subtle pattern for back side */}
                  <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_center,white_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

                  <div className={`mb-8 p-4 bg-gradient-to-br ${card.gradient} rounded-2xl shadow-lg relative overflow-hidden`}>
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,white_1px,transparent_1px)] [background-size:8px_8px]"></div>
                    <ExternalLink className="w-8 h-8 relative z-10 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-extrabold mb-6 text-white relative z-10">{card.title}</h3>
                  <p className="text-slate-400 leading-relaxed text-base mb-10 px-2 relative z-10">
                    {card.description}
                  </p>
                  
                  {/* 버튼 영역: cursor-pointer 명시 및 hover:-translate-y-1 효과로 호버 반응성 강화 */}
                  <button className={`w-full py-4 rounded-2xl bg-gradient-to-r ${card.gradient} font-black text-sm tracking-widest cursor-pointer hover:brightness-125 hover:-translate-y-1 transition-all duration-300 hover:shadow-[0_10px_20px_rgba(0,0,0,0.3)] active:scale-95 relative z-10 text-white`}>
                    GET STARTED
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Static decorative background glows (remained for depth) */}
      <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[140px] -z-10 pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 translate-x-1/2 w-[700px] h-[700px] bg-purple-600/5 rounded-full blur-[140px] -z-10 pointer-events-none" />
    </div>
  );
}