<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Parking extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'vehicle_registration',
        'driver_name',
        'driver_phone',
        'entry_date',
        'exit_date',
        'amount',
        'amount_paid',
        'status',
        'notes',
    ];

    protected $casts = [
        'entry_date' => 'datetime',
        'exit_date' => 'datetime',
        'amount' => 'decimal:2',
        'amount_paid' => 'decimal:2',
    ];

    const STATUS_EN_COURS = 'en_cours';
    const STATUS_TERMINE = 'termine';
    const STATUS_ANNULE = 'annule';

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function getSoldeAttribute(): float
    {
        return $this->amount - $this->amount_paid;
    }

    public function scopeEnCours($query)
    {
        return $query->where('status', self::STATUS_EN_COURS);
    }
}
