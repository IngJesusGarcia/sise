<?php

namespace App\Http\Controllers\Api\Estudiantes;

use App\Http\Controllers\Controller;
use App\Models\Docente;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DocenteController extends Controller
{
    public function index()
    {
        return response()->json(Docente::with('user')->orderBy('nombre')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre'           => 'required|string|max:80',
            'apellido_paterno' => 'required|string|max:60',
            'apellido_materno' => 'nullable|string|max:60',
            'correo'           => 'required|email|unique:docentes,correo|unique:users,email',
            'grado_academico'  => 'nullable|string|max:50',
            'tipo_contrato'    => 'nullable|string|max:50',
            'rfc'              => 'nullable|string|max:13|unique:docentes,rfc',
            'curp'             => 'nullable|string|max:18|unique:docentes,curp',
            'telefono'         => 'nullable|string|max:15',
        ]);

        $randomPassword = Str::random(10);

        $docente = DB::transaction(function () use ($validated, $randomPassword) {
            // 1. Crear el usuario
            $user = User::create([
                'name'     => $validated['nombre'] . ' ' . $validated['apellido_paterno'] . ($validated['apellido_materno'] ? ' ' . $validated['apellido_materno'] : ''),
                'email'    => $validated['correo'],
                'password' => Hash::make($randomPassword),
                'rol'      => 'docente',
                'must_change_password' => true,
                'activo'   => true,
            ]);

            // Asignar rol de Spatie si existe
            if (class_exists(\Spatie\Permission\Models\Role::class)) {
                $user->assignRole('docente');
            }

            // 2. Crear el docente vinculado al usuario
            $validated['user_id'] = $user->id;
            return Docente::create($validated);
        });

        return response()->json([
            'docente' => $docente,
            'credentials' => [
                'email'    => $docente->correo,
                'password' => $randomPassword
            ]
        ], 201);
    }

    public function show(Docente $docente)
    {
        return response()->json($docente->load('user'));
    }

    public function update(Request $request, Docente $docente)
    {
        $validated = $request->validate([
            'nombre'           => 'sometimes|string|max:80',
            'apellido_paterno' => 'sometimes|string|max:60',
            'apellido_materno' => 'nullable|string|max:60',
            'correo'           => 'sometimes|email|unique:docentes,correo,' . $docente->id,
            'activo'           => 'boolean',
        ]);

        $docente->update($validated);

        // Update user if email changed
        if (isset($validated['correo']) && $docente->user) {
            $docente->user->update(['email' => $validated['correo']]);
        }

        return response()->json($docente->fresh());
    }

    public function destroy(Docente $docente)
    {
        if ($docente->user) {
            $docente->user->delete();
        }
        $docente->delete();
        return response()->json(['message' => 'Docente y su cuenta de usuario eliminados.']);
    }
}
