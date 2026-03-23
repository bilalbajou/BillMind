<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\InvoiceCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class InvoiceController extends Controller
{
    public function index(Request $request)
    {
        $query = Invoice::with(['category', 'uploadedBy'])
            ->latest();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('original_filename', 'like', "%{$search}%")
                  ->orWhere('invoice_number', 'like', "%{$search}%")
                  ->orWhere('supplier', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $invoices   = $query->paginate(15)->withQueryString();
        $categories = InvoiceCategory::orderBy('name')->get(['id', 'name', 'icon', 'color']);

        return Inertia::render('Invoices/Index', [
            'invoices'   => $invoices,
            'categories' => $categories,
            'filters'    => $request->only(['search', 'status', 'category_id', 'date_from', 'date_to']),
        ]);
    }

    public function destroy(int $id)
    {
        // Soft delete — file stays on disk, record is flagged with deleted_at
        Invoice::findOrFail($id)->delete();

        return back()->with('success', 'Invoice moved to trash.');
    }

    public function extract(int $id)
    {
        $invoice = Invoice::findOrFail($id);
        $invoice->update(['status' => 'processing']);
        // TODO: dispatch(new ExtractInvoiceJob($invoice));

        return back()->with('success', 'Extraction started.');
    }

    public function bulkDestroy(Request $request)
    {
        $request->validate(['ids' => ['required', 'array'], 'ids.*' => ['integer']]);

        $count = Invoice::whereIn('id', $request->ids)->delete();

        return back()->with('success', "{$count} invoice(s) moved to trash.");
    }

    public function bulkExtract(Request $request)
    {
        $request->validate(['ids' => ['required', 'array'], 'ids.*' => ['integer']]);

        Invoice::whereIn('id', $request->ids)->update(['status' => 'processing']);
        // TODO: dispatch jobs for each invoice

        return back()->with('success', 'Extraction started for ' . count($request->ids) . ' invoice(s).');
    }
}
