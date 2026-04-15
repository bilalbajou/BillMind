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

        $dateFrom = $request->input('date_from', now()->startOfMonth()->toDateString());
        $dateTo   = $request->input('date_to',   now()->endOfMonth()->toDateString());

        $categories = InvoiceCategory::withCount(['invoices' => function ($q) use ($tenantId, $dateFrom, $dateTo) {
                $q->where('tenant_id', $tenantId)
                  ->whereBetween('issue_date', [$dateFrom, $dateTo]);
            }])
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get(['id', 'name', 'slug', 'color', 'icon']);

        $recentInvoices = Invoice::with('category')
            ->where('status', 'processed')
            ->whereBetween('issue_date', [$dateFrom, $dateTo])
            ->latest('issue_date')
            ->limit(5)
            ->get(['id', 'number', 'supplier_name', 'original_filename', 'issue_date', 'total_ttc', 'currency', 'status', 'category_id']);

        return Inertia::render('Dashboard', [
            'categories'      => $categories,
            'totalInvoices'   => Invoice::whereBetween('issue_date', [$dateFrom, $dateTo])->count(),
            'totalRevenue'    => (float) Invoice::where('status', 'processed')->whereBetween('issue_date', [$dateFrom, $dateTo])->sum('total_ttc'),
            'pendingInvoices' => Invoice::where('status', 'pending')->count(),
            'recentInvoices'  => $recentInvoices,
            'dateFrom'        => $dateFrom,
            'dateTo'          => $dateTo,
        ]);
    }
}
