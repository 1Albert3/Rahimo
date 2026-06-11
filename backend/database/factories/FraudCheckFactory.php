<?php

namespace Database\Factories;

use App\Models\FraudCheck;
use App\Models\Trip;
use Illuminate\Database\Eloquent\Factories\Factory;

class FraudCheckFactory extends Factory
{
    protected $model = FraudCheck::class;

    public function definition(): array
    {
        return [
            'type' => fake()->randomElement(['duplicate_ticket', 'no_show', 'manual_check']),
            'severity' => fake()->randomElement(['low', 'medium', 'high', 'critical']),
            'status' => 'open',
            'description' => fake()->sentence(),
        ];
    }
}
