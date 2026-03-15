<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\PlanEstudio;
use App\Models\Materia;

class PlanEstudioController extends Controller
{
    public function index(Request $request)
    {
        $query = PlanEstudio::with('licenciatura')
            ->withCount('materias as total_materias')
            ->orderByDesc('anio_inicio');

        if ($request->filled('licenciatura_id')) $query->where('licenciatura_id', $request->licenciatura_id);
        if ($request->filled('vigente'))         $query->where('vigente', filter_var($request->vigente, FILTER_VALIDATE_BOOLEAN));

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'licenciatura_id' => 'required|exists:licenciaturas,id',
            'clave'           => 'required|string|max:20|unique:planes_estudio,clave',
            'anio_inicio'     => 'required|digits:4',
            'vigente'         => 'boolean',
            'observaciones'   => 'nullable|string',
        ]);

        return response()->json(PlanEstudio::create($data)->load('licenciatura'), 201);
    }

    public function show($id)
    {
        $plan = PlanEstudio::with(['licenciatura', 'materias' => fn($q) => $q->orderBy('semestre')])
            ->findOrFail($id);

        // Group materias by semester for the curriculum view
        $malla = $plan->materias->groupBy('pivot.semestre')->sortKeys();

        return response()->json(array_merge($plan->toArray(), ['malla' => $malla]));
    }

    public function update(Request $request, $id)
    {
        $plan = PlanEstudio::findOrFail($id);

        $data = $request->validate([
            'clave'         => 'sometimes|string|max:20|unique:planes_estudio,clave,' . $id,
            'anio_inicio'   => 'sometimes|digits:4',
            'vigente'       => 'boolean',
            'observaciones' => 'nullable|string',
        ]);

        $plan->update($data);
        return response()->json($plan->fresh()->load('licenciatura'));
    }

    /** Sync materias al plan de estudio */
    public function syncMaterias(Request $request, $id)
    {
        $plan = PlanEstudio::findOrFail($id);

        $validated = $request->validate([
            'materias'              => 'required|array',
            'materias.*.materia_id' => 'required|exists:materias,id',
            'materias.*.semestre'   => 'required|integer|min:1|max:12',
        ]);

        // Build the sync array: pivot key => [semestre => X]
        $syncData = collect($validated['materias'])->mapWithKeys(fn($item) => [
            $item['materia_id'] => ['semestre' => $item['semestre']]
        ]);

        $plan->materias()->sync($syncData);

        return response()->json(['message' => 'Malla curricular actualizada.', 'total' => $syncData->count()]);
    }
}
