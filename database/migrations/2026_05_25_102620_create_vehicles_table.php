<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vehicles', function (Blueprint $table) {
            $table->id();
            $table->string('registration_number', 20)->unique();
            $table->string('brand', 50);
            $table->string('model', 50);
            $table->integer('capacity')->default(55);
            $table->string('status', 20)->default('active');
            $table->integer('year')->nullable();
            $table->string('fuel_type', 20)->default('diesel');
            $table->date('last_maintenance_date')->nullable();
            $table->date('next_maintenance_date')->nullable();
            $table->integer('mileage')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehicles');
    }
};
