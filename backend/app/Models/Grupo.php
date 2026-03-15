<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Grupo extends Model
{
    use HasFactory;

    protected $fillable = [
        'licenciatura_id', 'plan_estudio_id', 'periodo_id', 'docente_id', 
        'materia_id', 'clave_grupo', 'semestre', 'capacidad', 'inscritos', 
        'aula', 'activo'
    ];
}
