<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Course extends Model
{
    use HasFactory;

    protected $fillable = [
        'titre',
        'description',
        'categorie',
        'duree_minutes',
        'difficulte',
        'obligatoire',
        'image_url',
        'contenu',
    ];

    protected $casts = [
        'duree_minutes' => 'integer',
        'obligatoire' => 'boolean',
    ];

    const CATEGORIE_SECURITE = 'securite';
    const CATEGORIE_REGLEMENT = 'reglement';
    const CATEGORIE_CONDUITE = 'conduite';
    const CATEGORIE_SERVICE = 'service';

    const DIFFICULTE_DEBUTANT = 'debutant';
    const DIFFICULTE_INTERMEDIAIRE = 'intermediaire';
    const DIFFICULTE_AVANCE = 'avance';

    public function quizzes(): HasMany
    {
        return $this->hasMany(Quiz::class);
    }

    public function progress(): HasMany
    {
        return $this->hasMany(CourseProgress::class);
    }

    public function scopeByCategorie($query, string $categorie)
    {
        return $query->where('categorie', $categorie);
    }

    public function scopeObligatoire($query)
    {
        return $query->where('obligatoire', true);
    }
}
