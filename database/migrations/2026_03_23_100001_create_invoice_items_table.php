<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invoice_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invoice_id')->constrained()->cascadeOnDelete();

            $table->unsignedSmallInteger('line_order')->default(0);           // preserve original sequence
            $table->text('description');
            $table->decimal('quantity', 12, 4)->default(1);
            $table->enum('unit', ['piece', 'hour', 'kg', 'flat_fee', 'km', 'day', 'month', 'other'])
                  ->default('piece');
            $table->decimal('unit_price', 12, 4);                             // unit price before tax
            $table->decimal('vat_rate', 5, 2)->default(20);                   // VAT % for this line
            $table->decimal('vat_amount', 12, 2)->nullable();                 // computed VAT amount
            $table->decimal('amount_ht', 12, 2)->nullable();                  // qty × unit_price
            $table->decimal('discount_percent', 5, 2)->nullable();            // line discount %

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invoice_items');
    }
};
