<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ── invoices: rename columns ──────────────────────────────────────
        Schema::table('invoices', function (Blueprint $table) {
            $table->renameColumn('invoice_number',        'number');
            $table->renameColumn('invoice_date',          'issue_date');
            $table->renameColumn('supplier',              'supplier_name');
            $table->renameColumn('amount_ht',             'subtotal_ht');
            $table->renameColumn('tva',                   'vat_amount');
            $table->renameColumn('amount_ttc',            'total_ttc');
            $table->renameColumn('file_hash',             'content_hash');
            $table->renameColumn('extraction_confidence', 'extraction_score');
            $table->renameColumn('category_confidence',   'category_score');
            $table->renameColumn('discount',              'discount_rate');
        });

        // ── invoices: add new columns ─────────────────────────────────────
        Schema::table('invoices', function (Blueprint $table) {
            $table->string('file_type', 10)->nullable()->after('mime_type');

            // Amounts breakdown
            $table->decimal('discount_amount', 12, 2)->nullable()->after('discount_rate');
            $table->decimal('taxable_amount',  12, 2)->nullable()->after('discount_amount');
            $table->text('amount_in_words')->nullable()->after('total_ttc');

            // Payment extras
            $table->string('payment_reference')->nullable()->after('payment_terms');
            $table->string('late_penalty')->nullable()->after('payment_reference');

            // AI anomaly flags
            $table->boolean('is_duplicate')   ->default(false)->after('error_message');
            $table->boolean('amount_anomaly') ->default(false)->after('is_duplicate');
            $table->boolean('date_anomaly')   ->default(false)->after('amount_anomaly');
            $table->boolean('new_supplier')   ->default(false)->after('date_anomaly');

            // bank_rib is covered by bank_iban — drop it
            $table->dropColumn('bank_rib');
        });

        // Backfill file_type for existing rows
        DB::statement("UPDATE invoices SET file_type = 'pdf'   WHERE mime_type = 'application/pdf'");
        DB::statement("UPDATE invoices SET file_type = 'image' WHERE mime_type LIKE 'image/%'");

        // Update payment_method enum: safely transition 'wire_transfer' to 'bank_transfer'
        DB::statement("ALTER TABLE invoices MODIFY COLUMN payment_method
            ENUM('wire_transfer','bank_transfer','check','cash','card','bill_of_exchange','other') NULL");
        DB::statement("UPDATE invoices SET payment_method = 'bank_transfer' WHERE payment_method = 'wire_transfer'");
        DB::statement("ALTER TABLE invoices MODIFY COLUMN payment_method
            ENUM('bank_transfer','check','cash','card','bill_of_exchange','other') NULL");

        // ── invoice_items: rename columns ─────────────────────────────────
        Schema::table('invoice_items', function (Blueprint $table) {
            $table->renameColumn('line_order',      'sort_order');
            $table->renameColumn('discount_percent','discount_rate');
        });

        // ── invoice_items: add new columns ────────────────────────────────
        Schema::table('invoice_items', function (Blueprint $table) {
            $table->text('sub_description')->nullable()->after('description');
            $table->decimal('discount_amount', 12, 2)->nullable()->after('discount_rate');
            $table->decimal('amount_ttc',      12, 2)->nullable()->after('amount_ht');
        });
    }

    public function down(): void
    {
        // ── invoice_items: remove added columns ───────────────────────────
        if (Schema::hasColumn('invoice_items', 'sub_description')) {
            Schema::table('invoice_items', function (Blueprint $table) {
                $table->dropColumn(['sub_description', 'discount_amount', 'amount_ttc']);
            });
        }

        if (Schema::hasColumn('invoice_items', 'sort_order')) {
            Schema::table('invoice_items', function (Blueprint $table) {
                $table->renameColumn('sort_order',    'line_order');
                $table->renameColumn('discount_rate', 'discount_percent');
            });
        }

        // ── invoices: remove added columns ────────────────────────────────
        if (Schema::hasColumn('invoices', 'file_type')) {
            Schema::table('invoices', function (Blueprint $table) {
                $table->dropColumn([
                    'file_type', 'discount_amount', 'taxable_amount', 'amount_in_words',
                    'payment_reference', 'late_penalty',
                    'is_duplicate', 'amount_anomaly', 'date_anomaly', 'new_supplier',
                ]);
            });
        }

        if (!Schema::hasColumn('invoices', 'bank_rib')) {
            Schema::table('invoices', function (Blueprint $table) {
                $table->string('bank_rib')->nullable()->after('bank_name');
            });
        }

        DB::statement("ALTER TABLE invoices MODIFY COLUMN payment_method
            ENUM('bank_transfer','check','cash','card','bill_of_exchange','other','wire_transfer') NULL");

        DB::statement("UPDATE invoices SET payment_method = 'wire_transfer' WHERE payment_method = 'bank_transfer'");
        DB::statement("UPDATE invoices SET payment_method = NULL WHERE payment_method IN ('card', 'other')");

        DB::statement("ALTER TABLE invoices MODIFY COLUMN payment_method
            ENUM('wire_transfer','check','cash','bill_of_exchange') NULL");

        if (Schema::hasColumn('invoices', 'number')) {
            Schema::table('invoices', function (Blueprint $table) {
                $table->renameColumn('number',           'invoice_number');
                $table->renameColumn('issue_date',       'invoice_date');
                $table->renameColumn('supplier_name',    'supplier');
                $table->renameColumn('subtotal_ht',      'amount_ht');
                $table->renameColumn('vat_amount',       'tva');
                $table->renameColumn('total_ttc',        'amount_ttc');
                $table->renameColumn('content_hash',     'file_hash');
                $table->renameColumn('extraction_score', 'extraction_confidence');
                $table->renameColumn('category_score',   'category_confidence');
                $table->renameColumn('discount_rate',    'discount');
            });
        }
    }
};
