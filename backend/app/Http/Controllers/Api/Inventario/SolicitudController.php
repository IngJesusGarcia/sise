<?php

namespace App\Http\Controllers\Api\Inventario;

use App\Http\Controllers\Controller;
use App\Models\SolicitudMaterial;
use App\Models\SolicitudMaterialDetalle;
use App\Models\Existencia;
use App\Models\MovimientoInventario;
use App\Models\Notificacion;
use App\Models\Material;
use App\Models\Almacen;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SolicitudController extends Controller
{
    public function index(Request $request)
    {
        $query = SolicitudMaterial::with(['solicitante', 'almacen', 'detalles.material'])
            ->orderByDesc('created_at');

        // Si ?mis=1, filtrar solo las del usuario autenticado
        if ($request->boolean('mis')) {
            $query->where('solicitante_id', $request->user()->id);
        }

        if ($request->filled('estatus')) $query->where('estatus', $request->estatus);
        if ($request->filled('almacen_id')) $query->where('almacen_id', $request->almacen_id);

        return response()->json($query->paginate($request->per_page ?? 20));
    }

    public function show($id)
    {
        return response()->json(
            SolicitudMaterial::with(['solicitante', 'almacen', 'aprobador', 'detalles.material'])->findOrFail($id)
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'almacen_id'    => 'required|exists:almacenes,id',
            'motivo'        => 'nullable|string|max:300',
            'detalles'      => 'required|array|min:1',
            'detalles.*.material_id'        => 'required|exists:materiales,id',
            'detalles.*.cantidad_solicitada'=> 'required|integer|min:1',
        ]);

        return DB::transaction(function () use ($data, $request) {
            $folio = 'SOL-' . date('Ymd') . '-' . str_pad(SolicitudMaterial::count() + 1, 4, '0', STR_PAD_LEFT);

            $solicitud = SolicitudMaterial::create([
                'solicitante_id' => $request->user()->id,
                'almacen_id'     => $data['almacen_id'],
                'folio'          => $folio,
                'estatus'        => 'pendiente',
                'motivo'         => $data['motivo'] ?? null,
            ]);

            foreach ($data['detalles'] as $detalle) {
                SolicitudMaterialDetalle::create([
                    'solicitud_id'        => $solicitud->id,
                    'material_id'         => $detalle['material_id'],
                    'cantidad_solicitada' => $detalle['cantidad_solicitada'],
                ]);
            }

            return response()->json($solicitud->load(['solicitante', 'almacen', 'detalles.material']), 201);
        });
    }

    /** PATCH /api/inventario/solicitudes/{id}/aprobar */
    public function aprobar(Request $request, $id)
    {
        $solicitud = SolicitudMaterial::with(['detalles.material', 'solicitante'])->findOrFail($id);

        if ($solicitud->estatus !== 'pendiente') {
            return response()->json(['message' => 'La solicitud ya fue procesada.'], 422);
        }

        return DB::transaction(function () use ($solicitud, $request) {
            // ── 1. Descuento de stock y movimientos ──────────────────────────
            $insuficientes = [];

            foreach ($solicitud->detalles as $detalle) {
                $existencia = Existencia::where('almacen_id', $solicitud->almacen_id)
                    ->where('material_id', $detalle->material_id)
                    ->lockForUpdate()
                    ->first();

                $stockActual = $existencia?->cantidad ?? 0;

                if ($stockActual < $detalle->cantidad_solicitada) {
                    $insuficientes[] = $detalle->material->nombre . " (stock: {$stockActual})";
                    continue;                         // partial approval — skip this item
                }

                // Descontar stock
                $nuevoStock = $stockActual - $detalle->cantidad_solicitada;

                if ($existencia) {
                    $existencia->update(['cantidad' => $nuevoStock]);
                }

                // Registrar movimiento de salida
                MovimientoInventario::create([
                    'material_id'       => $detalle->material_id,
                    'almacen_id'        => $solicitud->almacen_id,
                    'tipo'              => 'salida',
                    'cantidad'          => $detalle->cantidad_solicitada,
                    'cantidad_anterior' => $stockActual,
                    'cantidad_nueva'    => $nuevoStock,
                    'motivo'            => "Solicitud aprobada: {$solicitud->folio}",
                    'referencia'        => $solicitud->folio,
                    'registrado_por'    => $request->user()->id,
                ]);

                // Update delivered qty
                $detalle->update(['cantidad_entregada' => $detalle->cantidad_solicitada]);
            }

            // ── 2. Update solicitud status ────────────────────────────────────
            $nuevoEstatus = empty($insuficientes) ? 'aprobada' : 'aprobada'; // always approve; log shortages in notification
            $solicitud->update([
                'estatus'          => $nuevoEstatus,
                'aprobado_por'     => $request->user()->id,
                'fecha_aprobacion' => now(),
            ]);

            // ── 3. Notificación al solicitante ─────────────────────────────────
            $msg = "Tu solicitud {$solicitud->folio} fue aprobada.";
            if (!empty($insuficientes)) {
                $msg .= " Sin stock suficiente para: " . implode(', ', $insuficientes) . '.';
            }

            Notificacion::create([
                'user_id' => $solicitud->solicitante_id,
                'titulo'  => '✅ Solicitud Aprobada',
                'mensaje' => $msg,
                'url'     => "/inventario/solicitudes/{$solicitud->id}",
            ]);

            return response()->json([
                'solicitud'     => $solicitud->fresh()->load(['detalles.material', 'aprobador']),
                'insuficientes' => $insuficientes,
            ]);
        });
    }

    /** PATCH /api/inventario/solicitudes/{id}/rechazar */
    public function rechazar(Request $request, $id)
    {
        $solicitud = SolicitudMaterial::with('solicitante')->findOrFail($id);
        if ($solicitud->estatus !== 'pendiente') {
            return response()->json(['message' => 'La solicitud ya fue procesada.'], 422);
        }

        $solicitud->update([
            'estatus'      => 'rechazada',
            'aprobado_por' => $request->user()->id,
            'fecha_aprobacion' => now(),
        ]);

        Notificacion::create([
            'user_id' => $solicitud->solicitante_id,
            'titulo'  => '❌ Solicitud Rechazada',
            'mensaje' => "Tu solicitud {$solicitud->folio} fue rechazada.",
            'url'     => "/inventario/solicitudes/{$solicitud->id}",
        ]);

        return response()->json($solicitud->fresh());
    }
}
