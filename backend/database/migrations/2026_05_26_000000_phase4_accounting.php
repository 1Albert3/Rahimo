<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0');

        Schema::create('expenses', function ($table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('category', 50);
            $table->string('description');
            $table->decimal('amount', 10, 2)->default(0);
            $table->string('status', 20)->default('pending');
            $table->unsignedBigInteger('validated_by')->nullable();
            $table->timestamp('validated_at')->nullable();
            $table->text('notes')->nullable();
            $table->date('expense_date');
            $table->timestamps();
            $table->index('status');
            $table->index('category');
        });

        Schema::create('cash_registers', function ($table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->timestamp('opened_at');
            $table->timestamp('closed_at')->nullable();
            $table->decimal('opening_balance', 10, 2)->default(0);
            $table->decimal('closing_balance', 10, 2)->nullable();
            $table->decimal('expected_balance', 10, 2)->nullable();
            $table->decimal('difference', 10, 2)->nullable();
            $table->string('status', 20)->default('open');
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->index('status');
            $table->index('user_id');
        });

        Schema::create('bank_reconciliations', function ($table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->string('account_name');
            $table->string('account_number', 50);
            $table->decimal('statement_balance', 10, 2)->default(0);
            $table->decimal('system_balance', 10, 2)->default(0);
            $table->decimal('difference', 10, 2)->default(0);
            $table->string('status', 20)->default('pending');
            $table->timestamp('reconciled_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->index('status');
        });

        DB::statement('SET FOREIGN_KEY_CHECKS=1');
    }

    public function down(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0');
        Schema::dropIfExists('bank_reconciliations');
        Schema::dropIfExists('cash_registers');
        Schema::dropIfExists('expenses');
        DB::statement('SET FOREIGN_KEY_CHECKS=1');
    }
};
