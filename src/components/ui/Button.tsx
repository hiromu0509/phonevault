import clsx from "clsx";
import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-amber-400 hover:bg-amber-500 text-surface-900 shadow-glow",
    ghost:
      "bg-transparent hover:bg-surface-700 text-surface-400 hover:text-white",
    danger:
      "bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30",
    outline:
      "bg-transparent border border-surface-500 text-surface-300 hover:border-surface-400 hover:text-white",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      className={clsx(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
}
