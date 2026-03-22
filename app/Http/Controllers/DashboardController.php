<?php

namespace App\Http\Controllers;

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

        return Inertia::render('Dashboard', [
            'categories' => $categories,
        ]);
    }
}
