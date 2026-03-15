<?php

namespace App\Http\Controllers\Api\Finanzas;

use App\Http\Controllers\Controller;
use App\Models\Pago;
use App\Models\LineaCaptura;
use App\Models\Recibo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PagoController extends Controller
{
    public function index(Request $request)
    {
        $query = Pago::with(['alumno', 'lineaCaptura.servicio', 'recibo'])
            ->orderByDesc('fecha_pago');

        if ($request->filled('alumno_id'))   $query->where('alumno_id', $request->alumno_id);
        if ($request->filled('fecha_inicio') && $request->filled('fecha_fin')) {
            $query->whereBetween('fecha_pago', [$request->fecha_inicio, $request->fecha_fin]);
        }
        if ($request->filled('metodo_pago')) $query->where('metodo_pago', $request->metodo_pago);

        return response()->json($query->paginate($request->per_page ?? 20));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'linea_captura_id'   => 'required|exists:lineas_captura,id',
            'monto_pagado'       => 'required|numeric|min:0.01',
            'fecha_pago'         => 'required|date',
            'metodo_pago'        => 'required|in:Ventanilla,Transferencia,Tarjeta,Efectivo,Cheque',
            'banco'              => 'nullable|string|max:80',
            'numero_operacion'   => 'nullable|string|max:50',
        ]);

        $linea = LineaCaptura::with('servicio')->findOrFail($data['linea_captura_id']);

        if ($linea->estatus !== 'pendiente') {
            return response()->json(['message' => 'Esta línea de captura ya fue pagada o está cancelada.'], 422);
        }

        return DB::transaction(function () use ($data, $linea, $request) {
            // 1. Register payment
            $pago = Pago::create([
                ...$data,
                'alumno_id'     => $linea->alumno_id,
                'registrado_por'=> $request->user()?->id,
            ]);

            // 2. Update linea status
            $linea->update(['estatus' => 'pagado']);

            // 3. Auto-generate recibo
            $folio = 'REC-' . date('Y') . '-' . str_pad($pago->id, 6, '0', STR_PAD_LEFT);
            Recibo::create([
                'pago_id'      => $pago->id,
                'folio'        => $folio,
                'monto'        => $pago->monto_pagado,
                'fecha_emision'=> now(),
                'emitido_por'  => $request->user()?->id,
            ]);

            return response()->json($pago->load(['alumno', 'lineaCaptura.servicio', 'recibo']), 201);
        });
    }

    public function show($id)
    {
        return response()->json(Pago::with(['alumno', 'lineaCaptura.servicio', 'recibo'])->findOrFail($id));
    }

    // ── Webhook bancario ──────────────────────────────────────────────────────
    public function webhookBanco(Request $request)
    {
        $data = $request->validate([
            'referencia'  => 'required|string',
            'monto'       => 'required|numeric',
            'fecha_pago'  => 'required|string',
            'estatus'     => 'required|string',
        ]);

        $linea = LineaCaptura::where('referencia', $data['referencia'])->first();
        if (!$linea) return response()->json(['error' => 'Referencia no encontrada.'], 404);
        if ($linea->estatus === 'pagado') return response()->json(['message' => 'Ya pagada.']);

        $montoOk = abs((float) $data['monto'] - $linea->monto) < 1.0; // 1 peso tolerance
        if (!$montoOk) return response()->json(['error' => 'Monto no coincide.'], 422);

        return DB::transaction(function () use ($linea, $data) {
            $pago = Pago::create([
                'linea_captura_id' => $linea->id,
                'alumno_id'        => $linea->alumno_id,
                'monto_pagado'     => $data['monto'],
                'fecha_pago'       => date('Y-m-d', strtotime($data['fecha_pago'])),
                'metodo_pago'      => 'Transferencia',
                'numero_operacion' => $data['referencia'],
            ]);
            $linea->update(['estatus' => 'pagado']);
            $folio = 'REC-' . date('Y') . '-' . str_pad($pago->id, 6, '0', STR_PAD_LEFT);
            $recibo = Recibo::create([
                'pago_id'      => $pago->id,
                'folio'        => $folio,
                'monto'        => $pago->monto_pagado,
                'fecha_emision'=> now(),
            ]);
            return response()->json(['status' => 'ok', 'folio' => $folio]);
        });
    }
}
