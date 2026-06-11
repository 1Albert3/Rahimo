<?php

namespace Database\Seeders;

use App\Models\City;
use Illuminate\Database\Seeder;

class CitySeeder extends Seeder
{
    /**
     * Liste des principales villes du Burkina Faso.
     * Inspirée du référentiel utilisé dans le projet Yael.
     */
    public function run(): void
    {
        $cities = [
            'Ouagadougou',
            'Bobo-Dioulasso',
            'Koudougou',
            'Banfora',
            'Ouahigouya',
            'Pouytenga',
            'Kaya',
            'Tenkodogo',
            'Fada N\'Gourma',
            'Dédougou',
            'Houndé',
            'Réo',
            'Manga',
            'Ziniaré',
            'Dori',
            'Léo',
            'Gaoua',
            'Nouna',
            'Diapaga',
            'Boromo',
            'Yako',
            'Pô',
            'Orodara',
            'Tougan',
            'Garango',
            'Koupéla',
            'Diébougou',
            'Bogandé',
        ];

        foreach ($cities as $nom) {
            City::firstOrCreate(['nom' => $nom]);
        }
    }
}
