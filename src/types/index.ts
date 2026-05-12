// ─── User ───────────────────────────────────────────────────────────────────
export type UserRole = "admin" | "buyer";

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  companyName: string;
  approved: boolean;
  createdAt: Date;
}

// ─── Inventory ───────────────────────────────────────────────────────────────
export type PhoneGrade = "A+" | "A" | "A-" | "B" | "C";
export type ItemStatus = "available" | "reserved" | "confirmed" | "sold";

export interface InventoryItem {
  id: string;
  model: string;
  storage: string;
  color: string;
  grade: PhoneGrade;
  quantity: number;
  availableQty: number;
  sellerPrice: number;       // what seller charges
  buyerPrice: number;        // sellerPrice + COMMISSION (20 AED)
  status: ItemStatus;
  importedAt: Date;
  updatedAt: Date;
  importedBy: string;        // admin uid
  notes?: string;
}

// ─── Reservation ─────────────────────────────────────────────────────────────
export type ReservationStatus = "pending" | "confirmed" | "cancelled" | "sold";

export interface Reservation {
  id: string;
  inventoryItemId: string;
  inventorySnapshot: {
    model: string;
    storage: string;
    grade: PhoneGrade;
    color: string;
    buyerPrice: number;
  };
  quantity: number;
  totalPrice: number;
  buyerUid: string;
  buyerName: string;
  buyerCompany: string;
  status: ReservationStatus;
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
}

// ─── Parser ──────────────────────────────────────────────────────────────────
export interface ParsedInventoryItem {
  model: string;
  storage: string;
  color: string;
  grade: PhoneGrade;
  quantity: number;
  sellerPrice: number;
  rawText: string;
}

export interface ParseResult {
  items: ParsedInventoryItem[];
  errors: string[];
}
