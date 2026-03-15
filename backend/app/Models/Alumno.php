<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class Alumno extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id', 'aspirante_id', 'licenciatura_id', 'plan_estudio_id',
        'matricula', 'nombre', 'apellido_paterno', 'apellido_materno',
        'fecha_nacimiento', 'sexo', 'curp', 'rfc', 'correo',
        'telefono', 'celular', 'foto', 'semestre_actual', 'turno',
        'estatus', 'ciclo_ingreso', 'promedio_general', 'servicio_social_activo',
    ];

    protected $casts = [
        'fecha_nacimiento' => 'date',
        'servicio_social_activo' => 'boolean',
    ];

    // ── Relaciones ──────────────────────────────────────────
    public function user()              { return $this->belongsTo(User::class); }
    public function aspirante()         { return $this->belongsTo(Aspirante::class); }
    public function licenciatura()      { return $this->belongsTo(Licenciatura::class); }
    public function planEstudio()       { return $this->belongsTo(PlanEstudio::class); }
    public function datosPersonales()   { return $this->hasOne(DatosPersonales::class); }
    public function datosFamiliares()   { return $this->hasMany(DatosFamiliar::class); }
    public function inscripciones()     { return $this->hasMany(Inscripcion::class); }
    public function calificaciones()    { return $this->hasMany(Calificacion::class); }
    public function asistencias()       { return $this->hasMany(Asistencia::class); }
    public function historialAcademico(){ return $this->hasMany(HistorialAcademico::class); }
    public function documentos()        { return $this->hasMany(DocumentoAcademico::class); }
    public function egresado()          { return $this->hasOne(Egresado::class); }
    public function pagos()             { return $this->hasMany(Pago::class); }
    public function servicioSocial()    { return $this->hasOne(ServicioSocialRegistro::class, 'estudiante_id'); }
    public function documentosServicio(){ return $this->hasMany(ServicioSocialDocumento::class, 'estudiante_id'); }

    // ── Scopes ──────────────────────────────────────────────
    public function scopeActivos($query)        { return $query->where('estatus', 'activo'); }
    public function scopePorLicenciatura($query, $id) { return $query->where('licenciatura_id', $id); }
    public function scopeBuscar($query, $term) {
        return $query->where(function ($q) use ($term) {
            $q->where('matricula', 'like', "%{$term}%")
              ->orWhere('nombre', 'like', "%{$term}%")
              ->orWhere('apellido_paterno', 'like', "%{$term}%")
              ->orWhere('apellido_materno', 'like', "%{$term}%")
              ->orWhere('curp', 'like', "%{$term}%")
              ->orWhere('correo', 'like', "%{$term}%");
        });
    }

    // ── Accessors ───────────────────────────────────────────
    public function getNombreCompletoAttribute(): string
    {
        return "{$this->nombre} {$this->apellido_paterno} {$this->apellido_materno}";
    }
}
