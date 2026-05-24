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
    public function ask(string $question, int $tenantId, ?string $context = null): array
    {
        try {
            // 1. Handle greetings, thanks, help, and other conversational messages directly
            if ($this->isConversational($question)) {
                return ['answer' => $this->respondConversationally($question)];
            }

            // 2. Generate SQL
            $sql = $this->generateSql($question, $context);

            // 3. Validate SQL — fall back to conversational if it cannot be generated or is unsafe
            if (!$sql || !$this->validateSql($sql)) {
                return ['answer' => $this->respondConversationally($question)];
            }

            // 4. Execute SQL
            $rows = $this->executeSql($sql, $tenantId);

            // 5. Narrate results in a human-friendly way
            $answer = $this->narrateResult($question, $rows);

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
    private function respondConversationally(string $question): string
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

        $response = Http::withoutVerifying()->withHeaders([
            'Authorization' => 'Bearer ' . $this->openaiKey,
        ])->post('https://api.openai.com/v1/chat/completions', [
            'model'    => $this->model,
            'messages' => [
                ['role' => 'system', 'content' => $prompt],
                ['role' => 'user',   'content' => $question],
            ],
        ]);

        if ($response->successful()) {
            return $response->json('choices.0.message.content')
                ?? 'Hi! I\'m here to help with your invoices. What would you like to know?';
        }

        return 'Hi! I\'m here to help with your invoice data. What would you like to know?';
    }

    private function generateSql(string $question, ?string $context = null): ?string
    {
        // Sanitize context before injecting into the prompt — second line of defence
        $safeContext = $this->sanitizeContext($context);
        $schema = <<<SCHEMA
Table: invoices (id, tenant_id, uploaded_by, original_filename, stored_filename, file_path, content_hash, mime_type, file_type, file_size, number, po_reference, supplier_name, supplier_address, supplier_ice, supplier_if, supplier_rc, supplier_phone, supplier_email, supplier_rib, supplier_id, customer_name, customer_address, customer_ice, customer_if, customer_id, issue_date, due_date, subtotal_ht, vat_amount, vat_rate, total_ttc, amount_in_words, discount_rate, discount_amount, taxable_amount, payment_method, payment_terms, payment_reference, late_penalty, bank_name, bank_iban, currency, category, category_id, category_corrected_id, category_score, status, error_message, is_duplicate, amount_anomaly, date_anomaly, new_supplier, vat_mismatch, ocr_text, extraction_score, created_at, updated_at, deleted_at)
Table: invoice_items (id, invoice_id, sort_order, description, sub_description, quantity, unit, unit_price, vat_rate, vat_amount, amount_ht, amount_ttc, discount_rate, discount_amount, created_at, updated_at)
Table: invoice_categories (id, name, slug, icon, color, description, is_active, sort_order, created_at, updated_at)
Table: suppliers (id, tenant_id, name, address, ice, if, rc, phone, email, rib, created_at, updated_at)
Table: customers (id, tenant_id, name, address, ice, if, rc, phone, email, rib, created_at, updated_at)
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
5. Never reference a table outside the 5 provided ones.
6. No subqueries referencing system tables.
7. Current page context: $safeContext — use it to prioritize relevant data when the question is ambiguous.
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

    private function narrateResult(string $question, array $rows): string
    {
        $prompt = <<<PROMPT
You are BillMind Assistant, a friendly and professional financial assistant embedded in an invoice management platform.
Answer in the same language the user used (French, English, Arabic, or any mix).

Your tone:
- Warm and conversational — like a helpful colleague explaining results, not a system generating a report
- Natural sentences first, then formatted data if needed
- Never say "Based on the data…", "According to the results…", or "The query returned…"
- Never mention SQL, databases, or technical details

Formatting rules:
- Lead with a natural sentence that directly answers the question (e.g. "You spent 12 450,00 MAD on IT services this month.")
- Monetary amounts: include currency (e.g. "12 450,00 MAD"), thousands separators, 2 decimal places
- Lists (invoices, suppliers…): clean numbered or bulleted list, one item per line with key info
- Single number result: state it naturally and prominently
- Multiple figures: short labels inline (e.g. "Subtotal: 10 000 MAD · VAT: 2 000 MAD · Total: 12 000 MAD")
- Empty result: say so naturally (e.g. "It looks like there are no invoices matching that for now.")
- Keep it concise — no unnecessary filler
PROMPT;

        $userMessage = 'Question: ' . $question . "\nData: " . json_encode($rows, JSON_UNESCAPED_UNICODE);

        $response = Http::withoutVerifying()->withHeaders([
            'Authorization' => 'Bearer ' . $this->openaiKey,
        ])->post('https://api.openai.com/v1/chat/completions', [
            'model'    => $this->model,
            'messages' => [
                ['role' => 'system', 'content' => $prompt],
                ['role' => 'user',   'content' => $userMessage],
            ],
        ]);

        if ($response->successful()) {
            return $response->json('choices.0.message.content')
                ?? 'I found the data but had trouble putting it into words. Please try rephrasing your question.';
        }

        return 'I couldn\'t generate a response right now. Please try again in a moment.';
    }
}
