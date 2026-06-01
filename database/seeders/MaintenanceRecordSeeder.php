<?php

namespace Database\Seeders;

use App\Models\MaintenanceRecord;
use App\Models\Vehicle;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class MaintenanceRecordSeeder extends Seeder
{
    private array $descriptions = [
        'Vidange moteur et remplacement filtre à huile',
        'Révision des freins avant et arrière',
        'Remplacement des pneus usés',
        'Contrôle et recharge climatisation',
        'Réparation embrayage',
        'Remplacement batterie',
        'Alignement et équilibrage des roues',
        'Vidange boîte de vitesses',
        'Remplacement courroie de distribution',
        'Inspection générale de sécurité',
    ];

    private array $technicians = [
        'Mamadou Diallo', 'Seydou Traoré', 'Aminata Ouédraogo', 'Issa Bâ', 'Fatoumata Kone',
    ];

    public function run(): void
    {
        $vehicles = Vehicle::all();

        foreach ($vehicles as $vehicle) {
            $recordCount = rand(1, 3);
            $types = ['routine', 'routine', 'repair', 'inspection', 'repair'];

            for ($i = 0; $i < $recordCount; $i++) {
                $date = Carbon::now()->subMonths(rand(1, 6));
                $type = $types[array_rand($types)];

                MaintenanceRecord::create([
                    'vehicle_id' => $vehicle->id,
                    'maintenance_type' => $type,
                    'description' => $this->descriptions[array_rand($this->descriptions)],
                    'cost' => rand(25000, 350000),
                    'maintenance_date' => $date,
                    'next_maintenance_date' => $date->copy()->addMonths(3),
                    'performed_by' => $this->technicians[array_rand($this->technicians)],
                    'status' => 'completed',
                    'mileage_at_maintenance' => max(0, $vehicle->mileage - rand(1000, 10000)),
                ]);
            }
        }
    }
}
