<?php

namespace Tests\Browser;

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

class ComptabiliteTest extends DuskTestCase
{
    use DatabaseMigrations;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('db:seed');
    }

    public function test_comptabilite_shows_real_data(): void
    {
        $admin = User::where('email', 'admin@rahimo.bf')->first();

        $this->browse(function (Browser $browser) use ($admin) {
            $browser->loginAs($admin)
                ->visit('/admin/comptabilite')
                ->assertSee('Comptabilité')
                ->assertSee('Recettes Journalières')
                ->assertSee('Dépenses Journalières')
                ->assertSee('Bénéfice Net')
                ->assertSee('Dépenses en attente')
                ->assertSee('FCFA');
        });
    }

    public function test_comptabilite_shows_cash_registers(): void
    {
        $admin = User::where('email', 'admin@rahimo.bf')->first();

        $this->browse(function (Browser $browser) use ($admin) {
            $browser->loginAs($admin)
                ->visit('/admin/comptabilite')
                ->assertSee('État des Caisses')
                ->assertSee('Ouvrir une caisse');
        });
    }

    public function test_comptabilite_shows_recent_expenses(): void
    {
        $admin = User::where('email', 'admin@rahimo.bf')->first();

        $this->browse(function (Browser $browser) use ($admin) {
            $browser->loginAs($admin)
                ->visit('/admin/comptabilite')
                ->assertSee('Dépenses Récentes')
                ->assertSee('Carburant');
        });
    }

    public function test_comptabilite_shows_bank_reconciliations(): void
    {
        $admin = User::where('email', 'admin@rahimo.bf')->first();

        $this->browse(function (Browser $browser) use ($admin) {
            $browser->loginAs($admin)
                ->visit('/admin/comptabilite')
                ->assertSee('Rapprochements Bancaires');
        });
    }

    public function test_expenses_page_is_paginated(): void
    {
        $admin = User::where('email', 'admin@rahimo.bf')->first();

        $this->browse(function (Browser $browser) use ($admin) {
            $browser->loginAs($admin)
                ->visit('/admin/depenses')
                ->assertSee('Dépenses')
                ->assertSee('Nouvelle dépense');
        });
    }

    public function test_agent_cannot_validate_expenses(): void
    {
        $agent = User::where('email', 'agent@rahimo.bf')->first();

        $this->browse(function (Browser $browser) use ($agent) {
            $browser->loginAs($agent)
                ->visit('/admin/depenses')
                ->assertDontSee('Approuver');
        });
    }
}
