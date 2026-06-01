<?php

namespace Tests\Browser;

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

class LoginTest extends DuskTestCase
{
    use DatabaseMigrations;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('db:seed');
    }

    public function test_admin_redirected_to_admin_dashboard(): void
    {
        $admin = User::where('email', 'dg@rahimo.bf')->first();

        $this->browse(function (Browser $browser) use ($admin) {
            $browser->visit('/login')
                ->type('email', $admin->email)
                ->type('password', 'password')
                ->press('CONNEXION')
                ->waitForLocation('/admin/dashboard', 5)
                ->assertPathIs('/admin/dashboard')
                ->assertSee('Rahimo Admin');
        });
    }

    public function test_directeur_general_redirected_to_admin_dashboard(): void
    {
        $dg = User::where('email', 'dg@rahimo.bf')->first();

        $this->browse(function (Browser $browser) use ($dg) {
            $browser->visit('/login')
                ->type('email', $dg->email)
                ->type('password', 'password')
                ->press('CONNEXION')
                ->waitForLocation('/admin/dashboard', 5)
                ->assertPathIs('/admin/dashboard');
        });
    }

    public function test_guichetiere_redirected_to_admin_dashboard(): void
    {
        $guichet = User::where('email', 'guichet@rahimo.bf')->first();

        $this->browse(function (Browser $browser) use ($guichet) {
            $browser->visit('/login')
                ->type('email', $guichet->email)
                ->type('password', 'password')
                ->press('CONNEXION')
                ->waitForLocation('/admin/dashboard', 5)
                ->assertPathIs('/admin/dashboard');
        });
    }

    public function test_client_redirected_to_client_dashboard(): void
    {
        $client = User::where('email', 'client@rahimo.bf')->first();

        $this->browse(function (Browser $browser) use ($client) {
            $browser->visit('/login')
                ->type('email', $client->email)
                ->type('password', 'password')
                ->press('CONNEXION')
                ->waitForLocation('/mon-espace', 5)
                ->assertPathIs('/mon-espace');
        });
    }

    public function test_chauffeur_redirected_to_driver_trips(): void
    {
        $driver = User::where('role', 'chauffeur')->first();

        $this->browse(function (Browser $browser) use ($driver) {
            $browser->visit('/login')
                ->type('email', $driver->email)
                ->type('password', 'password')
                ->press('CONNEXION')
                ->waitForLocation('/chauffeur/trajets', 5)
                ->assertPathIs('/chauffeur/trajets')
                ->assertSee('Mes Trajets');
        });
    }
}
