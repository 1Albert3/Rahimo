<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Rental extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',
        'brand',
        'model',
        'registration_number',
        'rental_start',
        'rental_end',
        'amount_per_day',
        'total_amount',
        'deposit',
        'status',
        'notes',
    ];

    protected $casts = [
        'rental_start' => 'datetime',
        'rental_end' => 'datetime',
        'amount_per_day' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'deposit' => 'decimal:2',
    ];

    const TYPE_VOITURE = 'voiture';
    const TYPE_MOTO = 'moto';

    const STATUS_EN_COURS = 'en_cours';
    const STATUS_TERMINE = 'termine';
    const STATUS_ANNULE = 'annule';

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeEnCours($query)
    {
        return $query->where('status', self::STATUS_EN_COURS);
    }
}
