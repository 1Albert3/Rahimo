<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            if (!Schema::hasColumn('courses', 'video_url')) {
                $table->string('video_url')->nullable()->after('image_url');
            }
            if (!Schema::hasColumn('courses', 'document_url')) {
                $table->string('document_url')->nullable()->after('video_url');
            }
            if (!Schema::hasColumn('courses', 'published')) {
                $table->boolean('published')->default(true)->after('obligatoire');
            }
        });

        DB::statement('SET FOREIGN_KEY_CHECKS=0');

        Schema::create('certificates', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('course_id');
            $table->string('certificate_number', 50)->unique();
            $table->integer('score')->default(0);
            $table->timestamp('issued_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->string('pdf_path')->nullable();
            $table->timestamps();

            $table->index('user_id');
            $table->index('course_id');
            $table->unique(['user_id', 'course_id']);
        });

        DB::statement('ALTER TABLE certificates ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci');
        DB::statement('ALTER TABLE certificates ADD CONSTRAINT certificates_user_id_foreign FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE');
        DB::statement('ALTER TABLE certificates ADD CONSTRAINT certificates_course_id_foreign FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE');

        DB::statement('SET FOREIGN_KEY_CHECKS=1');
    }

    public function down(): void
    {
        Schema::dropIfExists('certificates');
        Schema::table('courses', function (Blueprint $table) {
            $table->dropColumn(['video_url', 'document_url', 'published']);
        });
    }
};
