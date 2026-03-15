<?php

namespace App\Http\Controllers\Api\Juridico;

use App\Http\Controllers\Controller;
use App\Models\ExpedienteJuridico;
use Illuminate\Http\Request;

class ExpedienteController extends Controller
{
    public function index(Request $request)
    {
        $q = ExpedienteJuridico::with('abogado')->orderByDesc('created_at');
        
        if ($request->filled('buscar')) {
            $b = '%' . $request->buscar . '%';
            $q->where('numero_expediente', 'like', $b)
              ->orWhere('categoria', 'like', $b)
              ->orWhere('juzgado', 'like', $b)
              ->orWhereHas('abogado', fn($ab) => $ab->where('nombre', 'like', $b));
        }
        if ($request->filled('estatus')) $q->where('estatus', $request->estatus);
        if ($request->filled('abogado_id')) $q->where('abogado_id', $request->abogado_id);
        
        return response()->json($q->paginate($request->per_page ?? 20));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'numero_expediente' => 'required|string|max:50|unique:expedientes_juridicos',
            'categoria'         => 'required|string|max:100',
            'juzgado'           => 'nullable|string|max:150',
            'abogado_id'        => 'nullable|exists:abogados,id',
            'fecha_inicio'      => 'nullable|date',
            'estatus'           => 'in:activo,concluido,suspendido,archivado',
            'observaciones'     => 'nullable|string',
        ]);
        
        $exp = ExpedienteJuridico::create($data);
        return response()->json($exp->load('abogado'), 201);
    }

    public function show($id)
    {
        return response()->json(ExpedienteJuridico::with('abogado')->findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $exp = ExpedienteJuridico::findOrFail($id);
        $data = $request->validate([
            'numero_expediente' => "sometimes|string|max:50|unique:expedientes_juridicos,numero_expediente,{$id}",
            'categoria'         => 'sometimes|string|max:100',
            'juzgado'           => 'nullable|string|max:150',
            'abogado_id'        => 'nullable|exists:abogados,id',
            'fecha_inicio'      => 'nullable|date',
            'estatus'           => 'sometimes|in:activo,concluido,suspendido,archivado',
            'observaciones'     => 'nullable|string',
        ]);
        
        $exp->update($data);
        return response()->json($exp->load('abogado'));
    }

    public function destroy($id)
    {
        ExpedienteJuridico::findOrFail($id)->delete();
        return response()->json(['message' => 'Expediente eliminado.']);
    }
}
