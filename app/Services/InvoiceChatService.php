<?php

namespace App\Services;

use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class InvoiceChatService
{
    private string $openaiKey;
    private string $model = 'gpt-4o-mini';
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
            // 1. Generate SQL
            $sql = $this->generateSql($question, $context);
            
            if (!$sql) {
                return ['error' => 'Je n\'ai pas pu interpréter cette question. Essayez de la reformuler.'];
            }

            // 2. Validate SQL
            $isValid = $this->validateSql($sql);
            if (!$isValid) {
                return ['error' => 'Je n\'ai pas pu interpréter cette question. Essayez de la reformuler.'];
            }

            // 3. Execute SQL
            $rows = $this->executeSql($sql, $tenantId);

            // 4. Narrate results
            $answer = $this->narrateResult($question, $rows);

            return ['answer' => $answer];
        } catch (Exception $e) {
            Log::error('InvoiceChatService Error: ' . $e->getMessage());
            return ['error' => 'Une erreur s\'est produite lors de la génération de la réponse.'];
        }
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
You are a SQL expert. The user wants to query their invoicing database.
Here is the strict database schema:
$schema

RULES:
1. Return ONLY the raw SQL query string. Do not include markdown formatting, markdown blocks (like ```sql), or explanations. Just the SQL.
2. Only SELECT statements are permitted.
3. You MUST restrict queries to the current tenant. For any query on `invoices`, `suppliers`, or `customers`, you MUST include a WHERE clause using the exact parameter `:tenant_id` (e.g., `WHERE tenant_id = :tenant_id`). If you join tables, ensure the base table has this filter.
4. You must not reference any table outside the 5 provided tables.
5. No subqueries that reference system tables.
6. Current page context: $safeContext. Use this to prioritize relevant data if the question is ambiguous.
PROMPT;

        $response = Http::withoutVerifying()->withHeaders([
            'Authorization' => 'Bearer ' . $this->openaiKey,
        ])->post('https://api.openai.com/v1/chat/completions', [
            'model' => $this->model,
            'messages' => [
                ['role' => 'system', 'content' => $prompt],
                ['role' => 'user', 'content' => $question],
            ],
            'temperature' => 0.0,
        ]);

        if ($response->successful()) {
            $sql = $response->json('choices.0.message.content');
            // Clean up if it still includes markdown blocks
            $sql = preg_replace('/^```sql\s*|\s*```$/i', '', trim($sql));
            return trim($sql);
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
            if (!in_array(strtolower($table), $this->allowedTables)) {
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

        return ($context !== null && in_array($context, $allowed, true))
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
        if (count($results) > 200) {
            $results = array_slice($results, 0, 200);
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
You are a financial assistant for an invoice management system. Answer in the same language the user used.

FORMATTING RULES — follow them strictly:
- Lead with a one-sentence direct answer.
- For monetary amounts: always include the currency (e.g. "12 450,00 MAD"), format numbers with thousands separators and 2 decimal places.
- For lists (multiple invoices, suppliers, etc.): use a numbered or bulleted list, one item per line, each line showing the key identifier and the amount.
- For a single scalar result (one total, one count): state it clearly on its own line, prominently.
- If there are multiple figures, group them with short labels (e.g. "Subtotal HT:", "VAT:", "Total TTC:").
- Keep the response concise — no filler phrases. Skip the intro like "Based on the data…".
- If the result is empty: say clearly that no matching data was found.
PROMPT;

        $userMessage = "Question: " . $question . "\nData: " . json_encode($rows);

        $response = Http::withoutVerifying()->withHeaders([
            'Authorization' => 'Bearer ' . $this->openaiKey,
        ])->post('https://api.openai.com/v1/chat/completions', [
            'model' => $this->model,
            'messages' => [
                ['role' => 'system', 'content' => $prompt],
                ['role' => 'user', 'content' => $userMessage],
            ],
            'temperature' => 0.7,
        ]);

        if ($response->successful()) {
            return $response->json('choices.0.message.content') ?? 'No answer generated.';
        }

        return 'Sorry, I could not generate a response from the data.';
    }
}
