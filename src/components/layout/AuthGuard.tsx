"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Clock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface GuardProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function AuthGuard({ children, requireAdmin = false }: GuardProps) {
  const { user, profile, loading, logout } = useAuth();
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

  if (profile && !profile.approved && profile.role !== "admin") {
    return (
      <div className="min-h-screen bg-surface-900 flex items-center justify-center px-4">
        <div className="bg-surface-800 border border-surface-600 rounded-2xl p-8 max-w-sm w-full text-center">
          <div className="w-14 h-14 bg-amber-400/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock size={28} className="text-amber-400" />
          </div>
          <h2 className="text-white font-semibold text-lg mb-2">承認待ちです</h2>
          <p className="text-surface-400 text-sm mb-1">
            アカウントはまだ管理者に承認されていません。
          </p>
          <p className="text-surface-500 text-xs mb-6">
            承認後にサインインしてください。
          </p>
          <button
            onClick={() => logout().then(() => router.replace("/login"))}
            className="w-full bg-surface-700 hover:bg-surface-600 text-white font-medium rounded-lg py-2.5 text-sm transition-colors"
          >
            サインアウト
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
