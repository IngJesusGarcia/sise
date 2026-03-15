<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Alumno;
use App\Models\Calificacion;
use App\Models\Grupo;
use App\Models\Pago;
use App\Models\LineaCaptura;
use App\Models\Licenciatura;
use App\Models\Periodo;
use Illuminate\Support\Facades\DB;

class ReporteController extends Controller
{
    /**
     * Estudiantes por licenciatura
     */
    public function estudiantesPorCarrera()
    {
        $data = Licenciatura::withCount('alumnos')
            ->where('activa', true)
            ->get()
            ->map(fn($lic) => [
                'name' => $lic->nombre,
                'total' => $lic->alumnos_count,
            ]);

        return response()->json($data);
    }

    /**
     * Materias con mayor índice de reprobación
     */
    public function materiasReprobadas()
    {
        $data = Calificacion::select('materia_id', DB::raw('COUNT(*) as total_reprobados'))
            ->with('materia')
            ->where('estatus', 'reprobado')
            ->groupBy('materia_id')
            ->orderByDesc('total_reprobados')
            ->limit(10)
            ->get()
            ->map(fn($c) => [
                'name' => $c->materia->nombre ?? 'S/N',
                'reprobados' => $c->total_reprobados,
            ]);

        return response()->json($data);
    }

    /**
     * Promedio de calificaciones por grupo
     */
    public function promedioGrupos()
    {
        $data = Calificacion::select('grupo_id', DB::raw('AVG(calificacion_final) as promedio'))
            ->with(['grupo.materia'])
            ->whereNotNull('calificacion_final')
            ->groupBy('grupo_id')
            ->orderByDesc('promedio')
            ->limit(15)
            ->get()
            ->map(fn($c) => [
                'name' => ($c->grupo->materia->nombre ?? 'Grupo') . ' (G-' . $c->grupo_id . ')',
                'promedio' => round($c->promedio, 2),
            ]);

        return response()->json($data);
    }

    /**
     * Ingresos por periodo
     */
    public function ingresos()
    {
        $data = Pago::select(
                DB::raw("DATE_FORMAT(fecha_pago, '%Y-%m') as mes"),
                DB::raw('SUM(monto_pagado) as total')
            )
            ->whereNotNull('fecha_pago')
            ->groupBy('mes')
            ->orderBy('mes')
            ->limit(12)
            ->get()
            ->map(fn($p) => [
                'name' => $p->mes,
                'total' => (float) $p->total,
            ]);

        return response()->json($data);
    }

    /**
     * Resumen general del dashboard de reportes
     */
    public function resumen()
    {
        return response()->json([
            'total_estudiantes' => Alumno::where('estatus', 'activo')->count(),
            'total_egresados' => \App\Models\Egresado::count(),
            'total_titulados' => \App\Models\Egresado::where('estatus_titulacion', 'titulado')->count(),
            'promedio_general' => round(Calificacion::whereNotNull('calificacion_final')->avg('calificacion_final') ?? 0, 2),
        ]);
    }
}
