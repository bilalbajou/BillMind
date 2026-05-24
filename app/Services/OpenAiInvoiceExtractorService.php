<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class OpenAiInvoiceExtractorService
{
    private const ENDPOINT = 'https://api.openai.com/v1/chat/completions';
    private const MODEL = 'gpt-5.4-mini';

    private const INVOICE_FIELDS = [
        'number',
        'po_reference',
        'issue_date',
        'due_date',
        'supplier_name',
        'supplier_address',
        'supplier_ice',
        'supplier_if',
        'supplier_rc',
        'supplier_phone',
        'supplier_email',
        'supplier_rib',
        'customer_name',
        'customer_address',
        'customer_ice',
        'customer_if',
        'subtotal_ht',
        'discount_rate',
        'discount_amount',
        'taxable_amount',
        'vat_rate',
        'vat_amount',
        'total_ttc',
        'currency',
        'amount_in_words',
        'payment_method',
        'payment_terms',
        'payment_reference',
        'late_penalty',
        'bank_name',
        'bank_iban',
    ];

    public function __construct(private readonly string $apiKey)
    {
    }

    public function extractFromText(string $ocrText, array $categories = []): array
    {
        Log::channel('openai')->info('OpenAI extraction request sent', [
            'text_length' => \strlen($ocrText),
            'categories_count' => \count($categories),
        ]);

        $response = Http::withToken($this->apiKey)
            ->timeout(150)
            ->when(app()->isLocal(), fn($h) => $h->withoutVerifying())
            ->post(self::ENDPOINT, [
                'model' => self::MODEL,
                'messages' => [
                    ['role' => 'system', 'content' => $this->systemPrompt($categories)],
                    ['role' => 'user', 'content' => $ocrText],
                ],
            ]);

        if ($response->failed()) {
            Log::channel('openai')->error('OpenAI extraction request failed', [
                'http_status' => $response->status(),
                'response' => $response->body(),
            ]);
            throw new \RuntimeException('Blaze API error ' . $response->status() . ': ' . $response->body());
        }

        $raw = $response->json('choices.0.message.content') ?? '';

        Log::channel('openai')->info('Blaze response received', [
            'raw_length' => \strlen($raw),
            'raw' => $raw,
        ]);

        // Strip markdown code fences if the model wrapped the JSON
        $raw = preg_replace('/^```(?:json)?\s*/i', '', trim($raw));
        $raw = preg_replace('/\s*```$/', '', $raw);

        $parsed = json_decode(trim($raw), true);

        if (json_last_error() !== JSON_ERROR_NONE || !\is_array($parsed)) {
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
            'items' => $this->normalizeItems($parsed['items'] ?? []),
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
You are a highly capable financial document data extraction assistant. The OCR text provided may belong to an Invoice, Purchase Order, Billing Statement, Receipt, or Quote in any language (French, Arabic, English, or mixed).
Extract all available fields from the text and return a single JSON object.

## General Rules
- Document type agnosticism: map "Purchase Order #", "Statement No", "Receipt No", etc. to `invoice.number`. For POs, map vendor/seller to `supplier_name` and buyer/recipient to `customer_name`.
- Dates must be in YYYY-MM-DD format. Convert any format (DD/MM/YYYY, Month DD YYYY, etc.).
- All monetary amounts must be plain decimal numbers using a period as the decimal separator, no currency symbols, no thousand separators.
  * "1 234,56" → 1234.56 | "1.234,56" → 1234.56 | "1,234.56" → 1234.56
- `discount_rate` and `vat_rate` must be a plain percentage number (e.g. 20 for 20%, 3.5 for 3.5%).
- `payment_method` must be one of: bank_transfer, check, cash, card, bill_of_exchange, other.
- `currency` must be ISO 4217 (MAD, EUR, USD…). Default to MAD if not specified.
- Use null for any field not found in the text. Do NOT invent or estimate data.{$categorySection}

## Line Item Extraction Rules (CRITICAL)
The OCR renders tables as markdown. Each table row is one line item. Follow these rules precisely:

1. Extract EVERY row from the items table — never skip a row, even for single-item invoices.
2. `description` is the product or service name. If a row spans multiple OCR lines, concatenate them with a space.
3. `sub_description` is a secondary label on the same line item (reference code, spec, period). Use null if absent.
4. `quantity` is the numeric quantity (Qté, Qty, Nb, Quantité). If not printed but the item clearly represents one unit, use 1.
5. `unit_price` is the price per unit BEFORE any discount and BEFORE VAT (Prix Unitaire HT, P.U. HT, Unit Price). Extract it as a plain decimal.
6. `amount_ht` is the line total BEFORE VAT (Montant HT, Total HT, Net HT). It equals `quantity × unit_price` after any line discount.
   * `amount_ht` is NEVER the TTC (after-tax) amount. If the table only shows TTC per line, derive: `amount_ht = amount_ttc / (1 + vat_rate/100)`.
   * If the table shows both HT and TTC per line, always use the HT column for `amount_ht`.
7. Derivation priority:
   * If `quantity` AND `unit_price` are both visible → extract both, set `amount_ht = quantity × unit_price` (applying discount if any).
   * If only `amount_ht` is visible (flat-fee style) → set `unit_price = amount_ht` and `quantity = 1`.
   * If `quantity` AND `amount_ht` are visible but `unit_price` is not → set `unit_price = amount_ht / quantity`.
8. `vat_rate` per line: extract if shown per row. If the document has a single global VAT rate (e.g. 20%), apply it to every item. Do not leave it null if you can determine it.
9. `discount_rate`: percentage discount applied to this line (e.g. 10 for 10%). Extract only if explicitly shown. Do not confuse with the invoice-level discount.
10. `unit` must be one of: piece, hour, kg, flat_fee, km, day, month, other.
    * "Forfait", "Flat", "Lump sum" → flat_fee | "Heure", "Hr", "H" → hour | "Jour", "Day" → day | default → piece.
11. `sort_order` is the row number starting from 1.

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
      "amount_ht": null,
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

    private const NUMERIC_ITEM_FIELDS = ['quantity', 'unit_price', 'amount_ht', 'vat_rate', 'discount_rate', 'discount_amount'];

    private function normalizeItems(array $items): array
    {
        $allowed = [
            'sort_order', 'description', 'sub_description', 'quantity', 'unit',
            'unit_price', 'vat_rate', 'amount_ht', 'discount_rate', 'discount_amount',
        ];

        return array_values(array_map(function ($item, $index) use ($allowed) {
            $normalized = array_intersect_key($item, array_flip($allowed));
            $normalized['sort_order'] = $normalized['sort_order'] ?? ($index + 1);

            if (isset($normalized['unit'])) {
                $normalized['unit'] = $this->resolveUnit($normalized['unit']);
            }

            // Cast every numeric field, handling locale-specific formatting
            foreach (self::NUMERIC_ITEM_FIELDS as $field) {
                if (\array_key_exists($field, $normalized)) {
                    $normalized[$field] = $this->parseNumeric($normalized[$field]);
                }
            }

            // Derive any missing numeric field from the available ones
            $normalized = $this->deriveItemFields($normalized);

            return array_filter($normalized, fn($v) => $v !== null);
        }, $items, array_keys($items)));
    }

    /**
     * Derive missing quantity / unit_price / amount_ht from whichever two are present.
     */
    private function deriveItemFields(array $item): array
    {
        $qty       = isset($item['quantity'])   ? (float) $item['quantity']   : null;
        $unitPrice = isset($item['unit_price']) ? (float) $item['unit_price'] : null;
        $amountHt  = isset($item['amount_ht'])  ? (float) $item['amount_ht']  : null;

        // Derive amount_ht from quantity × unit_price
        if ($amountHt === null && $qty !== null && $unitPrice !== null && $qty > 0) {
            $amountHt = round($qty * $unitPrice, 4);
            $item['amount_ht'] = $amountHt;
        }

        // Derive unit_price from amount_ht ÷ quantity
        if ($unitPrice === null && $amountHt !== null && $qty !== null && $qty > 0) {
            $item['unit_price'] = round($amountHt / $qty, 4);
            $unitPrice = $item['unit_price'];
        }

        // Default quantity to 1 when we have a price or total but no explicit quantity
        if ($qty === null && ($amountHt !== null || $unitPrice !== null)) {
            $item['quantity'] = 1.0;
            $qty = 1.0;
        }

        // Derive unit_price after quantity is defaulted
        if (!isset($item['unit_price']) && isset($item['amount_ht'])) {
            $item['unit_price'] = round((float) $item['amount_ht'] / (float) $item['quantity'], 4);
        }

        // Derive amount_ht after quantity is defaulted
        if (!isset($item['amount_ht']) && isset($item['unit_price']) && isset($item['quantity'])) {
            $item['amount_ht'] = round((float) $item['unit_price'] * (float) $item['quantity'], 4);
        }

        return $item;
    }

    /**
     * Parse a numeric value that may carry locale-specific formatting.
     * Handles: "1 234,56", "1.234,56", "1,234.56", "19400.00", etc.
     */
    private function parseNumeric(mixed $value): ?float
    {
        if ($value === null) {
            return null;
        }
        if (\is_int($value) || \is_float($value)) {
            return (float) $value;
        }
        if (!\is_string($value)) {
            return null;
        }

        $v = trim($value);

        if ($v === '' || $v === '-') {
            return null;
        }

        $hasComma = str_contains($v, ',');
        $hasDot   = str_contains($v, '.');

        if ($hasComma && $hasDot) {
            // Whichever appears last is the decimal separator
            if (strrpos($v, ',') > strrpos($v, '.')) {
                // European: "1.234,56"
                $v = str_replace(['.', ' '], '', $v);
                $v = str_replace(',', '.', $v);
            } else {
                // American: "1,234.56"
                $v = str_replace([',', ' '], '', $v);
            }
        } elseif ($hasComma) {
            $afterComma = substr($v, strrpos($v, ',') + 1);
            // Decimal comma if ≤2 digits after it, else thousand separator
            if (\strlen($afterComma) <= 2) {
                $v = str_replace([' ', '.'], '', $v);
                $v = str_replace(',', '.', $v);
            } else {
                $v = str_replace([',', ' '], '', $v);
            }
        } else {
            $v = str_replace(' ', '', $v);
        }

        return is_numeric($v) ? (float) $v : null;
    }

    private function resolveUnit(mixed $value): string
    {
        if (!\is_string($value)) {
            return 'other';
        }

        $value = strtolower(trim($value));

        if (\in_array($value, self::VALID_UNITS, true)) {
            return $value;
        }

        $map = [
            'pcs'        => 'piece',
            'pc'         => 'piece',
            'unit'       => 'piece',
            'units'      => 'piece',
            'u'          => 'piece',
            'qty'        => 'piece',
            'item'       => 'piece',
            'items'      => 'piece',
            'h'          => 'hour',
            'hr'         => 'hour',
            'hrs'        => 'hour',
            'hours'      => 'hour',
            'heure'      => 'hour',
            'heures'     => 'hour',
            'kilogram'   => 'kg',
            'kilograms'  => 'kg',
            'kgs'        => 'kg',
            'forfait'    => 'flat_fee',
            'flat'       => 'flat_fee',
            'fixed'      => 'flat_fee',
            'lump'       => 'flat_fee',
            'kilometre'  => 'km',
            'kilometres' => 'km',
            'kilometer'  => 'km',
            'jour'       => 'day',
            'jours'      => 'day',
            'days'       => 'day',
            'd'          => 'day',
            'mois'       => 'month',
            'months'     => 'month',
            'mo'         => 'month',
        ];

        return $map[$value] ?? 'other';
    }
}
