<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TrajetsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nom' => ['required', 'string', 'max:255'],
            'depart_gare_id' => ['required', 'integer'],
            'destination_id' => ['required', 'integer'],
            'duree' => ['required', 'regex:/^([0-9][0-9]):[0-5][0-9]$/'],
            'horaire_id' => ['required', 'integer'],
            'date' => ['required', 'date', 'date_format:Y-m-d'],
            'prix' => ['required', 'numeric', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'nom.required' => 'Le nom du trajet est requis.',
            'nom.max' => 'Le nom du trajet ne peut pas dépasser 255 caractères.',
            'depart_gare_id.required' => 'La gare de départ est requise.',
            'depart_gare_id.integer' => 'L\'ID de la gare de départ doit être un nombre entier.',
            'destination_id.required' => 'La destination est requise.',
            'destination_id.integer' => 'L\'ID de la destination doit être un nombre entier.',
            'duree.required' => 'La durée est requise.',
            'duree.regex' => 'La durée doit être au format HH:MM (ex. 02:30).',
            'horaire_id.required' => 'L\'horaire est requis.',
            'horaire_id.integer' => 'L\'ID de l\'horaire doit être un nombre entier.',
            'date.required' => 'La date est requise.',
            'date.date_format' => 'La date doit être au format AAAA-MM-JJ (ex. 2025-08-01).',
            'prix.required' => 'Le prix est requis.',
            'prix.numeric' => 'Le prix doit être un nombre.',
            'prix.min' => 'Le prix ne peut pas être négatif.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'nom' => trim((string) $this->input('nom')),
            'depart_gare_id' => (int) $this->input('depart_gare_id'),
            'destination_id' => (int) $this->input('destination_id'),
            'duree' => trim((string) $this->input('duree')),
            'horaire_id' => (int) $this->input('horaire_id'),
            'date' => trim((string) $this->input('date')),
            'prix' => (float) $this->input('prix'),
        ]);
    }
}