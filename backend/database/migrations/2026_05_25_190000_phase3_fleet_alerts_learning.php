<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0');

        Schema::create('vehicle_locations', function ($table) {
            $table->id();
            $table->unsignedBigInteger('vehicle_id');
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->float('speed')->nullable();
            $table->float('heading')->nullable();
            $table->timestamp('recorded_at')->useCurrent();
            $table->timestamps();
            $table->index('vehicle_id');
        });

        Schema::create('alerts', function ($table) {
            $table->id();
            $table->string('type', 30)->default('info');
            $table->string('categorie', 50);
            $table->string('titre');
            $table->text('description');
            $table->string('severity', 20)->default('info');
            $table->unsignedBigInteger('vehicle_id')->nullable();
            $table->unsignedBigInteger('trip_id')->nullable();
            $table->string('lieu')->nullable();
            $table->string('source', 50)->default('system');
            $table->boolean('traitee')->default(false);
            $table->timestamp('traitee_at')->nullable();
            $table->timestamps();
            $table->index(['type', 'traitee']);
        });

        Schema::create('courses', function ($table) {
            $table->id();
            $table->string('titre');
            $table->text('description')->nullable();
            $table->string('categorie', 50);
            $table->integer('duree_minutes')->default(30);
            $table->string('difficulte', 20)->default('debutant');
            $table->boolean('obligatoire')->default(true);
            $table->string('image_url')->nullable();
            $table->text('contenu')->nullable();
            $table->timestamps();
        });

        Schema::create('quizzes', function ($table) {
            $table->id();
            $table->unsignedBigInteger('course_id');
            $table->text('question');
            $table->json('options');
            $table->string('correct_answer');
            $table->integer('points')->default(10);
            $table->timestamps();
        });

        Schema::create('quiz_attempts', function ($table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('quiz_id');
            $table->string('answer');
            $table->boolean('correct')->default(false);
            $table->timestamps();
            $table->index(['user_id', 'quiz_id']);
        });

        Schema::create('course_progress', function ($table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('course_id');
            $table->boolean('completed')->default(false);
            $table->integer('score')->default(0);
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            $table->unique(['user_id', 'course_id']);
        });

        Schema::table('vehicles', function ($table) {
            $table->decimal('last_latitude', 10, 7)->nullable()->after('mileage');
            $table->decimal('last_longitude', 10, 7)->nullable()->after('last_latitude');
            $table->timestamp('last_gps_update')->nullable()->after('last_longitude');
        });

        DB::statement('SET FOREIGN_KEY_CHECKS=1');
    }

    public function down(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0');

        Schema::dropIfExists('course_progress');
        Schema::dropIfExists('quiz_attempts');
        Schema::dropIfExists('quizzes');
        Schema::dropIfExists('courses');
        Schema::dropIfExists('alerts');
        Schema::dropIfExists('vehicle_locations');

        Schema::table('vehicles', function ($table) {
            $table->dropColumn(['last_latitude', 'last_longitude', 'last_gps_update']);
        });

        DB::statement('SET FOREIGN_KEY_CHECKS=1');
    }
};
