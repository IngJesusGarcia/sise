<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ActaExamen extends Model
{
    protected $table = 'actas_examen';

    protected $fillable = [
        'alumno_id', 'modalidad_titulacion_id', 'numero_acta',
        'fecha_examen', 'resultado', 'sinodal1', 'sinodal2', 'sinodal3',
        'presidente', 'secretario', 'titulo_trabajo', 'registrado_por'
    ];

    protected $casts = ['fecha_examen' => 'date'];

    public function alumno() { return $this->belongsTo(Alumno::class); }
    public function modalidad() { return $this->belongsTo(ModalidadTitulacion::class, 'modalidad_titulacion_id'); }
}
