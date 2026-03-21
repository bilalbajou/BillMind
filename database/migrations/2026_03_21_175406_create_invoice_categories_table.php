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
        Schema::create('invoice_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');                  // e.g. "IT & Telecom"
            $table->string('slug')->unique();         // e.g. "it-telecom"
            $table->string('icon')->nullable();       // emoji or icon name
            $table->string('color')->nullable();      // tailwind color e.g. "indigo"
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        // Add foreign key to invoices table
        Schema::table('invoices', function (Blueprint $table) {
            $table->foreignId('category_id')
                  ->nullable()
                  ->after('category')
                  ->constrained('invoice_categories')
                  ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->dropForeign(['category_id']);
            $table->dropColumn('category_id');
        });

        Schema::dropIfExists('invoice_categories');
    }
};
