<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MotoTransport extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'sender_name',
        'sender_phone',
        'recipient_name',
        'recipient_phone',
        'origin_city',
        'destination_city',
        'origin_city_id',
        'destination_city_id',
        'moto_brand',
        'moto_model',
        'moto_registration',
        'amount',
        'status',
        'notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
    ];

    const STATUS_EN_ATTENTE = 'en_attente';
    const STATUS_EN_COURS = 'en_cours';
    const STATUS_LIVRE = 'livre';
    const STATUS_ANNULE = 'annule';

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function originCity(): BelongsTo
    {
        return $this->belongsTo(City::class, 'origin_city_id');
    }

    public function destinationCity(): BelongsTo
    {
        return $this->belongsTo(City::class, 'destination_city_id');
    }

    public function scopeEnCours($query)
    {
        return $query->whereIn('status', [self::STATUS_EN_ATTENTE, self::STATUS_EN_COURS]);
    }
}
