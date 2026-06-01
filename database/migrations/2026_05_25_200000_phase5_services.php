<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0');

        Schema::create('parkings', function ($table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('vehicle_registration', 30);
            $table->string('driver_name');
            $table->string('driver_phone', 20);
            $table->dateTime('entry_date');
            $table->dateTime('exit_date')->nullable();
            $table->decimal('amount', 10, 2)->default(0);
            $table->decimal('amount_paid', 10, 2)->default(0);
            $table->string('status', 20)->default('en_cours');
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->index('status');
        });

        Schema::create('rentals', function ($table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('type', 20)->default('voiture');
            $table->string('brand');
            $table->string('model');
            $table->string('registration_number', 30)->nullable();
            $table->dateTime('rental_start');
            $table->dateTime('rental_end')->nullable();
            $table->decimal('amount_per_day', 10, 2)->default(0);
            $table->decimal('total_amount', 10, 2)->default(0);
            $table->decimal('deposit', 10, 2)->default(0);
            $table->string('status', 20)->default('en_cours');
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->index('status');
        });

        Schema::create('accommodations', function ($table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('guest_name');
            $table->string('guest_phone', 20);
            $table->dateTime('check_in');
            $table->dateTime('check_out')->nullable();
            $table->string('room_type', 20)->default('standard');
            $table->string('room_number', 10)->nullable();
            $table->decimal('amount_per_night', 10, 2)->default(0);
            $table->decimal('total_amount', 10, 2)->default(0);
            $table->string('status', 20)->default('en_cours');
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->index('status');
        });

        Schema::create('moto_transports', function ($table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('sender_name');
            $table->string('sender_phone', 20);
            $table->string('recipient_name');
            $table->string('recipient_phone', 20);
            $table->string('origin_city');
            $table->string('destination_city');
            $table->string('moto_brand');
            $table->string('moto_model');
            $table->string('moto_registration', 30)->nullable();
            $table->decimal('amount', 10, 2)->default(0);
            $table->string('status', 20)->default('en_attente');
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->index('status');
        });

        DB::statement('SET FOREIGN_KEY_CHECKS=1');
    }

    public function down(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0');
        Schema::dropIfExists('moto_transports');
        Schema::dropIfExists('accommodations');
        Schema::dropIfExists('rentals');
        Schema::dropIfExists('parkings');
        DB::statement('SET FOREIGN_KEY_CHECKS=1');
    }
};
