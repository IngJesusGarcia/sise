<?php

namespace App\Http\Controllers\Api\Prestamos;

use App\Http\Controllers\Controller;
use App\Models\SolicitudPrestamo;
use App\Models\EquipoPrestamo;
use App\Models\DevolucionPrestamo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class SolicitudPrestamoController extends Controller
{
    public function index(Request $request)
    {
        $query = SolicitudPrestamo::with(['usuario', 'equipo']);

        // Si no es admin o encargado, solo ve los suyos
        if (!Auth::user()->hasAnyRole(['admin', 'prestamos'])) {
            $query->where('usuario_id', Auth::id());
        }

        if ($request->has('estatus')) {
            $query->where('estatus', $request->estatus);
        }

        return response()->json($query->orderBy('created_at', 'desc')->paginate(15));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'equipo_id' => 'required|exists:equipos_prestamo,id',
            'fecha_prestamo' => 'required|date|after_or_equal:today',
            'fecha_devolucion' => 'required|date|after:fecha_prestamo',
            'motivo' => 'required|string',
        ]);

        $equipo = EquipoPrestamo::find($validated['equipo_id']);

        if ($equipo->estado !== 'disponible') {
            return response()->json(['message' => 'El equipo no está disponible en este momento'], 422);
        }

        $solicitud = SolicitudPrestamo::create([
            'usuario_id' => Auth::id(),
            'equipo_id' => $validated['equipo_id'],
            'fecha_solicitud' => now(),
            'fecha_prestamo' => $validated['fecha_prestamo'],
            'fecha_devolucion' => $validated['fecha_devolucion'],
            'motivo' => $validated['motivo'],
            'estatus' => 'pendiente',
        ]);

        return response()->json($solicitud, 201);
    }

    public function updateEstatus(Request $request, SolicitudPrestamo $solicitud)
    {
        $validated = $request->validate([
            'estatus' => 'required|in:aprobado,rechazado',
        ]);

        return DB::transaction(function () use ($solicitud, $validated) {
            if ($validated['estatus'] === 'aprobado') {
                $equipo = $solicitud->equipo;
                if ($equipo->estado !== 'disponible') {
                    return response()->json(['message' => 'El equipo ya no está disponible'], 422);
                }
                $equipo->update(['estado' => 'prestado']);
            }

            $solicitud->update(['estatus' => $validated['estatus']]);

            return response()->json($solicitud);
        });
    }

    public function activos()
    {
        $activos = SolicitudPrestamo::with(['usuario', 'equipo'])
            ->where('estatus', 'aprobado')
            ->orderBy('fecha_devolucion', 'asc')
            ->get();

        return response()->json($activos);
    }

    public function devolver(Request $request, SolicitudPrestamo $solicitud)
    {
        $validated = $request->validate([
            'estado_equipo' => 'required|string',
            'observaciones' => 'nullable|string',
        ]);

        if ($solicitud->estatus !== 'aprobado') {
            return response()->json(['message' => 'Esta solicitud no está en estado aprobado'], 422);
        }

        return DB::transaction(function () use ($solicitud, $validated) {
            DevolucionPrestamo::create([
                'prestamo_id' => $solicitud->id,
                'fecha_devolucion_real' => now(),
                'estado_equipo' => $validated['estado_equipo'],
                'observaciones' => $validated['observaciones'],
            ]);

            $solicitud->update(['estatus' => 'devuelto']);
            $solicitud->equipo->update(['estado' => 'disponible']);

            return response()->json(['message' => 'Devolución registrada con éxito']);
        });
    }

    public function historial(Request $request)
    {
        $query = SolicitudPrestamo::with(['usuario', 'equipo', 'devolucion']);

        if (!Auth::user()->hasAnyRole(['admin', 'prestamos'])) {
            $query->where('usuario_id', Auth::id());
        }

        if ($request->has('usuario_id')) {
            $query->where('usuario_id', $request->usuario_id);
        }

        if ($request->has('equipo_id')) {
            $query->where('equipo_id', $request->equipo_id);
        }

        if ($request->has('fecha_inicio')) {
            $query->whereDate('fecha_prestamo', '>=', $request->fecha_inicio);
        }

        if ($request->has('fecha_fin')) {
            $query->whereDate('fecha_prestamo', '<=', $request->fecha_fin);
        }

        return response()->json($query->orderBy('created_at', 'desc')->paginate(20));
    }
}
