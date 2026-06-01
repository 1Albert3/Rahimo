<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Alert extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'categorie',
        'titre',
        'description',
        'severity',
        'vehicle_id',
        'trip_id',
        'lieu',
        'source',
        'traitee',
        'traitee_at',
    ];

    protected $casts = [
        'traitee' => 'boolean',
        'traitee_at' => 'datetime',
    ];

    const TYPE_DANGER = 'danger';
    const TYPE_WARNING = 'warning';
    const TYPE_INFO = 'info';

    const SEVERITY_CRITICAL = 'critical';
    const SEVERITY_HIGH = 'high';
    const SEVERITY_MEDIUM = 'medium';
    const SEVERITY_LOW = 'low';

    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function trip(): BelongsTo
    {
        return $this->belongsTo(Trip::class);
    }

    public function scopeActive($query)
    {
        return $query->where('traitee', false);
    }

    public function scopeByType($query, string $type)
    {
        return $query->where('type', $type);
    }

    public function scopeBySeverity($query, string $severity)
    {
        return $query->where('severity', $severity);
    }

    public function markAsTreated(): void
    {
        $this->update([
            'traitee' => true,
            'traitee_at' => now(),
        ]);
    }
}
