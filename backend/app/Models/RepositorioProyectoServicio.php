<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RepositorioProyectoServicio extends Model
{
    protected $table = 'repositorio_proyectos_servicio';

    protected $fillable = [
        'titulo',
        'descripcion',
        'archivo_pdf',
        'fecha_subida',
        'activo',
    ];

    protected $casts = [
        'fecha_subida' => 'datetime',
        'activo' => 'boolean',
    ];
}
