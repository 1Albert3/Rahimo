<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\RhController as Base;
use Illuminate\Http\Request;

class RhController extends Base
{
    private function j($r)
    {
        if (request()->expectsJson() && method_exists($r, 'getData')) {
            return response()->json($r->getData());
        }
        return $r;
    }

    public function dashboard()      { return $this->j(parent::dashboard()); }
    public function personnel()      { return $this->j(parent::personnel()); }
    public function personnelShow(\App\Models\User $user) { return $this->j(parent::personnelShow($user)); }
    public function contratsIndex()  { return $this->j(parent::contratsIndex()); }
    public function congesIndex()    { return $this->j(parent::congesIndex()); }
    public function pointageIndex()  { return $this->j(parent::pointageIndex()); }
    public function paieIndex()      { return $this->j(parent::paieIndex()); }

    public function contratsStore(Request $r)  { $res = parent::contratsStore($r);  return request()->expectsJson() ? response()->json(['message' => 'Contrat créé.'], 201) : $res; }
    public function contratsUpdate(Request $r, \App\Models\Contract $c) { $res = parent::contratsUpdate($r, $c); return request()->expectsJson() ? response()->json(['message' => 'Contrat mis à jour.']) : $res; }
    public function congesStore(Request $r)    { $res = parent::congesStore($r);    return request()->expectsJson() ? response()->json(['message' => 'Congé enregistré.'], 201) : $res; }
    public function congesApprouver(\App\Models\Leave $l) { $res = parent::congesApprouver($l); return request()->expectsJson() ? response()->json(['message' => 'Congé approuvé.']) : $res; }
    public function congesRejeter(Request $r, \App\Models\Leave $l) { $res = parent::congesRejeter($r, $l); return request()->expectsJson() ? response()->json(['message' => 'Congé rejeté.']) : $res; }
    public function pointageStore(Request $r)  { $res = parent::pointageStore($r);  return request()->expectsJson() ? response()->json(['message' => 'Pointage enregistré.'], 201) : $res; }
    public function paieGenerer(Request $r)    { $res = parent::paieGenerer($r);    return request()->expectsJson() ? response()->json(['message' => 'Fiche générée.'], 201) : $res; }
    public function paiePayer(Request $r, \App\Models\PaySlip $p) { $res = parent::paiePayer($r, $p); return request()->expectsJson() ? response()->json(['message' => 'Paie marquée payée.']) : $res; }
}
