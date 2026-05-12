// Business logic constants
export const COMMISSION_AED = 20;

// Firestore collection names
export const COLLECTIONS = {
  USERS: "users",
  INVENTORY: "inventory",
  RESERVATIONS: "reservations",
} as const;

// Grade display config
export const GRADE_COLORS: Record<string, string> = {
  "A+": "text-jade-400 bg-jade-400/10 border-jade-400/30",
  A: "text-jade-400 bg-jade-400/10 border-jade-400/20",
  "A-": "text-amber-400 bg-amber-400/10 border-amber-400/30",
  B: "text-amber-500 bg-amber-500/10 border-amber-500/30",
  C: "text-rose-400 bg-rose-400/10 border-rose-400/30",
};

// Status display config
export const STATUS_COLORS: Record<string, string> = {
  available: "text-jade-400 bg-jade-400/10 border-jade-400/30",
  reserved: "text-amber-400 bg-amber-400/10 border-amber-400/30",
  confirmed: "text-sky-400 bg-sky-400/10 border-sky-400/30",
  sold: "text-surface-400 bg-surface-500/50 border-surface-400/30",
};

export const STATUS_LABELS: Record<string, string> = {
  available: "Available",
  reserved: "Reserved",
  confirmed: "Confirmed",
  sold: "Sold",
};
