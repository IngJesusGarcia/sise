<?php

namespace App\Http\Controllers\Api\Vinculacion;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Alumno;
use App\Models\ServicioSocialRegistro;
use App\Models\ServicioSocialDocumento;

class VinculacionEstudianteController extends Controller
{
    // Listar alumnos elegibles o ya activos
    public function index(Request $request)
    {
        // En un caso real: filtro a alumnos inscritos, regulares, con X% créditos
        // Por simplicidad en este MVP, listamos alumnos Activos
        $query = Alumno::with(['licenciatura:id,nombre', 'servicioSocial'])->activos();

        if ($request->has('q')) {
            $query->buscar($request->q);
        }

        return response()->json($query->paginate(20));
    }

    public function habilitarServicio(Request $request, $id)
    {
        $alumno = Alumno::findOrFail($id);
        $alumno->servicio_social_activo = true;
        // Opcional: registrar el primer paso
        if (!$alumno->servicioSocial) {
            ServicioSocialRegistro::create([
                'estudiante_id' => $alumno->id,
                'institucion' => 'Pendiente',
                'proyecto' => 'Pendiente',
                'fecha_inicio' => now(), // o dejar null
                'estatus' => 'registrado'
            ]);
        }
        $alumno->save();
        
        return response()->json($alumno->load('servicioSocial'));
    }
    
    public function inhabilitarServicio($id)
    {
        $alumno = Alumno::findOrFail($id);
        $alumno->servicio_social_activo = false;
        $alumno->save();
        
        return response()->json($alumno);
    }

    public function getExpediente($id)
    {
        $alumno = Alumno::with([
            'licenciatura',
            'servicioSocial',
            'documentosServicio' => function($q) { $q->orderBy('created_at', 'desc'); }
        ])->findOrFail($id);

        return response()->json($alumno);
    }

    public function dictaminarDocumento(Request $request, $id)
    {
        $request->validate(['estatus' => 'required|in:aprobado,rechazado']);
        
        $doc = ServicioSocialDocumento::findOrFail($id);
        $doc->estatus = $request->estatus;
        $doc->save();

        return response()->json($doc);
    }

    public function actualizarAvance(Request $request, $id)
    {
        // $id = servicio_social_registros.id
        $registro = ServicioSocialRegistro::findOrFail($id);
        
        $request->validate([
            'horas_acumuladas' => 'nullable|integer|min:0',
            'estatus' => 'nullable|in:registrado,en proceso,terminado,liberado',
            'institucion' => 'nullable|string',
            'proyecto' => 'nullable|string'
        ]);

        $registro->update($request->only(['horas_acumuladas', 'estatus', 'institucion', 'proyecto']));

        return response()->json($registro);
    }
}
