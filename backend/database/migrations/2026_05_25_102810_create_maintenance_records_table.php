<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('maintenance_records', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('vehicle_id');
            $table->string('maintenance_type', 20);
            $table->text('description');
            $table->decimal('cost', 10, 2)->default(0);
            $table->date('maintenance_date');
            $table->date('next_maintenance_date')->nullable();
            $table->string('performed_by')->nullable();
            $table->string('status', 20)->default('scheduled');
            $table->integer('mileage_at_maintenance')->nullable();
            $table->timestamps();

            $table->index('vehicle_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('maintenance_records');
    }
};
