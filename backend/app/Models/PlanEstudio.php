<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PlanEstudio extends Model
{
    use HasFactory;

    protected $table = 'planes_estudio';

    protected $fillable = ['licenciatura_id', 'clave', 'anio_inicio', 'vigente', 'observaciones'];

    protected $casts = ['vigente' => 'boolean'];

    public function licenciatura()
    {
        return $this->belongsTo(Licenciatura::class);
    }

    public function materias()
    {
        return $this->belongsToMany(Materia::class, 'plan_materia', 'plan_estudio_id', 'materia_id')
            ->withPivot('semestre');
    }
}
