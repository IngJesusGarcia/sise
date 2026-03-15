<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Calificacion;
use App\Models\Inscripcion;
use App\Models\Grupo;
use Illuminate\Support\Facades\DB;

class CalificacionController extends Controller
{
    /**
     * Lista por grupo (o todas si admin)
     */
    public function index(Request $request)
    {
        $query = Calificacion::with(['alumno', 'materia', 'periodo', 'grupo']);

        if ($request->has('grupo_id')) {
            $query->where('grupo_id', $request->grupo_id);
        }

        $calificaciones = $query->join('alumnos', 'calificaciones.alumno_id', '=', 'alumnos.id')
            ->select('calificaciones.*')
            ->orderBy('alumnos.apellido_paterno')
            ->paginate($request->per_page ?? 20);

        $calificaciones->getCollection()->transform(function ($c) {
            $c->matricula = $c->alumno?->matricula;
            $c->alumno_nombre = $c->alumno?->nombre;
            $c->alumno_ap = $c->alumno?->apellido_paterno;
            $c->alumno_nombre_completo = "{$c->alumno?->nombre} {$c->alumno?->apellido_paterno}";
            $c->materia_nombre = $c->materia?->nombre;
            $c->periodo_nombre = $c->periodo?->nombre;
            $c->clave_grupo = $c->grupo?->clave_grupo;
            return $c;
        });

        return response()->json($calificaciones);
    }

    /**
     * Obtener alumnos inscritos en un grupo para pantalla de captura masiva
     */
    public function alumnosPorGrupo(string $grupoId)
    {
        $grupo = Grupo::with('materia')->findOrFail($grupoId);

        $inscripciones = Inscripcion::select(
                'inscripciones.*',
                'alumnos.matricula',
                'alumnos.nombre as alumno_nombre',
                'alumnos.apellido_paterno as alumno_ap',
                'alumnos.apellido_materno as alumno_am'
            )
            ->join('alumnos', 'inscripciones.alumno_id', '=', 'alumnos.id')
            ->where('inscripciones.grupo_id', $grupoId)
            ->where('inscripciones.estatus', 'inscrito')
            ->orderBy('alumnos.apellido_paterno')
            ->get();

        // Pre-fetch all existing calificaciones for this group to avoid N+1
        $existingCalificaciones = Calificacion::where('grupo_id', $grupoId)
            ->get()
            ->keyBy('alumno_id');

        $inscripciones->transform(function ($insc) use ($existingCalificaciones) {
            $cal = $existingCalificaciones->get($insc->alumno_id);
            
            $insc->alumno_nombre_completo = "{$insc->alumno_nombre} {$insc->alumno_ap} {$insc->alumno_am}";
            $insc->calificacion_id = $cal->id ?? null;
            $insc->calificacion_parcial1 = $cal->calificacion_parcial1 ?? null;
            $insc->calificacion_parcial2 = $cal->calificacion_parcial2 ?? null;
            $insc->calificacion_parcial3 = $cal->calificacion_parcial3 ?? null;
            $insc->calificacion_final = $cal->calificacion_final ?? null;
            $insc->calificacion_extraordinario = $cal->calificacion_extraordinario ?? null;
            $insc->estatus_calificacion = $cal->estatus ?? 'pendiente';
            return $insc;
        });

        return response()->json([
            'grupo' => $grupo,
            'alumnos' => $inscripciones
        ]);
    }

    /**
     * Crear calificacion individual
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'alumno_id' => 'required|exists:alumnos,id',
            'grupo_id' => 'required|exists:grupos,id',
            'calificacion_parcial1' => 'nullable|numeric|min:0|max:10',
            'calificacion_parcial2' => 'nullable|numeric|min:0|max:10',
            'calificacion_parcial3' => 'nullable|numeric|min:0|max:10',
            'calificacion_final' => 'nullable|numeric|min:0|max:10',
            'calificacion_extraordinario' => 'nullable|numeric|min:0|max:10',
        ]);

        $grupo = Grupo::findOrFail($validated['grupo_id']);

        // Auto-calcular calificacion_final si no se manda
        $parciales = array_filter([
            $validated['calificacion_parcial1'] ?? null,
            $validated['calificacion_parcial2'] ?? null,
            $validated['calificacion_parcial3'] ?? null,
        ]);
        $final = $validated['calificacion_final'] ?? (!empty($parciales) ? round(array_sum($parciales) / count($parciales), 2) : null);

        // Determinar estatus
        $estatus = 'pendiente';
        if ($final !== null) {
            $estatus = $final >= 6 ? 'aprobado' : 'reprobado';
        }

        // Buscar inscripcion del alumno en este grupo
        $inscripcion = Inscripcion::where('alumno_id', $validated['alumno_id'])
            ->where('grupo_id', $validated['grupo_id'])
            ->first();

        $calificacion = Calificacion::updateOrCreate(
            [
                'alumno_id' => $validated['alumno_id'],
                'grupo_id' => $validated['grupo_id'],
                'materia_id' => $grupo->materia_id,
                'periodo_id' => $grupo->periodo_id,
            ],
            [
                'inscripcion_id' => $inscripcion?->id,
                'docente_id' => $grupo->docente_id,
                'calificacion_parcial1' => $validated['calificacion_parcial1'] ?? null,
                'calificacion_parcial2' => $validated['calificacion_parcial2'] ?? null,
                'calificacion_parcial3' => $validated['calificacion_parcial3'] ?? null,
                'calificacion_final' => $final,
                'calificacion_extraordinario' => $validated['calificacion_extraordinario'] ?? null,
                'estatus' => $estatus,
                'capturado_por' => auth()->id(),
                'fecha_captura' => now(),
            ]
        );

        return response()->json($calificacion, 201);
    }

    public function show(string $id)
    {
        return response()->json(Calificacion::findOrFail($id));
    }

    public function update(Request $request, string $id)
    {
        $calificacion = Calificacion::findOrFail($id);

        $validated = $request->validate([
            'calificacion_parcial1' => 'nullable|numeric|min:0|max:10',
            'calificacion_parcial2' => 'nullable|numeric|min:0|max:10',
            'calificacion_parcial3' => 'nullable|numeric|min:0|max:10',
            'calificacion_final' => 'nullable|numeric|min:0|max:10',
            'calificacion_extraordinario' => 'nullable|numeric|min:0|max:10',
        ]);

        $parciales = array_filter([
            $validated['calificacion_parcial1'] ?? $calificacion->calificacion_parcial1,
            $validated['calificacion_parcial2'] ?? $calificacion->calificacion_parcial2,
            $validated['calificacion_parcial3'] ?? $calificacion->calificacion_parcial3,
        ]);

        $final = $validated['calificacion_final'] ?? (!empty($parciales) ? round(array_sum($parciales) / count($parciales), 2) : null);
        $estatus = 'pendiente';
        if ($final !== null) {
            $estatus = $final >= 6 ? 'aprobado' : 'reprobado';
        }

        $calificacion->update(array_merge($validated, [
            'calificacion_final' => $final,
            'estatus' => $estatus,
            'capturado_por' => auth()->id(),
            'fecha_captura' => now(),
        ]));

        return response()->json($calificacion);
    }

    public function destroy(string $id)
    {
        Calificacion::findOrFail($id)->delete();
        return response()->json(['message' => 'Calificación eliminada']);
    }
}
