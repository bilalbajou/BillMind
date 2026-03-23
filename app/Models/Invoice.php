<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Invoice extends Model
{
    use SoftDeletes;
    protected static function booted(): void
    {
        // Global scope — automatically filter every query by the authenticated tenant.
        // Prevents cross-tenant data leaks (IDOR) even if a developer forgets to filter.
        static::addGlobalScope('tenant', function (Builder $builder) {
            if (auth()->check()) {
                $builder->where('invoices.tenant_id', auth()->user()->tenant_id);
            }
        });
    }

    protected $fillable = [
        // File
        'tenant_id', 'uploaded_by',
        'original_filename', 'stored_filename', 'file_path', 'file_hash', 'mime_type', 'file_size',
        // Identification
        'invoice_number', 'po_reference', 'invoice_date', 'due_date',
        // Supplier
        'supplier', 'supplier_address', 'supplier_ice', 'supplier_if', 'supplier_rc',
        'supplier_phone', 'supplier_email', 'supplier_rib',
        // Customer
        'customer_name', 'customer_address', 'customer_ice', 'customer_if',
        // Amounts
        'amount_ht', 'vat_rate', 'tva', 'amount_ttc', 'currency', 'discount',
        // Payment
        'payment_method', 'payment_terms', 'bank_name', 'bank_rib', 'bank_iban',
        // AI / OCR
        'category', 'category_id', 'category_corrected_id', 'category_confidence',
        'ocr_text', 'extraction_confidence',
        // Status
        'status', 'error_message',
    ];

    protected $casts = [
        'invoice_date' => 'date',
        'due_date'     => 'date',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function uploadedBy()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function category()
    {
        return $this->belongsTo(InvoiceCategory::class, 'category_id');
    }

    public function correctedCategory()
    {
        return $this->belongsTo(InvoiceCategory::class, 'category_corrected_id');
    }

    public function items()
    {
        return $this->hasMany(InvoiceItem::class)->orderBy('line_order');
    }
}
