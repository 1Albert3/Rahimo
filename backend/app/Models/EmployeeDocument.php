<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmployeeDocument extends Model
{
    protected $fillable = ['user_id', 'type', 'label', 'file_path', 'expiry_date', 'notes'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}