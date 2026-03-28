<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class InvoiceItem extends Model
{
    protected $fillable = [
        'invoice_id',
        'sort_order', 'description', 'sub_description', 'quantity', 'unit',
        'unit_price', 'vat_rate', 'vat_amount', 'amount_ht', 'amount_ttc',
        'discount_rate', 'discount_amount',
    ];

    protected $casts = [
        'quantity'        => 'decimal:4',
        'unit_price'      => 'decimal:4',
        'vat_rate'        => 'decimal:2',
        'vat_amount'      => 'decimal:2',
        'amount_ht'       => 'decimal:2',
        'amount_ttc'      => 'decimal:2',
        'discount_rate'   => 'decimal:2',
        'discount_amount' => 'decimal:2',
    ];

    protected static function booted(): void
    {
        // InvoiceItem has no tenant_id column of its own.
        // Isolation is enforced by restricting invoice_id to invoices that belong
        // to the current tenant. Invoice::select('id') already carries the tenant
        // global scope, so this becomes:
        //   WHERE invoice_items.invoice_id IN (
        //       SELECT id FROM invoices WHERE tenant_id = ? AND deleted_at IS NULL
        //   )
        // In queue/console context auth()->check() is false — no scope is applied,
        // which is intentional (jobs work with injected, already-resolved models).
        static::addGlobalScope('tenant', function (Builder $builder) {
            if (auth()->check()) {
                $builder->whereIn(
                    'invoice_items.invoice_id',
                    Invoice::select('id') // tenant scope on Invoice is applied automatically
                );
            }
        });
    }

    public function invoice()
    {
        return $this->belongsTo(Invoice::class);
    }
}
