<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lost_items', function (Blueprint $table) {
            $table->id();
            $table->string('type', 50); // porte-monnaie, téléphone, sac, document, autre
            $table->string('reported_by_name');
            $table->string('reported_by_phone', 20);
            $table->string('trip_info')->nullable();
            $table->text('description');
            $table->string('status', 20)->default('perdu'); // perdu, retrouve, rendu
            $table->string('photo_url')->nullable();
            $table->text('admin_notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lost_items');
    }
};