<?php
namespace App\Http\Controllers\Api\Admin;
use App\Http\Controllers\Admin\ReportsController as Base;
use Illuminate\Http\Request;

class ReportsController extends Base
{
    private function j($r) { return (request()->expectsJson() && method_exists($r, 'getData')) ? response()->json($r->getData()) : $r; }
    public function index(Request $request)    { return $this->j(parent::index($request)); }
    public function advanced()                 { return $this->j(parent::index(request())); }
    public function exportExcel(Request $r)    { return parent::exportExcel($r); }
    public function exportCsv(Request $r)      { return parent::exportCsv($r); }
    public function export()                   { return parent::exportCsv(request()); }
}
