<?php

namespace Tests\Browser;

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

class ServicesTest extends DuskTestCase
{
    use DatabaseMigrations;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('db:seed');
    }

    public function test_parking_page_loads_with_stats(): void
    {
        $admin = User::where('email', 'admin@rahimo.bf')->first();

        $this->browse(function (Browser $browser) use ($admin) {
            $browser->loginAs($admin)
                ->visit('/admin/services/parking')
                ->assertSee('Parking')
                ->assertSee('Nouveau stationnement');
        });
    }

    public function test_rental_page_loads(): void
    {
        $admin = User::where('email', 'admin@rahimo.bf')->first();

        $this->browse(function (Browser $browser) use ($admin) {
            $browser->loginAs($admin)
                ->visit('/admin/services/location')
                ->assertSee('Location')
                ->assertSee('Nouvelle location');
        });
    }

    public function test_accommodation_page_loads(): void
    {
        $admin = User::where('email', 'admin@rahimo.bf')->first();

        $this->browse(function (Browser $browser) use ($admin) {
            $browser->loginAs($admin)
                ->visit('/admin/services/hebergement')
                ->assertSee('Hébergement')
                ->assertSee('Nouvelle réservation');
        });
    }

    public function test_moto_transport_page_loads(): void
    {
        $admin = User::where('email', 'admin@rahimo.bf')->first();

        $this->browse(function (Browser $browser) use ($admin) {
            $browser->loginAs($admin)
                ->visit('/admin/services/moto-transport')
                ->assertSee('Transport')
                ->assertSee('Nouveau transport');
        });
    }
}
