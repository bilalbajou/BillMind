<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

/**
 * @property int                        $id
 * @property int                        $tenant_id
 * @property int|null                   $uploaded_by
 * @property int|null                   $supplier_id
 * @property int|null                   $customer_id
 * @property string                     $status
 * @property string|null                $error_message
 * @property string|null                $original_filename
 * @property string|null                $stored_filename
 * @property string|null                $file_path
 * @property string|null                $content_hash
 * @property string|null                $mime_type
 * @property string|null                $file_type
 * @property int|null                   $file_size
 * @property string|null                $number
 * @property string|null                $po_reference
 * @property \Carbon\Carbon|null        $issue_date
 * @property \Carbon\Carbon|null        $due_date
 * @property string|null                $supplier_name
 * @property string|null                $supplier_address
 * @property string|null                $supplier_ice
 * @property string|null                $supplier_if
 * @property string|null                $supplier_rc
 * @property string|null                $supplier_phone
 * @property string|null                $supplier_email
 * @property string|null                $supplier_rib
 * @property string|null                $customer_name
 * @property string|null                $customer_address
 * @property string|null                $customer_ice
 * @property string|null                $customer_if
 * @property float|null                 $subtotal_ht
 * @property float|null                 $discount_rate
 * @property float|null                 $discount_amount
 * @property float|null                 $taxable_amount
 * @property float|null                 $vat_rate
 * @property float|null                 $vat_amount
 * @property float|null                 $total_ttc
 * @property string                     $currency
 * @property string|null                $amount_in_words
 * @property string|null                $payment_method
 * @property string|null                $payment_terms
 * @property string|null                $payment_reference
 * @property string|null                $late_penalty
 * @property string|null                $bank_name
 * @property string|null                $bank_iban
 * @property string|null                $category
 * @property int|null                   $category_id
 * @property int|null                   $category_corrected_id
 * @property float|null                 $category_score
 * @property string|null                $ocr_text
 * @property float|null                 $extraction_score
 * @property bool                       $is_duplicate
 * @property bool                       $amount_anomaly
 * @property bool                       $vat_mismatch
 * @property bool                       $date_anomaly
 * @property bool                       $new_supplier
 * @property \Carbon\Carbon             $created_at
 * @property \Carbon\Carbon             $updated_at
 * @property \Carbon\Carbon|null        $deleted_at
 */
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
