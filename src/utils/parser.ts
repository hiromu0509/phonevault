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
];

// ─── 国旗マッピング ───────────────────────────────────────────────────────────
const COUNTRY_MAP: { pattern: RegExp; flag: string; country: string }[] = [
  { pattern: /\bjapan\b/i, flag: "🇯🇵", country: "Japan" },
  { pattern: /\bjaponese\b/i, flag: "🇯🇵", country: "Japan" },
  { pattern: /\bus\b|\busa\b|\bamerica\b|\bamerican\b/i, flag: "🇺🇸", country: "US" },
  { pattern: /\buk\b|\bbritain\b|\bengland\b/i, flag: "🇬🇧", country: "UK" },
];

function detectCountry(block: string): { flag: string; country: string } | null {
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

  let storage = "128GB";
  const storageMatch = block.match(STORAGE_PATTERN);
  if (storageMatch) storage = `${storageMatch[1]}GB`;

  let color = "Unknown";
  for (const c of COLOR_KEYWORDS) {
    if (new RegExp(`\\b${c}\\b`, "i").test(block)) {
      color = c;
      break;
    }
  }

  let grade: PhoneGrade = "A";
  for (const { pattern, grade: g } of GRADE_PATTERNS) {
    if (pattern.test(block)) {
      grade = g;
      break;
    }
  }

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

  let quantity = 1;
  for (const pattern of QTY_PATTERNS) {
    const m = block.match(pattern);
    if (m) { quantity = parseInt(m[1], 10); break; }
  }

  if (!sellerPrice) return null;

  // 国旗検出
  const countryInfo = detectCountry(block);

  const model = modelLine
    .replace(STORAGE_PATTERN, "")
    .replace(new RegExp(COLOR_KEYWORDS.join("|"), "gi"), "")
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

export const SAMPLE_WHATSAPP_INPUT = `iPhone 14 Pro 256 Purple
Japan
A Grade
2450 AED
5 pcs

iPhone 13 128GB Black
US
A- Grade
1650 AED
10 pcs

Samsung S24 Ultra 512GB Titanium Black
UK
A+ Grade
3200 AED
3 pcs`;