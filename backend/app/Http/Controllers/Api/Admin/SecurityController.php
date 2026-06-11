<?php
namespace App\Http\Controllers\Api\Admin;
use App\Http\Controllers\SecurityController as Base;
use App\Models\PoliceAlert;
use App\Models\IncidentReport;
use App\Models\Trip;
use Illuminate\Http\Request;

class SecurityController extends Base
{
    private function j($r) { return (request()->expectsJson() && method_exists($r, 'getData')) ? response()->json($r->getData()) : $r; }
    private function ok($msg) { return request()->expectsJson() ? response()->json(['message' => $msg]) : back()->with('success', $msg); }

    public function dashboard() { return $this->j(parent::dashboard()); }
    public function manifeste(Trip $trip) { return $this->j(parent::manifeste($trip)); }
    public function alertesStore(Request $request) { parent::alertesStore($request); return $this->ok('Alerte créée.'); }
    public function alertesResoudre(PoliceAlert $alert) { parent::alertesResoudre($alert); return $this->ok('Alerte résolue.'); }
    public function incidentsStore(Request $request) { parent::incidentsStore($request); return $this->ok('Incident enregistré.'); }
    public function incidentsResoudre(IncidentReport $incident) { parent::incidentsResoudre($incident); return $this->ok('Incident résolu.'); }
}
