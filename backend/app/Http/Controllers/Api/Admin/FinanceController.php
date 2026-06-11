<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\FinanceController as Base;
use Illuminate\Http\Request;

class FinanceController extends Base
{
    public function comptabilite()
    {
        $r = parent::comptabilite();
        return $this->toJson($r);
    }

    public function expensesIndex()
    {
        $r = parent::expenses();
        return $this->toJson($r);
    }

    public function expensesStore(Request $request)
    {
        $r = parent::expensesStore($request);
        return request()->expectsJson()
            ? response()->json(['message' => 'Dépense enregistrée.'], 201)
            : $r;
    }

    public function expensesValidate(Request $request, \App\Models\Expense $expense)
    {
        $r = parent::expensesValidate($request, $expense);
        return request()->expectsJson()
            ? response()->json(['message' => 'Statut mis à jour.'])
            : $r;
    }

    public function caissesOuvrir(Request $request)
    {
        $r = parent::caissesOuvrir($request);
        return request()->expectsJson()
            ? response()->json(['message' => 'Caisse ouverte.'])
            : $r;
    }

    public function caissesFermer(Request $request, \App\Models\CashRegister $cashRegister)
    {
        $r = parent::caissesFermer($request, $cashRegister);
        return request()->expectsJson()
            ? response()->json(['message' => 'Caisse fermée.'])
            : $r;
    }

    public function reconciliationsStore(Request $request)
    {
        $r = parent::reconciliationsStore($request);
        return request()->expectsJson()
            ? response()->json(['message' => 'Rapprochement enregistré.'])
            : $r;
    }

    public function facturesIndex()
    {
        $r = parent::facturesIndex();
        return $this->toJson($r);
    }

    public function facturesStore(Request $request)
    {
        $r = parent::facturesStore($request);
        return request()->expectsJson()
            ? response()->json(['message' => 'Facture créée.'], 201)
            : $r;
    }

    public function facturesPayer(\App\Models\Invoice $invoice)
    {
        $r = parent::facturesPayer($invoice);
        return request()->expectsJson()
            ? response()->json(['message' => 'Facture payée.'])
            : $r;
    }

    public function facturesAnnuler(\App\Models\Invoice $invoice)
    {
        $r = parent::facturesAnnuler($invoice);
        return request()->expectsJson()
            ? response()->json(['message' => 'Facture annulée.'])
            : $r;
    }

    public function grandLivre()
    {
        $r = parent::grandLivre();
        return $this->toJson($r);
    }

    public function bilan()
    {
        $r = parent::bilan();
        return $this->toJson($r);
    }

    public function budgetsIndex()
    {
        $r = parent::budgetsIndex();
        return $this->toJson($r);
    }

    public function budgetsStore(Request $request)
    {
        $r = parent::budgetsStore($request);
        return request()->expectsJson()
            ? response()->json(['message' => 'Budget créé.'], 201)
            : $r;
    }

    private function toJson($response)
    {
        if (request()->expectsJson() && method_exists($response, 'getData')) {
            return response()->json($response->getData());
        }
        return $response;
    }
}
