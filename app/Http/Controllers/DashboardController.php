<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Invoice;
use App\Models\InvoiceCategory;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Exchange rates between currencies.
     * Base rates to EUR (1 unit = X EUR).
     * In production, these should come from a live API or database.
     */
    const RATES_TO_EUR = [
        'MAD' => 0.092,
        'EUR' => 1.0,
        'USD' => 0.92,
        'GBP' => 1.17,
    ];

    public function index(Request $request)
    {
        $user = $request->user();
        $tenantId = $user->tenant_id;

        // Get tenant's currency
        $tenant = $user->tenant()->first();
        $tenantCurrency = $tenant->currency ?? 'MAD';

        $dateFrom = $request->input('date_from', now()->startOfMonth()->toDateString());
        $dateTo = $request->input('date_to', now()->endOfMonth()->toDateString());
        
        $isAllTime = ($dateFrom === 'all' || $dateTo === 'all');

        $categories = InvoiceCategory::withCount([
            'invoices' => function ($q) use ($tenantId, $dateFrom, $dateTo, $isAllTime) {
                $q->where('tenant_id', $tenantId)->where('status', 'processed');
                if (!$isAllTime) {
                    $q->whereBetween('issue_date', [$dateFrom, $dateTo]);
                }
            }
        ])
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get(['id', 'name', 'slug', 'color', 'icon']);

        $recentInvoicesQuery = Invoice::with('category')->where('status', 'processed');
        if (!$isAllTime) {
            $recentInvoicesQuery->whereBetween('issue_date', [$dateFrom, $dateTo]);
        }
        $recentInvoices = $recentInvoicesQuery->latest('issue_date')
            ->limit(5)
            ->get(['id', 'number', 'supplier_name', 'original_filename', 'issue_date', 'total_ttc', 'currency', 'status', 'category_id']);

        // Calculate total revenue converted to tenant's currency
        $totalRevenueConverted = $this->calculateTotalRevenue($dateFrom, $dateTo, $tenantCurrency);

        $totalInvoicesQuery = Invoice::where('status', 'processed');
        if (!$isAllTime) {
            $totalInvoicesQuery->whereBetween('issue_date', [$dateFrom, $dateTo]);
        }

        return Inertia::render('Dashboard', [
            'categories' => $categories,
            'totalInvoices' => $totalInvoicesQuery->count(),
            'totalRevenue' => (float) $totalRevenueConverted,
            'totalRevenueCurrency' => $tenantCurrency,
            'pendingInvoices' => Invoice::where('status', 'pending')->count(),
            'recentInvoices' => $recentInvoices,
            'suppliersCount' => Supplier::count(),
            'customersCount' => Customer::count(),
            'monthlyRevenue' => $this->getMonthlyRevenue($tenantCurrency, $dateFrom, $dateTo, $isAllTime),
            'topSuppliers' => $this->getTopSuppliers($tenantCurrency, $dateFrom, $dateTo, $isAllTime),
            'topCustomers' => $this->getTopCustomers($tenantCurrency, $dateFrom, $dateTo, $isAllTime),
            'anomalyFlags' => $this->getAnomalyFlags($dateFrom, $dateTo, $isAllTime),
            'dateFrom' => $dateFrom,
            'dateTo' => $dateTo,
        ]);
    }

    /**
     * Convert amount from one currency to another via EUR as pivot.
     */
    private function convert(float $amount, string $fromCurrency, string $toCurrency): float
    {
        if ($fromCurrency === $toCurrency) {
            return $amount;
        }

        $fromRate = self::RATES_TO_EUR[$fromCurrency] ?? 1.0;
        $toRate = self::RATES_TO_EUR[$toCurrency] ?? 1.0;

        // Convert: fromCurrency -> EUR -> toCurrency
        $amountInEur = $amount * $fromRate;
        return $amountInEur / $toRate;
    }

    /**
     * Calculate total revenue from processed invoices, converting all to target currency.
     */
    private function calculateTotalRevenue(string $dateFrom, string $dateTo, string $targetCurrency): float
    {
        $query = Invoice::where('status', 'processed');
        if ($dateFrom !== 'all' && $dateTo !== 'all') {
            $query->whereBetween('issue_date', [$dateFrom, $dateTo]);
        }
        $invoices = $query->get(['total_ttc', 'currency']);

        $total = 0.0;
        foreach ($invoices as $invoice) {
            $total += $this->convert((float) $invoice->total_ttc, $invoice->currency, $targetCurrency);
        }

        return round($total, 2);
    }

    private function getMonthlyRevenue(string $targetCurrency, ?string $dateFrom, ?string $dateTo, bool $isAllTime): array
    {
        $query = Invoice::where('status', 'processed');

        if (!$isAllTime) {
            $query->whereBetween('issue_date', [$dateFrom, $dateTo]);
            $start = \Carbon\Carbon::parse($dateFrom)->startOfMonth();
            $end = \Carbon\Carbon::parse($dateTo)->endOfMonth();
        } else {
            $earliest = Invoice::where('status', 'processed')->min('issue_date');
            if ($earliest) {
                $start = \Carbon\Carbon::parse($earliest)->startOfMonth();
            } else {
                $start = now()->subMonths(11)->startOfMonth();
            }
            $end = now()->endOfMonth();
        }

        $invoices = $query->get(['issue_date', 'total_ttc', 'currency']);

        // Build a zeroed-out map for all months in range
        $map = [];
        $current = $start->copy();
        while ($current <= $end) {
            $key = $current->format('Y-m');
            $map[$key] = 0.0;
            $current->addMonth();
        }

        foreach ($invoices as $invoice) {
            if (!$invoice->issue_date) continue;
            $date = $invoice->issue_date instanceof \Carbon\Carbon 
                ? $invoice->issue_date 
                : \Carbon\Carbon::parse($invoice->issue_date);
            $key = $date->format('Y-m');
            if (isset($map[$key])) {
                $map[$key] += $this->convert(
                    (float) $invoice->total_ttc,
                    $invoice->currency ?? $targetCurrency,
                    $targetCurrency
                );
            }
        }

        return array_map(fn($ym, $total) => [
            'month' => $ym,
            'label' => date('M Y', mktime(0, 0, 0, (int) substr($ym, 5, 2), 1, (int) substr($ym, 0, 4))),
            'total' => round($total, 2),
        ], array_keys($map), array_values($map));
    }

    private function getTopSuppliers(string $targetCurrency, ?string $dateFrom, ?string $dateTo, bool $isAllTime): array
    {
        $query = Invoice::where('status', 'processed')->whereNotNull('supplier_id')->with('supplier');
        if (!$isAllTime) {
            $query->whereBetween('issue_date', [$dateFrom, $dateTo]);
        }

        $invoices = $query->get(['supplier_id', 'total_ttc', 'currency']);
        $map = [];
        $names = [];

        foreach ($invoices as $invoice) {
            $key = $invoice->supplier_id;
            if (!isset($map[$key])) {
                $map[$key] = 0.0;
                $names[$key] = $invoice->supplier->name ?? 'Unknown';
            }
            $map[$key] += $this->convert((float) $invoice->total_ttc, $invoice->currency ?? $targetCurrency, $targetCurrency);
        }

        arsort($map);
        $top = array_slice($map, 0, 5, true);

        $result = [];
        foreach ($top as $id => $total) {
            $result[] = [
                'name' => $names[$id],
                'total' => round($total, 2)
            ];
        }

        return $result;
    }

    private function getTopCustomers(string $targetCurrency, ?string $dateFrom, ?string $dateTo, bool $isAllTime): array
    {
        $query = Invoice::where('status', 'processed')->whereNotNull('customer_id')->with('customer');
        if (!$isAllTime) {
            $query->whereBetween('issue_date', [$dateFrom, $dateTo]);
        }

        $invoices = $query->get(['customer_id', 'total_ttc', 'currency']);
        $map = [];
        $names = [];

        foreach ($invoices as $invoice) {
            $key = $invoice->customer_id;
            if (!isset($map[$key])) {
                $map[$key] = 0.0;
                $names[$key] = $invoice->customer->name ?? 'Unknown';
            }
            $map[$key] += $this->convert((float) $invoice->total_ttc, $invoice->currency ?? $targetCurrency, $targetCurrency);
        }

        arsort($map);
        $top = array_slice($map, 0, 5, true);

        $result = [];
        foreach ($top as $id => $total) {
            $result[] = [
                'name' => $names[$id],
                'total' => round($total, 2)
            ];
        }

        return $result;
    }



    private function getAnomalyFlags(?string $dateFrom, ?string $dateTo, bool $isAllTime): array
    {
        $query = Invoice::query();
        if (!$isAllTime) {
            $query->whereBetween('issue_date', [$dateFrom, $dateTo]);
        }

        $result = [
            ['name' => 'new_supplier', 'label' => 'New Supplier', 'count' => (clone $query)->where('new_supplier', true)->count()],
            ['name' => 'amount_anomaly', 'label' => 'Amount Anomaly', 'count' => (clone $query)->where('amount_anomaly', true)->count()],
            ['name' => 'vat_mismatch', 'label' => 'VAT Mismatch', 'count' => (clone $query)->where('vat_mismatch', true)->count()],
            ['name' => 'is_duplicate', 'label' => 'Is Duplicate', 'count' => (clone $query)->where('is_duplicate', true)->count()],
            ['name' => 'date_anomaly', 'label' => 'Date Anomaly', 'count' => (clone $query)->where('date_anomaly', true)->count()],
        ];

        // Sort descending by count
        usort($result, fn($a, $b) => $b['count'] <=> $a['count']);

        return $result;
    }
}
