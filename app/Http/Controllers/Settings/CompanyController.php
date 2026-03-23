<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\CompanyUpdateRequest;
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

    public function update(CompanyUpdateRequest $request)
    {
        $request->user()->tenant->update($request->validated());

        return back()->with('success', 'Company information updated.');
    }
}
