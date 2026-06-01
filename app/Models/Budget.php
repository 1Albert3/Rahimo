<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Budget extends Model
{
    protected $fillable = [
        'label', 'period_type', 'period', 'total_amount', 'spent_amount', 'status', 'notes',
    ];
}