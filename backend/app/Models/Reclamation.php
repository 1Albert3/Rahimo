<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Reclamation extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'user_id',
        'client_name',
        'client_phone',
        'type',
        'description',
        'priorite',
        'statut',
        'treated_by',
        'response',
        'treated_at',
    ];

    protected $casts = [
        'treated_at' => 'datetime',
    ];

    const PRIORITE_HAUTE = 'haute';
    const PRIORITE_MOYENNE = 'moyenne';
    const PRIORITE_BASSE = 'basse';

    const STATUT_EN_ATTENTE = 'en_attente';
    const STATUT_EN_COURS = 'en_cours';
    const STATUT_RESOLUE = 'resolue';
    const STATUT_FERMEE = 'fermee';

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function treatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'treated_by');
    }

    public function scopeEnAttente($query)
    {
        return $query->where('statut', self::STATUT_EN_ATTENTE);
    }
}
