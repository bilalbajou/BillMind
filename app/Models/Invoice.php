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
        'original_filename', 'stored_filename', 'file_path', 'content_hash', 'mime_type', 'file_type', 'file_size',
        // Identification
        'number', 'po_reference', 'issue_date', 'due_date',
        // Supplier
        'supplier_name', 'supplier_address', 'supplier_ice', 'supplier_if', 'supplier_rc',
        'supplier_phone', 'supplier_email', 'supplier_rib',
        // Customer
        'customer_name', 'customer_address', 'customer_ice', 'customer_if',
        // Amounts
        'subtotal_ht', 'discount_rate', 'discount_amount', 'taxable_amount',
        'vat_rate', 'vat_amount', 'total_ttc', 'currency', 'amount_in_words',
        // Payment
        'payment_method', 'payment_terms', 'payment_reference', 'late_penalty',
        'bank_name', 'bank_iban',
        // AI / OCR
        'category', 'category_id', 'category_corrected_id', 'category_score',
        'ocr_text', 'extraction_score',
        // Status & anomaly flags
        'status', 'error_message',
        'is_duplicate', 'amount_anomaly', 'date_anomaly', 'new_supplier',
    ];

    protected $casts = [
        'issue_date'     => 'date',
        'due_date'       => 'date',
        'is_duplicate'   => 'boolean',
        'amount_anomaly' => 'boolean',
        'date_anomaly'   => 'boolean',
        'new_supplier'   => 'boolean',
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
        return $this->hasMany(InvoiceItem::class)->orderBy('sort_order');
    }
}
