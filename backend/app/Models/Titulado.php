<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Titulado extends Model
{
    protected $table = 'titulados';
    protected $fillable = [
        'alumno_id', 'acta_examen_id', 'numero_titulo',
        'fecha_titulo', 'cedula_profesional'
    ];
    protected $casts = ['fecha_titulo' => 'date'];

    public function alumno() { return $this->belongsTo(Alumno::class); }
    public function acta() { return $this->belongsTo(ActaExamen::class, 'acta_examen_id'); }
}
