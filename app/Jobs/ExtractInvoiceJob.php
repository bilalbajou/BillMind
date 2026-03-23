<?php

namespace App\Jobs;

use App\Models\Invoice;
use App\Services\MistralOcrService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ExtractInvoiceJob implements ShouldQueue
{
    use Queueable, InteractsWithQueue, SerializesModels;

    public int $tries   = 3;
    public int $timeout = 180; // 3 min max per invoice

    public function __construct(public Invoice $invoice) {}

    public function handle(MistralOcrService $ocr): void
    {
        Log::channel('mistral')->info('Extraction job started', [
            'invoice_id' => $this->invoice->id,
            'file_path'  => $this->invoice->file_path,
            'attempt'    => $this->attempts(),
        ]);

        try {
            $result = $ocr->extractFromFile(
                $this->invoice->file_path,
                $this->invoice->mime_type
            );

            $this->invoice->update([
                'ocr_text' => $result['ocr_text'],
                'status'   => 'processed',
            ]);

            Log::channel('mistral')->info('Extraction job completed', [
                'invoice_id' => $this->invoice->id,
                'pages'      => $result['page_count'],
            ]);
        } catch (\Throwable $e) {
            Log::channel('mistral')->error('Extraction job failed', [
                'invoice_id' => $this->invoice->id,
                'attempt'    => $this->attempts(),
                'tries_left' => $this->tries - $this->attempts(),
                'error'      => $e->getMessage(),
            ]);

            $this->invoice->update([
                'status'        => 'error',
                'error_message' => $e->getMessage(),
            ]);

            throw $e; // let Laravel retry / mark as failed
        }
    }
}
