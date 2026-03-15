<?php

namespace App\Http\Controllers\Api\Vinculacion;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\RepositorioProyectoServicio;

class VinculacionRepositorioController extends Controller
{
    public function index()
    {
        return response()->json(RepositorioProyectoServicio::orderBy('created_at', 'desc')->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'titulo' => 'required|string|max:255',
            'descripcion' => 'required|string',
            'archivo' => 'required|file|mimes:pdf|max:10240'
        ]);

        $path = $request->file('archivo')->store('vinculacion/repositorio', 'public');

        $repo = RepositorioProyectoServicio::create([
            'titulo' => $request->titulo,
            'descripcion' => $request->descripcion,
            'archivo_pdf' => $path,
            'activo' => true
        ]);

        return response()->json($repo, 201);
    }

    public function toggleActivo($id)
    {
        $repo = RepositorioProyectoServicio::findOrFail($id);
        $repo->activo = !$repo->activo;
        $repo->save();
        return response()->json($repo);
    }

    public function destroy($id)
    {
        $repo = RepositorioProyectoServicio::findOrFail($id);
        $repo->delete();

        return response()->json(['message' => 'Eliminado']);
    }
}
