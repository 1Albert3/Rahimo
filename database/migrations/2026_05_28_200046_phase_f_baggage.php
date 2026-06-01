<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0');

        Schema::create('baggage', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('booking_id')->nullable();
            $table->unsignedBigInteger('trip_id')->nullable();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('tag_number', 50)->unique();
            $table->string('passenger_name');
            $table->string('description', 500)->nullable();
            $table->enum('type', ['suitcase', 'bag', 'box', 'sport', 'other'])->default('suitcase');
            $table->decimal('weight_kg', 6, 2)->nullable();
            $table->enum('status', ['registered', 'scanned', 'loaded', 'in_transit', 'unloaded', 'delivered', 'lost'])
                ->default('registered');
            $table->string('scanned_by', 100)->nullable();
            $table->timestamp('scanned_at')->nullable();
            $table->string('loaded_by', 100)->nullable();
            $table->timestamp('loaded_at')->nullable();
            $table->string('unloaded_by', 100)->nullable();
            $table->timestamp('unloaded_at')->nullable();
            $table->string('delivered_to', 100)->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('tag_number');
            $table->index('status');
            $table->index('booking_id');
        });

        DB::statement('ALTER TABLE baggage ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci');

        DB::statement('SET FOREIGN_KEY_CHECKS=1');
    }

    public function down(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0');
        Schema::dropIfExists('baggage');
        DB::statement('SET FOREIGN_KEY_CHECKS=1');
    }
};
