<?php

namespace App\Models;

use App\Models\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Trip extends Model
{
    use HasFactory, BelongsToCompany;

    protected $fillable = [
        'trip_number',
        'vehicle_id',
        'driver_id',
        'departure_city',
        'arrival_city',
        'departure_time',
        'arrival_time',
        'price',
        'available_seats',
        'status',
        'departure_date',
        'company_id',
        'departure_station_id',
        'arrival_station_id',
        'departure_city_id',
        'arrival_city_id',
    ];

    protected $casts = [
        'departure_time' => 'datetime',
        'arrival_time' => 'datetime',
        'departure_date' => 'date',
        'price' => 'decimal:2',
        'available_seats' => 'integer',
    ];

    const STATUS_SCHEDULED = 'scheduled';
    const STATUS_IN_PROGRESS = 'in_progress';
    const STATUS_COMPLETED = 'completed';
    const STATUS_CANCELLED = 'cancelled';

    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function driver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'driver_id');
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function departureCity(): BelongsTo
    {
        return $this->belongsTo(City::class, 'departure_city_id');
    }

    public function arrivalCity(): BelongsTo
    {
        return $this->belongsTo(City::class, 'arrival_city_id');
    }

    public function scopeAvailable($query)
    {
        return $query->where('status', self::STATUS_SCHEDULED)
                    ->where('available_seats', '>', 0)
                    ->where('departure_time', '>', now());
    }

    public function scopeUpcoming($query)
    {
        return $query->where('departure_time', '>', now())
                    ->orderBy('departure_time');
    }

    public function scopeByRoute($query, string $departure, string $arrival)
    {
        return $query->where('departure_city', $departure)
                    ->where('arrival_city', $arrival);
    }

    public function scopeByDate($query, string $date)
    {
        return $query->whereDate('departure_date', $date);
    }

    public function getBookedSeatsAttribute(): int
    {
        return $this->bookings()->where('status', 'confirmed')->sum('seats_count');
    }

    public function hasAvailableSeats(int $requestedSeats = 1): bool
    {
        return $this->available_seats >= $requestedSeats;
    }

    public function getDurationAttribute(): string
    {
        if (!$this->departure_time || !$this->arrival_time) {
            return 'N/A';
        }

        $duration = $this->departure_time->diff($this->arrival_time);
        return $duration->format('%H:%I');
    }
}
