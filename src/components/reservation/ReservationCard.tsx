"use client";

import { useState } from "react";
import { Calendar, Hash, Building2 } from "lucide-react";
import { Reservation } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { GRADE_COLORS } from "@/lib/constants";
import { updateReservationStatus } from "@/lib/db";
import { useAuth } from "@/hooks/useAuth";
import clsx from "clsx";

const RES_STATUS_COLORS: Record<string, string> = {
  pending: "text-amber-400 bg-amber-400/10 border-amber-400/30",
  confirmed: "text-sky-400 bg-sky-400/10 border-sky-400/30",
  cancelled: "text-surface-400 bg-surface-500/30 border-surface-400/30",
  sold: "text-jade-400 bg-jade-400/10 border-jade-400/30",
};

interface ReservationCardProps {
  reservation: Reservation;
  onUpdated?: () => void;
}

export default function ReservationCard({ reservation: r, onUpdated }: ReservationCardProps) {
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);

  const handle = async (status: "confirmed" | "cancelled" | "sold") => {
    setLoading(status);
    try {
      await updateReservationStatus(
        r.id,
        status,
        r.inventoryItemId,
        r.quantity
      );
      onUpdated?.();
    } finally {
      setLoading(null);
    }
  };

  const snap = r.inventorySnapshot;
  const date = r.createdAt instanceof Date
    ? r.createdAt
    : new Date((r.createdAt as any)?.seconds * 1000 || Date.now());

  return (
    <div className="bg-surface-800 border border-surface-600 rounded-xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-white font-semibold">
            {snap.model}
          </p>
          <p className="text-surface-400 text-sm mt-0.5">
            {snap.storage} · {snap.color}
          </p>
        </div>
        <Badge
          label={r.status.charAt(0).toUpperCase() + r.status.slice(1)}
          className={RES_STATUS_COLORS[r.status]}
        />
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="bg-surface-700 rounded-lg px-3 py-2.5">
          <p className="text-surface-400 text-[10px] uppercase tracking-wider mb-1">Grade</p>
          <Badge label={snap.grade} className={GRADE_COLORS[snap.grade]} />
        </div>
        <div className="bg-surface-700 rounded-lg px-3 py-2.5">
          <p className="text-surface-400 text-[10px] uppercase tracking-wider mb-1">Qty</p>
          <p className="text-white font-mono font-medium">{r.quantity} pcs</p>
        </div>
        <div className="bg-surface-700 rounded-lg px-3 py-2.5">
          <p className="text-surface-400 text-[10px] uppercase tracking-wider mb-1">Unit</p>
          <p className="text-amber-400 font-mono font-medium">{snap.buyerPrice.toLocaleString()} AED</p>
        </div>
        <div className="bg-surface-700 rounded-lg px-3 py-2.5">
          <p className="text-surface-400 text-[10px] uppercase tracking-wider mb-1">Total</p>
          <p className="text-amber-400 font-mono font-semibold">{r.totalPrice.toLocaleString()} AED</p>
        </div>
      </div>

      {/* Buyer info (admin only) */}
      {isAdmin && (
        <div className="flex items-center gap-2 text-sm text-surface-400">
          <Building2 size={13} />
          <span>{r.buyerCompany || r.buyerName}</span>
          <span className="text-surface-600">·</span>
          <span className="text-surface-500 text-xs">{r.buyerName}</span>
        </div>
      )}

      {/* Date */}
      <div className="flex items-center gap-1.5 text-xs text-surface-500">
        <Calendar size={11} />
        {date.toLocaleDateString("en-AE", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
        <span className="ml-auto font-mono text-surface-600">#{r.id.slice(0, 8)}</span>
      </div>

      {/* Admin actions */}
      {isAdmin && r.status === "pending" && (
        <div className="flex gap-2 pt-1">
          <Button
            size="sm"
            onClick={() => handle("confirmed")}
            loading={loading === "confirmed"}
            className="flex-1"
          >
            Confirm
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handle("cancelled")}
            loading={loading === "cancelled"}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      )}

      {isAdmin && r.status === "confirmed" && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => handle("sold")}
          loading={loading === "sold"}
          className="w-full"
        >
          Mark as Sold
        </Button>
      )}

      {/* Buyer cancel */}
      {!isAdmin && r.status === "pending" && (
        <Button
          size="sm"
          variant="danger"
          onClick={() => handle("cancelled")}
          loading={loading === "cancelled"}
          className="w-full"
        >
          Cancel Reservation
        </Button>
      )}
    </div>
  );
}
