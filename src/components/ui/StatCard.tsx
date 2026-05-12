import clsx from "clsx";

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accent?: "amber" | "jade" | "sky" | "rose";
}

export function StatCard({ label, value, sub, accent = "amber" }: StatCardProps) {
  const accents = {
    amber: "text-amber-400",
    jade: "text-jade-400",
    sky: "text-sky-400",
    rose: "text-rose-400",
  };

  return (
    <div className="bg-surface-800 border border-surface-600 rounded-xl p-5">
      <p className="text-surface-400 text-xs uppercase tracking-widest font-mono mb-3">
        {label}
      </p>
      <p className={clsx("text-3xl font-semibold", accents[accent])}>{value}</p>
      {sub && <p className="text-surface-400 text-xs mt-1">{sub}</p>}
    </div>
  );
}
