<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0');

        // Compagnies
        Schema::create('companies', function ($table) {
            $table->id();
            $table->string('name');
            $table->string('slug', 50)->unique();
            $table->string('registration_number', 50)->nullable();
            $table->string('phone', 50)->nullable();
            $table->string('email', 100)->nullable();
            $table->string('address')->nullable();
            $table->string('logo_url')->nullable();
            $table->string('primary_color', 7)->default('#1e40af');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Gares / Stations
        Schema::create('stations', function ($table) {
            $table->id();
            $table->string('name');
            $table->string('city');
            $table->string('address')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->string('phone', 50)->nullable();
            $table->string('type', 20)->default('bus_stop'); // bus_stop, terminal, agency
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Routes entre gares
        Schema::create('station_routes', function ($table) {
            $table->id();
            $table->unsignedBigInteger('departure_station_id');
            $table->unsignedBigInteger('arrival_station_id');
            $table->unsignedBigInteger('company_id')->nullable();
            $table->string('route_name', 255);
            $table->decimal('base_price', 10, 2)->default(0);
            $table->integer('estimated_minutes')->nullable();
            $table->integer('distance_km')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['departure_station_id', 'arrival_station_id']);
        });

        // Ajouter company_id aux tables existantes
        $addCompanyId = function ($tableName, $nullable = true) {
            if (!Schema::hasColumn($tableName, 'company_id')) {
                Schema::table($tableName, function ($t) use ($nullable) {
                    $col = $t->unsignedBigInteger('company_id');
                    if ($nullable) $col->nullable();
                    $t->index('company_id');
                });
            }
        };

        $addStationId = function ($tableName) {
            if (!Schema::hasColumn($tableName, 'departure_station_id') && !Schema::hasColumn($tableName, 'station_id')) {
                Schema::table($tableName, function ($t) {
                    $t->unsignedBigInteger('departure_station_id')->nullable();
                    $t->unsignedBigInteger('arrival_station_id')->nullable();
                    $t->index('departure_station_id');
                    $t->index('arrival_station_id');
                });
            }
        };

        $addCompanyId('users');
        $addCompanyId('vehicles');
        $addCompanyId('trips');
        $addCompanyId('bookings');
        $addCompanyId('payments');
        $addStationId('trips');

        DB::statement('SET FOREIGN_KEY_CHECKS=1');
    }

    public function down(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0');

        $dropCol = function ($tableName, $col) {
            if (Schema::hasColumn($tableName, $col)) {
                Schema::table($tableName, function ($t) use ($col) {
                    $t->dropColumn($col);
                });
            }
        };

        $dropCol('users', 'company_id');
        $dropCol('vehicles', 'company_id');
        $dropCol('trips', 'company_id');
        $dropCol('trips', 'departure_station_id');
        $dropCol('trips', 'arrival_station_id');
        $dropCol('bookings', 'company_id');
        $dropCol('payments', 'company_id');

        Schema::dropIfExists('station_routes');
        Schema::dropIfExists('stations');
        Schema::dropIfExists('companies');

        DB::statement('SET FOREIGN_KEY_CHECKS=1');
    }
};
