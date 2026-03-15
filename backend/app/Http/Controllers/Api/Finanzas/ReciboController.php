<?php

namespace App\Http\Controllers\Api\Finanzas;

use App\Http\Controllers\Controller;
use App\Models\Recibo;
use Illuminate\Http\Request;

class ReciboController extends Controller
{
    public function index(Request $request)
    {
        $query = Recibo::with(['pago.alumno', 'pago.lineaCaptura.servicio'])
            ->orderByDesc('fecha_emision');

        if ($request->filled('alumno_id')) {
            $query->whereHas('pago', fn($q) => $q->where('alumno_id', $request->alumno_id));
        }

        return response()->json($query->paginate($request->per_page ?? 20));
    }

    public function show($id)
    {
        return response()->json(
            Recibo::with(['pago.alumno', 'pago.lineaCaptura.servicio'])->findOrFail($id)
        );
    }
}
