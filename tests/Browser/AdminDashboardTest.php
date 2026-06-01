<?php

namespace Tests\Browser;

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

class AdminDashboardTest extends DuskTestCase
{
    use DatabaseMigrations;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('db:seed');
    }

    public function test_admin_dashboard_shows_kpis(): void
    {
        $admin = User::where('email', 'admin@rahimo.bf')->first();

        $this->browse(function (Browser $browser) use ($admin) {
            $browser->loginAs($admin)
                ->visit('/admin/dashboard')
                ->assertSee('Trajets')
                ->assertSee('Réservations')
                ->assertSee('Revenus')
                ->assertSee('Véhicules');
        });
    }

    public function test_admin_dashboard_shows_sidebar(): void
    {
        $admin = User::where('email', 'admin@rahimo.bf')->first();

        $this->browse(function (Browser $browser) use ($admin) {
            $browser->loginAs($admin)
                ->visit('/admin/dashboard')
                ->assertSee('Rahimo Admin')
                ->assertSee('Tableau de bord')
                ->assertSee('Billetterie')
                ->assertSee('Flotte GPS')
                ->assertSee('Personnel')
                ->assertSee('Comptabilité')
                ->assertSee('Sécurité')
                ->assertSee('Rapports');
        });
    }

    public function test_agent_sidebar_has_limited_items(): void
    {
        $agent = User::where('email', 'agent@rahimo.bf')->first();

        $this->browse(function (Browser $browser) use ($agent) {
            $browser->loginAs($agent)
                ->visit('/admin/dashboard')
                ->assertSee('Tableau de bord')
                ->assertSee('Billetterie')
                ->assertDontSee('Flotte GPS')
                ->assertDontSee('Personnel')
                ->assertDontSee('Sécurité')
                ->assertDontSee('Rapports');
        });
    }

    public function test_manifeste_page_shows_departures(): void
    {
        $admin = User::where('email', 'admin@rahimo.bf')->first();

        $this->browse(function (Browser $browser) use ($admin) {
            $browser->loginAs($admin)
                ->visit('/admin/departs')
                ->assertSee('Départs')
                ->assertSee('Bus')
                ->assertSee('Passagers');
        });
    }
}
