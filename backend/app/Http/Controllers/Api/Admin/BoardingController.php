<?php
namespace App\Http\Controllers\Api\Admin;
use App\Http\Controllers\BoardingController as Base;
use Illuminate\Http\Request;

class BoardingController extends Base
{
    private function j($r) { return (request()->expectsJson() && method_exists($r, 'getData')) ? response()->json($r->getData()) : $r; }
    public function index()   { return $this->j(parent::index()); }
    public function verifyQr(Request $r)    { return parent::verifyQr($r); }
    public function confirmBoarding(Request $r) { return parent::confirmBoarding($r); }
}
