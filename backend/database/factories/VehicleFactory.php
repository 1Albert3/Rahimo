<?php

namespace Database\Factories;

use App\Models\Vehicle;
use Illuminate\Database\Eloquent\Factories\Factory;

class VehicleFactory extends Factory
{
    protected $model = Vehicle::class;

    public function definition(): array
    {
        return [
            'registration_number' => strtoupper(fake()->bothify('??-###-??')),
            'brand' => fake()->randomElement(['Mercedes', 'Toyota', 'Isuzu', 'Scania', 'MAN']),
            'model' => fake()->bothify('Model ###'),
            'capacity' => fake()->randomElement([30, 40, 50, 60]),
            'status' => 'active',
            'year' => fake()->year(),
            'fuel_type' => fake()->randomElement(['diesel', 'essence']),
            'mileage' => fake()->numberBetween(10000, 200000),
        ];
    }
}
