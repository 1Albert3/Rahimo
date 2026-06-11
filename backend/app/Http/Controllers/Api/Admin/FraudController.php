<?php
namespace App\Http\Controllers\Api\Admin;
use App\Http\Controllers\Admin\FraudController as Base;
use Illuminate\Http\Request;

class FraudController extends Base
{
    private function j($r) { return (request()->expectsJson() && method_exists($r, 'getData')) ? response()->json($r->getData()) : $r; }
    private function ok($msg) { return request()->expectsJson() ? response()->json(['message' => $msg]) : back()->with('success', $msg); }
    public function index() { return $this->j(parent::index()); }
    public function resolve(\App\Models\FraudCheck $fraudCheck) { parent::resolve($fraudCheck); return $this->ok('Fraude résolue.'); }
    public function dismiss(\App\Models\FraudCheck $fraudCheck) { parent::dismiss($fraudCheck); return $this->ok('Fraude classée.'); }
}
