<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Contract extends Model
{
    protected $fillable = [
        'user_id', 'type', 'start_date', 'end_date',
        'salary_base', 'transport_allowance', 'housing_allowance', 'other_allowances',
        'duties', 'document_path', 'is_active',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}