<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\SesionActiva;
use Symfony\Component\HttpFoundation\Response;

class CheckActiveSession
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user()) {
            $token = $request->user()->currentAccessToken();

            $sesion = SesionActiva::where('user_id', $request->user()->id)
                ->where('token_id', $token->id)
                ->first();

            if (!$sesion) {
                $request->user()->currentAccessToken()->delete();
                return response()->json([
                    'message' => 'Sesión inválida o expirada.',
                    'error'   => 'SESSION_INVALID',
                ], 401);
            }

            // Actualizar última actividad
            $sesion->update(['ultima_actividad' => now()]);
        }

        return $next($request);
    }
}
