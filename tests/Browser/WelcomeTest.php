<?php

namespace Tests\Browser;

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

class WelcomeTest extends DuskTestCase
{
    use DatabaseMigrations;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('db:seed');
    }

    public function test_welcome_page_loads(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->visit('/')
                ->assertSee('Rahimo Transport')
                ->assertSee('Acheter un ticket')
                ->assertSee('Accès personnel');
        });
    }

    public function test_trip_search_page(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->visit('/voyages')
                ->assertSee('Rechercher');
        });
    }

    public function test_parcel_tracking_page(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->visit('/colis/suivi')
                ->assertSee('Suivi');
        });
    }
}
