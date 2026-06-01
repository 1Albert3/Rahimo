<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('colis', function (Blueprint $table) {
            $table->boolean('payment_on_delivery')->default(false);
            $table->json('photos')->nullable();
            $table->string('destination_address')->nullable();
            $table->json('status_history')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('colis', function (Blueprint $table) {
            $table->dropColumn(['payment_on_delivery', 'photos', 'destination_address', 'status_history']);
        });
    }
};