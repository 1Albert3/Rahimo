<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->string('booking_number')->unique()->nullable();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->unsignedBigInteger('trip_id');
            $table->string('passenger_name');
            $table->string('passenger_phone');
            $table->string('passenger_email')->nullable();
            $table->json('seat_numbers')->nullable();
            $table->integer('seats_count')->default(1);
            $table->decimal('total_price', 10, 2);
            $table->string('status', 20)->default('pending');
            $table->string('payment_status', 20)->default('pending');
            $table->string('payment_method', 30)->nullable();
            $table->dateTime('booking_date');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('user_id');
            $table->index('trip_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
