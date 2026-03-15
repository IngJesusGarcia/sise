<?php

namespace App\Http\Controllers\Api\Inventario;

use App\Http\Controllers\Controller;
use App\Models\Notificacion;
use Illuminate\Http\Request;

class NotificacionController extends Controller
{
    /** GET /api/notificaciones — returns all notifications for the authenticated user */
    public function index(Request $request)
    {
        $notificaciones = Notificacion::where('user_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->limit(50)
            ->get();

        return response()->json([
            'data'       => $notificaciones,
            'no_leidas'  => $notificaciones->where('leida', false)->count(),
        ]);
    }

    /** PATCH /api/notificaciones/{id}/leer — mark one as read */
    public function marcarLeida(Request $request, $id)
    {
        $n = Notificacion::where('user_id', $request->user()->id)->findOrFail($id);
        $n->update(['leida' => true]);
        return response()->json($n);
    }

    /** PATCH /api/notificaciones/leer-todas — mark all as read */
    public function marcarTodasLeidas(Request $request)
    {
        Notificacion::where('user_id', $request->user()->id)
            ->where('leida', false)
            ->update(['leida' => true]);
        return response()->json(['message' => 'Todas marcadas como leídas.']);
    }
}
