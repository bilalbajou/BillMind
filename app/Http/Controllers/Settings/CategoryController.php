<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\InvoiceCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class CategoryController extends Controller
{
    public function index()
    {
        return Inertia::render('Settings/Categories', [
            'categories' => InvoiceCategory::orderBy('sort_order')->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'        => 'required|string|max:100',
            'description' => 'nullable|string|max:500',
            'icon'        => 'nullable|string|max:50',
            'color'       => 'nullable|string|max:30',
            'is_active'   => 'boolean',
        ]);

        $slug = Str::slug($data['name']);

        // Ensure slug uniqueness
        $base = $slug;
        $i = 2;
        while (InvoiceCategory::where('slug', $slug)->exists()) {
            $slug = "{$base}-{$i}";
            $i++;
        }

        InvoiceCategory::create([
            'name'        => $data['name'],
            'slug'        => $slug,
            'description' => $data['description'] ?? null,
            'icon'        => $data['icon'] ?? null,
            'color'       => $data['color'] ?? null,
            'is_active'   => $data['is_active'] ?? true,
            'sort_order'  => (InvoiceCategory::max('sort_order') ?? 0) + 1,
        ]);

        return back()->with('success', 'Category created successfully.');
    }

    public function toggle(InvoiceCategory $category)
    {
        $category->update(['is_active' => ! $category->is_active]);

        return back()->with('success', 'Category updated.');
    }

    public function destroy(InvoiceCategory $category)
    {
        $category->delete();

        return back()->with('success', 'Category deleted.');
    }
}
