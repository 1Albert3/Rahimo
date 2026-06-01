<?php

namespace Database\Seeders;

use App\Models\BankReconciliation;
use App\Models\CashRegister;
use App\Models\Expense;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class Phase4Seeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('email', 'admin@rahimo.bf')->first();
        $agent = User::where('email', 'agent@rahimo.bf')->first();
        $users = User::staff()->get();
        if ($users->isEmpty()) $users = User::all();

        // ── Dépenses ────────────────────────────────────────────────────
        $expenseData = [
            ['carburant', 'Plein essence 3 véhicules', 145000, 'approved', null],
            ['salaires', 'Salaires journaliers chauffeurs', 620000, 'approved', null],
            ['maintenance', 'Révision Hilux 12A-345-BF', 185000, 'approved', null],
            ['peages_taxes', 'Péages et taxes diverses', 92000, 'approved', null],
            ['fournitures', 'Fournitures de bureau', 45000, 'pending', null],
            ['carburant', 'Plein Mercedes Sprinter', 82000, 'approved', null],
            ['maintenance', 'Changement pneus Isuzu D-Max', 210000, 'pending', null],
            ['marketing', 'Campagne pub radio', 150000, 'approved', null],
            ['assurance', 'Assurance flotte 2026', 350000, 'pending', null],
            ['carburant', 'Plein bus 56J-789-BF', 95000, 'approved', null],
        ];

        foreach ($expenseData as $i => [$cat, $desc, $amount, $status, $notes]) {
            $expense = Expense::create([
                'user_id' => $users->random()->id,
                'category' => $cat,
                'description' => $desc,
                'amount' => $amount,
                'status' => $status,
                'expense_date' => Carbon::now()->subDays(rand(0, 10)),
                'notes' => $notes,
            ]);

            if ($status === 'approved') {
                $expense->update([
                    'validated_by' => $admin?->id ?? $users->random()->id,
                    'validated_at' => Carbon::now()->subDays(rand(0, 5)),
                ]);
            }
        }

        // ── Caisses ─────────────────────────────────────────────────────
        $caisseData = [
            [500000, 648000, 648000, 0, 'closed'],
            [300000, 462000, 462000, 0, 'closed'],
            [450000, 475400, 500800, -25400, 'closed'],
            [350000, null, null, null, 'open'],
        ];

        foreach ($caisseData as [$opening, $closing, $expected, $diff, $status]) {
            $caisse = CashRegister::create([
                'user_id' => $agent?->id ?? $users->random()->id,
                'opened_at' => Carbon::now()->subDays(rand(1, 5)),
                'status' => $status,
                'opening_balance' => $opening,
            ]);

            if ($status === 'closed') {
                $caisse->update([
                    'closed_at' => Carbon::now()->subDays(rand(0, 3)),
                    'closing_balance' => $closing,
                    'expected_balance' => $expected,
                    'difference' => $diff,
                ]);
            }
        }

        // ── Rapprochement bancaire ──────────────────────────────────────
        $reconciliationData = [
            ['Compte Principal', 'BF01 2345 6789 0123', 12500000, 12480000, 'reconciled'],
            ['Compte Recettes', 'BF01 9876 5432 1098', 4800000, 4850000, 'discrepancy'],
        ];

        foreach ($reconciliationData as [$name, $number, $statement, $system, $status]) {
            BankReconciliation::create([
                'user_id' => $admin?->id ?? $users->random()->id,
                'account_name' => $name,
                'account_number' => $number,
                'statement_balance' => $statement,
                'system_balance' => $system,
                'difference' => $statement - $system,
                'status' => $status,
                'reconciled_at' => Carbon::now()->subDays(rand(0, 5)),
            ]);
        }
    }
}
