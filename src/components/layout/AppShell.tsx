"use client";

import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-900">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile bottom nav */}
      <div className="lg:hidden">
        <MobileNav />
      </div>

      {/* Main content */}
      <main className="lg:ml-60 min-h-screen">
        <div className="px-4 py-6 lg:px-8 lg:py-8 pb-24 lg:pb-8">
          {children}
        </div>
      </main>
    </div>
  );
}
