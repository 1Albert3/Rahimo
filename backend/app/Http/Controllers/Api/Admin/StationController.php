<?php
namespace App\Http\Controllers\Api\Admin;
use App\Http\Controllers\Admin\StationController as Base;
use Illuminate\Http\Request;

class StationController extends Base
{
    private function j($r) { return (request()->expectsJson() && method_exists($r, 'getData')) ? response()->json($r->getData()) : $r; }
    private function ok($msg, $code = 200) { return request()->expectsJson() ? response()->json(['message' => $msg], $code) : back()->with('success', $msg); }
    public function index() { return $this->j(parent::index()); }
    public function store(Request $r)                            { parent::store($r);           return $this->ok('Gare créée.', 201); }
    public function update(Request $r, \App\Models\Station $s)   { parent::update($r, $s);      return $this->ok('Gare mise à jour.'); }
    public function routesStore(Request $r)                      { parent::routesStore($r);     return $this->ok('Route créée.', 201); }
}
