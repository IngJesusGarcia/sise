<?php

namespace App\Http\Controllers\Api\Juridico;

use App\Http\Controllers\Controller;
use App\Models\CorrespondenciaJuridica;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CorrespondenciaJuridicaController extends Controller
{
    public function index(Request $request)
    {
        $q = CorrespondenciaJuridica::with('abogado')->orderByDesc('fecha')->orderByDesc('created_at');
        
        if ($request->filled('buscar')) {
            $b = '%' . $request->buscar . '%';
            $q->where('folio', 'like', $b)
              ->orWhere('asunto', 'like', $b)
              ->orWhereHas('abogado', fn($ab) => $ab->where('nombre', 'like', $b));
        }
        if ($request->filled('estatus')) $q->where('estatus', $request->estatus);
        
        return response()->json($q->paginate($request->per_page ?? 20));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'tipo_documento' => 'required|string|max:100',
            'asunto'         => 'required|string|max:255',
            'abogado_id'     => 'nullable|exists:abogados,id',
            'fecha'          => 'required|date',
            'estatus'        => 'in:registrado,en_proceso,atendido,archivado',
        ]);
        
        $count = CorrespondenciaJuridica::count() + 1;
        $data['folio'] = 'JUR-' . date('Y') . '-' . str_pad($count, 6, '0', STR_PAD_LEFT);
        
        if ($request->hasFile('archivo')) {
            $data['archivo'] = $request->file('archivo')->store('juridico/correspondencia', 'public');
        }

        $doc = CorrespondenciaJuridica::create($data);
        return response()->json($doc->load('abogado'), 201);
    }

    public function show($id)
    {
        return response()->json(CorrespondenciaJuridica::with('abogado')->findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $doc = CorrespondenciaJuridica::findOrFail($id);
        $data = $request->validate([
            'tipo_documento' => 'sometimes|string|max:100',
            'asunto'         => 'sometimes|string|max:255',
            'abogado_id'     => 'nullable|exists:abogados,id',
            'fecha'          => 'sometimes|date',
            'estatus'        => 'sometimes|in:registrado,en_proceso,atendido,archivado',
        ]);
        
        if ($request->hasFile('archivo')) {
            if ($doc->archivo) Storage::disk('public')->delete($doc->archivo);
            $data['archivo'] = $request->file('archivo')->store('juridico/correspondencia', 'public');
        }

        $doc->update($data);
        return response()->json($doc->load('abogado'));
    }

    public function destroy($id)
    {
        $doc = CorrespondenciaJuridica::findOrFail($id);
        if ($doc->archivo) Storage::disk('public')->delete($doc->archivo);
        $doc->delete();
        return response()->json(['message' => 'Documento eliminado.']);
    }
}
