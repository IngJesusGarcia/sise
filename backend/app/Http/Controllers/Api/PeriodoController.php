<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Periodo;
use Illuminate\Support\Facades\DB;

class PeriodoController extends Controller
{
    public function index(Request $request)
    {
        $query = Periodo::orderByDesc('fecha_inicio');

        if ($request->filled('tipo'))    $query->where('tipo', $request->tipo);
        if ($request->filled('activo'))  $query->where('activo', filter_var($request->activo, FILTER_VALIDATE_BOOLEAN));
        if ($request->filled('buscar')) $query->where('nombre', 'like', '%' . $request->buscar . '%');

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nombre'                     => 'required|string|max:80|unique:periodos,nombre',
            'tipo'                       => 'required|in:semestral,cuatrimestral,anual',
            'fecha_inicio'               => 'required|date',
            'fecha_fin'                  => 'required|date|after:fecha_inicio',
            'fecha_inicio_inscripciones' => 'nullable|date',
            'fecha_fin_inscripciones'    => 'nullable|date',
        ]);
        $data['activo'] = false;

        return response()->json(Periodo::create($data), 201);
    }

    public function show($id)
    {
        return response()->json(Periodo::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $periodo = Periodo::findOrFail($id);

        $data = $request->validate([
            'nombre'                     => 'sometimes|string|max:80|unique:periodos,nombre,' . $id,
            'tipo'                       => 'sometimes|in:semestral,cuatrimestral,anual',
            'fecha_inicio'               => 'sometimes|date',
            'fecha_fin'                  => 'sometimes|date',
            'fecha_inicio_inscripciones' => 'nullable|date',
            'fecha_fin_inscripciones'    => 'nullable|date',
            'activo'                     => 'sometimes|boolean',
        ]);

        $periodo->update($data);
        return response()->json($periodo->fresh());
    }

    public function destroy($id)
    {
        Periodo::findOrFail($id)->delete();
        return response()->json(['message' => 'Periodo eliminado.']);
    }

    /** Activa un período y desactiva todos los demás */
    public function activar($id)
    {
        DB::transaction(function () use ($id) {
            Periodo::where('activo', true)->update(['activo' => false]);
            Periodo::findOrFail($id)->update(['activo' => true]);
        });
        return response()->json(['message' => 'Periodo activado correctamente.']);
    }

    /** Cierra el período activo */
    public function cerrar($id)
    {
        $periodo = Periodo::findOrFail($id);
        $periodo->update(['activo' => false]);
        return response()->json(['message' => 'Periodo cerrado.']);
    }
}
