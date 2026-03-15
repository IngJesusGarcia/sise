<?php

namespace App\Http\Controllers\Api\Vinculacion;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ReglamentoServicioSocial;

class VinculacionReglamentoController extends Controller
{
    public function index()
    {
        return response()->json(ReglamentoServicioSocial::orderBy('created_at', 'desc')->get());
    }

    public function getActivo()
    {
        $reglamento = ReglamentoServicioSocial::where('activo', true)->first();
        return response()->json($reglamento);
    }

    public function store(Request $request)
    {
        $request->validate([
            'titulo' => 'required|string|max:255',
            'version' => 'nullable|string',
            'archivo' => 'required|file|mimes:pdf|max:10240'
        ]);

        $path = $request->file('archivo')->store('vinculacion/reglamentos', 'public');

        // Desactivar todos los demás reglamentos
        ReglamentoServicioSocial::where('activo', true)->update(['activo' => false]);

        $reglamento = ReglamentoServicioSocial::create([
            'titulo' => $request->titulo,
            'archivo_pdf' => $path,
            'version' => $request->version,
            'activo' => true
        ]);

        return response()->json($reglamento, 201);
    }

    public function setActivo($id)
    {
        ReglamentoServicioSocial::where('activo', true)->update(['activo' => false]);

        $reglamento = ReglamentoServicioSocial::findOrFail($id);
        $reglamento->activo = true;
        $reglamento->save();

        return response()->json($reglamento);
    }

    public function destroy($id)
    {
        $reglamento = ReglamentoServicioSocial::findOrFail($id);
        $reglamento->delete();

        return response()->json(['message' => 'Eliminado']);
    }
}
