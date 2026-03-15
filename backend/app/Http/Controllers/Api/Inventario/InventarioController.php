<?php

namespace App\Http\Controllers\Api\Inventario;

use App\Http\Controllers\Controller;
use App\Models\Material;
use App\Models\Existencia;
use App\Models\MovimientoInventario;
use App\Models\Almacen;
use Illuminate\Http\Request;

class InventarioController extends Controller
{
    // ── Materiales ────────────────────────────────────────────────────────────
    public function materiales(Request $request)
    {
        $q = Material::with('existencias.almacen')->withTrashed(false);
        if ($request->filled('buscar')) {
            $b = '%' . $request->buscar . '%';
            $q->where(fn($x) => $x->where('nombre', 'like', $b)->orWhere('codigo', 'like', $b)->orWhere('categoria', 'like', $b));
        }
        if ($request->filled('categoria')) $q->where('categoria', $request->categoria);
        return response()->json($q->paginate($request->per_page ?? 20));
    }

    public function createMaterial(Request $request)
    {
        $data = $request->validate([
            'codigo'          => 'required|string|max:30|unique:materiales',
            'nombre'          => 'required|string|max:150',
            'descripcion'     => 'nullable|string',
            'unidad_medida'   => 'required|string|max:30',
            'categoria'       => 'nullable|string|max:60',
            'marca'           => 'nullable|string|max:60',
            'precio_unitario' => 'required|numeric|min:0',
            'stock_minimo'    => 'required|integer|min:0',
        ]);
        return response()->json(Material::create($data), 201);
    }

    public function updateMaterial(Request $request, $id)
    {
        $m = Material::findOrFail($id);
        $data = $request->validate([
            'codigo'        => 'sometimes|string|max:30|unique:materiales,codigo,' . $id,
            'nombre'        => 'sometimes|string|max:150',
            'descripcion'   => 'nullable|string',
            'unidad_medida' => 'sometimes|string|max:30',
            'categoria'     => 'nullable|string|max:60',
            'marca'         => 'nullable|string|max:60',
            'precio_unitario'=> 'sometimes|numeric|min:0',
            'stock_minimo'  => 'sometimes|integer|min:0',
            'activo'        => 'boolean',
        ]);
        $m->update($data);
        return response()->json($m->fresh()->load('existencias'));
    }

    // ── Existencias / Stock Entry ─────────────────────────────────────────────
    public function ajustarStock(Request $request)
    {
        $data = $request->validate([
            'material_id' => 'required|exists:materiales,id',
            'almacen_id'  => 'required|exists:almacenes,id',
            'tipo'        => 'required|in:entrada,ajuste',
            'cantidad'    => 'required|integer|min:1',
            'motivo'      => 'nullable|string|max:255',
        ]);

        $existencia = Existencia::firstOrCreate(
            ['material_id' => $data['material_id'], 'almacen_id' => $data['almacen_id']],
            ['cantidad' => 0]
        );
        $anterior = $existencia->cantidad;
        $nueva    = max(0, $data['tipo'] === 'entrada' ? $anterior + $data['cantidad'] : $data['cantidad']);
        $existencia->update(['cantidad' => $nueva]);

        MovimientoInventario::create([
            'material_id'    => $data['material_id'],
            'almacen_id'     => $data['almacen_id'],
            'tipo'           => $data['tipo'],
            'cantidad'       => abs($nueva - $anterior),
            'cantidad_anterior' => $anterior,
            'cantidad_nueva'    => $nueva,
            'motivo'         => $data['motivo'],
            'registrado_por' => $request->user()?->id,
        ]);

        return response()->json(['cantidad_anterior' => $anterior, 'cantidad_nueva' => $nueva]);
    }

    // ── Movimientos ───────────────────────────────────────────────────────────
    public function movimientos(Request $request)
    {
        $q = MovimientoInventario::with(['material', 'almacen', 'registrador'])
            ->orderByDesc('created_at');
        if ($request->filled('tipo')) $q->where('tipo', $request->tipo);
        if ($request->filled('almacen_id')) $q->where('almacen_id', $request->almacen_id);
        if ($request->filled('material_id')) $q->where('material_id', $request->material_id);
        return response()->json($q->paginate($request->per_page ?? 20));
    }

    // ── Almacenes helper ─────────────────────────────────────────────────────
    public function almacenes()
    {
        return response()->json(Almacen::where('activo', true)->get());
    }
}
