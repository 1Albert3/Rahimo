<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LostItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'reported_by_name',
        'reported_by_phone',
        'trip_info',
        'description',
        'status',
        'photo_url',
        'admin_notes',
    ];

    const STATUS_PERDU = 'perdu';
    const STATUS_RETROUVE = 'retrouve';
    const STATUS_RENDU = 'rendu';

    public function scopePerdus($query)
    {
        return $query->where('status', self::STATUS_PERDU);
    }
}