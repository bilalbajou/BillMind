<?php

namespace App\Services;

use App\Models\Invoice;
use Illuminate\Support\Facades\Log;

/**
 * Runs coherence checks on a freshly extracted invoice and returns
 * an array of anomaly flags ready to be saved via forceFill().
 *
 * All checks are intentionally lenient: they only raise a flag when
 * there is clear evidence of a problem, never on missing data alone.
 */
class AnomalyDetectorService
{
    /** Tolerance in currency units for floating-point comparisons. */
    private const AMOUNT_TOLERANCE = 0.02;

    /**
     * @return array{
     *     amount_anomaly: bool,
     *     vat_mismatch:   bool,
     *     date_anomaly:   bool,
     *     is_duplicate:   bool,
     *     new_supplier:   bool,
     * }
     */
    public function detect(Invoice $invoice): array
    {
        $flags = [
            'amount_anomaly' => $this->checkAmountAnomaly($invoice),
            'vat_mismatch'   => $this->checkVatMismatch($invoice),
            'date_anomaly'   => $this->checkDateAnomaly($invoice),
            'is_duplicate'   => $this->checkDuplicate($invoice),
            'new_supplier'   => $this->checkNewSupplier($invoice),
        ];

        $raised = array_keys(array_filter($flags));

        Log::channel('mistral')->info('Anomaly detection completed', [
            'invoice_id' => $invoice->id,
            'flags'      => $raised ?: ['none'],
        ]);

        return $flags;
    }

    // ── Individual checks ────────────────────────────────────────────────────

    /**
     * total_ttc ≠ subtotal_ht + vat_amount
     * Only raised when all three values are present.
     */
    private function checkAmountAnomaly(Invoice $invoice): bool
    {
        if ($invoice->subtotal_ht === null || $invoice->vat_amount === null || $invoice->total_ttc === null) {
            return false;
        }

        $expected = round((float) $invoice->subtotal_ht + (float) $invoice->vat_amount, 2);
        $actual   = round((float) $invoice->total_ttc, 2);

        return abs($expected - $actual) > self::AMOUNT_TOLERANCE;
    }

    /**
     * vat_amount ≠ ROUND(subtotal_ht × vat_rate / 100, 2)
     * Raised when the declared VAT rate doesn't match the declared VAT amount.
     */
    private function checkVatMismatch(Invoice $invoice): bool
    {
        if ($invoice->subtotal_ht === null || $invoice->vat_rate === null || $invoice->vat_amount === null) {
            return false;
        }

        $expected = round((float) $invoice->subtotal_ht * (float) $invoice->vat_rate / 100, 2);
        $actual   = round((float) $invoice->vat_amount, 2);

        return abs($expected - $actual) > self::AMOUNT_TOLERANCE;
    }

    /**
     * due_date is strictly before issue_date — logically impossible.
     */
    private function checkDateAnomaly(Invoice $invoice): bool
    {
        if ($invoice->issue_date === null || $invoice->due_date === null) {
            return false;
        }

        return $invoice->due_date->lt($invoice->issue_date);
    }

    /**
     * Another processed invoice with the same number AND supplier already
     * exists in this tenant (excluding the invoice being checked).
     *
     * Also flags if a different invoice file with the identical content_hash
     * (exact byte-for-byte copy) exists in the same tenant.
     */
    private function checkDuplicate(Invoice $invoice): bool
    {
        // Duplicate invoice number from the same supplier
        if ($invoice->number && $invoice->supplier_id) {
            $exists = Invoice::where('tenant_id', $invoice->tenant_id)
                ->where('id', '!=', $invoice->id)
                ->where('number', $invoice->number)
                ->where('supplier_id', $invoice->supplier_id)
                ->exists();

            if ($exists) {
                return true;
            }
        }

        // Exact file duplicate (same content_hash)
        if ($invoice->content_hash) {
            $exists = Invoice::where('tenant_id', $invoice->tenant_id)
                ->where('id', '!=', $invoice->id)
                ->where('content_hash', $invoice->content_hash)
                ->exists();

            if ($exists) {
                return true;
            }
        }

        return false;
    }

    /**
     * The supplier has never appeared in any other processed invoice
     * for this tenant before — could be a typo or a new vendor requiring approval.
     */
    private function checkNewSupplier(Invoice $invoice): bool
    {
        if (! $invoice->supplier_id) {
            return false;
        }

        return ! Invoice::where('tenant_id', $invoice->tenant_id)
            ->where('id', '!=', $invoice->id)
            ->where('status', 'processed')
            ->where('supplier_id', $invoice->supplier_id)
            ->exists();
    }
}
