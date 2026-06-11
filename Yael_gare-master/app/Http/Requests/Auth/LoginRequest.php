<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'numero'   => ['required', 'string', 'min:4'],
            'password' => ['required', 'string', 'min:4'],
        ];
    }

    public function messages(): array
    {
        return [
            'numero.required'   => 'Le numéro est requis.',
            'password.required' => 'Le mot de passe est requis.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'numero' => trim((string) $this->input('numero')),
        ]);
    }
}
