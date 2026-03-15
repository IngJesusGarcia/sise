<?php

namespace App\Http\Controllers\Api\Vinculacion;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\FormatoServicioSocial;

class VinculacionFormatoController extends Controller
{
    public function index()
    {
        return response()->json(FormatoServicioSocial::with('subidoPor:id,name')->orderBy('created_at', 'desc')->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'archivo' => 'required|file|mimes:pdf|max:10240'
        ]);

        $path = $request->file('archivo')->store('vinculacion/formatos', 'public');

        $formato = FormatoServicioSocial::create([
            'nombre' => $request->nombre,
            'descripcion' => $request->descripcion,
            'archivo_pdf' => $path,
            'subido_por' => $request->user()->id,
            'activo' => true
        ]);

        return response()->json($formato, 201);
    }

    public function toggleActivo($id)
    {
        $formato = FormatoServicioSocial::findOrFail($id);
        $formato->activo = !$formato->activo;
        $formato->save();

        return response()->json($formato);
    }

    public function destroy($id)
    {
        $formato = FormatoServicioSocial::findOrFail($id);
        $formato->delete();

        return response()->json(['message' => 'Eliminado']);
    }
}
