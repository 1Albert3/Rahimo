<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaySlip extends Model
{
    protected $fillable = [
        'user_id', 'period', 'base_salary', 'transport_allowance', 'housing_allowance',
        'other_allowances', 'bonus', 'overtime', 'deductions', 'tax', 'cnss',
        'net_salary', 'status', 'paid_at', 'notes',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}