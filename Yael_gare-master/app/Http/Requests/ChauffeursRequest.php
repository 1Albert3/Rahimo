<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ChauffeursRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nom' => ['required', 'string', 'max:255'],
            'prenom' => ['required', 'string', 'max:255'],
            'telephone' => ['required', 'regex:/^\d{8}$/'],
        ];
    }

    public function messages(): array
    {
        return [
            'nom.required' => 'Le nom est requis.',
            'prenom.required' => 'Le prénom est requis.',
            'telephone.required' => 'Le numéro de téléphone est requis.',
            'telephone.regex' => 'Le numéro de téléphone doit contenir exactement 8 chiffres.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'nom' => trim((string) $this->input('nom')),
            'prenom' => trim((string) $this->input('prenom')),
            'telephone' => trim((string) $this->input('telephone')),
        ]);
    }
}