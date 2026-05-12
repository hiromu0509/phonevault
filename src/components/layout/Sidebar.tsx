"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookMarked,
  Upload,
  Users,
  LogOut,
  Smartphone,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import clsx from "clsx";

const buyerNav = [
  { href: "/dashboard", label: "Inventory", icon: LayoutDashboard },
  { href: "/reservations", label: "My Reservations", icon: BookMarked },
];

const adminNav = [
  { href: "/dashboard", label: "Inventory", icon: LayoutDashboard },
  { href: "/reservations", label: "Reservations", icon: BookMarked },
  { href: "/admin/import", label: "Import Stock", icon: Upload },
  { href: "/admin/users", label: "Users", icon: Users },
];

export default function Sidebar() {
  const { profile, logout, isAdmin } = useAuth();
  const pathname = usePathname();
  const nav = isAdmin ? adminNav : buyerNav;

  return (
    <aside className="fixed left-0 top-0 h-full w-60 bg-surface-800 border-r border-surface-600 flex flex-col z-30">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-surface-600">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-amber-400 rounded-lg flex items-center justify-center">
            <Smartphone size={16} className="text-surface-900" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-none">PhoneVault</p>
            <p className="text-surface-400 text-[10px] mt-0.5 uppercase tracking-widest">
              Wholesale
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                active
                  ? "bg-amber-400/15 text-amber-400"
                  : "text-surface-400 hover:text-white hover:bg-surface-700"
              )}
            >
              <Icon size={16} />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight size={12} className="text-amber-400" />}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="px-3 py-4 border-t border-surface-600 space-y-1">
        <div className="px-3 py-2">
          <p className="text-white text-sm font-medium truncate">
            {profile?.displayName}
          </p>
          <p className="text-surface-400 text-xs truncate">{profile?.email}</p>
          <span
            className={clsx(
              "inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider border",
              isAdmin
                ? "text-amber-400 border-amber-400/30 bg-amber-400/10"
                : "text-sky-400 border-sky-400/30 bg-sky-400/10"
            )}
          >
            {profile?.role}
          </span>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-surface-400 hover:text-rose-400 hover:bg-rose-400/10 transition-all"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
