<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class VoyagesRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Autoriser si l'utilisateur est authentifié
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        return [
            'trajet_id' => ['required', 'integer', 'min:1'],
            'bus_id' => ['required', 'integer', 'min:1'],
            'chauffeur_id' => ['required', 'integer', 'min:1'],
            'statut' => ['required', Rule::in(['attente', 'depart', 'arriver'])],
        ];
    }

    /**
     * Get custom error messages for validation.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'trajet_id.required' => 'L\'ID du trajet est requis.',
            'trajet_id.integer' => 'L\'ID du trajet doit être un nombre entier.',
            'trajet_id.min' => 'L\'ID du trajet doit être supérieur ou égal à 1.',
            'bus_id.required' => 'L\'ID du bus est requis.',
            'bus_id.integer' => 'L\'ID du bus doit être un nombre entier.',
            'bus_id.min' => 'L\'ID du bus doit être supérieur ou égal à 1.',
            'chauffeur_id.required' => 'L\'ID du chauffeur est requis.',
            'chauffeur_id.integer' => 'L\'ID du chauffeur doit être un nombre entier.',
            'chauffeur_id.min' => 'L\'ID du chauffeur doit être supérieur ou égal à 1.',
            'statut.required' => 'Le statut est requis.',
            'statut.in' => 'Le statut doit être l\'un des suivants : attente, depart, arriver.',
        ];
    }
}