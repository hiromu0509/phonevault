"use client";

import AuthGuard from "@/components/layout/AuthGuard";
import AppShell from "@/components/layout/AppShell";

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
      "Includes accessories / box (or equivalent)",
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
      "Minimal signs of use only (normal wear)",
      "No visible scratches or marks",
      "Battery health 85%+",
      "Screen and body in clear condition",
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
      "Small signs of use on body",
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
      "Visible scuffs on screen possible",
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
      "Significant cosmetic damage",
      "Core functions operational (some limitations possible)",
    ],
  },
];

export default function GradingPage() {
  return (
    <AuthGuard>
      <AppShell>
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-navy-500 text-2xl font-semibold">Grading Standards</h1>
            <p className="text-slate-400 text-sm mt-1">
              Device condition criteria used by Best of Best.
            </p>
          </div>

          <div className="space-y-4">
            {grades.map(({ grade, label, color, border, bg, dot, points }) => (
              <div
                key={grade}
                className={`rounded-xl border ${border} ${bg} p-5`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-xl border-2 ${border} bg-white flex items-center justify-center`}>
                    <span className={`font-bold text-lg ${color}`}>{grade}</span>
                  </div>
                  <div>
                    <p className={`font-semibold text-base ${color}`}>{grade}</p>
                    <p className="text-slate-500 text-sm">{label}</p>
                  </div>
                </div>
                <ul className="space-y-1.5">
                  {points.map((point) => (
                    <li key={point} className="flex items-start gap-2 text-slate-600 text-sm">
                      <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-6 bg-slate-50 border border-slate-200 rounded-xl p-4">
            <p className="text-slate-400 text-xs leading-relaxed">
              * All devices are factory reset. Battery health is approximate and may vary by unit.
              Please refer to individual product notes for details.
            </p>
          </div>
        </div>
      </AppShell>
    </AuthGuard>
  );
}
