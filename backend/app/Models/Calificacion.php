<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Calificacion extends Model
{
    use HasFactory;

    protected $fillable = [
        'inscripcion_id', 'alumno_id', 'materia_id', 'grupo_id',
        'periodo_id', 'docente_id', 'calificacion_parcial1',
        'calificacion_parcial2', 'calificacion_parcial3',
        'calificacion_final', 'calificacion_extraordinario',
        'estatus', 'capturado_por', 'fecha_captura',
    ];

    protected $casts = [
        'calificacion_parcial1'       => 'float',
        'calificacion_parcial2'       => 'float',
        'calificacion_parcial3'       => 'float',
        'calificacion_final'          => 'float',
        'calificacion_extraordinario' => 'float',
        'fecha_captura'               => 'datetime',
    ];

    public function alumno()      { return $this->belongsTo(Alumno::class); }
    public function materia()     { return $this->belongsTo(Materia::class); }
    public function grupo()       { return $this->belongsTo(Grupo::class); }
    public function periodo()     { return $this->belongsTo(Periodo::class); }
    public function docente()     { return $this->belongsTo(Docente::class); }
    public function inscripcion() { return $this->belongsTo(Inscripcion::class); }

    // Calcular promedio automático
    public function calcularFinal(): float
    {
        $parciales = array_filter([
            $this->calificacion_parcial1,
            $this->calificacion_parcial2,
            $this->calificacion_parcial3,
        ]);
        if (empty($parciales)) return 0;
        return round(array_sum($parciales) / count($parciales), 2);
    }

    public function scopeAprobadas($q)   { return $q->where('estatus', 'aprobado'); }
    public function scopeReprobadas($q)  { return $q->where('estatus', 'reprobado'); }
    public function scopePorAlumno($q, $id) { return $q->where('alumno_id', $id); }
}
