<?php

namespace Database\Factories;

use App\Models\Trip;
use App\Models\Vehicle;
use Illuminate\Database\Eloquent\Factories\Factory;

class TripFactory extends Factory
{
    protected $model = Trip::class;

    public function definition(): array
    {
        return [
            'vehicle_id' => Vehicle::factory(),
            'trip_number' => 'TRIP-' . fake()->unique()->bothify('###'),
            'departure_city' => fake()->randomElement(['Ouagadougou', 'Bobo-Dioulasso', 'Banfora', 'Dori', 'Ouahigouya']),
            'arrival_city' => fake()->randomElement(['Ouagadougou', 'Bobo-Dioulasso', 'Banfora', 'Dori', 'Ouahigouya']),
            'departure_date' => fake()->dateTimeBetween('now', '+1 month')->format('Y-m-d'),
            'departure_time' => fake()->dateTimeBetween('now', '+1 month')->format('Y-m-d H:i:s'),
            'arrival_time' => fake()->dateTimeBetween('+1 day', '+2 days')->format('Y-m-d H:i:s'),
            'price' => fake()->numberBetween(3000, 15000),
            'available_seats' => fake()->numberBetween(5, 50),
            'status' => 'active',
        ];
    }
}
