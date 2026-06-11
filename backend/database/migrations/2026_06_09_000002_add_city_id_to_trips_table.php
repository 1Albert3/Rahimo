<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $addColumn = function (string $table, string $column, string $after) {
            if (!Schema::hasColumn($table, $column)) {
                Schema::table($table, function (Blueprint $t) use ($column, $after) {
                    $t->unsignedBigInteger($column)->nullable()->after($after);
                });
            }
        };

        $addColumn('trips', 'departure_city_id', 'arrival_city');
        $addColumn('trips', 'arrival_city_id', 'departure_city_id');
        $addColumn('colis', 'departure_city_id', 'arrival_city');
        $addColumn('colis', 'arrival_city_id', 'departure_city_id');
        $addColumn('stations', 'city_id', 'city');
        $addColumn('moto_transports', 'origin_city_id', 'destination_city');
        $addColumn('moto_transports', 'destination_city_id', 'origin_city_id');
    }

    public function down(): void
    {
        Schema::table('trips', function (Blueprint $t) {
            $t->dropColumn(['departure_city_id', 'arrival_city_id']);
        });
        Schema::table('colis', function (Blueprint $t) {
            $t->dropColumn(['departure_city_id', 'arrival_city_id']);
        });
        Schema::table('stations', function (Blueprint $t) {
            $t->dropColumn(['city_id']);
        });
        Schema::table('moto_transports', function (Blueprint $t) {
            $t->dropColumn(['origin_city_id', 'destination_city_id']);
        });
    }
};
