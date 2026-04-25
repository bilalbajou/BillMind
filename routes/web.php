<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\InvoiceUploadController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Settings\CategoryController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Settings\AuditLogController;
use App\Http\Controllers\Settings\CompanyController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\SupplierController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', [DashboardController::class, 'index'])->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/suppliers', [SupplierController::class, 'index'])->name('suppliers.index');
    Route::get('/customers', [CustomerController::class, 'index'])->name('customers.index');

    Route::get('/invoices', [InvoiceController::class, 'index'])->name('invoices.index');
    Route::get('/invoices/export', [InvoiceController::class, 'export'])->name('invoices.export');
    Route::get('/invoices/statuses', [InvoiceController::class, 'statuses'])->name('invoices.statuses');
    Route::get('/invoices/anomalies', [InvoiceController::class, 'anomalies'])->name('invoices.anomalies');
    Route::delete('/invoices/{id}', [InvoiceController::class, 'destroy'])->name('invoices.destroy');
    Route::post('/invoices/{id}/extract', [InvoiceController::class, 'extract'])->name('invoices.extract');
    Route::post('/invoices/bulk-destroy', [InvoiceController::class, 'bulkDestroy'])->name('invoices.bulk-destroy');
    Route::post('/invoices/bulk-extract', [InvoiceController::class, 'bulkExtract'])->name('invoices.bulk-extract');

    Route::get('/invoices/upload', [InvoiceUploadController::class, 'create'])->name('invoices.upload');
    Route::post('/invoices/upload/file', [InvoiceUploadController::class, 'uploadFile'])
        ->middleware('throttle:20,1')
        ->name('invoices.upload.file');
    Route::get('/invoices/{id}/download', [InvoiceUploadController::class, 'download'])->name('invoices.download');
    Route::get('/invoices/{id}/show', [InvoiceController::class, 'show'])->name('invoices.show');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('/settings/company', [CompanyController::class, 'edit'])->name('settings.company');
    Route::patch('/settings/company', [CompanyController::class, 'update'])->name('settings.company.update');

    Route::get('/settings/categories', [CategoryController::class, 'index'])->name('settings.categories');
    Route::get('/settings/audit-log', [AuditLogController::class, 'index'])->name('settings.audit-log');

    // ── Admin routes (super admin only) ──────────────────────────────────────
    Route::middleware('admin')->prefix('admin')->name('admin.')->group(function () {
        Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');
    });
    Route::post('/settings/categories', [CategoryController::class, 'store'])->name('settings.categories.store');
    Route::patch('/settings/categories/{category}/toggle', [CategoryController::class, 'toggle'])->name('settings.categories.toggle');
    Route::delete('/settings/categories/{category}', [CategoryController::class, 'destroy'])->name('settings.categories.destroy');
});

require __DIR__ . '/auth.php';
