<?php

namespace App\Http\Controllers\Api\Estudiantes;

use App\Http\Controllers\Controller;
use App\Models\Alumno;
use App\Models\PlanEstudio;
use App\Models\Calificacion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * KardexController — Kardex Inteligente SISE UNICH
 *
 * Endpoint: GET /api/kardex/{alumno_id}
 *
 * Calcula automáticamente:
 *  - Créditos acumulados / totales del plan
 *  - Porcentaje de avance de carrera
 *  - Materias aprobadas / reprobadas / pendientes
 *  - Promedio general (solo materias aprobadas)
 *  - Eficiencia terminal
 *  - Detalle completo por semestre
 */
class KardexController extends Controller
{
    public function show(Request $request, $alumnoId)
    {
        // ── 1. Cargar alumno con relaciones ──────────────────────────────────
        $alumno = Alumno::with(['licenciatura', 'planEstudio.materias', 'planEstudio.licenciatura'])
            ->findOrFail($alumnoId);

        $plan = $alumno->planEstudio;

        // ── 2. Obtener todas las calificaciones del alumno ───────────────
        // Agrupadas por materia_id para obtener la mejor calificación final
        $calificaciones = Calificacion::join('inscripciones', 'calificaciones.inscripcion_id', '=', 'inscripciones.id')
            ->join('grupos', 'inscripciones.grupo_id', '=', 'grupos.id')
            ->join('materias', 'grupos.materia_id', '=', 'materias.id')
            ->leftJoin('periodos', 'grupos.periodo_id', '=', 'periodos.id')
            ->where('inscripciones.alumno_id', $alumnoId)
            ->select([
                'materias.id as materia_id',
                'materias.clave',
                'materias.nombre as materia_nombre',
                'materias.creditos',
                'materias.tipo as materia_tipo',
                'periodos.nombre as periodo_nombre',
                'grupos.periodo_id',
                DB::raw('MAX(calificaciones.calificacion_final) as mejor_calificacion'),
                DB::raw('MAX(calificaciones.id) as calificacion_id'),
            ])
            ->groupBy(
                'materias.id', 'materias.clave', 'materias.nombre',
                'materias.creditos', 'materias.tipo',
                'periodos.nombre', 'grupos.periodo_id'
            )
            ->get()
            ->keyBy('materia_id');

        // ── 3. Construir detalle del plan vs realidad ────────────────────
        $detalle   = [];
        $creditosAcumulados = 0;
        $creditosTotales    = 0;
        $materiasAprobadas  = 0;
        $materiasReprobadas = 0;
        $materiasRecursando = 0;
        $materiasPendientes = 0;
        $sumaCalificaciones = 0.0;
        $calificacionesValidas = 0;

        if ($plan && $plan->materias->isNotEmpty()) {
            // Iterate plan materias ordered by semester
            $planMaterias = $plan->materias->sortBy('pivot.semestre');
            $creditosTotales = $planMaterias->sum('creditos');

            foreach ($planMaterias as $materia) {
                $semestre = $materia->pivot->semestre ?? 0;
                $creditos = $materia->creditos ?? 0;
                $calif    = $calificaciones->get($materia->id);

                if ($calif) {
                    $nota = (float) $calif->mejor_calificacion;
                    $aprobada = $nota >= 70;

                    if ($aprobada) {
                        $estatus = 'aprobada';
                        $creditosAcumulados += $creditos;
                        $materiasAprobadas++;
                        $sumaCalificaciones += $nota;
                        $calificacionesValidas++;
                    } else {
                        // Check if it's being retaken (inscribed in current period)
                        $estatus = 'reprobada';
                        $materiasReprobadas++;
                        $sumaCalificaciones += $nota;
                        $calificacionesValidas++;
                    }

                    $detalle[] = [
                        'materia_id'      => $materia->id,
                        'clave'           => $materia->clave,
                        'materia'         => $materia->nombre,
                        'tipo'            => $materia->tipo,
                        'semestre'        => $semestre,
                        'creditos'        => $creditos,
                        'calificacion'    => $nota,
                        'periodo'         => $calif->periodo_nombre ?? '—',
                        'estatus'         => $estatus,
                    ];
                } else {
                    // Not yet taken
                    $materiasPendientes++;
                    $detalle[] = [
                        'materia_id'   => $materia->id,
                        'clave'        => $materia->clave,
                        'materia'      => $materia->nombre,
                        'tipo'         => $materia->tipo,
                        'semestre'     => $semestre,
                        'creditos'     => $creditos,
                        'calificacion' => null,
                        'periodo'      => null,
                        'estatus'      => 'pendiente',
                    ];
                }
            }
        } else {
            // Fallback when no plan: use raw calificaciones
            foreach ($calificaciones as $calif) {
                $nota = (float) $calif->mejor_calificacion;
                $aprobada = $nota >= 70;
                $creditosTotales += $calif->creditos;

                if ($aprobada) {
                    $creditosAcumulados += $calif->creditos;
                    $materiasAprobadas++;
                    $sumaCalificaciones += $nota;
                    $calificacionesValidas++;
                } else {
                    $materiasReprobadas++;
                    $sumaCalificaciones += $nota;
                    $calificacionesValidas++;
                }
                $detalle[] = [
                    'materia_id'   => $calif->materia_id,
                    'clave'        => $calif->clave,
                    'materia'      => $calif->materia_nombre,
                    'tipo'         => $calif->materia_tipo,
                    'semestre'     => null,
                    'creditos'     => $calif->creditos,
                    'calificacion' => $nota,
                    'periodo'      => $calif->periodo_nombre,
                    'estatus'      => $aprobada ? 'aprobada' : 'reprobada',
                ];
            }
        }

        // ── 4. Cálculos finales ──────────────────────────────────────────
        $promedioGeneral = $calificacionesValidas > 0
            ? round($sumaCalificaciones / $calificacionesValidas, 2)
            : 0;

        $avanceCarrera = $creditosTotales > 0
            ? round(($creditosAcumulados / $creditosTotales) * 100, 1)
            : 0;

        $eficienciaTerminal = $avanceCarrera; // Same formula per spec

        // Group detalle by semester for frontend
        $detallePorSemestre = collect($detalle)
            ->groupBy('semestre')
            ->sortKeys()
            ->map(fn($items) => $items->values())
            ->toArray();

        return response()->json([
            'estudiante' => [
                'id'               => $alumno->id,
                'matricula'        => $alumno->matricula,
                'nombre'           => $alumno->nombre,
                'apellido_paterno' => $alumno->apellido_paterno,
                'apellido_materno' => $alumno->apellido_materno,
                'correo'           => $alumno->correo,
                'semestre_actual'  => $alumno->semestre_actual,
                'turno'            => $alumno->turno,
                'estatus'          => $alumno->estatus,
                'ciclo_ingreso'    => $alumno->ciclo_ingreso,
            ],
            'licenciatura' => $alumno->licenciatura?->only(['id', 'nombre', 'clave', 'duracion_semestres']),
            'plan_estudio' => $plan ? [
                'id'         => $plan->id,
                'clave'      => $plan->clave,
                'anio_inicio'=> $plan->anio_inicio,
                'vigente'    => $plan->vigente,
            ] : null,

            // Summary KPIs
            'materias_aprobadas'  => $materiasAprobadas,
            'materias_reprobadas' => $materiasReprobadas,
            'materias_pendientes' => $materiasPendientes,
            'creditos_acumulados' => $creditosAcumulados,
            'creditos_totales'    => $creditosTotales,
            'avance_carrera'      => $avanceCarrera,
            'promedio_general'    => $promedioGeneral,
            'eficiencia_terminal' => $eficienciaTerminal,
            'total_materias'      => $materiasAprobadas + $materiasReprobadas + $materiasPendientes,

            // Detailed data
            'detalle_kardex'       => $detalle,
            'detalle_por_semestre' => $detallePorSemestre,
        ]);
    }
}
