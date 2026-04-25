<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Activitylog\Models\Activity;

class AuditLogController extends Controller
{
    public function index(Request $request)
    {
        $tenantId = $request->user()->tenant_id;

        // Collect subject IDs scoped to the current tenant
        $invoiceIds = Invoice::withoutGlobalScope('tenant')
            ->where('tenant_id', $tenantId)
            ->pluck('id');

        $userIds = User::where('tenant_id', $tenantId)->pluck('id');

        $query = Activity::query()
            ->where(function ($q) use ($invoiceIds, $userIds) {
                $q->where(function ($q2) use ($invoiceIds) {
                    $q2->where('subject_type', Invoice::class)
                       ->whereIn('subject_id', $invoiceIds);
                })->orWhere(function ($q2) use ($userIds) {
                    $q2->where('subject_type', User::class)
                       ->whereIn('subject_id', $userIds);
                });
            })
            ->latest();

        if ($request->filled('user_id')) {
            $query->where('causer_type', User::class)
                  ->where('causer_id', $request->integer('user_id'));
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->input('date_from'));
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->input('date_to'));
        }

        $activities = $query
            ->with('causer')
            ->paginate(25)
            ->withQueryString();

        $users = User::where('tenant_id', $tenantId)
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        return Inertia::render('Settings/AuditLog', [
            'activities' => $activities,
            'users'      => $users,
            'filters'    => $request->only(['user_id', 'date_from', 'date_to']),
        ]);
    }
}
