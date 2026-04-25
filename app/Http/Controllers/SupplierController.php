<?php

namespace App\Http\Controllers;

use App\Models\Supplier;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SupplierController extends Controller
{
    public function index(Request $request)
    {
        // Tenant is automatically handled by global scope or BelongsToTenant, but to be sure we can filter or let the scope do it.
        // Actually, BelongsToTenant trait adds a global scope automatically.
        $suppliers = Supplier::withCount('invoices')
            ->withSum('invoices as total_spend', 'total_ttc')
            ->withMax('invoices as latest_invoice', 'issue_date')
            ->orderBy('name')
            ->paginate(15);

        return Inertia::render('Suppliers/Index', [
            'suppliers' => $suppliers
        ]);
    }
}
