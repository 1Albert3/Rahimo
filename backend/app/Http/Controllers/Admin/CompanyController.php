<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\Vehicle;
use App\Models\Trip;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;


class CompanyController extends Controller
{
    public function index()
    {
        $companies = Company::withCount('vehicles', 'trips', 'users')
            ->orderBy('name')
            ->paginate(20)
            ->through(fn ($c) => [
                'id' => $c->id,
                'name' => $c->name,
                'slug' => $c->slug,
                'phone' => $c->phone,
                'email' => $c->email,
                'is_active' => $c->is_active,
                'vehicles_count' => $c->vehicles_count,
                'trips_count' => $c->trips_count,
                'users_count' => $c->users_count,
                'created_at' => $c->created_at->format('Y-m-d'),
            ]);

        $__data = compact('companies');
        if (request()->expectsJson()) return response()->json($__data);
        return response()->json($__data);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:50|unique:companies,slug',
            'registration_number' => 'nullable|string|max:50',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:100',
            'address' => 'nullable|string',
            'primary_color' => 'nullable|string|max:7',
            'is_active' => 'boolean',
        ]);

        Company::create($validated);

        return redirect()->route('admin.compagnies')->with('success', 'Compagnie créée.');
    }

    public function update(Request $request, Company $company)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:50|unique:companies,slug,' . $company->id,
            'registration_number' => 'nullable|string|max:50',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:100',
            'address' => 'nullable|string',
            'primary_color' => 'nullable|string|max:7',
            'is_active' => 'boolean',
        ]);

        $company->update($validated);

        return redirect()->route('admin.compagnies')->with('success', 'Compagnie mise à jour.');
    }
}
