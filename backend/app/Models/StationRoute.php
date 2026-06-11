<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StationRoute extends Model
{
    use HasFactory;

    protected $fillable = [
        'departure_station_id', 'arrival_station_id', 'company_id',
        'route_name', 'base_price', 'estimated_minutes', 'distance_km', 'is_active',
    ];

    protected $casts = [
        'base_price' => 'float',
        'estimated_minutes' => 'integer',
        'distance_km' => 'integer',
        'is_active' => 'boolean',
    ];

    public function departureStation()
    {
        return $this->belongsTo(Station::class, 'departure_station_id');
    }

    public function arrivalStation()
    {
        return $this->belongsTo(Station::class, 'arrival_station_id');
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}
