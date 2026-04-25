<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Spatie\Activitylog\Models\Activity;

class DashboardController extends Controller
{
    public function index()
    {
        // ── Tenant stats ───────────────────────────────────────────────
        $totalTenants  = Tenant::count();
        $activeTenants = Tenant::where('is_active', true)->count();
        $trialTenants  = Tenant::where('plan', 'trial')
            ->where('trial_ends_at', '>=', now())
            ->count();

        // ── User stats ─────────────────────────────────────────────────
        $totalUsers  = User::count();
        $activeUsers = User::where('is_active', true)->count();

        // ── Invoice stats (no tenant scope — admin sees all) ───────────
        $totalInvoices     = Invoice::withoutGlobalScope('tenant')->count();
        $processedInvoices = Invoice::withoutGlobalScope('tenant')->where('status', 'processed')->count();
        $pendingInvoices   = Invoice::withoutGlobalScope('tenant')->where('status', 'pending')->count();
        $errorInvoices     = Invoice::withoutGlobalScope('tenant')->where('status', 'error')->count();

        // ── Invoices per tenant ────────────────────────────────────────
        $tenantsWithStats = Tenant::withCount([
                'users',
            ])
            ->with([
                'users:id,tenant_id,name,email,role,is_active',
            ])
            ->orderByDesc('created_at')
            ->get()
            ->map(function (Tenant $tenant) {
                $invoiceStats = Invoice::withoutGlobalScope('tenant')
                    ->where('tenant_id', $tenant->id)
                    ->selectRaw('COUNT(*) as total, SUM(CASE WHEN status = "processed" THEN 1 ELSE 0 END) as processed')
                    ->first();

                $tenant->invoice_total     = (int) ($invoiceStats->total ?? 0);
                $tenant->invoice_processed = (int) ($invoiceStats->processed ?? 0);

                return $tenant;
            });

        // ── Recent activity (last 15 entries across all tenants) ───────
        $recentActivity = Activity::with('causer')
            ->latest()
            ->limit(15)
            ->get();

        // ── Invoices by status chart data ──────────────────────────────
        $invoicesByStatus = Invoice::withoutGlobalScope('tenant')
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        // ── Signups per month (last 6 months) ──────────────────────────
        $signupsPerMonth = Tenant::selectRaw("DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as count")
            ->where('created_at', '>=', now()->subMonths(6)->startOfMonth())
            ->groupBy('month')
            ->orderBy('month')
            ->pluck('count', 'month');

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'totalTenants'      => $totalTenants,
                'activeTenants'     => $activeTenants,
                'trialTenants'      => $trialTenants,
                'totalUsers'        => $totalUsers,
                'activeUsers'       => $activeUsers,
                'totalInvoices'     => $totalInvoices,
                'processedInvoices' => $processedInvoices,
                'pendingInvoices'   => $pendingInvoices,
                'errorInvoices'     => $errorInvoices,
            ],
            'tenants'          => $tenantsWithStats,
            'recentActivity'   => $recentActivity,
            'invoicesByStatus' => $invoicesByStatus,
            'signupsPerMonth'  => $signupsPerMonth,
        ]);
    }
}
