<?php

namespace App\Http\Controllers\Api\Egresados;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Egresado;
use App\Models\ActaExamen;
use App\Models\ModalidadTitulacion;
use App\Models\Titulado;
use Illuminate\Support\Str;

class TitulacionController extends Controller
{
    /**
     * Lista de actas de examen
     */
    public function index()
    {
        return response()->json(
            ActaExamen::with(['alumno.licenciatura', 'modalidad'])->orderByDesc('fecha_examen')->get()
        );
    }

    /**
     * Catalogo de modalidades
     */
    public function modalidades()
    {
        return response()->json(ModalidadTitulacion::where('activa', true)->get());
    }

    /**
     * Iniciar proceso de titulación (crear acta)
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'alumno_id'              => 'required|exists:alumnos,id',
            'modalidad_titulacion_id'=> 'required|exists:modalidades_titulacion,id',
            'fecha_examen'           => 'required|date',
            'resultado'              => 'required|in:aprobado,reprobado,Mención Honorífica',
            'titulo_trabajo'         => 'nullable|string|max:300',
            'sinodal1'               => 'nullable|string|max:150',
            'sinodal2'               => 'nullable|string|max:150',
            'sinodal3'               => 'nullable|string|max:150',
            'presidente'             => 'nullable|string|max:150',
            'secretario'             => 'nullable|string|max:150',
        ]);

        $data['numero_acta'] = 'ACTA-' . date('Y') . '-' . strtoupper(Str::random(6));
        $data['registrado_por'] = auth()->id();

        $acta = ActaExamen::create($data);

        // Si aprobó, actualizar estatus_titulacion del egresado
        if ($data['resultado'] === 'aprobado' || $data['resultado'] === 'Mención Honorífica') {
            Egresado::where('alumno_id', $data['alumno_id'])->update(['estatus_titulacion' => 'titulado']);
        }

        return response()->json($acta->load(['alumno', 'modalidad']), 201);
    }

    public function show($id)
    {
        return response()->json(
            ActaExamen::with(['alumno.licenciatura', 'modalidad'])->findOrFail($id)
        );
    }

    /**
     * Registrar la emisión del título
     */
    public function registrarTitulo(Request $request, $actaId)
    {
        $acta = ActaExamen::findOrFail($actaId);

        $data = $request->validate([
            'numero_titulo'      => 'required|string|max:30',
            'fecha_titulo'       => 'required|date',
            'cedula_profesional' => 'nullable|string|max:20',
        ]);

        $titulado = Titulado::updateOrCreate(
            ['alumno_id' => $acta->alumno_id],
            array_merge($data, ['acta_examen_id' => $acta->id])
        );

        // Actualizar estatus del alumno
        \App\Models\Alumno::where('id', $acta->alumno_id)->update(['estatus' => 'titulado']);

        return response()->json($titulado->load(['alumno', 'acta']), 200);
    }

    public function seguimiento($alumnoId)
    {
        $egresado = Egresado::with(['alumno', 'periodo', 'actaExamen.modalidad', 'titulado'])
            ->where('alumno_id', $alumnoId)
            ->firstOrFail();

        return response()->json($egresado);
    }
}
