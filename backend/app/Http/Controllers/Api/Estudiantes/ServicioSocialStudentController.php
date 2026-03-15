<?php

namespace App\Http\Controllers\Api\Estudiantes;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ServicioSocialRegistro;
use App\Models\ServicioSocialDocumento;
use App\Models\FormatoServicioSocial;
use App\Models\ReglamentoServicioSocial;
use App\Models\RepositorioProyectoServicio;
use App\Models\Alumno;

class ServicioSocialStudentController extends Controller
{
    private function getAlumno(Request $request)
    {
        // En un entorno 100% integrado asume que JWT User es el Estudiante.
        return Alumno::where('correo', $request->user()->email)->firstOrFail();
    }

    public function checkElegibilidad(Request $request)
    {
        $alumno = $this->getAlumno($request);
        return response()->json([
            'elegible' => (bool)$alumno->servicio_social_activo,
            'registro' => $alumno->servicioSocial
        ]);
    }

    public function getAvance(Request $request)
    {
        $alumno = $this->getAlumno($request);
        
        if (!$alumno->servicio_social_activo) abort(403, 'Servicio Social no habilitado');

        $registro = ServicioSocialRegistro::firstOrCreate(
            ['estudiante_id' => $alumno->id],
            [
                'estatus' => 'registrado',
                'horas_acumuladas' => 0,
                'horas_requeridas' => 480, // Lógica base
                'institucion' => 'Pendiente',
                'proyecto' => 'Pendiente'
            ]
        );

        return response()->json([
            'registro' => $registro,
            'documentos' => ServicioSocialDocumento::where('estudiante_id', $alumno->id)->orderBy('created_at', 'desc')->get()
        ]);
    }

    public function postDocumento(Request $request)
    {
        $alumno = $this->getAlumno($request);
        if (!$alumno->servicio_social_activo) abort(403);

        $request->validate([
            'tipo_documento' => 'required|in:Carta de aceptación,Plan de trabajo,Reporte mensual,Informe final,Carta de liberación',
            'archivo' => 'required|file|mimes:pdf|max:10240'
        ]);

        $path = $request->file('archivo')->store('vinculacion/documentos/'.$alumno->matricula, 'public');

        $doc = ServicioSocialDocumento::create([
            'estudiante_id' => $alumno->id,
            'tipo_documento' => $request->tipo_documento,
            'archivo' => $path,
            'estatus' => 'pendiente'
        ]);

        return response()->json($doc, 201);
    }

    public function getDescargasActivas()
    {
        return response()->json([
            'formatos' => FormatoServicioSocial::where('activo', true)->select('id', 'nombre', 'descripcion', 'archivo_pdf', 'fecha_subida')->get(),
            'reglamento' => ReglamentoServicioSocial::where('activo', true)->first(),
            'repositorio' => RepositorioProyectoServicio::where('activo', true)->select('id', 'titulo', 'descripcion', 'archivo_pdf', 'fecha_subida')->get(),
        ]);
    }
}
