<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $customers = Customer::withCount('invoices')
            ->withSum('invoices as total_spend', 'total_ttc')
            ->withMax('invoices as latest_invoice', 'issue_date')
            ->orderBy('name')
            ->paginate(15);

        return Inertia::render('Customers/Index', [
            'customers' => $customers
        ]);
    }
}
