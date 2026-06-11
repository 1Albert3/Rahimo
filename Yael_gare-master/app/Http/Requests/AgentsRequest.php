<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AgentsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rules = [
            'nom' => ['required', 'string', 'max:255'],
            'prenom' => ['required', 'string', 'max:255'],
            'numero' => ['required', 'regex:/^\d{8}$/'],
        ];

        if ($this->isMethod('post')) {
            $rules['password'] = ['required', 'string', 'min:6'];
        } else {
            $rules['password'] = ['nullable', 'string', 'min:6'];
        }

        return $rules;
    }

    public function messages(): array
    {
        return [
            'nom.required' => 'Le nom est requis.',
            'prenom.required' => 'Le prénom est requis.',
            'numero.required' => 'Le numéro de téléphone est requis.',
            'numero.regex' => 'Le numéro de téléphone doit contenir exactement 8 chiffres.',
            'password.required' => 'Le mot de passe est requis pour la création.',
            'password.min' => 'Le mot de passe doit contenir au moins 6 caractères.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'nom' => trim((string) $this->input('nom')),
            'prenom' => trim((string) $this->input('prenom')),
            'numero' => trim((string) $this->input('numero')),
            'password' => $this->input('password') ? trim((string) $this->input('password')) : null,
        ]);
    }
}