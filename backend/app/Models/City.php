<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class City extends Model
{
    protected $fillable = ['nom'];

    public function tripsAsDeparture(): HasMany
    {
        return $this->hasMany(Trip::class, 'departure_city_id');
    }

    public function tripsAsArrival(): HasMany
    {
        return $this->hasMany(Trip::class, 'arrival_city_id');
    }

    public function colisAsDeparture(): HasMany
    {
        return $this->hasMany(Colis::class, 'departure_city_id');
    }

    public function colisAsArrival(): HasMany
    {
        return $this->hasMany(Colis::class, 'arrival_city_id');
    }

    public function stations(): HasMany
    {
        return $this->hasMany(Station::class, 'city_id');
    }

    public function motoTransportsAsOrigin(): HasMany
    {
        return $this->hasMany(MotoTransport::class, 'origin_city_id');
    }

    public function motoTransportsAsDestination(): HasMany
    {
        return $this->hasMany(MotoTransport::class, 'destination_city_id');
    }
}
