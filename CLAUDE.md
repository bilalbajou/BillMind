# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development (runs artisan serve + queue worker + pail logs + Vite concurrently)
composer dev

# Build frontend assets
npm run build
npm run dev

# Run tests
composer test
php artisan test
php artisan test --filter=TestClassName

# Database
php artisan migrate
php artisan migrate:fresh --seed
php artisan db:seed --class=InvoiceCategorySeeder

# Queue worker (must be running for invoice extraction to work)
php artisan queue:work
php artisan queue:clear   # clear pending jobs
php artisan queue:flush   # clear failed jobs

# Code style
./vendor/bin/pint
```

## Architecture

**Stack:** Laravel 13 + Inertia.js + React 18 + Tailwind CSS + MySQL (XAMPP on Windows)

### Multi-tenancy
The `Invoice` model has a **Global Scope** that automatically filters all queries by the authenticated user's `tenant_id`. This is the primary IDOR protection — never bypass it. `Tenant` → `User` → `Invoice` is the ownership chain.

Registration automatically creates a `Tenant` (plan=`trial`, 14-day trial) and links the new user to it. Emails are **not** globally unique — they are scoped per tenant.

### Invoice Extraction Pipeline
The core feature is a two-step async pipeline triggered when a user clicks "Extract":

1. `InvoiceUploadController::uploadFile` stores the file and creates an `Invoice` with `status=pending`
2. `InvoiceController::extract` dispatches `ExtractInvoiceJob`
3. **Job Step 1 — OCR:** `MistralOcrService` sends the file (base64) to Mistral's OCR API, merges `pages[i].tables` references inline into the markdown text
4. **Job Step 2 — Extraction:** `BlazeInvoiceExtractorService` sends the OCR text to Blaze API (OpenAI-compatible, Claude Sonnet 4.6) with the full invoice JSON schema and active categories list; returns structured `fields` + `items` + `category_id`
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
- `Invoice` — soft deletes, tenant global scope, 60+ fillable fields. Has both `category` (raw AI string) and `category_id` (FK to `InvoiceCategory`); also `category_corrected_id` for user overrides.
- `InvoiceItem` — line items with `sort_order`, all amounts cast as `decimal`
- `InvoiceCategory` — seeded lookup table (no tenant scoping), used to auto-classify invoices
- `Tenant` — company profile; one tenant per account

### Services (singletons registered in `AppServiceProvider`)
- `MistralOcrService` — key from `config('services.mistral.key')` → logs to `mistral` channel
- `BlazeInvoiceExtractorService` — key from `config('services.blaze.key')` → logs to `blaze` channel

### Frontend Pages
Pages live in `resources/js/Pages/`. The main invoice UI is `Invoices/Index.jsx` with bulk operations, live status polling, filtering, and pagination. Upload flow is `Invoices/Upload.jsx` using FilePond.

Layout: `AppLayout.jsx` wraps all authenticated pages.

### Custom Log Channels
Separate log channels write to `storage/logs/`:
- `mistral-YYYY-MM-DD.log` — OCR request/response, full `ocr_text`, table structure debug info
- `blaze-YYYY-MM-DD.log` — Blaze request/response, raw JSON from model

Use `Log::channel('mistral')` and `Log::channel('blaze')` when logging in the respective services.

### Database Column Names (post-migration)
The `invoices` table was refactored — use these names, not the old ones:
- `number` (not `invoice_number`), `issue_date` (not `invoice_date`), `supplier_name` (not `supplier`)
- `subtotal_ht` (not `amount_ht`), `vat_amount` (not `tva`), `total_ttc` (not `amount_ttc`)
- `sort_order` (not `line_order`), `discount_rate` (not `discount` / `discount_percent`)

Note: `invoice_items` still uses `amount_ht` (not renamed).

### `unit` ENUM in `invoice_items`
Valid values only: `piece`, `hour`, `kg`, `flat_fee`, `km`, `day`, `month`, `other`. `BlazeInvoiceExtractorService::resolveUnit()` maps French/abbreviated variants (e.g. `jour` → `day`, `forfait` → `flat_fee`).

### Environment Variables Required
```
MISTRAL_API_KEY=
BLAZE_API_KEY=
DB_CONNECTION=mysql
QUEUE_CONNECTION=database
```
