"use client";

import { useState, useEffect } from "react";
import { BookMarked, RefreshCw } from "lucide-react";
import AuthGuard from "@/components/layout/AuthGuard";
import AppShell from "@/components/layout/AppShell";
import ReservationCard from "@/components/reservation/ReservationCard";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";
import { getReservations } from "@/lib/db";
import { Reservation } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import clsx from "clsx";

const STATUS_TABS = ["all", "pending", "confirmed", "cancelled", "sold"];

export default function ReservationsPage() {
  const { profile, isAdmin } = useAuth();
  const [items, setItems] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");

  const load = async () => {
    setLoading(true);
    try {
      // Admin sees all; buyer sees only their own
      const data = await getReservations(isAdmin ? undefined : profile?.uid);
      setItems(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [profile, isAdmin]);

  const filtered =
    tab === "all" ? items : items.filter((r) => r.status === tab);

  const pending = items.filter((r) => r.status === "pending").length;
  const confirmed = items.filter((r) => r.status === "confirmed").length;
  const totalValue = items
    .filter((r) => r.status !== "cancelled")
    .reduce((s, r) => s + r.totalPrice, 0);

  return (
    <AuthGuard>
      <AppShell>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-navy-500 text-2xl font-semibold">
              {isAdmin ? "All Reservations" : "My Reservations"}
            </h1>
            <p className="text-slate-400 text-sm mt-0.5">
              {isAdmin ? "Manage buyer reservations" : "Track your reserved stock"}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={load} disabled={loading}>
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <StatCard label="Pending" value={pending} accent="amber" />
          <StatCard label="Confirmed" value={confirmed} accent="sky" />
          <StatCard
            label="Total Value"
            value={`${(totalValue / 1000).toFixed(1)}K`}
            sub="AED"
            accent="jade"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 overflow-x-auto pb-1">
          {STATUS_TABS.map((s) => (
            <button
              key={s}
              onClick={() => setTab(s)}
              className={clsx(
                "px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all capitalize",
                tab === s
                  ? "bg-amber-400 text-white"
                  : "bg-slate-100 text-slate-500 border border-slate-200 hover:text-slate-700"
              )}
            >
              {s}
              {s !== "all" && (
                <span className="ml-1.5 text-[10px] font-mono opacity-60">
                  ({items.filter((r) => r.status === s).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <BookMarked size={36} className="text-slate-300 mb-3" />
            <p className="text-slate-400">No reservations found</p>
            <p className="text-slate-400 text-sm mt-1">
              {tab === "all" ? "Reserve items from the inventory" : `No ${tab} reservations`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((r) => (
              <ReservationCard key={r.id} reservation={r} onUpdated={load} />
            ))}
          </div>
        )}
      </AppShell>
    </AuthGuard>
  );
}
