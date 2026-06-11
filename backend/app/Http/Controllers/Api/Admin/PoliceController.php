<?php
namespace App\Http\Controllers\Api\Admin;
use App\Http\Controllers\Admin\PoliceController as Base;
use Illuminate\Http\Request;

class PoliceController extends Base
{
    private function j($r) { return (request()->expectsJson() && method_exists($r, 'getData')) ? response()->json($r->getData()) : $r; }
    private function ok($msg) { return request()->expectsJson() ? response()->json(['message' => $msg]) : back()->with('success', $msg); }
    public function index() { return $this->j(parent::index()); }
    public function watchlistIndex() { return $this->j(parent::watchlistIndex()); }
    public function checkLogs() { return $this->j(parent::checkLogs()); }
    public function verifyPassenger(Request $r) { return parent::verifyPassenger($r); }
    public function verifyTrip(Request $r, \App\Models\Trip $trip) { return parent::verifyTrip($r, $trip); }
    public function watchlistStore(Request $r) { parent::watchlistStore($r); return $this->ok('Entrée ajoutée.'); }
    public function watchlistClear(\App\Models\WatchlistEntry $w) { parent::watchlistClear($w); return $this->ok('Entrée retirée.'); }
}
