<?php

namespace Database\Factories;

use App\Models\Station;
use Illuminate\Database\Eloquent\Factories\Factory;

class StationFactory extends Factory
{
    protected $model = Station::class;

    public function definition(): array
    {
        return [
            'name' => fake()->city() . ' Gare',
            'city' => fake()->city(),
            'type' => fake()->randomElement(['bus_stop', 'terminal', 'agency']),
            'is_active' => true,
        ];
    }
}
