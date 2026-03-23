<?php

namespace App\Http\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;

class CompanyUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'company_name' => ['required', 'string', 'max:255'],
            'email'        => ['nullable', 'email', 'max:255'],
            'phone'        => ['nullable', 'string', 'max:50'],
            'website'      => ['nullable', 'url', 'max:255'],
            'address'      => ['nullable', 'string', 'max:255'],
            'city'         => ['nullable', 'string', 'max:100'],
            'postal_code'  => ['nullable', 'string', 'max:20'],
            'country'      => ['nullable', 'string', 'max:100'],
            'industry'     => ['nullable', 'string', 'max:100'],
            'tax_id'       => ['nullable', 'string', 'max:100'],
            'currency'     => ['nullable', 'string', 'size:3'],
        ];
    }
}
