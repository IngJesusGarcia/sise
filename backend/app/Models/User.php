<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

    protected $fillable = [
        'name',
        'email',
        'password',
        'rol',
        'activo',
        'must_change_password',
        'ultimo_acceso',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at'    => 'datetime',
        'password'             => 'hashed',
        'activo'               => 'boolean',
        'must_change_password' => 'boolean',
        'ultimo_acceso'        => 'datetime',
    ];

    // ── Relaciones ──────────────────────────────────────────
    public function actividadUsuarios()
    {
        return $this->hasMany(ActividadUsuario::class);
    }

    public function sesionesActivas()
    {
        return $this->hasMany(SesionActiva::class);
    }

    public function solicitudesPrestamo()
    {
        return $this->hasMany(SolicitudPrestamo::class, 'usuario_id');
    }

    public function alumno() { return $this->hasOne(Alumno::class); }
    public function docente() { return $this->hasOne(Docente::class); }

    // ── Scopes ──────────────────────────────────────────────
    public function scopeActivos($query)
    {
        return $query->where('activo', true);
    }
}
