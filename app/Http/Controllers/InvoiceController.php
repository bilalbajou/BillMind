<?php

namespace App\Http\Controllers;

use App\Jobs\ExtractInvoiceJob;
use App\Models\Invoice;
use App\Models\InvoiceCategory;
use App\Exports\InvoicesExport;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class InvoiceController extends Controller
{
    public function index(Request $request)
    {
        $query = Invoice::with(['category', 'uploadedBy'])->latest();

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('original_filename', 'like', "%{$search}%")
                    ->orWhere('number', 'like', "%{$search}%")
                    ->orWhere('supplier_name', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->input('category_id'));
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->input('date_from'));
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->input('date_to'));
        }

        $invoices = $query->paginate(15)->withQueryString();
        $categories = InvoiceCategory::orderBy('name')->get(['id', 'name', 'icon', 'color']);

        return Inertia::render('Invoices/Index', [
            'invoices' => $invoices,
            'categories' => $categories,
            'filters' => $request->only(['search', 'status', 'category_id', 'date_from', 'date_to']),
        ]);
    }

    public function destroy(int $id)
    {
        Invoice::findOrFail($id)->delete();

        return back()->with('success', 'Invoice moved to trash.');
    }

    public function extract(int $id)
    {
        $invoice = Invoice::findOrFail($id);
        $invoice->forceFill(['status' => 'processing'])->save();
        dispatch(new ExtractInvoiceJob($invoice));

        return back()->with('success', 'Extraction started.');
    }

    public function show(int $id)
    {
        $invoice = Invoice::with(['category', 'correctedCategory', 'items', 'uploadedBy'])->findOrFail($id);

        return response()->json($invoice);
    }

    public function statuses(Request $request)
    {
        $ids = array_map('intval', (array) $request->input('ids', []));

        $rows = Invoice::whereIn('id', $ids)
            ->get(['id', 'status', 'error_message'])
            ->keyBy('id');

        return response()->json($rows);
    }

    public function bulkDestroy(Request $request)
    {
        $validated = $request->validate(['ids' => ['required', 'array'], 'ids.*' => ['integer']]);

        $count = Invoice::whereIn('id', $validated['ids'])->delete();

        return back()->with('success', "{$count} invoice(s) moved to trash.");
    }

    public function anomalies()
    {
        $invoices = Invoice::with(['category'])
            ->where(function ($q) {
                $q->where('is_duplicate', true)
                  ->orWhere('amount_anomaly', true)
                  ->orWhere('vat_mismatch', true)
                  ->orWhere('date_anomaly', true)
                  ->orWhere('new_supplier', true);
            })
            ->where('status', 'processed')
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Invoices/Anomalies', [
            'invoices' => $invoices,
        ]);
    }

    public function bulkExtract(Request $request)
    {
        $validated = $request->validate(['ids' => ['required', 'array'], 'ids.*' => ['integer']]);

        /** @var \Illuminate\Database\Eloquent\Collection<int, \App\Models\Invoice> $invoices */
        $invoices = Invoice::whereIn('id', $validated['ids'])->get();
        foreach ($invoices as $invoice) {
            $invoice->forceFill(['status' => 'processing'])->save();
            dispatch(new ExtractInvoiceJob($invoice));
        }

        return back()->with('success', 'Extraction started for ' . $invoices->count() . ' invoice(s).');
    }

    public function export(Request $request)
    {
        $filename = 'invoices_' . now()->format('Y-m-d_His') . '.xlsx';

        return Excel::download(new InvoicesExport($request), $filename);
    }
}
