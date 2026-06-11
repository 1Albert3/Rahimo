<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PoliceCheckLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'booking_id', 'trip_id',
        'full_name', 'phone', 'id_card_number',
        'match_status', 'check_type', 'performed_by',
    ];
}
