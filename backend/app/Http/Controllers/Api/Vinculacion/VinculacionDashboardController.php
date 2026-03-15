<?php

namespace App\Http\Controllers\Api\Vinculacion;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Alumno;
use App\Models\ServicioSocialRegistro;
use Illuminate\Support\Facades\DB;

class VinculacionDashboardController extends Controller
{
    public function getResumen()
    {
        // 1. Estudiantes con Servicio Social Habilitado vs Total Alumnos
        $totalAlumnosHabilitados = Alumno::where('servicio_social_activo', true)->count();
        $totalAlumnos = Alumno::count();

        // 2. Estatus actual de servicio social (los que están habilitados y tienen registro)
        $estatusCounts = ServicioSocialRegistro::select('estatus', DB::raw('count(*) as total'))
            ->groupBy('estatus')
            ->pluck('total', 'estatus')
            ->toArray();

        // 3. Rezagados (Tienen el servicio habilitado pero NO han empezado o no tienen registro)
        $alumnosRezagados = Alumno::where('servicio_social_activo', true)
                                  ->doesntHave('servicioSocial')
                                  ->count();

        // 4. Por Licenciatura (de los que sí tienen servicioSocial)
        $porLicenciatura = DB::table('servicio_social_registros')
            ->join('alumnos', 'servicio_social_registros.estudiante_id', '=', 'alumnos.id')
            ->join('licenciaturas', 'alumnos.licenciatura_id', '=', 'licenciaturas.id')
            ->select('licenciaturas.nombre', DB::raw('count(servicio_social_registros.id) as total'))
            ->groupBy('licenciaturas.nombre')
            ->get();

        return response()->json([
            'resumen' => [
                'total_habilitados' => $totalAlumnosHabilitados,
                'no_habilitados' => $totalAlumnos - $totalAlumnosHabilitados,
                'rezagados' => $alumnosRezagados,
            ],
            'estatus' => [
                'registrado' => $estatusCounts['registrado'] ?? 0,
                'en_proceso' => $estatusCounts['en proceso'] ?? 0,
                'terminado' => $estatusCounts['terminado'] ?? 0,
                'liberado' => $estatusCounts['liberado'] ?? 0,
            ],
            'por_carrera' => $porLicenciatura
        ]);
    }
}
