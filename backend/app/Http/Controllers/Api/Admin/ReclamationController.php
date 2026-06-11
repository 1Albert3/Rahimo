<?php
namespace App\Http\Controllers\Api\Admin;
use App\Http\Controllers\ReclamationController as Base;
use Illuminate\Http\Request;

class ReclamationController extends Base
{
    private function j($r) {
        if (request()->expectsJson() && method_exists($r, 'getData')) return response()->json($r->getData());
        return $r;
    }
    public function index() { return $this->j(parent::index()); }
    public function store(Request $r) { $res = parent::store($r); return request()->expectsJson() ? response()->json(['message' => 'Réclamation créée.'], 201) : $res; }
    public function publicStore(Request $r) { return $this->store($r); }
    public function updateStatus(Request $r, \App\Models\Reclamation $reclamation) {
        $res = parent::updateStatus($r, $reclamation);
        return request()->expectsJson() ? response()->json(['message' => 'Statut mis à jour.']) : $res;
    }
}
