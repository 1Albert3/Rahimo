<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('colis', function (Blueprint $table) {
            $table->id();
            $table->string('tracking_number', 30)->unique();
            $table->string('expediteur_name');
            $table->string('expediteur_phone', 20);
            $table->string('destinataire_name');
            $table->string('destinataire_phone', 20);
            $table->string('departure_city');
            $table->string('arrival_city');
            $table->decimal('weight', 8, 2)->nullable();
            $table->text('description')->nullable();
            $table->string('type', 20)->default('colis');
            $table->string('status', 20)->default('en_attente');
            $table->unsignedBigInteger('trip_id')->nullable();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->decimal('price', 10, 2)->default(0);
            $table->text('notes')->nullable();
            $table->dateTime('expedition_date')->nullable();
            $table->dateTime('livraison_date')->nullable();
            $table->timestamps();

            $table->index('tracking_number');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('colis');
    }
};
