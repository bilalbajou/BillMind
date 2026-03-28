<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class BlazeInvoiceExtractorService
{
    private const ENDPOINT = 'https://blazeai.boxu.dev/api/v1/chat/completions';
    private const MODEL    = 'anthropic/claude-sonnet-4-6';

    private const INVOICE_FIELDS = [
        'number', 'po_reference', 'issue_date', 'due_date',
        'supplier_name', 'supplier_address', 'supplier_ice', 'supplier_if',
        'supplier_rc', 'supplier_phone', 'supplier_email', 'supplier_rib',
        'customer_name', 'customer_address', 'customer_ice', 'customer_if',
        'subtotal_ht', 'discount_rate', 'discount_amount', 'taxable_amount',
        'vat_rate', 'vat_amount', 'total_ttc', 'currency', 'amount_in_words',
        'payment_method', 'payment_terms', 'payment_reference', 'late_penalty',
        'bank_name', 'bank_iban',
    ];

    public function __construct(private readonly string $apiKey) {}

    public function extractFromText(string $ocrText, array $categories = []): array
    {
        Log::channel('blaze')->info('Blaze request sent', [
            'text_length'      => strlen($ocrText),
            'categories_count' => count($categories),
        ]);

        $response = Http::withToken($this->apiKey)
            ->timeout(60)
            ->when(app()->isLocal(), fn($h) => $h->withoutVerifying())
            ->post(self::ENDPOINT, [
                'model'       => self::MODEL,
                'temperature' => 0,
                'messages'    => [
                    ['role' => 'system', 'content' => $this->systemPrompt($categories)],
                    ['role' => 'user',   'content' => $ocrText],
                ],
            ]);

        if ($response->failed()) {
            Log::channel('blaze')->error('Blaze request failed', [
                'http_status' => $response->status(),
                'response'    => $response->body(),
            ]);
            throw new \RuntimeException('Blaze API error ' . $response->status() . ': ' . $response->body());
        }

        $raw = $response->json('choices.0.message.content') ?? '';

        Log::channel('blaze')->info('Blaze response received', [
            'raw_length' => strlen($raw),
            'raw'        => $raw,
        ]);

        // Strip markdown code fences if the model wrapped the JSON
        $raw = preg_replace('/^```(?:json)?\s*/i', '', trim($raw));
        $raw = preg_replace('/\s*```$/', '', $raw);

        $parsed = json_decode(trim($raw), true);

        if (json_last_error() !== JSON_ERROR_NONE || !is_array($parsed)) {
            throw new \RuntimeException('Blaze returned invalid JSON: ' . $raw);
        }

        $fields = $this->filterFields($parsed['invoice'] ?? $parsed);

        // Validate returned category_id against provided list
        if (!empty($parsed['category_id']) && !empty($categories)) {
            $validIds = array_column($categories, 'id');
            if (\in_array((int) $parsed['category_id'], $validIds, true)) {
                $fields['category_id'] = (int) $parsed['category_id'];
            }
        }

        return [
            'fields' => $fields,
            'items'  => $this->normalizeItems($parsed['items'] ?? []),
        ];
    }

    private function systemPrompt(array $categories = []): string
    {
        $categorySection = '';
        if (!empty($categories)) {
            $list = implode("\n", array_map(
                fn($c) => "  - id={$c['id']}: {$c['name']}" . ($c['description'] ? " ({$c['description']})" : ''),
                $categories
            ));
            $categorySection = "\n- Choose the best matching category_id from this list based on the supplier name, description, and line items:\n{$list}\n  Return category_id as an integer at the root level of the JSON (not inside \"invoice\"). If nothing matches, use null.";
        }

        return <<<PROMPT
You are an invoice data extraction assistant. Extract all available fields from the invoice OCR text the user provides and return a single JSON object.

Rules:
- Dates must be in YYYY-MM-DD format. Convert any format (DD/MM/YYYY, etc.).
- All monetary amounts must be plain decimal numbers (no symbols, no thousand separators). Example: 19400.00
- discount_rate and vat_rate must be a percentage as a decimal number (e.g. 20 for 20%, 3.5 for 3.5%).
- payment_method must be one of: bank_transfer, check, cash, card, bill_of_exchange, other.
- unit (for line items) must be one of: piece, hour, kg, flat_fee, km, day, month, other.
- Use null for any field not found in the text.
- currency should be ISO 4217 code (MAD, EUR, USD, etc.). Default to MAD if not specified.{$categorySection}

Return ONLY this JSON structure, no explanation, no markdown fences:
{
  "category_id": null,
  "invoice": {
    "number": null,
    "po_reference": null,
    "issue_date": null,
    "due_date": null,
    "supplier_name": null,
    "supplier_address": null,
    "supplier_ice": null,
    "supplier_if": null,
    "supplier_rc": null,
    "supplier_phone": null,
    "supplier_email": null,
    "supplier_rib": null,
    "customer_name": null,
    "customer_address": null,
    "customer_ice": null,
    "customer_if": null,
    "subtotal_ht": null,
    "discount_rate": null,
    "discount_amount": null,
    "taxable_amount": null,
    "vat_rate": null,
    "vat_amount": null,
    "total_ttc": null,
    "currency": "MAD",
    "amount_in_words": null,
    "payment_method": null,
    "payment_terms": null,
    "payment_reference": null,
    "late_penalty": null,
    "bank_name": null,
    "bank_iban": null
  },
  "items": [
    {
      "sort_order": 1,
      "description": null,
      "sub_description": null,
      "quantity": null,
      "unit": null,
      "unit_price": null,
      "vat_rate": null,
      "vat_amount": null,
      "amount_ht": null,
      "amount_ttc": null,
      "discount_rate": null,
      "discount_amount": null
    }
  ]
}
PROMPT;
    }

    private function filterFields(array $data): array
    {
        $filtered = array_intersect_key($data, array_flip(self::INVOICE_FIELDS));
        return array_filter($filtered, fn($v) => $v !== null);
    }

    private const VALID_UNITS = ['piece', 'hour', 'kg', 'flat_fee', 'km', 'day', 'month', 'other'];

    private function normalizeItems(array $items): array
    {
        $allowed = ['sort_order', 'description', 'sub_description', 'quantity', 'unit',
                    'unit_price', 'vat_rate', 'vat_amount', 'amount_ht', 'amount_ttc',
                    'discount_rate', 'discount_amount'];

        return array_map(function ($item, $index) use ($allowed) {
            $normalized = array_intersect_key($item, array_flip($allowed));
            $normalized['sort_order'] = $normalized['sort_order'] ?? ($index + 1);

            if (isset($normalized['unit'])) {
                $normalized['unit'] = $this->resolveUnit($normalized['unit']);
            }

            return array_filter($normalized, fn($v) => $v !== null);
        }, $items, array_keys($items));
    }

    private function resolveUnit(mixed $value): string
    {
        if (!is_string($value)) {
            return 'other';
        }

        $value = strtolower(trim($value));

        if (in_array($value, self::VALID_UNITS, true)) {
            return $value;
        }

        // Common aliases
        $map = [
            'pcs' => 'piece', 'pc' => 'piece', 'unit' => 'piece', 'units' => 'piece',
            'u' => 'piece', 'qty' => 'piece', 'item' => 'piece', 'items' => 'piece',
            'h' => 'hour', 'hr' => 'hour', 'hrs' => 'hour', 'hours' => 'hour', 'heure' => 'hour', 'heures' => 'hour',
            'kilogram' => 'kg', 'kilograms' => 'kg', 'kgs' => 'kg',
            'forfait' => 'flat_fee', 'flat' => 'flat_fee', 'fixed' => 'flat_fee', 'lump' => 'flat_fee',
            'kilometre' => 'km', 'kilometres' => 'km', 'kilometer' => 'km',
            'jour' => 'day', 'jours' => 'day', 'days' => 'day', 'd' => 'day',
            'mois' => 'month', 'months' => 'month', 'mo' => 'month',
        ];

        return $map[$value] ?? 'other';
    }
}
