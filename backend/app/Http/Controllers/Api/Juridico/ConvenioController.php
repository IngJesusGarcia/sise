<?php

namespace App\Http\Controllers\Api\Juridico;

use App\Http\Controllers\Controller;
use App\Models\ConvenioContrato;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ConvenioController extends Controller
{
    public function index(Request $request)
    {
        $q = ConvenioContrato::orderBy('fecha_vencimiento');
        
        if ($request->filled('buscar')) {
            $b = '%' . $request->buscar . '%';
            $q->where('numero_control', 'like', $b)
              ->orWhere('tipo_convenio', 'like', $b)
              ->orWhere('instituciones', 'like', $b);
        }
        
        return response()->json($q->paginate($request->per_page ?? 20));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'numero_control'    => 'required|string|max:50|unique:convenios_contratos',
            'tipo_convenio'     => 'required|string|max:100',
            'instituciones'     => 'required|string|max:255',
            'descripcion'       => 'nullable|string',
            'fecha_firma'       => 'nullable|date',
            'fecha_vencimiento' => 'nullable|date',
        ]);
        
        if ($request->hasFile('archivo')) {
            $data['archivo'] = $request->file('archivo')->store('juridico/convenios', 'public');
        }

        $conv = ConvenioContrato::create($data);
        return response()->json($conv, 201);
    }

    public function show($id)
    {
        return response()->json(ConvenioContrato::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $conv = ConvenioContrato::findOrFail($id);
        $data = $request->validate([
            'numero_control'    => "sometimes|string|max:50|unique:convenios_contratos,numero_control,{$id}",
            'tipo_convenio'     => 'sometimes|string|max:100',
            'instituciones'     => 'sometimes|string|max:255',
            'descripcion'       => 'nullable|string',
            'fecha_firma'       => 'nullable|date',
            'fecha_vencimiento' => 'nullable|date',
        ]);
        
        if ($request->hasFile('archivo')) {
            if ($conv->archivo) Storage::disk('public')->delete($conv->archivo);
            $data['archivo'] = $request->file('archivo')->store('juridico/convenios', 'public');
        }

        $conv->update($data);
        return response()->json($conv);
    }

    public function destroy($id)
    {
        $conv = ConvenioContrato::findOrFail($id);
        if ($conv->archivo) Storage::disk('public')->delete($conv->archivo);
        $conv->delete();
        return response()->json(['message' => 'Convenio eliminado.']);
    }
}
