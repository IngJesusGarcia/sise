<?php

namespace App\Http\Controllers\Api\Estudiantes;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Aspirante;
use App\Models\Alumno;
use App\Models\PlanEstudio;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class AspiranteController extends Controller
{
    public function index(Request $request)
    {
        $query = Aspirante::with('licenciatura')->orderByDesc('created_at');

        if ($request->filled('estatus'))    $query->where('estatus', $request->estatus);
        if ($request->filled('licenciatura_id')) $query->where('licenciatura_id', $request->licenciatura_id);
        if ($request->filled('buscar')) {
            $q = $request->buscar;
            $query->where(fn($b) =>
                $b->where('nombre', 'like', "%$q%")
                  ->orWhere('apellido_paterno', 'like', "%$q%")
                  ->orWhere('folio', 'like', "%$q%")
                  ->orWhere('curp', 'like', "%$q%")
            );
        }

        return response()->json($query->paginate($request->per_page ?? 20));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nombre'            => 'required|string|max:80',
            'apellido_paterno'  => 'required|string|max:60',
            'apellido_materno'  => 'nullable|string|max:60',
            'fecha_nacimiento'  => 'required|date',
            'sexo'              => 'nullable|in:M,F,Otro',
            'curp'              => 'nullable|string|size:18|unique:aspirantes,curp',
            'correo'            => 'nullable|email|max:120',
            'telefono'          => 'nullable|string|max:15',
            'licenciatura_id'   => 'nullable|exists:licenciaturas,id',
            'ciclo_ingreso'     => 'nullable|string|max:10',
        ]);

        // Auto-generate folio
        $data['folio'] = 'ASP-' . date('Y') . '-' . strtoupper(Str::random(5));
        $data['estatus'] = 'registrado';

        return response()->json(Aspirante::create($data)->load('licenciatura'), 201);
    }

    public function show($id)
    {
        return response()->json(Aspirante::with('licenciatura')->findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $aspirante = Aspirante::findOrFail($id);

        $data = $request->validate([
            'nombre'          => 'sometimes|string|max:80',
            'apellido_paterno'=> 'sometimes|string|max:60',
            'apellido_materno'=> 'nullable|string|max:60',
            'correo'          => 'nullable|email|max:120',
            'telefono'        => 'nullable|string|max:15',
            'licenciatura_id' => 'nullable|exists:licenciaturas,id',
            'estatus'         => 'sometimes|in:registrado,admitido,rechazado,convertido',
            'ciclo_ingreso'   => 'nullable|string|max:10',
        ]);

        $aspirante->update($data);
        return response()->json($aspirante->fresh()->load('licenciatura'));
    }

    public function destroy($id)
    {
        Aspirante::findOrFail($id)->delete();
        return response()->json(['message' => 'Aspirante eliminado.']);
    }

    /**
     * Convertir aspirante admitido en alumno registrado
     */
    public function convertirAlumno(Request $request, $id)
    {
        $aspirante = Aspirante::findOrFail($id);

        if ($aspirante->estatus !== 'admitido') {
            return response()->json(['message' => 'Solo se pueden convertir aspirantes con estatus "admitido".'], 422);
        }

        $data = $request->validate([
            'matricula'       => 'required|string|max:15|unique:alumnos,matricula',
            'plan_estudio_id' => 'required|exists:planes_estudio,id',
            'semestre_actual' => 'integer|min:1|max:12',
            'turno'           => 'in:Matutino,Vespertino,Mixto',
        ]);

        DB::beginTransaction();
        try {
            $alumno = Alumno::create([
                'aspirante_id'    => $aspirante->id,
                'licenciatura_id' => $aspirante->licenciatura_id,
                'plan_estudio_id' => $data['plan_estudio_id'],
                'matricula'       => $data['matricula'],
                'nombre'          => $aspirante->nombre,
                'apellido_paterno'=> $aspirante->apellido_paterno,
                'apellido_materno'=> $aspirante->apellido_materno,
                'fecha_nacimiento'=> $aspirante->fecha_nacimiento,
                'sexo'            => $aspirante->sexo,
                'curp'            => $aspirante->curp,
                'correo'          => $aspirante->correo,
                'telefono'        => $aspirante->telefono,
                'ciclo_ingreso'   => $aspirante->ciclo_ingreso ?? date('Y'),
                'semestre_actual' => $data['semestre_actual'] ?? 1,
                'turno'           => $data['turno'] ?? 'Matutino',
                'estatus'         => 'activo',
            ]);

            $aspirante->update(['estatus' => 'convertido']);

            DB::commit();
            return response()->json(['alumno' => $alumno->load('licenciatura'), 'aspirante' => $aspirante], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Error al convertir: ' . $e->getMessage()], 500);
        }
    }
}
