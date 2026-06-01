<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0');

        Schema::create('speed_alerts', function ($table) {
            $table->id();
            $table->unsignedBigInteger('vehicle_id');
            $table->unsignedBigInteger('trip_id')->nullable();
            $table->unsignedBigInteger('driver_id')->nullable();
            $table->decimal('speed', 6)->default(0);
            $table->decimal('speed_limit', 6)->default(90);
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->enum('level', ['warning', 'danger'])->default('warning');
            $table->text('notification_sent')->nullable();
            $table->enum('status', ['active', 'acknowledged', 'resolved'])->default('active');
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();

            $table->foreign('vehicle_id')->references('id')->on('vehicles')->onDelete('cascade');
            $table->foreign('trip_id')->references('id')->on('trips')->onDelete('set null');
            $table->foreign('driver_id')->references('id')->on('users')->onDelete('set null');
        });

        Schema::create('speed_alert_logs', function ($table) {
            $table->id();
            $table->unsignedBigInteger('speed_alert_id');
            $table->decimal('speed', 6);
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->timestamp('recorded_at')->useCurrent();

            $table->foreign('speed_alert_id')->references('id')->on('speed_alerts')->onDelete('cascade');
        });

        DB::statement('SET FOREIGN_KEY_CHECKS=1');
    }

    public function down(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0');
        Schema::dropIfExists('speed_alert_logs');
        Schema::dropIfExists('speed_alerts');
        DB::statement('SET FOREIGN_KEY_CHECKS=1');
    }
};