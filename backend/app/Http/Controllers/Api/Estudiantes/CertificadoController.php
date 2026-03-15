<?php

namespace App\Http\Controllers\Api\Estudiantes;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\DocumentoAcademico;
use App\Models\Alumno;
use Illuminate\Support\Str;

class CertificadoController extends Controller
{
    /**
     * Lista de certificados generados
     */
    public function index(Request $request)
    {
        $query = DocumentoAcademico::with(['alumno', 'generador'])
            ->whereIn('tipo', ['certificado', 'carta_pasante', 'constancia_estudios'])
            ->orderBy('id', 'desc');

        if ($request->filled('alumno_id')) {
            $query->where('alumno_id', $request->alumno_id);
        }

        return response()->json($query->get());
    }

    /**
     * Generar un nuevo certificado o documento
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'alumno_id' => 'required|exists:alumnos,id',
            'tipo' => 'required|in:constancia_estudios,certificado,carta_pasante,duplicado_certificado',
        ]);

        $alumno = Alumno::findOrFail($validated['alumno_id']);

        // Check if there is already an active identical document (optional business logic)
        // Here we just allow it since duplicates invalidate old ones implicitly if needed, or we just keep history.

        $folioStr = strtoupper(substr($validated['tipo'], 0, 3)) . '-' . date('Y') . '-' . Str::random(6);

        $documento = DocumentoAcademico::create([
            'alumno_id' => $alumno->id,
            'tipo' => $validated['tipo'] == 'duplicado_certificado' ? 'certificado' : $validated['tipo'],
            'folio' => $folioStr,
            'archivo' => null, // En un sistema real aquí guardaríamos el path del PDF generado o XML
            'generado_por' => auth()->id(),
            'fecha_generacion' => now(),
            'vigente' => true,
        ]);

        return response()->json($documento->load(['alumno', 'generador']), 201);
    }

    public function show($id)
    {
        $doc = DocumentoAcademico::with(['alumno.licenciatura', 'generador'])->findOrFail($id);
        return response()->json($doc);
    }

    /**
     * Cancelar o invalidar documento
     */
    public function destroy($id)
    {
        $doc = DocumentoAcademico::findOrFail($id);
        $doc->update(['vigente' => false]);
        return response()->json(['message' => 'Documento invalidado exitosamente']);
    }
}
