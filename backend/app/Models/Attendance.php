<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    protected $table = 'attendance';

    protected $fillable = [
        'user_id', 'date', 'clock_in', 'clock_out', 'status', 'notes',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}