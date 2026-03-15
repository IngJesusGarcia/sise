<?php

namespace App\Http\Controllers\Api\Rrhh;

use App\Http\Controllers\Controller;
use App\Models\Nomina;
use App\Models\NominaEmpleado;
use App\Models\Empleado;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class NominaController extends Controller
{
    public function index(Request $request)
    {
        $query = Nomina::withCount('detalles as total_empleados')
            ->orderByDesc('fecha_inicio');

        if ($request->filled('tipo'))    $query->where('tipo', $request->tipo);
        if ($request->filled('estatus')) $query->where('estatus', $request->estatus);

        return response()->json($query->paginate($request->per_page ?? 15));
    }

    public function show($id)
    {
        $nomina = Nomina::with(['detalles.empleado.puesto', 'detalles.empleado.departamento'])
            ->findOrFail($id);
        return response()->json($nomina);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'periodo'          => 'required|string|max:30',
            'tipo'             => 'required|in:quincenal,mensual,semanal',
            'fecha_inicio'     => 'required|date',
            'fecha_fin'        => 'required|date|after:fecha_inicio',
            'fecha_pago'       => 'required|date',
        ]);

        $data['generado_por'] = $request->user()?->id;
        $data['estatus']      = 'borrador';

        $nomina = DB::transaction(function () use ($data) {
            $nomina = Nomina::create($data);

            // Auto-generate lines for all active employees
            $empleados = Empleado::where('estatus', 'activo')
                ->with('contratoActivo')
                ->get();

            $totalPercepciones = 0;
            $totalDeducciones  = 0;
            $totalNeto         = 0;

            foreach ($empleados as $empleado) {
                $salario       = (float) ($empleado->contratoActivo->salario ?? 0);
                $percepciones  = $salario;
                $deducciones   = round($salario * 0.1175, 2); // IMSS simplified
                $neto          = round($percepciones - $deducciones, 2);

                NominaEmpleado::create([
                    'nomina_id'   => $nomina->id,
                    'empleado_id' => $empleado->id,
                    'salario_base'=> $salario,
                    'percepciones'=> $percepciones,
                    'deducciones' => $deducciones,
                    'neto'        => $neto,
                    'detalle'     => [
                        'sueldo_base'   => $salario,
                        'imss'          => $deducciones,
                    ],
                ]);

                $totalPercepciones += $percepciones;
                $totalDeducciones  += $deducciones;
                $totalNeto         += $neto;
            }

            $nomina->update([
                'total_percepciones' => round($totalPercepciones, 2),
                'total_deducciones'  => round($totalDeducciones, 2),
                'total_neto'         => round($totalNeto, 2),
            ]);

            return $nomina;
        });

        return response()->json($nomina->load('detalles'), 201);
    }

    public function update(Request $request, $id)
    {
        $nomina = Nomina::findOrFail($id);
        $data   = $request->validate([
            'estatus' => 'required|in:borrador,aprobada,pagada',
        ]);
        $nomina->update($data);
        return response()->json($nomina->fresh());
    }

    /** Update a single nomina_empleado line */
    public function updateLinea(Request $request, $nominaId, $lineaId)
    {
        $linea = NominaEmpleado::where('nomina_id', $nominaId)->findOrFail($lineaId);
        $data  = $request->validate([
            'percepciones' => 'sometimes|numeric|min:0',
            'deducciones'  => 'sometimes|numeric|min:0',
            'detalle'      => 'sometimes|array',
        ]);
        if (isset($data['percepciones']) || isset($data['deducciones'])) {
            $perc = $data['percepciones'] ?? $linea->percepciones;
            $ded  = $data['deducciones']  ?? $linea->deducciones;
            $data['neto'] = round($perc - $ded, 2);
        }
        $linea->update($data);

        // Recalculate nomina totals
        $nomina = Nomina::find($nominaId);
        $nomina->update([
            'total_percepciones' => $nomina->detalles()->sum('percepciones'),
            'total_deducciones'  => $nomina->detalles()->sum('deducciones'),
            'total_neto'         => $nomina->detalles()->sum('neto'),
        ]);

        return response()->json($linea->fresh()->load('empleado'));
    }
}
