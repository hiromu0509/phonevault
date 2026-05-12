"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

interface GuardProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function AuthGuard({ children, requireAdmin = false }: GuardProps) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace("/login"); return; }
    if (requireAdmin && profile?.role !== "admin") {
      router.replace("/dashboard");
    }
  }, [user, profile, loading, requireAdmin, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-surface-400 text-sm font-mono">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) return null;
  if (requireAdmin && profile?.role !== "admin") return null;

  return <>{children}</>;
}
