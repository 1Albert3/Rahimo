<?php

namespace Database\Factories;

use App\Models\Course;
use Illuminate\Database\Eloquent\Factories\Factory;

class CourseFactory extends Factory
{
    protected $model = Course::class;

    public function definition(): array
    {
        return [
            'titre' => fake()->sentence(3),
            'description' => fake()->paragraph(),
            'categorie' => fake()->randomElement(['securite', 'reglement', 'conduite', 'service']),
            'duree_minutes' => fake()->numberBetween(15, 120),
            'difficulte' => fake()->randomElement(['debutant', 'intermediaire', 'avance']),
            'obligatoire' => fake()->boolean(),
            'published' => true,
        ];
    }
}
