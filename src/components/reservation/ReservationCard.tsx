"use client";

import { useState } from "react";
import { Calendar, Building2, FileDown } from "lucide-react";
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
  cancelled: "text-slate-400 bg-slate-100 border-slate-300",
  sold: "text-jade-400 bg-jade-400/10 border-jade-400/30",
};

interface ReservationCardProps {
  reservation: Reservation;
  onUpdated?: () => void;
}

function downloadInvoice(r: Reservation) {
  const snap = r.inventorySnapshot;
  const date = r.createdAt instanceof Date
    ? r.createdAt
    : new Date((r.createdAt as any)?.seconds * 1000 || Date.now());

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Invoice #${r.id.slice(0, 8)}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; color: #1a1a1a; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
    .logo { font-size: 24px; font-weight: bold; color: #1E3A8A; }
    .logo span { font-size: 12px; color: #888; display: block; font-weight: normal; }
    .invoice-title { font-size: 32px; font-weight: bold; color: #1E3A8A; }
    .invoice-meta { color: #666; font-size: 14px; margin-top: 4px; }
    .section { margin-bottom: 24px; }
    .section-title { font-size: 12px; text-transform: uppercase; color: #888; letter-spacing: 1px; margin-bottom: 8px; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #1E3A8A; color: white; padding: 10px 14px; text-align: left; font-size: 13px; }
    td { padding: 12px 14px; border-bottom: 1px solid #eee; font-size: 14px; }
    .total-row td { font-weight: bold; font-size: 16px; background: #f8f9fa; }
    .status { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; background: #e0f2fe; color: #0284c7; }
    .footer { margin-top: 60px; text-align: center; color: #aaa; font-size: 12px; }
    .buyer-info { background: #f8f9fa; border-radius: 8px; padding: 16px; }
    .buyer-info p { margin: 4px 0; font-size: 14px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">
      👑 Best of Best
      <span>Wholesale Platform</span>
    </div>
    <div style="text-align:right">
      <div class="invoice-title">INVOICE</div>
      <div class="invoice-meta">#${r.id.slice(0, 8).toUpperCase()}</div>
      <div class="invoice-meta">${date.toLocaleDateString("en-AE", { day: "numeric", month: "long", year: "numeric" })}</div>
      <div style="margin-top:8px"><span class="status">Confirmed</span></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Bill To</div>
    <div class="buyer-info">
      <p><strong>${r.buyerCompany || r.buyerName}</strong></p>
      <p>${r.buyerName}</p>
    </div>
  </div>

  <div class="section">
    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th>Storage</th>
          <th>Grade</th>
          <th>Qty</th>
          <th>Unit Price</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>${snap.model}</td>
          <td>${snap.storage}</td>
          <td>${snap.grade}</td>
          <td>${r.quantity} pcs</td>
          <td>${snap.buyerPrice.toLocaleString()} AED</td>
          <td>${r.totalPrice.toLocaleString()} AED</td>
        </tr>
        <tr class="total-row">
          <td colspan="5" style="text-align:right">Total</td>
          <td>${r.totalPrice.toLocaleString()} AED</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="footer">
    Best of Best Wholesale · Dubai, UAE<br/>
    Thank you for your business!
  </div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Invoice_${r.id.slice(0, 8)}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ReservationCard({ reservation: r, onUpdated }: ReservationCardProps) {
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);

  const handle = async (status: "confirmed" | "cancelled" | "sold") => {
    setLoading(status);
    try {
      await updateReservationStatus(r.id, status, r.inventoryItemId, r.quantity);
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
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-navy-500 font-semibold">{snap.model}</p>
          <p className="text-slate-400 text-sm mt-0.5">{snap.storage} · {snap.color}</p>
        </div>
        <Badge
          label={r.status.charAt(0).toUpperCase() + r.status.slice(1)}
          className={RES_STATUS_COLORS[r.status]}
        />
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="bg-slate-50 rounded-lg px-3 py-2.5">
          <p className="text-slate-400 text-[10px] uppercase tracking-wider mb-1">Grade</p>
          <Badge label={snap.grade} className={GRADE_COLORS[snap.grade]} />
        </div>
        <div className="bg-slate-50 rounded-lg px-3 py-2.5">
          <p className="text-slate-400 text-[10px] uppercase tracking-wider mb-1">Qty</p>
          <p className="text-navy-500 font-mono font-medium">{r.quantity} pcs</p>
        </div>
        <div className="bg-slate-50 rounded-lg px-3 py-2.5">
          <p className="text-slate-400 text-[10px] uppercase tracking-wider mb-1">Unit</p>
          <p className="text-amber-500 font-mono font-medium">{snap.buyerPrice.toLocaleString()} AED</p>
        </div>
        <div className="bg-slate-50 rounded-lg px-3 py-2.5">
          <p className="text-slate-400 text-[10px] uppercase tracking-wider mb-1">Total</p>
          <p className="text-amber-500 font-mono font-semibold">{r.totalPrice.toLocaleString()} AED</p>
        </div>
      </div>

      {isAdmin && (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Building2 size={13} />
          <span>{r.buyerCompany || r.buyerName}</span>
          <span className="text-slate-300">·</span>
          <span className="text-slate-400 text-xs">{r.buyerName}</span>
        </div>
      )}

      <div className="flex items-center gap-1.5 text-xs text-slate-400">
        <Calendar size={11} />
        {date.toLocaleDateString("en-AE", {
          day: "numeric", month: "short", year: "numeric",
          hour: "2-digit", minute: "2-digit",
        })}
        <span className="ml-auto font-mono text-slate-300">#{r.id.slice(0, 8)}</span>
      </div>

      {/* Admin actions */}
      {isAdmin && r.status === "pending" && (
        <div className="flex gap-2 pt-1">
          <Button size="sm" onClick={() => handle("confirmed")} loading={loading === "confirmed"} className="flex-1">
            Confirm
          </Button>
          <Button size="sm" variant="danger" onClick={() => handle("cancelled")} loading={loading === "cancelled"} className="flex-1">
            Cancel
          </Button>
        </div>
      )}

      {isAdmin && r.status === "confirmed" && (
        <div className="flex gap-2 pt-1">
          <Button size="sm" variant="outline" onClick={() => handle("sold")} loading={loading === "sold"} className="flex-1">
            Mark as Sold
          </Button>
          <Button size="sm" variant="ghost" onClick={() => downloadInvoice(r)} className="flex-1 flex items-center gap-1">
            <FileDown size={14} />
            Invoice
          </Button>
        </div>
      )}

      {/* Buyer: confirmed → download invoice */}
      {!isAdmin && r.status === "confirmed" && (
        <Button size="sm" variant="ghost" onClick={() => downloadInvoice(r)} className="w-full flex items-center gap-2">
          <FileDown size={14} />
          Download Invoice
        </Button>
      )}

      {!isAdmin && r.status === "pending" && (
        <Button size="sm" variant="danger" onClick={() => handle("cancelled")} loading={loading === "cancelled"} className="w-full">
          Cancel Reservation
        </Button>
      )}
    </div>
  );
}