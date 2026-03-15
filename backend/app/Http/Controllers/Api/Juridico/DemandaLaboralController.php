<?php

namespace App\Http\Controllers\Api\Juridico;

use App\Http\Controllers\Controller;
use App\Models\DemandaLaboral;
use Illuminate\Http\Request;

class DemandaLaboralController extends Controller
{
    public function index(Request $request)
    {
        $q = DemandaLaboral::orderByDesc('created_at');
        
        if ($request->filled('buscar')) {
            $b = '%' . $request->buscar . '%';
            $q->where('numero_progresivo', 'like', $b)
              ->orWhere('nombre_trabajador', 'like', $b)
              ->orWhere('numero_expediente', 'like', $b);
        }
        
        return response()->json($q->paginate($request->per_page ?? 20));
    }

    public function store(Request $request)
    {
        $data = $this->validateDemanda($request);
        $demanda = DemandaLaboral::create($data);
        return response()->json($demanda, 201);
    }

    public function show($id)
    {
        return response()->json(DemandaLaboral::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $demanda = DemandaLaboral::findOrFail($id);
        $data = $this->validateDemanda($request, $id);
        $demanda->update($data);
        return response()->json($demanda);
    }

    public function destroy($id)
    {
        DemandaLaboral::findOrFail($id)->delete();
        return response()->json(['message' => 'Demanda eliminada.']);
    }

    private function validateDemanda(Request $request, $id = null)
    {
        $uniqueRule = $id ? "unique:demandas_laborales,numero_progresivo,{$id}" : "unique:demandas_laborales";
        return $request->validate([
            'numero_progresivo'    => "required|string|max:50|{$uniqueRule}",
            'fecha_demanda'        => 'nullable|date',
            'nombre_trabajador'    => 'required|string|max:150',
            'numero_expediente'    => 'nullable|string|max:50',
            'prestacion_principal' => 'nullable|string',
            'fecha_emplazamiento'  => 'nullable|date',
            'fecha_contestacion'   => 'nullable|date',
            'desahogo_pruebas'     => 'nullable|string',
            'fecha_laudo'          => 'nullable|date',
            'resultado'            => 'nullable|string|max:150',
            'amparo'               => 'boolean',
            'ejecucion_laudo'      => 'nullable|string',
            'interlocutoria'       => 'nullable|string',
            'observaciones'        => 'nullable|string',
        ]);
    }
}
