<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DestinationsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nom' => ['required', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'nom.required' => 'Le nom de la destination est requis.',
            'nom.max' => 'Le nom de la destination ne peut pas dépasser 255 caractères.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'nom' => trim((string) $this->input('nom')),
        ]);
    }
}