<?php

namespace App\Http\Controllers\Api\Rrhh;

use App\Http\Controllers\Controller;
use App\Models\Empleado;
use App\Models\Departamento;
use App\Models\Puesto;
use App\Models\HistorialLaboral;
use Illuminate\Http\Request;

class EmpleadoController extends Controller
{
    public function index(Request $request)
    {
        $query = Empleado::with(['departamento', 'puesto', 'contratoActivo'])
            ->orderBy('apellido_paterno');

        if ($request->filled('buscar')) {
            $b = '%' . $request->buscar . '%';
            $query->where(fn($q) => $q
                ->where('nombre', 'like', $b)
                ->orWhere('apellido_paterno', 'like', $b)
                ->orWhere('numero_empleado', 'like', $b)
                ->orWhere('rfc', 'like', $b)
            );
        }
        if ($request->filled('departamento_id')) $query->where('departamento_id', $request->departamento_id);
        if ($request->filled('estatus'))          $query->where('estatus', $request->estatus);

        return response()->json($query->paginate($request->per_page ?? 20));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'departamento_id'  => 'required|exists:departamentos,id',
            'puesto_id'        => 'required|exists:puestos,id',
            'numero_empleado'  => 'required|string|max:15|unique:empleados',
            'nombre'           => 'required|string|max:80',
            'apellido_paterno' => 'required|string|max:60',
            'apellido_materno' => 'nullable|string|max:60',
            'rfc'              => 'nullable|string|size:13|unique:empleados',
            'curp'             => 'nullable|string|size:18|unique:empleados',
            'correo'           => 'nullable|email|unique:empleados',
            'telefono'         => 'nullable|string|max:15',
            'fecha_ingreso'    => 'required|date',
            'tipo_contrato'    => 'required|in:base,confianza,honorarios,temporal',
            'estatus'          => 'in:activo,baja,licencia,jubilado',
            'salario_base'     => 'nullable|numeric|min:0',
        ]);

        $empleado = Empleado::create($data);

        // Auto-register ingreso movement
        HistorialLaboral::create([
            'empleado_id'      => $empleado->id,
            'puesto_id'        => $empleado->puesto_id,
            'departamento_id'  => $empleado->departamento_id,
            'tipo_movimiento'  => 'ingreso',
            'fecha_movimiento' => $empleado->fecha_ingreso,
            'salario_nuevo'    => $data['salario_base'] ?? null,
            'motivo'           => 'Alta inicial del empleado.',
        ]);

        return response()->json($empleado->load(['departamento', 'puesto']), 201);
    }

    public function show($id)
    {
        return response()->json(
            Empleado::with(['departamento', 'puesto', 'contratos', 'historial.puesto', 'historial.departamento'])
                ->findOrFail($id)
        );
    }

    public function update(Request $request, $id)
    {
        $empleado = Empleado::findOrFail($id);

        $data = $request->validate([
            'departamento_id'  => 'sometimes|exists:departamentos,id',
            'puesto_id'        => 'sometimes|exists:puestos,id',
            'numero_empleado'  => 'sometimes|string|max:15|unique:empleados,numero_empleado,' . $id,
            'nombre'           => 'sometimes|string|max:80',
            'apellido_paterno' => 'sometimes|string|max:60',
            'apellido_materno' => 'nullable|string|max:60',
            'rfc'              => 'nullable|string|size:13|unique:empleados,rfc,' . $id,
            'curp'             => 'nullable|string|size:18|unique:empleados,curp,' . $id,
            'correo'           => 'nullable|email|unique:empleados,correo,' . $id,
            'telefono'         => 'nullable|string|max:15',
            'fecha_ingreso'    => 'sometimes|date',
            'fecha_baja'       => 'nullable|date',
            'tipo_contrato'    => 'sometimes|in:base,confianza,honorarios,temporal',
            'estatus'          => 'sometimes|in:activo,baja,licencia,jubilado',
        ]);

        $empleado->update($data);
        return response()->json($empleado->fresh()->load(['departamento', 'puesto']));
    }

    public function destroy($id)
    {
        Empleado::findOrFail($id)->delete();
        return response()->json(['message' => 'Empleado eliminado.']);
    }

    // ── Aux endpoints ─────────────────────────────────────────────────────────

    public function departamentos()
    {
        return response()->json(Departamento::where('activo', true)->orderBy('nombre')->get());
    }

    public function puestos(Request $request)
    {
        $query = Puesto::with('departamento')->where('activo', true);
        if ($request->filled('departamento_id')) $query->where('departamento_id', $request->departamento_id);
        return response()->json($query->orderBy('nombre')->get());
    }
}
