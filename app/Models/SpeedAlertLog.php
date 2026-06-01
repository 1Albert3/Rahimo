<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SpeedAlertLog extends Model
{
    protected $fillable = ['speed_alert_id', 'speed', 'latitude', 'longitude', 'recorded_at'];

    public $timestamps = false;

    public function alert()
    {
        return $this->belongsTo(SpeedAlert::class, 'speed_alert_id');
    }
}