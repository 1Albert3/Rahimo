<?php

namespace Database\Seeders;

use App\Models\Vehicle;
use Illuminate\Database\Seeder;

class VehicleSeeder extends Seeder
{
    public function run(): void
    {
        $vehicles = [
            ['registration_number' => '11-1234-BF', 'brand' => 'Mercedes-Benz', 'model' => 'Sprinter 516', 'capacity' => 55, 'type' => 'vip', 'status' => 'active', 'year' => 2023, 'fuel_type' => 'diesel', 'mileage' => 45000],
            ['registration_number' => '12-5678-BF', 'brand' => 'Toyota', 'model' => 'Coaster XZB50', 'capacity' => 30, 'type' => 'standard', 'status' => 'active', 'year' => 2022, 'fuel_type' => 'diesel', 'mileage' => 62000],
            ['registration_number' => '13-9012-BF', 'brand' => 'Mercedes-Benz', 'model' => 'Intouro II', 'capacity' => 63, 'type' => 'vip', 'status' => 'active', 'year' => 2024, 'fuel_type' => 'diesel', 'mileage' => 12000],
            ['registration_number' => '14-3456-BF', 'brand' => 'Isuzu', 'model' => 'Journey J', 'capacity' => 45, 'type' => 'standard', 'status' => 'maintenance', 'year' => 2021, 'fuel_type' => 'diesel', 'mileage' => 89000],
            ['registration_number' => '15-7890-BF', 'brand' => 'Toyota', 'model' => 'Hiace Commuter', 'capacity' => 18, 'type' => 'standard', 'status' => 'active', 'year' => 2023, 'fuel_type' => 'diesel', 'mileage' => 28000],
            ['registration_number' => '16-2468-BF', 'brand' => 'Mercedes-Benz', 'model' => 'Tourismo', 'capacity' => 55, 'type' => 'vip', 'status' => 'active', 'year' => 2024, 'fuel_type' => 'diesel', 'mileage' => 8000],
            ['registration_number' => '17-1357-BF', 'brand' => 'King Long', 'model' => 'XMQ6119', 'capacity' => 49, 'type' => 'standard', 'status' => 'active', 'year' => 2023, 'fuel_type' => 'diesel', 'mileage' => 35000],
            ['registration_number' => '18-9753-BF', 'brand' => 'Toyota', 'model' => 'Coaster XZB50', 'capacity' => 30, 'type' => 'standard', 'status' => 'out_of_service', 'year' => 2020, 'fuel_type' => 'diesel', 'mileage' => 120000],
        ];

        foreach ($vehicles as $vehicle) {
            Vehicle::create($vehicle);
        }
    }
}
