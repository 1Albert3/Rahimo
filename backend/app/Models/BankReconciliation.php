<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BankReconciliation extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'account_name',
        'account_number',
        'statement_balance',
        'system_balance',
        'difference',
        'status',
        'reconciled_at',
        'notes',
    ];

    protected $casts = [
        'statement_balance' => 'decimal:2',
        'system_balance' => 'decimal:2',
        'difference' => 'decimal:2',
        'reconciled_at' => 'datetime',
    ];

    const STATUS_PENDING = 'pending';
    const STATUS_RECONCILED = 'reconciled';
    const STATUS_DISCREPANCY = 'discrepancy';

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    public function scopeReconciled($query)
    {
        return $query->where('status', self::STATUS_RECONCILED);
    }
}
