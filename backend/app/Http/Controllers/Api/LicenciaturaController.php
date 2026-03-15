<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Licenciatura;

class LicenciaturaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json(Licenciatura::orderBy('nombre')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'clave' => 'required|string|max:20|unique:licenciaturas',
            'nombre' => 'required|string|max:150',
            'modalidad' => 'nullable|string|max:40',
            'duracion_semestres' => 'nullable|integer',
            'activa' => 'boolean',
            'descripcion' => 'nullable|string'
        ]);

        // Manejar el mapeo de "estatus" a "activa" enviado desde el Frontend
        if ($request->has('estatus')) {
            $validated['activa'] = $request->estatus === 'activa';
        }

        $licenciatura = Licenciatura::create($validated);
        return response()->json($licenciatura, 201);
    }

    public function show(string $id)
    {
        $licenciatura = Licenciatura::findOrFail($id);
        return response()->json($licenciatura);
    }

    public function update(Request $request, string $id)
    {
        $licenciatura = Licenciatura::findOrFail($id);

        $validated = $request->validate([
            'clave' => 'required|string|max:20|unique:licenciaturas,clave,' . $id,
            'nombre' => 'required|string|max:150',
            'modalidad' => 'nullable|string|max:40',
            'duracion_semestres' => 'nullable|integer',
            'activa' => 'boolean',
            'descripcion' => 'nullable|string'
        ]);

        if ($request->has('estatus')) {
            $validated['activa'] = $request->estatus === 'activa';
        }

        $licenciatura->update($validated);
        return response()->json($licenciatura);
    }

    public function destroy(string $id)
    {
        $licenciatura = Licenciatura::findOrFail($id);
        $licenciatura->delete();
        return response()->json(['message' => 'Eliminada correctamente']);
    }
}
