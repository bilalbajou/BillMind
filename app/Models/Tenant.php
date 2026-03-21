<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Tenant extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_name',
        'slug',
        'email',
        'phone',
        'website',
        'address',
        'city',
        'postal_code',
        'country',
        'industry',
        'tax_id',
        'currency',
        'logo',
        'plan',
        'trial_ends_at',
        'is_active',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'trial_ends_at' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get the users associated with the tenant.
     */
    public function users()
    {
        return $this->hasMany(User::class);
    }
}
