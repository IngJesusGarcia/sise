<?php

namespace App\Http\Controllers\Api\Estudiantes;

use App\Http\Controllers\Controller;
use App\Models\Alumno;
use App\Models\Periodo;
use App\Models\Calificacion;
use Illuminate\Http\Request;

class BoletaController extends Controller
{
    /**
     * Generar boleta de calificaciones para un estudiante en un periodo específico
     */
    public function getBoleta(Request $request, $estudianteId, $periodoId)
    {
        $alumno = Alumno::with(['licenciatura', 'planEstudio'])->findOrFail($estudianteId);
        $periodo = Periodo::findOrFail($periodoId);

        // Validar alcance (scope)
        $scope = $request->module_scope ?? 'full';
        if ($scope === 'own' && $request->user()->alumno?->id !== $alumno->id) {
            return response()->json(['message' => 'Solo puedes ver tu propia boleta.'], 403);
        }

        $calificaciones = Calificacion::with(['materia', 'docente', 'grupo'])
            ->where('alumno_id', $alumno->id)
            ->where('periodo_id', $periodo->id)
            ->get();

        $promedioParcial = $calificaciones->whereNotNull('calificacion_final')->avg('calificacion_final');

        return response()->json([
            'alumno' => $alumno,
            'periodo' => $periodo,
            'calificaciones' => $calificaciones,
            'promedio_periodo' => $promedioParcial ? round($promedioParcial, 2) : 0,
            'fecha_emision' => now()->format('Y-m-d H:i:s')
        ]);
    }
}
