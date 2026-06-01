<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Company extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'slug', 'registration_number', 'phone', 'email',
        'address', 'logo_url', 'primary_color', 'is_active',
    ];

    protected $casts = ['is_active' => 'boolean'];

    public function vehicles(): HasMany
    {
        return $this->hasMany(Vehicle::class);
    }

    public function trips(): HasMany
    {
        return $this->hasMany(Trip::class);
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }
}
