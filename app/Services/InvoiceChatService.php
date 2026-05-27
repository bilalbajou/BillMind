<?php

namespace App\Services;

use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class InvoiceChatService
{
    private string $openaiKey;
    private string $model = 'gpt-5.4-mini';
    private array $allowedTables = ['invoices', 'invoice_items', 'invoice_categories', 'suppliers', 'customers'];

    public function __construct()
    {
        $this->openaiKey = config('services.openai.key') ?? env('OPENAI_API_KEY', '');
    }

    /**
     * Main orchestration method
     */
    public function ask(string $question, int $tenantId, ?string $context = null, string $tenantCurrency = 'MAD', array $history = []): array
    {
        try {
            // 1. Handle greetings, thanks, help, and other conversational messages directly
            if ($this->isConversational($question)) {
                return ['answer' => $this->respondConversationally($question, $history)];
            }

            // 2. Generate SQL
            $sql = $this->generateSql($question, $context, $tenantCurrency, $history);

            // 3. Validate SQL — fall back to conversational if it cannot be generated or is unsafe
            if (!$sql || !$this->validateSql($sql)) {
                return ['answer' => $this->respondConversationally($question, $history)];
            }

            // 4. Execute SQL
            $rows = $this->executeSql($sql, $tenantId);

            // 5. Narrate results in a human-friendly way
            $answer = $this->narrateResult($question, $rows, $tenantCurrency, $history);

            return ['answer' => $answer];
        } catch (Exception $e) {
            Log::error('InvoiceChatService Error: ' . $e->getMessage());
            return ['error' => 'Something went wrong on my end. Please try again in a moment.'];
        }
    }

    /**
     * Detect obvious conversational messages (greetings, thanks, help, small talk)
     * using lightweight pattern matching — avoids an extra API call for common cases.
     */
    private function isConversational(string $question): bool
    {
        $q = strtolower(trim($question));

        $patterns = [
            '/^(hi|hello|hey|good morning|good afternoon|good evening)\b/i',
            '/^(bonjour|salut|bonsoir|coucou)\b/i',
            '/^(salam|مرحبا|أهلا|صباح الخير|مساء الخير)\b/u',
            '/^(thanks|thank you|thx|merci|شكرا|gracias)\b/i',
            '/^(how are you|ça va|comment (tu vas|vas-tu)|كيف حالك)\b/i',
            '/^(help|aide|ساعدني|what can you do|que peux.tu faire)\b/i',
            '/^(ok|okay|good|great|perfect|parfait|super|génial|nice|cool)\s*[!.]?\s*$/i',
            '/^(bye|goodbye|au revoir|مع السلامة|à bientôt|ciao)\b/i',
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $q)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Return a warm, human conversational response without querying the database.
     */
    private function respondConversationally(string $question, array $history = []): string
    {
        $prompt = <<<PROMPT
You are BillMind Assistant, a friendly and professional AI assistant built into BillMind — an invoice management platform.

Your personality:
- Warm, approachable, and professional — like a helpful colleague, not a robot
- Reply in the same language the user writes in (French, English, Arabic, or any mix)
- Keep replies short and natural — no walls of text
- Never mention SQL, databases, or internal technical details

What you can help with (mention only when the user asks for help):
- Invoice totals, trends, and summaries
- Spending by supplier, category, or time period
- Anomalies and duplicate invoices
- Customer and supplier data

If the user greets you → greet back warmly and briefly mention you can answer questions about their invoices.
If the user thanks you → acknowledge it naturally (e.g. "Happy to help! 😊").
If the user asks for help → explain your capabilities in 2–3 short bullet points.
If the user asks something you cannot answer (e.g. unrelated to BillMind) → say so politely and redirect.
PROMPT;

        $messages = [['role' => 'system', 'content' => $prompt]];
        foreach ($history as $msg) {
            $messages[] = ['role' => $msg['role'], 'content' => $msg['content']];
        }
        $messages[] = ['role' => 'user', 'content' => $question];

        $response = Http::withoutVerifying()->withHeaders([
            'Authorization' => 'Bearer ' . $this->openaiKey,
        ])->post('https://api.openai.com/v1/chat/completions', [
            'model'    => $this->model,
            'messages' => $messages,
        ]);

        if ($response->successful()) {
            return $response->json('choices.0.message.content')
                ?? 'Hi! I\'m here to help with your invoices. What would you like to know?';
        }

        return 'Hi! I\'m here to help with your invoice data. What would you like to know?';
    }

    private function generateSql(string $question, ?string $context = null, string $tenantCurrency = 'MAD', array $history = []): ?string
    {
        // Sanitize context before injecting into the prompt — second line of defence
        $safeContext = $this->sanitizeContext($context);

        // Build a short list of prior user questions so the LLM can resolve references
        // like "those invoices", "the same supplier", "now group by month".
        // Only user questions are included — narrated answers are not safe to inject into SQL gen.
        $priorQuestions = array_values(array_filter(
            array_map(fn($m) => $m['role'] === 'user' ? $m['content'] : null, $history)
        ));
        $historyNote = '';
        if (!empty($priorQuestions)) {
            $lines = implode("\n", array_map(fn($q, $i) => ($i + 1) . '. ' . $q, $priorQuestions, array_keys($priorQuestions)));
            $historyNote = "\nPrior questions in this session (resolve references like \"those\", \"the same\", \"now\" against these):\n{$lines}\n";
        }

        $ratesToEur = ['MAD' => 0.092, 'EUR' => 1.0, 'USD' => 0.92, 'GBP' => 1.17];
        $targetRate = $ratesToEur[$tenantCurrency] ?? 1.0;

        $schema = <<<SCHEMA
=== TABLE: invoices ===
Tenant-scoped. Soft-deleted (deleted_at IS NULL required). One row per uploaded invoice document.
Columns:
  id                    bigint PK
  tenant_id             bigint  [ALWAYS filter: WHERE invoices.tenant_id = :tenant_id]
  uploaded_by           bigint  (FK → users.id)
  number                varchar  — invoice number as printed on the document
  po_reference          varchar  — purchase order reference
  issue_date            date     — invoice issue date
  due_date              date     — payment due date
  currency              varchar  DEFAULT 'MAD'  — ISO 4217 (MAD, EUR, USD…)
  subtotal_ht           decimal(12,2)  — pre-tax subtotal
  taxable_amount        decimal(12,2)  — subtotal after invoice-level discount, before VAT
  vat_rate              decimal(5,2)   — percentage (e.g. 20.00 = 20%)
  vat_amount            decimal(12,2)
  total_ttc             decimal(12,2)  — TOTAL incl. VAT (main invoice amount to use for spend queries)
  discount_rate         decimal(12,2)  — invoice-level discount %
  discount_amount       decimal(12,2)
  amount_in_words       text
  payment_method        enum('bank_transfer','check','cash','card','bill_of_exchange','other')
  payment_terms         varchar
  payment_reference     varchar
  late_penalty          varchar
  bank_name             varchar
  bank_iban             varchar
  supplier_name         varchar  — supplier name snapshot from the document
  supplier_address      text
  supplier_ice          varchar(15)  — Moroccan ICE tax identifier
  supplier_if           varchar      — Moroccan IF tax identifier
  supplier_rc           varchar      — Moroccan RC trade register number
  supplier_phone        varchar
  supplier_email        varchar
  supplier_rib          varchar      — supplier bank account identifier
  supplier_id           bigint NULL  (FK → suppliers.id — linked if matched, else NULL)
  customer_name         varchar  — customer name snapshot from the document
  customer_address      text
  customer_ice          varchar(15)
  customer_if           varchar
  customer_id           bigint NULL  (FK → customers.id)
  category_id           bigint NULL  (FK → invoice_categories.id — AI-assigned)
  category_corrected_id bigint NULL  (FK → invoice_categories.id — user-corrected)
  category              varchar NULL — legacy free-text label (prefer category_id join)
  category_score        decimal(5,2) — AI confidence 0–100
  status                enum('pending','processing','processed','validated','archived','error')
  is_duplicate          tinyint(1) DEFAULT 0  — 1 if flagged as duplicate
  amount_anomaly        tinyint(1) DEFAULT 0  — 1 if amount is statistically anomalous
  date_anomaly          tinyint(1) DEFAULT 0  — 1 if issue/due date is anomalous
  new_supplier          tinyint(1) DEFAULT 0  — 1 if supplier had never appeared before
  vat_mismatch          tinyint(1) DEFAULT 0  — 1 if VAT calculation is inconsistent
  extraction_score      decimal(5,2) NULL     — overall extraction quality 0–100
  created_at            timestamp
  updated_at            timestamp
  deleted_at            timestamp NULL  [SOFT DELETE — always AND invoices.deleted_at IS NULL]

=== TABLE: invoice_items ===
Line items belonging to an invoice. No soft delete. No tenant_id (inherit via invoice).
Columns:
  id              bigint PK
  invoice_id      bigint  (FK → invoices.id)
  sort_order      smallint DEFAULT 0  — display order within the invoice
  description     text    — product or service name
  sub_description text NULL  — secondary label, reference code, or period
  quantity        decimal(12,4) DEFAULT 1
  unit            enum('piece','hour','kg','flat_fee','km','day','month','other') DEFAULT 'piece'
  unit_price      decimal(12,4)  — price per unit BEFORE VAT
  vat_rate        decimal(5,2)  DEFAULT 20.00  — percentage
  vat_amount      decimal(12,2) NULL
  amount_ht       decimal(12,2) NULL  — line total BEFORE VAT (= quantity × unit_price)
  amount_ttc      decimal(12,2) NULL  — line total INCL. VAT
  discount_rate   decimal(5,2)  NULL
  discount_amount decimal(12,2) NULL
  created_at      timestamp
  updated_at      timestamp

=== TABLE: invoice_categories ===
Global lookup table (NOT tenant-scoped). Category names for invoice classification.
Columns:
  id          bigint PK
  name        varchar   — e.g. "IT & Telecom", "Office Supplies", "Travel & Accommodation"
  slug        varchar UNIQUE
  description text NULL
  is_active   tinyint(1) DEFAULT 1
  sort_order  int DEFAULT 0
  created_at  timestamp
  updated_at  timestamp

=== TABLE: suppliers ===
Tenant-scoped. Matched supplier master records. No soft delete.
Columns:
  id          bigint PK
  tenant_id   bigint  [ALWAYS filter: WHERE suppliers.tenant_id = :tenant_id]
  name        varchar
  address     varchar NULL
  ice         varchar NULL  — Moroccan ICE tax identifier
  if          varchar NULL  — Moroccan IF
  rc          varchar NULL  — trade register
  phone       varchar NULL
  email       varchar NULL
  rib         varchar NULL  — bank account identifier
  created_at  timestamp
  updated_at  timestamp

=== TABLE: customers ===
Tenant-scoped. Matched customer master records. No soft delete.
Columns:
  id          bigint PK
  tenant_id   bigint  [ALWAYS filter: WHERE customers.tenant_id = :tenant_id]
  name        varchar
  address     varchar NULL
  ice         varchar NULL
  if          varchar NULL
  rc          varchar NULL
  phone       varchar NULL
  email       varchar NULL
  rib         varchar NULL
  created_at  timestamp
  updated_at  timestamp

=== RELATIONSHIPS ===
invoice_items.invoice_id  → invoices.id
invoices.supplier_id      → suppliers.id  (nullable; use supplier_name for text, supplier_id for joins)
invoices.customer_id      → customers.id  (nullable; use customer_name for text, customer_id for joins)
invoices.category_id      → invoice_categories.id  (AI-assigned)
invoices.category_corrected_id → invoice_categories.id  (user override, prefer over category_id when set)

=== QUERY TIPS ===
- "total spent" → SUM(total_ttc) on invoices
- "by supplier" → GROUP BY supplier_name or JOIN suppliers ON invoices.supplier_id = suppliers.id
- "by category" → JOIN invoice_categories ON invoices.category_id = invoice_categories.id
- "this month" → MONTH(issue_date) = MONTH(CURDATE()) AND YEAR(issue_date) = YEAR(CURDATE())
- "anomalies" → WHERE is_duplicate=1 OR amount_anomaly=1 OR vat_mismatch=1
- "processed invoices only" → AND invoices.status = 'processed'
SCHEMA;

        $prompt = <<<PROMPT
You are the SQL backend of BillMind Assistant, a conversational invoice management assistant.
Your only job is to translate the user's data question into a safe SQL query.

Database schema:
$schema

RULES:
1. If the user's message is NOT a data question (greeting, thanks, small talk, help request, general question) → reply with exactly: NULL
2. Return ONLY the raw SQL query — no markdown fences (no ```sql), no explanation, nothing else.
3. Only SELECT statements are allowed.
4. Every query on `invoices`, `suppliers`, or `customers` MUST include WHERE tenant_id = :tenant_id. If joining tables, apply the filter on the base table.
5. The `invoices` table uses soft deletes — always add `AND invoices.deleted_at IS NULL` (or the aliased equivalent) when querying it.
6. Never reference a table outside the 5 provided ones.
7. No subqueries referencing system tables.
8. Current page context: $safeContext — use it to prioritize relevant data when the question is ambiguous.
$historyNote
9. Currency conversion: The target reporting currency is $tenantCurrency. Because invoices have different currencies, when performing any sum, aggregation, comparison, or spending retrieval, you MUST convert all amounts to the reporting currency ($tenantCurrency) in the SQL query using this exact CASE expression:
CASE invoices.currency
  WHEN 'MAD' THEN (total_ttc * 0.092 / $targetRate)
  WHEN 'EUR' THEN (total_ttc * 1.0 / $targetRate)
  WHEN 'USD' THEN (total_ttc * 0.92 / $targetRate)
  WHEN 'GBP' THEN (total_ttc * 1.17 / $targetRate)
  ELSE total_ttc
END
(Substitute total_ttc with other amount columns like subtotal_ht or vat_amount if the query asks for pre-tax or tax amounts).
Always convert and sum in the reporting currency ($tenantCurrency) rather than summing mixed currencies!
PROMPT;

        $response = Http::withoutVerifying()->withHeaders([
            'Authorization' => 'Bearer ' . $this->openaiKey,
        ])->post('https://api.openai.com/v1/chat/completions', [
            'model' => $this->model,
            'messages' => [
                ['role' => 'system', 'content' => $prompt],
                ['role' => 'user', 'content' => $question],
            ],
        ]);

        if ($response->successful()) {
            $sql = $response->json('choices.0.message.content');
            $sql = preg_replace('/^```sql\s*|\s*```$/i', '', trim($sql));
            $sql = trim($sql);
            // Model signals "not a data question"
            if (strtoupper($sql) === 'NULL' || $sql === '') {
                return null;
            }
            return $sql;
        }

        return null;
    }

    private function validateSql(string $sql): bool
    {
        // 1. Strip comments and normalize whitespace
        // Simple regex to remove block and inline comments
        $sql = preg_replace('!/\*.*?\*/!s', '', $sql);
        $sql = preg_replace('/\n\s*\-\-.*$/m', '', $sql);
        $sql = trim(preg_replace('/\s+/', ' ', $sql));

        // 2. First keyword must be SELECT
        if (stripos($sql, 'SELECT') !== 0) {
            return false;
        }

        // 3. Reject forbidden tokens
        $forbidden = [
            'INSERT', 'UPDATE', 'DELETE', 'DROP', 'TRUNCATE', 'ALTER', 'CREATE', 
            'EXEC', 'EXECUTE', 'CALL', 'INTO', 'LOAD', 'OUTFILE', 'DUMPFILE'
        ];
        
        $sqlUpper = strtoupper($sql);
        foreach ($forbidden as $token) {
            if (preg_match('/\b' . preg_quote($token, '/') . '\b/', $sqlUpper)) {
                return false;
            }
        }

        // 4. Reject if any table name outside allowed is referenced
        // Simple heuristic: find all words following FROM or JOIN
        preg_match_all('/\b(?:FROM|JOIN)\s+([a-zA-Z0-9_]+)\b/i', $sql, $matches);
        $tablesReferenced = array_unique($matches[1]);
        
        foreach ($tablesReferenced as $table) {
            if (!\in_array(strtolower($table), $this->allowedTables)) {
                return false;
            }
        }

        // 5. Reject if `:tenant_id` does not appear
        if (strpos($sql, ':tenant_id') === false) {
            return false;
        }

        return true;
    }

    /**
     * Sanitize the context string against a strict allowlist of known page identifiers.
     * Returns 'general' for any value that is not explicitly permitted.
     * This prevents arbitrary user input from being interpolated into the LLM system prompt.
     */
    private function sanitizeContext(?string $context): string
    {
        $allowed = [
            'dashboard',
            'invoices.index',
            'suppliers.index',
            'customers.index',
        ];

        return ($context !== null && \in_array($context, $allowed, true))
            ? $context
            : 'general';
    }

    private function executeSql(string $sql, int $tenantId): array
    {
        // Set max execution time to 5 seconds
        DB::statement("SET SESSION max_execution_time=5000");

        // Execute the query
        $results = DB::select($sql, ['tenant_id' => $tenantId]);

        // Cap results at 200 rows
        if (\count($results) > 200) {
            $results = \array_slice($results, 0, 200);
        }

        $decoded = json_decode(json_encode($results), true);

        // Post-execution tenant verification — final line of defence against
        // any query that contains :tenant_id but still leaks other tenants' rows
        // (e.g. via OR 1=1 bypass).
        foreach ($decoded as $row) {
            if (isset($row['tenant_id']) && (int) $row['tenant_id'] !== $tenantId) {
                Log::critical('InvoiceChatService: cross-tenant data leak attempt blocked.', [
                    'authenticated_tenant' => $tenantId,
                    'leaked_tenant'        => $row['tenant_id'],
                    'sql'                  => $sql,
                ]);
                throw new \RuntimeException('Security policy violation: cross-tenant data detected.');
            }
        }

        return $decoded;
    }

    private function narrateResult(string $question, array $rows, string $tenantCurrency = 'MAD', array $history = []): string
    {
        // Build conversion rates: how many tenantCurrency units per 1 unit of each currency
        $ratesToEur = ['MAD' => 0.092, 'EUR' => 1.0, 'USD' => 0.92, 'GBP' => 1.17];
        $targetRate = $ratesToEur[$tenantCurrency] ?? 1.0;
        $conversionLines = [];
        foreach ($ratesToEur as $cur => $toEur) {
            $rate = round($toEur / $targetRate, 4);
            $conversionLines[] = "  1 {$cur} = {$rate} {$tenantCurrency}";
        }
        $conversionTable = implode("\n", $conversionLines);

        $prompt = <<<PROMPT
You are BillMind Assistant, a friendly and professional financial assistant embedded in an invoice management platform.
Answer in the same language the user used (French, English, Arabic, or any mix).

Company reporting currency: {$tenantCurrency}
Currency conversion rates (for reference):
{$conversionTable}

Your tone:
- Warm and conversational — like a helpful colleague explaining results, not a system generating a report
- Natural sentences first, then formatted data if needed
- Never say "Based on the data…", "According to the results…", or "The query returned…"
- Never mention SQL, databases, or technical details

Formatting rules (the UI renders Markdown — use it):
- Lead with a natural sentence that directly answers the question
- Monetary amounts: always express totals and summaries in {$tenantCurrency}; use **bold** for key amounts
- When individual rows have a `currency` column different from {$tenantCurrency}, show the original in parentheses (e.g. "**480,00 {$tenantCurrency}** (48,00 USD)")
- Numbers: thousands separators, 2 decimal places
- Lists (invoices, suppliers, categories…): use a Markdown bulleted or numbered list, one item per line
- Multi-column results (e.g. supplier + amount, month + total): use a Markdown table
- Single number result: state it naturally and prominently in **bold**
- Multiple figures in one answer: use a Markdown table or inline **bold** labels
- Empty result: say so naturally (e.g. "It looks like there are no invoices matching that for now.")
- Keep it concise — no unnecessary filler, no repeating the question back
PROMPT;

        $messages = [['role' => 'system', 'content' => $prompt]];
        foreach ($history as $msg) {
            $messages[] = ['role' => $msg['role'], 'content' => $msg['content']];
        }
        $messages[] = ['role' => 'user', 'content' => 'Question: ' . $question . "\nData: " . json_encode($rows, JSON_UNESCAPED_UNICODE)];

        $response = Http::withoutVerifying()->withHeaders([
            'Authorization' => 'Bearer ' . $this->openaiKey,
        ])->post('https://api.openai.com/v1/chat/completions', [
            'model'    => $this->model,
            'messages' => $messages,
        ]);

        if ($response->successful()) {
            return $response->json('choices.0.message.content')
                ?? 'I found the data but had trouble putting it into words. Please try rephrasing your question.';
        }

        return 'I couldn\'t generate a response right now. Please try again in a moment.';
    }
}
