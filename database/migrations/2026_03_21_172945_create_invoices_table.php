<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('uploaded_by')->constrained('users')->cascadeOnDelete();

            // File info
            $table->string('original_filename');
            $table->string('stored_filename');
            $table->string('file_path');
            $table->string('mime_type');
            $table->unsignedBigInteger('file_size');

            // AI extraction (filled after processing)
            $table->string('invoice_number')->nullable();
            $table->string('supplier')->nullable();
            $table->date('invoice_date')->nullable();
            $table->decimal('amount_ht', 12, 2)->nullable();
            $table->decimal('tva', 12, 2)->nullable();
            $table->decimal('amount_ttc', 12, 2)->nullable();
            $table->string('currency', 10)->default('MAD');
            $table->string('category')->nullable();
            $table->decimal('category_confidence', 5, 2)->nullable();

            // Status
            $table->enum('status', ['pending', 'processing', 'processed', 'error'])->default('pending');
            $table->text('error_message')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
