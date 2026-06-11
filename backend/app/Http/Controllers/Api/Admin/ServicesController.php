<?php
namespace App\Http\Controllers\Api\Admin;
use App\Http\Controllers\ServicesController as Base;
use Illuminate\Http\Request;

class ServicesController extends Base
{
    private function j($r) {
        if (request()->expectsJson() && method_exists($r, 'getData')) return response()->json($r->getData());
        return $r;
    }
    public function parking()  { return $this->j(parent::parking()); }
    public function location() { return $this->j(parent::location()); }
    public function hebergement() { return $this->j(parent::hebergement()); }
    public function motoTransport() { return $this->j(parent::motoTransport()); }
    public function adminLostItems() { return $this->j(parent::adminLostItems()); }
    public function parkingStore(Request $r)    { $res = parent::parkingStore($r);   return request()->expectsJson() ? response()->json(['message' => 'Parking enregistré.'], 201) : $res; }
    public function parkingSortir(\App\Models\Parking $p) { $res = parent::parkingSortir($p); return request()->expectsJson() ? response()->json(['message' => 'Sortie enregistrée.']) : $res; }
    public function locationStore(Request $r)   { $res = parent::locationStore($r);  return request()->expectsJson() ? response()->json(['message' => 'Location créée.'], 201) : $res; }
    public function locationTerminer(\App\Models\Rental $rental) { $res = parent::locationTerminer($rental); return request()->expectsJson() ? response()->json(['message' => 'Location terminée.']) : $res; }
    public function hebergementStore(Request $r){ $res = parent::hebergementStore($r); return request()->expectsJson() ? response()->json(['message' => 'Réservation créée.'], 201) : $res; }
    public function hebergementCheckin(\App\Models\Accommodation $a) { $res = parent::hebergementCheckin($a); return request()->expectsJson() ? response()->json(['message' => 'Check-in effectué.']) : $res; }
    public function hebergementCheckout(\App\Models\Accommodation $a){ $res = parent::hebergementCheckout($a); return request()->expectsJson() ? response()->json(['message' => 'Check-out effectué.']) : $res; }
    public function motoTransportStore(Request $r) { $res = parent::motoTransportStore($r); return request()->expectsJson() ? response()->json(['message' => 'Transport créé.'], 201) : $res; }
    public function motoTransportUpdateStatus(\App\Models\MotoTransport $m, Request $r) { $res = parent::motoTransportUpdateStatus($m, $r); return request()->expectsJson() ? response()->json(['message' => 'Statut mis à jour.']) : $res; }
    public function adminLostItemUpdate(Request $r, \App\Models\LostItem $l) { $res = parent::adminLostItemUpdate($r, $l); return request()->expectsJson() ? response()->json(['message' => 'Objet mis à jour.']) : $res; }
    // Public store endpoints
    public function publicParkingStore(Request $r)   { return parent::publicParkingStore($r); }
    public function publicLocationStore(Request $r)  { return parent::publicLocationStore($r); }
    public function publicHebergementStore(Request $r){ return parent::publicHebergementStore($r); }
    public function publicMotoStore(Request $r)      { return parent::publicMotoStore($r); }
    public function publicLostAndFoundStore(Request $r){ return parent::publicLostAndFoundStore($r); }
}
