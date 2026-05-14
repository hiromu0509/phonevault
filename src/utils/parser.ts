import * as XLSX from "xlsx";
import { ParsedInventoryItem, ParseResult, PhoneGrade } from "@/types";
import { COMMISSION_AED } from "@/lib/constants";

const GRADE_PATTERNS: { pattern: RegExp; grade: PhoneGrade }[] = [
  { pattern: /\bA\+\s*grade\b/i, grade: "A+" },
  { pattern: /\bA-\s*grade\b/i, grade: "A-" },
  { pattern: /\bA\s*grade\b/i, grade: "A" },
  { pattern: /\bB\s*grade\b/i, grade: "B" },
  { pattern: /\bC\s*grade\b/i, grade: "C" },
  { pattern: /\bgrade\s*A\+/i, grade: "A+" },
  { pattern: /\bgrade\s*A-/i, grade: "A-" },
  { pattern: /\bgrade\s*A\b/i, grade: "A" },
  { pattern: /\bgrade\s*B\b/i, grade: "B" },
  { pattern: /\bgrade\s*C\b/i, grade: "C" },
];

const STORAGE_PATTERN = /\b(\d+)\s*[Gg][Bb]\b/;
const PRICE_PATTERN = /(\d{3,6})\s*(?:AED|aed|Aed)?/;
const QTY_PATTERNS = [
  /(\d+)\s*(?:pcs?|pieces?|units?|qty)/i,
  /(?:qty|quantity|units?)\s*[:\-]?\s*(\d+)/i,
  /x\s*(\d+)/i,
];

const COLOR_KEYWORDS = [
  "Black", "White", "Silver", "Gold", "Blue", "Red", "Green",
  "Purple", "Yellow", "Pink", "Titanium", "Graphite", "Midnight",
  "Starlight", "Deep Purple", "Sierra Blue", "Alpine Green",
  "Space Gray", "Space Grey", "Natural", "Desert", "Coral",
  "Orange", "Orenge", "Violet", "Teal", "Lavender", "Cream",
  "Beige", "Rose", "Burgundy", "Navy",
];

// ─── 国マッピング ─────────────────────────────────────────────────────────────
const COUNTRY_MAP: { pattern: RegExp; flag: string; country: string }[] = [
  { pattern: /\bjapan\b/i, flag: "🇯🇵", country: "Japan" },
  { pattern: /\bus\b|\busa\b|\bamerica\b/i, flag: "🇺🇸", country: "USA" },
  { pattern: /\buk\b|\bbritain\b|\bengland\b/i, flag: "🇬🇧", country: "UK" },
];

export function detectCountry(block: string): { flag: string; country: string } | null {
  for (const { pattern, flag, country } of COUNTRY_MAP) {
    if (pattern.test(block)) return { flag, country };
  }
  return null;
}

function splitIntoBlocks(raw: string): string[] {
  return raw
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter((b) => b.length > 0);
}

function parseBlock(block: string): ParsedInventoryItem | null {
  const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return null;

  const modelLine = lines[0];

  // ── Storage: モデル名の数字(256等)もGBとして認識 ──
  let storage = "128GB";
  const storageMatch = block.match(STORAGE_PATTERN);
  if (storageMatch) {
    storage = `${storageMatch[1]}GB`;
  } else {
    // GBなしで数字だけの場合（例: 256）
    const numMatch = modelLine.match(/\b(64|128|256|512|1024)\b/);
    if (numMatch) storage = `${numMatch[1]}GB`;
  }

  // ── Color ──
  let color = "Unknown";
  for (const c of COLOR_KEYWORDS) {
    if (new RegExp(`\\b${c}\\b`, "i").test(block)) {
      color = c.charAt(0).toUpperCase() + c.slice(1).toLowerCase();
      break;
    }
  }

  // ── Grade ──
  let grade: PhoneGrade = "A";
  for (const { pattern, grade: g } of GRADE_PATTERNS) {
    if (pattern.test(block)) {
      grade = g;
      break;
    }
  }

  // ── Price ──
  let sellerPrice = 0;
  for (const line of lines) {
    if (/aed|price/i.test(line)) {
      const m = line.match(PRICE_PATTERN);
      if (m) { sellerPrice = parseInt(m[1], 10); break; }
    }
  }
  if (!sellerPrice) {
    for (const line of lines) {
      const m = line.match(/\b(\d{3,6})\b/);
      if (m) {
        const candidate = parseInt(m[1], 10);
        if (candidate >= 100 && candidate <= 99999) {
          sellerPrice = candidate;
          break;
        }
      }
    }
  }

  // ── Quantity ──
  let quantity = 1;
  for (const pattern of QTY_PATTERNS) {
    const m = block.match(pattern);
    if (m) { quantity = parseInt(m[1], 10); break; }
  }

  if (!sellerPrice) return null;

  // ── 国検出 ──
  const countryInfo = detectCountry(block);

  // ── モデル名クリーンアップ ──
  const model = modelLine
    .replace(STORAGE_PATTERN, "")
    .replace(/\b(64|128|256|512|1024)\b/, "")
    .replace(new RegExp(`\\b(${COLOR_KEYWORDS.join("|")})\\b`, "gi"), "")
    .replace(/\s+/g, " ")
    .trim();

  return {
    model: model || modelLine,
    storage,
    color,
    grade,
    quantity,
    sellerPrice,
    rawText: block,
    flag: countryInfo?.flag ?? null,
    country: countryInfo?.country ?? null,
  };
}

export function parseWhatsAppInventory(raw: string): ParseResult {
  const blocks = splitIntoBlocks(raw);
  const items: ParsedInventoryItem[] = [];
  const errors: string[] = [];

  blocks.forEach((block, idx) => {
    const item = parseBlock(block);
    if (item) {
      items.push(item);
    } else {
      errors.push(`Block ${idx + 1} could not be parsed: "${block.slice(0, 60)}..."`);
    }
  });

  return { items, errors };
}

export function parsedItemToFirestore(
  item: ParsedInventoryItem,
  adminUid: string
) {
  return {
    model: item.model,
    storage: item.storage,
    color: item.color,
    grade: item.grade,
    quantity: item.quantity,
    availableQty: item.quantity,
    sellerPrice: item.sellerPrice,
    buyerPrice: item.sellerPrice + COMMISSION_AED,
    status: "available",
    importedAt: new Date(),
    updatedAt: new Date(),
    importedBy: adminUid,
    notes: "",
    flag: item.flag ?? null,
    country: item.country ?? null,
  };
}

// ─── Excel parser ────────────────────────────────────────────────────────────

export async function parseExcelInventory(file: File): Promise<ParseResult> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: "" });

  const items: ParsedInventoryItem[] = [];
  const errors: string[] = [];

  const norm = (s: string) => s.toLowerCase().replace(/[\s_\-]/g, "");

  rows.forEach((row, idx) => {
    const rowNum = idx + 2;
    const keys = Object.keys(row);
    const get = (...patterns: string[]) => {
      for (const p of patterns) {
        const k = keys.find((k) => norm(k).includes(p));
        if (k && String(row[k]).trim()) return String(row[k]).trim();
      }
      return "";
    };

    const model = get("model", "phone", "device", "name", "item");
    if (!model) { errors.push(`Row ${rowNum}: model column not found`); return; }

    const storageRaw = get("storage", "capacity", "size", "memory");
    let storage = "128GB";
    if (storageRaw) {
      storage = /gb/i.test(storageRaw) ? storageRaw.toUpperCase() : storageRaw + "GB";
    } else {
      const m = model.match(/\b(64|128|256|512|1024)\b/);
      if (m) storage = m[0] + "GB";
    }

    const color = get("color", "colour") || "Unknown";

    const gradeRaw = get("grade", "condition", "quality");
    const grade = (["A+", "A-", "A", "B", "C"].find((g) =>
      gradeRaw.toUpperCase().replace(/\s/g, "").includes(g)
    ) ?? "A") as PhoneGrade;

    const priceRaw = get("price", "aed", "cost", "amount", "sellerprice", "seller");
    const sellerPrice = parseInt(priceRaw.replace(/[^\d]/g, "")) || 0;
    if (!sellerPrice) { errors.push(`Row ${rowNum}: price not found`); return; }

    const qtyRaw = get("qty", "quantity", "pcs", "count", "stock", "units", "pieces");
    const quantity = parseInt(qtyRaw) || 1;

    const countryRaw = get("country", "region", "origin");
    const countryInfo = countryRaw ? detectCountry(countryRaw) : null;

    items.push({
      model,
      storage,
      color,
      grade,
      quantity,
      sellerPrice,
      rawText: JSON.stringify(row),
      flag: countryInfo?.flag ?? null,
      country: countryInfo?.country ?? (countryRaw || null),
    });
  });

  return { items, errors };
}

// ─── AI image response → ParsedInventoryItem ────────────────────────────────

export function aiResponseToItems(
  aiItems: Array<{
    model: string; storage?: string; color?: string; grade?: string;
    price: number; quantity?: number; country?: string;
  }>
): ParseResult {
  const items: ParsedInventoryItem[] = [];
  const errors: string[] = [];

  aiItems.forEach((item, i) => {
    if (!item.model || !item.price) {
      errors.push(`Item ${i + 1}: missing model or price`);
      return;
    }
    const countryInfo = item.country ? detectCountry(item.country) : null;
    items.push({
      model: item.model,
      storage: item.storage || "128GB",
      color: item.color || "Unknown",
      grade: (["A+", "A-", "A", "B", "C"].includes(item.grade ?? "") ? item.grade : "A") as PhoneGrade,
      quantity: item.quantity || 1,
      sellerPrice: item.price,
      rawText: JSON.stringify(item),
      flag: countryInfo?.flag ?? null,
      country: countryInfo?.country ?? (item.country || null),
    });
  });

  return { items, errors };
}

export const SAMPLE_WHATSAPP_INPUT = `iPhone 17 Pro 256 Orange
Japan
A Grade
7070 AED
50 pcs

iPhone 14 Pro 256 Purple
USA
A Grade
2450 AED
5 pcs

Samsung S24 Ultra 512GB Black
UK
A+ Grade
3200 AED
3 pcs`;