# PhoneVault — B2B Mobile Phone Wholesale Platform

A closed B2B wholesale marketplace for mobile phone dealers. Only approved business accounts can access inventory, make reservations, and manage stock.

---

## Quick Start

```bash
git clone <repo>
cd phonevault
npm install
cp .env.example .env.local   # Fill in your Firebase credentials
npm run dev
```

---

## Project Structure

```
phonevault/
├── src/
│   ├── app/                        # Next.js App Router pages
│   │   ├── layout.tsx              # Root layout (fonts, providers)
│   │   ├── page.tsx                # Redirects → /dashboard
│   │   ├── globals.css             # Tailwind base + custom styles
│   │   ├── login/
│   │   │   └── page.tsx            # Login page
│   │   ├── dashboard/
│   │   │   └── page.tsx            # Inventory dashboard
│   │   ├── reservations/
│   │   │   └── page.tsx            # Reservations list
│   │   └── admin/
│   │       ├── import/
│   │       │   └── page.tsx        # WhatsApp import (admin only)
│   │       └── users/
│   │           └── page.tsx        # User management (admin only)
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.tsx        # Desktop + mobile layout wrapper
│   │   │   ├── Sidebar.tsx         # Desktop sidebar nav
│   │   │   ├── MobileNav.tsx       # Bottom nav for mobile
│   │   │   └── AuthGuard.tsx       # Route protection HOC
│   │   ├── inventory/
│   │   │   ├── InventoryCard.tsx   # Phone item card with reserve button
│   │   │   └── FilterBar.tsx       # Search + filter controls
│   │   ├── reservation/
│   │   │   └── ReservationCard.tsx # Reservation card with admin actions
│   │   └── ui/
│   │       ├── Badge.tsx           # Status / grade badge
│   │       ├── Button.tsx          # Reusable button
│   │       └── StatCard.tsx        # Dashboard stat tile
│   ├── hooks/
│   │   └── useAuth.tsx             # Auth context + provider
│   ├── lib/
│   │   ├── firebase.ts             # Firebase init
│   │   ├── db.ts                   # All Firestore operations
│   │   └── constants.ts            # COMMISSION_AED, colors, labels
│   ├── types/
│   │   └── index.ts                # TypeScript interfaces
│   └── utils/
│       └── parser.ts               # WhatsApp text → inventory parser
├── .env.example                    # Environment variable template
├── tailwind.config.js
├── next.config.js
└── tsconfig.json
```

---

## Firebase Setup (Step by Step)

### 1. Create Firebase Project

1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add project** → name it `phonevault` → Create
3. Disable Google Analytics (not needed)

### 2. Enable Authentication

1. In Firebase Console → **Authentication** → Get Started
2. Click **Email/Password** → Enable → Save

### 3. Create Firestore Database

1. **Firestore Database** → Create Database
2. Choose **production mode** (we add rules below)
3. Select a region close to your users (e.g., `europe-west1`)

### 4. Firestore Security Rules

In **Firestore → Rules**, paste:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isAuthed() {
      return request.auth != null;
    }

    function isAdmin() {
      return isAuthed() &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Users: authenticated users can read their own, admins read all
    match /users/{uid} {
      allow read: if isAuthed() && (request.auth.uid == uid || isAdmin());
      allow write: if isAdmin();
      // Allow user to create their own profile on first login
      allow create: if isAuthed() && request.auth.uid == uid;
    }

    // Inventory: all authenticated users can read, only admin can write
    match /inventory/{itemId} {
      allow read: if isAuthed();
      allow write: if isAdmin();
    }

    // Reservations: authenticated users can create; can read own; admins read/write all
    match /reservations/{resId} {
      allow create: if isAuthed();
      allow read: if isAuthed() &&
        (resource.data.buyerUid == request.auth.uid || isAdmin());
      allow update: if isAdmin();
      allow delete: if isAdmin();
    }
  }
}
```

### 5. Get Firebase Config

1. Firebase Console → ⚙️ Project Settings → Your Apps → Add Web App
2. Register app → copy the config object values
3. Paste into `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=phonevault-xxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=phonevault-xxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=phonevault-xxx.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123:web:abc123
```

---

## Creating the First Admin User

1. Firebase Console → **Authentication** → **Add user**
   - Email: `admin@yourcompany.com`
   - Password: (strong password)
   - Copy the **User UID**

2. **Firestore** → Create collection `users` → New document
   - Document ID: `<paste-uid-here>`
   - Fields:
     ```
     email        (string)  admin@yourcompany.com
     displayName  (string)  Admin
     role         (string)  admin
     companyName  (string)  HQ
     approved     (boolean) true
     createdAt    (timestamp) <now>
     ```

3. Log in at `/login` with your admin credentials.

---

## Firestore Schema

### `users/{uid}`
```typescript
{
  email: string
  displayName: string
  role: "admin" | "buyer"
  companyName: string
  approved: boolean
  createdAt: Timestamp
}
```

### `inventory/{id}`
```typescript
{
  model: string           // "iPhone 14 Pro"
  storage: string         // "256GB"
  color: string           // "Deep Purple"
  grade: "A+" | "A" | "A-" | "B" | "C"
  quantity: number        // total original qty
  availableQty: number    // decreases on reservation
  sellerPrice: number     // what supplier charges
  buyerPrice: number      // sellerPrice + 20 AED commission
  status: "available" | "reserved" | "confirmed" | "sold"
  importedAt: Timestamp
  updatedAt: Timestamp
  importedBy: string      // admin uid
  notes: string
}
```

### `reservations/{id}`
```typescript
{
  inventoryItemId: string
  inventorySnapshot: {    // snapshot at time of reservation
    model: string
    storage: string
    grade: string
    color: string
    buyerPrice: number
  }
  quantity: number
  totalPrice: number      // buyerPrice × quantity
  buyerUid: string
  buyerName: string
  buyerCompany: string
  status: "pending" | "confirmed" | "cancelled" | "sold"
  createdAt: Timestamp
  updatedAt: Timestamp
  notes: string
}
```

---

## Commission Logic

```
COMMISSION_AED = 20

buyerPrice = sellerPrice + COMMISSION_AED
```

This is applied automatically at import time (`src/lib/constants.ts` → `COMMISSION_AED`).
To change the commission, update only that constant.

---

## WhatsApp Parser

Paste raw WhatsApp messages (separated by blank lines) into the Admin Import page.

**Supported format:**
```
iPhone 14 Pro 256 Purple
A Grade
2450 AED
5 pcs

Samsung S24 Ultra 512GB Black
A+ Grade
3200 AED
3 pcs
```

**Parser detects:**
- Model from the first line
- Storage: `128GB`, `256GB`, `512GB`, etc.
- Color: 20+ known color keywords
- Grade: `A+`, `A`, `A-`, `B`, `C` (any position in block)
- Price: number followed by AED
- Quantity: number + `pcs`/`pieces`/`units`

---

## Role-Based Access

| Feature               | Admin | Buyer |
|-----------------------|-------|-------|
| Browse inventory      | ✅    | ✅    |
| Reserve items         | ✅    | ✅    |
| View own reservations | ✅    | ✅    |
| View ALL reservations | ✅    | ❌    |
| Confirm/cancel reservations | ✅ | ❌  |
| Mark as sold          | ✅    | ❌    |
| Import inventory      | ✅    | ❌    |
| Manage users          | ✅    | ❌    |

---

## Adding Buyer Accounts

1. Admin creates user in Firebase Console → Authentication
2. User logs in (profile is auto-created with `role: buyer`)
3. Admin goes to `/admin/users` → clicks **Approve**

---

## Deployment (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Project → Settings → Environment Variables
# Add all NEXT_PUBLIC_FIREBASE_* variables
```

---

## Tech Stack

| Layer       | Tech                    |
|-------------|-------------------------|
| Framework   | Next.js 14 (App Router) |
| Language    | TypeScript              |
| Styling     | Tailwind CSS            |
| Auth        | Firebase Authentication  |
| Database    | Firestore               |
| Fonts       | DM Sans + DM Mono       |

---

## Development Commands

```bash
npm run dev    # Start dev server → http://localhost:3000
npm run build  # Production build
npm run lint   # ESLint check
```
