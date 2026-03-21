<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CompanyController extends Controller
{
    public function edit(Request $request)
    {
        return Inertia::render('Settings/Company', [
            'tenant' => $request->user()->tenant,
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
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
        ]);

        $request->user()->tenant->update($validated);

        return back()->with('success', 'Company information updated.');
    }
}
