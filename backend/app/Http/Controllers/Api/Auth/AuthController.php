<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Models\SesionActiva;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Credenciales incorrectas.',
                'error'   => 'INVALID_CREDENTIALS',
            ], 401);
        }

        if (!$user->activo) {
            return response()->json([
                'message' => 'Tu cuenta ha sido desactivada. Contacta al administrador.',
                'error'   => 'ACCOUNT_DISABLED',
            ], 403);
        }

        // Revocar tokens anteriores (una sesión activa a la vez)
        $user->tokens()->delete();
        SesionActiva::where('user_id', $user->id)->delete();

        $token = $user->createToken('sise-token')->plainTextToken;
        $tokenId = $user->tokens()->latest()->first()->id;

        // Registrar sesión activa
        SesionActiva::create([
            'user_id'          => $user->id,
            'token_id'         => $tokenId,
            'ip'               => $request->ip(),
            'user_agent'       => $request->userAgent(),
            'ultima_actividad' => now(),
        ]);

        $user->update(['ultimo_acceso' => now()]);

        return response()->json([
            'token' => $token,
            'user'  => [
                'id'      => $user->id,
                'name'    => $user->name,
                'email'   => $user->email,
                'roles'   => $user->getRoleNames(),
                'permisos'=> $user->getAllPermissions()->pluck('name'),
                'must_change_password' => $user->must_change_password,
            ],
            'message' => 'Sesión iniciada correctamente.',
        ]);
    }

    public function me(Request $request)
    {
        $user = $request->user()->load([]);

        return response()->json([
            'id'      => $user->id,
            'name'    => $user->name,
            'email'   => $user->email,
            'activo'  => $user->activo,
            'roles'   => $user->getRoleNames(),
            'permisos'=> $user->getAllPermissions()->pluck('name'),
            'ultimo_acceso' => $user->ultimo_acceso,
        ]);
    }

    public function logout(Request $request)
    {
        $token = $request->user()->currentAccessToken();

        SesionActiva::where('user_id', $request->user()->id)
            ->where('token_id', $token->id)
            ->delete();

        $token->delete();

        return response()->json(['message' => 'Sesión cerrada correctamente.']);
    }

    public function changePassword(Request $request)
    {
        $request->validate([
            'password_actual' => 'required|string',
            'password_nuevo'  => ['required', 'confirmed', Password::min(8)->mixedCase()->numbers()],
        ]);

        $user = $request->user();

        if (!Hash::check($request->password_actual, $user->password)) {
            return response()->json(['message' => 'La contraseña actual es incorrecta.'], 422);
        }

        $user->update([
            'password' => Hash::make($request->password_nuevo),
            'must_change_password' => false
        ]);

        return response()->json(['message' => 'Contraseña actualizada correctamente.']);
    }

    // ── Administración (Solo Admin) ──────────────────────────

    public function adminResetPassword(Request $request, $id)
    {
        $user = User::findOrFail($id);
        
        // Si es alumno, la contraseña vuelve a ser su matrícula
        // Si es docente o administrativo, se genera una nueva aleatoria
        $newPassword = $user->alumno 
            ? $user->alumno->matricula 
            : Str::random(10);

        $user->update([
            'password' => Hash::make($newPassword),
            'must_change_password' => true
        ]);

        return response()->json([
            'message' => 'Contraseña reseteada correctamente.',
            'new_password' => $newPassword
        ]);
    }

    public function adminToggleActive($id)
    {
        $user = User::findOrFail($id);
        $user->update(['activo' => !$user->activo]);

        return response()->json([
            'message' => 'Estatus de usuario actualizado.',
            'activo'  => $user->activo
        ]);
    }

    public function usersActivity()
    {
        $actividades = \App\Models\SesionActiva::with('user')
            ->orderBy('ultima_actividad', 'desc')
            ->limit(50)
            ->get();

        return response()->json($actividades);
    }
}
