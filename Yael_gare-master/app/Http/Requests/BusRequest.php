<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nom' => ['required', 'string', 'max:255'],
            'matricule' => ['required', 'string', 'max:50'],
            'capacite' => ['required', 'integer', 'min:1', 'max:1000'],
            'statut' => ['required', Rule::in(['service', 'hors service', 'en_maintenance'])],
        ];
    }

    public function messages(): array
    {
        return [
            'nom.required' => 'Le nom du bus est requis.',
            'matricule.required' => 'Le matricule est requis.',
            'capacite.required' => 'La capacité est requise.',
            'capacite.integer' => 'La capacité doit être un nombre entier.',
            'capacite.min' => 'La capacité doit être au moins 1.',
            'capacite.max' => 'La capacité ne peut pas dépasser 1000.',
            'statut.required' => 'Le statut est requis.',
            'statut.in' => 'Le statut doit être "service", "hors service" ou "en_maintenance".',
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'nom' => trim((string) $this->input('nom')),
            'matricule' => trim((string) $this->input('matricule')),
            'capacite' => (int) $this->input('capacite'),
            'statut' => $this->input('statut'),
        ]);
    }
}