<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->string('passenger_cnib', 20)->nullable()->after('passenger_email');
            $table->date('cnib_date_etablissement')->nullable()->after('passenger_cnib');
            $table->date('cnib_date_expiration')->nullable()->after('cnib_date_etablissement');
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn(['passenger_cnib', 'cnib_date_etablissement', 'cnib_date_expiration']);
        });
    }
};
