<?php

namespace App\Http\Controllers\Api\Estudiantes;

use App\Http\Controllers\Controller;
use App\Models\Alumno;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AlumnoController extends Controller
{
    public function index(Request $request)
    {
        $scope = $request->module_scope ?? 'full';
        $user  = $request->user();

        $query = Alumno::with(['licenciatura', 'planEstudio'])
            ->orderBy('apellido_paterno');

        // Aplicar scope por rol
        if ($scope === 'group') {
            // Docente: solo alumnos de sus grupos
            $docenteId = $user->docente?->id;
            if ($docenteId) {
                $grupoIds = \App\Models\Grupo::where('docente_id', $docenteId)->pluck('id');
                $alumnoIds = \App\Models\Inscripcion::whereIn('grupo_id', $grupoIds)
                    ->where('estatus', 'inscrito')
                    ->pluck('alumno_id');
                $query->whereIn('id', $alumnoIds);
            }
        }

        if ($scope === 'read') {
            // Finanzas: solo nombre, matrícula, carrera
            $query->select(['id', 'matricula', 'nombre', 'apellido_paterno',
                'apellido_materno', 'licenciatura_id', 'estatus']);
        }

        // Filtros de búsqueda
        if ($request->filled('buscar')) {
            $query->buscar($request->buscar);
        }
        if ($request->filled('licenciatura_id')) {
            $query->where('licenciatura_id', $request->licenciatura_id);
        }
        if ($request->filled('estatus')) {
            $query->where('estatus', $request->estatus);
        }
        if ($request->filled('semestre')) {
            $query->where('semestre_actual', $request->semestre);
        }

        return response()->json($query->paginate($request->per_page ?? 20));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'licenciatura_id'   => 'required|exists:licenciaturas,id',
            'plan_estudio_id'   => 'required|exists:planes_estudio,id',
            'matricula'         => 'required|string|max:15|unique:alumnos,matricula',
            'nombre'            => 'required|string|max:80',
            'apellido_paterno'  => 'required|string|max:60',
            'apellido_materno'  => 'nullable|string|max:60',
            'fecha_nacimiento'  => 'required|date',
            'sexo'              => 'nullable|in:M,F,Otro',
            'curp'              => 'nullable|string|size:18|unique:alumnos,curp',
            'correo'            => 'nullable|email|unique:alumnos,correo',
            'telefono'          => 'nullable|string|max:15',
            'semestre_actual'   => 'integer|min:1|max:12',
            'turno'             => 'in:Matutino,Vespertino,Mixto',
            'estatus'           => 'in:activo,baja_temporal,baja_definitiva,egresado,titulado',
            'ciclo_ingreso'     => 'nullable|string|max:10',
        ]);

        $alumno = DB::transaction(function () use ($validated) {
            // 1. Crear el usuario
            $user = User::create([
                'name'     => $validated['nombre'] . ' ' . $validated['apellido_paterno'] . ($validated['apellido_materno'] ? ' ' . $validated['apellido_materno'] : ''),
                'email'    => $validated['matricula'] . '@unich.edu.mx',
                'password' => Hash::make($validated['matricula']),
                'rol'      => 'estudiante',
                'must_change_password' => true,
                'activo'   => true,
            ]);

            // Asignar rol de Spatie si existe
            if (class_exists(\Spatie\Permission\Models\Role::class)) {
                $user->assignRole('estudiante');
            }

            // 2. Crear el alumno vinculado al usuario
            $validated['user_id'] = $user->id;
            return Alumno::create($validated);
        });

        return response()->json([
            'alumno' => $alumno->load('licenciatura'),
            'credentials' => [
                'email'    => $alumno->matricula . '@unich.edu.mx',
                'password' => $alumno->matricula
            ]
        ], 201);
    }

    public function show(Request $request, Alumno $alumno)
    {
        $scope = $request->module_scope ?? 'full';

        // Docente: verificar que el alumno esté en uno de sus grupos
        if ($scope === 'group') {
            $user = $request->user();
            $docenteId = $user->docente?->id;
            if ($docenteId) {
                $grupoIds  = \App\Models\Grupo::where('docente_id', $docenteId)->pluck('id');
                $esDeGrupo = \App\Models\Inscripcion::where('alumno_id', $alumno->id)
                    ->whereIn('grupo_id', $grupoIds)
                    ->exists();
                if (!$esDeGrupo) {
                    return response()->json(['message' => 'No tienes acceso a este alumno.'], 403);
                }
            }
        }

        $fields = $scope === 'read'
            ? $alumno->only(['id','matricula','nombre','apellido_paterno','apellido_materno','licenciatura_id','estatus'])
            : $alumno->load(['licenciatura','planEstudio','datosPersonales','datosFamiliares']);

        return response()->json($fields);
    }

    public function update(Request $request, Alumno $alumno)
    {
        $validated = $request->validate([
            'nombre'          => 'sometimes|string|max:80',
            'apellido_paterno'=> 'sometimes|string|max:60',
            'apellido_materno'=> 'nullable|string|max:60',
            'correo'          => 'nullable|email|unique:alumnos,correo,' . $alumno->id,
            'telefono'        => 'nullable|string|max:15',
            'estatus'         => 'sometimes|in:activo,baja_temporal,baja_definitiva,egresado,titulado',
            'semestre_actual' => 'sometimes|integer|min:1|max:12',
        ]);

        $alumno->update($validated);

        return response()->json($alumno->fresh()->load('licenciatura'));
    }

    public function destroy(Alumno $alumno)
    {
        $alumno->delete();
        return response()->json(['message' => 'Alumno eliminado correctamente.']);
    }

    public function kardex(Request $request, Alumno $alumno)
    {
        $scope = $request->module_scope ?? 'full';

        // Estudiante: solo su propio kardex
        if ($scope === 'own' && $request->user()->alumno?->id !== $alumno->id) {
            return response()->json(['message' => 'Solo puedes ver tu propio kardex.'], 403);
        }

        $calificaciones = \App\Models\Calificacion::with(['materia', 'periodo', 'grupo'])
            ->where('alumno_id', $alumno->id)
            ->orderBy('periodo_id')
            ->get()
            ->groupBy('periodo.nombre');

        $promedio = \App\Models\Calificacion::where('alumno_id', $alumno->id)
            ->whereNotNull('calificacion_final')
            ->avg('calificacion_final');

        return response()->json([
            'alumno'         => $alumno->load('licenciatura'),
            'calificaciones' => $calificaciones,
            'promedio_general' => round($promedio, 2),
            'creditos_aprobados' => \App\Models\Calificacion::with('materia')
                ->where('alumno_id', $alumno->id)
                ->where('estatus', 'aprobado')
                ->get()
                ->sum(fn($c) => $c->materia?->creditos ?? 0),
        ]);
    }
}
