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
            ['name' => 'IT & Telecom',           'slug' => 'it-telecom',           'icon' => 'Monitor',       'color' => 'indigo',  'description' => 'Software, hardware, internet, phone bills'],
            ['name' => 'Cloud & Hosting',         'slug' => 'cloud-hosting',        'icon' => 'Cloud',         'color' => 'sky',     'description' => 'Cloud services, servers, domain names'],
            ['name' => 'Software & Licenses',     'slug' => 'software-licenses',    'icon' => 'KeyRound',      'color' => 'violet',  'description' => 'SaaS subscriptions, software licenses'],

            // Operations
            ['name' => 'Office Supplies',         'slug' => 'office-supplies',      'icon' => 'Paperclip',     'color' => 'amber',   'description' => 'Stationery, consumables, office materials'],
            ['name' => 'Rent & Real Estate',      'slug' => 'rent-real-estate',     'icon' => 'Building2',     'color' => 'stone',   'description' => 'Office rent, coworking, real estate fees'],
            ['name' => 'Utilities',               'slug' => 'utilities',            'icon' => 'Zap',           'color' => 'yellow',  'description' => 'Electricity, water, gas, internet'],
            ['name' => 'Maintenance & Repairs',   'slug' => 'maintenance-repairs',  'icon' => 'Wrench',        'color' => 'orange',  'description' => 'Equipment maintenance, repairs'],

            // People
            ['name' => 'Salaries & Payroll',      'slug' => 'salaries-payroll',     'icon' => 'Users',         'color' => 'green',   'description' => 'Employee salaries, social charges'],
            ['name' => 'Freelance & Consulting',  'slug' => 'freelance-consulting', 'icon' => 'Handshake',     'color' => 'teal',    'description' => 'Freelancer invoices, consultant fees'],
            ['name' => 'Training & Education',    'slug' => 'training-education',   'icon' => 'GraduationCap', 'color' => 'cyan',    'description' => 'Employee training, courses, certifications'],

            // Travel & Transport
            ['name' => 'Travel & Accommodation',  'slug' => 'travel-accommodation', 'icon' => 'Plane',         'color' => 'blue',    'description' => 'Flights, hotels, business travel'],
            ['name' => 'Transport & Fuel',        'slug' => 'transport-fuel',       'icon' => 'Car',           'color' => 'slate',   'description' => 'Fuel, vehicle maintenance, taxis, tolls'],

            // Commercial
            ['name' => 'Marketing & Advertising', 'slug' => 'marketing-advertising','icon' => 'Megaphone',     'color' => 'pink',    'description' => 'Ads, campaigns, social media, branding'],
            ['name' => 'Sales & Commissions',     'slug' => 'sales-commissions',    'icon' => 'TrendingUp',    'color' => 'emerald', 'description' => 'Sales commissions, agent fees'],
            ['name' => 'Legal & Notary',          'slug' => 'legal-notary',         'icon' => 'Scale',         'color' => 'gray',    'description' => 'Legal fees, notary, compliance'],
            ['name' => 'Accounting & Finance',    'slug' => 'accounting-finance',   'icon' => 'BarChart2',     'color' => 'lime',    'description' => 'Accounting, audit, banking fees'],

            // Goods
            ['name' => 'Raw Materials',           'slug' => 'raw-materials',        'icon' => 'Factory',       'color' => 'orange',  'description' => 'Manufacturing inputs, raw goods'],
            ['name' => 'Inventory & Stock',       'slug' => 'inventory-stock',      'icon' => 'Package',       'color' => 'orange',  'description' => 'Purchased goods for resale or production'],
            ['name' => 'Equipment & Machinery',   'slug' => 'equipment-machinery',  'icon' => 'Settings2',     'color' => 'zinc',    'description' => 'Capital equipment, tools, machinery'],

            // Other
            ['name' => 'Insurance',               'slug' => 'insurance',            'icon' => 'ShieldCheck',   'color' => 'red',     'description' => 'Business insurance, liability, health'],
            ['name' => 'Taxes & Duties',          'slug' => 'taxes-duties',         'icon' => 'Landmark',      'color' => 'rose',    'description' => 'VAT, customs duties, local taxes'],
            ['name' => 'Miscellaneous',           'slug' => 'miscellaneous',        'icon' => 'LayoutGrid',    'color' => 'gray',    'description' => 'Uncategorized or one-off expenses'],
        ];

        foreach ($categories as $index => $cat) {
            InvoiceCategory::updateOrCreate(
                ['slug' => $cat['slug']],
                array_merge($cat, ['sort_order' => $index + 1, 'is_active' => true])
            );
        }
    }
}
