<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Station extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'city', 'address', 'latitude', 'longitude',
        'phone', 'type', 'is_active',
    ];

    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
        'is_active' => 'boolean',
    ];

    public function departureRoutes(): HasMany
    {
        return $this->hasMany(StationRoute::class, 'departure_station_id');
    }

    public function arrivalRoutes(): HasMany
    {
        return $this->hasMany(StationRoute::class, 'arrival_station_id');
    }
}
