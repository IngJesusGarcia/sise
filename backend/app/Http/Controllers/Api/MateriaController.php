<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Materia;
use App\Models\PlanEstudio;
use Illuminate\Support\Facades\DB;

class MateriaController extends Controller
{
    public function index()
    {
        $materias = Materia::select(
                'materias.*', 
                'plan_materia.semestre', 
                'planes_estudio.licenciatura_id',
                'licenciaturas.nombre as licenciatura_nombre'
            )
            ->leftJoin('plan_materia', 'materias.id', '=', 'plan_materia.materia_id')
            ->leftJoin('planes_estudio', 'plan_materia.plan_estudio_id', '=', 'planes_estudio.id')
            ->leftJoin('licenciaturas', 'planes_estudio.licenciatura_id', '=', 'licenciaturas.id')
            ->orderBy('materias.nombre')
            ->get();
            
        return response()->json($materias);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'clave' => 'required|string|max:20|unique:materias',
            'nombre' => 'required|string|max:150',
            'creditos' => 'required|integer|min:1',
            'licenciatura_id' => 'required|exists:licenciaturas,id',
            'semestre' => 'required|integer|min:1|max:12',
            'horas_teoricas' => 'nullable|integer',
            'horas_practicas' => 'nullable|integer',
            'tipo' => 'nullable|string'
        ]);

        DB::beginTransaction();
        try {
            $materia = Materia::create([
                'clave' => $validated['clave'],
                'nombre' => $validated['nombre'],
                'creditos' => $validated['creditos'],
                'horas_teoricas' => $validated['horas_teoricas'] ?? 2,
                'horas_practicas' => $validated['horas_practicas'] ?? 1,
                'tipo' => $validated['tipo'] ?? 'obligatoria',
                'activa' => true,
            ]);

            // Obtener el plan de estudios vigente para la licenciatura
            $plan = PlanEstudio::where('licenciatura_id', $validated['licenciatura_id'])
                               ->where('vigente', true)
                               ->first();

            // Si no hay plan vigente, creamos uno por defecto
            if (!$plan) {
                $plan = PlanEstudio::create([
                    'licenciatura_id' => $validated['licenciatura_id'],
                    'clave' => 'PLAN-' . date('Y'),
                    'anio_inicio' => date('Y'),
                    'vigente' => true
                ]);
            }

            // Asociar materia al plan
            DB::table('plan_materia')->insert([
                'plan_estudio_id' => $plan->id,
                'materia_id' => $materia->id,
                'semestre' => $validated['semestre']
            ]);

            DB::commit();

            // Cargar datos para respuesta
            $materia->licenciatura_id = $validated['licenciatura_id'];
            $materia->semestre = $validated['semestre'];

            return response()->json($materia, 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function show(string $id)
    {
        $materia = Materia::select(
                'materias.*', 
                'plan_materia.semestre', 
                'planes_estudio.licenciatura_id'
            )
            ->leftJoin('plan_materia', 'materias.id', '=', 'plan_materia.materia_id')
            ->leftJoin('planes_estudio', 'plan_materia.plan_estudio_id', '=', 'planes_estudio.id')
            ->findOrFail($id);
            
        return response()->json($materia);
    }

    public function update(Request $request, string $id)
    {
        $materia = Materia::findOrFail($id);

        $validated = $request->validate([
            'clave' => 'required|string|max:20|unique:materias,clave,' . $id,
            'nombre' => 'required|string|max:150',
            'creditos' => 'required|integer|min:1',
            'licenciatura_id' => 'required|exists:licenciaturas,id',
            'semestre' => 'required|integer|min:1|max:12'
        ]);

        DB::beginTransaction();
        try {
            $materia->update([
                'clave' => $validated['clave'],
                'nombre' => $validated['nombre'],
                'creditos' => $validated['creditos'],
            ]);

            // Actualizar la relación plan_materia
            // Buscar si ya tiene un plan
            $relacion = DB::table('plan_materia')->where('materia_id', $id)->first();
            
            $plan = PlanEstudio::where('licenciatura_id', $validated['licenciatura_id'])
                               ->where('vigente', true)
                               ->first();
                               
            if (!$plan) {
                $plan = PlanEstudio::create([
                    'licenciatura_id' => $validated['licenciatura_id'],
                    'clave' => 'PLAN-' . date('Y'),
                    'anio_inicio' => date('Y'),
                    'vigente' => true
                ]);
            }

            if ($relacion) {
                DB::table('plan_materia')
                    ->where('materia_id', $id)
                    ->update([
                        'plan_estudio_id' => $plan->id,
                        'semestre' => $validated['semestre']
                    ]);
            } else {
                DB::table('plan_materia')->insert([
                    'plan_estudio_id' => $plan->id,
                    'materia_id' => $materia->id,
                    'semestre' => $validated['semestre']
                ]);
            }

            DB::commit();

            $materia->licenciatura_id = $validated['licenciatura_id'];
            $materia->semestre = $validated['semestre'];

            return response()->json($materia);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function destroy(string $id)
    {
        $materia = Materia::findOrFail($id);
        $materia->delete();
        return response()->json(['message' => 'Materia eliminada correctamente']);
    }
}
