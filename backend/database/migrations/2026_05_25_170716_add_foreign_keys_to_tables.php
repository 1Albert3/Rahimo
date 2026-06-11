<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS = 0');

        Schema::table('trips', function ($table) {
            $table->foreign('vehicle_id', 'fk_trips_vehicle')->references('id')->on('vehicles')->onDelete('cascade');
            $table->foreign('driver_id', 'fk_trips_driver')->references('id')->on('users')->onDelete('set null');
        });

        Schema::table('bookings', function ($table) {
            $table->foreign('user_id', 'fk_bookings_user')->references('id')->on('users')->onDelete('set null');
            $table->foreign('trip_id', 'fk_bookings_trip')->references('id')->on('trips')->onDelete('cascade');
        });

        Schema::table('payments', function ($table) {
            $table->foreign('booking_id', 'fk_payments_booking')->references('id')->on('bookings')->onDelete('cascade');
        });

        Schema::table('maintenance_records', function ($table) {
            $table->foreign('vehicle_id', 'fk_maintenances_vehicle')->references('id')->on('vehicles')->onDelete('cascade');
        });

        DB::statement('SET FOREIGN_KEY_CHECKS = 1');
    }

    public function down(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS = 0');

        Schema::table('trips', function ($table) {
            $table->dropForeign('fk_trips_vehicle');
            $table->dropForeign('fk_trips_driver');
        });

        Schema::table('bookings', function ($table) {
            $table->dropForeign('fk_bookings_user');
            $table->dropForeign('fk_bookings_trip');
        });

        Schema::table('payments', function ($table) {
            $table->dropForeign('fk_payments_booking');
        });

        Schema::table('maintenance_records', function ($table) {
            $table->dropForeign('fk_maintenances_vehicle');
        });

        DB::statement('SET FOREIGN_KEY_CHECKS = 1');
    }
};
