<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('vehicles', function (Blueprint $table) {
            $table->string('type', 20)->default('standard')->after('capacity');
        });

        Schema::table('bookings', function (Blueprint $table) {
            $table->string('notification_channel', 20)->default('sms')->after('payment_method');
        });
    }

    public function down(): void
    {
        Schema::table('vehicles', function (Blueprint $table) {
            $table->dropColumn('type');
        });

        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn('notification_channel');
        });
    }
};
