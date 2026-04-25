<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Invoice extends Model
{
    use SoftDeletes, BelongsToTenant, LogsActivity;

    /**
     * Activity log configuration.
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                'number',
                'supplier_name',
                'issue_date',
                'due_date',
                'subtotal_ht',
                'vat_amount',
                'total_ttc',
                'currency',
                'status',
                'category_id',
            ])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent(fn(string $eventName) => "Invoice {$eventName}: {$this->number} ({$this->supplier_name})");
    }

    /**
     * Only OCR-extractable invoice data may be mass-assigned.
     *
     * Intentionally excluded — must be set via forceFill() or direct assignment:
     *   tenant_id          — ownership; stamped by BelongsToTenant::creating
     *   uploaded_by        — ownership; set directly in InvoiceUploadController
     *   status             — lifecycle field; controlled exclusively by ExtractInvoiceJob
     *   error_message      — lifecycle field; controlled exclusively by ExtractInvoiceJob
     *   category_corrected_id — user-override only; never set by AI output
     *   is_duplicate, amount_anomaly, date_anomaly, new_supplier — anomaly-detection
     *                         pipeline fields; not derivable from raw OCR text
     */
    protected $fillable = [
        // File metadata (upload-time only — never updated by OCR)
        'original_filename',
        'stored_filename',
        'file_path',
        'content_hash',
        'mime_type',
        'file_type',
        'file_size',
        // Extracted identification
        'number',
        'po_reference',
        'issue_date',
        'due_date',
        // Extracted supplier
        'supplier_name',
        'supplier_address',
        'supplier_ice',
        'supplier_if',
        'supplier_rc',
        'supplier_phone',
        'supplier_email',
        'supplier_rib',
        // Extracted customer
        'customer_name',
        'customer_address',
        'customer_ice',
        'customer_if',
        // Extracted amounts
        'subtotal_ht',
        'discount_rate',
        'discount_amount',
        'taxable_amount',
        'vat_rate',
        'vat_amount',
        'total_ttc',
        'currency',
        'amount_in_words',
        // Extracted payment
        'payment_method',
        'payment_terms',
        'payment_reference',
        'late_penalty',
        'bank_name',
        'bank_iban',
        // OCR / AI metadata
        'category',
        'category_id',
        'category_score',
        'ocr_text',
        'extraction_score',
    ];

    protected $casts = [
        'issue_date' => 'date',
        'due_date' => 'date',
        'is_duplicate' => 'boolean',
        'amount_anomaly' => 'boolean',
        'vat_mismatch' => 'boolean',
        'date_anomaly' => 'boolean',
        'new_supplier' => 'boolean',
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

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }
}
