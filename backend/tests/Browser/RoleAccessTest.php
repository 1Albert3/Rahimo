<?php

namespace Tests\Browser;

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

class RoleAccessTest extends DuskTestCase
{
    use DatabaseMigrations;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('db:seed');
    }

    public function test_directeur_general_can_access_all_admin_pages(): void
    {
        $admin = User::where('email', 'dg@rahimo.bf')->first();

        $this->browse(function (Browser $browser) use ($admin) {
            $browser->loginAs($admin)
                ->visit('/admin/dashboard')->assertSee('Tableau de bord')
                ->visit('/admin/guichet')->assertSee('Guichet')
                ->visit('/admin/colis')->assertSee('Colis')
                ->visit('/admin/departs')->assertSee('Départs')
                ->visit('/admin/flotte')->assertSee('Flotte')
                ->visit('/admin/embarquement')->assertSee('Embarquement')
                ->visit('/admin/personnel')->assertSee('Personnel')
                ->visit('/admin/formations')->assertSee('Formations')
                ->visit('/admin/comptabilite')->assertSee('Comptabilité')
                ->visit('/admin/depenses')->assertSee('Dépenses')
                ->visit('/admin/reclamations')->assertSee('Réclamations')
                ->visit('/admin/alertes')->assertSee('Alertes')
                ->visit('/admin/securite')->assertSee('Sécurité')
                ->visit('/admin/rapports')->assertSee('Rapports');
        });
    }

    public function test_guichetiere_cannot_access_admin_only_pages(): void
    {
        $agent = User::where('email', 'guichet@rahimo.bf')->first();

        $this->browse(function (Browser $browser) use ($agent) {
            $browser->loginAs($agent)
                // Admin-only pages should return 403
                ->visit('/admin/personnel')
                ->assertSee('403')
                ->visit('/admin/securite')
                ->assertSee('403');
        });
    }

    public function test_guichetiere_can_access_staff_pages(): void
    {
        $agent = User::where('email', 'guichet@rahimo.bf')->first();

        $this->browse(function (Browser $browser) use ($agent) {
            $browser->loginAs($agent)
                ->visit('/admin/dashboard')->assertSee('Tableau de bord')
                ->visit('/admin/guichet')->assertSee('Guichet')
                ->visit('/admin/colis')->assertSee('Colis')
                ->visit('/admin/comptabilite')->assertSee('Comptabilité')
                ->visit('/admin/reclamations')->assertSee('Réclamations');
        });
    }

    public function test_chauffeur_cannot_access_admin_pages(): void
    {
        $driver = User::where('role', 'chauffeur')->first();

        $this->browse(function (Browser $browser) use ($driver) {
            $browser->loginAs($driver)
                ->visit('/admin/dashboard')
                ->assertSee('403');
        });
    }

    public function test_chauffeur_can_access_driver_pages(): void
    {
        $driver = User::where('role', 'chauffeur')->first();

        $this->browse(function (Browser $browser) use ($driver) {
            $browser->loginAs($driver)
                ->visit('/chauffeur/trajets')
                ->assertSee('Mes Trajets')
                ->visit('/chauffeur/formations')
                ->assertSee('Formations')
                ->visit('/chauffeur/alertes')
                ->assertSee('Alertes');
        });
    }

    public function test_client_cannot_access_admin_pages(): void
    {
        $client = User::where('email', 'client@rahimo.bf')->first();

        $this->browse(function (Browser $browser) use ($client) {
            $browser->loginAs($client)
                ->visit('/admin/dashboard')
                ->assertSee('403');
        });
    }

    public function test_client_can_access_own_space(): void
    {
        $client = User::where('email', 'client@rahimo.bf')->first();

        $this->browse(function (Browser $browser) use ($client) {
            $browser->loginAs($client)
                ->visit('/mon-espace')
                ->assertSee('Mon');
        });
    }
}
