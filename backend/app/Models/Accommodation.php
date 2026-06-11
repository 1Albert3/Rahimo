<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Accommodation extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'guest_name',
        'guest_phone',
        'check_in',
        'check_out',
        'room_type',
        'room_number',
        'amount_per_night',
        'total_amount',
        'status',
        'notes',
    ];

    protected $casts = [
        'check_in' => 'datetime',
        'check_out' => 'datetime',
        'amount_per_night' => 'decimal:2',
        'total_amount' => 'decimal:2',
    ];

    const ROOM_STANDARD = 'standard';
    const ROOM_VIP = 'vip';
    const ROOM_SUITE = 'suite';

    const STATUS_RESERVE = 'reserve';
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
