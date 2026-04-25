# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# First-time setup (install deps, copy .env, generate key, migrate, build)
composer setup

# Development (runs artisan serve + queue:listen + pail logs + Vite concurrently)
composer dev

# Build frontend assets
npm run build
npm run dev

# Run tests (uses SQLite in-memory — no MySQL required)
composer test
php artisan test
php artisan test --filter=TestClassName

# Database
php artisan migrate
php artisan migrate:fresh --seed
php artisan db:seed --class=InvoiceCategorySeeder

# Queue worker (must be running for invoice extraction to work)
# composer dev already starts this; run standalone with:
php artisan queue:listen --tries=1 --timeout=0
php artisan queue:clear   # clear pending jobs
php artisan queue:flush   # clear failed jobs

# Code style
./vendor/bin/pint
```

## Architecture

**Stack:** Laravel 13 + Inertia.js + React 18 + Tailwind CSS + MySQL (XAMPP on Windows)

### Multi-tenancy
The `BelongsToTenant` trait (used by `Invoice`, `Supplier`, `Client`) adds a **Global Scope** that filters all queries by `auth()->user()->tenant_id`. This is the primary IDOR protection — never bypass it. `Tenant` → `User` → `Invoice` is the ownership chain.

**Critical:** The scope only applies when `auth()->check()` is true. In queue/console context (e.g. inside `ExtractInvoiceJob`) the scope is silently inactive — jobs must receive fully-resolved model instances via their constructor and must not perform raw model queries that rely on auth-based isolation.

Registration automatically creates a `Tenant` (plan=`trial`, 14-day trial) and links the new user to it. Emails are **not** globally unique — they are scoped per tenant.

### Invoice Extraction Pipeline
The core feature is a two-step async pipeline triggered when a user clicks "Extract":

1. `InvoiceUploadController::uploadFile` stores the file and creates an `Invoice` with `status=pending`
2. `InvoiceController::extract` dispatches `ExtractInvoiceJob`
3. **Job Step 1 — OCR:** `MistralOcrService` sends the file (base64) to Mistral's OCR API, merges `pages[i].tables` references inline into the markdown text
4. **Job Step 2 — Extraction:** `OpenAiInvoiceExtractorService` sends the OCR text to OpenAI (`gpt-4o-mini`) with the full invoice JSON schema and active categories list; returns structured `fields` + `items` + `category_id`
5. **Job Step 2b — Supplier/Client sync:** After the AI fields are saved, the job `updateOrCreate`s a `Supplier` record (matched by `ice` if present, else by lowercase `name`) and a `Client` record (matched by `customer_ice` / `customer_name`). The resulting `supplier_id` and `client_id` are written to the invoice via `forceFill()`.
6. **Job Step 3 — Anomaly Detection:** `AnomalyDetectorService::detect()` runs 5 coherence checks and saves boolean flags via `forceFill()`
7. Job saves `ocr_text` + extracted fields to `invoices`, then saves line items to `invoice_items`

Job retries 3× (180s timeout each). Status stays `processing` during retries; only moves to `error` on the final attempt via the `failed()` hook.

Valid `status` values: `pending` → `processing` → `processed` | `error`.

Frontend polls `GET /invoices/statuses` every 4 seconds while any invoice is in `processing` state.

### Anomaly Detection
`AnomalyDetectorService` (singleton) is injected into `ExtractInvoiceJob::handle()` and runs after AI extraction. It sets 5 boolean flags on the invoice via `forceFill()` (all excluded from `$fillable`):

| Flag | Condition |
|------|-----------|
| `amount_anomaly` | `|total_ttc − (subtotal_ht + vat_amount)| > 0.02` |
| `vat_mismatch` | `|vat_amount − round(subtotal_ht × vat_rate / 100, 2)| > 0.02` |
| `date_anomaly` | `due_date < issue_date` |
| `is_duplicate` | Same number+supplier or same `content_hash` within tenant |
| `new_supplier` | `supplier_id` has no other processed invoice in this tenant (first occurrence) |

Flagged invoices are displayed at `GET /invoices/anomalies` → `Invoices/Anomalies.jsx`.

### File Upload
- Accepted types: `pdf`, `jpg`, `jpeg`, `png`, `webp`, `tiff` (max 10 MB)
- Throttled: 20 uploads per minute per user
- Stored locally at `storage/app/tenants/{tenantId}/invoices/` (Laravel `local` disk)
- Filename format: `INV-{YYYYMMDD}-{tenantId}-{random6}.{ext}`

### Key Models
- `Invoice` — soft deletes, tenant global scope, 60+ fillable fields. Has both `category` (raw AI string) and `category_id` (FK to `InvoiceCategory`); also `category_corrected_id` for user overrides. Lifecycle fields (`status`, `error_message`), `supplier_id`, `client_id`, and anomaly flags are **excluded from `$fillable`** — always use `forceFill()` when writing them.
- `InvoiceItem` — `vat_amount` and `amount_ttc` are **auto-calculated** in the `booted()` hook on `creating`/`updating` — never set them manually. `sort_order` orders line items. All amounts cast as `decimal`.
- `InvoiceCategory` — seeded lookup table (no tenant scoping), used to auto-classify invoices. Has `icon` (Lucide icon name), `color` (hex), `slug`, `sort_order`, `is_active`.
- `Tenant` — company profile; fields include `currency` (3-char ISO code, default `MAD`), `industry`, `tax_id`, `logo`.
- `Supplier` — tenant-scoped. Auto-created/updated from invoice extraction (`ice` or lowercase `name` as key). Has `name`, `address`, `ice`, `if`, `rc`, `phone`, `email`, `rib`. `Invoice` belongs to `Supplier` via `supplier_id`.
- `Client` — same structure as `Supplier`, matched on `customer_ice` / `customer_name` from extracted fields. `Invoice` belongs to `Client` via `client_id`.
- `User` — has a `role` column (`user` | `admin`). The `admin` middleware alias (`EnsureAdmin`) checks `role === 'admin'` and aborts 403 otherwise.

### Services (singletons registered in `AppServiceProvider`)
- `MistralOcrService` — key from `config('services.mistral.key')` → logs to `mistral` channel
- `OpenAiInvoiceExtractorService` — key from `config('services.openai.key')` → logs to `openrouter` channel (model: `gpt-4o-mini`)
- `AnomalyDetectorService` — no external dependencies; injected into `ExtractInvoiceJob`

### Activity Log (Spatie)
`spatie/laravel-activitylog` v4 is installed. `Invoice` and `User` models use the `LogsActivity` trait — creates/updates/deletes are logged to the `activity_log` table automatically (only dirty fields, no empty logs).

The `activity_log` table has no `tenant_id`. To scope it per tenant, `AuditLogController` pre-fetches the tenant's invoice IDs and user IDs, then filters via `whereIn('subject_id', ...)` with a `subject_type` condition.

For admin queries that need all tenants' activity, query `Activity::with('causer')->latest()` directly (no scoping needed).

### Frontend Pages
Pages live in `resources/js/Pages/`:
- `Dashboard.jsx` — stats (total invoices, revenue converted to tenant's currency, pending count), category distribution table, last 5 processed invoices
- `Invoices/Index.jsx` — bulk operations, live status polling, filtering, pagination, invoice detail slide-over with line items and financial summary
- `Invoices/Upload.jsx` — FilePond-based upload flow
- `Invoices/Anomalies.jsx` — flagged invoices with colored badges per anomaly type; detail slide-over shows the actual values that triggered each flag
- `Fournisseurs/Index.jsx` — supplier list auto-populated from extraction; shows invoice count, total spend, last invoice date per supplier
- `Settings/Company.jsx` — company profile form including currency picker
- `Settings/Categories.jsx` — list/create/toggle/delete invoice categories with Lucide icon picker and color picker
- `Settings/AuditLog.jsx` — paginated activity log for the current tenant, filterable by user and date range; expandable field-level diff
- `Admin/Dashboard.jsx` — super-admin only; platform-wide stats across all tenants (bypasses tenant scope), tenant table, signup bar chart, invoice status breakdown, recent activity feed

Layout: `AppLayout.jsx` wraps all authenticated pages. The sidebar `Administration` section is `adminOnly: true` and only renders when `user.role === 'admin'`. The top navbar shows an "Admin" badge next to the user name for admin users.

The `CategoryIcon` component (`resources/js/Components/CategoryIcon.jsx`) renders a Lucide icon by name inside a colored rounded square. Icon names come from `lucide-react` (imported as `import * as LucideIcons from 'lucide-react'`).

### Dashboard Currency Conversion
The `DashboardController` converts all invoice amounts to the **tenant's currency** (from `tenants.currency`) using `RATES_TO_EUR` as pivot rates. Exchange rates are defined in `DashboardController::RATES_TO_EUR` (MAD, EUR, USD, GBP supported). Each invoice's `total_ttc` is converted: `invoice_currency → EUR → tenant_currency`.

The Dashboard displays:
- `totalRevenue` — sum of all processed invoices converted to tenant currency
- `totalRevenueCurrency` — the tenant's currency code (e.g. `MAD`, `EUR`)
- Recent invoices table shows amounts in their **original currency** (no conversion)

### Custom Log Channels
Separate log channels write to `storage/logs/`:
- `mistral-YYYY-MM-DD.log` — OCR request/response, full `ocr_text`, table structure debug info
- `openrouter-YYYY-MM-DD.log` — OpenRouter request/response, raw JSON from model

Use `Log::channel('mistral')` and `Log::channel('openrouter')` when logging in the respective services.

### Database Column Names (post-migration)
The `invoices` table was refactored — use these names, not the old ones:
- `number` (not `invoice_number`), `issue_date` (not `invoice_date`), `supplier_name` (not `supplier`)
- `subtotal_ht` (not `amount_ht`), `vat_amount` (not `tva`), `total_ttc` (not `amount_ttc`)
- `sort_order` (not `line_order`), `discount_rate` (not `discount` / `discount_percent`)

Note: `invoice_items` still uses `amount_ht` (not renamed).

### `unit` ENUM in `invoice_items`
Valid values only: `piece`, `hour`, `kg`, `flat_fee`, `km`, `day`, `month`, `other`. `OpenAiInvoiceExtractorService::resolveUnit()` maps French/abbreviated variants (e.g. `jour` → `day`, `forfait` → `flat_fee`).

### Routing Structure

Routes defined in `routes/web.php` (all behind `auth` middleware except the welcome page):

- `GET /` — Welcome page
- `GET /dashboard` — Dashboard
- `GET /fournisseurs` — Supplier list (`SupplierController@index`, name: `fournisseurs.index`)
- `POST /invoices/upload` — File upload (creates Invoice with `status=pending`)
- `POST /invoices/{id}/extract` — Dispatches `ExtractInvoiceJob`
- `GET /invoices/statuses` — Polling endpoint (returns status map for given `ids[]`)
- `GET /invoices/{id}/show` — JSON detail (invoice + items + categories + uploader)
- `GET /invoices/anomalies` — Anomalies list page
- `GET /invoices/{id}/download` — File download
- `DELETE /invoices/{id}` — Soft delete
- `POST /invoices/bulk-destroy` — Bulk soft delete
- `POST /invoices/bulk-extract` — Bulk re-extract
- `GET/PATCH /settings/company` — Company profile
- `GET/POST/PATCH/DELETE /settings/categories` — Category management
- `GET /settings/audit-log` — Activity log for current tenant
- `GET /admin/dashboard` — Super-admin dashboard (behind `admin` middleware)
- `GET/PATCH/DELETE /profile` — User profile (from `routes/auth.php`)

### Environment Variables Required
```
MISTRAL_API_KEY=
OPENAI_API_KEY=
DB_CONNECTION=mysql   # sqlite is used automatically for tests
QUEUE_CONNECTION=database
```
