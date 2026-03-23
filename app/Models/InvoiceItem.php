<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InvoiceItem extends Model
{
    protected $fillable = [
        'invoice_id',
        'line_order', 'description', 'quantity', 'unit',
        'unit_price', 'vat_rate', 'vat_amount', 'amount_ht', 'discount_percent',
    ];

    protected $casts = [
        'quantity'         => 'decimal:4',
        'unit_price'       => 'decimal:4',
        'vat_rate'         => 'decimal:2',
        'vat_amount'       => 'decimal:2',
        'amount_ht'        => 'decimal:2',
        'discount_percent' => 'decimal:2',
    ];

    public function invoice()
    {
        return $this->belongsTo(Invoice::class);
    }
}
