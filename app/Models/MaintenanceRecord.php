<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MaintenanceRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'vehicle_id',
        'maintenance_type',
        'description',
        'cost',
        'maintenance_date',
        'next_maintenance_date',
        'performed_by',
        'status',
        'mileage_at_maintenance',
    ];

    protected $casts = [
        'maintenance_date' => 'date',
        'next_maintenance_date' => 'date',
        'cost' => 'decimal:2',
        'mileage_at_maintenance' => 'integer',
    ];

    const TYPE_ROUTINE = 'routine';
    const TYPE_REPAIR = 'repair';
    const TYPE_INSPECTION = 'inspection';
    const TYPE_EMERGENCY = 'emergency';

    const STATUS_SCHEDULED = 'scheduled';
    const STATUS_IN_PROGRESS = 'in_progress';
    const STATUS_COMPLETED = 'completed';
    const STATUS_CANCELLED = 'cancelled';

    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', self::STATUS_COMPLETED);
    }

    public function scopeUpcoming($query)
    {
        return $query->where('status', self::STATUS_SCHEDULED)
                    ->where('maintenance_date', '>=', now());
    }

    public function scopeOverdue($query)
    {
        return $query->where('status', self::STATUS_SCHEDULED)
                    ->where('maintenance_date', '<', now());
    }
}