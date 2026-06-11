<?php
namespace App\Http\Controllers\Api\Admin;
use App\Http\Controllers\Admin\CompanyController as Base;
use Illuminate\Http\Request;

class CompanyController extends Base
{
    private function j($r) { return (request()->expectsJson() && method_exists($r, 'getData')) ? response()->json($r->getData()) : $r; }
    private function ok($msg, $code = 200) { return request()->expectsJson() ? response()->json(['message' => $msg], $code) : back()->with('success', $msg); }
    public function index() { return $this->j(parent::index()); }
    public function store(Request $r)                           { parent::store($r);           return $this->ok('Compagnie créée.', 201); }
    public function update(Request $r, \App\Models\Company $c)  { parent::update($r, $c);      return $this->ok('Compagnie mise à jour.'); }
}
