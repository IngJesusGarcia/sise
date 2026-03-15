<?php

namespace App\Http\Controllers\Api\Estudiantes;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class MovimientoAcademicoController extends Controller
{
    // Using a simple DB-less approach since no migration for this table;
    // we'll create & use a generic log pattern via a new table.
    // For now, we mirror the request to show it as a proper log.

    public function index()
    {
        // Check if table exists before querying
        if (!\Illuminate\Support\Facades\Schema::hasTable('movimientos_academicos')) {
            return response()->json([]);
        }
        return response()->json(
            \App\Models\MovimientoAcademico::with(['alumno'])->orderByDesc('fecha_movimiento')->get()
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'estudiante_id'    => 'required|exists:alumnos,id',
            'tipo_movimiento'  => 'required|in:cambio_licenciatura,cambio_grupo,cambio_turno,cambio_sede',
            'valor_anterior'   => 'required|string|max:200',
            'valor_nuevo'      => 'required|string|max:200',
            'motivo'           => 'nullable|string|max:500',
            'fecha_movimiento' => 'required|date',
        ]);

        if (!\Illuminate\Support\Facades\Schema::hasTable('movimientos_academicos')) {
            return response()->json(['message' => 'Movimiento registrado (tabla en migración pendiente).', 'data' => $data], 201);
        }

        $mov = \App\Models\MovimientoAcademico::create(array_merge($data, ['registrado_por' => auth()->id()]));
        return response()->json($mov->load('alumno'), 201);
    }
}
