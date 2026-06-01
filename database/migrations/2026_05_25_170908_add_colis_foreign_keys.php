<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS = 0');

        Schema::table('colis', function ($table) {
            $table->foreign('trip_id', 'fk_colis_trip')->references('id')->on('trips')->onDelete('set null');
            $table->foreign('user_id', 'fk_colis_user')->references('id')->on('users')->onDelete('set null');
        });

        DB::statement('SET FOREIGN_KEY_CHECKS = 1');
    }

    public function down(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS = 0');

        Schema::table('colis', function ($table) {
            $table->dropForeign('fk_colis_trip');
            $table->dropForeign('fk_colis_user');
        });

        DB::statement('SET FOREIGN_KEY_CHECKS = 1');
    }
};
