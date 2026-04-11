<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\InvoiceCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $tenantId = $request->user()->tenant_id;

        $categories = InvoiceCategory::withCount(['invoices' => function ($q) use ($tenantId) {
                $q->where('tenant_id', $tenantId);
            }])
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get(['id', 'name', 'slug', 'color', 'icon']);

        $recentInvoices = Invoice::with('category')
            ->latest()
            ->limit(5)
            ->get(['id', 'number', 'supplier_name', 'original_filename', 'issue_date', 'total_ttc', 'currency', 'status', 'category_id']);

        return Inertia::render('Dashboard', [
            'categories'     => $categories,
            'totalInvoices'  => Invoice::count(),
            'totalRevenue'   => (float) Invoice::where('status', 'processed')->sum('total_ttc'),
            'pendingInvoices' => Invoice::where('status', 'pending')->count(),
            'recentInvoices' => $recentInvoices,
        ]);
    }
}
