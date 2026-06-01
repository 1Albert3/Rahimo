<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SpeedAlert extends Model
{
    use HasFactory;
    protected $fillable = [
        'vehicle_id', 'trip_id', 'driver_id', 'speed', 'speed_limit',
        'latitude', 'longitude', 'level', 'notification_sent', 'status', 'resolved_at',
    ];

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function trip()
    {
        return $this->belongsTo(Trip::class);
    }

    public function driver()
    {
        return $this->belongsTo(User::class, 'driver_id');
    }

    public function logs()
    {
        return $this->hasMany(SpeedAlertLog::class);
    }
}