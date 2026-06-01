<?php

namespace App\Http\Controllers;

use App\Models\BankReconciliation;
use App\Models\Booking;
use App\Models\Budget;
use App\Models\CashRegister;
use App\Models\Expense;
use App\Models\Invoice;
use App\Models\JournalEntry;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FinanceController extends Controller
{
    public function comptabilite()
    {
        $today = Carbon::today();
        $startOfMonth = Carbon::now()->startOfMonth();

        $recettes = Booking::forCurrentCompany()->where('payment_status', 'paid')
            ->whereDate('created_at', $today)
            ->sum('total_price');

        $recettesMois = Booking::forCurrentCompany()->where('payment_status', 'paid')
            ->whereDate('created_at', '>=', $startOfMonth)
            ->sum('total_price');

        $depensesJournalieres = Expense::where('status', 'approved')
            ->whereDate('expense_date', $today)
            ->sum('amount');

        $depensesMensuelles = Expense::where('status', 'approved')
            ->whereDate('expense_date', '>=', $startOfMonth)
            ->sum('amount');

        $depensesEnAttente = Expense::where('status', 'pending')->count();

        $stats = [
            'recettes_journalieres' => (float) $recettes,
            'recettes_mensuelles' => (float) $recettesMois,
            'depenses_journalieres' => (float) $depensesJournalieres,
            'depenses_mensuelles' => (float) $depensesMensuelles,
            'depenses_en_attente' => $depensesEnAttente,
            'benefice_journalier' => (float) ($recettes - $depensesJournalieres),
            'recettes_par_source' => [
                'guichet' => (float) Booking::forCurrentCompany()->where('payment_method', 'cash')->whereDate('created_at', $today)->sum('total_price'),
                'orange_money' => (float) Booking::forCurrentCompany()->where('payment_method', 'mobile_money')->whereDate('created_at', $today)->sum('total_price'),
                'moov_money' => 0,
            ],
        ];

        $recettesParService = [
            'parking' => (float) \App\Models\Parking::where('status', 'termine')->whereDate('updated_at', $today)->sum('amount'),
            'location' => (float) \App\Models\Rental::where('status', 'termine')->whereDate('updated_at', $today)->sum('total_amount'),
            'hebergement' => (float) \App\Models\Accommodation::where('status', 'termine')->whereDate('updated_at', $today)->sum('total_amount'),
            'moto_transport' => (float) \App\Models\MotoTransport::where('status', 'livre')->whereDate('updated_at', $today)->sum('amount'),
        ];

        return Inertia::render('Admin/Comptabilite', [
            'stats' => $stats,
            'recettes_par_service' => $recettesParService,
            'depenses_par_categorie' => Expense::where('status', 'approved')
                ->whereDate('expense_date', '>=', $startOfMonth)
                ->groupBy('category')
                ->selectRaw('category, SUM(amount) as total')
                ->pluck('total', 'category'),
            'depenses_recentes' => Expense::with('user')
                ->latest()
                ->take(10)
                ->get()
                ->map(fn ($e) => [
                    'id' => $e->id,
                    'category' => $e->category,
                    'description' => $e->description,
                    'amount' => (float) $e->amount,
                    'status' => $e->status,
                    'user' => $e->user?->name,
                    'expense_date' => $e->expense_date?->format('Y-m-d'),
                    'created_at' => $e->created_at->format('Y-m-d H:i'),
                ]),
            'caisses' => CashRegister::with('user')
                ->latest()
                ->take(10)
                ->get()
                ->map(fn ($c) => [
                    'id' => $c->id,
                    'user' => $c->user?->name,
                    'opened_at' => $c->opened_at->format('Y-m-d H:i'),
                    'closed_at' => $c->closed_at?->format('Y-m-d H:i'),
                    'opening_balance' => (float) $c->opening_balance,
                    'closing_balance' => (float) $c->closing_balance,
                    'expected_balance' => (float) $c->expected_balance,
                    'difference' => (float) $c->difference,
                    'status' => $c->status,
                    'notes' => $c->notes,
                ]),
            'reconciliations' => BankReconciliation::with('user')
                ->latest()
                ->take(5)
                ->get()
                ->map(fn ($r) => [
                    'id' => $r->id,
                    'user' => $r->user?->name,
                    'account_name' => $r->account_name,
                    'account_number' => $r->account_number,
                    'statement_balance' => (float) $r->statement_balance,
                    'system_balance' => (float) $r->system_balance,
                    'difference' => (float) $r->difference,
                    'status' => $r->status,
                    'reconciled_at' => $r->reconciled_at?->format('Y-m-d H:i'),
                    'notes' => $r->notes,
                ]),
        ]);
    }

    public function expenses()
    {
        $expenses = Expense::with('user', 'validator')
            ->latest()
            ->paginate(20)
            ->through(fn ($e) => [
                'id' => $e->id,
                'category' => $e->category,
                'description' => $e->description,
                'amount' => (float) $e->amount,
                'status' => $e->status,
                'user' => $e->user?->name,
                'validated_by' => $e->validator?->name,
                'validated_at' => $e->validated_at?->format('Y-m-d H:i'),
                'expense_date' => $e->expense_date?->format('Y-m-d'),
                'notes' => $e->notes,
                'created_at' => $e->created_at->format('Y-m-d H:i'),
            ]);

        return Inertia::render('Admin/Finance/Expenses', [
            'expenses' => $expenses,
        ]);
    }

    public function expensesStore(Request $request)
    {
        $validated = $request->validate([
            'category' => 'required|in:' . implode(',', Expense::CATEGORIES),
            'description' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'expense_date' => 'required|date',
            'notes' => 'nullable|string',
        ]);

        $validated['user_id'] = $request->user()->id;
        $validated['status'] = Expense::STATUS_PENDING;

        Expense::create($validated);

        return redirect()->back()->with('success', 'Dépense enregistrée en attente de validation');
    }

    public function expensesValidate(Request $request, Expense $expense)
    {
        $validated = $request->validate([
            'status' => 'required|in:approved,rejected',
            'notes' => 'nullable|string',
        ]);

        $expense->update([
            'status' => $validated['status'],
            'validated_by' => $request->user()->id,
            'validated_at' => now(),
            'notes' => $validated['notes'] ?? $expense->notes,
        ]);

        $msg = $validated['status'] === 'approved' ? 'Dépense approuvée' : 'Dépense rejetée';

        return redirect()->back()->with('success', $msg);
    }

    public function caissesOuvrir(Request $request)
    {
        // Check no open cash register exists for this user
        $open = CashRegister::where('user_id', $request->user()->id)
            ->where('status', 'open')
            ->first();

        if ($open) {
            return redirect()->back()->with('error', 'Vous avez déjà une caisse ouverte');
        }

        $validated = $request->validate([
            'opening_balance' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        CashRegister::create([
            'user_id' => $request->user()->id,
            'opened_at' => now(),
            'opening_balance' => $validated['opening_balance'],
            'notes' => $validated['notes'] ?? null,
            'status' => 'open',
        ]);

        return redirect()->back()->with('success', 'Caisse ouverte');
    }

    public function caissesFermer(Request $request, CashRegister $cashRegister)
    {
        $validated = $request->validate([
            'closing_balance' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $expected = $cashRegister->opening_balance;
        $difference = (float) $validated['closing_balance'] - (float) $expected;

        $cashRegister->update([
            'closed_at' => now(),
            'closing_balance' => $validated['closing_balance'],
            'expected_balance' => $expected,
            'difference' => $difference,
            'status' => 'closed',
            'notes' => $validated['notes'] ?? $cashRegister->notes,
        ]);

        return redirect()->back()->with('success', 'Caisse fermée');
    }

    public function reconciliationsStore(Request $request)
    {
        $validated = $request->validate([
            'account_name' => 'required|string|max:255',
            'account_number' => 'required|string|max:50',
            'statement_balance' => 'required|numeric',
            'system_balance' => 'required|numeric',
            'notes' => 'nullable|string',
        ]);

        $validated['user_id'] = $request->user()->id;
        $validated['difference'] = $validated['statement_balance'] - $validated['system_balance'];
        $validated['status'] = abs($validated['difference']) < 0.01
            ? BankReconciliation::STATUS_RECONCILED
            : BankReconciliation::STATUS_DISCREPANCY;
        $validated['reconciled_at'] = now();

        BankReconciliation::create($validated);

        return redirect()->back()->with('success', 'Rapprochement bancaire enregistré');
    }

    // ─── Factures ──────────────────────────────────────────────────────

    public function facturesIndex()
    {
        $factures = Invoice::latest()->get()->map(fn ($f) => [
            'id' => $f->id,
            'invoice_number' => $f->invoice_number,
            'type' => $f->type,
            'client_name' => $f->client_name,
            'issue_date' => $f->issue_date->format('Y-m-d'),
            'due_date' => $f->due_date->format('Y-m-d'),
            'subtotal' => (float) $f->subtotal,
            'tax_amount' => (float) $f->tax_amount,
            'total' => (float) $f->total,
            'status' => $f->status,
            'paid_at' => $f->paid_at?->format('Y-m-d'),
        ]);

        $stats = [
            'total_impaye' => (float) Invoice::whereIn('status', ['sent', 'overdue'])->sum('total'),
            'total_encaisse' => (float) Invoice::where('status', 'paid')->sum('total'),
            'nb_impayees' => Invoice::whereIn('status', ['sent', 'overdue'])->count(),
        ];

        return Inertia::render('Admin/Finance/Factures', compact('factures', 'stats'));
    }

    public function facturesStore(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:sale,purchase,expense,credit_note',
            'client_name' => 'required|string',
            'client_phone' => 'nullable|string',
            'client_address' => 'nullable|string',
            'issue_date' => 'required|date',
            'due_date' => 'required|date|after_or_equal:issue_date',
            'subtotal' => 'required|numeric|min:0',
            'tax_rate' => 'nullable|numeric|min:0|max:100',
            'notes' => 'nullable|string',
        ]);

        $validated['tax_rate'] ??= 0;
        $validated['tax_amount'] = $validated['subtotal'] * $validated['tax_rate'] / 100;
        $validated['total'] = $validated['subtotal'] + $validated['tax_amount'];
        $validated['invoice_number'] = 'FACT-' . strtoupper(\Str::random(8));
        $validated['status'] = 'draft';

        Invoice::create($validated);

        return redirect()->route('admin.finance.factures')->with('success', 'Facture créée.');
    }

    public function facturesPayer(Invoice $invoice)
    {
        $invoice->update(['status' => 'paid', 'paid_at' => now()]);
        return redirect()->route('admin.finance.factures')->with('success', 'Facture marquée comme payée.');
    }

    public function facturesAnnuler(Invoice $invoice)
    {
        $invoice->update(['status' => 'cancelled']);
        return redirect()->route('admin.finance.factures')->with('success', 'Facture annulée.');
    }

    // ─── Grand-Livre ───────────────────────────────────────────────────

    public function grandLivre()
    {
        $entries = JournalEntry::latest('entry_date')->take(200)->get()->map(fn ($j) => [
            'id' => $j->id,
            'reference' => $j->reference,
            'entry_date' => $j->entry_date->format('Y-m-d'),
            'account_code' => $j->account_code,
            'account_label' => $j->account_label,
            'debit' => (float) $j->debit,
            'credit' => (float) $j->credit,
            'description' => $j->description,
            'journal_type' => $j->journal_type,
        ]);

        $totalDebit = $entries->sum('debit');
        $totalCredit = $entries->sum('credit');

        $balances = $entries->groupBy('account_code')->map(function ($items, $code) {
            $first = $items->first();
            $debit = $items->sum('debit');
            $credit = $items->sum('credit');
            return [
                'account_code' => $code,
                'account_label' => $first['account_label'],
                'debit' => $debit,
                'credit' => $credit,
                'balance' => $debit - $credit,
            ];
        })->values();

        return Inertia::render('Admin/Finance/GrandLivre', compact('entries', 'totalDebit', 'totalCredit', 'balances'));
    }

    // ─── Bilan / P&L ───────────────────────────────────────────────────

    public function bilan()
    {
        $startOfMonth = Carbon::now()->startOfMonth();
        $endOfMonth = Carbon::now()->endOfMonth();

        $revenus = [
            'tickets' => (float) Booking::forCurrentCompany()->where('payment_status', 'paid')
                ->whereDate('created_at', '>=', $startOfMonth)
                ->whereDate('created_at', '<=', $endOfMonth)
                ->sum('total_price'),
            'colis' => (float) \App\Models\Colis::whereDate('created_at', '>=', $startOfMonth)
                ->sum('price'),
            'parking' => (float) \App\Models\Parking::whereDate('created_at', '>=', $startOfMonth)->sum('amount'),
            'location' => (float) \App\Models\Rental::whereDate('created_at', '>=', $startOfMonth)->sum('total_amount'),
            'hebergement' => (float) \App\Models\Accommodation::whereDate('created_at', '>=', $startOfMonth)->sum('total_amount'),
            'moto' => (float) \App\Models\MotoTransport::whereDate('created_at', '>=', $startOfMonth)->sum('amount'),
        ];

        $totalRevenus = array_sum($revenus);

        $depenses = Expense::where('status', 'approved')
            ->whereDate('expense_date', '>=', $startOfMonth)
            ->whereDate('expense_date', '<=', $endOfMonth)
            ->sum('amount');

        $masseSalariale = (float) \App\Models\PaySlip::where('period', Carbon::now()->format('Y-m'))->sum('net_salary');

        $totalDepenses = (float) $depenses + $masseSalariale;
        $resultatNet = $totalRevenus - $totalDepenses;

        $depensesParCategorie = Expense::where('status', 'approved')
            ->whereDate('expense_date', '>=', $startOfMonth)
            ->groupBy('category')
            ->selectRaw('category, SUM(amount) as total')
            ->pluck('total', 'category');

        return Inertia::render('Admin/Finance/Bilan', compact(
            'revenus', 'totalRevenus', 'depenses', 'masseSalariale', 'totalDepenses', 'resultatNet', 'depensesParCategorie'
        ));
    }

    // ─── Budgets ───────────────────────────────────────────────────────

    public function budgetsIndex()
    {
        $budgets = Budget::latest()->get()->map(fn ($b) => [
            'id' => $b->id,
            'label' => $b->label,
            'period_type' => $b->period_type,
            'period' => $b->period,
            'total_amount' => (float) $b->total_amount,
            'spent_amount' => (float) $b->spent_amount,
            'remaining' => (float) ($b->total_amount - $b->spent_amount),
            'utilization' => $b->total_amount > 0 ? round($b->spent_amount / $b->total_amount * 100, 1) : 0,
            'status' => $b->status,
        ]);

        return Inertia::render('Admin/Finance/Budgets', compact('budgets'));
    }

    public function budgetsStore(Request $request)
    {
        $validated = $request->validate([
            'label' => 'required|string',
            'period_type' => 'required|in:monthly,quarterly,yearly',
            'period' => 'required|string',
            'total_amount' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        Budget::create($validated + ['spent_amount' => 0, 'status' => 'draft']);

        return redirect()->route('admin.finance.budgets')->with('success', 'Budget créé.');
    }
}
