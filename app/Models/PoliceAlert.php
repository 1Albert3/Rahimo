<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PoliceAlert extends Model
{
    protected $fillable = [
        'alert_type', 'severity', 'trip_id', 'booking_id',
        'person_name', 'person_phone', 'person_id_document',
        'description', 'status', 'handled_by', 'resolved_at',
    ];

    public function trip()
    {
        return $this->belongsTo(Trip::class);
    }

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    public function handler()
    {
        return $this->belongsTo(User::class, 'handled_by');
    }
}