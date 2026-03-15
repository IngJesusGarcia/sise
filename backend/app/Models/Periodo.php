<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Periodo extends Model
{
    use HasFactory;

    protected $table = 'periodos';

    protected $fillable = [
        'nombre', 'tipo', 'fecha_inicio', 'fecha_fin',
        'fecha_inicio_inscripciones', 'fecha_fin_inscripciones', 'activo'
    ];

    protected $casts = [
        'fecha_inicio'               => 'date',
        'fecha_fin'                  => 'date',
        'fecha_inicio_inscripciones' => 'date',
        'fecha_fin_inscripciones'    => 'date',
        'activo'                     => 'boolean',
    ];
}
