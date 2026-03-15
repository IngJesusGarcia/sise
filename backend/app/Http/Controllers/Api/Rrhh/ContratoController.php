<?php

namespace App\Http\Controllers\Api\Rrhh;

use App\Http\Controllers\Controller;
use App\Models\Contrato;
use App\Models\Empleado;
use Illuminate\Http\Request;

class ContratoController extends Controller
{
    public function index(Request $request)
    {
        $query = Contrato::with(['empleado.departamento', 'empleado.puesto'])
            ->orderByDesc('fecha_inicio');

        if ($request->filled('empleado_id')) $query->where('empleado_id', $request->empleado_id);
        if ($request->filled('activo'))      $query->where('activo', (bool) $request->activo);

        return response()->json($query->paginate($request->per_page ?? 20));
    }

    public function show($id)
    {
        return response()->json(Contrato::with('empleado.puesto')->findOrFail($id));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'empleado_id'      => 'required|exists:empleados,id',
            'numero_contrato'  => 'required|string|max:30|unique:contratos',
            'fecha_inicio'     => 'required|date',
            'fecha_fin'        => 'nullable|date|after:fecha_inicio',
            'salario'          => 'required|numeric|min:0',
            'activo'           => 'boolean',
            'observaciones'    => 'nullable|string',
        ]);

        $data['activo'] = $data['activo'] ?? true;

        // Deactivate previous contracts of same employee
        if ($data['activo']) {
            Contrato::where('empleado_id', $data['empleado_id'])->update(['activo' => false]);
        }

        $contrato = Contrato::create($data);

        // Update employee salary based on the active contract
        if ($contrato->activo) {
            Empleado::find($data['empleado_id'])->update([/* salary field lives in contratos */]);
        }

        return response()->json($contrato->load('empleado'), 201);
    }

    public function update(Request $request, $id)
    {
        $contrato = Contrato::findOrFail($id);
        $data = $request->validate([
            'numero_contrato' => 'sometimes|string|max:30|unique:contratos,numero_contrato,' . $id,
            'fecha_inicio'    => 'sometimes|date',
            'fecha_fin'       => 'nullable|date',
            'salario'         => 'sometimes|numeric|min:0',
            'activo'          => 'sometimes|boolean',
            'observaciones'   => 'nullable|string',
        ]);

        // If setting active, deactivate all others
        if (!empty($data['activo']) && $data['activo']) {
            Contrato::where('empleado_id', $contrato->empleado_id)
                ->where('id', '!=', $id)
                ->update(['activo' => false]);
        }

        $contrato->update($data);
        return response()->json($contrato->fresh()->load('empleado'));
    }

    public function destroy($id)
    {
        Contrato::findOrFail($id)->delete();
        return response()->json(['message' => 'Contrato eliminado.']);
    }
}
