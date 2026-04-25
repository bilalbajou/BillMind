<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\Invoice;
use App\Models\InvoiceCategory;
use App\Models\InvoiceItem;
use App\Models\Supplier;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class DummyDataSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Ensure Tenant exists and is ID 1
        $tenant = Tenant::firstOrCreate(
            ['id' => 1],
            [
                'company_name' => 'Main Company',
                'slug' => 'main-company',
                'email' => 'contact@maincompany.com',
                'is_active' => true,
            ]
        );

        // 2. Ensure User exists
        $user = User::firstOrCreate(
            ['email' => 'admin@testcompany.com'],
            [
                'name' => 'Admin User',
                'password' => bcrypt('password'),
                'tenant_id' => $tenant->id,
                'role' => 'admin',
                'is_active' => true,
            ]
        );

        // 3. Ensure Categories exist
        $this->call(InvoiceCategorySeeder::class);

        $categories = InvoiceCategory::all();
        if ($categories->isEmpty()) {
            $categories = collect([
                InvoiceCategory::create(['name' => 'IT & Telecom', 'color' => '#3b82f6']),
                InvoiceCategory::create(['name' => 'Freelance & Consulting', 'color' => '#8b5cf6']),
                InvoiceCategory::create(['name' => 'Software & Licenses', 'color' => '#ec4899']),
                InvoiceCategory::create(['name' => 'Marketing & Advertising', 'color' => '#10b981']),
            ]);
        }

        // 4. Create Suppliers
        $suppliers = [];
        for ($i = 1; $i <= 10; $i++) {
            $suppliers[] = Supplier::firstOrCreate(
                ['tenant_id' => $tenant->id, 'email' => "contact@supplier{$i}.com"],
                [
                    'name' => "Supplier " . $i,
                    'phone' => "123456789{$i}",
                ]
            );
        }

        // 5. Create Customers
        $customers = [];
        for ($i = 1; $i <= 10; $i++) {
            $customers[] = Customer::firstOrCreate(
                ['tenant_id' => $tenant->id, 'email' => "contact@customer{$i}.com"],
                [
                    'name' => "Customer " . $i,
                    'phone' => "987654321{$i}",
                ]
            );
        }

        // 6. Create Invoices
        $statuses = ['pending', 'processing', 'processed', 'validated', 'archived', 'error'];
        
        for ($i = 1; $i <= 50; $i++) {
            // Distribute dates across the last 12 months
            $date = Carbon::now()->subDays(rand(1, 365));
            $supplier = $suppliers[array_rand($suppliers)];
            $customer = $customers[array_rand($customers)];
            $category = $categories->random();

            // Distribute anomalies to make chart interesting
            $new_supplier = rand(1, 100) <= 20; // 20%
            $amount_anomaly = rand(1, 100) <= 15; // 15%
            $vat_mismatch = rand(1, 100) <= 10; // 10%
            $is_duplicate = rand(1, 100) <= 8; // 8%
            $date_anomaly = rand(1, 100) <= 5; // 5%

            $subtotal = rand(100, 5000);
            $vat = $subtotal * 0.20;
            $total = $subtotal + $vat;

            $invoice = Invoice::create([
                'tenant_id' => $tenant->id,
                'uploaded_by' => $user->id,
                'original_filename' => 'invoice_' . $i . '.pdf',
                'stored_filename' => 'invoice_' . $i . '_' . time() . '.pdf',
                'file_path' => 'invoices/invoice_' . $i . '_' . time() . '.pdf',
                'content_hash' => md5(time() . $i),
                'mime_type' => 'application/pdf',
                'file_size' => rand(10000, 5000000),
                'number' => 'INV-' . str_pad(rand(1, 9999), 5, '0', STR_PAD_LEFT),
                'issue_date' => $date,
                'due_date' => (clone $date)->addDays(30),
                'supplier_id' => $supplier->id,
                'supplier_name' => $supplier->name,
                'customer_id' => $customer->id,
                'customer_name' => $customer->name,
                'category_id' => $category->id,
                'subtotal_ht' => $subtotal,
                'vat_amount' => $vat,
                'total_ttc' => $total,
                'currency' => 'MAD',
                'status' => $statuses[array_rand($statuses)],
                
                // Anomalies
                'new_supplier' => $new_supplier,
                'amount_anomaly' => $amount_anomaly,
                'vat_mismatch' => $vat_mismatch,
                'is_duplicate' => $is_duplicate,
                'date_anomaly' => $date_anomaly,
            ]);

            // Add items
            $itemCount = rand(1, 3);
            for ($j = 1; $j <= $itemCount; $j++) {
                $itemPrice = $subtotal / $itemCount;
                InvoiceItem::create([
                    'invoice_id' => $invoice->id,
                    'description' => "Item {$j} for " . $invoice->number,
                    'quantity' => 1,
                    'unit_price' => $itemPrice,
                    'amount_ht' => $itemPrice,
                    'vat_rate' => 20,
                    'sort_order' => $j,
                ]);
            }
        }
    }
}
