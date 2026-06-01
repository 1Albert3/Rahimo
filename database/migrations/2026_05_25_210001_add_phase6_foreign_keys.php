<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0');

        Schema::table('reclamations', function ($table) {
            $table->foreign('user_id')->references('id')->on('users')->nullOnDelete();
            $table->foreign('treated_by')->references('id')->on('users')->nullOnDelete();
        });

        Schema::table('activity_logs', function ($table) {
            $table->foreign('user_id')->references('id')->on('users')->nullOnDelete();
        });

        DB::statement('SET FOREIGN_KEY_CHECKS=1');
    }

    public function down(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0');

        Schema::table('reclamations', function ($table) {
            $table->dropForeign(['user_id']);
            $table->dropForeign(['treated_by']);
        });

        Schema::table('activity_logs', function ($table) {
            $table->dropForeign(['user_id']);
        });

        DB::statement('SET FOREIGN_KEY_CHECKS=1');
    }
};
