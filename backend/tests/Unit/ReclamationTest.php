<?php

namespace Tests\Unit;

use App\Models\Reclamation;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReclamationTest extends TestCase
{
    use RefreshDatabase;

    public function test_code_is_generated_correctly()
    {
        $user = User::factory()->create();

        $r1 = Reclamation::create([
            'code' => 'REC-2026-0001',
            'user_id' => $user->id,
            'client_name' => 'Test Client',
            'client_phone' => '70123456',
            'type' => 'Retard',
            'description' => 'Test description',
            'priorite' => 'haute',
            'statut' => 'en_attente',
        ]);

        $this->assertEquals('REC-2026-0001', $r1->code);
    }

    public function test_reclamation_has_correct_defaults()
    {
        $user = User::factory()->create();

        $r = Reclamation::create([
            'code' => 'REC-2026-0002',
            'user_id' => $user->id,
            'client_name' => 'Test',
            'client_phone' => '70123456',
            'type' => 'Service',
            'description' => 'Desc',
            'priorite' => 'moyenne',
            'statut' => 'en_attente',
        ]);

        $this->assertEquals('moyenne', $r->priorite);
        $this->assertEquals('en_attente', $r->statut);
    }

    public function test_reclamation_belongs_to_user()
    {
        $user = User::factory()->create();
        $r = Reclamation::factory()->create(['user_id' => $user->id]);

        $this->assertInstanceOf(User::class, $r->user);
    }
}
