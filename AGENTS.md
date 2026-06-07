# AGENTS.md — KOST ASYNC

## Commands

```bash
# Backend (separate terminal)
cd backend && npm install && npm run dev   # nodemon on :5000

# Frontend (separate terminal)
cd frontend && npm install && npm run dev  # vite on :5173
cd frontend && npm run build               # outputs to dist/
cd frontend && npm run lint                # eslint . (flat config, ESLint 9+)
```

**No tests exist** — no test framework configured anywhere.

## Module system

- Backend: **CommonJS** (`"type": "commonjs"` in `backend/package.json`)
- Frontend: **ESM** (`"type": "module"` in `frontend/package.json`)

## Entrypoints & dead code

- **USE** `backend/server.js` — imports all 12 routes, has global error middleware.
- **DO NOT USE** `backend/index.js` — stale (missing pindahKamar + password routes, no error middleware, uses callback `db.js`).
- **DO NOT USE** `backend/db.js` — callback-based `mysql2` pool (no `.promise()`).
- **ALWAYS USE** `backend/dbAsync.js` — `mysql2/promise` pool.
- `backend/database.sqlite` is 0 bytes — SQLite is not used. README is misleading.

## Routes (12 files in `backend/routes/`)

All use `async (req, res, next)` — Express 5 catches thrown errors automatically.

| File | Mount |
|------|-------|
| `auth.js` | `/api/auth` |
| `dashboard.js` | `/api/dashboard` |
| `kamar.js` | `/api/kamar` |
| `laporan.js` | `/api/laporan` |
| `pembayaran.js` | `/api/pembayaran` |
| `pemesanan.js` | `/api/pemesanan` |
| `pengeluaran.js` | `/api/pengeluaran` |
| `penyewa.js` | `/api/penyewa` |
| `users.js` | `/api/users` |
| `userDashboard.js` | `/api/user-dashboard` |
| `pindahKamar.js` | `/api/pindah-kamar` |
| `password.js` | `/api/users/password` |

## Pages (frontend)

| Role | Pages | Guard |
|------|-------|-------|
| **Guest** | `/` (LandingPage), `/katalog` (KatalogGuest) | none |
| **User** | `/login-user`, `/dashboard-user`, `/pesan`, `/ganti-password-user`, `/pindah-kamar-user` | `RequireUserLogin`, `GuestOnlyRoute` |
| **Admin** | `/login`, `/dashboard`, `/kamar`, `/penyewa`, `/pembayaran`, `/pengeluaran`, `/laporan`, `/pemesanan`, `/pindah-kamar` | `RequireAdminLogin`, `AdminGuestOnlyRoute` |

4 route guard components in `App.jsx`: `RequireUserLogin`, `RequireAdminLogin`, `GuestOnlyRoute`, `AdminGuestOnlyRoute`.

## Architecture facts

- **Two auth domains**: admin JWT (`JWT_SECRET_ADMIN`) vs user JWT (`JWT_SECRET_USER`) — set in `backend/.env`, hardcoded fallbacks in every route file.
- **Booking flow**: `pending` → admin approves → `menunggu_pembayaran` → guest signals payment → `menunggu_verifikasi` → admin confirms payment → `disetujui`. On confirm, `bookingService.confirmPayment` (in `services/`) auto-creates user + penyewa + pembayaran (lunas) + next month's tagihan (belum_lunas).
- **Auto-billing**: On payment confirm, inserts next month's `pembayaran` with `status='belum_lunas'`, `tanggal_bayar=NULL`.
- **Multi-table writes** use `withTransaction(async (conn) => {...})` from `utils/transaction.js` with `FOR UPDATE` locks on rows read-before-write. Used in: konfirmasi-bayar, setuju pindah, delete penyewa, hapus akun.
- **Validation**: `utils/validation.js` defines reusable express-validator chains. Pattern: `router.post('/', [chain], validate, async (req, res, next) => {...})` where `validate` checks `validationResult`.
- **Global error middleware**: After all routes in `server.js`. Throw `AppError(message, statusCode)` from `utils/AppError.js` for known errors.
- **Two theme systems**: Admin = `theme.js` (light tokens), User = `themeUser.js` (dark glassmorphism). Tailwind has NO `darkMode: "class"` config — dark classes written explicitly.
- **Admin feature pattern**: `{Feature}/index.jsx` + `{Feature}Modal.jsx` + `{Feature}Table.jsx`. See `pages/Admin/Kamar/` as reference.
- **Hook pattern**: 5 hooks in `frontend/src/hooks/` — `useKamar.js`, `usePembayaran.js`, `usePemesanan.js`, `usePengeluaran.js`, `usePenyewa.js`. Each fetches fresh from API on render (no state management lib).
- **Indonesian language**: All UI, variable names, DB columns, and API status values in Indonesian.
- **Phone validation**: `08xxxxxxxxxx` format, 10–13 digits, enforced in both frontend and backend (`validation.js`).

## Conventions

- SweetAlert2 for delete confirmations + modals; react-toastify (top-right, 3s) for notifications.
- Framer Motion for animations (`utils/animations.js`: `fadeInUp`, `staggerContainer`, `modalVariants`).
- Room images resolved by tipe via `utils/imageHelper.js` (standar/premium/vip → mapped png assets).
- When adding a new route: import `dbAsync`, use `async (req, res, next)`, define validation chains in `utils/validation.js`, keep business logic in `services/`.
- When a route needs multi-table writes: wrap in `withTransaction(async (conn) => {...})` with `FOR UPDATE`.
- Admin pages use light theme (`theme.js`); never add dark mode classes to admin pages.

## Database (MySQL)

- Connection in `backend/.env`: host=localhost, user=root, pw=tryhackme, db=db_kost, port=1111.
- Tables: `admin`, `kamar`, `penyewa`, `users`, `pembayaran`, `pemesanan`, `pengeluaran`, `pengeluaran_user`, `pindah_kamar`.
- 4 migration files in `backend/migrate_*.js` — run standalone: `node migrate_*.js`.
