<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserFactory extends Factory
{
    protected static ?string $password;

    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'phone' => '70' . fake()->numerify('########'),
            'city' => fake()->randomElement(['Ouagadougou', 'Bobo-Dioulasso', 'Koudougou', 'Ouahigouya', 'Banfora', 'Dédougou']),
            'role' => User::ROLE_CLIENT,
            'is_active' => true,
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
        ];
    }

    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    public function directeurGeneral(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => User::ROLE_DIRECTEUR_GENERAL,
        ]);
    }

    public function responsableFlotte(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => User::ROLE_RESPONSABLE_FLOTTE,
        ]);
    }

    public function comptable(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => User::ROLE_COMPTABLE,
        ]);
    }

    public function chefGarde(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => User::ROLE_CHEF_GARDE,
        ]);
    }

    public function guichetiere(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => User::ROLE_GUICHETIERE,
        ]);
    }

    public function agentPolice(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => User::ROLE_AGENT_POLICE,
        ]);
    }

    public function bagagiste(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => User::ROLE_BAGAGISTE,
        ]);
    }

    public function chauffeur(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => User::ROLE_CHAUFFEUR,
            'driver_license_number' => strtoupper(Str::random(8)),
            'license_expiry_date' => fake()->dateTimeBetween('+6 months', '+5 years'),
        ]);
    }
}
