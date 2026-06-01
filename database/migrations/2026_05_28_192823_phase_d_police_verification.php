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

        Schema::create('watchlist_entries', function (Blueprint $table) {
            $table->id();
            $table->string('full_name');
            $table->string('phone', 50)->nullable();
            $table->string('id_card_number', 50)->nullable();
            $table->string('reason', 255);
            $table->enum('status', ['active', 'cleared'])->default('active');
            $table->unsignedBigInteger('added_by')->nullable();
            $table->timestamps();
            $table->index(['full_name', 'phone', 'id_card_number']);
        });

        Schema::create('police_check_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->unsignedBigInteger('booking_id')->nullable();
            $table->unsignedBigInteger('trip_id')->nullable();
            $table->string('full_name');
            $table->string('phone', 50)->nullable();
            $table->string('id_card_number', 50)->nullable();
            $table->enum('match_status', ['no_match', 'possible_match', 'confirmed_match'])->default('no_match');
            $table->string('check_type', 50)->default('silent');
            $table->unsignedBigInteger('performed_by')->nullable(); // agent/police user
            $table->timestamps();

            $table->index(['full_name', 'phone']);
            $table->index('match_status');
        });

        DB::statement('ALTER TABLE watchlist_entries ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci');
        DB::statement('ALTER TABLE police_check_logs ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci');

        DB::statement('SET FOREIGN_KEY_CHECKS=1');
    }

    public function down(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0');
        Schema::dropIfExists('police_check_logs');
        Schema::dropIfExists('watchlist_entries');
        DB::statement('SET FOREIGN_KEY_CHECKS=1');
    }
};
