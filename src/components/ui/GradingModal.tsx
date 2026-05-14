"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

const grades = [
  {
    grade: "A+",
    label: "Like New",
    color: "text-emerald-600",
    border: "border-emerald-300",
    bg: "bg-emerald-50",
    dot: "bg-emerald-500",
    points: [
      "Unused or opened-but-unused condition",
      "No scratches, marks, or dents whatsoever",
      "Battery health 95%+",
      "All functions working perfectly",
    ],
  },
  {
    grade: "A",
    label: "Excellent",
    color: "text-emerald-500",
    border: "border-emerald-200",
    bg: "bg-emerald-50/60",
    dot: "bg-emerald-400",
    points: [
      "Minimal signs of use only",
      "No visible scratches or marks",
      "Battery health 85%+",
      "All functions working perfectly",
    ],
  },
  {
    grade: "A-",
    label: "Very Good",
    color: "text-amber-600",
    border: "border-amber-300",
    bg: "bg-amber-50",
    dot: "bg-amber-500",
    points: [
      "Minor fine scratches (not noticeable in use)",
      "Possible light scuffs on screen",
      "Battery health 80%+",
      "All functions working perfectly",
    ],
  },
  {
    grade: "B",
    label: "Good",
    color: "text-orange-600",
    border: "border-orange-300",
    bg: "bg-orange-50",
    dot: "bg-orange-500",
    points: [
      "Visible scratches or scuffs on body",
      "Possible minor dents",
      "Battery health 75%+",
      "All functions working normally",
    ],
  },
  {
    grade: "C",
    label: "Fair",
    color: "text-red-600",
    border: "border-red-300",
    bg: "bg-red-50",
    dot: "bg-red-500",
    points: [
      "Clear scratches, dents, or cracks visible",
      "Possible screen damage or display issues",
      "Battery health 70%+",
      "Core functions operational (some limitations possible)",
    ],
  },
];

interface GradingModalProps {
  open: boolean;
  onClose: () => void;
}

export default function GradingModal({ open, onClose }: GradingModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative bg-white border border-slate-200 rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 sticky top-0 bg-white rounded-t-2xl">
          <div>
            <h2 className="text-navy-500 font-semibold text-base">Grading Guide</h2>
            <p className="text-slate-400 text-xs mt-0.5">Device condition standards</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Grade list */}
        <div className="p-4 space-y-3">
          {grades.map(({ grade, label, color, border, bg, dot, points }) => (
            <div key={grade} className={`rounded-xl border ${border} ${bg} p-4`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-lg border-2 ${border} bg-white flex items-center justify-center shrink-0`}>
                  <span className={`font-bold text-sm ${color}`}>{grade}</span>
                </div>
                <div>
                  <span className={`font-semibold text-sm ${color}`}>{grade}</span>
                  <span className="text-slate-500 text-sm ml-2">— {label}</span>
                </div>
              </div>
              <ul className="space-y-1">
                {points.map((point) => (
                  <li key={point} className="flex items-start gap-2 text-slate-600 text-xs">
                    <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <p className="text-slate-400 text-xs px-1 pb-1">
            * All devices are factory reset. Battery health is approximate and may vary.
          </p>
        </div>
      </div>
    </div>
  );
}
