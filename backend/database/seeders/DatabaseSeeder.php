<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        // Création des 9 utilisateurs par rôle
        User::factory()->directeurGeneral()->create([
            'name' => 'Directeur Général',
            'email' => 'dg@rahimo.bf',
            'phone' => '70123450',
            'city' => 'Ouagadougou',
        ]);

        User::factory()->responsableFlotte()->create([
            'name' => 'Responsable Flotte',
            'email' => 'flotte@rahimo.bf',
            'phone' => '70123451',
            'city' => 'Ouagadougou',
        ]);

        User::factory()->comptable()->create([
            'name' => 'Comptable',
            'email' => 'comptable@rahimo.bf',
            'phone' => '70123452',
            'city' => 'Ouagadougou',
        ]);

        User::factory()->chefGarde()->create([
            'name' => 'Chef de Gare',
            'email' => 'chefgarde@rahimo.bf',
            'phone' => '70123453',
            'city' => 'Ouagadougou',
        ]);

        User::factory()->guichetiere()->create([
            'name' => 'Guichetière',
            'email' => 'guichet@rahimo.bf',
            'phone' => '70123454',
            'city' => 'Ouagadougou',
        ]);

        User::factory()->agentPolice()->create([
            'name' => 'Agent Police',
            'email' => 'police@rahimo.bf',
            'phone' => '70123455',
            'city' => 'Ouagadougou',
        ]);

        User::factory()->bagagiste()->create([
            'name' => 'Bagagiste',
            'email' => 'bagagiste@rahimo.bf',
            'phone' => '70123456',
            'city' => 'Ouagadougou',
        ]);

        User::factory()->chauffeur()->create([
            'name' => 'Chauffeur',
            'email' => 'chauffeur@rahimo.bf',
            'phone' => '70123457',
            'city' => 'Ouagadougou',
        ]);

        User::factory()->create([
            'name' => 'Client Test',
            'email' => 'client@rahimo.bf',
            'phone' => '70111111',
            'role' => 'client',
            'city' => 'Bobo-Dioulasso',
        ]);

        // Chauffeurs supplémentaires
        $driverNames = [
            ['Mamadou Diallo', '70123458', 'Ouagadougou'],
            ['Seydou Traoré', '70123459', 'Bobo-Dioulasso'],
            ['Issa Bâ', '70123460', 'Ouagadougou'],
        ];

        foreach ($driverNames as [$name, $phone, $city]) {
            User::factory()->chauffeur()->create([
                'name' => $name,
                'email' => strtolower(str_replace(' ', '.', $name)).'@rahimo.bf',
                'phone' => $phone,
                'city' => $city,
            ]);
        }

        // Clients supplémentaires
        User::factory(10)->create();

        // Référentiels (à seeder en premier)
        $this->call([
            CitySeeder::class,
        ]);

        // Données métier communes
        $this->call([
            VehicleSeeder::class,
            TripSeeder::class,
            BookingSeeder::class,
            MaintenanceRecordSeeder::class,
            ColisSeeder::class,
        ]);

        // Modules Phase 3-6
        $this->call([
            Phase3Seeder::class,
            Phase4Seeder::class,
            Phase5Seeder::class,
            Phase6Seeder::class,
        ]);

        $this->call([PromotionSeeder::class]);
    }
}
