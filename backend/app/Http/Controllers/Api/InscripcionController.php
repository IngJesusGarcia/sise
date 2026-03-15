<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Inscripcion;
use App\Models\Grupo;
use Illuminate\Support\Facades\DB;

class InscripcionController extends Controller
{
    public function index(Request $request)
    {
        $inscripciones = Inscripcion::with(['alumno', 'grupo.materia', 'periodo'])
            ->orderBy('id', 'desc')
            ->paginate($request->per_page ?? 20);
            
        // Formatting student names (preserving structure for frontend)
        $inscripciones->getCollection()->transform(function ($insc) {
            $insc->matricula = $insc->alumno?->matricula;
            $insc->alumno_nombre = $insc->alumno?->nombre;
            $insc->alumno_ap = $insc->alumno?->apellido_paterno;
            $insc->alumno_nombre_completo = "{$insc->alumno?->nombre} {$insc->alumno?->apellido_paterno}";
            $insc->clave_grupo = $insc->grupo?->clave_grupo;
            $insc->materia_nombre = $insc->grupo?->materia?->nombre;
            $insc->periodo_nombre = $insc->periodo?->nombre;
            return $insc;
        });

        return response()->json($inscripciones);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'estudiante_id' => 'required|exists:alumnos,id',
            'grupo_id' => 'required|exists:grupos,id',
            'periodo_id' => 'required|exists:periodos,id'
        ]);

        // Verifying space and duplicates
        $grupo = Grupo::findOrFail($validated['grupo_id']);
        if ($grupo->inscritos >= $grupo->capacidad) {
            return response()->json(['error' => 'El grupo ha alcanzado su cupo máximo.'], 422);
        }

        $exists = Inscripcion::where('alumno_id', $validated['estudiante_id'])
            ->where('grupo_id', $validated['grupo_id'])
            ->where('periodo_id', $validated['periodo_id'])
            ->exists();

        if ($exists) {
            return response()->json(['error' => 'El alumno ya está inscrito en este grupo.'], 422);
        }

        DB::beginTransaction();
        try {
            $inscripcion = Inscripcion::create([
                'alumno_id' => $validated['estudiante_id'],
                'grupo_id' => $validated['grupo_id'],
                'periodo_id' => $validated['periodo_id'],
                'estatus' => 'inscrito',
                'fecha_inscripcion' => date('Y-m-d')
            ]);
            
            // Increment group inscriptions
            $grupo->increment('inscritos');

            DB::commit();
            return response()->json($inscripcion, 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Error al guardar la inscripción.'], 500);
        }
    }

    public function show(string $id)
    {
        $inscripcion = Inscripcion::findOrFail($id);
        // Frontend uses "estudiante_id"
        $inscripcion->estudiante_id = $inscripcion->alumno_id;
        return response()->json($inscripcion);
    }

    public function update(Request $request, string $id)
    {
        $inscripcion = Inscripcion::findOrFail($id);

        $validated = $request->validate([
            'estudiante_id' => 'required|exists:alumnos,id',
            'grupo_id' => 'required|exists:grupos,id',
            'periodo_id' => 'required|exists:periodos,id',
            'estatus' => 'required|in:inscrito,baja,recursando'
        ]);

        DB::beginTransaction();
        try {
            // Check if group changed to update capacities
            if ($inscripcion->grupo_id != $validated['grupo_id']) {
                $oldGrupo = Grupo::findOrFail($inscripcion->grupo_id);
                $newGrupo = Grupo::findOrFail($validated['grupo_id']);
                
                if ($newGrupo->inscritos >= $newGrupo->capacidad) {
                    return response()->json(['error' => 'El nuevo grupo ha alcanzado su cupo máximo.'], 422);
                }
                
                $oldGrupo->decrement('inscritos');
                $newGrupo->increment('inscritos');
            }

            // Decrement capacity if status is Baja
            if ($inscripcion->estatus != 'baja' && $validated['estatus'] == 'baja') {
                 $grupo = Grupo::findOrFail($validated['grupo_id']);
                 $grupo->decrement('inscritos');
            } else if ($inscripcion->estatus == 'baja' && $validated['estatus'] != 'baja') {
                 $grupo = Grupo::findOrFail($validated['grupo_id']);
                 if ($grupo->inscritos >= $grupo->capacidad) {
                     return response()->json(['error' => 'El grupo ha alcanzado su cupo máximo, no se puede reactivar.'], 422);
                 }
                 $grupo->increment('inscritos');
            }

            $inscripcion->update([
                'alumno_id' => $validated['estudiante_id'],
                'grupo_id' => $validated['grupo_id'],
                'periodo_id' => $validated['periodo_id'],
                'estatus' => $validated['estatus']
            ]);

            DB::commit();
            return response()->json($inscripcion);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Error al actualizar la inscripción.'], 500);
        }
    }

    public function destroy(string $id)
    {
        $inscripcion = Inscripcion::findOrFail($id);
        DB::beginTransaction();
        try {
             if ($inscripcion->estatus != 'baja') {
                  $grupo = Grupo::findOrFail($inscripcion->grupo_id);
                  $grupo->decrement('inscritos');
             }
             $inscripcion->delete();
             DB::commit();
             return response()->json(['message' => 'Inscripción eliminada y cupo liberado correctamente']);
        } catch (\Exception $e) {
             DB::rollBack();
             return response()->json(['error' => 'Error al eliminar inscripción'], 500);
        }
    }
}
