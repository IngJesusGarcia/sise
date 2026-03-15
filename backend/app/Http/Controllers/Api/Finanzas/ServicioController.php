<?php

namespace App\Http\Controllers\Api\Finanzas;

use App\Http\Controllers\Controller;
use App\Models\CatalogoServicio;
use Illuminate\Http\Request;

class ServicioController extends Controller
{
    public function index(Request $request)
    {
        $query = CatalogoServicio::orderBy('nombre');
        if ($request->filled('buscar')) {
            $b = '%' . $request->buscar . '%';
            $query->where(fn($q) => $q->where('nombre', 'like', $b)->orWhere('clave', 'like', $b));
        }
        if ($request->filled('activo')) $query->where('activo', (bool) $request->activo);
        return response()->json($query->paginate($request->per_page ?? 20));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'clave'       => 'required|string|max:20|unique:catalogo_servicios',
            'nombre'      => 'required|string|max:150',
            'descripcion' => 'nullable|string',
            'costo'       => 'required|numeric|min:0',
            'activo'      => 'boolean',
        ]);
        return response()->json(CatalogoServicio::create($data), 201);
    }

    public function show($id)
    {
        return response()->json(CatalogoServicio::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $servicio = CatalogoServicio::findOrFail($id);
        $data = $request->validate([
            'clave'       => 'sometimes|string|max:20|unique:catalogo_servicios,clave,' . $id,
            'nombre'      => 'sometimes|string|max:150',
            'descripcion' => 'nullable|string',
            'costo'       => 'sometimes|numeric|min:0',
            'activo'      => 'boolean',
        ]);
        $servicio->update($data);
        return response()->json($servicio->fresh());
    }

    public function destroy($id)
    {
        CatalogoServicio::findOrFail($id)->delete();
        return response()->json(['message' => 'Servicio eliminado.']);
    }
}
