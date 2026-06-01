<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Promotion extends Model
{
    protected $fillable = [
        'code',
        'label',
        'type',
        'value',
        'min_amount',
        'max_uses',
        'used_count',
        'starts_at',
        'ends_at',
        'active',
    ];

    protected $casts = [
        'value' => 'decimal:2',
        'min_amount' => 'decimal:2',
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'active' => 'boolean',
    ];

    public function isValid(): bool
    {
        if (!$this->active) return false;
        if ($this->max_uses && $this->used_count >= $this->max_uses) return false;
        if ($this->starts_at && $this->starts_at->isFuture()) return false;
        if ($this->ends_at && $this->ends_at->isPast()) return false;
        return true;
    }

    public function apply(float $amount): array
    {
        if ($this->type === 'percentage') {
            $discount = $amount * $this->value / 100;
        } else {
            $discount = min($this->value, $amount);
        }
        return [
            'code' => $this->code,
            'label' => $this->label,
            'discount' => round($discount, 2),
            'final' => round($amount - $discount, 2),
        ];
    }

    public function incrementUsage(): void
    {
        $this->increment('used_count');
    }
}
