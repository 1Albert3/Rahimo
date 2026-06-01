<?php

namespace Database\Seeders;

use App\Models\Colis;
use App\Models\Trip;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class ColisSeeder extends Seeder
{
    public function run(): void
    {
        $trips = Trip::where('status', 'scheduled')->take(10)->get();

        $colisData = [
            ['Mamadou Diallo', '70123456', 'Fatoumata Kone', '70987654', 'Ouagadougou', 'Bobo-Dioulasso', 5.5, 'Vêtements', 'colis', 'en_cours', 2500],
            ['Aminata Ouédraogo', '70234567', 'Issa Bâ', '70876543', 'Ouagadougou', 'Ouahigouya', 2.0, 'Livres scolaires', 'colis', 'en_attente', 1500],
            ['Seydou Traoré', '70345678', 'Mariam Sawadogo', '70765432', 'Bobo-Dioulasso', 'Banfora', 10.0, 'Matériel électroménager', 'marchandise', 'en_transit', 5000],
            ['Ousmane Bâ', '70456789', 'Kadiatou Diallo', '70654321', 'Ouagadougou', 'Koudougou', 15.0, 'Pièces détachées', 'marchandise', 'en_cours', 7500],
            ['Ramatou Traoré', '70567890', 'Souleymane Ouédraogo', '70543210', 'Koudougou', 'Ouagadougou', 3.5, 'Produits cosmétiques', 'fragile', 'livre', 3500],
            ['Adama Sanogo', '70678901', 'Aïssata Bâ', '70432109', 'Ouagadougou', 'Dédougou', 1.2, 'Documents administratifs', 'colis', 'en_attente', 1000],
            ['Maimouna Diallo', '70789012', 'Drissa Traoré', '70321098', 'Bobo-Dioulasso', 'Ouagadougou', 8.0, 'Matériel informatique', 'fragile', 'en_cours', 6000],
            ['Boubacar Ouédraogo', '70890123', 'Aminata Diallo', '70210987', 'Ouahigouya', 'Ouagadougou', 7.5, 'Articles divers', 'colis', 'en_transit', 3000],
            ['Kadidiatou Kone', '78901234', 'Moussa Sawadogo', '70109876', 'Banfora', 'Bobo-Dioulasso', 4.0, 'Effets personnels', 'bagage', 'livre', 2000],
            ['Ibrahim Traoré', '70012345', 'Salimata Ouédraogo', '70908765', 'Ouagadougou', 'Bobo-Dioulasso', 20.0, 'Équipement sportif', 'marchandise', 'en_attente', 10000],
        ];

        foreach ($colisData as [$expName, $expPhone, $destName, $destPhone, $dep, $arr, $weight, $desc, $type, $status, $price]) {
            $trip = $status === 'livre' ? null : $trips->random();

            Colis::create([
                'tracking_number' => 'COL' . date('Ymd') . '-' . str_pad((string) rand(1, 99999), 5, '0', STR_PAD_LEFT),
                'expediteur_name' => $expName,
                'expediteur_phone' => $expPhone,
                'destinataire_name' => $destName,
                'destinataire_phone' => $destPhone,
                'departure_city' => $dep,
                'arrival_city' => $arr,
                'weight' => $weight,
                'description' => $desc,
                'type' => $type,
                'status' => $status,
                'trip_id' => $trip?->id,
                'price' => $price,
                'expedition_date' => Carbon::now()->subDays(rand(1, 5)),
                'livraison_date' => $status === 'livre' ? Carbon::now()->subHours(rand(1, 12)) : null,
            ]);
        }
    }
}
