<?php

namespace Database\Seeders;

use App\Models\Promotion;
use Illuminate\Database\Seeder;

class PromotionSeeder extends Seeder
{
    public function run(): void
    {
        $promos = [
            ['code' => 'RAHIMO10', 'label' => '-10% sur votre réservation', 'type' => 'percentage', 'value' => 10, 'min_amount' => 0, 'max_uses' => 100, 'starts_at' => now(), 'ends_at' => now()->addYear()],
            ['code' => 'WELCOME',  'label' => '-2000 FCFA bienvenue',       'type' => 'fixed',     'value' => 2000, 'min_amount' => 5000, 'max_uses' => 50, 'starts_at' => now(), 'ends_at' => now()->addYear()],
            ['code' => 'FIDELITE', 'label' => '-5% fidélité',              'type' => 'percentage', 'value' => 5, 'min_amount' => 3000, 'max_uses' => null, 'starts_at' => now(), 'ends_at' => now()->addYear()],
        ];

        foreach ($promos as $promo) {
            Promotion::create($promo);
        }
    }
}
