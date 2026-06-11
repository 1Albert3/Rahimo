<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PassagersRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Authorization handled by middleware and API
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        $today = now()->toDateString();

        return [
            'nom' => ['required', 'string', 'max:255'],
            'prenom' => ['required', 'string', 'max:255'],
            'telephone' => ['required', 'regex:/^\d{8}$/', 'max:8'],
            'numerocnib' => ['required', 'regex:/^B\d{8}$/', 'max:9'],
            'date_etablissement' => ['required', 'date', 'before_or_equal:' . $today],
            'date_expiration' => ['required', 'date', 'after:date_etablissement'],
            'trajet_id' => ['required', 'integer', 'min:1'],
            'codeqr' => ['required', 'string', 'max:255'],
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
            'nom.required' => 'Le nom est requis.',
            'nom.string' => 'Le nom doit être une chaîne de caractères.',
            'nom.max' => 'Le nom ne peut pas dépasser 255 caractères.',
            'prenom.required' => 'Le prénom est requis.',
            'prenom.string' => 'Le prénom doit être une chaîne de caractères.',
            'prenom.max' => 'Le prénom ne peut pas dépasser 255 caractères.',
            'telephone.required' => 'Le numéro de téléphone est requis.',
            'telephone.regex' => 'Le numéro de téléphone doit contenir exactement 8 chiffres.',
            'telephone.max' => 'Le numéro de téléphone doit contenir exactement 8 chiffres.',
            'numerocnib.required' => 'Le numéro CNIB est requis.',
            'numerocnib.regex' => 'Le numéro CNIB doit être au format B12345678 (B suivi de 8 chiffres).',
            'numerocnib.max' => 'Le numéro CNIB doit contenir exactement 9 caractères.',
            'date_etablissement.required' => 'La date d\'établissement est requise.',
            'date_etablissement.date' => 'La date d\'établissement doit être une date valide.',
            'date_etablissement.before_or_equal' => 'La date d\'établissement ne peut pas être future.',
            'date_expiration.required' => 'La date d\'expiration est requise.',
            'date_expiration.date' => 'La date d\'expiration doit être une date valide.',
            'date_expiration.after' => 'La date d\'expiration doit être postérieure à la date d\'établissement.',
            'trajet_id.required' => 'L\'ID du trajet est requis.',
            'trajet_id.integer' => 'L\'ID du trajet doit être un nombre entier.',
            'trajet_id.min' => 'L\'ID du trajet doit être supérieur ou égal à 1.',
            'codeqr.required' => 'Le code QR est requis.',
            'codeqr.string' => 'Le code QR doit être une chaîne de caractères.',
            'codeqr.max' => 'Le code QR ne peut pas dépasser 255 caractères.',
        ];
    }
}