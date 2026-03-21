<?php

namespace Database\Seeders;

use App\Models\InvoiceCategory;
use Illuminate\Database\Seeder;

class InvoiceCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            // Technology
            ['name' => 'IT & Telecom',          'slug' => 'it-telecom',          'icon' => '💻', 'color' => 'indigo',  'description' => 'Software, hardware, internet, phone bills'],
            ['name' => 'Cloud & Hosting',        'slug' => 'cloud-hosting',        'icon' => '☁️',  'color' => 'sky',     'description' => 'Cloud services, servers, domain names'],
            ['name' => 'Software & Licenses',    'slug' => 'software-licenses',    'icon' => '🔑', 'color' => 'violet',  'description' => 'SaaS subscriptions, software licenses'],

            // Operations
            ['name' => 'Office Supplies',        'slug' => 'office-supplies',      'icon' => '📎', 'color' => 'amber',   'description' => 'Stationery, consumables, office materials'],
            ['name' => 'Rent & Real Estate',     'slug' => 'rent-real-estate',     'icon' => '🏢', 'color' => 'stone',   'description' => 'Office rent, coworking, real estate fees'],
            ['name' => 'Utilities',              'slug' => 'utilities',            'icon' => '⚡', 'color' => 'yellow',  'description' => 'Electricity, water, gas, internet'],
            ['name' => 'Maintenance & Repairs',  'slug' => 'maintenance-repairs',  'icon' => '🔧', 'color' => 'orange',  'description' => 'Equipment maintenance, repairs'],

            // People
            ['name' => 'Salaries & Payroll',     'slug' => 'salaries-payroll',     'icon' => '👥', 'color' => 'green',   'description' => 'Employee salaries, social charges'],
            ['name' => 'Freelance & Consulting', 'slug' => 'freelance-consulting', 'icon' => '🤝', 'color' => 'teal',    'description' => 'Freelancer invoices, consultant fees'],
            ['name' => 'Training & Education',   'slug' => 'training-education',   'icon' => '🎓', 'color' => 'cyan',    'description' => 'Employee training, courses, certifications'],

            // Travel & Transport
            ['name' => 'Travel & Accommodation', 'slug' => 'travel-accommodation', 'icon' => '✈️',  'color' => 'blue',    'description' => 'Flights, hotels, business travel'],
            ['name' => 'Transport & Fuel',       'slug' => 'transport-fuel',       'icon' => '🚗', 'color' => 'slate',   'description' => 'Fuel, vehicle maintenance, taxis, tolls'],

            // Commercial
            ['name' => 'Marketing & Advertising','slug' => 'marketing-advertising','icon' => '📢', 'color' => 'pink',    'description' => 'Ads, campaigns, social media, branding'],
            ['name' => 'Sales & Commissions',    'slug' => 'sales-commissions',    'icon' => '💰', 'color' => 'emerald', 'description' => 'Sales commissions, agent fees'],
            ['name' => 'Legal & Notary',         'slug' => 'legal-notary',         'icon' => '⚖️',  'color' => 'gray',    'description' => 'Legal fees, notary, compliance'],
            ['name' => 'Accounting & Finance',   'slug' => 'accounting-finance',   'icon' => '📊', 'color' => 'lime',    'description' => 'Accounting, audit, banking fees'],

            // Goods
            ['name' => 'Raw Materials',          'slug' => 'raw-materials',        'icon' => '🏭', 'color' => 'brown',   'description' => 'Manufacturing inputs, raw goods'],
            ['name' => 'Inventory & Stock',      'slug' => 'inventory-stock',      'icon' => '📦', 'color' => 'orange',  'description' => 'Purchased goods for resale or production'],
            ['name' => 'Equipment & Machinery',  'slug' => 'equipment-machinery',  'icon' => '⚙️',  'color' => 'zinc',    'description' => 'Capital equipment, tools, machinery'],

            // Other
            ['name' => 'Insurance',              'slug' => 'insurance',            'icon' => '🛡️',  'color' => 'red',     'description' => 'Business insurance, liability, health'],
            ['name' => 'Taxes & Duties',         'slug' => 'taxes-duties',         'icon' => '🏛️',  'color' => 'rose',    'description' => 'VAT, customs duties, local taxes'],
            ['name' => 'Miscellaneous',          'slug' => 'miscellaneous',        'icon' => '📌', 'color' => 'gray',    'description' => 'Uncategorized or one-off expenses'],
        ];

        foreach ($categories as $index => $cat) {
            InvoiceCategory::updateOrCreate(
                ['slug' => $cat['slug']],
                array_merge($cat, ['sort_order' => $index + 1, 'is_active' => true])
            );
        }
    }
}
