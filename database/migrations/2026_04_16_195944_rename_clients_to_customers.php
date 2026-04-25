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
        Schema::rename('clients', 'customers');

        // Drop the old constraint before renaming the column
        Schema::table('invoices', function (Blueprint $table) {
            $table->dropForeign(['client_id']); // Usually named table_column_foreign
            $table->renameColumn('client_id', 'customer_id');
            $table->foreign('customer_id')->references('id')->on('customers')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->dropForeign(['customer_id']);
            $table->renameColumn('customer_id', 'client_id');
            $table->foreign('client_id')->references('id')->on('clients')->nullOnDelete();
        });

        Schema::rename('customers', 'clients');
    }
};
