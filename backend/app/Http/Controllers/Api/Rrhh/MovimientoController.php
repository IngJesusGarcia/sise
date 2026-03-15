<?php

namespace App\Http\Controllers\Api\Rrhh;

use App\Http\Controllers\Controller;
use App\Models\HistorialLaboral;
use App\Models\Empleado;
use Illuminate\Http\Request;

class MovimientoController extends Controller
{
    public function index(Request $request)
    {
        $query = HistorialLaboral::with(['empleado', 'puesto', 'departamento'])
            ->orderByDesc('fecha_movimiento');

        if ($request->filled('empleado_id'))     $query->where('empleado_id', $request->empleado_id);
        if ($request->filled('tipo_movimiento')) $query->where('tipo_movimiento', $request->tipo_movimiento);

        return response()->json($query->paginate($request->per_page ?? 30));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'empleado_id'      => 'required|exists:empleados,id',
            'tipo_movimiento'  => 'required|in:ingreso,cambio_puesto,cambio_dpto,aumento,baja,reingreso',
            'fecha_movimiento' => 'required|date',
            'puesto_id'        => 'nullable|exists:puestos,id',
            'departamento_id'  => 'nullable|exists:departamentos,id',
            'salario_nuevo'    => 'nullable|numeric|min:0',
            'motivo'           => 'nullable|string|max:255',
        ]);

        $movimiento = HistorialLaboral::create($data);

        // Apply changes to the employee record
        $empleado = Empleado::find($data['empleado_id']);
        $updates = [];

        if ($data['tipo_movimiento'] === 'baja') {
            $updates['estatus'] = 'baja';
            $updates['fecha_baja'] = $data['fecha_movimiento'];
        }
        if ($data['tipo_movimiento'] === 'reingreso') {
            $updates['estatus'] = 'activo';
            $updates['fecha_baja'] = null;
        }
        if (!empty($data['puesto_id'])) $updates['puesto_id'] = $data['puesto_id'];
        if (!empty($data['departamento_id'])) $updates['departamento_id'] = $data['departamento_id'];

        if (!empty($updates)) $empleado->update($updates);

        return response()->json($movimiento->load(['empleado', 'puesto', 'departamento']), 201);
    }
}
