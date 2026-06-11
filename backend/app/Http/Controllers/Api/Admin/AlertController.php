<?php
namespace App\Http\Controllers\Api\Admin;
use App\Models\Alert;
use App\Http\Controllers\AlertController as Base;
use Illuminate\Http\Request;

class AlertController extends Base
{
    public function index()
    {
        $actives  = Alert::with('vehicle')->where('traitee', false)->orderBy('created_at', 'desc')->get()->map(fn ($a) => $this->format($a));
        $traitees = Alert::with('vehicle')->where('traitee', true)->orderBy('created_at', 'desc')->limit(20)->get()->map(fn ($a) => $this->format($a));
        return response()->json([
            'actives'  => $actives,
            'traitees' => $traitees,
            'stats'    => [
                'critiques'      => Alert::where('traitee', false)->where('type', 'danger')->count(),
                'avertissements' => Alert::where('traitee', false)->where('type', 'warning')->count(),
                'infos'          => Alert::where('traitee', false)->where('type', 'info')->count(),
                'traitees'       => Alert::where('traitee', true)->count(),
            ],
        ]);
    }
    public function driverIndex() { return $this->index(); }
    public function store(Request $r) { parent::store($r); return response()->json(['message' => 'Alerte créée.'], 201); }
    public function traiter(Alert $alert) { $alert->markAsTreated(); return response()->json(['message' => 'Alerte traitée.']); }
}
