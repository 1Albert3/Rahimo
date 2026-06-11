<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0');

        Schema::table('vehicle_locations', function ($table) {
            $table->foreign('vehicle_id', 'fk_vl_vehicle')->references('id')->on('vehicles')->onDelete('cascade');
        });

        Schema::table('alerts', function ($table) {
            $table->foreign('vehicle_id', 'fk_alert_vehicle')->references('id')->on('vehicles')->onDelete('set null');
            $table->foreign('trip_id', 'fk_alert_trip')->references('id')->on('trips')->onDelete('set null');
        });

        Schema::table('quizzes', function ($table) {
            $table->foreign('course_id', 'fk_quiz_course')->references('id')->on('courses')->onDelete('cascade');
        });

        Schema::table('quiz_attempts', function ($table) {
            $table->foreign('user_id', 'fk_qa_user')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('quiz_id', 'fk_qa_quiz')->references('id')->on('quizzes')->onDelete('cascade');
        });

        Schema::table('course_progress', function ($table) {
            $table->foreign('user_id', 'fk_cp_user')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('course_id', 'fk_cp_course')->references('id')->on('courses')->onDelete('cascade');
        });

        DB::statement('SET FOREIGN_KEY_CHECKS=1');
    }

    public function down(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0');

        Schema::table('course_progress', function ($table) {
            $table->dropForeign('fk_cp_user');
            $table->dropForeign('fk_cp_course');
        });
        Schema::table('quiz_attempts', function ($table) {
            $table->dropForeign('fk_qa_user');
            $table->dropForeign('fk_qa_quiz');
        });
        Schema::table('quizzes', function ($table) {
            $table->dropForeign('fk_quiz_course');
        });
        Schema::table('alerts', function ($table) {
            $table->dropForeign('fk_alert_vehicle');
            $table->dropForeign('fk_alert_trip');
        });
        Schema::table('vehicle_locations', function ($table) {
            $table->dropForeign('fk_vl_vehicle');
        });

        DB::statement('SET FOREIGN_KEY_CHECKS=1');
    }
};
