# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies (first time)
npm install

# Run dev server (generates firebase-config.js + starts http-server on port 3000)
npm start
# or
npm run dev

# Generate firebase-config.js only (no server)
npm run build
```

There are no tests, no linter, and no build step (no webpack/vite). The app runs as static files served by http-server.

## Architecture

This is a **vanilla JavaScript SPA** with no framework and no transpilation. All logic lives in three files:

- `public/index.html` — HTML shell + CDN script tags (Leaflet, XLSX, Chart.js, jsPDF, JSZip, Firebase Compat v10)
- `public/app.js` — ~2,500-line monolith: all business logic, rendering, and state management
- `public/styles.css` — Brand styling with CSS custom properties

### Startup / Credentials Flow

```
.env (git-ignored) → scripts/generate-config.js → public/firebase-config.js (git-ignored)
```

`generate-config.js` reads Firebase credentials from `.env` and writes them as a `window.firebaseConfig` global into `public/firebase-config.js`. If credentials are missing or placeholders, the app runs in local demo mode (no Firebase required).

### Firebase Services

- **Auth**: Email/password. Admin is `product@menupp.co` (hardcoded in `ADMIN_EMAILS` in app.js).
- **Firestore** (`config/` collection): stores farmers, fees, history, pay_st, ck_data, manual_rests, orders_meta.
- **Storage**: `excel-uploads/` for raw Excel files; `orders/YYYY-MM.json` for parsed period data.

### app.js Structure

| Lines | Concern |
|-------|---------|
| 1–97 | Firebase init & auth (`initFirebase`, `doLogin`, `doLogout`) |
| 98–268 | Cloud sync: `cloudSave()` (800ms debounce), `loadCloudData()` |
| 270–382 | Orders: `bootstrapOrders()`, `uploadExcelToFirebase()` |
| 385–441 | Global constants, state object `S`, mutable globals (`FARMERS`, `FEES`, `HISTORY`, `PAY_ST`, `CK_DATA`, `MANUAL_RESTS`) |
| 443–492 | Navigation & view switching |
| 493–649 | Excel parsing (`parseExcel`, `handleFile`) |
| 993–1323 | Global analytics dashboard rendering (`renderGlobal`) |
| 1325–1479 | Restaurant detail drill-down |
| 1511–1574 | Payment/Cobros management (`renderCobros`) |
| 1993–2215 | Farmer assignment, checklist & scoring (`renderFarmers`, `renderChecklist`) |
| 2322–2476 | Client report generation (`renderReport`) |

### State Management

The primary state object is `S = { orders: [], details: [], currentPeriod: null }`. Auxiliary state lives in module-level `let` variables (`FARMERS`, `FEES`, etc.). All state is persisted to both:
- `localStorage` (`mpp_*` prefix) — immediate offline fallback
- Firestore — cloud sync with 800ms debounce via `cloudSave()`

### Navigation Model

Five tabs rendered into `#main-content` by switching `currentView`:

1. **global** — KPI cards, charts, restaurant table
2. **cobros** — Payment status management
3. **farmers** — Restaurant/KAM assignment, checklist, premios
4. **informe** — Per-restaurant printable report
5. **subir** — Admin Excel upload (admin-only write)

### Checklist Scoring (100 pts max, 14 items)

Social (20 pts): Instagram, Google Maps, TripAdvisor, WhatsApp profile  
Marketing (20 pts): BD diffusion, photos, up-selling, cross-selling  
Campaigns (60 pts): exclusive product, first-order coupon, repeat coupon, ads, highlights, social posts

Score colors: ≥90 blue, ≥70 green, ≥50 orange, <50 red.

### Security Rules

- Firestore: admin-only writes for `config/config`, `history`, `orders_meta`. Farmers can write `farmers`, `fees`, `pay_st`, `ck_data`, `manual_rests`. All authenticated users can read.
- Storage: admin-only writes on `excel-uploads/` and `orders/`. All authenticated users can read.
