<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            // ── Identification ─────────────────────────────────────────────
            $table->date('due_date')->nullable()->after('invoice_date');
            $table->string('po_reference')->nullable()->after('invoice_number'); // purchase order ref

            // ── Supplier details ───────────────────────────────────────────
            $table->text('supplier_address')->nullable()->after('supplier');
            $table->string('supplier_ice', 15)->nullable()->after('supplier_address');  // ICE Morocco (15 digits)
            $table->string('supplier_if')->nullable()->after('supplier_ice');            // Identifiant Fiscal
            $table->string('supplier_rc')->nullable()->after('supplier_if');             // Registre du Commerce
            $table->string('supplier_phone')->nullable()->after('supplier_rc');
            $table->string('supplier_email')->nullable()->after('supplier_phone');
            $table->string('supplier_rib')->nullable()->after('supplier_email');         // RIB / IBAN

            // ── Customer details ───────────────────────────────────────────
            $table->string('customer_name')->nullable()->after('supplier_rib');
            $table->text('customer_address')->nullable()->after('customer_name');
            $table->string('customer_ice', 15)->nullable()->after('customer_address');
            $table->string('customer_if')->nullable()->after('customer_ice');

            // ── Amounts (extend existing) ──────────────────────────────────
            $table->decimal('vat_rate', 5, 2)->nullable()->after('tva');               // global VAT rate %
            $table->decimal('discount', 12, 2)->nullable()->after('amount_ttc');

            // ── Payment ────────────────────────────────────────────────────
            $table->enum('payment_method', ['wire_transfer', 'check', 'cash', 'bill_of_exchange'])
                  ->nullable()->after('discount');
            $table->string('payment_terms')->nullable()->after('payment_method');       // immediate / 30 days / 60 days
            $table->string('bank_name')->nullable()->after('payment_terms');
            $table->string('bank_rib')->nullable()->after('bank_name');
            $table->string('bank_iban')->nullable()->after('bank_rib');

            // ── AI / OCR ───────────────────────────────────────────────────
            $table->string('file_hash', 64)->nullable()->after('file_path');            // SHA-256 duplicate detection
            $table->longText('ocr_text')->nullable()->after('error_message');
            $table->decimal('extraction_confidence', 5, 2)->nullable()->after('ocr_text');
            $table->foreignId('category_corrected_id')
                  ->nullable()
                  ->after('category_id')
                  ->constrained('invoice_categories')
                  ->nullOnDelete();
        });

        // Extend status enum to add validated + archived
        DB::statement("ALTER TABLE invoices MODIFY COLUMN status ENUM('pending','processing','processed','validated','archived','error') NOT NULL DEFAULT 'pending'");
    }

    public function down(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->dropForeign(['category_corrected_id']);
            $table->dropColumn([
                'due_date', 'po_reference',
                'supplier_address', 'supplier_ice', 'supplier_if', 'supplier_rc',
                'supplier_phone', 'supplier_email', 'supplier_rib',
                'customer_name', 'customer_address', 'customer_ice', 'customer_if',
                'vat_rate', 'discount',
                'payment_method', 'payment_terms', 'bank_name', 'bank_rib', 'bank_iban',
                'file_hash', 'ocr_text', 'extraction_confidence', 'category_corrected_id',
            ]);
        });

        DB::statement("ALTER TABLE invoices MODIFY COLUMN status ENUM('pending','processing','processed','error') NOT NULL DEFAULT 'pending'");
    }
};
