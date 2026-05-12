"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import clsx from "clsx";

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
  return (
    <div className="flex flex-col gap-3">
      {/* Search */}
      <div className="relative">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400"
        />
        <input
          type="text"
          placeholder="Search model, color, storage..."
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          className="w-full bg-surface-800 border border-surface-600 text-white placeholder-surface-400 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-amber-400/50 transition-colors"
        />
      </div>

      {/* Filters row */}
      <div className="flex items-center gap-2 flex-wrap">
        <SlidersHorizontal size={14} className="text-surface-400 shrink-0" />
        <div className="flex gap-1.5 flex-wrap">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => onStatusFilter(s)}
              className={clsx(
                "px-3 py-1 rounded-full text-xs font-medium border transition-all capitalize",
                statusFilter === s
                  ? "bg-amber-400 text-surface-900 border-amber-400"
                  : "bg-transparent text-surface-400 border-surface-600 hover:border-surface-500 hover:text-white"
              )}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="w-px h-4 bg-surface-600 hidden sm:block" />
        <div className="flex gap-1.5 flex-wrap">
          {GRADE_OPTIONS.map((g) => (
            <button
              key={g}
              onClick={() => onGradeFilter(g)}
              className={clsx(
                "px-3 py-1 rounded-full text-xs font-mono font-medium border transition-all",
                gradeFilter === g
                  ? "bg-surface-400 text-white border-surface-400"
                  : "bg-transparent text-surface-400 border-surface-600 hover:border-surface-500 hover:text-white"
              )}
            >
              {g === "all" ? "All Grades" : g}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
