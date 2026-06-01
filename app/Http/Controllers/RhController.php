<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Contract;
use App\Models\EmployeeDocument;
use App\Models\Leave;
use App\Models\PaySlip;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class RhController extends Controller
{
    public function dashboard()
    {
        $total = User::forCurrentCompany()->staff()->count();
        $actifs = User::forCurrentCompany()->staff()->where('is_active', true)->count();
        $chauffeurs = User::forCurrentCompany()->chauffeurs()->where('is_active', true)->count();
        $agents = User::forCurrentCompany()->whereIn('role', ['guichetiere', 'agent_police', 'bagagiste', 'chef_garde', 'comptable', 'responsable_flotte'])->where('is_active', true)->count();

        $today = Carbon::today();
        $presences = Attendance::where('date', $today)->where('status', 'present')->count();
        $absences = Attendance::where('date', $today)->where('status', 'absent')->count();
        $congesEnCours = Leave::where('status', 'approved')
            ->where('start_date', '<=', $today)
            ->where('end_date', '>=', $today)
            ->count();

        $contratsExpirant = Contract::where('is_active', true)
            ->whereNotNull('end_date')
            ->where('end_date', '<=', $today->copy()->addDays(30))
            ->where('end_date', '>=', $today)
            ->count();

        $masseSalariale = PaySlip::where('period', $today->format('Y-m'))->sum('net_salary');

        return Inertia::render('Admin/Rh/Dashboard', compact(
            'total', 'actifs', 'chauffeurs', 'agents',
            'presences', 'absences', 'congesEnCours',
            'contratsExpirant', 'masseSalariale',
        ));
    }

    // ─── Personnel ─────────────────────────────────────────────────────

    public function personnel()
    {
        $personnel = User::forCurrentCompany()->whereIn('role', ['chauffeur', 'guichetiere', 'agent_police', 'bagagiste', 'chef_garde', 'comptable', 'responsable_flotte'])
            ->withCount(['contracts' => fn ($q) => $q->where('is_active', true)])
            ->get()->map(fn ($u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'phone' => $u->phone,
                'city' => $u->city,
                'role' => $u->role,
                'is_active' => $u->is_active,
                'contract_type' => $u->contracts->first()?->type,
                'contract_end' => $u->contracts->first()?->end_date?->format('Y-m-d'),
            ]);

        return Inertia::render('Admin/Rh/Personnel', compact('personnel'));
    }

    public function personnelShow(User $user)
    {
        $employe = [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'city' => $user->city,
            'role' => $user->role,
            'is_active' => $user->is_active,
            'driver_license_number' => $user->driver_license_number,
            'license_expiry_date' => $user->license_expiry_date?->format('Y-m-d'),
        ];

        $contrats = Contract::where('user_id', $user->id)->get()->map(fn ($c) => [
            'id' => $c->id,
            'type' => $c->type,
            'start_date' => $c->start_date->format('Y-m-d'),
            'end_date' => $c->end_date?->format('Y-m-d'),
            'salary_base' => (float) $c->salary_base,
            'is_active' => $c->is_active,
        ]);

        $documents = EmployeeDocument::where('user_id', $user->id)->get();

        $stats = [
            'total_leave_days' => (int) Leave::where('user_id', $user->id)
                ->where('status', 'approved')->sum(DB::raw('DATEDIFF(end_date, start_date) + 1')),
            'total_absences' => (int) Attendance::where('user_id', $user->id)
                ->where('status', 'absent')->count(),
            'monthly_salary' => (float) PaySlip::where('user_id', $user->id)
                ->latest()->first()?->net_salary ?? 0,
        ];

        return Inertia::render('Admin/Rh/EmployeShow', compact('employe', 'contrats', 'documents', 'stats'));
    }

    // ─── Contrats ──────────────────────────────────────────────────────

    public function contratsIndex()
    {
        $contrats = Contract::with('user')->latest()->get()->map(fn ($c) => [
            'id' => $c->id,
            'employe' => $c->user?->name,
            'type' => $c->type,
            'start_date' => $c->start_date->format('Y-m-d'),
            'end_date' => $c->end_date?->format('Y-m-d'),
            'salary_base' => (float) $c->salary_base,
            'transport_allowance' => (float) $c->transport_allowance,
            'housing_allowance' => (float) $c->housing_allowance,
            'other_allowances' => (float) $c->other_allowances,
            'is_active' => $c->is_active,
        ]);

        $employes = User::forCurrentCompany()->whereIn('role', ['chauffeur', 'guichetiere', 'agent_police', 'bagagiste', 'chef_garde', 'comptable', 'responsable_flotte'])->get()->map(fn ($u) => [
            'id' => $u->id,
            'name' => $u->name,
        ]);

        return Inertia::render('Admin/Rh/Contrats', compact('contrats', 'employes'));
    }

    public function contratsStore(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'type' => 'required|in:cdi,cdd,stage,prestation,saisonnier',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after:start_date',
            'salary_base' => 'required|numeric|min:0',
            'transport_allowance' => 'nullable|numeric|min:0',
            'housing_allowance' => 'nullable|numeric|min:0',
            'other_allowances' => 'nullable|numeric|min:0',
            'duties' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        Contract::create($validated);

        return redirect()->route('admin.rh.contrats')->with('success', 'Contrat créé.');
    }

    public function contratsUpdate(Request $request, Contract $contract)
    {
        $validated = $request->validate([
            'type' => 'required|in:cdi,cdd,stage,prestation,saisonnier',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after:start_date',
            'salary_base' => 'required|numeric|min:0',
            'transport_allowance' => 'nullable|numeric|min:0',
            'housing_allowance' => 'nullable|numeric|min:0',
            'other_allowances' => 'nullable|numeric|min:0',
            'duties' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $contract->update($validated);

        return redirect()->route('admin.rh.contrats')->with('success', 'Contrat mis à jour.');
    }

    // ─── Congés ────────────────────────────────────────────────────────

    public function congesIndex()
    {
        $conges = Leave::with('user', 'approver')->latest()->get()->map(fn ($l) => [
            'id' => $l->id,
            'employe' => $l->user?->name,
            'type' => $l->type,
            'start_date' => $l->start_date->format('Y-m-d'),
            'end_date' => $l->end_date->format('Y-m-d'),
            'days' => $l->start_date->diffInDays($l->end_date) + 1,
            'reason' => $l->reason,
            'status' => $l->status,
            'approved_by' => $l->approver?->name,
            'created_at' => $l->created_at->format('Y-m-d H:i'),
        ]);

        $employes = User::forCurrentCompany()->whereIn('role', ['chauffeur', 'guichetiere', 'agent_police', 'bagagiste', 'chef_garde', 'comptable', 'responsable_flotte'])->get()->map(fn ($u) => [
            'id' => $u->id,
            'name' => $u->name,
        ]);

        return Inertia::render('Admin/Rh/Conges', compact('conges', 'employes'));
    }

    public function congesStore(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'type' => 'required|in:annual,sick,special,unpaid,maternity',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'reason' => 'required|string',
        ]);

        Leave::create($validated + ['status' => 'pending']);

        return redirect()->route('admin.rh.conges')->with('success', 'Demande de congé créée.');
    }

    public function congesApprouver(Leave $leave)
    {
        $leave->update([
            'status' => 'approved',
            'approved_by' => request()->user()->id,
            'approved_at' => now(),
        ]);

        return redirect()->route('admin.rh.conges')->with('success', 'Congé approuvé.');
    }

    public function congesRejeter(Request $request, Leave $leave)
    {
        $leave->update([
            'status' => 'rejected',
            'approved_by' => request()->user()->id,
            'rejection_reason' => $request->input('reason', ''),
        ]);

        return redirect()->route('admin.rh.conges')->with('success', 'Congé rejeté.');
    }

    // ─── Pointage ──────────────────────────────────────────────────────

    public function pointageIndex()
    {
        $today = Carbon::today();

        $pointage = User::forCurrentCompany()->whereIn('role', ['chauffeur', 'guichetiere', 'agent_police', 'bagagiste', 'chef_garde', 'comptable', 'responsable_flotte'])->where('is_active', true)
            ->get()->map(function ($u) use ($today) {
                $todayAtt = Attendance::where('user_id', $u->id)->where('date', $today)->first();
                return [
                    'id' => $u->id,
                    'name' => $u->name,
                    'role' => $u->role,
                    'clock_in' => $todayAtt?->clock_in?->format('H:i'),
                    'clock_out' => $todayAtt?->clock_out?->format('H:i'),
                    'status' => $todayAtt?->status ?? 'absent',
                    'notes' => $todayAtt?->notes,
                ];
            });

        $stats = [
            'present' => $pointage->where('status', 'present')->count(),
            'absent' => $pointage->where('status', 'absent')->count(),
            'late' => $pointage->where('status', 'late')->count(),
            'leave' => $pointage->where('status', 'leave')->count(),
        ];

        return Inertia::render('Admin/Rh/Pointage', compact('pointage', 'stats'));
    }

    public function pointageStore(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'status' => 'required|in:present,absent,late,half_day,leave,holiday',
            'notes' => 'nullable|string',
        ]);

        Attendance::updateOrCreate(
            ['user_id' => $validated['user_id'], 'date' => Carbon::today()],
            [
                'clock_in' => $validated['status'] === 'present' ? now() : null,
                'status' => $validated['status'],
                'notes' => $validated['notes'] ?? null,
            ]
        );

        return redirect()->route('admin.rh.pointage')->with('success', 'Pointage enregistré.');
    }

    // ─── Paie ──────────────────────────────────────────────────────────

    public function paieIndex()
    {
        $period = request('period', Carbon::now()->format('Y-m'));
        $bulletins = PaySlip::with('user')->where('period', $period)->get()->map(fn ($p) => [
            'id' => $p->id,
            'employe' => $p->user?->name,
            'base_salary' => (float) $p->base_salary,
            'total_allowances' => (float) ($p->transport_allowance + $p->housing_allowance + $p->other_allowances),
            'gross_salary' => (float) ($p->base_salary + $p->transport_allowance + $p->housing_allowance + $p->other_allowances + $p->bonus + $p->overtime),
            'deductions' => (float) $p->deductions,
            'tax' => (float) $p->tax,
            'cnss' => (float) $p->cnss,
            'net_salary' => (float) $p->net_salary,
            'status' => $p->status,
            'paid_at' => $p->paid_at?->format('Y-m-d'),
        ]);

        $totalBrut = $bulletins->sum('base_salary');
        $totalNet = $bulletins->sum('net_salary');
        $nbEmployes = $bulletins->count();

        $employes = User::forCurrentCompany()->whereIn('role', ['chauffeur', 'guichetiere', 'agent_police', 'bagagiste', 'chef_garde', 'comptable', 'responsable_flotte'])->where('is_active', true)
            ->get()->map(fn ($u) => [
                'id' => $u->id, 'name' => $u->name,
            ]);

        return Inertia::render('Admin/Rh/Paie', compact('bulletins', 'period', 'totalBrut', 'totalNet', 'nbEmployes', 'employes'));
    }

    public function paieGenerer(Request $request)
    {
        $period = $request->input('period', Carbon::now()->format('Y-m'));
        $employes = User::forCurrentCompany()->whereIn('role', ['chauffeur', 'guichetiere', 'agent_police', 'bagagiste', 'chef_garde', 'comptable', 'responsable_flotte'])->where('is_active', true)->get();

        foreach ($employes as $employe) {
            $contrat = Contract::where('user_id', $employe->id)->where('is_active', true)->first();
            if (!$contrat) continue;

            $base = $contrat->salary_base;
            $transport = $contrat->transport_allowance;
            $housing = $contrat->housing_allowance;
            $other = $contrat->other_allowances;
            $brut = $base + $transport + $housing + $other;
            $deductions = $brut * 0.05; // 5% deductions
            $tax = ($brut - $deductions) * 0.01; // 1% IR
            $cnss = $brut * 0.035; // 3.5% CNSS
            $net = $brut - $deductions - $tax - $cnss;

            PaySlip::updateOrCreate(
                ['user_id' => $employe->id, 'period' => $period],
                [
                    'base_salary' => $base,
                    'transport_allowance' => $transport,
                    'housing_allowance' => $housing,
                    'other_allowances' => $other,
                    'bonus' => 0,
                    'overtime' => 0,
                    'deductions' => $deductions,
                    'tax' => $tax,
                    'cnss' => $cnss,
                    'net_salary' => $net,
                    'status' => 'draft',
                ]
            );
        }

        return redirect()->route('admin.rh.paie', ['period' => $period])
            ->with('success', 'Bulletins de paie générés pour ' . $period);
    }

    public function paiePayer(Request $request, PaySlip $paySlip)
    {
        $paySlip->update(['status' => 'paid', 'paid_at' => now()]);
        return redirect()->route('admin.rh.paie')->with('success', 'Paie marquée comme payée.');
    }

    // ─── CRUD Utilisateurs ───────────────────────────────────────────────────

    public function usersIndex()
    {
        $users = User::forCurrentCompany()->withCount('tripsAsDriver')->latest()->paginate(30)
            ->through(fn ($u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'phone' => $u->phone,
                'city' => $u->city,
                'role' => $u->role,
                'is_active' => $u->is_active,
                'trips_count' => $u->trips_as_driver_count,
                'created_at' => $u->created_at->format('Y-m-d'),
            ]);

        return Inertia::render('Admin/Utilisateurs', compact('users'));
    }

    public function usersStore(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users',
            'phone' => 'nullable|string|max:50',
            'city' => 'nullable|string|max:255',
            'password' => 'required|string|min:8',
            'role' => 'required|in:directeur_general,responsable_flotte,comptable,chef_garde,guichetiere,agent_police,bagagiste,chauffeur,client',
            'is_active' => 'boolean',
        ]);

        $validated['password'] = bcrypt($validated['password']);
        $validated['company_id'] = auth()->user()->company_id;

        User::create($validated);

        return redirect()->route('admin.utilisateurs')->with('success', 'Utilisateur créé.');
    }

    public function usersUpdate(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:50',
            'city' => 'nullable|string|max:255',
            'password' => 'nullable|string|min:8',
            'role' => 'required|in:directeur_general,responsable_flotte,comptable,chef_garde,guichetiere,agent_police,bagagiste,chauffeur,client',
            'is_active' => 'boolean',
        ]);

        if (!empty($validated['password'])) {
            $validated['password'] = bcrypt($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        return redirect()->route('admin.utilisateurs')->with('success', 'Utilisateur mis à jour.');
    }

    public function usersDestroy(User $user)
    {
        if ($user->id === auth()->id()) {
            return back()->with('error', 'Vous ne pouvez pas supprimer votre propre compte.');
        }

        $user->update(['is_active' => false]);

        return redirect()->route('admin.utilisateurs')->with('success', 'Utilisateur désactivé.');
    }
}