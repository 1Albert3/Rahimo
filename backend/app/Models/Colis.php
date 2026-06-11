<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Colis extends Model
{
    use HasFactory;

    protected $fillable = [
        'tracking_number',
        'expediteur_name',
        'expediteur_phone',
        'destinataire_name',
        'destinataire_phone',
        'departure_city',
        'arrival_city',
        'destination_address',
        'weight',
        'description',
        'type',
        'status',
        'payment_on_delivery',
        'photos',
        'status_history',
        'trip_id',
        'user_id',
        'price',
        'notes',
        'expedition_date',
        'livraison_date',
        'departure_city_id',
        'arrival_city_id',
    ];

    protected $casts = [
        'weight' => 'decimal:2',
        'price' => 'decimal:2',
        'expedition_date' => 'datetime',
        'livraison_date' => 'datetime',
        'payment_on_delivery' => 'boolean',
        'photos' => 'array',
        'status_history' => 'array',
    ];

    const STATUS_EN_ATTENTE = 'en_attente';
    const STATUS_EN_COURS = 'en_cours';
    const STATUS_EN_TRANSIT = 'en_transit';
    const STATUS_LIVRE = 'livre';
    const STATUS_RETARDE = 'retarde';

    const TYPE_COLIS = 'colis';
    const TYPE_BAGAGE = 'bagage';
    const TYPE_MARCHANDISE = 'marchandise';
    const TYPE_FRAGILE = 'fragile';

    public function trip(): BelongsTo
    {
        return $this->belongsTo(Trip::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function departureCity(): BelongsTo
    {
        return $this->belongsTo(City::class, 'departure_city_id');
    }

    public function arrivalCity(): BelongsTo
    {
        return $this->belongsTo(City::class, 'arrival_city_id');
    }

    public function scopeByTrackingNumber($query, string $trackingNumber)
    {
        return $query->where('tracking_number', $trackingNumber);
    }

    public function addStatusEntry(string $status, ?string $location = null): void
    {
        $history = $this->status_history ?? [];
        $history[] = [
            'status' => $status,
            'date' => now()->toIso8601String(),
            'location' => $location,
        ];
        $this->status_history = $history;
        $this->save();
    }

    public function getStatusTimeline(): array
    {
        return $this->status_history ?? [];
    }

    public function scopeEnCours($query)
    {
        return $query->whereIn('status', [self::STATUS_EN_COURS, self::STATUS_EN_TRANSIT]);
    }

    public function generateTrackingNumber(): string
    {
        return 'COL' . date('Ymd') . '-' . strtoupper(substr(md5(uniqid()), 0, 6));
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($colis) {
            $colis->tracking_number = $colis->generateTrackingNumber();
            $colis->status = $colis->status ?? self::STATUS_EN_ATTENTE;
        });
    }
}
