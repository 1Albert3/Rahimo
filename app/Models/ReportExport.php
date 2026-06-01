<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReportExport extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'type', 'period', 'date_from', 'date_to',
        'format', 'filename', 'file_path', 'status',
    ];

    protected $casts = [
        'date_from' => 'date',
        'date_to' => 'date',
    ];
}
