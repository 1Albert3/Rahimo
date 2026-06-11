<?php
namespace App\Http\Controllers\Api\Admin;
use App\Http\Controllers\Admin\BaggageController as Base;
use App\Models\Baggage;
use App\Models\Trip;
use Illuminate\Http\Request;

class BaggageController extends Base
{
    private function j($r) { return (request()->expectsJson() && method_exists($r, 'getData')) ? response()->json($r->getData()) : $r; }
    private function ok($msg, $code = 200) { return request()->expectsJson() ? response()->json(['message' => $msg], $code) : back()->with('success', $msg); }

    public function index(Request $request) { return $this->j(parent::index($request)); }
    public function show(Baggage $baggage)   { return $this->j(parent::show($baggage)); }
    public function tripManifest(Trip $trip) { return $this->j(parent::tripManifest($trip)); }
    public function store(Request $request)  { parent::store($request); return $this->ok('Bagage enregistré.', 201); }
    public function scan(Request $request)   { return parent::scan($request); }
}
