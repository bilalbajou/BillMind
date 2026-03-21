<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    protected $fillable = [
        'tenant_id', 'uploaded_by',
        'original_filename', 'stored_filename', 'file_path', 'mime_type', 'file_size',
        'invoice_number', 'supplier', 'invoice_date',
        'amount_ht', 'tva', 'amount_ttc', 'currency',
        'category', 'category_confidence', 'category_id',
        'status', 'error_message',
    ];

    protected $casts = [
        'invoice_date' => 'date',
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
}
