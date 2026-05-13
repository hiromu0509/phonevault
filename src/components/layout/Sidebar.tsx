'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BookMarked, Upload, Users, LogOut, ChevronRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import clsx from 'clsx';

const buyerNav = [
  { href: '/dashboard', label: 'Inventory', icon: LayoutDashboard },
  { href: '/reservations', label: 'My Reservations', icon: BookMarked },
];

const adminNav = [
  { href: '/dashboard', label: 'Inventory', icon: LayoutDashboard },
  { href: '/reservations', label: 'Reservations', icon: BookMarked },
  { href: '/admin/import', label: 'Import Stock', icon: Upload },
  { href: '/admin/users', label: 'Users', icon: Users },
];

export default function Sidebar() {
  const { profile, logout, isAdmin } = useAuth();
  const pathname = usePathname();
  const nav = isAdmin ? adminNav : buyerNav;

  return (
    <aside className="fixed left-0 top-0 h-full w-60 bg-white border-r border-slate-200 flex flex-col z-30 shadow-sm">
      <div className="px-5 py-5 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-navy-500 rounded-xl flex items-center justify-center shadow-md">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <rect x="7" y="8" width="10" height="13" rx="1.5" fill="white"/>
              <rect x="9" y="10" width="6" height="7" rx="0.5" fill="#1E3A8A"/>
              <circle cx="12" cy="19" r="0.8" fill="#1E3A8A"/>
              <path d="M5 8L7 5L9 7L12 3L15 7L17 5L19 8H5Z" fill="#FFD700"/>
              <circle cx="7" cy="5" r="1" fill="#FFD700"/>
              <circle cx="12" cy="3" r="1" fill="#FFD700"/>
              <circle cx="17" cy="5" r="1" fill="#FFD700"/>
            </svg>
          </div>
          <div>
            <p className="text-navy-500 font-bold text-sm leading-none tracking-wide">Best of Best</p>
            <p className="text-slate-400 text-[10px] mt-0.5 uppercase tracking-widest">Wholesale</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                active ? 'bg-navy-500 text-white' : 'text-slate-500 hover:text-navy-500 hover:bg-slate-100'
              )}
            >
              <Icon size={16} />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight size={12} />}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-slate-200 space-y-1">
        <div className="px-3 py-2">
          <p className="text-navy-500 text-sm font-medium truncate">{profile?.displayName}</p>
          <p className="text-slate-400 text-xs truncate">{profile?.email}</p>
          <span className={clsx(
            'inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider border',
            isAdmin
              ? 'text-navy-500 border-navy-500 bg-navy-500/10'
              : 'text-sky-500 border-sky-400 bg-sky-50'
          )}>
            {isAdmin ? 'Admin' : 'Buyer'}
          </span>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:text-red-500 hover:bg-red-50 transition-all"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}