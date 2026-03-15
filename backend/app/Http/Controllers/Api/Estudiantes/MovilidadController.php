<?php

namespace App\Http\Controllers\Api\Estudiantes;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class MovilidadController extends Controller
{
    public function index()
    {
        if (!\Illuminate\Support\Facades\Schema::hasTable('movilidad_estudiantil')) {
            return response()->json([]);
        }
        return response()->json(
            \App\Models\MovilidadEstudiantil::with(['alumno.licenciatura'])->orderByDesc('created_at')->get()
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'estudiante_id'         => 'nullable|exists:alumnos,id',
            'universidad_origen'    => 'required|string|max:200',
            'programa_origen'       => 'required|string|max:200',
            'periodo_movilidad'     => 'required|string|max:30',
            'materias_equivalentes' => 'nullable|string',
            'estatus'               => 'in:activo,completado,cancelado',
            // Datos del visitante (no un alumno local)
            'nombre_visitante'      => 'nullable|string|max:150',
        ]);

        if (!\Illuminate\Support\Facades\Schema::hasTable('movilidad_estudiantil')) {
            return response()->json(['message' => 'Registro de movilidad procesado (tabla en migración pendiente).', 'data' => $data], 201);
        }

        $mov = \App\Models\MovilidadEstudiantil::create(array_merge($data, ['registrado_por' => auth()->id()]));
        return response()->json($mov->load('alumno'), 201);
    }
}
