# Invoice Chat Feature — Design Spec
**Date:** 2026-05-02
**Status:** Approved

## Overview

A slide-over chat panel that lets users ask natural language questions about their invoice data (e.g., "Combien j'ai dépensé ce mois ?"). The AI interprets the question, generates a safe SQL query against the tenant's data, executes it, and narrates the result in the user's language.

---

## Scope

- **Available on:** Dashboard page and Invoices index page only
- **Interaction model:** Single-turn (each question is independent; no conversation history)
- **AI capabilities:** Read-only queries + simple analysis/trend commentary
- **Language:** Detects and matches the user's input language (French or English)
- **Model:** OpenAI `gpt-5.5` via `OPENAI_API_KEY`

---

## Architecture

### Request Flow

```
User types question
  → React POSTs to POST /chat/ask (Inertia)
    → ChatController validates input
      → InvoiceChatService::generateSql() — LLM call #1
        → SQL validation (allowlist parser)
          → DB::select() with bound tenant_id (5s timeout)
            → InvoiceChatService::narrateResult() — LLM call #2
              → JSON response { answer: string } returned to frontend
```

### New Files

| File | Purpose |
|---|---|
| `app/Http/Controllers/ChatController.php` | Single `ask()` method: orchestrates validation, delegates to service, returns JSON |
| `app/Services/InvoiceChatService.php` | Two LLM calls (SQL gen + narration) + SQL validation + query execution |
| `resources/js/Components/ChatSlideOver.jsx` | Reusable slide-over panel component |

### Modified Files

| File | Change |
|---|---|
| `routes/web.php` | Add `POST /chat/ask` inside auth middleware group |
| `resources/js/Pages/Dashboard.jsx` | Add "Ask AI" button + import `ChatSlideOver` |
| `resources/js/Pages/Invoices/Index.jsx` | Add "Ask AI" button + import `ChatSlideOver` |

---

## Backend — InvoiceChatService

### LLM Call #1: SQL Generation

**System prompt includes:**
- Exact column definitions for the 5 allowed tables: `invoices`, `invoice_items`, `invoice_categories`, `suppliers`, `customers`
- Hard rules:
  - Only `SELECT` statements are permitted
  - Must always include `WHERE invoices.tenant_id = :tenant_id` (or equivalent join condition)
  - Must not reference any table outside the 5 allowed tables
  - No subqueries that reference system tables
  - Return only the raw SQL query, no explanation

**User message:** the raw question from the user

**Response:** raw SQL string

### SQL Validation (before execution)

The generated SQL is validated against these rules in order:

1. Strip comments and normalize whitespace
2. First keyword must be `SELECT` (case-insensitive)
3. Reject if any of these tokens appear: `INSERT`, `UPDATE`, `DELETE`, `DROP`, `TRUNCATE`, `ALTER`, `CREATE`, `EXEC`, `EXECUTE`, `CALL`, `INTO`, `LOAD`, `OUTFILE`, `DUMPFILE`
4. Reject if any table name outside `{invoices, invoice_items, invoice_categories, suppliers, customers}` is referenced
5. Reject if `tenant_id` does not appear in the query string (belt-and-suspenders check before injection)

If validation fails, return a user-facing error: "Je n'ai pas pu interpréter cette question. Essayez de la reformuler." (or English equivalent).

### Tenant Injection

After validation, `tenant_id` is always passed as a **bound parameter** via `DB::select($sql, ['tenant_id' => auth()->user()->tenant_id])`. The LLM output is never trusted to contain the correct tenant_id value.

### Query Execution

- `DB::statement("SET SESSION max_execution_time=5000")` before the query (5s cap)
- Results capped at 200 rows
- Empty result set is a valid response (narrated as "no data found")

### LLM Call #2: Narration

**System prompt:** "You are a helpful financial assistant. The user asked a question about their invoice data. You are given the query results as JSON. Answer the user's question naturally and concisely in the same language the user used. Include relevant figures. If the result is empty, say no matching data was found."

**User message:** `Question: {original_question}\nData: {json_encode($rows)}`

**Response:** natural language answer string

---

## Backend — ChatController

```
POST /chat/ask
  - Rate limit: 30/min per user
  - Validate: question (required, string, max:500)
  - Call InvoiceChatService::ask($question, $tenantId)
  - Return: JSON { answer: string } or { error: string }
```

No Inertia response — plain `response()->json()` so the frontend can call it via `axios` without a full page transition.

---

## Frontend — ChatSlideOver Component

**Props:** `open` (bool), `onClose` (function)

**States:**
- Idle: shows a text input and send button, empty message area
- Loading: spinner replaces send button, input disabled
- Answer: displays the AI's narrated answer below the input
- Error: displays an inline error message

**Behaviour:**
- On submit: POST to `/chat/ask` via `axios` (not Inertia `router.post()` — the endpoint returns plain JSON, not an Inertia page), show spinner, display result
- Each new question replaces the previous answer (single-turn, no history)
- Pressing Enter submits the form
- Escape key closes the panel (delegated to HeadlessUI's `Dialog`)

**Trigger button:** "Ask AI" with `MessageSquare` icon from Lucide React, placed in the top-right action area of each host page.

**Styling:** Follows the existing slide-over pattern (HeadlessUI `Dialog` + Transition), same width and overlay as the invoice detail panel.

---

## Security Summary

| Threat | Mitigation |
|---|---|
| SQL injection via LLM output | Allowlist parser + parameterized queries |
| Cross-tenant data access | `tenant_id` always injected as bound param from `auth()`, never from LLM |
| Runaway queries | 5s `max_execution_time` session variable |
| Abuse / rate limit | 30 req/min per user via Laravel throttle middleware |
| Unrestricted table access | Table allowlist validated before execution |
| Write operations | First-token check: must be SELECT |

---

## Out of Scope

- Conversation history / multi-turn context
- Write operations ("delete this invoice", "change the status")
- Export or action suggestions
- Chat availability on pages other than Dashboard and Invoices
- Admin cross-tenant chat
