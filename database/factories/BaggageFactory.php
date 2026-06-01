<?php

namespace Database\Factories;

use App\Models\Baggage;
use App\Models\Trip;
use App\Models\Booking;
use Illuminate\Database\Eloquent\Factories\Factory;

class BaggageFactory extends Factory
{
    protected $model = Baggage::class;

    public function definition(): array
    {
        return [
            'tag_number' => Baggage::generateTag(),
            'passenger_name' => fake()->name(),
            'type' => fake()->randomElement(['suitcase', 'bag', 'box', 'sport', 'other']),
            'weight_kg' => fake()->randomFloat(1, 2, 30),
            'status' => 'registered',
        ];
    }
}
