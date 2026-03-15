<?php

namespace App\Http\Controllers\Api\Juridico;

use App\Http\Controllers\Controller;
use App\Models\Abogado;
use Illuminate\Http\Request;

class AbogadoController extends Controller
{
    public function index(Request $request)
    {
        $q = Abogado::query();
        if ($request->filled('buscar')) {
            $b = '%' . $request->buscar . '%';
            $q->where('nombre', 'like', $b)
              ->orWhere('especialidad', 'like', $b);
        }
        if ($request->filled('estatus')) $q->where('estatus', $request->boolean('estatus'));
        
        return response()->json($q->orderBy('nombre')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nombre'       => 'required|string|max:150',
            'telefono'     => 'nullable|string|max:20',
            'correo'       => 'nullable|email|max:100',
            'especialidad' => 'nullable|string|max:150',
            'estatus'      => 'boolean',
        ]);
        
        $abogado = Abogado::create($data);
        return response()->json($abogado, 201);
    }

    public function show($id)
    {
        return response()->json(Abogado::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $abogado = Abogado::findOrFail($id);
        $data = $request->validate([
            'nombre'       => 'sometimes|string|max:150',
            'telefono'     => 'nullable|string|max:20',
            'correo'       => 'nullable|email|max:100',
            'especialidad' => 'nullable|string|max:150',
            'estatus'      => 'boolean',
        ]);
        
        $abogado->update($data);
        return response()->json($abogado);
    }

    public function destroy($id)
    {
        Abogado::findOrFail($id)->delete();
        return response()->json(['message' => 'Abogado eliminado.']);
    }
}
