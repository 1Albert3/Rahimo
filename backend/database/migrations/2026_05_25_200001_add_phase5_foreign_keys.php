<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0');

        Schema::table('parkings', function ($table) {
            $table->foreign('user_id')->references('id')->on('users')->nullOnDelete();
        });

        Schema::table('rentals', function ($table) {
            $table->foreign('user_id')->references('id')->on('users')->nullOnDelete();
        });

        Schema::table('accommodations', function ($table) {
            $table->foreign('user_id')->references('id')->on('users')->nullOnDelete();
        });

        Schema::table('moto_transports', function ($table) {
            $table->foreign('user_id')->references('id')->on('users')->nullOnDelete();
        });

        DB::statement('SET FOREIGN_KEY_CHECKS=1');
    }

    public function down(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0');

        Schema::table('parkings', function ($table) {
            $table->dropForeign(['user_id']);
        });

        Schema::table('rentals', function ($table) {
            $table->dropForeign(['user_id']);
        });

        Schema::table('accommodations', function ($table) {
            $table->dropForeign(['user_id']);
        });

        Schema::table('moto_transports', function ($table) {
            $table->dropForeign(['user_id']);
        });

        DB::statement('SET FOREIGN_KEY_CHECKS=1');
    }
};
