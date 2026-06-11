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

        Schema::create('fraud_checks', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('trip_id')->nullable();
            $table->unsignedBigInteger('booking_id')->nullable();
            $table->string('type', 50);                       // duplicate_ticket, no_show, manual_check
            $table->string('severity', 20)->default('medium'); // low, medium, high, critical
            $table->string('status', 20)->default('open');     // open, investigating, resolved, false_positive
            $table->text('description')->nullable();
            $table->text('evidence')->nullable();
            $table->json('match_details')->nullable();
            $table->unsignedBigInteger('flagged_by')->nullable();
            $table->unsignedBigInteger('resolved_by')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();

            $table->index('trip_id');
            $table->index('status');
            $table->index('type');
        });

        DB::statement('ALTER TABLE fraud_checks ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci');

        DB::statement('SET FOREIGN_KEY_CHECKS=1');
    }

    public function down(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0');
        Schema::dropIfExists('fraud_checks');
        DB::statement('SET FOREIGN_KEY_CHECKS=1');
    }
};
