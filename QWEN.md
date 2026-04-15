# BillMind — QWEN.md

## Project Overview

**BillMind** is an intelligent invoice management application built with **Laravel 13**, **Inertia.js**, **React 18**, and **Tailwind CSS**. The application enables users to upload, extract, classify, and analyze invoices using AI-powered OCR (Optical Character Recognition) and anomaly detection.

### Core Features
- **Invoice Upload & Extraction**: Users upload PDFs/images; AI extracts structured data via Mistral OCR + OpenAI (`gpt-4o-mini`)
- **Anomaly Detection**: Automated coherence checks flag invoices with amount mismatches, date issues, duplicates, or unknown suppliers
- **Multi-Tenancy**: Each tenant (company) has isolated data via the `BelongsToTenant` trait — provides automatic IDOR protection
- **Dashboard & Analytics**: Stats, category distribution, recent invoices
- **Settings Management**: Company profile, invoice categories with Lucide icons and color pickers

### Tech Stack
- **Backend**: Laravel 13 (PHP 8.3+), SQLite/MySQL
- **Frontend**: React 18, Inertia.js, Tailwind CSS, Flowbite React, Lucide React
- **Queue**: Database-driven queue workers for async invoice extraction
- **AI Services**: Mistral OCR API, OpenAI API (`gpt-4o-mini`)
- **Build Tools**: Vite, npm, Composer

---

## Building and Running

### Prerequisites
- PHP 8.3+
- Composer
- Node.js & npm
- SQLite or MySQL (XAMPP on Windows)

### Initial Setup
```bash
composer setup
```
This command installs dependencies, copies `.env.example` to `.env`, generates app key, runs migrations, installs npm packages, and builds assets.

### Development
```bash
composer dev
```
Runs concurrently:
- `php artisan serve` (Laravel server)
- `php artisan queue:listen --tries=1 --timeout=0` (queue worker — **required** for invoice extraction)
- `php artisan pail` (logs)
- `npm run dev` (Vite HMR)

### Build Frontend
```bash
npm run dev    # Development with HMR
npm run build  # Production build
```

### Running Tests
```bash
composer test         # Full test suite (SQLite in-memory)
php artisan test      # Alternative
php artisan test --filter=TestClassName  # Specific test class
```

### Database Commands
```bash
php artisan migrate                    # Run migrations
php artisan migrate:fresh --seed       # Reset and seed database
php artisan db:seed --class=InvoiceCategorySeeder  # Seed categories
```

### Code Style
```bash
./vendor/bin/pint
```

---

## Architecture

### Multi-Tenancy
The `BelongsToTenant` trait adds a **Global Scope** that filters all queries by `auth()->user()->tenant_id`. This is the primary IDOR protection mechanism.

**Ownership chain**: `Tenant` → `User` → `Invoice`

- Registration automatically creates a `Tenant` (plan=`trial`, 14-day trial)
- Emails are **not** globally unique — scoped per tenant
- Global scope is **inactive** in queue/console context — jobs must receive fully-resolved model instances

### Invoice Extraction Pipeline (Async)
Triggered when user clicks "Extract":

1. **Upload**: `InvoiceUploadController::uploadFile` stores file and creates `Invoice` with `status=pending`
2. **Dispatch**: `InvoiceController::extract` dispatches `ExtractInvoiceJob`
3. **Step 1 — OCR**: `MistralOcrService` sends file (base64) to Mistral's OCR API, merges tables into markdown
4. **Step 2 — Extraction**: `OpenAiInvoiceExtractorService` sends OCR text to OpenAI with full invoice JSON schema
5. **Step 3 — Anomaly Detection**: `AnomalyDetectorService::detect()` runs 5 coherence checks, saves boolean flags
6. Job saves `ocr_text`, extracted fields, and line items

**Status lifecycle**: `pending` → `processing` → `processed` | `error`

Job retries 3× (180s timeout each). Frontend polls `GET /invoices/statuses` every 4 seconds while processing.

### Anomaly Detection Flags
`AnomalyDetectorService` sets 5 boolean flags (excluded from `$fillable`, written via `forceFill()`):

| Flag | Condition |
|------|-----------|
| `amount_anomaly` | `|total_ttc − (subtotal_ht + vat_amount)| > 0.02` |
| `vat_mismatch` | `|vat_amount − round(subtotal_ht × vat_rate / 100, 2)| > 0.02` |
| `date_anomaly` | `due_date < issue_date` |
| `is_duplicate` | Same number+supplier or same `content_hash` within tenant |
| `new_supplier` | Supplier name never seen in any other processed invoice |

### File Upload Rules
- **Accepted types**: `pdf`, `jpg`, `jpeg`, `png`, `webp`, `tiff` (max 10 MB)
- **Throttle**: 20 uploads per minute per user
- **Storage**: `storage/app/tenants/{tenantId}/invoices/` (Laravel `local` disk)
- **Filename**: `INV-{YYYYMMDD}-{tenantId}-{random6}.{ext}`

---

## Key Models

### Invoice
- Soft deletes, tenant global scope, 60+ fillable fields
- Both `category` (raw AI string) and `category_id` (FK to `InvoiceCategory`); `category_corrected_id` for user overrides
- Lifecycle fields (`status`, `error_message`) and anomaly flags **excluded from `$fillable`** — use `forceFill()`

### InvoiceItem
- `vat_amount` and `amount_ttc` are **auto-calculated** in `booted()` hook — never set manually
- `sort_order` for line item ordering
- All amounts cast as `decimal`
- `unit` ENUM valid values: `piece`, `hour`, `kg`, `flat_fee`, `km`, `day`, `month`, `other`

### InvoiceCategory
- Seeded lookup table (no tenant scoping)
- Fields: `icon` (Lucide icon name), `color` (hex), `slug`, `sort_order`, `is_active`

### Tenant
- Company profile
- Fields: `currency` (3-char ISO, default `USD`), `industry`, `tax_id`, `logo`

---

## Services (Singletons via AppServiceProvider)

| Service | Purpose | Config Key | Log Channel |
|---------|---------|------------|-------------|
| `MistralOcrService` | OCR processing | `config('services.mistral.key')` | `mistral` |
| `OpenAiInvoiceExtractorService` | AI data extraction | `config('services.openai.key')` | `openrouter` |
| `AnomalyDetectorService` | Coherence checks | None (internal) | N/A |

---

## Frontend Structure

**Pages** (`resources/js/Pages/`):
- `Dashboard.jsx` — Stats, category distribution, recent invoices
- `Invoices/Index.jsx` — Bulk operations, live status polling, filtering, pagination
- `Invoices/Upload.jsx` — FilePond-based upload flow
- `Invoices/Anomalies.jsx` — Flagged invoices with colored badges; detail slide-over
- `Settings/Company.jsx` — Company profile with currency picker
- `Settings/Categories.jsx` — Category management with icon/color pickers

**Layout**: `AppLayout.jsx` wraps all authenticated pages

**CategoryIcon** component (`resources/js/Components/CategoryIcon.jsx`) renders Lucide icons by name in colored rounded squares.

---

## Database Column Names (Refactored)
- `number` (not `invoice_number`)
- `issue_date` (not `invoice_date`)
- `supplier_name` (not `supplier`)
- `subtotal_ht` (not `amount_ht`)
- `vat_amount` (not `tva`)
- `total_ttc` (not `amount_ttc`)
- `sort_order` (not `line_order`)
- `discount_rate` (not `discount` / `discount_percent`)

Note: `invoice_items` still uses `amount_ht` (not renamed).

---

## Environment Variables Required
```env
MISTRAL_API_KEY=
OPENAI_API_KEY=
DB_CONNECTION=mysql    # or sqlite
QUEUE_CONNECTION=database
```

---

## Routing Structure

**Main routes** (`routes/web.php`):
- `GET /` — Welcome page (Inertia)
- `GET /dashboard` — Dashboard (auth required)
- `GET /clients` — Clients page
- `GET/POST /invoices/*` — Invoice CRUD, upload, extraction, download, anomalies
- `GET/PATCH/DELETE /profile` — Profile management
- `GET/PATCH /settings/company` — Company settings
- `GET/POST/PATCH/DELETE /settings/categories` — Category management

**Auth routes**: `routes/auth.php`

---

## Custom Log Channels
Separate log channels write to `storage/logs/`:
- `mistral-YYYY-MM-DD.log` — OCR request/response, table structure debug
- `openrouter-YYYY-MM-DD.log` — OpenRouter request/response, raw JSON

Usage: `Log::channel('mistral')` and `Log::channel('openrouter')`

---

## Development Conventions

- **AI output fields** (`status`, `error_message`, anomaly flags) must always use `forceFill()` — never mass-assigned
- **Global tenant scope** must not be bypassed — it's the primary security mechanism
- **Queue workers must be running** for invoice extraction to function
- **Tests use SQLite in-memory** — no MySQL required for testing
- **React components** use Inertia.js for server-client communication
- **Tailwind CSS** with Flowbite React components and Lucide icons
