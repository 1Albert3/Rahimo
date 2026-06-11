<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Baggage extends Model
{
    use HasFactory;

    protected $table = 'baggage';

    protected $fillable = [
        'booking_id', 'trip_id', 'user_id', 'tag_number', 'passenger_name',
        'description', 'type', 'weight_kg', 'status',
        'scanned_by', 'scanned_at', 'loaded_by', 'loaded_at',
        'unloaded_by', 'unloaded_at', 'delivered_to', 'delivered_at',
        'notes',
    ];

    protected $casts = [
        'weight_kg' => 'float',
        'scanned_at' => 'datetime',
        'loaded_at' => 'datetime',
        'unloaded_at' => 'datetime',
        'delivered_at' => 'datetime',
    ];

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    public function trip()
    {
        return $this->belongsTo(Trip::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public static function generateTag(): string
    {
        return 'BAG-' . strtoupper(substr(md5(uniqid()), 0, 8));
    }
}
