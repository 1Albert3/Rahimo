<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone')->nullable()->after('email');
            $table->string('city')->nullable()->after('phone');
            $table->enum('role', ['directeur_general', 'responsable_flotte', 'comptable', 'chef_garde', 'guichetiere', 'agent_police', 'bagagiste', 'chauffeur', 'client'])->default('client')->after('city');
            $table->boolean('is_active')->default(true)->after('role');
            $table->string('driver_license_number')->nullable()->after('is_active');
            $table->date('license_expiry_date')->nullable()->after('driver_license_number');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['phone', 'city', 'role', 'is_active', 'driver_license_number', 'license_expiry_date']);
        });
    }
};
