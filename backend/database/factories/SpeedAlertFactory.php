<?php

namespace Database\Factories;

use App\Models\SpeedAlert;
use App\Models\Vehicle;
use Illuminate\Database\Eloquent\Factories\Factory;

class SpeedAlertFactory extends Factory
{
    protected $model = SpeedAlert::class;

    public function definition(): array
    {
        return [
            'vehicle_id' => Vehicle::factory(),
            'speed' => fake()->numberBetween(95, 130),
            'speed_limit' => 90,
            'latitude' => fake()->latitude(),
            'longitude' => fake()->longitude(),
            'level' => fake()->randomElement(['warning', 'danger']),
            'status' => 'active',
        ];
    }
}
