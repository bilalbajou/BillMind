<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Invoice extends Model
{
    use SoftDeletes, BelongsToTenant;

    protected $fillable = [
        // File metadata — tenant_id and uploaded_by are excluded: never mass-assigned.
        // tenant_id is stamped automatically by BelongsToTenant::creating.
        // uploaded_by must be set via direct property assignment in the controller.
        'original_filename', 'stored_filename', 'file_path', 'content_hash',
        'mime_type', 'file_type', 'file_size',
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

    // tenant() relationship is provided by BelongsToTenant trait.

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
