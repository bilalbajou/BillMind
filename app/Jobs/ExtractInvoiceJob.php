<?php

namespace App\Jobs;

use App\Models\Invoice;
use App\Models\InvoiceCategory;
use App\Services\AnomalyDetectorService;
use App\Services\OpenAiInvoiceExtractorService;
use App\Services\MistralOcrService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ExtractInvoiceJob implements ShouldQueue
{
    use Queueable, InteractsWithQueue, SerializesModels;

    public int $tries = 3;
    public int $timeout = 180; // 3 min max per invoice

    public function __construct(public Invoice $invoice)
    {
    }

    public function handle(MistralOcrService $ocr, OpenAiInvoiceExtractorService $extractor, AnomalyDetectorService $detector): void
    {
        // forceFill() is required because status/error_message are intentionally excluded
        // from $fillable — they must only be written by this job, never by OCR output.
        $this->invoice->forceFill(['status' => 'processing', 'error_message' => null])->save();

        Log::channel('mistral')->info('Extraction job started', [
            'invoice_id' => $this->invoice->id,
            'file_path' => $this->invoice->file_path,
            'attempt' => $this->attempts(),
        ]);

        try {
            // Step 1 — OCR
            $ocrResult = $ocr->extractFromFile(
                $this->invoice->file_path,
                $this->invoice->mime_type
            );

            // Step 2 — OpenRouter structured extraction
            $categories = InvoiceCategory::where('is_active', true)
                ->orderBy('sort_order')
                ->get(['id', 'name', 'description'])
                ->toArray();

            $extracted = $extractor->extractFromText($ocrResult['ocr_text'], $categories);

            // Fallback: if the AI didn't assign a valid category, resolve "miscellaneous"
            // from the database by its slug. Stores null if the category doesn't exist —
            // never a hardcoded id that could be wrong after a migration or fresh install.
            if (empty($extracted['fields']['category_id'])) {
                $extracted['fields']['category_id'] = InvoiceCategory::where('slug', 'miscellaneous')->value('id');
            }

            // Step 3 — Save AI-extracted invoice fields via normal update() so $fillable
            // acts as a hard barrier: any field the AI returns that is not in $fillable
            // (status, error_message, tenant_id, uploaded_by, anomaly flags, etc.) is
            // silently dropped before it reaches the database.
            $this->invoice->update([
                ...$extracted['fields'],
                'ocr_text' => $ocrResult['ocr_text'],
            ]);

            // Step 3b - Auto-create or Update Supplier & Client
            $supplierId = null;
            if (!empty($extracted['fields']['supplier_name'])) {
                $q = \App\Models\Supplier::where('tenant_id', $this->invoice->tenant_id);
                if (!empty($extracted['fields']['supplier_ice'])) {
                    $q->where('ice', $extracted['fields']['supplier_ice']);
                } else {
                    $q->whereRaw('LOWER(name) = LOWER(?)', [$extracted['fields']['supplier_name']]);
                }
                
                $supplier = $q->first();
                $sData = [];
                foreach(['name', 'address', 'ice', 'if', 'rc', 'phone', 'email', 'rib'] as $f) {
                    if (!empty($extracted['fields']["supplier_{$f}"])) {
                        $sData[$f] = $extracted['fields']["supplier_{$f}"];
                    }
                }
                
                if (!$supplier && !empty($sData['name'])) {
                    $sData['tenant_id'] = $this->invoice->tenant_id;
                    $supplier = \App\Models\Supplier::create($sData);
                }
                
                if ($supplier) {
                    $supplierId = $supplier->id;
                }
            }

            $customerId = null;
            if (!empty($extracted['fields']['customer_name'])) {
                $q = \App\Models\Customer::where('tenant_id', $this->invoice->tenant_id);
                if (!empty($extracted['fields']['customer_ice'])) {
                    $q->where('ice', $extracted['fields']['customer_ice']);
                } else {
                    $q->whereRaw('LOWER(name) = LOWER(?)', [$extracted['fields']['customer_name']]);
                }
                
                $customer = $q->first();
                $cData = [];
                foreach(['name', 'address', 'ice', 'if', 'rc', 'phone', 'email', 'rib'] as $f) {
                    $k = "customer_{$f}";
                    if (!empty($extracted['fields'][$k])) {
                        $cData[$f] = $extracted['fields'][$k];
                    }
                }
                
                if (!$customer && !empty($cData['name'])) {
                    $cData['tenant_id'] = $this->invoice->tenant_id;
                    $customer = \App\Models\Customer::create($cData);
                }
                
                if ($customer) {
                    $customerId = $customer->id;
                }
            }

            $this->invoice->forceFill([
                'supplier_id' => $supplierId,
                'customer_id' => $customerId,
            ])->save();

            // Step 4 — Detect anomalies on the freshly saved data and persist flags.
            // forceFill() is used because anomaly flags are excluded from $fillable.
            $this->invoice->refresh(); // ensure computed fields are up-to-date
            $anomalies = $detector->detect($this->invoice);
            $this->invoice->forceFill($anomalies)->save();

            // Step 5 — Mark as processed via forceFill() — not part of AI output.
            $this->invoice->forceFill(['status' => 'processed'])->save();

            if (!empty($extracted['items'])) {
                $this->invoice->items()->delete();
                foreach ($extracted['items'] as $item) {
                    // Enforce DB-level NOT NULL defaults for columns without a DB default.
                    $item['description']     = (string) ($item['description']    ?? 'Item');
                    $item['quantity']        = (float)  ($item['quantity']       ?? 1.0);
                    $item['unit_price']      = (float)  ($item['unit_price']     ?? 0.0);
                    $item['vat_rate']        = (float)  ($item['vat_rate']       ?? 0.0);
                    $item['discount_rate']   = (float)  ($item['discount_rate']  ?? 0.0);
                    $item['discount_amount'] = (float)  ($item['discount_amount'] ?? 0.0);
                    $this->invoice->items()->create($item);
                }
            }

            Log::channel('mistral')->info('Extraction job completed', [
                'invoice_id' => $this->invoice->id,
                'pages' => $ocrResult['page_count'],
                'items' => \count($extracted['items']),
            ]);
        } catch (\Throwable $e) {
            $isLastAttempt = $this->attempts() >= $this->tries;

            Log::channel('mistral')->error('Extraction job failed', [
                'invoice_id' => $this->invoice->id,
                'attempt' => $this->attempts(),
                'is_last' => $isLastAttempt,
                'error' => $e->getMessage(),
            ]);

            // Only mark as error on the final attempt — keep 'processing' during retries
            // so the frontend spinner stays active and the user is not misled.
            if ($isLastAttempt) {
                $this->invoice->forceFill([
                    'status' => 'error',
                    'error_message' => $e->getMessage(),
                ])->save();
            }

            throw $e; // let Laravel retry or move to failed_jobs
        }
    }

    /**
     * Called by Laravel after all retries are exhausted.
     * Safety net in case the catch block above didn't reach its last-attempt check.
     */
    public function failed(\Throwable $e): void
    {
        $this->invoice->forceFill([
            'status' => 'error',
            'error_message' => $e->getMessage(),
        ])->save();

        Log::channel('mistral')->error('Extraction job permanently failed', [
            'invoice_id' => $this->invoice->id,
            'error' => $e->getMessage(),
        ]);
    }
}
