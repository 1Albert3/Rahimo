<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FraudCheck extends Model
{
    use HasFactory;

    protected $fillable = [
        'trip_id', 'booking_id', 'type', 'severity', 'status',
        'description', 'evidence', 'match_details',
        'flagged_by', 'resolved_by', 'resolved_at',
    ];

    protected $casts = [
        'match_details' => 'array',
        'resolved_at' => 'datetime',
    ];
}
