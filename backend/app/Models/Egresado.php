<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Egresado extends Model
{
    use HasFactory;

    protected $table = 'egresados';

    protected $fillable = [
        'alumno_id', 'periodo_id', 'fecha_egreso',
        'promedio_egreso', 'creditos_totales', 'estatus_titulacion'
    ];

    protected $casts = [
        'fecha_egreso' => 'date',
        'promedio_egreso' => 'decimal:2',
    ];

    public function alumno() { return $this->belongsTo(Alumno::class); }
    public function periodo() { return $this->belongsTo(Periodo::class); }
    public function actaExamen() { return $this->hasOne(ActaExamen::class, 'alumno_id', 'alumno_id'); }
    public function titulado() { return $this->hasOne(Titulado::class, 'alumno_id', 'alumno_id'); }
}
