<?php

namespace App\Jobs;

use App\Models\Invoice;
use App\Models\InvoiceCategory;
use App\Services\BlazeInvoiceExtractorService;
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

    public function handle(MistralOcrService $ocr, BlazeInvoiceExtractorService $blaze): void
    {
        $this->invoice->update(['status' => 'processing', 'error_message' => null]);

        Log::channel('mistral')->info('Extraction job started', [
            'invoice_id' => $this->invoice->id,
            'file_path'  => $this->invoice->file_path,
            'attempt'    => $this->attempts(),
        ]);

        try {
            // Step 1 — OCR
            $ocrResult = $ocr->extractFromFile(
                $this->invoice->file_path,
                $this->invoice->mime_type
            );

            // Step 2 — Blaze AI structured extraction
            $categories = InvoiceCategory::where('is_active', true)
                ->orderBy('sort_order')
                ->get(['id', 'name', 'description'])
                ->toArray();

            $extracted = $blaze->extractFromText($ocrResult['ocr_text'], $categories);

            // Step 3 — Save invoice fields
            $this->invoice->update([
                ...$extracted['fields'],
                'ocr_text' => $ocrResult['ocr_text'],
                'status'   => 'processed',
            ]);

            // Step 4 — Save line items
            if (!empty($extracted['items'])) {
                $this->invoice->items()->delete();
                foreach ($extracted['items'] as $item) {
                    $this->invoice->items()->create($item);
                }
            }

            Log::channel('mistral')->info('Extraction job completed', [
                'invoice_id' => $this->invoice->id,
                'pages'      => $ocrResult['page_count'],
                'items'      => count($extracted['items']),
            ]);
        } catch (\Throwable $e) {
            $isLastAttempt = $this->attempts() >= $this->tries;

            Log::channel('mistral')->error('Extraction job failed', [
                'invoice_id' => $this->invoice->id,
                'attempt' => $this->attempts(),
                'is_last' => $isLastAttempt,
                'error' => $e->getMessage(),
            ]);

            // Only mark as error on the final attempt — keep processing during retries
            if ($isLastAttempt) {
                $this->invoice->update([
                    'status' => 'error',
                    'error_message' => $e->getMessage(),
                ]);
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
        $this->invoice->update([
            'status' => 'error',
            'error_message' => $e->getMessage(),
        ]);

        Log::channel('mistral')->error('Extraction job permanently failed', [
            'invoice_id' => $this->invoice->id,
            'error' => $e->getMessage(),
        ]);
    }
}
