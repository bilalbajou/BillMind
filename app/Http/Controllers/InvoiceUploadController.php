<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

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

    public function download(Request $request, int $id): BinaryFileResponse
    {
        // The Global Scope on Invoice automatically filters by tenant_id.
        // findOrFail() will throw 404 if the invoice belongs to another tenant.
        $invoice = Invoice::findOrFail($id);

        // Double-check: explicit tenant ownership verification (defence in depth).
        abort_if(
            $invoice->tenant_id !== $request->user()->tenant_id,
            403,
            'Access denied.'
        );

        $path = Storage::disk('local')->path($invoice->file_path);

        abort_unless(file_exists($path), 404, 'File not found.');

        return response()->file($path, [
            'Content-Type'        => $invoice->mime_type,
            'Content-Disposition' => 'inline; filename="' . $invoice->original_filename . '"',
        ]);
    }

    // Format: INV-{YYYYMMDD}-{tenantId}-{random6}.{ext}
    private function generateFilename(int $tenantId, string $ext): string
    {
        $date   = now()->format('Ymd');
        $random = Str::lower(Str::random(6));
        return "INV-{$date}-{$tenantId}-{$random}.{$ext}";
    }
}
