<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('booking_id');
            $table->string('reference_number')->unique()->nullable();
            $table->decimal('amount', 10, 2);
            $table->string('payment_method', 30);
            $table->string('transaction_id')->nullable()->unique();
            $table->string('status', 20)->default('pending');
            $table->dateTime('payment_date');
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index('booking_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
