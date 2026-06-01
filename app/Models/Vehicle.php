<?php

namespace App\Models;

use App\Models\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Vehicle extends Model
{
    use HasFactory, BelongsToCompany;

    protected $fillable = [
        'registration_number',
        'brand',
        'model',
        'capacity',
        'type',
        'status',
        'year',
        'fuel_type',
        'last_maintenance_date',
        'next_maintenance_date',
        'mileage',
        'last_latitude',
        'last_longitude',
        'last_gps_update',
        'company_id',
    ];

    protected $casts = [
        'last_maintenance_date' => 'date',
        'next_maintenance_date' => 'date',
        'capacity' => 'integer',
        'year' => 'integer',
        'mileage' => 'integer',
        'last_latitude' => 'decimal:7',
        'last_longitude' => 'decimal:7',
        'last_gps_update' => 'datetime',
    ];

    const STATUS_ACTIVE = 'active';
    const STATUS_MAINTENANCE = 'maintenance';
    const STATUS_OUT_OF_SERVICE = 'out_of_service';

    public function trips(): HasMany
    {
        return $this->hasMany(Trip::class);
    }

    public function maintenanceRecords(): HasMany
    {
        return $this->hasMany(MaintenanceRecord::class);
    }

    public function vehicleLocations(): HasMany
    {
        return $this->hasMany(VehicleLocation::class);
    }

    public function scopeActive($query)
    {
        return $query->where('status', self::STATUS_ACTIVE);
    }

    public function scopeAvailable($query)
    {
        return $query->where('status', self::STATUS_ACTIVE);
    }

    public function isAvailable(): bool
    {
        return $this->status === self::STATUS_ACTIVE;
    }

    public function needsMaintenance(): bool
    {
        return $this->next_maintenance_date && $this->next_maintenance_date->isPast();
    }
}