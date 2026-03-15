<?php

namespace App\Http\Controllers\Api\Prestamos;

use App\Http\Controllers\Controller;
use App\Models\EquipoPrestamo;
use Illuminate\Http\Request;

class EquipoPrestamoController extends Controller
{
    public function index(Request $request)
    {
        $query = EquipoPrestamo::query();

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nombre_equipo', 'like', "%{$search}%")
                  ->orWhere('codigo_inventario', 'like', "%{$search}%")
                  ->orWhere('categoria', 'like', "%{$search}%");
            });
        }

        if ($request->has('estado')) {
            $query->where('estado', $request->estado);
        }

        return response()->json($query->paginate(15));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'codigo_inventario' => 'required|unique:equipos_prestamo',
            'nombre_equipo' => 'required|string',
            'categoria' => 'required|string',
            'descripcion' => 'nullable|string',
            'ubicacion' => 'nullable|string',
            'fecha_registro' => 'required|date',
        ]);

        $equipo = EquipoPrestamo::create($validated);

        return response()->json($equipo, 201);
    }

    public function show(EquipoPrestamo $equipo)
    {
        return response()->json($equipo);
    }

    public function update(Request $request, EquipoPrestamo $equipo)
    {
        $validated = $request->validate([
            'codigo_inventario' => 'required|unique:equipos_prestamo,codigo_inventario,' . $equipo->id,
            'nombre_equipo' => 'required|string',
            'categoria' => 'required|string',
            'descripcion' => 'nullable|string',
            'ubicacion' => 'nullable|string',
            'estado' => 'required|in:disponible,prestado,mantenimiento',
        ]);

        $equipo->update($validated);

        return response()->json($equipo);
    }

    public function destroy(EquipoPrestamo $equipo)
    {
        if ($equipo->estado === 'prestado') {
            return response()->json(['message' => 'No se puede eliminar un equipo que está prestado'], 422);
        }

        $equipo->delete();

        return response()->json(null, 204);
    }

    public function disponibles()
    {
        $equipos = EquipoPrestamo::where('estado', 'disponible')->get();
        return response()->json($equipos);
    }
}
