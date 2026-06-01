<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0');

        Schema::create('reclamations', function ($table) {
            $table->id();
            $table->string('code', 30)->unique();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('client_name');
            $table->string('client_phone', 20);
            $table->string('type', 50);
            $table->text('description');
            $table->string('priorite', 20)->default('moyenne');
            $table->string('statut', 20)->default('en_attente');
            $table->unsignedBigInteger('treated_by')->nullable();
            $table->text('response')->nullable();
            $table->timestamp('treated_at')->nullable();
            $table->timestamps();
            $table->index('code');
            $table->index('statut');
            $table->index('priorite');
        });

        Schema::create('activity_logs', function ($table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('action', 100);
            $table->string('description')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->string('entity_type', 50)->nullable();
            $table->unsignedBigInteger('entity_id')->nullable();
            $table->timestamps();
            $table->index(['user_id', 'action']);
            $table->index('created_at');
        });

        DB::statement('SET FOREIGN_KEY_CHECKS=1');
    }

    public function down(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0');
        Schema::dropIfExists('activity_logs');
        Schema::dropIfExists('reclamations');
        DB::statement('SET FOREIGN_KEY_CHECKS=1');
    }
};
