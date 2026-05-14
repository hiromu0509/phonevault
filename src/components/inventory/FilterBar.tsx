"use client";

import { Search, SlidersHorizontal, HelpCircle } from "lucide-react";
import { useState } from "react";
import clsx from "clsx";
import GradingModal from "@/components/ui/GradingModal";

interface FilterBarProps {
  search: string;
  onSearch: (v: string) => void;
  statusFilter: string;
  onStatusFilter: (v: string) => void;
  gradeFilter: string;
  onGradeFilter: (v: string) => void;
}

const STATUS_OPTIONS = ["all", "available", "reserved", "confirmed", "sold"];
const GRADE_OPTIONS = ["all", "A+", "A", "A-", "B", "C"];

export default function FilterBar({
  search,
  onSearch,
  statusFilter,
  onStatusFilter,
  gradeFilter,
  onGradeFilter,
}: FilterBarProps) {
  const [gradingOpen, setGradingOpen] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <GradingModal open={gradingOpen} onClose={() => setGradingOpen(false)} />
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search model, color, storage..."
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          className="w-full bg-white border border-slate-200 text-navy-500 placeholder-slate-400 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-navy-500 transition-colors"
        />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <SlidersHorizontal size={14} className="text-slate-400 shrink-0" />
        <div className="flex gap-1.5 flex-wrap">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => onStatusFilter(s)}
              className={clsx(
                "px-3 py-1 rounded-full text-xs font-medium border transition-all capitalize",
                statusFilter === s
                  ? "bg-navy-500 text-white border-navy-500"
                  : "bg-white text-slate-500 border-slate-200 hover:border-navy-500 hover:text-navy-500"
              )}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="w-px h-4 bg-slate-200 hidden sm:block" />
        <div className="flex gap-1.5 flex-wrap items-center">
          {GRADE_OPTIONS.map((g) => (
            <button
              key={g}
              onClick={() => onGradeFilter(g)}
              className={clsx(
                "px-3 py-1 rounded-full text-xs font-mono font-medium border transition-all",
                gradeFilter === g
                  ? "bg-slate-700 text-white border-slate-700"
                  : "bg-white text-slate-500 border-slate-200 hover:border-slate-400 hover:text-slate-700"
              )}
            >
              {g === "all" ? "All Grades" : g}
            </button>
          ))}
          <button
            onClick={() => setGradingOpen(true)}
            className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border border-slate-200 bg-white text-slate-400 hover:text-navy-500 hover:border-navy-500 transition-all"
            title="Grading Guide"
          >
            <HelpCircle size={12} />
            <span className="hidden sm:inline">What&apos;s this?</span>
          </button>
        </div>
      </div>
    </div>
  );
}