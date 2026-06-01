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

        Schema::create('report_exports', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->string('type', 50);
            $table->string('period', 50);
            $table->date('date_from')->nullable();
            $table->date('date_to')->nullable();
            $table->string('format', 10)->default('xlsx');
            $table->string('filename')->nullable();
            $table->string('file_path')->nullable();
            $table->string('status', 20)->default('pending');
            $table->timestamps();

            $table->index('user_id');
            $table->index('type');
            $table->index('status');
        });

        DB::statement('ALTER TABLE report_exports ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci');
        DB::statement('ALTER TABLE report_exports ADD CONSTRAINT report_exports_user_id_foreign FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE');

        DB::statement('SET FOREIGN_KEY_CHECKS=1');
    }

    public function down(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0');
        Schema::dropIfExists('report_exports');
        DB::statement('SET FOREIGN_KEY_CHECKS=1');
    }
};
