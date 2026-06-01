<?php

namespace Tests\Feature;

use App\Models\Reclamation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReclamationControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->create(['role' => 'directeur_general']);
    }

    public function test_admin_can_view_reclamations_page()
    {
        Reclamation::factory()->count(3)->create();

        $response = $this->actingAs($this->admin)
            ->get(route('admin.reclamations'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Admin/Reclamations'));
    }

    public function test_admin_can_store_reclamation()
    {
        $response = $this->actingAs($this->admin)
            ->post(route('admin.reclamations.store'), [
                'client_name' => 'John Doe',
                'client_phone' => '70123456',
                'type' => 'Retard',
                'description' => 'Bus en retard',
                'priorite' => 'haute',
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('reclamations', ['client_name' => 'John Doe']);
    }

    public function test_reclamation_code_is_unique()
    {
        Reclamation::factory()->create(['code' => 'REC-2026-0001']);

        $this->actingAs($this->admin)
            ->post(route('admin.reclamations.store'), [
                'client_name' => 'Jane',
                'client_phone' => '70123457',
                'type' => 'Service',
                'description' => 'Test',
                'priorite' => 'basse',
            ]);

        $saved = Reclamation::where('code', 'REC-2026-0001')->first();
        $all = Reclamation::all();
        $this->assertCount(2, $all);
        $this->assertNotEquals($saved->id, $all->last()->id);
    }

    public function test_admin_can_update_reclamation_status()
    {
        $reclamation = Reclamation::factory()->create(['statut' => 'en_attente']);

        $this->actingAs($this->admin)
            ->patch(route('admin.reclamations.status', $reclamation), [
                'statut' => 'resolue',
                'response' => 'Problème résolu.',
            ]);

        $reclamation->refresh();
        $this->assertEquals('resolue', $reclamation->statut);
        $this->assertEquals('Problème résolu.', $reclamation->response);
        $this->assertNotNull($reclamation->treated_at);
    }

    public function test_create_reclamation_requires_validation()
    {
        $response = $this->actingAs($this->admin)
            ->post(route('admin.reclamations.store'), []);

        $response->assertSessionHasErrors(['client_name', 'client_phone', 'type', 'description']);
    }
}
