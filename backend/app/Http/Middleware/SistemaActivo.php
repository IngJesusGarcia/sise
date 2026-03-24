<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SistemaActivo
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
     public function handle(Request $request, Closure $next)
    {
        $fechaBloqueo = env('FECHA_BLOQUEO');

        if ($fechaBloqueo) {
            $hoy = date('Y-m-d');

            if ($hoy >= $fechaBloqueo) {
                return response()->json([
                    'message' => 'Sistema suspendido.'
                ], 403);
            }
        }

        return $next($request);
    }
}
