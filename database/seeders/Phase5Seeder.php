<?php

namespace Database\Seeders;

use App\Models\Accommodation;
use App\Models\MotoTransport;
use App\Models\Parking;
use App\Models\Rental;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class Phase5Seeder extends Seeder
{
    public function run(): void
    {
        $users = User::whereIn('role', ['client', 'directeur_general', 'responsable_flotte', 'comptable', 'chef_garde', 'guichetiere', 'agent_police', 'bagagiste'])->get();
        if ($users->isEmpty()) $users = User::all();

        // ── Parkings ────────────────────────────────────────────────────
        $parkingData = [
            ['12AB345', 'Mamadou Diallo', '70123456', 2000, 2000],
            ['34CD567', 'Aminata Ouédraogo', '70234567', 3500, 1500],
            ['56EF678', 'Seydou Traoré', '70345678', 1500, 1500],
            ['78GH789', 'Fatou Sawadogo', '70456789', 5000, 3000],
            ['90IJ890', 'Issa Bâ', '70567890', 2500, 2500],
        ];

        foreach ($parkingData as [$reg, $name, $phone, $amount, $paid]) {
            Parking::create([
                'user_id' => $users->random()->id,
                'vehicle_registration' => $reg,
                'driver_name' => $name,
                'driver_phone' => $phone,
                'entry_date' => Carbon::now()->subDays(rand(1, 5)),
                'exit_date' => rand(0, 1) ? Carbon::now()->subHours(rand(1, 12)) : null,
                'amount' => $amount,
                'amount_paid' => $paid,
                'status' => rand(0, 1) ? 'termine' : 'en_cours',
            ]);
        }

        // ── Locations ──────────────────────────────────────────────────
        $rentalData = [
            ['voiture', 'Toyota', 'Hilux', '12A-345-BF', 25000, 75000, 50000],
            ['voiture', 'Mercedes', 'Sprinter', '34C-567-BF', 35000, 105000, 70000],
            ['moto', 'Yamaha', 'MT-07', '56E-678-BF', 10000, 20000, 15000],
            ['voiture', 'Isuzu', 'D-Max', '78G-789-BF', 20000, 60000, 40000],
            ['moto', 'Honda', 'CB500X', '90I-890-BF', 8000, 16000, 10000],
        ];

        foreach ($rentalData as [$type, $brand, $model, $reg, $perDay, $total, $deposit]) {
            Rental::create([
                'user_id' => $users->random()->id,
                'type' => $type,
                'brand' => $brand,
                'model' => $model,
                'registration_number' => $reg,
                'rental_start' => Carbon::now()->subDays(rand(1, 10)),
                'rental_end' => rand(0, 1) ? Carbon::now()->subHours(rand(1, 24)) : null,
                'amount_per_day' => $perDay,
                'total_amount' => $total,
                'deposit' => $deposit,
                'status' => rand(0, 1) ? 'termine' : 'en_cours',
            ]);
        }

        // ── Hébergement ────────────────────────────────────────────────
        $hebergementData = [
            ['Amadou Traoré', '70123456', 'standard', '101', 15000, 30000],
            ['Mariam Ouédraogo', '70234567', 'vip', '201', 25000, 50000],
            ['Issouf Kaboré', '70345678', 'suite', '301', 40000, 80000],
            ['Fatou Sawadogo', '70456789', 'standard', '102', 15000, 15000],
            ['Seydou Diallo', '70567890', 'vip', '202', 25000, 75000],
        ];

        foreach ($hebergementData as [$name, $phone, $type, $room, $perNight, $total]) {
            Accommodation::create([
                'user_id' => $users->random()->id,
                'guest_name' => $name,
                'guest_phone' => $phone,
                'check_in' => Carbon::now()->subDays(rand(1, 5)),
                'check_out' => rand(0, 1) ? Carbon::now()->subHours(rand(1, 24)) : null,
                'room_type' => $type,
                'room_number' => $room,
                'amount_per_night' => $perNight,
                'total_amount' => $total,
                'status' => rand(0, 1) ? 'termine' : 'en_cours',
            ]);
        }

        // ── Transport motos ────────────────────────────────────────────
        $motoData = [
            ['Mamadou Diallo', '70123456', 'Fatoumata Kone', '70987654', 'Ouagadougou', 'Bobo-Dioulasso', 'Yamaha', 'MT-09', '12M-345-BF', 25000],
            ['Aminata Ouédraogo', '70234567', 'Issa Bâ', '70876543', 'Ouagadougou', 'Ouahigouya', 'Honda', 'CB500X', '34M-567-BF', 15000],
            ['Seydou Traoré', '70345678', 'Mariam Sawadogo', '70765432', 'Bobo-Dioulasso', 'Banfora', 'Bajaj', 'Pulsar', '', 10000],
            ['Ousmane Bâ', '70456789', 'Kadiatou Diallo', '70654321', 'Ouagadougou', 'Koudougou', 'SYM', 'Jet 14', '56M-678-BF', 12000],
            ['Ramatou Traoré', '70567890', 'Souleymane Ouédraogo', '70543210', 'Koudougou', 'Ouagadougou', 'TVS', 'Apache', '78M-789-BF', 8000],
        ];

        foreach ($motoData as [$sName, $sPhone, $rName, $rPhone, $dep, $arr, $brand, $model, $reg, $amount]) {
            MotoTransport::create([
                'user_id' => $users->random()->id,
                'sender_name' => $sName,
                'sender_phone' => $sPhone,
                'recipient_name' => $rName,
                'recipient_phone' => $rPhone,
                'origin_city' => $dep,
                'destination_city' => $arr,
                'moto_brand' => $brand,
                'moto_model' => $model,
                'moto_registration' => $reg ?: null,
                'amount' => $amount,
                'status' => rand(0, 1) ? 'livre' : 'en_cours',
            ]);
        }
    }
}
