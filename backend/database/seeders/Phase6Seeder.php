<?php

namespace Database\Seeders;

use App\Models\ActivityLog;
use App\Models\Reclamation;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class Phase6Seeder extends Seeder
{
    public function run(): void
    {
        $users = User::staff()->get();
        if ($users->isEmpty()) $users = User::all();
        $agents = User::whereIn('role', ['guichetiere', 'agent_police', 'bagagiste', 'chef_garde', 'comptable', 'responsable_flotte'])->get();

        // ── Réclamations ───────────────────────────────────────────────
        $reclamationData = [
            ['Amadou Traoré', '70123456', 'Retard', 'Bus R-112 en retard de 2h sur le trajet Ouaga–Banfora sans information préalable.', 'haute', 'en_cours'],
            ['Mariam Ouédraogo', '70234567', 'Colis Endommagé', 'Colis COL-2025-00712 reçu avec des dommages visibles sur l\'emballage.', 'haute', 'en_cours'],
            ['Issouf Kaboré', '70345678', 'Remboursement', 'Demande de remboursement suite à annulation du départ du 18/05.', 'moyenne', 'en_cours'],
            ['Fatou Sawadogo', '70456789', 'Service', 'Comportement irrespectueux du chauffeur du bus R-402.', 'moyenne', 'resolue'],
            ['Seydou Diallo', '70567890', 'Colis Perdu', 'Colis COL-2025-00698 non retrouvé après 5 jours.', 'haute', 'en_attente'],
            ['Aminata Kone', '70678901', 'Ticket', 'Double facturation sur l\'achat de 3 tickets Ouaga–Bobo.', 'haute', 'en_attente'],
            ['Boubacar Ouédraogo', '70789012', 'Service', 'Climatisation en panne sur le trajet Ouaga–Dori, température excessive.', 'basse', 'en_attente'],
            ['Kadiatou Diallo', '70890123', 'Remboursement', 'Annulation de dernière minute non remboursée.', 'moyenne', 'resolue'],
        ];

        $num = 1;
        foreach ($reclamationData as [$name, $phone, $type, $desc, $priorite, $statut]) {
            $reclamation = Reclamation::create([
                'code' => 'REC-' . date('Y') . '-' . str_pad((string) $num, 4, '0', STR_PAD_LEFT),
                'user_id' => $users->random()->id,
                'client_name' => $name,
                'client_phone' => $phone,
                'type' => $type,
                'description' => $desc,
                'priorite' => $priorite,
                'statut' => $statut,
                'treated_by' => in_array($statut, ['resolue']) ? ($agents->random()?->id ?? $users->random()->id) : null,
                'response' => in_array($statut, ['resolue']) ? 'Nous avons traité votre demande. Merci de votre patience.' : null,
                'treated_at' => in_array($statut, ['resolue']) ? Carbon::now()->subDays(rand(1, 3)) : null,
            ]);
            $num++;
        }

        // ── Activity Logs ──────────────────────────────────────────────
        $actions = [
            ['connexion', 'Connexion au tableau de bord'],
            ['guichet.store', 'Vente de 2 tickets Ouaga→Bobo'],
            ['colis.store', 'Enregistrement colis COL-2026-0012'],
            ['flotte.gps.simuler', 'Simulation GPS déclenchée'],
            ['reclamations.store', 'Nouvelle réclamation enregistrée'],
            ['embarquement.verifier', 'Vérification QR code réservation BK-2026-0041'],
            ['formations.quiz', 'Soumission quiz Sécurité Routière - score 90%'],
            ['alertes.traiter', 'Alerte vitesse traitée'],
            ['connexion', 'Connexion depuis Bobo-Dioulasso'],
            ['services.parking.store', 'Nouveau stationnement enregistré'],
        ];

        foreach ($actions as [$action, $desc]) {
            ActivityLog::create([
                'user_id' => $users->random()->id,
                'action' => $action,
                'description' => $desc,
                'ip_address' => '192.168.' . rand(1, 255) . '.' . rand(1, 255),
                'user_agent' => 'Mozilla/5.0 (Linux; Android ' . rand(11, 14) . ')',
                'created_at' => Carbon::now()->subHours(rand(0, 72)),
            ]);
        }
    }
}
