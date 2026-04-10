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
The `BelongsToTenant` trait (used by `Invoice`) adds a **Global Scope** that filters all queries by `auth()->user()->tenant_id`. This is the primary IDOR protection — never bypass it. `Tenant` → `User` → `Invoice` is the ownership chain.

**Critical:** The scope only applies when `auth()->check()` is true. In queue/console context (e.g. inside `ExtractInvoiceJob`) the scope is silently inactive — jobs must receive fully-resolved model instances via their constructor and must not perform raw model queries that rely on auth-based isolation.

Registration automatically creates a `Tenant` (plan=`trial`, 14-day trial) and links the new user to it. Emails are **not** globally unique — they are scoped per tenant.

### Invoice Extraction Pipeline
The core feature is a two-step async pipeline triggered when a user clicks "Extract":

1. `InvoiceUploadController::uploadFile` stores the file and creates an `Invoice` with `status=pending`
2. `InvoiceController::extract` dispatches `ExtractInvoiceJob`
3. **Job Step 1 — OCR:** `MistralOcrService` sends the file (base64) to Mistral's OCR API, merges `pages[i].tables` references inline into the markdown text
4. **Job Step 2 — Extraction:** `OpenAiInvoiceExtractorService` sends the OCR text to OpenAI (`gpt-4o-mini`) with the full invoice JSON schema and active categories list; returns structured `fields` + `items` + `category_id`
5. Job saves `ocr_text` + extracted fields to `invoices`, then saves line items to `invoice_items`

Job retries 3× (180s timeout each). Status stays `processing` during retries; only moves to `error` on the final attempt via the `failed()` hook.

Valid `status` values: `pending` → `processing` → `processed` | `error`.

Frontend polls `GET /invoices/statuses` every 4 seconds while any invoice is in `processing` state.

### File Upload
- Accepted types: `pdf`, `jpg`, `jpeg`, `png`, `webp`, `tiff` (max 10 MB)
- Throttled: 20 uploads per minute per user
- Stored locally at `storage/app/tenants/{tenantId}/invoices/` (Laravel `local` disk)
- Filename format: `INV-{YYYYMMDD}-{tenantId}-{random6}.{ext}`

### Key Models
- `Invoice` — soft deletes, tenant global scope, 60+ fillable fields. Has both `category` (raw AI string) and `category_id` (FK to `InvoiceCategory`); also `category_corrected_id` for user overrides. Lifecycle fields (`status`, `error_message`) and anomaly flags (`is_duplicate`, etc.) are **excluded from `$fillable`** — use `forceFill()` when writing them from the job or controller.
- `InvoiceItem` — line items with `sort_order`, all amounts cast as `decimal`
- `InvoiceCategory` — seeded lookup table (no tenant scoping), used to auto-classify invoices
- `Tenant` — company profile; one tenant per account

### Services (singletons registered in `AppServiceProvider`)
- `MistralOcrService` — key from `config('services.mistral.key')` → logs to `mistral` channel
- `OpenAiInvoiceExtractorService` — key from `config('services.openai.key')` → logs to `openrouter` channel (model: `gpt-4o-mini`)

### Frontend Pages
Pages live in `resources/js/Pages/`. The main invoice UI is `Invoices/Index.jsx` with bulk operations, live status polling, filtering, and pagination. Upload flow is `Invoices/Upload.jsx` using FilePond.

Layout: `AppLayout.jsx` wraps all authenticated pages.

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

### Environment Variables Required
```
MISTRAL_API_KEY=
OPENAI_API_KEY=
DB_CONNECTION=mysql
QUEUE_CONNECTION=database
```
