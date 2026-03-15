<?php

namespace App\Http\Controllers\Api\Finanzas;

use App\Http\Controllers\Controller;
use App\Models\LineaCaptura;
use App\Models\CatalogoServicio;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class LineaCapturaController extends Controller
{
    public function index(Request $request)
    {
        $query = LineaCaptura::with(['alumno', 'servicio'])
            ->orderByDesc('created_at');

        if ($request->filled('buscar')) {
            $b = '%' . $request->buscar . '%';
            $query->where(fn($q) => $q->where('referencia', 'like', $b));
        }
        if ($request->filled('alumno_id')) $query->where('alumno_id', $request->alumno_id);
        if ($request->filled('estatus'))   $query->where('estatus', $request->estatus);

        return response()->json($query->paginate($request->per_page ?? 20));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'alumno_id'           => 'required|exists:alumnos,id',
            'catalogo_servicio_id'=> 'required|exists:catalogo_servicios,id',
            'fecha_vencimiento'   => 'required|date|after:today',
            'monto'               => 'nullable|numeric|min:0',
        ]);

        $servicio = CatalogoServicio::findOrFail($data['catalogo_servicio_id']);

        $linea = LineaCaptura::create([
            'alumno_id'            => $data['alumno_id'],
            'catalogo_servicio_id' => $data['catalogo_servicio_id'],
            'referencia'           => strtoupper('UNICH-' . date('Ymd') . '-' . Str::random(6)),
            'monto'                => $data['monto'] ?? $servicio->costo,
            'fecha_vencimiento'    => $data['fecha_vencimiento'],
            'estatus'              => 'pendiente',
            'generado_por'         => $request->user()?->id,
        ]);

        return response()->json($linea->load(['alumno', 'servicio']), 201);
    }

    public function show($id)
    {
        return response()->json(LineaCaptura::with(['alumno', 'servicio', 'pago.recibo'])->findOrFail($id));
    }

    public function updateEstatus(Request $request, $id)
    {
        $linea = LineaCaptura::findOrFail($id);
        $data  = $request->validate(['estatus' => 'required|in:pendiente,pagado,vencido,cancelado']);
        $linea->update($data);
        return response()->json($linea->fresh());
    }
}
