<?php

namespace Database\Seeders;

use App\Models\Alert;
use App\Models\Course;
use App\Models\Quiz;
use App\Models\Vehicle;
use App\Models\VehicleLocation;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class Phase3Seeder extends Seeder
{
    public function run(): void
    {
        $vehicles = Vehicle::where('status', 'active')->get();
        if ($vehicles->isEmpty()) return;

        // ── GPS locations ───────────────────────────────────────────────
        $cities = [
            'Ouagadougou' => [12.3714, -1.5197],
            'Bobo-Dioulasso' => [11.1771, -4.2979],
            'Koudougou' => [12.2526, -2.3628],
            'Banfora' => [10.6333, -4.7667],
            'Ouahigouya' => [13.5834, -2.4167],
            'Dori' => [14.0333, -0.0333],
        ];

        foreach ($vehicles as $v) {
            $cityKeys = array_keys($cities);
            $city = $cityKeys[array_rand($cityKeys)];
            [$lat, $lng] = $cities[$city];

            for ($i = 0; $i < 8; $i++) {
                VehicleLocation::create([
                    'vehicle_id' => $v->id,
                    'latitude' => $lat + (rand(-100, 100) / 1000),
                    'longitude' => $lng + (rand(-100, 100) / 1000),
                    'speed' => rand(30, 110),
                    'heading' => rand(0, 360),
                    'recorded_at' => Carbon::now()->subMinutes(rand(1, 60)),
                ]);
            }

            // Mettre à jour la dernière position connue sur le véhicule
            $last = $v->vehicleLocations()->latest()->first();
            if ($last) {
                $v->updateQuietly([
                    'last_latitude' => $last->latitude,
                    'last_longitude' => $last->longitude,
                    'last_gps_update' => $last->recorded_at,
                ]);
            }
        }

        // ── Alertes ─────────────────────────────────────────────────────
        $alertTypes = [
            ['danger', 'vitesse', 'Excès de vitesse', 'Véhicule détecté à 112 km/h sur la RN1', 'critique'],
            ['warning', 'maintenance', 'Maintenance requise', 'Véhicule a dépassé l\'échéance de révision de 500 km', 'moyenne'],
            ['info', 'itineraire', 'Déviation itinéraire', 'Détour signalé sur l\'axe Ouaga–Bobo suite à des travaux', 'basse'],
            ['danger', 'urgence', 'Urgence médicale', 'Passager nécessitant une assistance médicale à bord', 'critique'],
            ['warning', 'retard', 'Retard important', 'Véhicule accusant plus de 45 minutes de retard', 'moyenne'],
            ['info', 'info', 'Info trafic', 'Mise à jour des conditions de circulation sur l\'axe nord', 'basse'],
        ];

        $categorieMap = ['danger' => 'Sécurité', 'warning' => 'Maintenance', 'info' => 'Information'];

        foreach ($alertTypes as [$type, $cat, $titre, $desc, $severity]) {
            Alert::create([
                'type' => $type,
                'categorie' => $categorieMap[$type] ?? $cat,
                'titre' => $titre,
                'description' => $desc,
                'severity' => $severity,
                'vehicle_id' => $vehicles->random()->id,
                'trip_id' => null,
                'lieu' => collect($cities)->keys()->random(),
                'source' => 'system',
                'traitee' => in_array($type, ['info']),
                'traitee_at' => in_array($type, ['info']) ? Carbon::now()->subHours(rand(1, 12)) : null,
            ]);
        }

        // ── Cours + Quiz e-learning ────────────────────────────────────
        $courses = [
            [
                'titre' => 'Sécurité Routière',
                'description' => 'Les fondamentaux de la sécurité routière pour conducteurs de transport en commun : distances de sécurité, gestion des angles morts, et conduite défensive.',
                'categorie' => 'Sécurité',
                'duree_minutes' => 45,
                'difficulte' => 'debutant',
                'contenu' => "## Sécurité Routière\n\n### 1. Distances de sécurité\n\nMaintenez toujours une distance d'au moins 50 mètres avec le véhicule qui vous précède.\n\n### 2. Angles morts\n\nVérifiez vos rétroviseurs toutes les 5 à 8 secondes.\n\n### 3. Conduite défensive\n\nAnticipez les actions des autres usagers de la route.",
                'questions' => [
                    ['question' => 'Quelle est la distance de sécurité minimale recommandée entre deux bus ?', 'options' => ['10 m', '30 m', '50 m', '100 m'], 'correct_answer' => '50 m', 'points' => 10],
                    ['question' => 'À quelle fréquence devez-vous vérifier vos rétroviseurs ?', 'options' => ['Toutes les 30s', 'Toutes les 5-8s', 'Jamais', 'Au démarrage'], 'correct_answer' => 'Toutes les 5-8s', 'points' => 10],
                    ['question' => 'Que faire en cas de brouillard épais ?', 'options' => ['Accélérer', 'Allumer les feux de détresse', 'S\'arrêter sur le bas-côté', 'Réduire la vitesse et allumer les feux antibrouillard'], 'correct_answer' => 'Réduire la vitesse et allumer les feux antibrouillard', 'points' => 15],
                ],
            ],
            [
                'titre' => 'Service Client Excellence',
                'description' => 'Offrir une expérience exceptionnelle aux voyageurs : accueil, gestion des réclamations, et communication bienveillante.',
                'categorie' => 'Service',
                'duree_minutes' => 30,
                'difficulte' => 'debutant',
                'contenu' => "## Service Client\n\n### 1. Accueil des passagers\n\nSouriez et saluez chaque passager à la montée.\n\n### 2. Gestion des réclamations\n\nÉcoutez activement, ne coupez pas la parole, proposez une solution.",
                'questions' => [
                    ['question' => 'Comment accueillir un passager à la montée ?', 'options' => ['Ignorer', 'Saluer avec un sourire', 'Demander le ticket seulement', 'Crier'], 'correct_answer' => 'Saluer avec un sourire', 'points' => 10],
                    ['question' => 'Face à une réclamation, la première étape est :', 'options' =>['Argumenter', 'Écouter activement', 'Ignorer', 'Appeler le supérieur'], 'correct_answer' => 'Écouter activement', 'points' => 10],
                ],
            ],
            [
                'titre' => 'Gestion du Stress au Volant',
                'description' => 'Techniques de gestion du stress et de la fatigue pour les longs trajets.',
                'categorie' => 'Bien-être',
                'duree_minutes' => 25,
                'difficulte' => 'intermediaire',
                'contenu' => "## Gestion du Stress\n\nFaites une pause toutes les 2 heures. Hydratez-vous régulièrement.",
                'questions' => [
                    ['question' => 'Toutes les combien d\'heures devez-vous faire une pause ?', 'options' => ['1h', '2h', '4h', '6h'], 'correct_answer' => '2h', 'points' => 10],
                    ['question' => 'Quel est un signe de fatigue au volant ?', 'options' => ['Bâillements fréquents', 'Excitation', 'Faim', 'Soif'], 'correct_answer' => 'Bâillements fréquents', 'points' => 10],
                ],
            ],
        ];

        foreach ($courses as $c) {
            $course = Course::create([
                'titre' => $c['titre'],
                'description' => $c['description'],
                'categorie' => $c['categorie'],
                'duree_minutes' => $c['duree_minutes'],
                'difficulte' => $c['difficulte'],
                'obligatoire' => true,
                'contenu' => $c['contenu'],
            ]);

            foreach ($c['questions'] as $q) {
                Quiz::create([
                    'course_id' => $course->id,
                    'question' => $q['question'],
                    'options' => $q['options'],
                    'correct_answer' => $q['correct_answer'],
                    'points' => $q['points'],
                ]);
            }
        }
    }
}
