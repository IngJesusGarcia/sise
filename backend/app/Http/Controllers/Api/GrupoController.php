<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Grupo;
use Illuminate\Support\Facades\DB;

class GrupoController extends Controller
{
    public function index(Request $request)
    {
        $grupos = Grupo::with(['materia', 'docente', 'periodo', 'licenciatura'])
            ->orderBy('periodo_id', 'desc')
            ->paginate($request->per_page ?? 20);

        // Formatear el nombre del docente (preservando estructura para frontend)
        $grupos->getCollection()->transform(function ($grupo) {
            $grupo->materia_nombre = $grupo->materia?->nombre;
            $grupo->docente_nombre = $grupo->docente?->nombre;
            $grupo->docente_ap = $grupo->docente?->apellido_paterno;
            $grupo->periodo_nombre = $grupo->periodo?->nombre;
            $grupo->licenciatura_nombre = $grupo->licenciatura?->nombre;
            $grupo->docente_nombre_completo = $grupo->docente_id ? "{$grupo->docente?->nombre} {$grupo->docente?->apellido_paterno}" : 'Sin Asignar';
            return $grupo;
        });

        return response()->json($grupos);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'materia_id' => 'required|exists:materias,id',
            'docente_id' => 'nullable|exists:docentes,id',
            'periodo_id' => 'required|exists:periodos,id',
            'salon' => 'nullable|string|max:30',
            'cupo_maximo' => 'required|integer|min:1',
            'clave_grupo' => 'required|string|max:20'
        ]);

        // Obtener licenciatura_id y plan_estudio_id y semestre a partir de la materia
        $planMateria = DB::table('plan_materia')->where('materia_id', $validated['materia_id'])->first();
        if (!$planMateria) {
            return response()->json(['error' => 'La materia seleccionada no pertenece a ningún plan de estudios.'], 422);
        }
        
        $planEstudio = DB::table('planes_estudio')->where('id', $planMateria->plan_estudio_id)->first();

        $grupo = Grupo::create([
            'licenciatura_id' => $planEstudio->licenciatura_id,
            'plan_estudio_id' => $planEstudio->id,
            'periodo_id' => $validated['periodo_id'],
            'docente_id' => $validated['docente_id'],
            'materia_id' => $validated['materia_id'],
            'clave_grupo' => $validated['clave_grupo'],
            'semestre' => $planMateria->semestre,
            'capacidad' => $validated['cupo_maximo'],
            'aula' => $validated['salon'],
            'activo' => true
        ]);

        return response()->json($grupo, 201);
    }

    public function show(string $id)
    {
        $grupo = Grupo::findOrFail($id);
        
        // Mapear campos para el frontend
        $grupo->salon = $grupo->aula;
        $grupo->cupo_maximo = $grupo->capacidad;

        return response()->json($grupo);
    }

    public function update(Request $request, string $id)
    {
        $grupo = Grupo::findOrFail($id);

        $validated = $request->validate([
            'materia_id' => 'required|exists:materias,id',
            'docente_id' => 'nullable|exists:docentes,id',
            'periodo_id' => 'required|exists:periodos,id',
            'salon' => 'nullable|string|max:30',
            'cupo_maximo' => 'required|integer|min:1',
            'clave_grupo' => 'required|string|max:20'
        ]);

        $planMateria = DB::table('plan_materia')->where('materia_id', $validated['materia_id'])->first();
        if (!$planMateria) {
            return response()->json(['error' => 'La materia seleccionada no pertenece a ningún plan de estudios.'], 422);
        }
        $planEstudio = DB::table('planes_estudio')->where('id', $planMateria->plan_estudio_id)->first();

        $grupo->update([
            'licenciatura_id' => $planEstudio->licenciatura_id,
            'plan_estudio_id' => $planEstudio->id,
            'periodo_id' => $validated['periodo_id'],
            'docente_id' => $validated['docente_id'],
            'materia_id' => $validated['materia_id'],
            'clave_grupo' => $validated['clave_grupo'],
            'semestre' => $planMateria->semestre,
            'capacidad' => $validated['cupo_maximo'],
            'aula' => $validated['salon'],
        ]);

        return response()->json($grupo);
    }

    public function destroy(string $id)
    {
        $grupo = Grupo::findOrFail($id);
        $grupo->delete();
        return response()->json(['message' => 'Grupo eliminado correctamente']);
    }
}
