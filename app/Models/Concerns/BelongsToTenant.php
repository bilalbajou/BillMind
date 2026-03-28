<?php

namespace App\Models\Concerns;

use Illuminate\Database\Eloquent\Builder;

/**
 * Applies automatic tenant isolation to any Eloquent model that has a tenant_id column.
 *
 * What this trait does:
 *  1. Global scope  — every SELECT is silently filtered to the authenticated tenant.
 *  2. Creating hook — tenant_id is stamped on every new record from auth context,
 *                     so forgetting to set it in a controller never leaks cross-tenant.
 *
 * What this trait does NOT do:
 *  - Queue / console context: auth()->check() returns false, so no scope is applied.
 *    Jobs must receive fully-resolved models (injected via constructor) and must NOT
 *    perform raw model queries that rely on auth-based isolation.
 *  - Superadmin bypass: call ->withoutGlobalScope('tenant') explicitly when needed.
 */
trait BelongsToTenant
{
    protected static function bootBelongsToTenant(): void
    {
        // ── Global scope ──────────────────────────────────────────────────────────
        static::addGlobalScope('tenant', function (Builder $builder) {
            if (auth()->check()) {
                $table = (new static())->getTable();
                $builder->where("{$table}.tenant_id", auth()->user()->tenant_id);
            }
        });

        // ── Auto-stamp on create ──────────────────────────────────────────────────
        // Ensures tenant_id is always set from the authenticated user, even if the
        // caller forgot to set it explicitly. Does not override a value already set
        // (e.g. from a seeder or direct assignment).
        static::creating(function ($model) {
            if (auth()->check() && empty($model->tenant_id)) {
                $model->tenant_id = auth()->user()->tenant_id;
            }
        });
    }

    // ── Relationship helper ───────────────────────────────────────────────────────
    public function tenant()
    {
        return $this->belongsTo(\App\Models\Tenant::class);
    }
}
