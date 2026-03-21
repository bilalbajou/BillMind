<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InvoiceCategory extends Model
{
    protected $fillable = [
        'name', 'slug', 'icon', 'color', 'description', 'is_active', 'sort_order',
    ];

    public function invoices()
    {
        return $this->hasMany(Invoice::class, 'category_id');
    }
}
