<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ReservationsRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Autoriser toutes les requêtes (ajustez selon vos besoins)
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'nom' => ['required', 'string', 'max:100'],
            'prenom' => ['required', 'string', 'max:100'],
            'telephone' => [
                'required',
                'string',
                'regex:/^\+?[1-9]\d{1,14}$/',
                Rule::unique('reservations')->where(function ($query) {
                    return $query->where('gare_id', session('gare_id'));
                })->ignore($this->route('id')), // Ignore l'ID actuel pour les mises à jour
                'max:50'
            ],
            'voyage_id' => ['required', 'integer', 'min:1'],
        ];
    }

    /**
     * Get custom error messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'nom.required' => 'Le nom est requis.',
            'nom.string' => 'Le nom doit être une chaîne de caractères.',
            'nom.max' => 'Le nom ne peut pas dépasser 100 caractères.',
            'prenom.required' => 'Le prénom est requis.',
            'prenom.string' => 'Le prénom doit être une chaîne de caractères.',
            'prenom.max' => 'Le prénom ne peut pas dépasser 100 caractères.',
            'telephone.required' => 'Le numéro de téléphone est requis.',
            'telephone.regex' => 'Le numéro de téléphone doit être valide (ex: +1234567890 ou 70123456).',
            'telephone.unique' => 'Ce numéro de téléphone est déjà utilisé pour cette gare.',
            'telephone.max' => 'Le numéro de téléphone ne peut pas dépasser 50 caractères.',
            'voyage_id.required' => 'L\'ID du voyage est requis.',
            'voyage_id.integer' => 'L\'ID du voyage doit être un entier.',
            'voyage_id.min' => 'L\'ID du voyage doit être supérieur ou égal à 1.',
        ];
    }
}