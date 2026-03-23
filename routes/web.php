<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\InvoiceUploadController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Settings\CompanyController;
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
    Route::get('/clients', function () {
        return Inertia::render('Clients/Index');
    })->name('clients.index');

    Route::get('/invoices', [InvoiceController::class, 'index'])->name('invoices.index');
    Route::delete('/invoices/{id}', [InvoiceController::class, 'destroy'])->name('invoices.destroy');
    Route::post('/invoices/{id}/extract', [InvoiceController::class, 'extract'])->name('invoices.extract');
    Route::post('/invoices/bulk-destroy', [InvoiceController::class, 'bulkDestroy'])->name('invoices.bulk-destroy');
    Route::post('/invoices/bulk-extract', [InvoiceController::class, 'bulkExtract'])->name('invoices.bulk-extract');

    Route::get('/invoices/upload', [InvoiceUploadController::class, 'create'])->name('invoices.upload');
    Route::post('/invoices/upload/file', [InvoiceUploadController::class, 'uploadFile'])
         ->middleware('throttle:20,1')
         ->name('invoices.upload.file');
    Route::get('/invoices/{id}/download', [InvoiceUploadController::class, 'download'])->name('invoices.download');


    
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('/settings/company', [CompanyController::class, 'edit'])->name('settings.company');
    Route::patch('/settings/company', [CompanyController::class, 'update'])->name('settings.company.update');
});

require __DIR__ . '/auth.php';
