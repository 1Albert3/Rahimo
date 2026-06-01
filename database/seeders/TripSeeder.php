<?php

namespace Database\Seeders;

use App\Models\Trip;
use App\Models\User;
use App\Models\Vehicle;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class TripSeeder extends Seeder
{
    public function run(): void
    {
        $routes = [
            ['Ouagadougou', 'Bobo-Dioulasso', 350, 5000],
            ['Bobo-Dioulasso', 'Ouagadougou', 350, 5000],
            ['Ouagadougou', 'Ouahigouya', 185, 3000],
            ['Ouahigouya', 'Ouagadougou', 185, 3000],
            ['Ouagadougou', 'Koudougou', 100, 2000],
            ['Koudougou', 'Ouagadougou', 100, 2000],
            ['Ouagadougou', 'Banfora', 440, 6000],
            ['Banfora', 'Ouagadougou', 440, 6000],
            ['Bobo-Dioulasso', 'Banfora', 85, 1500],
            ['Banfora', 'Bobo-Dioulasso', 85, 1500],
            ['Ouagadougou', 'Dédougou', 230, 3500],
            ['Dédougou', 'Ouagadougou', 230, 3500],
        ];

        $vehicles = Vehicle::where('status', 'active')->get();
        $drivers = User::chauffeurs()->get();

        if ($vehicles->isEmpty() || $drivers->isEmpty()) {
            return;
        }

        $today = Carbon::today();

        for ($day = 0; $day < 7; $day++) {
            $date = $today->copy()->addDays($day);

            foreach ($routes as $index => [$departure, $arrival, $durationMinutes, $price]) {
                $vehicle = $vehicles->random();
                $driver = $drivers->random();

                $hours = rand(5, 20);
                $departureTime = $date->copy()->setHour($hours)->setMinute(rand(0, 3) * 15);
                $arrivalTime = $departureTime->copy()->addMinutes($durationMinutes + rand(-20, 20));

                Trip::create([
                    'trip_number' => 'TRIP-' . $date->format('Ymd') . '-' . str_pad($index + 1, 2, '0', STR_PAD_LEFT) . '-' . chr(65 + $day),
                    'vehicle_id' => $vehicle->id,
                    'driver_id' => $driver->id,
                    'departure_city' => $departure,
                    'arrival_city' => $arrival,
                    'departure_time' => $departureTime,
                    'arrival_time' => $arrivalTime,
                    'price' => $price,
                    'available_seats' => $vehicle->capacity,
                    'status' => $date->isToday() && $departureTime->isPast() ? 'in_progress' : 'scheduled',
                    'departure_date' => $date,
                ]);
            }
        }
    }
}
