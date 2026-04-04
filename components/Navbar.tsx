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
    <nav className="sticky top-0 z-50 border-b border-violet-100"
      style={{ background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(16px)' }}>
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm text-white shadow-md group-hover:scale-105 transition-transform"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>N</div>
          <div className="flex flex-col leading-none">
            <span className="text-[15px] font-bold text-violet-900">Now Your Thon</span>
            <span className="text-[10px] font-semibold text-violet-400 tracking-widest uppercase mt-0.5">Hackathon Hub</span>
          </div>
        </Link>
        <ul className="flex items-center gap-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
            return (
              <li key={href}>
                <Link href={href}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                    isActive ? 'bg-violet-100 text-violet-700' : 'text-slate-500 hover:bg-violet-50 hover:text-violet-700'
                  }`}>
                  <Icon className={`w-4 h-4 ${isActive ? 'text-violet-600' : ''}`} />
                  <span className="hidden sm:inline">{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
