<?php

namespace App\Models;

use App\Models\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    use HasFactory, BelongsToCompany;

    protected $fillable = [
        'booking_id',
        'amount',
        'payment_method',
        'transaction_id',
        'status',
        'payment_date',
        'reference_number',
        'company_id',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'payment_date' => 'datetime',
    ];

    const STATUS_PENDING = 'pending';
    const STATUS_COMPLETED = 'completed';
    const STATUS_FAILED = 'failed';
    const STATUS_REFUNDED = 'refunded';

    const METHOD_CASH = 'cash';
    const METHOD_CARD = 'card';
    const METHOD_MOBILE_MONEY = 'mobile_money';
    const METHOD_BANK_TRANSFER = 'bank_transfer';

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', self::STATUS_COMPLETED);
    }

    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    public function isCompleted(): bool
    {
        return $this->status === self::STATUS_COMPLETED;
    }

    public function generateReferenceNumber(): string
    {
        return 'PAY' . date('Ymd') . str_pad($this->id, 6, '0', STR_PAD_LEFT);
    }

    protected static function boot()
    {
        parent::boot();

        static::created(function ($payment) {
            $payment->reference_number = $payment->generateReferenceNumber();
            $payment->save();
        });
    }
}