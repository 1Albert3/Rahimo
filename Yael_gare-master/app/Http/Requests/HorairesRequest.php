<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class HorairesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'heure' => ['required', 'regex:/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/'],
        ];
    }

    public function messages(): array
    {
        return [
            'heure.required' => 'L\'horaire est requis.',
            'heure.regex' => 'L\'horaire doit être au format HH:MM (ex. 17:30).',
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'heure' => trim((string) $this->input('heure')),
        ]);
    }
}