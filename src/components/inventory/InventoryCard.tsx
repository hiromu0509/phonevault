"use client";

import { useState } from "react";
import { Package, Tag, Layers } from "lucide-react";
import { InventoryItem } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { GRADE_COLORS, STATUS_COLORS, STATUS_LABELS } from "@/lib/constants";
import { createReservation } from "@/lib/db";
import { useAuth } from "@/hooks/useAuth";
import clsx from "clsx";

interface InventoryCardProps {
  item: InventoryItem;
  onReserved?: () => void;
}

export default function InventoryCard({ item, onReserved }: InventoryCardProps) {
  const { profile } = useAuth();
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const canReserve = item.status === "available" && item.availableQty > 0;

  const handleReserve = async () => {
    if (!profile) return;
    if (qty < 1 || qty > item.availableQty) {
      setError(`Max available: ${item.availableQty}`);
      return;
    }
    setLoading(true);
    setError("");
    try {
      await createReservation(item, qty, profile);
      setSuccess(true);
      onReserved?.();
      setTimeout(() => setSuccess(false), 3000);
    } catch (e: any) {
      setError(e.message || "Failed to reserve");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col gap-4 shadow-card hover:shadow-md transition-all">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-navy-500 font-semibold text-base leading-snug">
            {item.model}
          </h3>
          <p className="text-slate-400 text-sm mt-0.5">
            {item.storage} · {item.color}
          </p>
        </div>
        <Badge
          label={STATUS_LABELS[item.status]}
          className={STATUS_COLORS[item.status]}
        />
      </div>

      {/* Meta row */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 text-sm">
          <Layers size={13} className="text-slate-400" />
          <Badge label={item.grade} className={GRADE_COLORS[item.grade]} />
        </div>
        <div className="flex items-center gap-1.5 text-sm text-slate-400">
          <Package size={13} />
          <span>
            <span className="text-navy-500 font-medium">{item.availableQty}</span>
            /{item.quantity} pcs
          </span>
        </div>
      </div>

      {/* Price */}
      <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-4 py-3">
        <div className="flex items-center gap-1.5">
          <Tag size={13} className="text-navy-500" />
          <span className="text-slate-400 text-xs">Unit Price</span>
        </div>
        <span className="text-navy-500 font-mono font-semibold text-lg">
          {item.buyerPrice.toLocaleString()} AED
        </span>
      </div>

      {/* Reserve controls */}
      {canReserve && (
        <div className="flex items-center gap-2">
          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="px-3 py-2 text-slate-400 hover:text-navy-500 hover:bg-slate-50 transition-colors text-sm"
            >
              −
            </button>
            <span className="px-3 py-2 text-navy-500 text-sm font-mono min-w-[2.5rem] text-center">
              {qty}
            </span>
            <button
              onClick={() => setQty((q) => Math.min(item.availableQty, q + 1))}
              className="px-3 py-2 text-slate-400 hover:text-navy-500 hover:bg-slate-50 transition-colors text-sm"
            >
              +
            </button>
          </div>
          <button
            onClick={handleReserve}
            disabled={loading}
            className="flex-1 bg-navy-500 hover:bg-navy-600 text-white font-medium rounded-lg py-2 text-sm transition-all disabled:opacity-50"
          >
            {loading ? "..." : success ? "✓ Reserved!" : "Reserve"}
          </button>
        </div>
      )}

      {error && <p className="text-rose-500 text-xs">{error}</p>}

      {canReserve && qty > 1 && (
        <p className="text-slate-400 text-xs text-right">
          Total:{" "}
          <span className="text-navy-500 font-mono font-medium">
            {(item.buyerPrice * qty).toLocaleString()} AED
          </span>
        </p>
      )}
    </div>
  );
}