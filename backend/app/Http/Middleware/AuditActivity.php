<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\ActividadUsuario;
use Symfony\Component\HttpFoundation\Response;

class AuditActivity
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if ($request->user()) {
            ActividadUsuario::create([
                'user_id'   => $request->user()->id,
                'accion'    => $request->method(),
                'modulo'    => $this->resolveModule($request->path()),
                'url'       => $request->fullUrl(),
                'ip'        => $request->ip(),
                'user_agent'=> $request->userAgent(),
                'payload'   => $this->sanitizePayload($request->except(['password', 'password_confirmation'])),
                'status_code' => $response->getStatusCode(),
            ]);
        }

        return $response;
    }

    private function resolveModule(string $path): string
    {
        $segments = explode('/', $path);
        return $segments[2] ?? 'general'; // api/v1/{modulo}/...
    }

    private function sanitizePayload(array $data): ?string
    {
        return !empty($data) ? json_encode($data) : null;
    }
}
