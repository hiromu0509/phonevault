"use client";

import { useState, useEffect } from "react";
import { Users, RefreshCw, ShieldCheck, ShieldOff, UserCheck, UserX, Phone } from "lucide-react";
import AuthGuard from "@/components/layout/AuthGuard";
import AppShell from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { getAllUsers, updateUserApproval, updateUserRole } from "@/lib/db";
import { AppUser } from "@/types";
import clsx from "clsx";

export default function UsersPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try { setUsers(await getAllUsers()); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const toggleApproval = async (u: AppUser) => {
    setUpdating(u.uid);
    try {
      await updateUserApproval(u.uid, !u.approved);
      await load();
    } finally { setUpdating(null); }
  };

  const toggleRole = async (u: AppUser) => {
    setUpdating(u.uid + "-role");
    try {
      await updateUserRole(u.uid, u.role === "admin" ? "buyer" : "admin");
      await load();
    } finally { setUpdating(null); }
  };

  const approved = users.filter((u) => u.approved).length;

  return (
    <AuthGuard requireAdmin>
      <AppShell>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-white text-2xl font-semibold">Users</h1>
              <p className="text-surface-400 text-sm mt-0.5">
                {approved} of {users.length} accounts approved
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={load} disabled={loading}>
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Refresh
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <Users size={36} className="text-surface-600 mb-3" />
              <p className="text-surface-400">No users yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {users.map((u) => (
                <div
                  key={u.uid}
                  className={clsx(
                    "bg-surface-800 border rounded-xl p-4 transition-all",
                    u.approved ? "border-surface-600" : "border-rose-500/20"
                  )}
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar placeholder */}
                    <div className="w-10 h-10 rounded-full bg-surface-600 flex items-center justify-center shrink-0">
                      <span className="text-surface-300 font-medium text-sm">
                        {(u.displayName || u.email).charAt(0).toUpperCase()}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-white font-medium text-sm truncate">
                          {u.displayName}
                        </p>
                        <Badge
                          label={u.role}
                          className={
                            u.role === "admin"
                              ? "text-amber-400 border-amber-400/30 bg-amber-400/10"
                              : "text-sky-400 border-sky-400/30 bg-sky-400/10"
                          }
                        />
                        {!u.approved && (
                          <Badge
                            label="Pending"
                            className="text-rose-400 border-rose-400/30 bg-rose-400/10"
                          />
                        )}
                      </div>
                      <p className="text-surface-400 text-xs mt-0.5 truncate">
                        {u.email}
                        {u.companyName && (
                          <span className="ml-2 text-surface-500">· {u.companyName}</span>
                        )}
                      </p>
                      {u.phone && (
                        <p className="text-surface-500 text-xs mt-0.5 flex items-center gap-1">
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
