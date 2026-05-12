import clsx from "clsx";

interface BadgeProps {
  label: string;
  className?: string;
}

export function Badge({ label, className }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium border",
        className
      )}
    >
      {label}
    </span>
  );
}
