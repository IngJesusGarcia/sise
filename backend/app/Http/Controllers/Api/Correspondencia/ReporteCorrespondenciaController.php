<?php

namespace App\Http\Controllers\Api\Correspondencia;

use App\Http\Controllers\Controller;
use App\Models\Documento;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReporteCorrespondenciaController extends Controller
{
    public function resumen(Request $request)
    {
        $desde = $request->get('desde', now()->startOfMonth()->toDateString());
        $hasta = $request->get('hasta', now()->toDateString());

        $base = Documento::whereBetween('fecha', [$desde, $hasta]);

        $porEstatus = (clone $base)
            ->select('estatus', DB::raw('count(*) as total'))
            ->groupBy('estatus')
            ->get()->keyBy('estatus');

        $porTipo = (clone $base)
            ->join('tipos_documento', 'documentos.tipo_documento_id', '=', 'tipos_documento.id')
            ->select('tipos_documento.nombre as tipo', DB::raw('count(*) as total'))
            ->groupBy('tipos_documento.nombre')
            ->orderByDesc('total')
            ->get();

        $porArea = (clone $base)
            ->select('area_origen', DB::raw('count(*) as total'))
            ->groupBy('area_origen')
            ->orderByDesc('total')
            ->limit(10)
            ->get();

        $diario = (clone $base)
            ->select(DB::raw('DATE(fecha) as dia'), DB::raw('count(*) as total'))
            ->groupBy('dia')
            ->orderBy('dia')
            ->get();

        return response()->json([
            'periodo'     => compact('desde', 'hasta'),
            'total'       => (clone $base)->count(),
            'por_estatus' => $porEstatus,
            'por_tipo'    => $porTipo,
            'por_area'    => $porArea,
            'diario'      => $diario,
        ]);
    }
}
