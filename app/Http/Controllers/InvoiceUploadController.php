<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class InvoiceUploadController extends Controller
{
    public function create()
    {
        return Inertia::render('Invoices/Upload');
    }

    // Single-file endpoint — called once per file from the frontend
    public function uploadFile(Request $request)
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png,webp,tiff', 'max:10240'],
        ]);

        $file     = $request->file('file');
        $user     = $request->user();
        $tenantId = $user->tenant_id;

        $ext            = strtolower($file->getClientOriginalExtension());
        $storedFilename = $this->generateFilename($tenantId, $ext);
        $directory      = "tenants/{$tenantId}/invoices";
        $path           = $file->storeAs($directory, $storedFilename, 'local');

        $invoice = Invoice::create([
            'tenant_id'         => $tenantId,
            'uploaded_by'       => $user->id,
            'original_filename' => $file->getClientOriginalName(),
            'stored_filename'   => $storedFilename,
            'file_path'         => $path,
            'mime_type'         => $file->getMimeType(),
            'file_size'         => $file->getSize(),
            'status'            => 'pending',
        ]);

        return response()->json([
            'id'       => $invoice->getKey(),
            'original' => $file->getClientOriginalName(),
            'stored'   => $storedFilename,
            'status'   => 'pending',
        ], 201);
    }

    // Format: INV-{YYYYMMDD}-{tenantId}-{random6}.{ext}
    private function generateFilename(int $tenantId, string $ext): string
    {
        $date   = now()->format('Ymd');
        $random = Str::lower(Str::random(6));
        return "INV-{$date}-{$tenantId}-{$random}.{$ext}";
    }
}
