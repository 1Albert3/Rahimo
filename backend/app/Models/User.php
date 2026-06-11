<?php

namespace App\Models;

use App\Models\Traits\BelongsToCompany;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

#[Fillable(['name', 'email', 'password', 'phone', 'city', 'role', 'is_active', 'driver_license_number', 'license_expiry_date', 'company_id'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable, BelongsToCompany;

    const ROLE_DIRECTEUR_GENERAL = 'directeur_general';
    const ROLE_RESPONSABLE_FLOTTE = 'responsable_flotte';
    const ROLE_COMPTABLE = 'comptable';
    const ROLE_CHEF_GARDE = 'chef_garde';
    const ROLE_GUICHETIERE = 'guichetiere';
    const ROLE_AGENT_POLICE = 'agent_police';
    const ROLE_BAGAGISTE = 'bagagiste';
    const ROLE_CHAUFFEUR = 'chauffeur';
    const ROLE_CLIENT = 'client';

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'license_expiry_date' => 'date',
            'is_active' => 'boolean',
        ];
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function tripsAsDriver(): HasMany
    {
        return $this->hasMany(Trip::class, 'driver_id');
    }

    public function contracts(): HasMany
    {
        return $this->hasMany(Contract::class);
    }

    public function isDirecteurGeneral(): bool
    {
        return $this->role === self::ROLE_DIRECTEUR_GENERAL;
    }

    public function isResponsableFlotte(): bool
    {
        return $this->role === self::ROLE_RESPONSABLE_FLOTTE;
    }

    public function isComptable(): bool
    {
        return $this->role === self::ROLE_COMPTABLE;
    }

    public function isChefGarde(): bool
    {
        return $this->role === self::ROLE_CHEF_GARDE;
    }

    public function isGuichetiere(): bool
    {
        return $this->role === self::ROLE_GUICHETIERE;
    }

    public function isAgentPolice(): bool
    {
        return $this->role === self::ROLE_AGENT_POLICE;
    }

    public function isBagagiste(): bool
    {
        return $this->role === self::ROLE_BAGAGISTE;
    }

    public function isChauffeur(): bool
    {
        return $this->role === self::ROLE_CHAUFFEUR;
    }

    public function isClient(): bool
    {
        return $this->role === self::ROLE_CLIENT;
    }

    public function scopeByRole($query, string $role)
    {
        return $query->where('role', $role);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeChauffeurs($query)
    {
        return $query->where('role', self::ROLE_CHAUFFEUR);
    }

    public function scopeStaff($query)
    {
        return $query->whereIn('role', [
            self::ROLE_DIRECTEUR_GENERAL,
            self::ROLE_RESPONSABLE_FLOTTE,
            self::ROLE_COMPTABLE,
            self::ROLE_CHEF_GARDE,
            self::ROLE_GUICHETIERE,
            self::ROLE_AGENT_POLICE,
            self::ROLE_BAGAGISTE,
            self::ROLE_CHAUFFEUR,
        ]);
    }

    public function loyaltyPoints(): int
    {
        return $this->bookings()
            ->where('status', 'confirmed')
            ->sum('seats_count') * 10;
    }

    public function getLoyaltyTier(): string
    {
        $points = $this->loyaltyPoints();

        return match (true) {
            $points >= 5000 => 'platine',
            $points >= 2000 => 'or',
            $points >= 500 => 'argent',
            default => 'bronze',
        };
    }

    public function getNextTierPoints(): int
    {
        $points = $this->loyaltyPoints();

        return match (true) {
            $points >= 5000 => 0,
            $points >= 2000 => 5000 - $points,
            $points >= 500 => 2000 - $points,
            default => 500 - $points,
        };
    }
}
