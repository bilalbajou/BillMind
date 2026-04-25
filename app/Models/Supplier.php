<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class Supplier extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'name',
        'address',
        'ice',
        'if',
        'rc',
        'phone',
        'email',
        'rib',
    ];

    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }
}
