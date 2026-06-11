<?php

namespace Database\Factories;

use App\Models\Reclamation;
use Illuminate\Database\Eloquent\Factories\Factory;

class ReclamationFactory extends Factory
{
    protected $model = Reclamation::class;

    public function definition(): array
    {
        return [
            'code' => 'REC-' . date('Y') . '-' . str_pad((string) fake()->unique()->randomNumber(4), 4, '0', STR_PAD_LEFT),
            'user_id' => null,
            'client_name' => fake()->name(),
            'client_phone' => fake()->phoneNumber(),
            'type' => fake()->randomElement(['Retard', 'Colis Endommagé', 'Remboursement', 'Service', 'Colis Perdu']),
            'description' => fake()->sentence(),
            'priorite' => fake()->randomElement(['haute', 'moyenne', 'basse']),
            'statut' => fake()->randomElement(['en_attente', 'en_cours', 'resolue', 'fermee']),
        ];
    }
}
