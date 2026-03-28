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

    // Allowed MIME types → canonical stored extension.
    // Extension is derived from validated content, never from the client-supplied filename.
    private const ALLOWED_MIME_TYPES = [
        'application/pdf' => 'pdf',
        'image/jpeg'      => 'jpg',
        'image/png'       => 'png',
        'image/webp'      => 'webp',
        'image/tiff'      => 'tiff',
    ];

    // Single-file endpoint — called once per file from the frontend
    public function uploadFile(Request $request)
    {
        $request->validate([
            // mimetypes: inspects actual file content via finfo, not just the extension.
            'file' => ['required', 'file', 'mimetypes:' . implode(',', array_keys(self::ALLOWED_MIME_TYPES)), 'max:10240'],
        ]);

        $file     = $request->file('file');
        $user     = $request->user();
        $tenantId = $user->tenant_id;

        // Derive extension from the validated MIME type — never trust the client-supplied extension.
        $mime           = $file->getMimeType();
        $ext            = self::ALLOWED_MIME_TYPES[$mime] ?? 'bin';
        $originalName   = $this->sanitizeFilename($file->getClientOriginalName());
        $storedFilename = $this->generateFilename($tenantId, $ext);
        $directory      = "tenants/{$tenantId}/invoices";
        $path           = $file->storeAs($directory, $storedFilename, 'local');

        // Ownership fields are set via direct assignment — never via mass-assignment.
        // tenant_id is also auto-stamped by BelongsToTenant::creating, but we set
        // it explicitly here as defence-in-depth documentation of intent.
        $invoice              = new Invoice([
            'original_filename' => $originalName,
            'stored_filename'   => $storedFilename,
            'file_path'         => $path,
            'mime_type'         => $mime,
            'file_type'         => $mime === 'application/pdf' ? 'pdf' : 'image',
            'file_size'         => $file->getSize(),
            'status'            => 'pending',
        ]);
        $invoice->tenant_id   = $tenantId;
        $invoice->uploaded_by = $user->id;
        $invoice->save();

        return response()->json([
            'id'       => $invoice->getKey(),
            'original' => $originalName,
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

        // RFC 6266: use filename* (UTF-8 percent-encoded) as primary, ASCII fallback via filename=.
        $safeName    = $invoice->original_filename;
        $encodedName = rawurlencode($safeName);

        return response()->file($path, [
            'Content-Type'        => $invoice->mime_type,
            'Content-Disposition' => "inline; filename=\"{$safeName}\"; filename*=UTF-8''{$encodedName}",
        ]);
    }

    // Format: INV-{YYYYMMDD}-{tenantId}-{random6}.{ext}
    private function generateFilename(int $tenantId, string $ext): string
    {
        $date   = now()->format('Ymd');
        $random = Str::lower(Str::random(6));
        return "INV-{$date}-{$tenantId}-{$random}.{$ext}";
    }

    /**
     * Strip path traversal components and characters that could be injected into
     * HTTP headers (CR, LF, NUL, double-quotes, backslashes).
     */
    private function sanitizeFilename(string $name): string
    {
        // Remove null bytes and CR/LF (header injection)
        $name = str_replace(["\0", "\r", "\n"], '', $name);
        // Normalise backslashes so basename() strips Windows-style paths too
        $name = str_replace('\\', '/', $name);
        // basename() removes any remaining directory component
        $name = basename($name);
        // Strip double-quotes and backslashes (unsafe inside Content-Disposition filename="…")
        $name = str_replace(['"', '\\'], '', $name);
        // Collapse sequences of dots to prevent extension confusion (e.g. "evil..php")
        $name = preg_replace('/\.{2,}/', '.', $name);
        $name = trim($name, ". \t");
        // Hard limit to 200 characters
        return mb_substr($name ?: 'invoice', 0, 200);
    }
}
