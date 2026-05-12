/**
 * SEED SCRIPT — Run this once to populate Firestore with dummy data.
 *
 * Usage:
 *   1. npm install -g ts-node
 *   2. Set GOOGLE_APPLICATION_CREDENTIALS or use Firebase Admin SDK service account
 *   3. ts-node src/scripts/seed.ts
 *
 * OR: Use the Admin Import page in the UI with the sample WhatsApp text.
 *
 * The SAMPLE_WHATSAPP_INPUT in src/utils/parser.ts can be loaded directly
 * from the admin import page — click "Load sample" and then "Parse" → "Import".
 */

// ─── Dummy inventory items (mirroring what the parser would produce) ──────────
export const DUMMY_INVENTORY = [
  {
    model: "iPhone 15 Pro Max",
    storage: "256GB",
    color: "Natural Titanium",
    grade: "A+",
    quantity: 5,
    availableQty: 5,
    sellerPrice: 4200,
    buyerPrice: 4220,
    status: "available",
  },
  {
    model: "iPhone 15 Pro",
    storage: "128GB",
    color: "Black Titanium",
    grade: "A",
    quantity: 8,
    availableQty: 8,
    sellerPrice: 3600,
    buyerPrice: 3620,
    status: "available",
  },
  {
    model: "iPhone 14 Pro",
    storage: "256GB",
    color: "Deep Purple",
    grade: "A",
    quantity: 5,
    availableQty: 3,
    sellerPrice: 2450,
    buyerPrice: 2470,
    status: "available",
  },
  {
    model: "iPhone 14",
    storage: "128GB",
    color: "Midnight",
    grade: "A-",
    quantity: 12,
    availableQty: 12,
    sellerPrice: 1800,
    buyerPrice: 1820,
    status: "available",
  },
  {
    model: "iPhone 13",
    storage: "128GB",
    color: "Starlight",
    grade: "A",
    quantity: 10,
    availableQty: 10,
    sellerPrice: 1650,
    buyerPrice: 1670,
    status: "available",
  },
  {
    model: "iPhone 13 Pro",
    storage: "256GB",
    color: "Sierra Blue",
    grade: "A-",
    quantity: 6,
    availableQty: 0,
    sellerPrice: 2100,
    buyerPrice: 2120,
    status: "reserved",
  },
  {
    model: "iPhone 12",
    storage: "64GB",
    color: "White",
    grade: "B",
    quantity: 8,
    availableQty: 8,
    sellerPrice: 900,
    buyerPrice: 920,
    status: "available",
  },
  {
    model: "Samsung Galaxy S24 Ultra",
    storage: "512GB",
    color: "Titanium Black",
    grade: "A+",
    quantity: 3,
    availableQty: 3,
    sellerPrice: 3200,
    buyerPrice: 3220,
    status: "available",
  },
  {
    model: "Samsung Galaxy S24",
    storage: "256GB",
    color: "Cobalt Violet",
    grade: "A",
    quantity: 7,
    availableQty: 7,
    sellerPrice: 2200,
    buyerPrice: 2220,
    status: "available",
  },
  {
    model: "Samsung Galaxy A55",
    storage: "256GB",
    color: "Awesome Navy",
    grade: "A",
    quantity: 15,
    availableQty: 15,
    sellerPrice: 950,
    buyerPrice: 970,
    status: "available",
  },
];

// ─── Instructions ─────────────────────────────────────────────────────────────
console.log(`
To seed the database:

OPTION A (Recommended) — Use the UI:
  1. Run: npm run dev
  2. Create an admin user in Firebase Console (Authentication > Add user)
  3. In Firestore Console, create a document in 'users' collection:
     - Document ID: <user-uid>
     - Fields: { role: "admin", displayName: "Admin", email: "...", approved: true, companyName: "HQ" }
  4. Log in and go to /admin/import
  5. Click "Load sample" → Parse → Import

OPTION B — Firebase Console:
  - Copy the DUMMY_INVENTORY array items above into Firestore manually
  - Collection: 'inventory'
  - Add importedAt, updatedAt, importedBy fields as needed
`);
