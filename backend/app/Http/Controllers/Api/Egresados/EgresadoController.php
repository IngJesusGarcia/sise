<?php

namespace App\Http\Controllers\Api\Egresados;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Egresado;
use App\Models\Alumno;
use App\Models\Periodo;

class EgresadoController extends Controller
{
    public function index(Request $request)
    {
        $query = Egresado::with(['alumno.licenciatura', 'periodo'])
            ->orderBy('fecha_egreso', 'desc');

        if ($request->filled('licenciatura_id')) {
            $query->whereHas('alumno', fn($q) => $q->where('licenciatura_id', $request->licenciatura_id));
        }
        if ($request->filled('periodo_id')) {
            $query->where('periodo_id', $request->periodo_id);
        }
        if ($request->filled('estatus_titulacion')) {
            $query->where('estatus_titulacion', $request->estatus_titulacion);
        }
        if ($request->filled('buscar')) {
            $query->whereHas('alumno', fn($q) => $q->where('nombre', 'like', '%'.$request->buscar.'%')
                ->orWhere('apellido_paterno', 'like', '%'.$request->buscar.'%')
                ->orWhere('matricula', 'like', '%'.$request->buscar.'%')
            );
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'alumno_id'         => 'required|exists:alumnos,id|unique:egresados,alumno_id',
            'periodo_id'        => 'required|exists:periodos,id',
            'fecha_egreso'      => 'required|date',
            'promedio_egreso'   => 'nullable|numeric|min:0|max:10',
            'creditos_totales'  => 'nullable|integer|min:0',
            'estatus_titulacion'=> 'in:sin_iniciar,en_proceso,titulado',
        ]);

        $egresado = Egresado::create($data);

        // Actualizar estatus del alumno a egresado
        Alumno::where('id', $data['alumno_id'])->update(['estatus' => 'egresado']);

        return response()->json($egresado->load(['alumno.licenciatura', 'periodo']), 201);
    }

    public function show($id)
    {
        return response()->json(
            Egresado::with(['alumno.licenciatura', 'periodo', 'actaExamen.modalidad', 'titulado'])->findOrFail($id)
        );
    }

    public function update(Request $request, $id)
    {
        $egresado = Egresado::findOrFail($id);

        $data = $request->validate([
            'estatus_titulacion' => 'sometimes|in:sin_iniciar,en_proceso,titulado',
            'promedio_egreso'    => 'nullable|numeric',
            'creditos_totales'   => 'nullable|integer',
        ]);

        $egresado->update($data);

        return response()->json($egresado->load(['alumno', 'periodo']));
    }

    public function destroy($id)
    {
        $egresado = Egresado::findOrFail($id);
        $egresado->delete();
        return response()->json(['message' => 'Registro de egresado eliminado.']);
    }
}
