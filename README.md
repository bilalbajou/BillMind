# BillMind

BillMind is a multi-tenant SaaS invoice management platform that automates invoice ingestion, data extraction, anomaly detection, and provides a natural-language AI assistant for querying financial data.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Architecture](#architecture)
- [Application Routes](#application-routes)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Deployment](#deployment)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Laravel 13, PHP 8.3+ |
| Frontend | React 18, Inertia.js 2, Vite |
| Styling | Tailwind CSS 4, Flowbite React, Headless UI |
| Database | SQLite (dev) / MySQL or PostgreSQL (prod) |
| Queue | Laravel Queue — `database` driver |
| OCR | Mistral AI API |
| LLM | OpenRouter (invoice extraction), OpenAI GPT-4o-mini (chat) |
| Charts | Recharts |
| File Uploads | FilePond |
| Excel Export | Maatwebsite Laravel Excel |
| Activity Log | Spatie Laravel ActivityLog |

---

## Features

- **Automated invoice ingestion** — upload PDFs or images; OCR + LLM extract all fields asynchronously
- **Anomaly detection** — flags VAT mismatches, amount outliers, date anomalies, duplicates, and new suppliers
- **AI chat assistant** — ask natural-language questions about your invoice data; the system generates and validates SQL on your behalf
- **Multi-tenancy** — complete data isolation between tenants via a global Eloquent scope
- **Supplier & Customer management** — auto-created and matched during extraction
- **Bulk operations** — bulk delete or re-extract multiple invoices at once
- **Audit log** — every invoice change is recorded via Spatie ActivityLog
- **Excel export** — export filtered invoice lists
- **Admin panel** — cross-tenant system stats for super admins
- **Role-based access** — `admin` role gates the `/admin/*` routes

---

## Prerequisites

- PHP 8.3+
- Composer
- Node.js 20+ and npm
- SQLite (default for local dev) or a MySQL/PostgreSQL server for production
- API keys for Mistral, OpenRouter, and OpenAI (see [Configuration](#configuration))

---

## Installation

```bash
# 1. Clone the repository
git clone <repo-url>
cd BillMind

# 2. Run the one-command setup
#    (copies .env.example → .env, generates app key,
#     installs PHP + JS deps, runs migrations, builds frontend assets)
composer setup
```

After setup, populate `.env` with your API keys (see [Configuration](#configuration)), then start the full dev stack:

```bash
composer dev
```

This single command runs the Laravel server, queue worker, log tailing, and Vite dev server concurrently.

To seed the database with realistic dummy data:

```bash
php artisan migrate:fresh --seed
```

---

## Configuration

Copy `.env.example` to `.env` and set the following keys beyond the standard Laravel variables:

| Key | Required | Description |
|---|---|---|
| `MISTRAL_API_KEY` | Yes | Mistral AI — used by `MistralOcrService` for PDF/image OCR |
| `OPENROUTER_API_KEY` | Yes | OpenRouter — used by `OpenAiInvoiceExtractorService` for structured field extraction |
| `OPENAI_API_KEY` | Yes | OpenAI — used by `InvoiceChatService` for natural-language chat (model: `gpt-5.4-mini`) |

The default database is SQLite (`database/database.sqlite`). For MySQL/PostgreSQL in production, update the `DB_*` variables and run `php artisan migrate`.

The queue driver defaults to `database`. Queue tables are created by migrations — no additional queue setup is needed.

---

## Architecture

### Multi-Tenancy

Every user belongs to a `Tenant`. Models that must be tenant-scoped use the `BelongsToTenant` trait (`app/Models/Concerns/BelongsToTenant.php`), which:

- Applies a global Eloquent scope filtering by `auth()->user()->tenant_id` on every query
- Automatically stamps `tenant_id` on model creation

The global scope depends on `auth()->check()`, which is `false` in queue/console context. Jobs must receive fully-resolved model instances — they cannot rely on the auth-based scope for raw queries.

Admin controllers bypass the scope explicitly with `->withoutGlobalScope('tenant')` to access cross-tenant data.

### Invoice Processing Pipeline

Uploads are handled asynchronously by `ExtractInvoiceJob` (3 retries, 180 s timeout):

```
Upload → InvoiceUploadController
           ├─ Stores file at storage/app/tenants/{tenantId}/invoices/
           ├─ Creates Invoice with status=pending
           └─ Dispatches ExtractInvoiceJob
                ├─ MistralOcrService              → raw text from PDF/image
                ├─ OpenAiInvoiceExtractorService  → structured fields via LLM
                ├─ Supplier/Customer auto-match   (name + ICE identifier)
                ├─ AnomalyDetectorService         → flags anomalies
                └─ Invoice saved as status=processed
                   (or status=error only on the final retry)
```

**Status state machine:** `pending` → `processing` → `processed` | `error`

Intermediate retry failures leave the invoice in `processing` to avoid confusing the UI. Only the final retry failure transitions to `error`.

### Invoice Chat (AI Assistant)

`POST /chat/ask` goes through `InvoiceChatService` with two sequential LLM calls:

1. **SQL generation** — the LLM receives the schema for 5 allowed tables and returns a raw `SELECT`
2. **Validation** — strips comments, checks the first token is `SELECT`, enforces a table allowlist (`invoices`, `invoice_items`, `invoice_categories`, `suppliers`, `customers`), blocks forbidden tokens, and requires a `:tenant_id` named parameter
3. **Execution** — `DB::select($sql, ['tenant_id' => $tenantId])`, capped at 200 rows with a 5 s `max_execution_time` session cap
4. **Narration** — results are sent back to the LLM, which generates a human-readable answer in the user's language

`tenant_id` is always sourced from `auth()->user()->tenant_id` and passed as a bound parameter — never from LLM output.

### Security Patterns

**`$fillable` vs `forceFill()`** — `Invoice::$fillable` excludes sensitive fields (`status`, `error_message`, `tenant_id`, `uploaded_by`, anomaly flags). These are only written via `$invoice->forceFill([...])` inside jobs and system processes.

**File upload** — MIME type is validated from file content (not extension). Filenames are sanitized against path traversal and header injection. Files are stored as `INV-{YYYYMMDD}-{tenantId}-{random6}.{ext}`. The download endpoint re-verifies tenant ownership independently of the global scope.

**Authorization** — there are no Laravel Policies. Role-based access uses the `EnsureAdmin` middleware for `/admin/*` routes. Within tenant-scoped resources, controllers perform manual ownership checks (e.g. `abort_if($invoice->tenant_id !== auth()->user()->tenant_id, 403)`).

### Data Models

| Model | Notable traits | Notes |
|---|---|---|
| `Invoice` | `BelongsToTenant`, `SoftDeletes`, `LogsActivity` | Use `withTrashed()` to query soft-deleted records |
| `InvoiceItem` | — | Child of Invoice |
| `Supplier` | `BelongsToTenant` | Auto-created during extraction |
| `Customer` | `BelongsToTenant` | Auto-created during extraction |
| `User` | — | Has `role` (`admin` or null) and `tenant_id` |
| `Tenant` | — | Root of multi-tenancy |
| `InvoiceCategory` | `BelongsToTenant` | Seeded by `InvoiceCategorySeeder` |

### Service Container

The three core AI services are registered as **singletons** in `AppServiceProvider`:

- `MistralOcrService`
- `OpenAiInvoiceExtractorService`
- `AnomalyDetectorService`

To mock them in tests: `app()->instance(MistralOcrService::class, $mockInstance)`.

---

## Application Routes

All routes require authentication except the welcome page (`/`).

| Method | URI | Description |
|---|---|---|
| `GET` | `/dashboard` | Main dashboard with KPIs and charts |
| `GET` | `/invoices` | Invoice list with filtering |
| `GET` | `/invoices/upload` | Upload form |
| `POST` | `/invoices/upload/file` | File upload endpoint (throttle: 20/min) |
| `GET` | `/invoices/{id}/show` | Invoice detail view |
| `GET` | `/invoices/{id}/download` | Download original file |
| `DELETE` | `/invoices/{id}` | Soft-delete an invoice |
| `POST` | `/invoices/{id}/extract` | Re-trigger extraction for one invoice |
| `GET` | `/invoices/statuses` | JSON polling endpoint for bulk job progress |
| `GET` | `/invoices/anomalies` | Anomaly review list |
| `GET` | `/invoices/export` | Excel export |
| `POST` | `/invoices/bulk-destroy` | Bulk soft-delete |
| `POST` | `/invoices/bulk-extract` | Bulk re-extraction |
| `GET` | `/suppliers` | Supplier list |
| `GET` | `/customers` | Customer list |
| `GET` | `/settings/company` | Company profile settings |
| `GET` | `/settings/categories` | Invoice category management |
| `GET` | `/settings/audit-log` | Activity log viewer |
| `POST` | `/chat/ask` | AI chat — returns JSON (throttle: 30/min) |
| `GET` | `/admin/dashboard` | Super-admin cross-tenant stats |

---

## Development Workflow

```bash
# Full stack (recommended — runs everything concurrently)
composer dev

# Or run services individually
php artisan serve          # Laravel dev server
php artisan queue:listen   # Background job worker
php artisan pail           # Real-time log streaming
npm run dev                # Vite frontend with HMR

# Production assets
npm run build

# Database
php artisan migrate
php artisan migrate:fresh --seed   # Reset + seed with dummy invoices
```

### Database Seeders

| Seeder | Purpose |
|---|---|
| `InvoiceCategorySeeder` | Populates default invoice categories |
| `DummyDataSeeder` | Creates realistic tenants, users, and invoices |
| `TestDataSeeder` | Minimal fixture data for feature tests |

---

## Testing

Tests use an in-memory SQLite database and a synchronous queue — no external services are required.

```bash
composer test                                     # full suite
php artisan test --filter=InvoiceTest             # single test class
php artisan test --filter=InvoiceTest::test_name  # single method
```

Configuration is in `phpunit.xml`. Two test suites are defined: `Unit` and `Feature`.

---

## Deployment

1. Set `APP_ENV=production` and `APP_DEBUG=false` in `.env`
2. Configure a real database and update `DB_*` variables
3. Run `php artisan migrate --force`
4. Build frontend assets: `npm run build`
5. Set up a **queue worker** — without it, invoices stay in `pending` status indefinitely:

```ini
# /etc/supervisor/conf.d/billmind-worker.conf
[program:billmind-worker]
command=php /var/www/billmind/artisan queue:work --sleep=3 --tries=3 --timeout=180
autostart=true
autorestart=true
```

6. Add the Laravel scheduler to crontab:

```
* * * * * cd /var/www/billmind && php artisan schedule:run >> /dev/null 2>&1
```

7. Set all three AI API keys (`MISTRAL_API_KEY`, `OPENROUTER_API_KEY`, `OPENAI_API_KEY`) in production `.env`
