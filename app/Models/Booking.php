<?php

namespace App\Models;

use App\Models\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Booking extends Model
{
    use HasFactory, BelongsToCompany;

    protected $fillable = [
        'booking_number',
        'user_id',
        'trip_id',
        'passenger_name',
        'passenger_phone',
        'passenger_email',
        'seat_numbers',
        'seats_count',
        'total_price',
        'status',
        'payment_status',
        'payment_method',
        'notification_channel',
        'booking_date',
        'notes',
        'company_id',
    ];

    protected $casts = [
        'booking_date' => 'datetime',
        'seat_numbers' => 'array',
        'total_price' => 'decimal:2',
    ];

    const STATUS_PENDING = 'pending';
    const STATUS_CONFIRMED = 'confirmed';
    const STATUS_CANCELLED = 'cancelled';
    const STATUS_COMPLETED = 'completed';

    const PAYMENT_PENDING = 'pending';
    const PAYMENT_PAID = 'paid';
    const PAYMENT_REFUNDED = 'refunded';

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function trip(): BelongsTo
    {
        return $this->belongsTo(Trip::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function scopeConfirmed($query)
    {
        return $query->where('status', self::STATUS_CONFIRMED);
    }

    public function scopePaid($query)
    {
        return $query->where('payment_status', self::PAYMENT_PAID);
    }

    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function canBeCancelled(): bool
    {
        if ($this->status === self::STATUS_CANCELLED) {
            return false;
        }
        return $this->trip->departure_time > now();
    }

    public function getRefundPercentage(): int
    {
        $hoursUntilDeparture = now()->diffInHours($this->trip->departure_time, false);
        if ($hoursUntilDeparture >= 24) return 100;
        if ($hoursUntilDeparture >= 6) return 50;
        return 0;
    }

    public function getRefundAmount(): float
    {
        return $this->total_price * $this->getRefundPercentage() / 100;
    }

    public function generateBookingNumber(): string
    {
        return 'BK' . date('Ymd') . str_pad($this->id, 4, '0', STR_PAD_LEFT);
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($booking) {
            $booking->booking_date = now();
        });

        static::created(function ($booking) {
            $booking->booking_number = $booking->generateBookingNumber();
            $booking->save();
        });
    }
}
