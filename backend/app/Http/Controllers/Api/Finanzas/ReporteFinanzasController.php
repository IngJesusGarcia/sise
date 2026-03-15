<?php

namespace App\Http\Controllers\Api\Finanzas;

use App\Http\Controllers\Controller;
use App\Models\Pago;
use App\Models\LineaCaptura;
use App\Models\CatalogoServicio;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReporteFinanzasController extends Controller
{
    public function resumen(Request $request)
    {
        $fechaInicio = $request->fecha_inicio ?? now()->startOfMonth()->toDateString();
        $fechaFin    = $request->fecha_fin    ?? now()->toDateString();

        // Totals in period
        $totalPagado   = Pago::whereBetween('fecha_pago', [$fechaInicio, $fechaFin])->sum('monto_pagado');
        $totalPagos    = Pago::whereBetween('fecha_pago', [$fechaInicio, $fechaFin])->count();
        $pendientes    = LineaCaptura::where('estatus', 'pendiente')->count();

        // By payment method
        $porMetodo = Pago::whereBetween('fecha_pago', [$fechaInicio, $fechaFin])
            ->select('metodo_pago', DB::raw('COUNT(*) as total'), DB::raw('SUM(monto_pagado) as monto'))
            ->groupBy('metodo_pago')
            ->get();

        // By service
        $porServicio = Pago::whereBetween('fecha_pago', [$fechaInicio, $fechaFin])
            ->join('lineas_captura', 'pagos.linea_captura_id', '=', 'lineas_captura.id')
            ->join('catalogo_servicios', 'lineas_captura.catalogo_servicio_id', '=', 'catalogo_servicios.id')
            ->select('catalogo_servicios.nombre', DB::raw('COUNT(*) as total'), DB::raw('SUM(pagos.monto_pagado) as monto'))
            ->groupBy('catalogo_servicios.nombre')
            ->orderByDesc('monto')
            ->get();

        // Daily breakdown for chart
        $porDia = Pago::whereBetween('fecha_pago', [$fechaInicio, $fechaFin])
            ->select('fecha_pago', DB::raw('SUM(monto_pagado) as total'))
            ->groupBy('fecha_pago')
            ->orderBy('fecha_pago')
            ->get();

        return response()->json([
            'periodo'       => ['inicio' => $fechaInicio, 'fin' => $fechaFin],
            'total_pagado'  => round($totalPagado, 2),
            'total_pagos'   => $totalPagos,
            'pendientes'    => $pendientes,
            'por_metodo'    => $porMetodo,
            'por_servicio'  => $porServicio,
            'por_dia'       => $porDia,
        ]);
    }

    public function arqueo(Request $request)
    {
        $fecha = $request->fecha ?? now()->toDateString();
        $pagos = Pago::with(['alumno', 'lineaCaptura.servicio'])
            ->whereDate('fecha_pago', $fecha)
            ->get();

        return response()->json([
            'fecha'   => $fecha,
            'total'   => $pagos->sum('monto_pagado'),
            'count'   => $pagos->count(),
            'detalle' => $pagos,
        ]);
    }

    public function pagosEstudiante(Request $request, $alumnoId)
    {
        $pagos = Pago::with(['lineaCaptura.servicio', 'recibo'])
            ->where('alumno_id', $alumnoId)
            ->orderByDesc('fecha_pago')
            ->get();

        return response()->json($pagos);
    }
}
