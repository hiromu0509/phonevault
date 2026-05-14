"use client";

import { useState, useEffect } from "react";
import { Users, RefreshCw, ShieldCheck, ShieldOff, UserCheck, UserX, Phone } from "lucide-react";
import AuthGuard from "@/components/layout/AuthGuard";
import AppShell from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { getAllUsers, updateUserApproval, updateUserRole } from "@/lib/db";
import { AppUser } from "@/types";
import clsx from "clsx";

export default function UsersPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try { setUsers(await getAllUsers()); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const toggleApproval = async (u: AppUser) => {
    setUpdating(u.uid);
    setError(null);
    try {
      await updateUserApproval(u.uid, !u.approved);
      await load();
    } catch (e: any) {
      setError(`Failed to update approval: ${e?.message ?? e}`);
    } finally { setUpdating(null); }
  };

  const toggleRole = async (u: AppUser) => {
    setUpdating(u.uid + "-role");
    setError(null);
    try {
      await updateUserRole(u.uid, u.role === "admin" ? "buyer" : "admin");
      await load();
    } catch (e: any) {
      setError(`Failed to update role: ${e?.message ?? e}`);
    } finally { setUpdating(null); }
  };

  const approved = users.filter((u) => u.approved).length;
  const pending = users.filter((u) => !u.approved).length;

  return (
    <AuthGuard requireAdmin>
      <AppShell>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-navy-500 text-2xl font-semibold">Users</h1>
              <p className="text-slate-400 text-sm mt-0.5">
                {approved} approved · <span className="text-red-500 font-medium">{pending} pending</span>
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={load} disabled={loading}>
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Refresh
            </Button>
          </div>

          {/* Error alert */}
          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Pending alert */}
          {pending > 0 && (
            <div className="mb-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
              <p className="text-amber-700 text-sm font-medium">
                {pending} user{pending > 1 ? "s" : ""} waiting for approval
              </p>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="w-6 h-6 border-2 border-navy-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <Users size={36} className="text-slate-300 mb-3" />
              <p className="text-slate-400">No users yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {users.map((u) => (
                <div
                  key={u.uid}
                  className={clsx(
                    "bg-white border-l-4 border rounded-xl p-4 transition-all shadow-sm",
                    u.approved
                      ? "border-l-emerald-400 border-slate-200"
                      : "border-l-red-400 border-red-100 bg-red-50/30"
                  )}
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className={clsx(
                      "w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-sm",
                      u.approved ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"
                    )}>
                      {(u.displayName || u.email).charAt(0).toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-navy-500 font-semibold text-sm truncate">
                          {u.displayName}
                        </p>
                        <span className={clsx(
                          "text-xs px-2 py-0.5 rounded-full font-medium border",
                          u.role === "admin"
                            ? "text-amber-700 border-amber-300 bg-amber-50"
                            : "text-sky-700 border-sky-200 bg-sky-50"
                        )}>
                          {u.role}
                        </span>
                        {!u.approved && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-bold border text-red-600 border-red-300 bg-red-50">
                            ⏳ Pending Approval
                          </span>
                        )}
                        {u.approved && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium border text-emerald-600 border-emerald-200 bg-emerald-50">
                            ✓ Approved
                          </span>
                        )}
                      </div>
                      <p className="text-slate-500 text-xs mt-0.5 truncate">
                        {u.email}
                        {u.companyName && (
                          <span className="ml-2 text-slate-400">· {u.companyName}</span>
                        )}
                      </p>
                      {u.phone && (
                        <p className="text-slate-400 text-xs mt-0.5 flex items-center gap-1">
                          <Phone size={10} />
                          {u.phone}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant={u.approved ? "danger" : "outline"}
                        onClick={() => toggleApproval(u)}
                        loading={updating === u.uid}
                        className="hidden sm:flex"
                      >
                        {u.approved ? (
                          <><UserX size={12} /> Revoke</>
                        ) : (
                          <><UserCheck size={12} /> Approve</>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleRole(u)}
                        loading={updating === u.uid + "-role"}
                      >
                        {u.role === "admin" ? (
                          <ShieldOff size={12} />
                        ) : (
                          <ShieldCheck size={12} />
                        )}
                        <span className="hidden sm:inline">
                          {u.role === "admin" ? "Make Buyer" : "Make Admin"}
                        </span>
                      </Button>
                    </div>
                  </div>

                  {/* Mobile approve button */}
                  <div className="sm:hidden mt-3">
                    <Button
                      size="sm"
                      variant={u.approved ? "danger" : "outline"}
                      onClick={() => toggleApproval(u)}
                      loading={updating === u.uid}
                      className="w-full"
                    >
                      {u.approved ? (
                        <><UserX size={12} /> Revoke Access</>
                      ) : (
                        <><UserCheck size={12} /> Approve Access</>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </AppShell>
    </AuthGuard>
  );
}
