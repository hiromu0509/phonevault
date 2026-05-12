"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookMarked, Upload, Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import clsx from "clsx";

export default function MobileNav() {
  const { isAdmin } = useAuth();
  const pathname = usePathname();

  const items = [
    { href: "/dashboard", label: "Inventory", icon: LayoutDashboard },
    { href: "/reservations", label: "Reserved", icon: BookMarked },
    ...(isAdmin
      ? [
          { href: "/admin/import", label: "Import", icon: Upload },
          { href: "/admin/users", label: "Users", icon: Users },
        ]
      : []),
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface-800 border-t border-surface-600 z-30 px-2 pb-safe">
      <div className="flex items-center justify-around">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex flex-col items-center gap-1 py-3 px-4 text-[10px] font-medium transition-colors",
                active ? "text-amber-400" : "text-surface-400"
              )}
            >
              <Icon size={20} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
