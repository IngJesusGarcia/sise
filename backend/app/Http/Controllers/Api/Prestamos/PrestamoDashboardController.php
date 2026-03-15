<?php

namespace App\Http\Controllers\Api\Prestamos;

use App\Http\Controllers\Controller;
use App\Models\EquipoPrestamo;
use App\Models\SolicitudPrestamo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PrestamoDashboardController extends Controller
{
    public function resumen()
    {
        $resumen = [
            'total_equipos' => EquipoPrestamo::count(),
            'equipos_disponibles' => EquipoPrestamo::where('estado', 'disponible')->count(),
            'equipos_prestados' => EquipoPrestamo::where('estado', 'prestado')->count(),
            'equipos_mantenimiento' => EquipoPrestamo::where('estado', 'mantenimiento')->count(),
            'solicitudes_pendientes' => SolicitudPrestamo::where('estatus', 'pendiente')->count(),
        ];

        $prestamos_por_mes = SolicitudPrestamo::select(
                DB::raw('count(*) as total'),
                DB::raw("DATE_FORMAT(fecha_prestamo, '%m-%Y') as mes")
            )
            ->groupBy('mes')
            ->orderBy('mes', 'desc')
            ->limit(6)
            ->get();

        return response()->json([
            'resumen' => $resumen,
            'grafica_mensual' => $prestamos_por_mes
        ]);
    }
}
