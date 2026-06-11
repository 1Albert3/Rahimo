<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class TestUserSeeder extends Seeder
{
    public function run(): void
    {
        // Ensure a known test user exists with password 'password'
        User::updateOrCreate([
            'email' => 'client@rahimo.bf',
        ], [
            'name' => 'Client Test (seeded)',
            'phone' => '70000000',
            'city' => 'Ouagadougou',
            'role' => User::ROLE_CLIENT,
            'is_active' => true,
            'email_verified_at' => now(),
            'password' => Hash::make('password'),
            'remember_token' => Str::random(10),
        ]);
    }
}
