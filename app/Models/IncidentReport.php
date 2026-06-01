<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class IncidentReport extends Model
{
    protected $fillable = [
        'trip_id', 'vehicle_id', 'driver_id', 'type', 'incident_date',
        'location', 'latitude', 'longitude', 'description',
        'actions_taken', 'injuries', 'damages', 'police_report_number',
        'photos', 'status', 'reported_by',
    ];

    protected $casts = ['photos' => 'array'];

    public function trip()
    {
        return $this->belongsTo(Trip::class);
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function driver()
    {
        return $this->belongsTo(User::class, 'driver_id');
    }

    public function reporter()
    {
        return $this->belongsTo(User::class, 'reported_by');
    }
}