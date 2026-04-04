'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Rocket, Users, Trophy, Home } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: '홈', icon: Home },
  { href: '/hackathons', label: '해커톤', icon: Rocket },
  { href: '/camp', label: '팀 찾기', icon: Users },
  { href: '/rankings', label: '랭킹', icon: Trophy },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800/60"
      style={{ background: 'rgba(2, 8, 23, 0.85)', backdropFilter: 'blur(20px)' }}
    >
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* 로고 */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative w-9 h-9 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-violet-500 rounded-xl opacity-20 group-hover:opacity-40 blur-sm transition-opacity" />
            <div className="relative w-9 h-9 bg-gradient-to-tr from-blue-500 to-violet-500 rounded-xl flex items-center justify-center font-black text-sm shadow-lg group-hover:scale-105 transition-transform">
              <span className="text-white">N</span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-[15px] font-bold tracking-tight text-white leading-none">
              Now Your Thon
            </span>
            <span className="text-[10px] text-slate-500 tracking-widest font-medium mt-0.5">
              HACKATHON HUB
            </span>
          </div>
        </Link>

        {/* 네비게이션 */}
        <ul className="flex items-center gap-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive =
              href === '/' ? pathname === '/' : pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-white'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`}
                >
                  {isActive && (
                    <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600/20 to-violet-600/20 border border-blue-500/20" />
                  )}
                  <Icon className={`relative w-4 h-4 ${isActive ? 'text-blue-400' : ''}`} />
                  <span className={`relative hidden sm:inline ${isActive ? 'text-white' : ''}`}>
                    {label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
