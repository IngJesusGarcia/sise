<?php

namespace App\Http\Controllers\Api\Correspondencia;

use App\Http\Controllers\Controller;
use App\Models\TipoDocumento;
use Illuminate\Http\Request;

class TipoDocumentoController extends Controller
{
    public function index(Request $request)
    {
        $q = TipoDocumento::query();
        if ($request->filled('activo')) $q->where('activo', (bool) $request->activo);
        return response()->json($q->orderBy('nombre')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nombre'      => 'required|string|max:100|unique:tipos_documento',
            'descripcion' => 'nullable|string|max:300',
            'activo'      => 'boolean',
        ]);
        return response()->json(TipoDocumento::create($data), 201);
    }

    public function update(Request $request, $id)
    {
        $tipo = TipoDocumento::findOrFail($id);
        $data = $request->validate([
            'nombre'      => 'sometimes|string|max:100|unique:tipos_documento,nombre,' . $id,
            'descripcion' => 'nullable|string|max:300',
            'activo'      => 'boolean',
        ]);
        $tipo->update($data);
        return response()->json($tipo->fresh());
    }

    public function destroy($id)
    {
        $tipo = TipoDocumento::findOrFail($id);
        if ($tipo->documentos()->count() > 0) {
            return response()->json(['message' => 'No se puede eliminar: tiene documentos asociados.'], 422);
        }
        $tipo->delete();
        return response()->json(['message' => 'Tipo eliminado.']);
    }
}
