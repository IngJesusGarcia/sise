<?php

namespace App\Http\Controllers\Api\Correspondencia;

use App\Http\Controllers\Controller;
use App\Models\Documento;
use App\Models\AprobacionDocumento;
use App\Models\Notificacion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DocumentoController extends Controller
{
    private function with(): array
    {
        return ['tipo', 'creadoPor', 'aprobaciones.usuario', 'archivos'];
    }

    private function getUserArea($user): string
    {
        if ($user->hasRole('admin')) return 'Administración / Sistemas';
        if ($user->hasRole('servicios_escolares')) return 'Servicios Escolares';
        if ($user->hasRole('rrhh')) return 'Recursos Humanos';
        if ($user->hasRole('finanzas')) return 'Recursos Financieros';
        if ($user->hasRole('juridico')) return 'Área Jurídica';
        if ($user->hasRole('vinculacion')) return 'Vinculación y Extensión';
        if ($user->hasRole('inventario')) return 'Recursos Materiales';
        if ($user->hasRole('correspondencia')) return 'Oficialía de Partes';
        
        return 'General';
    }

    public function index(Request $request)
    {
        $q = Documento::with(['tipo', 'creadoPor'])
            ->orderByDesc('created_at');

        if ($request->filled('buscar')) {
            $b = '%' . $request->buscar . '%';
            $q->where(fn($x) => $x->where('folio', 'like', $b)
                ->orWhere('asunto', 'like', $b)
                ->orWhere('area_origen', 'like', $b)
                ->orWhere('area_destino', 'like', $b));
        }
        if ($request->filled('estatus'))          $q->where('estatus', $request->estatus);
        if ($request->filled('tipo_documento_id'))$q->where('tipo_documento_id', $request->tipo_documento_id);
        if ($request->filled('area_origen'))      $q->where('area_origen', $request->area_origen);
        if ($request->filled('fecha_desde'))      $q->whereDate('fecha', '>=', $request->fecha_desde);
        if ($request->filled('fecha_hasta'))      $q->whereDate('fecha', '<=', $request->fecha_hasta);

        // Bandeja de entrada = destinados al área del usuario
        if ($request->boolean('entrada')) {
            $userArea = $this->getUserArea($request->user());
            if ($request->user()->hasRole('admin')) {
                 // Admin can see everything or we leave it empty so they see all entrance? 
                 // Admin usually checks 'Todos' view. If they use Inbox, maybe show 'Administración' 
                 $q->where('area_destino', $userArea);
            } else {
                 $q->where('area_destino', $userArea);
            }
        }
        // Bandeja de salida = creados por el usuario
        if ($request->boolean('salida')) {
            $q->where('creado_por', $request->user()?->id);
        }

        return response()->json($q->paginate($request->per_page ?? 20));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'tipo_documento_id' => 'required|exists:tipos_documento,id',
            'asunto'            => 'required|string|max:255',
            'descripcion'       => 'nullable|string',
            'area_origen'       => 'required|string|max:120',
            'area_destino'      => 'required|string|max:120',
            'responsable'       => 'nullable|string|max:150',
            'fecha'             => 'required|date',
        ]);

        // Auto-generate folio: OFI-2026-000001
        $count = Documento::withTrashed()->count() + 1;
        $data['folio']      = 'OFI-' . date('Y') . '-' . str_pad($count, 6, '0', STR_PAD_LEFT);
        $data['estatus']    = 'registrado';
        $data['creado_por'] = $request->user()->id;

        // File upload
        if ($request->hasFile('archivo')) {
            $data['archivo'] = $request->file('archivo')->store('correspondencia', 'public');
        }

        $doc = Documento::create($data);
        return response()->json($doc->load($this->with()), 201);
    }

    public function show($id)
    {
        return response()->json(Documento::with($this->with())->findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $doc = Documento::findOrFail($id);
        $data = $request->validate([
            'tipo_documento_id' => 'sometimes|exists:tipos_documento,id',
            'asunto'            => 'sometimes|string|max:255',
            'descripcion'       => 'nullable|string',
            'area_origen'       => 'sometimes|string|max:120',
            'area_destino'      => 'sometimes|string|max:120',
            'responsable'       => 'nullable|string|max:150',
            'fecha'             => 'sometimes|date',
            'estatus'           => 'sometimes|in:registrado,en_proceso,aprobado,rechazado,archivado',
        ]);

        if ($request->hasFile('archivo')) {
            if ($doc->archivo) Storage::disk('public')->delete($doc->archivo);
            $data['archivo'] = $request->file('archivo')->store('correspondencia', 'public');
        }

        $doc->update($data);
        return response()->json($doc->fresh()->load($this->with()));
    }

    public function destroy($id)
    {
        $doc = Documento::findOrFail($id);
        if ($doc->archivo) Storage::disk('public')->delete($doc->archivo);
        $doc->delete();
        return response()->json(['message' => 'Documento eliminado.']);
    }

    /** POST /api/correspondencia/documentos/{id}/aprobar */
    public function aprobar(Request $request, $id)
    {
        $data = $request->validate([
            'estatus'     => 'required|in:aprobado,rechazado,en_revision',
            'comentarios' => 'nullable|string',
        ]);

        $doc = Documento::with('creadoPor')->findOrFail($id);

        AprobacionDocumento::create([
            'documento_id' => $doc->id,
            'usuario_id'   => $request->user()->id,
            'estatus'      => $data['estatus'],
            'comentarios'  => $data['comentarios'] ?? null,
            'fecha'        => now(),
        ]);

        // Update doc status
        $mapEstatus = ['aprobado' => 'aprobado', 'rechazado' => 'rechazado', 'en_revision' => 'en_proceso'];
        $doc->update(['estatus' => $mapEstatus[$data['estatus']]]);

        // Notify creator
        if ($doc->creado_por) {
            Notificacion::create([
                'user_id' => $doc->creado_por,
                'titulo'  => $data['estatus'] === 'aprobado' ? '✅ Oficio Aprobado' : '❌ Oficio ' . ucfirst($data['estatus']),
                'mensaje' => "El oficio {$doc->folio} — {$doc->asunto} fue {$data['estatus']}." .
                             ($data['comentarios'] ? " Comentario: {$data['comentarios']}" : ''),
                'url'     => "/correspondencia/documentos/{$doc->id}",
            ]);
        }

        return response()->json($doc->fresh()->load($this->with()));
    }

    public function departamentos()
    {
        // Regresa estrictamente las áreas con las que trabaja el sistema (las que mapeamos a roles)
        $areas = [
            ['id' => 'Administración / Sistemas', 'nombre' => 'Administración / Sistemas'],
            ['id' => 'Servicios Escolares', 'nombre' => 'Servicios Escolares'],
            ['id' => 'Recursos Humanos', 'nombre' => 'Recursos Humanos'],
            ['id' => 'Recursos Financieros', 'nombre' => 'Recursos Financieros'],
            ['id' => 'Área Jurídica', 'nombre' => 'Área Jurídica'],
            ['id' => 'Vinculación y Extensión', 'nombre' => 'Vinculación y Extensión'],
            ['id' => 'Recursos Materiales', 'nombre' => 'Recursos Materiales'],
            ['id' => 'Oficialía de Partes', 'nombre' => 'Oficialía de Partes'],
        ];
        return response()->json($areas);
    }
}
