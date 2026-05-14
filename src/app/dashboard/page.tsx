"use client";

import { useState, useEffect, useMemo } from "react";
import { RefreshCw, Package, Instagram } from "lucide-react";
import AuthGuard from "@/components/layout/AuthGuard";
import AppShell from "@/components/layout/AppShell";
import InventoryCard from "@/components/inventory/InventoryCard";
import FilterBar from "@/components/inventory/FilterBar";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";
import { getInventory } from "@/lib/db";
import { InventoryItem } from "@/types";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardPage() {
  const { profile } = useAuth();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [gradeFilter, setGradeFilter] = useState("all");

  const load = async () => {
    setLoading(true);
    try {
      const data = await getInventory();
      setItems(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        !search ||
        item.model.toLowerCase().includes(search.toLowerCase()) ||
        item.color.toLowerCase().includes(search.toLowerCase()) ||
        item.storage.toLowerCase().includes(search.toLowerCase());
      const matchStatus =
        statusFilter === "all" || item.status === statusFilter;
      const matchGrade =
        gradeFilter === "all" || item.grade === gradeFilter;
      return matchSearch && matchStatus && matchGrade;
    });
  }, [items, search, statusFilter, gradeFilter]);

  // Stats
  const available = items.filter((i) => i.status === "available").length;
  const reserved = items.filter((i) => i.status === "reserved").length;
  const totalUnits = items.reduce((s, i) => s + i.availableQty, 0);
  const totalValue = items.reduce(
    (s, i) => s + i.buyerPrice * i.availableQty,
    0
  );

  return (
    <AuthGuard>
      <AppShell>
        {/* Instagram banner */}
        <a
          href="https://www.instagram.com/bestofbest1249"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 mb-6 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600/20 via-pink-500/20 to-orange-400/20 border border-pink-500/30 hover:border-pink-400/60 transition-all group"
        >
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center shrink-0">
            <Instagram size={18} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold">@bestofbest1249</p>
            <p className="text-surface-400 text-xs">最新入荷・お得情報はInstagramをチェック</p>
          </div>
          <span className="text-pink-400 text-xs font-medium group-hover:text-pink-300 shrink-0">フォローする →</span>
        </a>

        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-white text-2xl font-semibold">Inventory</h1>
            <p className="text-surface-400 text-sm mt-0.5">
              Live wholesale stock · prices include commission
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={load} disabled={loading}>
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <StatCard label="Available" value={available} accent="jade" />
          <StatCard label="Reserved" value={reserved} accent="amber" />
          <StatCard label="Total Units" value={totalUnits} sub="pcs in stock" accent="sky" />
          <StatCard
            label="Stock Value"
            value={`${(totalValue / 1000).toFixed(0)}K`}
            sub="AED"
            accent="amber"
          />
        </div>

        {/* Filters */}
        <div className="mb-5">
          <FilterBar
            search={search}
            onSearch={setSearch}
            statusFilter={statusFilter}
            onStatusFilter={setStatusFilter}
            gradeFilter={gradeFilter}
            onGradeFilter={setGradeFilter}
          />
        </div>

        {/* Results count */}
        <p className="text-surface-500 text-xs mb-4 font-mono">
          {filtered.length} item{filtered.length !== 1 ? "s" : ""} shown
        </p>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Package size={36} className="text-surface-600 mb-3" />
            <p className="text-surface-400">No items found</p>
            <p className="text-surface-600 text-sm mt-1">
              Try adjusting your filters
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((item) => (
              <InventoryCard key={item.id} item={item} onReserved={load} />
            ))}
          </div>
        )}
      </AppShell>
    </AuthGuard>
  );
}
